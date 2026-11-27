import {
  DEFAULT_PAGE_SIZE,
  SEARCH_DEBOUNCE_MS,
} from "@discordia/client-shared";

import { useCallback, useEffect, useRef, useState } from "react";

import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { type PageFetcher } from "../../hooks/usePagedList";
import {
  type ProfiledUser,
  useProfileFallback,
} from "../../hooks/useProfileFallback";

interface UseLoadMoreListOptions<T> {
  /** Estable (`useCallback`): si cambia, la lista arranca de cero. */
  fetchPage: PageFetcher<T>;
  /** Lo que escribio el usuario; se busca en el back con debounce. */
  search: string;
  /** No pide nada hasta que la lista se muestra. */
  enabled?: boolean;
  pageSize?: number;
}

function appendPage<T extends ProfiledUser>(loaded: T[], page: T[]): T[] {
  const seen = new Set(loaded.map((user) => user.user_id));
  return [...loaded, ...page.filter((user) => !seen.has(user.user_id))];
}

/**
 * Una lista de usuarios buscada en el back que crece de a una pagina con
 * `loadMore`. Una busqueda nueva vuelve a la primera pagina, pero mientras
 * llega se sigue mostrando lo anterior.
 */
export function useLoadMoreList<T extends ProfiledUser>({
  fetchPage,
  search,
  enabled = true,
  pageSize = DEFAULT_PAGE_SIZE,
}: UseLoadMoreListOptions<T>) {
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  const [loaded, setLoaded] = useState<T[] | null>(null);
  const [total, setTotal] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  /** Cambia cada vez que la lista arranca de cero: descarta respuestas viejas. */
  const generation = useRef(0);

  const fetchFrom = useCallback(
    (offset: number) => {
      const current = generation.current;
      fetchPage({ search: debouncedSearch, limit: pageSize, offset }).then(
        (result) => {
          if (offset > 0) setIsLoadingMore(false);
          if (current !== generation.current) return;
          if (!result.ok) {
            setErrorMessage(result.message);
            setLoaded((prev) => prev ?? []);
            return;
          }
          setErrorMessage("");
          setTotal(result.total);
          setLoaded((prev) =>
            offset === 0 || !prev
              ? result.items
              : appendPage(prev, result.items),
          );
        },
      );
    },
    [fetchPage, debouncedSearch, pageSize],
  );

  const reload = useCallback(() => {
    generation.current += 1;
    fetchFrom(0);
  }, [fetchFrom]);

  const [listFetcher, setListFetcher] = useState(() => fetchPage);
  if (listFetcher !== fetchPage) {
    setListFetcher(() => fetchPage);
    setLoaded(null);
  }

  useEffect(() => {
    if (enabled) reload();
  }, [enabled, reload]);

  const loadedCount = loaded?.length ?? 0;
  const hasMore = loaded !== null && loadedCount < total;

  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore) return;
    setIsLoadingMore(true);
    fetchFrom(loadedCount);
  }, [hasMore, isLoadingMore, fetchFrom, loadedCount]);

  // Sacarlo de lo cargado en vez de recargar mantiene lo que ya se mostro, y
  // el offset de la proxima pagina sigue coincidiendo con el del back.
  const remove = useCallback((userId: string) => {
    setLoaded(
      (prev) => prev?.filter((user) => user.user_id !== userId) ?? null,
    );
    setTotal((count) => Math.max(0, count - 1));
  }, []);

  return {
    /** `null` hasta que llega la primera pagina. */
    items: useProfileFallback(loaded),
    total,
    hasMore,
    isLoadingMore,
    isSearching: debouncedSearch.trim() !== "",
    errorMessage,
    loadMore,
    reload,
    remove,
  };
}
