# 0003 — readability floors

Date: 2026-09-04 · Plan: docs/plans/2026-09-04-full-pass.md §2

Text must not be readability-hostile. Floors at the verification viewport
(1280×800):

1. Body/informational text ≥ 16px (`1rem`). This includes instructions,
   descriptions, results, empty-state guidance, input fields, and worded
   control labels.
2. Dialogue reply buttons ≥ 16px.
3. Dial labels ≥ 15px rendered (prev/next built at `1.25rem × scale(0.75)`
   in `styles/dial.css`).
4. Status line text ≥ 14px.
5. Informational dim text contrast ≥ 4.5:1 against its effective
   background.

Per-app type voices are not homogenised: sizes scale within each app's
own idiom. Purely decorative marks (bezel plate, etchings, stamps,
epithets, spine text, progress dots) carry no information and may stay
faint/small.
