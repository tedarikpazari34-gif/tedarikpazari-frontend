const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");

const source = fs.readFileSync(
  "src/lib/chatFileAccess.ts",
  "utf8",
);

const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
  },
}).outputText;

const context = { exports: {}, URL };

vm.runInNewContext(compiled, context);

const {
  isTrustedChatFileUrl,
  chatFileEndpoint,
} = context.exports;

test("Cloudinary HTTPS indirme adresleri kabul edilir", () => {
  assert.equal(
    isTrustedChatFileUrl(
      "https://api.cloudinary.com/v1_1/demo/raw/download?signature=abc",
    ),
    true,
  );

  assert.equal(
    isTrustedChatFileUrl(
      "https://res.cloudinary.com/demo/image/authenticated/a.jpg",
    ),
    true,
  );
});

test("HTTP ve baska domainler reddedilir", () => {
  for (const url of [
    "http://api.cloudinary.com/file",
    "https://example.com/file",
    "https://res.cloudinary.com.evil.test/file",
    "javascript:alert(1)",
  ]) {
    assert.equal(isTrustedChatFileUrl(url), false);
  }
});

test("Kullanici bilgisi ve farkli port reddedilir", () => {
  for (const url of [
    "https://user@res.cloudinary.com/file",
    "https://res.cloudinary.com:8443/file",
    "https://res.cloudinary.com/file#fragment",
  ]) {
    assert.equal(isTrustedChatFileUrl(url), false);
  }
});

test("Bos ve gecersiz URL reddedilir", () => {
  for (const url of [null, "", "not-a-url", 123]) {
    assert.equal(isTrustedChatFileUrl(url), false);
  }
});

test("Sohbet kimlikleri URL yoluna guvenli kodlanir", () => {
  assert.equal(
    chatFileEndpoint(
      "https://backend.example/api/",
      "thread/other",
      "message?secret=1",
    ),
    "https://backend.example/api/chat/threads/thread%2Fother/files/message%3Fsecret%3D1",
  );
});
