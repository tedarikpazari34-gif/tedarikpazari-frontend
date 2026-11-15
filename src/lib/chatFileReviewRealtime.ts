/**
 * WebSocket events are refresh hints, never file content.
 * The API remains the only authority for file visibility.
 */
export function shouldRefreshChatFileReview(
  payload: unknown,
  activeThreadId: string | undefined,
): boolean {
  if (
    typeof activeThreadId !== "string" ||
    !/^[A-Za-z0-9_-]{1,128}$/.test(activeThreadId) ||
    !payload ||
    typeof payload !== "object" ||
    Array.isArray(payload)
  ) {
    return false;
  }

  const keys = Object.keys(payload);

  if (keys.length !== 1 || keys[0] !== "threadId") {
    return false;
  }

  return (
    (payload as { threadId?: unknown }).threadId ===
    activeThreadId
  );
}
