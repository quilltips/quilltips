

## Redesign Bonus Content Intake Flow + Move Book Description to Core Field

This plan has two main parts: (1) replacing the current vertical list layout for bonus content with a horizontal tile-based layout inspired by the reference image, and (2) moving Book Description from a bonus content item to a core book field.

---

### Part 1: New Horizontal Content Tiles in QRCodeStatsCard

**Current state:** The "Bonus Content" section sits at the bottom of the page in a full-width card, using `EnhancementsManager` which renders a vertical list of rows (Videos, Letter to Readers, Book Description, Character Art, Signup Forms, Bookshelf) with a + button on each row. Clicking + opens a dialog.

**New design:** Replace the full-width card at the bottom with a horizontal row of content tiles at the top of the page (above the two-column grid), matching the reference image. Each tile shows a label and a golden + button. Tiles that already have content show a checkmark or filled state instead of just a +.

**Layout:** A section titled "Add Content To Your Book Page" with tiles laid out horizontally (scrollable on mobile, wrapped on desktop). The tiles are:
- Videos
- Book Art
- Letter to Readers
- Bookshelf
- Signup Forms

(Book Description is removed from this list -- see Part 2)

Clicking a tile's + button opens the same dialog that currently exists in `EnhancementsManager`, so all the editing/saving logic stays the same.

When a content type already has content added (e.g., videos uploaded, bookshelf has entries), the tile visually indicates this (e.g., a checkmark overlay or a different background shade) and clicking it opens the management dialog for that content.

**Files to modify:**
- `src/components/qr/QRCodeStatsCard.tsx` -- Remove the bottom "Bonus Content" card, add the new horizontal tile section above the two-column grid
- `src/components/book/EnhancementsManager.tsx` -- Remove "description" from the section rows list. Adjust the component to support the new horizontal tile layout (export a new presentation or refactor the existing one to render tiles instead of vertical rows)

---

### Part 2: Move Book Description to Core Field

**Current state:** `book_description` is managed as part of "Bonus Content" in `EnhancementsManager`, both during book creation (`CreateQRCode.tsx`) and on the book management page (`QRCodeStatsCard.tsx`).

**Changes:**

#### A. Book Creation Flow (`CreateQRCode.tsx`)
- Move the Book Description textarea out of the collapsible "Bonus Content" section
- Place it as an optional field in the main form, after the Buy Now Link field and before the Cover Image upload
- Label it "Book Description (optional)"
- Remove it from the enhancements collapsible

#### B. Book Management Page (`QRCodeStatsCard.tsx`)
- Add a Book Description edit section to the left-side book card, right below the Buy Now Link section
- Use the same inline edit pattern as the Buy Now Link (show current text, click Edit to expand a textarea, Save/Cancel buttons)
- The field auto-saves or saves on button click, updating `book_description` in the `qr_codes` table

#### C. EnhancementsManager
- Remove the "description" entry from `sectionRows` and the corresponding dialog content for `openSection === "description"`
- Remove `book_description` from `initialData` prop type and internal state
- Remove auto-save for `bookDesc`

---

### Technical Details

#### QRCodeStatsCard.tsx changes:
1. Add new "Add Content" tile section above the grid:
   ```text
   +--------------------------------------------------+
   |   Add Content To Your Book Page                   |
   |  [Videos +] [Book Art +] [Letter +] [Shelf +] .. |
   +--------------------------------------------------+
   |  Left Card (cover, details)  |  Right (Share, Activity) |
   ```
2. Each tile: a small card/button with the content type name and a `#FFD166` plus icon below it, styled similarly to the reference image
3. On mobile: tiles scroll horizontally or wrap into 2-3 columns
4. Add Book Description textarea below the Buy Now Link section in the left card, with inline edit behavior
5. Remove the full-width "Bonus Content" card at the bottom

#### EnhancementsManager.tsx changes:
1. Remove "description" from `sectionRows` array
2. Remove `bookDesc` state, `book_description` from `initialData`, and auto-save logic for it
3. Remove `openSection === "description"` dialog content
4. Update `saveEnhancements` to no longer include `book_description`
5. Change the layout from vertical list rows to a horizontal tile grid:
   - Each tile is a clickable card with the label centered and a `#FFD166` + circle below
   - Tiles that have content show an indicator (count badge or checkmark)

#### CreateQRCode.tsx changes:
1. Move the Book Description textarea from inside the `CollapsibleContent` (enhancements) to the main form body, after the Buy Now Link input
2. Keep it as a simple `Textarea` with "(optional)" label
3. Remove the book description section from inside the collapsible enhancements area

#### Edge function build errors:
The build errors listed are pre-existing issues in edge functions (TypeScript type errors in `platform-webhook`, `stripe-webhook`, `create-tip-checkout`, `create-qr-checkout`, and missing npm packages in `send-message-to-author` and `send-password-reset`). These are unrelated to this feature change and won't be addressed in this plan.

