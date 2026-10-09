# Laddowali Store — Node.js + Express + Render

A responsive storefront landing page based on the supplied Laddowali brochure. Includes a product grid, cart, checkout form, Express validation endpoint, and WhatsApp order handoff.

## Features
- Mobile-friendly landing page, brand story, products and contact section
- Shopping bag with quantity controls and live subtotal
- Checkout form for name, phone and delivery address
- `POST /api/checkout` validates order items and returns a prefilled WhatsApp URL
- No payment gateway or database required; customers send the final order in WhatsApp
- Render deployment configuration included

## Run locally
Requirements: Node.js 18 or newer.

```bash
npm install
npm start
```

Open http://localhost:3000

## Deploy to Render free web service
1. Create a GitHub repository and upload the project files.
2. Sign in to Render and choose **New + → Web Service**.
3. Connect your GitHub repository.
4. Use:
   - **Runtime:** Node
   - **Build command:** `npm install`
   - **Start command:** `npm start`
5. Add environment variable `WHATSAPP_NUMBER` with your business WhatsApp number in international format, digits only. Example for India: `919758711841`.
6. Deploy. Render will provide a public `onrender.com` URL.

The included `render.yaml` can also be used as a Render Blueprint.

## Change products and prices
Update the `catalog` object in `server.js` and the `PRODUCTS` object in `public/app.js`, plus the product card content in `public/index.html`. Keep IDs consistent.

## WhatsApp number
The supplied brochure shows WhatsApp `9758711841`; the default is configured as `919758711841`. Confirm that this is the correct business WhatsApp number before going live. You can override it in Render using `WHATSAPP_NUMBER`.

## Important notes
- This is WhatsApp checkout, not online payment. Customers review the prefilled message and tap Send in WhatsApp; you then confirm availability, delivery charges, payment and dispatch.
- Orders are not stored in a database and no payment details are collected.
- Before launch, verify product prices, pack sizes, ingredients, allergen notes, delivery areas, business contact details and all health/nutrition claims.
- The supplied brochure images have been included as local assets for the visual theme. Replace cropped images with original product photos when available for a more polished storefront.
