# Pedals! — Feature Spec

## Overview

This spec covers improvements to the Pedals! app: visual polish to make the
pedalboard look and feel more realistic, new audio effects, interactive knobs,
a pedal editor for building and modifying boards, persistence so users can save
and load their boards, and a home page that displays all saved pedalboards.

---

## 1. Visual Polish

### 1.1 Pedal Appearance

**Current state:** Pedals render as plain colored rectangles via `BasePedal.draw()`.
Colors are random unless explicitly passed.

**Goal:** Pedals should look like miniature guitar pedals — a rounded rectangle
body with a label, a consistent color per pedal type, and (when knobs are added
in section 3) visible knobs on the face.

**Design per pedal type:**

| Pedal Type   | Color   | Label        |
|--------------|---------|--------------|
| Oscillator   | #2196F3 | OSC          |
| Volume       | #4CAF50 | VOL          |
| Distortion   | #F44336 | DIST         |
| Output       | #444444 | OUT          |
| Reverb       | #9C27B0 | REVERB       |
| Delay        | #FF9800 | DELAY        |
| Chorus       | #00BCD4 | CHORUS       |
| Flanger      | #E91E63 | FLANGER      |

**Rendering details:**

- Body: Rounded rectangle (corner radius ~10px) with a slight shadow or border
  to give depth. Each pedal type uses its designated color from the table above.
  The color should no longer be randomized — remove the random hex fallback in
  `BasePedal`'s constructor and instead have each subclass pass its own color.
- Stomp button: There should be a rectangular silver button at the bottom of the
  pedal body. The button, when clicked, should make the signal bypass the effect
  of the pedal, and continue to the next node in the audio graph.
- Label: Pedal type name drawn in bold white text, centered horizontally on the
  pedal face, positioned in the upper third of the body.
- Footswitch: A small circle drawn at the bottom center of the pedal to visually
  suggest the stomp switch (decorative only for now).
- Size: Keep the current 100x200 dimensions. They can be adjusted later if knobs
  need more room, but start here.

### 1.2 Patch Cable Appearance

**Current state:** Cables render as a gray rectangular "case" on each end with a
bezier curve connecting them. The line is a 1px black stroke.

**Goal:** Cables should feel more like real patch cables — thicker, colored, with
a visible plug shape on each end.

**Rendering details:**

- Cable line: Increase stroke width to 4-5px. Use a dark color (e.g. `#333`) or
  optionally assign a random color per cable instance for visual distinction.
- Plugs: Replace the rectangular cases with a small rounded-rect plug shape on
  each end. The plug should have a metallic tip (narrow silver/gray rectangle)
  and a colored barrel (matching the cable color, slightly wider).
- The bezier curve logic for the cable sag is already good — keep it. Just make
  the line thicker and the endpoints look like plugs instead of blocks.

---

## 2. New Effects

Each new pedal type extends `BasePedal`, overrides `setupAudioNode()`, and
defines its own knobs (see section 3 for the knob system).

### 2.1 Reverb Pedal

**Audio implementation:** Convolution reverb using a `ConvolverNode`. Generate an
impulse response buffer programmatically (noise burst with exponential decay) so
we don't need to load an external audio file.

**Parameters (knobs):**

| Knob   | Audio property                           | Range     | Default |
|--------|------------------------------------------|-----------|---------|
| Decay  | Length of generated impulse response (s)  | 0.1 – 5.0 | 2.0     |
| Mix    | Dry/wet blend (gain crossfade)            | 0 – 1     | 0.5     |

**Signal routing:** Input -> dry gain + wet gain (convolver) -> merge -> output.
The Mix knob controls the balance between dry and wet paths.

### 2.2 Delay Pedal

**Audio implementation:** `DelayNode` with a feedback loop through a `GainNode`.

**Parameters (knobs):**

| Knob     | Audio property           | Range       | Default |
|----------|--------------------------|-------------|---------|
| Time     | `DelayNode.delayTime`    | 0.05 – 1.0s | 0.3     |
| Feedback | Feedback gain            | 0 – 0.9     | 0.4     |
| Mix      | Dry/wet blend            | 0 – 1       | 0.5     |

**Signal routing:** Input splits to dry path and delay path. Delay output feeds
back into itself through a feedback gain node. Dry and wet paths merge at output.

### 2.3 Chorus Pedal

**Audio implementation:** `DelayNode` modulated by a low-frequency `OscillatorNode`
(LFO) routed to the delay time via a `GainNode`.

**Parameters (knobs):**

| Knob  | Audio property                  | Range      | Default |
|-------|---------------------------------|------------|---------|
| Rate  | LFO frequency (Hz)             | 0.1 – 10   | 1.5     |
| Depth | LFO amplitude (delay mod range) | 0 – 0.01   | 0.003   |
| Mix   | Dry/wet blend                   | 0 – 1      | 0.5     |

**Signal routing:** Input splits to dry path and a short delay (~0.03s base).
An LFO oscillator modulates the delay time through a gain node. Dry and wet
merge at output.

### 2.4 Flanger Pedal

