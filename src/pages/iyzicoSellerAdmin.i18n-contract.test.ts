import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (path: string) =>
  readFileSync(resolve(process.cwd(), path), "utf8");

const seller = read("src/pages/SellerProfilePage.tsx");
const admin = read("src/pages/AdminCompaniesPage.tsx");

const sellerKeys = [
  "iyzicoOnboardingTitle",
  "iyzicoActiveMessage",
  "iyzicoPendingMessage",
  "iyzicoInstruction",
  "iyzicoIbanHelp",
  "iyzicoSaving",
  "iyzicoActivate",
  "iyzicoInvalidIban",
  "iyzicoStartFailed",
  "iyzicoSuccess",
  "iyzicoConnectionError",
];

const adminKeys = [
  "iyzicoReconcileConfirm",
  "iyzicoReconcileFailed",
  "iyzicoReconcileSuccess",
  "iyzicoReconcileConnectionError",
  "iyzicoActiveStatus",
  "iyzicoPendingStatus",
  "iyzicoNotStartedStatus",
  "iyzicoReconciling",
  "iyzicoReconcileAction",
];

function verifySection(
  source: string,
  section: string,
  keys: string[],
  expectedCount: number
) {
  const pattern = new RegExp(
    `^\\s*["']?${section}["']?\\s*:\\s*\\{`,
    "gm"
  );

  const matches = [...source.matchAll(pattern)];

  expect(matches).toHaveLength(expectedCount);

  for (const match of matches) {
    const text = source.slice(match.index, match.index! + 5000);

    for (const key of keys) {
      expect(
        text,
        `${section}.${key} çevirisi eksik`
      ).toMatch(
        new RegExp(`^\\s*["']?${key}["']?\\s*:`, "m")
      );
    }
  }
}

describe("iyzico satıcı ve admin yedi dil sözleşmesi", () => {
  const locales = [
    ["TR + EN", "src/i18n/index.ts", 2],
    ["KA", "src/i18n/locales/ka.ts", 1],
    ["RU", "src/i18n/locales/ru.ts", 1],
    ["DE", "src/i18n/locales/de.ts", 1],
    ["AR", "src/i18n/locales/ar.ts", 1],
    ["UZ", "src/i18n/locales/uz.ts", 1],
  ] as const;

  it.each(locales)(
    "%s çevirilerinde tüm iyzico anahtarları bulunur",
    (_language, filename, count) => {
      const source = read(filename);

      verifySection(
        source,
        "sellerProfilePage",
        sellerKeys,
        count
      );

      verifySection(
        source,
        "adminCompaniesPage",
        adminKeys,
        count
      );
    }
  );

  it.each(sellerKeys)(
    "satıcı ekranı %s mesajını kullanır",
    key => {
      expect(seller).toContain(
        `t("sellerProfilePage.${key}")`
      );
    }
  );

  it.each(adminKeys)(
    "admin ekranı %s mesajını kullanır",
    key => {
      expect(admin).toContain(
        `t("adminCompaniesPage.${key}")`
      );
    }
  );

  it("satıcı ekranı MOD-97 IBAN kontrolünü kullanır", () => {
    expect(seller).toContain(
      "isValidTurkishIban(normalizedIban)"
    );
  });

  it("admin mutabakatı ortam API adresini kullanır", () => {
    expect(admin).toContain(
      "VITE_API_URL"
    );
    expect(admin).toContain(
      "${API_BASE}/payments/iyzico/submerchant/reconcile/"
    );
  });
});
