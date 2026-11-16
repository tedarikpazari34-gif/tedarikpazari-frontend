const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const esbuild = require("esbuild");

const root = path.join(__dirname, "..");

const source = fs.readFileSync(
  path.join(root, "src/lib/adminChatFileReviews.ts"),
  "utf8",
);

const compiled = esbuild.transformSync(source, {
  loader: "ts",
  format: "cjs",
  target: "node20",
}).code;

const mod = { exports: {} };
new Function("module", "exports", compiled)(mod, mod.exports);

const {
  parsePendingChatFileReviews,
  adminChatFileReviewLabels,
} = mod.exports;

const valid = {
  id: "review-1",
  messageId: "message-1",
  threadId: "thread-1",
  createdAt: "2026-11-12T20:00:00.000Z",
  fileType: "application/pdf",
  status: "PENDING_REVIEW",
};

test("valid pending list", () => {
  const result = parsePendingChatFileReviews({
    items: [valid],
    nextCursor: null,
  });

  assert.equal(result.items.length, 1);
  assert.equal(result.items[0].status, "PENDING_REVIEW");
});

test("pagination cursor", () => {
  const result = parsePendingChatFileReviews({
    items: [valid],
    nextCursor: "review-1",
  });

  assert.equal(result.nextCursor, "review-1");
});

test("reject invalid cursor", () => {
  assert.throws(() =>
    parsePendingChatFileReviews({
      items: [valid],
      nextCursor: "../secret",
    }),
  );
});

test("reject non-pending items", () => {
  assert.throws(() =>
    parsePendingChatFileReviews({
      items: [{ ...valid, status: "APPROVED" }],
      nextCursor: null,
    }),
  );
});

test("reject malformed response", () => {
  for (const payload of [
    null,
    {},
    [],
    { items: "invalid", nextCursor: null },
    { items: [], nextCursor: undefined },
  ]) {
    assert.throws(() => parsePendingChatFileReviews(payload));
  }
});

test("private metadata is excluded", () => {
  const result = parsePendingChatFileReviews({
    items: [{
      ...valid,
      fileUrl: "chat-private:secret",
      reviewNote: "private admin note",
      senderEmail: "private@example.com",
    }],
    nextCursor: null,
  });

  const serialized = JSON.stringify(result);

  assert.equal(serialized.includes("chat-private"), false);
  assert.equal(serialized.includes("admin note"), false);
  assert.equal(serialized.includes("private@example"), false);
});

test("unsupported MIME is hidden", () => {
  const result = parsePendingChatFileReviews({
    items: [{ ...valid, fileType: "text/html" }],
    nextCursor: null,
  });

  assert.equal(result.items[0].fileType, null);
});

test("seven languages have moderation labels", () => {
  for (const language of [
    "tr", "en", "ka", "ru", "de", "ar", "uz",
  ]) {
    const labels = adminChatFileReviewLabels(language);

    for (const key of [
      "title", "caution", "loading", "error",
      "empty", "refresh", "note", "reject",
      "approval", "confirm", "reason",
      "saved", "failed", "previous", "next",
    ]) {
      assert.ok(labels[key], `${language}: ${key}`);
    }
  }
});

const page = fs.readFileSync(
  path.join(root, "src/pages/AdminChatModerationPage.tsx"),
  "utf8",
);

const component = fs.readFileSync(
  path.join(root, "src/components/AdminChatFileReviews.tsx"),
  "utf8",
);

test("admin panel is integrated", () => {
  assert.match(page, /<AdminChatFileReviews/);
  assert.match(component, /chat\/admin\/files\/pending/);
});

test("rejection uses protected API", () => {
  assert.match(component, /Authorization: `Bearer \$\{token\}`/);
  assert.match(component, /decision: "REJECTED"/);
  assert.match(component, /window\.confirm/);
});

test("approval remains disabled", () => {
  assert.match(component, /<button\s+type="button"\s+disabled\s+title=\{labels\.caution\}/);
  assert.doesNotMatch(component, /decision: "APPROVED"/);
});

test("no unsafe file preview", () => {
  assert.doesNotMatch(component, /window\.open/);
  assert.doesNotMatch(component, /\/preview/);
  assert.doesNotMatch(component, /<iframe/);
});

test("file upload remains disabled", () => {
  const chat = fs.readFileSync(
    path.join(root, "src/pages/ChatPage.tsx"),
    "utf8",
  );

  assert.match(
    chat,
    /const CHAT_FILE_UPLOADS_READY = false;/,
  );
});