**Audio implementation:** Same architecture as chorus but with a shorter base
delay, higher feedback, and narrower modulation range to create the characteristic
comb-filter sweep.

**Parameters (knobs):**

| Knob     | Audio property           | Range      | Default |
|----------|--------------------------|------------|---------|
| Rate     | LFO frequency (Hz)       | 0.05 – 5   | 0.5     |
| Depth    | LFO amplitude            | 0 – 0.005  | 0.002   |
| Feedback | Feedback gain            | 0 – 0.95   | 0.7     |

**Signal routing:** Input splits to dry and a very short delay (~0.005s base).
LFO modulates delay time. Output of delay feeds back to its input through
feedback gain. Dry and wet merge at output.

---

## 3. Pedal Knobs

### 3.1 Data Model

Add a `Knob` class (or interface) that each pedal can define:

```typescript
interface KnobConfig {
  label: string;        // Display name (e.g. "Gain", "Decay")
  min: number;          // Minimum value
  max: number;          // Maximum value
  default: number;      // Initial value
  value: number;        // Current value
  onChange: (value: number) => void;  // Callback to update the audio param
}
```

`BasePedal` gets a `knobs: KnobConfig[]` array. Each subclass populates this in
`setupAudioNode()` (or a new `setupKnobs()` method) so knobs are tied to the
audio nodes they control.

**Existing pedals get knobs too:**

| Pedal      | Knobs                                    |
|------------|------------------------------------------|
| Volume     | Level (gain: 0 – 3, default 2)           |
| Distortion | Drive (k param: 0 – 800, default 400)    |
| Oscillator | Frequency (Hz: 20 – 2000, default 350)   |
| Output     | (none)                                   |

### 3.2 Rendering

Knobs are drawn on the pedal face below the label. Each knob is:

