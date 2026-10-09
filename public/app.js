const PRODUCTS = {
  energy: { name: "Energy Booster Laddu", price: 899, unit: "kg" },
  millet: { name: "Healthy Millet Laddu", price: 799, unit: "kg" },
  dryfruit: { name: "Dry Fruit Special", price: 1199, unit: "kg" },
  festive: { name: "Festive Special Box", price: 999, unit: "box" }
};
const cart = new Map();
const $ = (selector) => document.querySelector(selector);
const money = (amount) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
const cartDrawer = $("#cartDrawer");
const cartOverlay = $("#cartOverlay");
const checkoutModal = $("#checkoutModal");
let toastTimer;

function toast(message) {
  const el = $("#toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 2500);
}
function countItems() {
  return [...cart.values()].reduce((sum, item) => sum + item.quantity, 0);
}
function total() {
  return [...cart.values()].reduce((sum, item) => sum + PRODUCTS[item.id].price * item.quantity, 0);
}
function renderCart() {
  const count = countItems();
  $("#cartCount").textContent = count;
  $("#drawerCount").textContent = `(${count})`;
  $("#subtotal").textContent = money(total());
  $("#checkoutSubtotal").textContent = money(total());
  $("#checkoutButton").disabled = count === 0;
  const entries = [...cart.values()];
  if (!entries.length) {
    $("#cartItems").innerHTML = `<div class="empty-cart"><span>♡</span><h3>Your bag is waiting.</h3><p>Add a little sweetness to get started.</p><button class="btn btn-dark" id="continueShopping">Explore the shop</button></div>`;
    $("#continueShopping").addEventListener("click", closeCart);
    return;
  }
  $("#cartItems").innerHTML = entries.map(({ id, quantity }) => {
    const product = PRODUCTS[id];
    return `<div class="cart-line">
      <div><h3>${product.name}</h3><small>${money(product.price)} / ${product.unit}</small>
      <div class="quantity-controls"><button data-change="${id}" data-delta="-1" aria-label="Decrease quantity">−</button><span>${quantity}</span><button data-change="${id}" data-delta="1" aria-label="Increase quantity">+</button><button class="remove-item" data-remove="${id}">Remove</button></div></div>
      <div class="cart-line-total">${money(product.price * quantity)}</div>
    </div>`;
  }).join("");
  $("#cartItems").querySelectorAll("[data-change]").forEach(button => button.addEventListener("click", () => {
    const id = button.dataset.change, delta = Number(button.dataset.delta);
    const next = (cart.get(id)?.quantity || 0) + delta;
    if (next <= 0) cart.delete(id);
    else if (next <= 20) cart.set(id, { id, quantity: next });
    else toast("Maximum quantity is 20 per item.");
    renderCart();
  }));
  $("#cartItems").querySelectorAll("[data-remove]").forEach(button => button.addEventListener("click", () => {
    cart.delete(button.dataset.remove); renderCart();
  }));
}
function openCart() {
  cartDrawer.classList.add("show"); cartOverlay.classList.add("show");
  cartDrawer.setAttribute("aria-hidden", "false"); document.body.classList.add("locked");
}
function closeCart() {
  cartDrawer.classList.remove("show"); cartOverlay.classList.remove("show");
  cartDrawer.setAttribute("aria-hidden", "true");
  if (!checkoutModal.classList.contains("show")) document.body.classList.remove("locked");
}
function openCheckout() {
  if (!countItems()) return;
  closeCart(); checkoutModal.classList.add("show"); document.body.classList.add("locked");
  $("#formError").textContent = "";
}
function closeCheckout() {
  checkoutModal.classList.remove("show"); document.body.classList.remove("locked");
}
document.querySelectorAll("[data-add]").forEach(button => button.addEventListener("click", () => {
  const id = button.dataset.add;
  const current = cart.get(id)?.quantity || 0;
  if (current >= 20) return toast("Maximum quantity is 20 per item.");
  cart.set(id, { id, quantity: current + 1 });
  renderCart(); toast(`${PRODUCTS[id].name} added to your bag.`);
}));
$("#openCart").addEventListener("click", openCart);
$("#closeCart").addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);
$("#checkoutButton").addEventListener("click", openCheckout);
$("#closeCheckout").addEventListener("click", closeCheckout);
checkoutModal.addEventListener("click", e => { if (e.target === checkoutModal) closeCheckout(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") { closeCheckout(); closeCart(); } });
$("#menuToggle").addEventListener("click", () => $("#nav").classList.toggle("open"));
$("#nav").querySelectorAll("a").forEach(a => a.addEventListener("click", () => $("#nav").classList.remove("open")));
$("#year").textContent = new Date().getFullYear();

$("#checkoutForm").addEventListener("submit", async event => {
  event.preventDefault();
  const button = $("#placeOrder");
  const form = new FormData(event.currentTarget);
  const customer = {
    name: String(form.get("name") || "").trim(),
    phone: String(form.get("phone") || "").trim(),
    address: String(form.get("address") || "").trim(),
    note: String(form.get("note") || "").trim()
  };
  const items = [...cart.values()];
  if (!items.length) return $("#formError").textContent = "Your bag is empty.";
  button.disabled = true; button.textContent = "Preparing your order…";
  $("#formError").textContent = "";
  try {
    const response = await fetch("/api/checkout", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customer, items })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Could not prepare your order. Please try again.");
    closeCheckout();
    window.open(data.whatsappUrl, "_blank", "noopener,noreferrer");
    toast(`Order ${data.orderRef} is ready. Send the message in WhatsApp to confirm.`);
  } catch (error) {
    $("#formError").textContent = error.message || "Something went wrong. Please try again.";
  } finally {
    button.disabled = false; button.textContent = "Prepare WhatsApp order ↗";
  }
});
renderCart();
