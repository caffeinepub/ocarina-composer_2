# Specification

## Summary
**Goal:** Add inline preset naming when saving custom presets, and add sheet music import (image, MusicXML, and MIDI) that loads parsed notes into the ocarina composition for playback.

**Planned changes:**
- In the FingeringEditor / SampleUploadManager, replace any popup or unnamed save flow with an inline text input that appears when "Save as Preset" is clicked; the save button is disabled until a non-empty name is entered, and the field is dismissed after saving.
- Add a sheet music upload UI (button or drop zone) accessible from the main interface supporting PNG, JPG, MusicXML (.xml, .musicxml), and MIDI (.mid, .midi) files.
- Parse uploaded image files client-side to extract note pitches and durations and load them into the composition's note sequence.
- Parse MusicXML files client-side to extract pitch names, octave numbers, and durations; parse MIDI files client-side to extract note on/off events and convert to the app's note format.
- Transpose or clamp notes outside the current ocarina preset's supported range to the nearest available octave, notifying the user of any adjustments.
- Allow the user to choose whether imported notes replace or append to the existing composition.
- Show a summary after import (notes imported, transpositions applied) and a clear error/warning if parsing fails or produces no notes.

**User-visible outcome:** Users can name custom presets inline without a popup dialog, and can upload sheet music images or files (MusicXML/MIDI) to automatically populate the composition with parsed notes that play back on the ocarina.
