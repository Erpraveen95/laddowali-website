const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const WHATSAPP_NUMBER = (process.env.WHATSAPP_NUMBER || "919758711841").replace(/\D/g, "");

app.use(express.json({ limit: "100kb" }));
app.use(express.static(path.join(__dirname, "public")));

const catalog = {
  energy: { name: "Energy Booster Laddu", price: 899 },
  millet: { name: "Healthy Millet Laddu", price: 799 },
  dryfruit: { name: "Dry Fruit Special", price: 1199 },
  festive: { name: "Festive Special Box", price: 999 }
};

app.get("/api/products", (_req, res) => {
  res.json(Object.entries(catalog).map(([id, p]) => ({ id, ...p, unit: "kg/box" })));
});

app.post("/api/checkout", (req, res) => {
  const { customer, items } = req.body || {};
  if (!customer || !customer.name || !customer.phone || !customer.address || !Array.isArray(items) || !items.length) {
    return res.status(400).json({ error: "Please provide your name, phone, delivery address and at least one item." });
  }

  const cleanItems = [];
  for (const item of items) {
    const product = catalog[item.id];
    const qty = Number(item.quantity);
    if (!product || !Number.isInteger(qty) || qty < 1 || qty > 20) {
      return res.status(400).json({ error: "One or more cart items are invalid. Quantity must be between 1 and 20." });
    }
    cleanItems.push({ ...product, id: item.id, quantity: qty, lineTotal: product.price * qty });
  }

  const total = cleanItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const orderRef = `LAD-${Date.now().toString().slice(-8)}`;
  const lines = cleanItems.map(i => `• ${i.name} × ${i.quantity} — ₹${i.lineTotal.toLocaleString("en-IN")}`).join("\n");
  const message = [
    `Hello Laddowali! I'd like to place an order.`,
    `Order reference: ${orderRef}`,
    "",
    lines,
    "",
    `Total: ₹${total.toLocaleString("en-IN")}`,
    "",
    `Name: ${String(customer.name).trim()}`,
    `Phone: ${String(customer.phone).trim()}`,
    `Address: ${String(customer.address).trim()}`,
    customer.note ? `Note: ${String(customer.note).trim()}` : "",
    "",
    "Please confirm availability and delivery."
  ].filter(Boolean).join("\n");

  res.json({
    orderRef,
    total,
    whatsappUrl: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
  });
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => console.log(`Laddowali store running on port ${PORT}`));
