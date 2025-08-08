# QR Code Configuration Documentation

This document outlines the critical configuration settings for Quilltips QR codes to ensure proper functionality and prevent layout issues.

## 🚨 Critical Configuration Settings

### QRCodeStatsCard Layout
**File**: `src/components/qr/QRCodeStatsCard.tsx`

#### Grid Layout
```tsx
// ✅ CORRECT - Use this exact grid configuration
<div className="grid xl:grid-cols-[3fr_2fr] gap-7 mx-auto">
```

#### QR Code Container
```tsx
// ✅ CORRECT - Gray background, proper sizing
<div className="bg-gray rounded-lg flex justify-center">
  <StyledQRCode
    ref={qrCodeRef}
    value={`${window.location.origin}/qr/${qrCode.id}`}
    showBranding={true}
    isPaid={isPaid}
    variant="screen"
    size={window.innerWidth < 768 ? 180 : 200} // ✅ Critical sizes
  />
</div>
```

#### Book Cover Layout
```tsx
// ✅ CORRECT - Aspect ratio with max-width constraint
<div className="aspect-[2/3] rounded-lg overflow-hidden relative max-w-xs mx-auto md:mx-0">
  <OptimizedImage
    key={imageRefreshKey}
    src={qrCode.cover_image || "/lovable-uploads/logo_nav.png"}
    alt={qrCode.book_title}
    className="w-full h-full"
    objectFit={qrCode.cover_image ? "cover" : "contain"}
    fallbackSrc="/lovable-uploads/logo_nav.png"
  />
  <BookCoverUpload 
    qrCodeId={qrCode.id}
    coverImage={qrCode.cover_image}
    bookTitle={qrCode.book_title}
    updateCoverImage={updateCoverImage}
  />
</div>
```

#### Stats Cards Styling
```tsx
// ✅ CORRECT - Dark theme with yellow accents
<Card className="p-4 md:p-5 bg-[#19363C] text-white">
  <p className="text-xs md:text-sm text-white/80 mb-2">Total Tips</p>
  <p className="text-2xl md:text-3xl font-bold text-[#FFD166]">{qrCode.total_tips || 0}</p>
</Card>
```

### StyledQRCode Component
**File**: `src/components/qr/StyledQRCode.tsx`

#### Download Variant Settings
```tsx
// ✅ CORRECT - These exact values for download variant
const cardWidth = isDownload ? 1200 : (isSmall ? size * 1.2 : 240);
const cardHeight = isDownload ? 1500 : (isSmall ? size * 1.7 : 320);
const qrSize = isDownload ? 980 : size;
const cardPaddingX = isDownload ? 8 : (isSmall ? 1 : 3);
const cardPaddingY = isDownload ? 5 : (isSmall ? 1 : 2);
const textFontSize = isDownload ? "text-7xl" : isSmall ? "text-[6px]" : "text-sm";
const brandingMaxWidth = isDownload ? "max-w-[750px]" : isSmall ? "max-w-[80px]" : "max-w-[150px]";
const qrPadding = isDownload ? 4 : (isSmall ? 0.5 : 2);
const logoPadding = isDownload ? "p-6" : isSmall ? "p-0.5" : "p-1.5";
const cardBorderRadius = isDownload ? "64px" : isSmall ? "0.75rem" : "1.5rem";
```

### PNG Download Configuration
**Files**: `QRCodeStatsCard.tsx`, `QRCodeSummary.tsx`, `QRCodeSuccessModal.tsx`

#### ✅ CORRECT PNG Settings
```tsx
const pngDataUrl = await toPng(downloadRef.current, {
  cacheBust: true,
  pixelRatio: 1,           // ✅ Critical: Use 1, not 2
  backgroundColor: null     // ✅ Critical: Use null, not "white"
});
```

### SVG Generation Configuration
**File**: `src/components/qr/generateBrandedQRCodeSVG.tsx`

#### ✅ CORRECT SVG Dimensions
```tsx
<svg
  width="600"           // ✅ Critical: Use 600, not 512
  height="800"          // ✅ Critical: Use 800, not 512
  viewBox="0 0 600 800" // ✅ Critical: Match width/height
  xmlns="http://www.w3.org/2000/svg"
>
```

