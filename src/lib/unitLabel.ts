import type { TFunction } from "i18next";

export function unitLabel(
  value: string | null | undefined,
  t: TFunction
): string {
  if (!value) return "";

  const normalized = value.trim().toLocaleLowerCase("tr-TR");

  const aliases: Record<string, string> = {
    adet: "piece",
    piece: "piece",
    unit: "piece",

    koli: "box",
    kutu: "box",
    box: "box",
    carton: "box",

    paket: "package",
    package: "package",

    kg: "kilogram",
    kilogram: "kilogram",

    ton: "ton",

    litre: "litre",
    liter: "litre",

    metre: "meter",
    meter: "meter",

    palet: "pallet",
    pallet: "pallet",
  };

  const key = aliases[normalized];

  return key ? t(`units.${key}`) : value;
}
