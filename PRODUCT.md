# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Groups of friends after any shared event: a trip or vacation, a night out or a dinner, a shared apartment. One person from the group usually does the settling, mostly on a phone, and then sends the result to everyone on WhatsApp. Recipients open a link and need to see their own share instantly.

## Product Purpose
Split shared expenses fairly when not everyone took part in every expense, several people paid, and couples or families settle internally. Success: everyone knows exactly how much to transfer, to whom, and why, with the fewest possible transfers.

## Positioning
Per-expense participants, couple/group netting, and a minimum-transfers algorithm, all running entirely in the browser with no account and no server. The whole calculation travels inside the share link, including a personal link that opens straight on one friend's share.

## Operating Context
Used at the end of an event, often in a hurry and on mobile. The output is consumed in WhatsApp: a group message with the full summary, or personal messages per friend. Also supports copy-to-clipboard and print/PDF.

## Capabilities and Constraints
- Flow in four steps: participants, expenses, calculation (breakdown), summary (who pays whom + sharing).
- Each expense has its own participants and any number of payers.
- Read-only shared view opened from a link (`#s=...&me=...`); never touches the recipient's draft.
- Auto-save draft in localStorage; load example; review-before-calculating checklist.
- Pure HTML + CSS + JS, no build step, no dependencies; hosted on GitHub Pages.
- Hebrew, RTL, including mixed Hebrew/number text.

## Brand Commitments
- Name: "EasySplit" (renamed from "Bill Splitter Pro"), tagline "Split bills. Keep it simple". Wordmark: Rubik 800, "Easy" navy + "Split" teal; icon: three people sharing a receipt.
- User-set constraint: white background by default, bold vivid colors, with an optional manual dark mode toggle.
- Reference the user supplied: a modern, light, card-based expense app with step tabs, colored participant avatars, expense rows with icons, a donut chart summary, and a "who pays whom" card.

## Evidence on Hand
No real testimonials, users, or metrics. No expense photography; do not fabricate images.

## Product Principles
1. The answer first: who pays whom, how much, is never more than a glance away.
2. Show the math: every amount can be traced to expense ÷ participants minus what was paid.
3. Fast on a phone: entering people and expenses must take seconds.
4. Private by construction: nothing leaves the browser except via the link the user chooses to send.

## Accessibility & Inclusion
Full RTL, keyboard reachable, visible focus, color never the only signal for who owes vs. who is owed.
