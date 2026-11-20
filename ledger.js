"use strict";

function parseEntry({ date, type, description, amount }) {
  const label = typeof description === "string" ? description.trim() : "";
  const value = typeof amount === "string" && /^\d+$/.test(amount) ? Number(amount) : amount;
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const day = new Date(date + "T00:00:00Z");
  if (Number.isNaN(day.getTime()) || day.toISOString().slice(0, 10) !== date) return null;
  if (!["income", "expense"].includes(type) || !label || label.length > 80) return null;
  if (!Number.isSafeInteger(value) || value < 1 || value > 999999999) return null;
  return { date, type, description: label, amount: value };
}

function totals(entries) {
  let income = 0;
  let expense = 0;
  for (const entry of entries) {
    if (entry.type === "income") income += entry.amount;
    else expense += entry.amount;
  }
  return { income, expense, balance: income - expense };
}

if (typeof module !== "undefined") module.exports = { parseEntry, totals };
