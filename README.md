# Apex-Demo
Demo website for a car detailing business: a premium, responsive single page with service listings, a gallery, a before/after slider and a WhatsApp booking form. Built with plain HTML, CSS and JavaScript. Placeholder content only.

## Features

- Responsive layout with sticky navigation and a mobile menu
- Service list with expandable details (Full Valet, Interior Deep Clean, Ceramic Coating, Paint Correction)
- Gallery with category filters and a lightbox with previous and next controls
- Before and after comparison slider (mouse, touch and keyboard)
- Booking form with validation that prepares a WhatsApp message
- Testimonials carousel (clearly labelled demo content) and FAQ accordion
- Accessibility basics: semantic HTML, keyboard navigation, visible focus states, reduced-motion support

## Tech

Plain HTML, CSS and JavaScript. No frameworks and no build step. Fonts (Cormorant Garamond and Manrope) load from Google Fonts, with system fallbacks.

## Run locally

Download the files and open `index.html` in a browser.

```
apex-detailing/
├── index.html
├── styles.css
└── script.js
```

## Customising for a real business

1. Set `WHATSAPP_NUMBER` at the top of `script.js` to the business's number (international format, digits only, for example
