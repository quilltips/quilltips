
# Rename Public Feed to "Fanmail" and Include Reader Messages

## Overview

Transform the public "Feed" sections (on both individual book pages and author profile pages) from a tip-centric feed into a "Fanmail" feed that shows reader messages -- both from tips that include messages and from direct fanmail submissions. Add a "Keep this message private" option to the direct message form (it already exists on the tip form). Exclude private messages from the public Fanmail feed.

## Current State

- The public feed only shows data from `public_tips` table, which only contains tips with `amount > 0`
- Direct messages (amount = 0) are always stored as `is_private: true` in the `tips` table and never appear publicly
- The `sync_to_public_tips` database trigger explicitly deletes entries with `amount = 0` from `public_tips`
- The tip form already has a "Keep this tip private" checkbox
- The direct message form (`MessageForm.tsx`) has no privacy option -- messages are always private
- Feed items display as "{name} sent a tip for {book}!"

## What Changes

### 1. Database: Update `sync_to_public_tips` Trigger

Currently, the trigger only syncs tips where `amount > 0`. It needs to also sync messages (`amount = 0`) **when they are not private** (`is_private = false`). This allows non-private fanmail messages to appear in the public feed alongside tips that have messages.

Changes to the trigger logic:
- Remove the `amount > 0` guard
- Instead, only sync entries where `is_private = false` (or `is_private IS NULL`)
- Delete from `public_tips` if `is_private = true`

### 2. Edge Function: Update `send-message-to-author`

Currently hardcodes `is_private: true` for all messages. Update to accept an `isPrivate` parameter from the frontend and default to `false` (public) so fanmail appears in the feed by default unless the reader opts out.

### 3. MessageForm.tsx: Add Privacy Checkbox

Add a "Keep this message private" checkbox (same styling as the tip form's checkbox) to the direct message form. Pass the `isPrivate` value to the edge function.

### 4. Public Feed Components: Rename and Restyle

**AuthorPublicTipFeed.tsx** (author profile page feed):
- Rename section from "Feed" to "Fanmail" in the parent `AuthorProfileContent.tsx`
- Change item text from "{name} sent a tip for {book}!" to "{name} sent fanmail!"
- Show the message below (already shown when present)
- Keep the comment button and timestamp
- Filter out entries where `is_private = true` (already handled by `public_tips` table, which will now also contain non-private messages)
- Update empty state text from "No tips yet." to "No fanmail yet."

**PublicTipHistory.tsx** (individual book page feed):
- Change item text from "{name} sent a tip for {book}!" to "{name} sent fanmail!"
- Show the message below
- Keep comment button and timestamp
- Update empty state text from "Nothing here yet... be the first to engage!" to "No fanmail yet. Be the first to send a message!"

**QRCodeDetails.tsx** (book page):
- Rename section header from "Feed" to "Fanmail"
- Update mobile nav label from "Feed" to "Fanmail"

**AuthorProfileContent.tsx** (author profile page):
- Rename CardTitle from "Feed" to "Fanmail"

### 5. TipDetailsDialog.tsx: Update Language

When opened from the Fanmail feed, the dialog should use fanmail language instead of tip language. The header already adapts for $0 messages vs tips, so this mostly works. No major changes needed here.

## Files to Modify

| File | Change |
|------|--------|
| DB Migration | Update `sync_to_public_tips` trigger to include non-private messages |
| `supabase/functions/send-message-to-author/index.ts` | Accept `isPrivate` param, default to `false` |
| `src/components/MessageForm.tsx` | Add "Keep this message private" checkbox, pass to edge function |
| `src/components/tips/AuthorPublicTipFeed.tsx` | Change item text to "sent fanmail!", update empty state |
| `src/components/tips/PublicTipHistory.tsx` | Change item text to "sent fanmail!", update empty state |
| `src/pages/QRCodeDetails.tsx` | Rename "Feed" header to "Fanmail", update mobile nav label |
| `src/components/author/AuthorProfileContent.tsx` | Rename "Feed" CardTitle to "Fanmail" |

## Technical Details

### Updated Trigger Logic

```text
sync_to_public_tips trigger:
  ON INSERT/UPDATE:
    IF is_private = false (or NULL defaults to false):
      -> UPSERT into public_tips
    ELSE (is_private = true):
      -> DELETE from public_tips if exists
  ON DELETE:
    -> DELETE from public_tips
```

This means both tips (amount > 0) and messages (amount = 0) will appear in public_tips as long as `is_private` is false.

### Feed Item Display

```text
Before: "{firstName} sent a tip for "{bookTitle}"!"
After:  "{firstName} sent fanmail!"
        "{message text}" (if present, shown below)
        [comment button] [timestamp]
```

### Privacy Flow for Direct Messages

```text
Reader opens message form
  -> Sees "Keep this message private" checkbox (unchecked by default)
  -> Submits form
  -> Edge function stores with is_private = false (or true if checked)
  -> Trigger syncs to public_tips if is_private = false
  -> Message appears in Fanmail feed
```

### Backward Compatibility

- Existing $0 messages are all stored as `is_private: true`, so they will remain private and not suddenly appear in the feed
- Only new messages submitted after this change (with the checkbox unchecked) will appear publicly
- Existing tips with `amount > 0` and `is_private = false` will continue to appear in the feed as fanmail
