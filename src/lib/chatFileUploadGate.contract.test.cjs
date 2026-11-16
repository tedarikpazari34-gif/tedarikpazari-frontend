const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");

const source = fs.readFileSync(
  "src/pages/ChatPage.tsx",
  "utf8",
);

const backend = fs.readFileSync(
  "../backend-canli-temel/src/chat/chat-file-upload-enabled.guard.ts",
  "utf8",
);

test("Frontend dosya yukleme kilidi sabit false", () => {
  const ast = ts.createSourceFile(
    "ChatPage.tsx",
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );

  const declarations = [];

  function visit(node) {
    if (
      ts.isVariableDeclaration(node) &&
      node.name.getText(ast) === "CHAT_FILE_UPLOADS_READY"
    ) {
      declarations.push(node);
    }

    ts.forEachChild(node, visit);
  }

  visit(ast);

  assert.equal(declarations.length, 1);
  assert.equal(
    declarations[0].initializer.kind,
    ts.SyntaxKind.FalseKeyword,
  );
});

test("Dosya secme alani guvenlik kilidinin icinde", () => {
  const start = source.indexOf(
    "{CHAT_FILE_UPLOADS_READY && (",
  );

  const input = source.indexOf(
    "ref={fileInputRef}",
    start,
  );

  const end = source.indexOf(
    "\n                )}",
    input,
  );

  assert.ok(start >= 0);
  assert.ok(input > start);
  assert.ok(end > input);

  const section = source.slice(start, end);

  assert.ok(section.includes('type="file"'));
  assert.ok(section.includes("sendFile(file)"));
  assert.ok(section.includes("fileInputRef.current?.click()"));
});

test("Dosya gonderme fonksiyonu kilitliyken durur", () => {
  assert.match(
    source,
    /const sendFile = async \(file: File\) => \{\s*if \(!CHAT_FILE_UPLOADS_READY\) return;/,
  );
});

test("Backend yukleme varsayilan kapali", () => {
  assert.ok(
    backend.includes(
      "process.env.CHAT_FILE_UPLOADS_ENABLED !== 'true'",
    ),
  );
});

test("Frontend ortam degiskeniyle tek basina acilamaz", () => {
  assert.ok(
    !source.includes("VITE_CHAT_FILE_UPLOADS_ENABLED"),
  );
});
