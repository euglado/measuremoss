import assert from "node:assert/strict";
import test from "node:test";
import { convert, UserError, units } from "../dist/convert.js";

const result = (value, from, to) => Number(convert(value, from, to).split(" ≈ ")[1].split(" ")[0]);
for (const [value, from, to, expected] of [
  ["1", "in", "cm", 2.54],
  ["1", "ft", "m", 0.3048],
  ["1", "yd", "m", 0.9144],
  ["1", "mi", "km", 1.609344],
  ["1000", "mm", "m", 1],
  ["2.5", "km", "m", 2500],
  ["1", "lb", "kg", 0.45359237],
  ["1", "oz", "g", 28.34952313],
  ["16", "oz", "lb", 1],
  ["1000000", "mg", "kg", 1],
  ["2,5", "kg", "g", 2500],
  ["32", "f", "c", 0],
  ["212", "f", "c", 100],
  ["100", "c", "f", 212],
  ["0", "c", "k", 273.15],
  ["0", "k", "c", -273.15],
  ["0", "k", "f", -459.67],
  ["-273.15", "c", "k", 0],
  ["-459.67", "f", "k", 0],
  ["-40", "f", "c", -40],
  ["0.000000001", "mg", "kg", 1e-15],
  ["1000000000", "km", "mm", 1e15],
  ["-0", "m", "ft", 0],
  ["1,000", "m", "cm", 100],
])
  test(`${value} ${from} converts to ${expected} ${to}`, () =>
    assert.equal(result(value, from, to), expected));
test("all 16 units preserve identity and same-family round trips", () => {
  for (const [from, a] of Object.entries(units)) {
    assert.equal(result("123.456", from, from), 123.456);
    for (const [to, b] of Object.entries(units)) {
      if (a.family !== b.family) {
        assert.throws(() => convert("1", from, to), UserError);
        continue;
      }
      const forward = result("123.456", from, to);
      // Exponent display is output-only: expand it for a valid decimal input.
      const decimal = forward.toFixed(9);
      const back = result(decimal, to, from);
      assert.ok(Math.abs(back - 123.456) < 0.002, `${from} -> ${to} -> ${from}: ${back}`);
    }
  }
});
for (const value of [
  "",
  " ",
  " 1",
  "1 ",
  "1_000",
  "1,234,567",
  "1.234,5",
  "1e3",
  "NaN",
  "Infinity",
  "+1",
  ".5",
  "1.",
  "01",
  "--1",
  "1\n",
  "1\r\n",
  "0.0000000001",
  "1000000001",
  "-1000000001",
  "99999999999",
  "<@123>",
  "https://x.test",
]) {
  test(`reject invalid input ${JSON.stringify(value)}`, () =>
    assert.throws(() => convert(value, "m", "cm"), UserError));
}
test("unknown and inherited keys are rejected", () => {
  for (const key of ["__proto__", "constructor", "toString", "cup", "C", ""])
    assert.throws(() => convert("1", key, "m"), UserError);
});
test("temperature below absolute zero is rejected without tolerance loopholes", () => {
  for (const [value, from] of [
    ["-273.150000001", "c"],
    ["-459.670000001", "f"],
    ["-0.000000001", "k"],
  ])
    assert.throws(() => convert(value, from, "k"), UserError);
});
test("mass and length reject negative values", () => {
  assert.throws(() => convert("-1", "g", "kg"), UserError);
  assert.throws(() => convert("-0.000000001", "ft", "m"), UserError);
});
test("accept physical temperature just above absolute zero", () =>
  assert.equal(result("-273.149999999", "c", "k"), 1e-9));
