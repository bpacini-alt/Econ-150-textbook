# Chapter 16 drag-sort interaction iteration — October 31, 2026

The Rapid Sort format now opens in **drag-and-drop mode** by default. Cards move from an unsorted tray into category bins; placing a card removes it from the tray and shows it in the chosen bin. Cards remain draggable between bins and back to the tray until submitted. Correctness is revealed only after Check all six (we do **not** give away correct answers during placement).

A visible **“Try a more accessible version”** toggle switches the same board to a labeled select control for each card. Existing picks are retained between modes, and both modes share the same answer key and score. The alternative is available before any attempt and does not require dragging.

The pilot is now ready for browser, touch, keyboard, and assistive-technology testing. Native HTML drag events may not work well on touchscreens; do not interpret the presence of an alternative select UI as evidence that the interaction itself meets all accessibility requirements. If touch support is poor, replace with touch-capable pointer dragging or click-to-pick/click-to-place before broad release.
