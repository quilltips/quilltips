

# Fix: Remove Misleading "Books are shown below" Message

## Problem
The bottom of the public profile page shows a confusing guidance message that says "Books are shown below. Tipping will be available once the author completes their payment setup." This message appears because:

1. The page tries to fetch Stripe setup info from the `profiles` table, but RLS blocks unauthenticated users from reading it, so the query always fails
2. When the query fails, the component defaults to assuming Stripe is NOT set up
3. The fallback text then shows the "payment setup incomplete" message to every visitor
4. The text also says "below" when books are actually rendered above this message

## Solution
Remove this "Tip Guidance Text" paragraph entirely from `AuthorProfileContent.tsx`. It provides no value to readers visiting a public profile:

- If Stripe IS set up, the "Leave a tip!" buttons on book cards already make the flow obvious
- If Stripe is NOT set up, telling readers about the author's payment setup is unhelpful and potentially embarrassing for the author
- The directional reference ("below"/"above") is wrong regardless

## File Changes

**`src/components/author/AuthorProfileContent.tsx`** (lines 149-155)
- Remove the entire "Tip Guidance Text" paragraph block:
```tsx
// REMOVE THIS:
<p className="text-sm text-[#718096] text-center mt-4">
  {stripeOnboardingComplete
    ? "To send a tip, simply select a book from the Books section above..."
    : "Books are shown below. Tipping will be available once the author completes their payment setup."
  }
</p>
```

This is a simple, single-line deletion with no side effects. The `stripeOnboardingComplete` variable and related props can remain in place since they're also used by the `AuthorQRCodes` component to control whether tip buttons appear on book cards.

