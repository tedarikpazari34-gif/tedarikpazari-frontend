export function isTrustedChatFileUrl(
  value: unknown,
): value is string {
  if (typeof value !== "string" || value.length > 4096) {
    return false;
  }

  try {
    const url = new URL(value);

    return (
      url.protocol === "https:" &&
      (url.hostname === "api.cloudinary.com" ||
        url.hostname === "res.cloudinary.com") &&
      url.username === "" &&
      url.password === "" &&
      url.port === "" &&
      url.hash === ""
    );
  } catch {
    return false;
  }
}

export function chatFileEndpoint(
  apiBase: string,
  threadId: string,
  messageId: string,
): string {
  return (
    apiBase.replace(/\/+$/, "") +
    "/chat/threads/" +
    encodeURIComponent(threadId) +
    "/files/" +
    encodeURIComponent(messageId)
  );
}