#### ✅ CORRECT QR Code Positioning
```tsx
{/* QR Code (450x450) */}
<g transform="translate(75, 75)">
  <QRCodeSVG
    value={url}
    size={450}          // ✅ Critical: Use 450, not 350
    level="H"
    includeMargin={false}
    fgColor="#000000"
    bgColor="#ffffff"
  />
  {/* White circle behind logo */}
  <circle cx="225" cy="225" r="60" fill="white" />
  {/* Logo image */}
  <image
    href={base64Logo}
    x="180"
    y="180"
    width="80"
    height="80"
    preserveAspectRatio="xMidYMid meet"
  />
</g>
```

#### ✅ CORRECT Text Positioning
```tsx
<text
  x="300"
  y="600"
  textAnchor="middle"
  fontSize="40"         // ✅ Critical: Use 40, not 24
  className="playfair"
>
  Love this book? Tip &
</text>
<text
  x="300"
  y="655"
  textAnchor="middle"
  fontSize="40"
  className="playfair"
>
  message the author
</text>
<text
  x="300"
  y="710"
  textAnchor="middle"
  fontSize="40"
  fontWeight="bold"
  className="playfair"
>
  with Quilltips!
</text>
```

## 🚫 Common Issues to Avoid

### ❌ WRONG - Don't Use These Settings

#### Grid Layout
```tsx
// ❌ WRONG - Don't use equal columns
<div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
```

#### QR Code Sizing
```tsx
// ❌ WRONG - Don't use these sizes
size={window.innerWidth < 768 ? 140 : 160}  // Too small
size={window.innerWidth < 768 ? 180 : 220}  // Too large
```

#### PNG Download Settings
```tsx
// ❌ WRONG - Don't use these settings
const pngDataUrl = await toPng(downloadRef.current, {
  pixelRatio: 2,                    // Causes scaling issues
  backgroundColor: "white",         // Causes background issues
  width: 512,                       // Don't specify width
  height: 512,                      // Don't specify height
  style: {                          // Don't add transform styles
    transform: 'scale(1)',
    transformOrigin: 'top left'
  }
});
```

#### SVG Dimensions
```tsx
// ❌ WRONG - Don't use square dimensions
<svg
  width="512"           // Wrong: Should be 600
  height="512"          // Wrong: Should be 800
  viewBox="0 0 512 512" // Wrong: Should be 600x800
>
```

## 🔧 Component Dependencies

### Required Components
- `StyledQRCode` - Main QR code rendering component
- `QRCodeDownloadOptions` - Download dropdown menu
- `BookCoverUpload` - Cover image upload functionality
- `OptimizedImage` - Image display with fallbacks

### Required Hooks
- `useQRCheckout` - Stripe checkout functionality
- `useQRCodeDetailsPage` - QR code data management
- `useToast` - User notifications

## 📱 Responsive Behavior

### Mobile (< 768px)
- QR Code Size: 180px
- Grid: Single column layout
- Book Cover: Centered with max-width

### Desktop (≥ 768px)
- QR Code Size: 200px
- Grid: 3:2 ratio (3fr for left, 2fr for right)
- Book Cover: Left-aligned

### Extra Large (≥ 1280px)
- Grid: Maintains 3:2 ratio
- Better spacing and proportions

## 🎨 Visual Design

### Color Scheme
- **Primary Background**: `bg-[#19363C]` (Dark teal)
- **Accent Color**: `text-[#FFD166]` (Yellow)
- **Border Color**: `#333333` (Dark gray)
- **QR Background**: `bg-gray` (Light gray)

### Typography
- **Stats Labels**: `text-xs md:text-sm text-white/80`
- **Stats Values**: `text-2xl md:text-3xl font-bold text-[#FFD166]`
- **Book Title**: `text-base font-bold`
- **Book Details**: `text-base`

## 🚨 Troubleshooting Checklist

If QR codes are broken, check these in order:

1. **Grid Layout**: Ensure using `xl:grid-cols-[3fr_2fr]`
2. **QR Code Size**: Verify `180` mobile, `200` desktop
3. **PNG Settings**: Check `pixelRatio: 1` and `backgroundColor: null`
4. **SVG Dimensions**: Confirm `600x800` format
5. **Book Cover**: Verify `aspect-[2/3]` with `max-w-xs`
6. **Stats Styling**: Check dark theme with yellow accents
7. **URL Construction**: Use `${window.location.origin}/qr/${qrCode.id}`

## 📝 Version History

- **2024-01-XX**: Restored working configuration from GitHub history
- **Issue**: Lovable changes broke QR code layout and download functionality
- **Solution**: Reverted to proven working configuration documented above

---

**Note**: Any changes to QR code functionality should be tested thoroughly and this documentation should be updated accordingly.
