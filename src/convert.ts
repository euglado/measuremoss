export class UserError extends Error {}
type Fraction = readonly [bigint, bigint];
type Unit = { label: string; family: "length" | "mass" | "temperature"; factor: Fraction };
export const units: Record<string, Unit> = {
  mm: { label: "Millimeter / Milimetre (mm)", family: "length", factor: [1n, 1000n] },
  cm: { label: "Centimeter / Santimetre (cm)", family: "length", factor: [1n, 100n] },
  m: { label: "Meter / Metre (m)", family: "length", factor: [1n, 1n] },
  km: { label: "Kilometer / Kilometre (km)", family: "length", factor: [1000n, 1n] },
  in: { label: "International inch / İnç (in)", family: "length", factor: [127n, 5000n] },
  ft: { label: "International foot / Fit (ft)", family: "length", factor: [381n, 1250n] },
  yd: { label: "International yard / Yarda (yd)", family: "length", factor: [1143n, 1250n] },
  mi: { label: "International mile / Mil (mi)", family: "length", factor: [201168n, 125n] },
  mg: { label: "Milligram / Miligram (mg)", family: "mass", factor: [1n, 1000000n] },
  g: { label: "Gram (g)", family: "mass", factor: [1n, 1000n] },
  kg: { label: "Kilogram (kg)", family: "mass", factor: [1n, 1n] },
  oz: { label: "Avoirdupois ounce / Ons (oz)", family: "mass", factor: [45359237n, 1600000000n] },
  lb: { label: "Avoirdupois pound / Libre (lb)", family: "mass", factor: [45359237n, 100000000n] },
  c: { label: "Celsius / Santigrat (°C)", family: "temperature", factor: [1n, 1n] },
  f: { label: "Fahrenheit (°F)", family: "temperature", factor: [1n, 1n] },
  k: { label: "Kelvin (K)", family: "temperature", factor: [1n, 1n] },
};
const add = (a: Fraction, b: Fraction): Fraction => [a[0] * b[1] + b[0] * a[1], a[1] * b[1]];
const multiply = (a: Fraction, b: Fraction): Fraction => [a[0] * b[0], a[1] * b[1]];
const divide = (a: Fraction, b: Fraction): Fraction => [a[0] * b[1], a[1] * b[0]];
const cOffset = [27315n, 100n] as const;
const fOffset = [45967n, 100n] as const;
function parse(value: string): Fraction {
  if (!/^-?(?:0|[1-9]\d{0,9})(?:[.,]\d{1,9})?$/.test(value)) {
    throw new UserError(
      "Use a plain decimal, e.g. 12.5 or 12,5; no spaces, grouping or exponent. / 12.5 veya 12,5 gibi ondalık yazın; boşluk, binlik ayırıcı veya üs kullanmayın.",
    );
  }
  const normalized = value.replace(",", ".");
  const places = normalized.split(".")[1]?.length ?? 0;
  const q: Fraction = [BigInt(normalized.replace(".", "")), 10n ** BigInt(places)];
  if (q[0] > 1_000_000_000n * q[1] || q[0] < -1_000_000_000n * q[1]) {
    throw new UserError(
      "Maximum absolute input: 1,000,000,000. / En büyük mutlak girdi: bir milyar.",
    );
  }
  return q;
}
const display = (q: Fraction): string =>
  Number((Number(q[0]) / Number(q[1])).toPrecision(10)).toString();
const symbol = (key: string) => ({ c: "°C", f: "°F", k: "K" })[key] ?? key;
export function convert(value: string, from: string, to: string): string {
  const source = Object.hasOwn(units, from) ? units[from] : undefined;
  const target = Object.hasOwn(units, to) ? units[to] : undefined;
  if (!source || !target || source.family !== target.family) {
    throw new UserError(
      "Choose units of the same kind. / Aynı türden birimler seçin: uzunluk, kütle veya sıcaklık.",
    );
  }
  const input = parse(value);
  let result: Fraction;
  if (source.family === "temperature") {
    const kelvin =
      from === "c"
        ? add(input, cOffset)
        : from === "f"
          ? multiply(add(input, fOffset), [5n, 9n])
          : input;
    if (kelvin[0] < 0n)
      throw new UserError(
        "Temperature cannot be below absolute zero. / Sıcaklık mutlak sıfırın altında olamaz.",
      );
    result =
      to === "c"
        ? add(kelvin, [-cOffset[0], cOffset[1]])
        : to === "f"
          ? add(multiply(kelvin, [9n, 5n]), [-fOffset[0], fOffset[1]])
          : kelvin;
  } else {
    if (input[0] < 0n)
      throw new UserError(
        "Length and mass must be nonnegative. / Uzunluk ve kütle negatif olamaz.",
      );
    result = divide(multiply(input, source.factor), target.factor);
  }
  return `${value.replace(",", ".")} ${symbol(from)} ≈ ${display(result)} ${symbol(to)}`;
}
