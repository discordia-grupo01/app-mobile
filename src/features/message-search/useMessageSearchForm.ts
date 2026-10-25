import {
  type MessageSearchQuery,
  validateMessageSearch,
} from "@discordia/client-shared";
import { useCallback, useState } from "react";

import { useMessageSearch } from "./useMessageSearch";

/**
 * Lo que se escribe y el autor elegido, mas la busqueda. Vive en la lupa del
 * header (no en el modal) para que al volver se vean los mismos resultados; la
 * lupa se desmonta al cambiar de servidor, asi que empieza de cero.
 */
export function useMessageSearchForm(serverId: string) {
  const search = useMessageSearch(serverId);
  const [draft, setDraftText] = useState("");
  const [authorId, setAuthor] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const run = useCallback(
    (query: MessageSearchQuery) => {
      const error = validateMessageSearch(query);
      setValidationError(error ?? null);
      if (!error) search.search(query);
    },
    [search],
  );

  const submit = useCallback(
    () => run({ text: draft, authorId }),
    [run, draft, authorId],
  );

  const setDraft = useCallback((text: string) => {
    setDraftText(text);
    setValidationError(null);
  }, []);

  /** Cambiar el autor busca al instante si hay algo que buscar. */
  const setAuthorId = useCallback(
    (next: string | null) => {
      setAuthor(next);
      if (draft.trim() || next) {
        run({ text: draft, authorId: next });
      } else {
        setValidationError(null);
        search.reset();
      }
    },
    [draft, run, search],
  );

  return {
    draft,
    setDraft,
    authorId,
    setAuthorId,
    submit,
    validationError,
    search,
  };
}

export type MessageSearchForm = ReturnType<typeof useMessageSearchForm>;
