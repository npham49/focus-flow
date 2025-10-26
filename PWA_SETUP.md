# PWA Notification Setup Guide

This project now implements a full Progressive Web App (PWA) with push notifications following the Next.js PWA guide.

## What's New

### 1. Web App Manifest (`app/manifest.ts`)

- Defines the PWA metadata including name, icons, and display mode
- Allows the app to be installed on mobile devices and desktops

### 2. Service Worker (`public/sw.js`)

- Handles push notification events
- Shows notifications when they arrive
- Handles notification clicks to open the app

### 3. Server Actions (`app/actions.ts`)

- Manages push notification subscriptions
- Sends notifications using the Web Push protocol
- Uses VAPID keys for authentication

### 4. Updated Pomodoro Timer

- Now uses the PWA notification system instead of basic browser notifications
- Automatically registers the service worker on load
- Allows subscribing/unsubscribing from notifications with a single click

## How to Test Locally

1. **Run the app with HTTPS** (required for PWA features):

   ```bash
   npm run dev -- --experimental-https
   # or
   pnpm dev --experimental-https
   ```

2. **Enable notifications**:

   - Click the bell icon in the Pomodoro timer
   - Allow notifications when prompted by your browser

3. **Test the timer**:
   - Start a work session
   - Wait for it to complete (or set a short duration in settings)
   - You should receive a push notification

## Browser Support

- ✅ Chrome/Edge (Desktop & Mobile)
- ✅ Firefox (Desktop & Mobile)
- ✅ Safari 16+ on macOS 13+
- ✅ iOS 16.4+ (when installed to home screen)

## Environment Variables

The following variables are set in `.env.local`:

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key
```

**Note**: These keys are already generated and stored. Do not commit `.env.local` to version control.

## Security Headers

The app now includes security headers for PWA protection:

- `X-Content-Type-Options: nosniff` - Prevents MIME type sniffing
- `X-Frame-Options: DENY` - Protects against clickjacking
- `Referrer-Policy: strict-origin-when-cross-origin` - Controls referrer information

Service worker has additional CSP headers to ensure it only loads scripts from the same origin.

## Icons

Currently using placeholder SVG icons. For production:

1. Visit https://realfavicongenerator.net/
2. Upload your logo
3. Generate PWA icons
4. Replace `/public/icon-192x192.svg` and `/public/icon-512x512.svg` with the generated PNG files
5. Update `app/manifest.ts` to reference `.png` files instead of `.svg`

## Production Considerations

For production deployment:

1. **Database Storage**: Update `app/actions.ts` to store subscriptions in a database instead of memory
2. **User Authentication**: Associate subscriptions with user accounts
3. **Real Icons**: Replace placeholder SVG icons with proper PNG icons
4. **Email**: Update the email in `app/actions.ts` to your actual contact email
5. **HTTPS**: Ensure your production server uses HTTPS (required for PWA)

## Troubleshooting

### Notifications not showing?

- Check browser console for errors
- Verify you're running with HTTPS locally
- Check browser notification permissions (not blocked globally)
- Try a different browser to isolate browser-specific issues

### Service worker not registering?

- Check the browser console for registration errors
- Ensure `/sw.js` is accessible at the root of your domain
- Clear browser cache and reload

### Push subscription failing?

- Verify VAPID keys are set correctly in `.env.local`
- Check that the service worker is registered and active
- Ensure notification permission is granted

## References

- [Next.js PWA Guide](https://nextjs.org/docs/app/guides/progressive-web-apps)
- [Web Push Protocol](https://developers.google.com/web/fundamentals/push-notifications)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
