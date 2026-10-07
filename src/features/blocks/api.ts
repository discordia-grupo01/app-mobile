import {
  blockErrorFor,
  BLOCKS_PAGE_LIMIT,
  BLOCKS_LOAD_FAILED,
  type BlockedUser,
  type BlockUserResult,
  type ListBlocksResult,
  USER_BLOCK_FAILED,
  USER_UNBLOCK_FAILED,
} from "@discordia/client-shared";

import { apiFetch } from "../../lib/api-client";

export async function listBlocks(): Promise<ListBlocksResult> {
  const result = await apiFetch<{ blocks: BlockedUser[] }>(
    `/v1/blocks?limit=${BLOCKS_PAGE_LIMIT}`,
    { method: "GET" },
  );
  if (!result.ok) return { ok: false, message: BLOCKS_LOAD_FAILED };
  return {
    ok: true,
    blockedUserIds: result.data.blocks.map((block) => block.user_id),
  };
}

export async function blockUser(userId: string): Promise<BlockUserResult> {
  const result = await apiFetch<void>("/v1/blocks", {
    method: "POST",
    body: JSON.stringify({ user_id: userId }),
  });
  return result.ok
    ? { ok: true }
    : { ok: false, message: blockErrorFor(result.code, USER_BLOCK_FAILED) };
}

export async function unblockUser(userId: string): Promise<BlockUserResult> {
  const result = await apiFetch<void>(
    `/v1/blocks/${encodeURIComponent(userId)}`,
    { method: "DELETE" },
  );
  return result.ok
    ? { ok: true }
    : { ok: false, message: blockErrorFor(result.code, USER_UNBLOCK_FAILED) };
}
