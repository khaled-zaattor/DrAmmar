# Home-screen app

The customer website uses one web app manifest for Android and iPhone. It opens at `/#booking` in standalone mode and uses icons prepared from the existing shop logo.

## Booking confirmation

- The installation card is rendered inside `ConfirmationScreen` after a successful booking response.
- Android shows **Install app** only when the browser has supplied `beforeinstallprompt`. The event is captured at application startup and invoked directly by the button click. The customer must confirm the browser's installation dialog. If the event is unavailable, no inactive install button is shown.
- iPhone/iPad shows **How to save on iPhone**, with expandable Safari instructions. iOS requires the customer to use Share → Add to Home Screen → Add. Website JavaScript cannot perform those steps.
- **Maybe later** and native prompt dismissal hide the card for the browser session. Storage failures do not affect booking or in-memory dismissal.
- The card is hidden in standalone mode and after `appinstalled`. iOS does not expose whether a separate Safari visit already has a home-screen installation.

## Build and deployment

Run `npm run build` and deploy the complete `dist/` directory, including `manifest.webmanifest` and `icons/`, to the existing HTTPS website. No backend change or additional package is required. Ensure the host serves the manifest and PNG files as static assets, rather than the SPA HTML fallback. The app identity and URLs assume deployment at the domain root.

No service worker or offline caching is added. Current browsers do not require a service worker for manifest-based installation. Booking and availability continue to require the network, and no appointment responses are cached by this feature.

Run `npm test` for installation lifecycle and card behavior tests. For physical-device acceptance, complete a booking on the HTTPS site in Android Chrome and iPhone Safari, follow each platform's save flow, then launch the new home-screen icon and check the booking section opens. Private browsing, embedded browsers and browser installation eligibility can prevent Android's native install offer.

References: [MDN installability requirements](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable), [MDN custom installation prompts](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/How_to/Trigger_install_prompt), [Apple home-screen web apps](https://support.apple.com/guide/iphone/iphea86e5236/ios).
