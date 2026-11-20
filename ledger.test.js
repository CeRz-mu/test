const { test } = require("node:test");
const assert = require("node:assert/strict");
const { parseEntry, totals } = require("./ledger.js");

const sample = { date: "2024-02-29", type: "income", description: " 売上 ", amount: "2000" };

test("登録内容を正規化する", () => {
  assert.deepEqual(parseEntry(sample), { ...sample, description: "売上", amount: 2000 });
});

test("不正な日付、区分、内容、金額を拒否する", () => {
  for (const override of [
    { date: "2025-02-29" },
    { type: "transfer" },
    { description: "  " },
    { amount: "1.5" },
    { amount: "0" },
    { amount: "1000000000" },
  ]) {
    assert.equal(parseEntry({ ...sample, ...override }), null);
  }
});

test("収入・支出・残高を集計する", () => {
  assert.deepEqual(totals([]), { income: 0, expense: 0, balance: 0 });
  const expense = parseEntry({ ...sample, type: "expense", amount: "2500" });
  assert.deepEqual(totals([parseEntry(sample), expense]), { income: 2000, expense: 2500, balance: -500 });
});
