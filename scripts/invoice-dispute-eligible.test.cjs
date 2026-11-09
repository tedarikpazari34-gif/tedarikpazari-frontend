
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

const source = fs.readFileSync(
  path.resolve(__dirname, "../src/lib/invoiceDisputeEligible.ts"),
  "utf8"
);
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS }
}).outputText;
const exportsObject = {};
vm.runInNewContext(compiled, { exports: exportsObject });
const { invoiceDisputeEligible: eligible } = exportsObject;

for (const status of ["OPEN", "SELLER_RESPONDED"]) {
  for (const orderStatus of ["PAID", "PREPARING", "SHIPPED"]) {
    test(`${status} + ${orderStatus} kabul edilir`, () => {
      assert.equal(eligible({
        status, order: { status: orderStatus }
      }), true);
    });
  }
}

for (const status of ["CANCELLED", "COMPLETED", "PENDING_PAYMENT"]) {
  test(`Aktif uyusmazlikta ${status} reddedilir`, () => {
    assert.equal(eligible({
      status: "OPEN", order: { status }
    }), false);
  });
}

test("Eksik siparis durumu reddedilir", () => {
  assert.equal(eligible({ status: "OPEN" }), false);
});

test("Karara baglanmis aktif uyusmazlik reddedilir", () => {
  assert.equal(eligible({
    status: "OPEN", resolution: "RELEASE_TO_SELLER",
    order: { status: "PAID" }
  }), false);
});

test("Tamamlanmis alici iadesi kabul edilir", () => {
  assert.equal(eligible({
    status: "RESOLVED_BUYER",
    resolution: "REFUND_TO_BUYER",
    resolvedAt: "2026-11-01T12:00:00Z",
    order: { status: "CANCELLED" }
  }), true);
});

test("Gecersiz iade tarihi reddedilir", () => {
  assert.equal(eligible({
    status: "RESOLVED_BUYER",
    resolution: "REFUND_TO_BUYER",
    resolvedAt: "gecersiz",
    order: { status: "CANCELLED" }
  }), false);
});

test("Iade edilmemis siparis tamamlanmis sayilmaz", () => {
  assert.equal(eligible({
    status: "RESOLVED_BUYER",
    resolution: "REFUND_TO_BUYER",
    resolvedAt: "2026-11-01T12:00:00Z",
    order: { status: "PAID" }
  }), false);
});
