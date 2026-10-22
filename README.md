# Laddowali Store — Netlify + WhatsApp checkout

A responsive Laddowali storefront with product cards, shopping bag, checkout form, server-side validation, unique order references, and a prefilled WhatsApp order message.

## Recommended hosting: Netlify

This project is configured to serve the website from Netlify's CDN and run the checkout API using Netlify Functions. It does not need an always-running Express server, so it avoids the Render free web-service sleep behavior.

### Deploy from GitHub
1. Upload the contents of this project folder to your GitHub repository (not the ZIP file itself).
2. Sign in at https://app.netlify.com/ and choose **Add new site → Import an existing project**.
3. Connect GitHub and select the Laddowali repository.
4. Netlify should read `netlify.toml` automatically. Confirm the publish directory is `public` and the build command is the one in `netlify.toml`.
5. In the site's environment variables, add `WHATSAPP_NUMBER` with the business WhatsApp number in international format, digits only (example: `919758711841`).
6. Deploy the site. After deployment, test adding an item to the cart and preparing a WhatsApp order.

Netlify Functions are deployed with the site. The `/api/checkout` URL is rewritten to the checkout function, and `/api/products` to the products function.

## Run locally with Express

Requirements: Node.js 18 or newer.

```bash
npm install
npm start
```

Open http://localhost:3000. The included `server.js` keeps local development and an optional Render deployment available.

## Important order notes
- Checkout creates a short UUID-based reference such as `LAD-A83F21C94D07` and opens WhatsApp with a prefilled message.
- The customer must tap **Send** in WhatsApp. A generated reference does not mean the order is confirmed.
- Orders are not saved in a database, and no online payment is collected. Add a database if you need a permanent order history/admin dashboard.
- Confirm the business WhatsApp number, product prices, pack sizes, ingredients, allergen notes, delivery areas, and all nutrition claims before launch.
