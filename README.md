
# 💰 Bill Splitter 

### Smart Bill Splitting Made Simple

Split expenses fairly among friends, couples, and groups — with multiple categories and minimum transfers.

**100% Client-Side • No Server • No Data Stored**

[![GitHub Pages](https://img.shields.io/badge/Live_Demo-GitHub_Pages-blue?logo=github)](https://YOUR_USERNAME.github.io/bill-splitter-pro)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

[Live Demo](#-live-demo) • [Features](#-features) • [How It Works](#-how-it-works) • [Getting Started](#-getting-started) • [API](#-calculator-api) • [Contributing](#-contributing)

</div>

---

## 🎯 The Problem

You went out with 12 friends. Pizza was ordered for everyone, but only 8 people drank alcohol. Three different people paid for different things. Some came as couples who settle internally.

**Now what? Who owes whom, and how much?**

### 💡 The Solution

Bill Splitter handles all the complexity:

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📦 **Multiple Categories** | Split different expenses separately (food, drinks, gas, etc.) |
| 👥 **Flexible Participants** | Each category can have different participants |
| 💑 **Couple / Group Netting** | Partners settle internally — no unnecessary transfers between them |
| 💳 **Multiple Payers** | Any number of people can pay for any category |
| 🧮 **Smart Algorithm** | Greedy optimization minimizes the total number of transfers |
| 📊 **Detailed Breakdown** | See exactly what each person owes and why |
| 💬 **WhatsApp Sharing** | Send one group link with the full summary, or a personal link to each friend that opens directly on their own share |
| 🔍 **Transparent Math** | Every amount shows how it was calculated: expense total ÷ participants, minus what you paid |
| 👥 **Quick Group Pick** | Couples/groups already added appear as one-tap chips under the group field, so you never retype a group name |
| 🗑️ **Clear All** | One button removes all participants and expenses (with confirmation) |
| ✏️ **Edit Participants** | Rename people or change their group at any time; every expense updates with them |
| ✅ **Review Before Calculating** | A "לפני החישוב" checklist flags what's missing (and what will be ignored) with a one-click fix link |
| 📋 **Copy Results** | One-click copy of the summary text |
| 🖨️ **Print / PDF** | A clean, results-only print layout |
| 💾 **Auto-save** | Your draft stays in this browser until you start over |
| 📋 **Load Example** | Pre-filled example to see how it works instantly |
| 🌐 **RTL Support** | Full Hebrew right-to-left interface, including mixed Hebrew/number text and WhatsApp messages |
| 🎨 **Colorful Redesign** | White, card-based UI with bold colors: every friend gets their own color that follows them through chips, chart, transfers and personal page |
| 🪜 **4-Step Flow** | Participants → Expenses → Calculation → Summary, as icon tabs with progress checks |
| 🍕 **Expense Icons** | Each expense gets an icon by type (food, drinks, hotel, fuel, car...) guessed from its name, and expands in place for editing |
| 🍩 **Donut Chart** | Each person's share of the total, with amount and percent per person |
| ➡️ **Who Pays Whom** | The final transfers as clear rows with avatars and amounts |
| 🌙 **Dark Mode** | Light by default; switch manually with the moon/sun button in the top bar (remembered in this browser) |
| 📱 **Fully Responsive** | Works perfectly on desktop, tablet, and mobile |
| 🔒 **Privacy First** | Everything runs in your browser — no data sent anywhere |
| ⚡ **Zero Dependencies** | Pure HTML + CSS + JavaScript — no frameworks needed |
| 🆓 **Free Hosting** | Runs on GitHub Pages — free forever, never sleeps |

---

## 🚀 Live Demo

### **[👉 Launch Bill Splitter Pro](https://barakshamailov.github.io/bill-splitter)**

> Click **"📋 Load Example"** to see it in action with sample data!

---

## 🔗 How Share Links Work

There is no server. When you share, the whole calculation (names, groups, expenses, payments) is packed into the link itself, after the `#`, and compressed in your browser so the link stays short:

```
https://barakshamailov.github.io/bill-splitter/#z=<data>&me=<person>
```

- `z` is the calculation as UTF-8 JSON, compressed with deflate (the browser's built-in `CompressionStream`) and encoded as base64url, so Hebrew names survive intact. It is roughly half the length of the old format.
- Older links that use `s=<data>` (the same JSON without compression) keep working. The app also falls back to `s=` links when the browser can't compress.
- `me` (optional) is the friend's position in the list. With it, the link opens on "היי <name>, זה החלק שלך": how much to transfer, to whom, and the line-by-line calculation.
- Without `me`, the link opens the full group summary, where each friend can tap their name.
- Shared links open a read-only view: no editing controls, and the recipient's own saved draft is never touched.
- Compression and decompression happen entirely on the device. The part after `#` is never sent to any server, including GitHub Pages. Decompressed data is capped at 256 KB.

Links only work from the published site, not from a local `file://` copy.

---

## 🗂️ Project Files

| File | Purpose |
|------|---------|
| `index.html`, `style.css`, `app.js` | The app: UI, design tokens (light and dark) and logic |
| `calculator.js` | The calculation engine (balances, couple netting, minimum transfers) |
| `PRODUCT.md` | Who the app is for and what it must do |
| `DESIGN.md` | The design system: colors, per-person palette, type, components |
