import {
  clampPage,
  DEFAULT_PAGE_SIZE,
  pageCountOf,
  pageRange,
  paginate,
} from "@discordia/client-shared";

import { useCallback, useMemo, useState } from "react";

/**
 * Estado de paginacion en memoria sobre una lista ya cargada. La logica pura
 * (rangos, ventana de paginas) vive en `@discordia/client-shared`; esto solo
 * la ata al estado de React, igual que en `web-client`.
 *
 * `page` se devuelve ya acotado: si la lista se achica (filtro, baneo
 * revocado) la pagina guardada puede quedar fuera de rango y se corrige sola.
 */
export function usePagination<T>(
  items: readonly T[],
  pageSize: number = DEFAULT_PAGE_SIZE,
) {
  const [requestedPage, setRequestedPage] = useState(1);

  const total = items.length;
  const pageCount = pageCountOf(total, pageSize);
  const page = clampPage(requestedPage, pageCount);

  const pageItems = useMemo(
    () => paginate(items, page, pageSize),
    [items, page, pageSize],
  );

  const setPage = useCallback(
    (next: number) => setRequestedPage(clampPage(next, pageCount)),
    [pageCount],
  );
  const resetPage = useCallback(() => setRequestedPage(1), []);

  return {
    pageItems,
    page,
    pageCount,
    total,
    range: pageRange(page, pageSize, total),
    setPage,
    resetPage,
  };
}
