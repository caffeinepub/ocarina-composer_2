# Specification

## Summary
**Goal:** Allow users to open the hole positioning editor directly from the main view by adding a "Position Holes" button near the OcarinaVisual component, without needing to navigate into the Settings modal.

**Planned changes:**
- Add a "Position Holes" button visible in the main interface, directly on or immediately below the OcarinaVisual component.
- When clicked, open the HolePositioningEditor as a modal or inline overlay on top of the OcarinaVisual component.
- The HolePositioningEditor uses the same background image as OcarinaVisual (stock grey ocarina image by default, or user-uploaded photo if available).
- All 4 holes remain draggable (mouse and touch) within the editor.
- A Save button persists new hole positions via the existing `useCustomHolePositions` hook; a Cancel/Close button discards changes.
- After saving, OcarinaVisual immediately reflects the updated hole positions.

**User-visible outcome:** Users can click "Position Holes" directly on the main screen to drag and reposition the 4 ocarina holes on the actual ocarina image, then save without ever opening the Settings modal.
