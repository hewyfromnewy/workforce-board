# ADR 0002 — image export (render-to-PNG)

- **Status:** Accepted (spike validated)
- **Date:** 2026-08-04
- **Spec:** Crew & Plant Planner v1 (§4.6 "the feature the product lives or dies on", §9 "validate the render-to-PNG approach early, in a spike")
- **Issue:** #4

## Context

The shareable image is the actual output of the product — how ~20 crew learn where
they're going. §9 requires validating render-to-PNG *before* building screens
around it, because "if the chosen library produces poor output at the required
size, the whole product premise changes." The known risk: the project's Tailwind
v4 styling emits `oklch()` colors, which plain `html2canvas` cannot parse.

## Decision

- **Library:** `html2canvas-pro` (already a dependency). The `-pro` fork exists
  specifically to support modern CSS color functions (`oklch`/`lab`), so it fits
  Tailwind v4 without stripping the design system.
- **Fixed size:** render the board element at a fixed **1080 CSS px** width at
  **scale 2** → a **2160 px-wide** PNG. Fixed width makes the output identical
  regardless of the editor's screen.
- **Delivery:** **both** download (`<a download>`) and clipboard copy
  (`navigator.clipboard.write([ClipboardItem])`, with graceful fallback when the
  browser/context blocks it).

## Validation

A spike (`apps/web/spike.html` → `src/spike/`) renders a representative
whiteboard-shaped daily board — job sites as rows; Personnel/Plant/Hire/Contractor
columns; traffic-control counts; free-text notes; Leave/Training/Unassigned areas;
and a split-day resource (Excavator 13T tagged AM at one site, PM at another). It
was driven headless (Chromium via Playwright): the export button was clicked and
the html2canvas-pro output captured to disk.

Result: **clean.** ~247 KB PNG, 2160 px wide, all text crisp; oklch tag colors,
the dark header, AM/PM badges, and italic notes all rendered correctly. The
split-day AM/PM tags read unambiguously, confirming that design (ADR/issue #1)
survives the image — the medium the product lives on.

## Consequences

- `exportPng.ts` (`renderElementToPng` / `downloadBlob` / `copyBlobToClipboard`)
  is the reusable core for the production Share-as-image feature (#8); the daily
  view (#7) becomes the real render target in place of the spike's sample board.
- The spike page ships as a harmless second Vite entry; remove it once #8 lands.

## Follow-ups (not blockers)

- A missing font asset 404'd during the spike; the render fell back to system
  sans and still looked clean. Wire up (or drop) the font before #8 so the image
  is deterministic.
- Re-check legibility on a very dense day (many resources per site); bump base
  font sizes if a full board gets cramped at 1080 px.
