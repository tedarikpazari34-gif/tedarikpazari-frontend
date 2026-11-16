const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const esbuild = require("esbuild");

const filename = path.join(
  __dirname,
  "../src/lib/chatFileReviewStatus.ts",
);

const compiled = esbuild.transformSync(
  fs.readFileSync(filename, "utf8"),
  {
    loader: "ts",
    format: "cjs",
    target: "node20",
  },
).code;

const moduleInstance = { exports: {} };

new Function(
  "module",
  "exports",
  compiled,
)(moduleInstance, moduleInstance.exports);

const {
  parseSenderFileReviews,
  senderFileReviewLabels,
} = moduleInstance.exports;

const date = "2026-11-12T20:00:00.000Z";

const item = (status, id = "message-1") => ({
  id,
  createdAt: date,
  fileName: "Belge.pdf",
  status,
});

test("three supported statuses", () => {
  const result = parseSenderFileReviews({
    items: [
      item("PENDING_REVIEW", "a"),
      item("APPROVED", "b"),
      item("REJECTED", "c"),
    ],
  });

  assert.equal(result.length, 3);
  assert.deepEqual(
    result.map((x) => x.status),
    ["PENDING_REVIEW", "APPROVED", "REJECTED"],
  );
});

test("unknown status is rejected", () => {
  assert.deepEqual(
    parseSenderFileReviews({
      items: [item("UNKNOWN")],
    }),
    [],
  );
});

test("private filename is not exposed", () => {
  const result = parseSenderFileReviews({
    items: [
      {
        ...item("REJECTED"),
        fileName: "private-client-details.pdf",
        fileUrl: "chat-private:secret",
        reviewNote: "Internal admin note",
      },
    ],
  });

  assert.equal(result[0].fileName, "Dosya");

  const output = JSON.stringify(result);
  assert.equal(output.includes("secret"), false);
  assert.equal(output.includes("Internal"), false);
  assert.equal(output.includes("private-client"), false);
});

test("invalid IDs are rejected", () => {
  assert.deepEqual(
    parseSenderFileReviews({
      items: [
        item("APPROVED", "../secret"),
        item("APPROVED", ""),
      ],
    }),
    [],
  );
});

test("invalid dates are rejected", () => {
  assert.deepEqual(
    parseSenderFileReviews({
      items: [
        { ...item("APPROVED"), createdAt: "not-a-date" },
      ],
    }),
    [],
  );
});

test("maximum 50 records", () => {
  const result = parseSenderFileReviews({
    items: Array.from(
      { length: 80 },
      (_, i) => item("APPROVED", `message-${i}`),
    ),
  });

  assert.equal(result.length, 50);
});

test("invalid API payloads fail closed", () => {
  for (const value of [
    null,
    undefined,
    {},
    { items: "unsafe" },
    { items: null },
  ]) {
    assert.deepEqual(parseSenderFileReviews(value), []);
  }
});

test("all seven languages have review labels", () => {
  for (const lang of [
    "tr", "en", "ka", "ru", "de", "ar", "uz",
  ]) {
    const labels = senderFileReviewLabels(lang);

    for (const key of [
      "title",
      "pending",
      "approved",
      "rejected",
      "refresh",
      "loading",
      "error",
    ]) {
      assert.ok(labels[key], `${lang}: ${key}`);
    }
  }
});

test("unknown language safely falls back to Turkish", () => {
  assert.deepEqual(
    senderFileReviewLabels("unknown"),
    senderFileReviewLabels("tr"),
  );

  assert.deepEqual(
    senderFileReviewLabels("en-US"),
    senderFileReviewLabels("en"),
  );
});
