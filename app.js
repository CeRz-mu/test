"use strict";

const key = "simple-ledger-v1";
const form = document.querySelector("#entry-form");
const rows = document.querySelector("#entries");
const statusMessage = document.querySelector("#status");
const yen = new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" });
let entries = [];
let storageReady = false;

const localNow = new Date();
localNow.setMinutes(localNow.getMinutes() - localNow.getTimezoneOffset());
form.elements.date.value = localNow.toISOString().slice(0, 10);

try {
  entries = JSON.parse(localStorage.getItem(key) ?? "[]");
  if (!Array.isArray(entries) || entries.some(entry => !entry || !parseEntry(entry) || !Number.isInteger(entry.amount))) {
    throw new Error("Invalid ledger");
  }
  storageReady = true;
} catch {
  entries = [];
  statusMessage.textContent = "保存データを読み込めませんでした。ブラウザーの保存設定を確認してください。";
  form.querySelector("button").disabled = true;
}

function save(next, message) {
  if (!storageReady) return false;
  try {
    localStorage.setItem(key, JSON.stringify(next));
  } catch {
    statusMessage.textContent = "保存できませんでした。ブラウザーの保存設定と空き容量を確認してください。";
    return false;
  }
  entries = next;
  render();
  statusMessage.textContent = message;
  form.elements.description.focus();
  return true;
}

function render() {
  for (const [id, amount] of Object.entries(totals(entries))) {
    document.getElementById(id).textContent = yen.format(amount);
  }
  document.querySelector("#empty").hidden = entries.length > 0;
  document.querySelector("#history-table").hidden = entries.length === 0;

  rows.replaceChildren();
  const sorted = entries.map((entry, index) => ({ entry, index }))
    .sort((a, b) => b.entry.date.localeCompare(a.entry.date) || b.index - a.index);
  for (const { entry, index } of sorted) {
    const row = rows.insertRow();
    for (const value of [entry.date, entry.type === "income" ? "収入" : "支出", entry.description, yen.format(entry.amount)]) {
      row.insertCell().textContent = value;
    }
    const button = document.createElement("button");
    button.type = "button";
    button.className = "delete";
    button.textContent = "削除";
    button.setAttribute("aria-label", entry.description + "を削除");
    button.addEventListener("click", () => {
      if (window.confirm("「" + entry.description + "」を削除しますか？")) {
        save(entries.filter((_, position) => position !== index), "取引を削除しました。");
      }
    });
    row.insertCell().append(button);
  }
}

form.addEventListener("submit", event => {
  event.preventDefault();
  const entry = parseEntry(Object.fromEntries(new FormData(form)));
  if (!entry) {
    statusMessage.textContent = "日付、内容、金額を確認してください。";
    return;
  }
  if (save([...entries, entry], "取引を登録しました。")) {
    form.elements.description.value = "";
    form.elements.amount.value = "";
  }
});

render();
