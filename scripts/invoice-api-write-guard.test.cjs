const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

const source = fs.readFileSync(
  path.join(__dirname, "../src/lib/invoiceApi.ts"),
  "utf8",
).replaceAll("import.meta.env", "__env");

const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
  },
}).outputText;

function setup(env) {
  const calls = [];
  const module = { exports: {} };

  class MockFormData {
    append() {}
  }

  vm.runInNewContext(compiled, {
    module,
    exports: module.exports,
    __env: env,
    URL,
    FormData: MockFormData,
    localStorage: {
      getItem: () => "test-token",
    },
    fetch: async (url, options) => {
      calls.push({ url, options });
      return {
        ok: true,
        json: async () => ({ id: "test-invoice" }),
      };
    },
  });

  return { api: module.exports.invoiceApi, calls };
}

const operations = {
  sale: api => api.uploadSale(
    "order1", {}, "F1", "E_ARCHIVE", "2026-11-09",
  ),
  return: api => api.uploadReturn(
    "order1", {}, "RETURN", "dispute1",
    "sale1", "R1", "E_ARCHIVE", "2026-11-09",
  ),
  admin: api => api.review("invoice1", "APPROVE"),
};

const live = "https://tedarik-backend.onrender.com/api";

const blockedCases = [
  ["ana izin kapali", {
    VITE_API_URL: live,
    VITE_ENABLE_INVOICE_WRITE: "false",
    VITE_ALLOW_LIVE_INVOICE_WRITE: "true",
  }],
  ["canli izin kapali", {
    VITE_API_URL: live,
    VITE_ENABLE_INVOICE_WRITE: "true",
    VITE_ALLOW_LIVE_INVOICE_WRITE: "false",
  }],
  ["canli izin tanimsiz", {
    VITE_API_URL: live,
    VITE_ENABLE_INVOICE_WRITE: "true",
  }],
  ["Turkce domain kilidi", {
    VITE_INVOICE_API_URL: "https://tedarikpazarı.com/api",
    VITE_ENABLE_INVOICE_WRITE: "true",
    VITE_ALLOW_LIVE_INVOICE_WRITE: "false",
  }],
  ["punycode domain kilidi", {
    VITE_INVOICE_API_URL: "https://xn--tedarikpazar-d5b.com/api",
    VITE_ENABLE_INVOICE_WRITE: "true",
    VITE_ALLOW_LIVE_INVOICE_WRITE: "false",
  }],
];

for (const [label, env] of blockedCases) {
  for (const [operation, invoke] of Object.entries(operations)) {
    test(`${label} / ${operation}: HTTP engellenir`, () => {
      const { api, calls } = setup(env);
      assert.throws(() => invoke(api));
      assert.equal(calls.length, 0);
    });
  }
}

const allowedCases = [
  ["yerel test API", {
    VITE_API_URL: "http://localhost:3000/api",
    VITE_ENABLE_INVOICE_WRITE: "true",
    VITE_ALLOW_LIVE_INVOICE_WRITE: "false",
  }],
  ["iki izin acik - yalnizca sahte HTTP", {
    VITE_API_URL: live,
    VITE_ENABLE_INVOICE_WRITE: "true",
    VITE_ALLOW_LIVE_INVOICE_WRITE: "true",
  }],
];

for (const [label, env] of allowedCases) {
  for (const [operation, invoke] of Object.entries(operations)) {
    test(`${label} / ${operation}: sahte HTTP`, async () => {
      const { api, calls } = setup(env);
      await invoke(api);
      assert.equal(calls.length, 1);
      assert.equal(calls[0].options.method, "POST");
      assert.equal(
        calls[0].options.headers.Authorization,
        "Bearer test-token",
      );
    });
  }
}
