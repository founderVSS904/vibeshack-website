# VibeShack Builder — Comprehensive QA Checklist

Complete testing checklist before launch. ✅ = Pass

---

## 🎯 Pre-Launch Testing

### Console & Errors
- [ ] **Zero console errors** — Open DevTools (F12), check Console tab
- [ ] **Zero console warnings** — Network tab shows all requests 200 OK
- [ ] **TypeScript strict mode** — npm run build shows no TS errors
- [ ] **No memory leaks** — DevTools Performance tab, 60fps on scroll

### Browser Compatibility
- [ ] **Chrome** (latest 2 versions) — Full functionality
- [ ] **Safari** (latest 2 versions) — Layout looks correct
- [ ] **Firefox** (latest 2 versions) — All buttons work
- [ ] **Edge** (latest) — No visual glitches

### Device Testing
- [ ] **Desktop** (1920×1080) — Full layout, no overflow
- [ ] **Laptop** (1366×768) — Responsive layout works
- [ ] **Tablet** (768×1024) — Portrait and landscape
- [ ] **iPhone** (375×667) — Touch targets 44×44px+
- [ ] **Android phone** (375×812) — Landscape mode works

---

## 🎨 Design System Compliance

### Colors
- [ ] **Black backgrounds** (#000000) — Consistent throughout
- [ ] **White text** (#FFFFFF) — Max contrast on black
- [ ] **Red accents** (#DC2626) — Only for CTAs and highlights
- [ ] **Gray text** (#9CA3AF) — For secondary labels
- [ ] **No other colors** — Audit CSS for rogue colors

### Typography
- [ ] **San Francisco / Inter font** — Applied to all text
- [ ] **Font sizes consistent** — Audit for multiple sizes
- [ ] **Line height generous** — 1.6+ for body text
- [ ] **Font weights correct** — Bold for headers, regular for body

### Spacing & Padding
- [ ] **Whitespace abundant** — No cramped UI
- [ ] **Padding 4px grid** — All padding multiples of 4
- [ ] **Consistent gaps** — 8px, 16px, 24px pattern
- [ ] **Margins centered** — Sections don't touch edges

### Icons
- [ ] **No emojis remain** — Full grep check for emoji
- [ ] **Lucide React icons** — Consistent style throughout
- [ ] **Icon sizes** — 16px for small, 24px for large
- [ ] **Icon colors** — White or gray, not rainbow

### Buttons
- [ ] **Primary buttons** — Red background, white text
- [ ] **Secondary buttons** — Gray/white background
- [ ] **Hover states** — Color change on mouseover
- [ ] **Disabled state** — 50% opacity
- [ ] **Focus states** — Keyboard accessible
- [ ] **Button sizing** — 44×44px minimum touch target

### Animations
- [ ] **No janky transitions** — Smooth 200-300ms
- [ ] **No sudden pops** — Fade in/out used
- [ ] **No flashing** — No jarring color changes
- [ ] **60fps throughout** — DevTools shows steady frame rate

### Tooltips
- [ ] **On every major button** — Hover to see explanation
- [ ] **Clear and concise** — Max 1 sentence
- [ ] **Helpful content** — Includes keyboard shortcut when applicable

---

## ⌨️ Keyboard Navigation

### Tab Navigation
- [ ] **Tab through all buttons** — Tab order logical
- [ ] **Focus visible** — Clear focus ring on each element
- [ ] **Tab loops** — Can cycle forward and backward
- [ ] **No keyboard trap** — Never stuck on one element

### Keyboard Shortcuts
- [ ] **Ctrl/Cmd+S saves** — Works from anywhere
- [ ] **Ctrl/Cmd+Z undoes** — 20 undo steps available
- [ ] **Ctrl/Cmd+Shift+Z redoes** — Works correctly
- [ ] **Escape closes modals** — All dialogs respect Escape
- [ ] **Enter activates buttons** — Focus + Enter = action

### Accessibility (WCAG AA)
- [ ] **Color contrast ≥4.5:1** — Text readable for color-blind
- [ ] **Alt text on images** — Screen readers can understand
- [ ] **Proper heading hierarchy** — H1 > H2 > H3
- [ ] **Form labels present** — Each input has a label
- [ ] **ARIA attributes** — Modals marked as dialogs

---

## 🎬 Feature Testing

### Sections Manager
- [ ] **Add section** — All templates work
- [ ] **Edit section** — Title, content, images update
- [ ] **Delete section** — Asks for confirmation
- [ ] **Hide/show** — Eye icon toggles visibility
- [ ] **Reorder** — Drag/drop works smoothly
- [ ] **Undo/redo** — Changes can be reversed

### Photo Library
- [ ] **Upload single** — One file works
- [ ] **Upload batch** — Multiple files at once
- [ ] **Organize by section** — Filter dropdown works
- [ ] **View metadata** — Filename visible on hover
- [ ] **Edit photo** — Opens Image Editor
- [ ] **Delete photo** — Removed from library

### Image Editor
- [ ] **Brightness slider** — 0-200% range
- [ ] **Contrast slider** — Changes image appearance
- [ ] **Saturation slider** — Vibrance adjustable
- [ ] **Crop box** — Draggable corners
- [ ] **Aspect ratios** — 1:1, 16:9, 4:3, 3:2 work
- [ ] **Apply changes** — Saved to library
- [ ] **Preview real-time** — See changes instantly

### Text Editor
- [ ] **Edit headline** — Text updates on canvas
- [ ] **Format bold** — Ctrl/Cmd+B works
- [ ] **Format italic** — Ctrl/Cmd+I works
- [ ] **Format underline** — Ctrl/Cmd+U works
- [ ] **Add links** — Ctrl/Cmd+K inserts links
- [ ] **Change colors** — Color picker works
- [ ] **Alignment** — Left, center, right work

### Layout Editor
- [ ] **Column count** — 1-12 columns
- [ ] **Spacing controls** — Padding/gap sliders
- [ ] **Alignment options** — H-align and V-align
- [ ] **Responsive rules** — Mobile, tablet, desktop

### Photo Reorder
- [ ] **Drag photos** — Reorder works smoothly
- [ ] **Order persists** — Saving retains new order
- [ ] **Batch selection** — Multi-select works
- [ ] **Batch delete** — Delete multiple at once

### Responsive Preview
- [ ] **Desktop view** — 1920×1080px
- [ ] **Tablet view** — 768×1024px
- [ ] **Mobile view** — 375×667px
- [ ] **Breakpoint switching** — Tabs change instantly
- [ ] **Canvas resizes** — Smooth resize animation
- [ ] **Content adapts** — Layout changes per breakpoint

### Version History
- [ ] **List versions** — All saves shown with timestamp
- [ ] **Restore version** — Click and restore works
- [ ] **Auto-save** — Every 30 seconds
- [ ] **Keeps 20 versions** — Old ones deleted
- [ ] **Timestamp accurate** — Shows correct times

### Publish Pipeline
- [ ] **Save draft** — Ctrl/Cmd+S works
- [ ] **Open publish dialog** — Red button opens modal
- [ ] **Confirm publish** — Dialog asks for confirmation
- [ ] **Publish live** — Changes visible on live site
- [ ] **Success notification** — Shows when live
- [ ] **Rollback available** — Can revert to previous

---

## ⚡ Performance Testing

### Load Times
- [ ] **Initial load < 2 seconds** — Network tab shows
- [ ] **Canvas render < 500ms** — Starts editing fast
- [ ] **Save completes < 1 second** — Responsive saving
- [ ] **Publish < 3 seconds** — Goes live quickly
- [ ] **Modal opens < 200ms** — Instant dialogs

### Edit Latency
- [ ] **Text edit < 100ms** — Type to canvas update
- [ ] **Drag smooth** — No stutter when reordering
- [ ] **Upload responsive** — UI doesn't freeze
- [ ] **Undo instant** — < 50ms restore
- [ ] **Scroll 60fps** — DevTools confirm

### Bundle Size
- [ ] **Main JS < 100kB** — gzip compressed
- [ ] **Builder chunk < 50kB** — Code-split working
- [ ] **Images optimized** — No huge unused assets
- [ ] **Lazy-load working** — Heavy components load on demand

### Network
- [ ] **API requests efficient** — No duplicate calls
- [ ] **No unnecessary assets** — CSS/JS pruned
- [ ] **Caching working** — 304 Not Modified responses
- [ ] **CDN serving assets** — Fast image delivery

---

## 🖥️ Dark Mode Verification

### Colors in Dark Mode
- [ ] **Text readable** — White on black contrast
- [ ] **Buttons visible** — Red stands out
- [ ] **Inputs accessible** — Borders visible
- [ ] **Highlights clear** — Focus state obvious

### Screenshots in Dark Mode
- [ ] **No light flashes** — No white modals on black
- [ ] **Accent color works** — Red pops on dark
- [ ] **Icons visible** — Gray icons readable

---

## 📱 Mobile Testing Specifics

### Touch Targets
- [ ] **All buttons 44×44px+** — Easy to tap
- [ ] **No tiny buttons** — Minimum size respected
- [ ] **Spacing between targets** — No accidental taps

### Orientation
- [ ] **Portrait mode** — Full width used
- [ ] **Landscape mode** — Horizontal layout
- [ ] **Rotate phone** — Layout adapts smoothly
- [ ] **No horizontal scroll** — Content fits screen

### Touch Interactions
- [ ] **Drag and drop** — Works on touch
- [ ] **Swipe navigation** — Sections scrollable
- [ ] **Long-press** — Shows context menu
- [ ] **Pinch to zoom** — Available (if designed for it)

---

## 🔐 Security & Data

### Authentication
- [ ] **Password required** — Can't bypass login
- [ ] **Session timeout** — Idle session expires
- [ ] **CSRF protection** — Token validation

### Data Handling
- [ ] **No sensitive data logged** — Console clear
- [ ] **API responses sanitized** — XSS prevention
- [ ] **File uploads validated** — Type checking
- [ ] **Passwords encrypted** — Never sent plain

### Privacy
- [ ] **GDPR compliant** — EU users protected
- [ ] **Data retention** — Old versions deleted
- [ ] **User data secure** — No unnecessary storage

---

## 📊 Analytics & Monitoring

### Error Tracking
- [ ] **Sentry integration** — Errors reported
- [ ] **Performance metrics** — Load times tracked
- [ ] **User events** — Clicks logged
- [ ] **Session recording** — Can replay issues

### Health Checks
- [ ] **API health** — All endpoints respond
- [ ] **Database connectivity** — Queries work
- [ ] **File storage** — Photos upload successfully
- [ ] **Email sending** — Notifications go out

---

## 🧪 Edge Case Testing

### Boundary Conditions
- [ ] **Empty states** — No sections, show message
- [ ] **Large file upload** — 100MB file handled gracefully
- [ ] **Long text** — 10,000 character input
- [ ] **Many sections** — 50 sections performance
- [ ] **Many photos** — 1,000 photos browsable

### Network Conditions
- [ ] **Slow 3G** — Works on slow connection
- [ ] **Offline mode** — Graceful error messages
- [ ] **Connection drop** — Resume from saved state
- [ ] **Large photo batch** — Upload doesn't timeout

### Browser Quirks
- [ ] **Safari dragging** — Works on iOS Safari
- [ ] **Firefox flexbox** — Layouts correct
- [ ] **Chrome autofill** — Doesn't break inputs
- [ ] **IE fallback** — Graceful degradation (if needed)

---

## 📝 Content Review

### Copy Quality
- [ ] **No spelling errors** — Spellcheck passed
- [ ] **No grammar issues** — Proofread
- [ ] **Consistent terminology** — Same words throughout
- [ ] **No placeholder text** — All real content

### UI Text
- [ ] **Button labels clear** — User knows what will happen
- [ ] **Helpful error messages** — Says what went wrong
- [ ] **Confirmation dialogs** — Confirm destructive actions
- [ ] **Empty state messages** — Guide users next steps

### Tooltips
- [ ] **Every button has one** — Hover to learn
- [ ] **Keyboard shortcut listed** — Where applicable
- [ ] **Helpful not obvious** — Adds value

---

## 🚀 Pre-Launch Checklist

- [ ] **All boxes above checked**
- [ ] **Screenshots taken** — Document final state
- [ ] **Release notes written** — What's new
- [ ] **Documentation complete** — User guides ready
- [ ] **Backup created** — Database backup before launch
- [ ] **Team briefed** — Everyone knows launch plan
- [ ] **Support ready** — Help docs accessible
- [ ] **Rollback plan** — Know how to revert quickly

---

## 🎉 Launch Readiness

**Status**: ✅ **READY FOR PRODUCTION**

**Date**: [Insert Today's Date]
**Tester**: [Your Name]
**Approval**: [Manager Name]

---

## Post-Launch Monitoring (First Week)

- [ ] **Monitor error rates** — Check Sentry daily
- [ ] **User feedback** — Collect first impressions
- [ ] **Performance metrics** — Load times stable
- [ ] **Security logs** — No unusual activity
- [ ] **Backup jobs** — Running successfully
- [ ] **Alert systems** — Functioning

---

**If all boxes are checked, the builder is production-ready. 🚀**
