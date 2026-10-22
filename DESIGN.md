# Design

EasySplit: white ground, vivid color, and every friend owns a color that follows them through the whole calculation (avatar, participant chip, donut slice, legend row, transfer row, personal page).

## Theme
- Light by default (`data-theme="light"` on `<html>`). Dark mode is manual only, from the moon/sun button in the top bar, stored in `localStorage['billSplitter.theme']`.
- All colors are tokens on `:root` in `style.css` and redefined under `:root[data-theme="dark"]`.

## Color
| Role | Light | Dark |
|---|---|---|
| Page / card | `#FFFFFF` / `#FFFFFF` | `#0E1220` / `#161B2C` |
| Sunken fill (inputs, rows) | `#F4F6FB` | `#1D2336` |
| Hairline | `#E4E8F1` | `#2A3149` |
| Ink / secondary / muted | `#111727` / `#48506A` / `#636B82` | `#F2F4FA` / `#B9C0D4` / `#959DB5` |
| Primary (actions, active step) | `#2F5BFF` | `#5B7CFF` |
| Green (add expense, group share) | `#08875A` | `#1FBF7E` |
| Owes / gets | `#E0284A` / `#08875A` | `#FF6B83` / `#3BD192` |

Person palette `--p0`…`--p9`: blue, pink, violet, orange, teal, magenta, sky, red, lime, orchid. A person's color is their index in the participants list mod 10 (`colorOf()` in `app.js`), applied with `.pc-N`, which sets `--c`.

Color never carries meaning alone: owes/gets always come with a verb ("מעביר", "מקבל").

## Type
Rubik 400–800 (Google Fonts). Display 800 with -0.025em tracking; card titles 700 / 1.25rem; body 16px / 1.55. Money uses tabular numerals and is wrapped LTR in `<bdi>`.

## Shape and depth
Cards 22px radius, rows and inputs 12–18px, chips and status pills fully round. Shadows are soft and offset (`--shadow`, `--shadow-lift`), never colored halos.

## Components
- **Stepper**: four tab cards (משתתפים, הוצאות, חישוב, סיכום), icon tile + label; active = primary border and tint with a solid primary icon; done = green check badge.
- **Card head**: 44px tinted icon tile, title, one-line sub.
- **Group heading**: in the participant list, each couple/group is a pill badge (users icon, name at 0.9375rem/700, `--primary-soft` fill, `--primary-ink` text) followed by a smaller gray meta line; people without a group get a violet-gray "ללא קבוצה" badge (user icon) shown only when at least one group exists. Sections are separated by a hairline.
- **Expense row**: type icon guessed from the name (`EXPENSE_KINDS`), name, meta line, total, chevron; expands in place to the participant chips, payers and math line.
- **Donut**: SVG, circumference 100, one segment per person in their color, total in the center, legend with amount and percent (two columns past 7 people).
- **Transfer row**: payer avatar, arrow, receiver avatar, amount.
- **Share cards**: green tint for the group link (recommended), blue tint for personal links.

## Motion
One entrance (cards rise 8px and fade in) and one signature moment (donut segments draw in). Everything is off under `prefers-reduced-motion`.
