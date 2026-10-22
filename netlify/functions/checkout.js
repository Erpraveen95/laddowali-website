const { randomUUID } = require('crypto');

const WHATSAPP_NUMBER = (process.env.WHATSAPP_NUMBER || '919758711841').replace(/\D/g, '');
const catalog = {
  energy: { name: 'Energy Booster Laddu', price: 899 },
  millet: { name: 'Healthy Millet Laddu', price: 799 },
  dryfruit: { name: 'Dry Fruit Special', price: 1199 },
  festive: { name: 'Festive Special Box', price: 999 }
};

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: { Allow: 'POST', 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Method not allowed.' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Invalid request. Please try again.' }) };
  }

  const { customer, items } = body || {};
  if (!customer || !String(customer.name || '').trim() || !String(customer.phone || '').trim() || !String(customer.address || '').trim() || !Array.isArray(items) || !items.length) {
    return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Please provide your name, phone, delivery address and at least one item.' }) };
  }

  const cleanItems = [];
  for (const item of items) {
    const product = catalog[item.id];
    const qty = Number(item.quantity);
    if (!product || !Number.isInteger(qty) || qty < 1 || qty > 20) {
      return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'One or more cart items are invalid. Quantity must be between 1 and 20.' }) };
    }
    cleanItems.push({ ...product, id: item.id, quantity: qty, lineTotal: product.price * qty });
  }

  const total = cleanItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const orderRef = `LAD-${randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase()}`;
  const lines = cleanItems.map(item => `• ${item.name} × ${item.quantity} — ₹${item.lineTotal.toLocaleString('en-IN')}`).join('\n');
  const message = [
    `Hello Laddowali! I'd like to place an order.`,
    `Order reference: ${orderRef}`,
    '', lines, '',
    `Total: ₹${total.toLocaleString('en-IN')}`,
    '',
    `Name: ${String(customer.name).trim().slice(0, 120)}`,
    `Phone: ${String(customer.phone).trim().slice(0, 40)}`,
    `Address: ${String(customer.address).trim().slice(0, 500)}`,
    customer.note ? `Note: ${String(customer.note).trim().slice(0, 500)}` : '',
    '', 'Please confirm availability and delivery.'
  ].filter(Boolean).join('\n');

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    body: JSON.stringify({ orderRef, total, whatsappUrl: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}` })
  };
};
