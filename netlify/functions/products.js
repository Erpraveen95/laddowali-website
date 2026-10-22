const catalog = {
  energy: { name: 'Energy Booster Laddu', price: 899 },
  millet: { name: 'Healthy Millet Laddu', price: 799 },
  dryfruit: { name: 'Dry Fruit Special', price: 1199 },
  festive: { name: 'Festive Special Box', price: 999 }
};

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers: { Allow: 'GET', 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Method not allowed.' }) };
  }
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' },
    body: JSON.stringify(Object.entries(catalog).map(([id, product]) => ({ id, ...product, unit: id === 'festive' ? 'box' : 'kg' })))
  };
};
