# Video Integration Guide

## Where to Save Your Video

1. **File Location**: Save your video file as `quilltips-demo.mp4` in the `public/lovable-uploads/` directory
2. **Path**: The full path should be `public/lovable-uploads/quilltips-demo.mp4`

## Video Optimization Recommendations

### Format & Compression
- **Format**: MP4 with H.264 codec (widely supported)
- **Resolution**: 720p or 1080p max (don't go higher for web)
- **Frame Rate**: 24-30 fps
- **Bitrate**: 1-2 Mbps for 720p, 2-4 Mbps for 1080p

### File Size Optimization
- **Target Size**: Keep under 10MB for fast loading
- **Duration**: 15-30 seconds works best for hero sections
- **Compression**: Use tools like HandBrake or FFmpeg

### Content Guidelines
- **Aspect Ratio**: 16:9 or 4:3 works well
- **Content**: Show the QR code creation process and reader interaction
- **Branding**: Include Quilltips branding/colors
- **Call-to-Action**: End with a clear CTA

## Technical Features Implemented

### Responsive Design
- ✅ Automatically scales on mobile and desktop
- ✅ Maintains aspect ratio across devices
- ✅ Optimized for different screen sizes

### Performance Features
- ✅ Lazy loading with poster image
- ✅ Auto-play with mute (browser compliant)
- ✅ Loop functionality
- ✅ Custom controls overlay
- ✅ Touch-friendly on mobile

### User Experience
- ✅ Smooth hover controls
- ✅ Play/pause functionality
- ✅ Mute/unmute toggle
- ✅ Fallback poster image
- ✅ Accessible controls

## Fallback Options

If the video doesn't load, the component will:
1. Show the poster image (`53780611-3882-4448-90cd-a7f0388741ea.png`)
2. Display a play button overlay
3. Allow manual play/pause interaction

## Testing Checklist

- [ ] Video loads on desktop
- [ ] Video loads on mobile
- [ ] Auto-play works (muted)
- [ ] Controls appear on hover
- [ ] Play/pause buttons work
- [ ] Mute/unmute works
- [ ] Video loops properly
- [ ] Poster image shows before video loads
- [ ] Responsive sizing works
- [ ] Performance is good (fast load)

## Alternative Video Formats

If you prefer different formats, you can also use:
- WebM: `quilltips-demo.webm` (better compression)
- Multiple sources for better browser support

## Need Help?

If you need help with video optimization or have questions about the integration, let me know! 