- A circle (~15px radius) with a slightly darker fill than the pedal body.
- A line from center to the edge indicating the current position (like a clock
  hand). The rotation maps linearly from `min` (roughly 7 o'clock / 220 degrees)
  to `max` (roughly 5 o'clock / 320 degrees).
- The knob label drawn in small text below the circle.

Layout: Knobs are arranged in a horizontal row, evenly spaced across the pedal
width. If a pedal has 1 knob it's centered, 2 knobs are spaced evenly, 3 knobs
fill the width, etc.

### 3.3 Interaction

- **Click and drag vertically** on a knob to change its value. Dragging up
  increases, dragging down decreases. This is the standard behavior for
  virtual knobs in audio software.
- The canvas mouse handling in `PedalBoardCanvas` needs to be extended: on
  mousedown, check if the click is inside a knob's bounding circle. If so,
  enter "knob turning" mode instead of "pedal dragging" mode. Track vertical
  mouse movement and map it to value changes.
- While a knob is being turned, call its `onChange` callback to update the audio
  parameter in real time.

### 3.4 Hit Detection

`BasePedal` needs a method to check if a click lands on a knob vs the pedal body:

- `getKnobAt(x, y): KnobConfig | null` — returns the knob under the cursor, or
  null if the click is on the pedal body (which means drag-the-pedal behavior).
- The canvas mousedown handler calls this first. If a knob is returned, it enters
  knob-turning mode. Otherwise, it falls through to pedal-dragging mode.

---

## 4. Save / Load Pedalboards

### 4.1 Serialization

Each pedalboard can be serialized to a JSON structure:

```typescript
interface PedalBoardData {
  id: string;           // UUID
  name: string;         // User-given name
  description: string;  // Optional description
  pedals: {
    type: string;       // e.g. "distortion", "reverb"
    x: number;
    y: number;
    knobs: { label: string; value: number }[];
  }[];
  cables: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    inputPedalIndex: number | null;   // index into pedals array
    outputPedalIndex: number | null;
  }[];
}
```

Each pedal subclass needs a static `type` string (e.g. `"distortion"`) and a
factory/registry so we can reconstruct the right class from a type string when
loading.

### 4.2 Storage

Use `localStorage` for persistence. Keep it simple — no backend for now.

- Key: `pedalboards` — stores a JSON array of `PedalBoardData` objects.
- On the home page, load saved boards from localStorage and display them as cards
  (replacing the current stub data).
- The "new pedalboard" flow creates a board with a default set of pedals, prompts
  for a name, and saves it.

### 4.3 Home Page Changes

- Replace `stubBoards` with boards loaded from localStorage.
- Each `PedalBoardCard` links to `/pedal-board?id=<board-id>`.
- Add a delete button on each card.
- The `NewPedalBoardCard` navigates to `/pedal-board` with no id, which creates a
  fresh board (user names it on first save).

### 4.4 Pedal Board Page Changes

- On load, if an `id` query param is present, deserialize that board from
  localStorage and initialize the pedals/cables from it.
- Add a "Save" button in the toolbar that serializes the current state and writes
  it to localStorage.
- Add a name field (editable text or simple input) in the toolbar.

---

## 5. Pedal Editor

**Current state:** The `/pedal-editor` page is a placeholder that renders only
the text "Pedal editor". The nav drawer has a "New Pedal" link that points to it.

**Goal:** A full editor page where users can build and modify a pedalboard — add
pedals from a palette, remove pedals, add/remove cables, and arrange everything
on the canvas.

### 5.1 Pedal Palette

A sidebar or toolbar listing all available pedal types. Each entry shows the
pedal's color swatch, name, and a brief description of what it does.

| Pedal      | Description                        |
|------------|------------------------------------|
| Oscillator | Generates a tone                   |
| Volume     | Controls signal level              |
| Distortion | Adds overdrive / clipping          |
| Reverb     | Simulates room ambience            |
| Delay      | Repeating echo effect              |
| Chorus     | Thickens sound with modulation     |
| Flanger    | Sweeping comb-filter effect        |
| Output     | Routes signal to speakers          |

**Adding a pedal:** Click a pedal in the palette (or drag it) to add it to the
canvas. The new pedal is placed at a default position and can be dragged to the
desired location. A new `PatchCable` is not automatically created — the user
adds cables separately.

### 5.2 Adding and Removing Cables

- **Add cable:** A button or palette entry for "New Cable" that drops a
  disconnected cable onto the canvas. The user then drags each end to plug into
  pedals (using the existing plug-in-to-nearest-pedal logic).
- **Remove cable:** Right-click (or long-press) a cable end to get a context
  action to delete it. The cable unplugs from both pedals and is removed from
  the cables array.

### 5.3 Removing Pedals

- Right-click (or a delete button overlay) on a pedal to remove it.
- When a pedal is removed, any cables plugged into it are automatically
  unplugged (disconnected from the audio graph) and removed as well.

### 5.4 Page Layout

The pedal editor page at `/pedal-editor` should accept an optional `id` query
param to edit an existing saved pedalboard:

- **With `id`:** Load the board from localStorage and populate the canvas.
- **Without `id`:** Start with an empty canvas.

Layout:
- Left side: Pedal palette (vertical list of available pedal types + "New Cable"
  button).
- Right side / main area: The `PedalBoardCanvas` — same component used on the
  pedal board page, but now with editing capabilities enabled.
- Top toolbar: Board name input, Save button, and a link to go back to the
  pedal board view (`/pedal-board?id=<id>`).

### 5.5 Shared Canvas Component

The `PedalBoardCanvas` is reused between the pedal board page and the pedal
editor. The editor-specific behaviors (adding/removing pedals and cables) are
driven by the parent page, not the canvas itself. The canvas remains responsible
for rendering and drag interactions. The parent page manages the pedals and
cables arrays and passes callbacks for add/remove operations.

### 5.6 Navigation Updates

Update the nav drawer:
- "New Pedal" link becomes "Pedal Editor" and points to `/pedal-editor`.
- Add a "Home" link at the top of the drawer that navigates to `/`.

---

## 6. Home Page — Saved Pedalboards

**Current state:** The home page displays three hardcoded stub boards and a
"New Pedalboard" card.

**Goal:** The home page is the central hub for managing all saved pedalboards.

### 6.1 Display Saved Boards

- Replace the `stubBoards` array with boards loaded from localStorage (using
  the same `pedalboards` key from section 4.2).
- Render each saved board as a `PedalBoardCard` in the existing grid layout.
- If there are no saved boards, show an empty state message
  (e.g. "No pedalboards yet. Create one to get started!").

### 6.2 Card Content

Each `PedalBoardCard` displays:
- **Name** — the user-given board name.
- **Description** — optional description (if one was saved).
- **Pedal summary** — a short line listing the pedal types on the board
  (e.g. "VOL → DIST → DELAY → OUT") so users can tell boards apart at a glance.

### 6.3 Card Actions

Each card has two actions:
- **Open** — navigates to `/pedal-board?id=<board-id>` to play the board.
- **Edit** — navigates to `/pedal-editor?id=<board-id>` to modify the board.
- **Delete** — removes the board from localStorage after a confirmation prompt.

### 6.4 New Pedalboard Card

The existing `NewPedalBoardCard` stays at the top. Clicking it navigates to
`/pedal-editor` (no id) to start building a new board from scratch.

---

## Implementation Order

These features have natural dependencies. A suggested order:

1. **Pedal visual polish** (1.1) — Update `BasePedal.draw()` and subclass colors.
   This is standalone and sets the visual foundation for everything else.
2. **Cable visual polish** (1.2) — Update `PatchCable.draw()`. Also standalone.
3. **Knob system** (3.1 – 3.4) — Add the knob data model, rendering, and
   interaction to `BasePedal` and existing pedals. This needs to land before new
   effects so they can define knobs from the start.
4. **New effects** (2.1 – 2.4) — Add Reverb, Delay, Chorus, Flanger. Each one
   is independent and can be done in any order.
5. **Save / Load** (4.1 – 4.4) — Persistence depends on having a stable pedal
   type registry, so it makes sense to do this after the new effects are added.
6. **Pedal Editor** (5.1 – 5.6) — Build the editor page. Depends on the knob
   system (so knobs are visible while editing) and on save/load (so boards can
   be persisted from the editor).
7. **Home Page** (6.1 – 6.4) — Wire up the home page to display saved boards.
   Depends on save/load being in place.
