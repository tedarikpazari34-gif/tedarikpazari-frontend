const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const esbuild = require("esbuild");

const root = path.join(__dirname, "..");

const source = fs.readFileSync(
  path.join(root, "src/lib/chatFileReviewRealtime.ts"),
  "utf8",
);

const compiled = esbuild.transformSync(source, {
  loader: "ts",
  format: "cjs",
  target: "node20",
}).code;

const mod = { exports: {} };

new Function(
  "module",
  "exports",
  compiled,
)(mod, mod.exports);

const { shouldRefreshChatFileReview } = mod.exports;

test("matching thread event refreshes", () => {
  assert.equal(
    shouldRefreshChatFileReview(
      { threadId: "thread-1" },
      "thread-1",
    ),
    true,
  );
});

test("other thread events are ignored", () => {
  assert.equal(
    shouldRefreshChatFileReview(
      { threadId: "thread-2" },
      "thread-1",
    ),
    false,
  );
});

test("no selected thread never refreshes", () => {
  assert.equal(
    shouldRefreshChatFileReview(
      { threadId: "thread-1" },
      undefined,
    ),
    false,
  );
});

test("malformed events are rejected", () => {
  for (const value of [
    null,
    undefined,
    "thread-1",
    [],
    {},
    { threadId: null },
    { threadId: 42 },
  ]) {
    assert.equal(
      shouldRefreshChatFileReview(value, "thread-1"),
      false,
    );
  }
});

test("events carrying extra file metadata are rejected", () => {
  for (const extra of [
    { fileUrl: "chat-private:secret" },
    { reviewNote: "internal" },
    { senderId: "private-user" },
    { status: "REJECTED" },
  ]) {
    assert.equal(
      shouldRefreshChatFileReview(
        { threadId: "thread-1", ...extra },
        "thread-1",
      ),
      false,
    );
  }
});

test("invalid thread IDs are rejected", () => {
  for (const threadId of [
    "",
    "../private",
    "x".repeat(129),
  ]) {
    assert.equal(
      shouldRefreshChatFileReview(
        { threadId },
        threadId,
      ),
      false,
    );
  }
});

const page = fs.readFileSync(
  path.join(root, "src/pages/ChatPage.tsx"),
  "utf8",
);

const component = fs.readFileSync(
  path.join(root, "src/components/ChatMyFileReviews.tsx"),
  "utf8",
);

test("socket event has a matching cleanup", () => {
  assert.match(
    page,
    /socket\.on\("chatFileReviewChanged", handleFileReviewChanged\)/,
  );
  assert.match(
    page,
    /socket\.off\("chatFileReviewChanged", handleFileReviewChanged\)/,
  );
});

test("socket event uses authorized API refresh", () => {
  assert.match(
    page,
    /shouldRefreshChatFileReview\(event, activeThreadId\)/,
  );
  assert.match(
    page,
    /setFileReviewRefreshKey\(\(value\) => value \+ 1\)/,
  );
  assert.match(
    page,
    /void loadMessages\(activeThreadId\)/,
  );
});

test("reconnect triggers recovery", () => {
  assert.match(page, /if \(hasJoinedBefore\)/);
  assert.match(page, /socket\.on\("connect", joinSelectedThread\)/);
});

test("file status component reacts to refresh signal", () => {
  assert.match(
    page,
    /refreshSignal=\{fileReviewRefreshKey\}/,
  );
  assert.match(
    component,
    /\[apiBase, token, threadId, revision, refreshSignal\]/,
  );
  assert.match(component, /controller\.abort\(\)/);
});

test("upload remains disabled", () => {
  assert.match(
    page,
    /const CHAT_FILE_UPLOADS_READY = false;/,
  );
});
