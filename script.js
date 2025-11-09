// Muestra el año
document.getElementById('year').textContent = new Date().getFullYear();

// Productos: las imágenes usan picsum.photos con seed para que siempre carguen y sean estables.
// El "seed" está relacionado al nombre del producto para que haya correspondencia visual predecible.
const products = [
  { id: 1, name: "Camiseta Neon Wave", category: "ropa", price: 24.99, seed: "camiseta-neon-wave", desc: "Camiseta juvenil con estampado neón." },
  { id: 2, name: "Pantalón Trail", category: "ropa", price: 49.99, seed: "pantalon-trail", desc: "Pantalón cómodo y resistente para uso diario." },
  { id: 3, name: "Audífonos Pulse", category: "tecnologia", price: 79.99, seed: "audifonos-pulse", desc: "Audífonos inalámbricos con sonido inmersivo." },
  { id: 4, name: "Reloj Orbit", category: "accesorios", price: 129.99, seed: "reloj-orbit", desc: "Reloj inteligente con diseño minimal y notificaciones." },
  { id: 5, name: "Zapatillas Sprint", category: "calzado", price: 89.99, seed: "zapatillas-sprint", desc: "Zapatillas deportivas con amortiguación reactiva." },
  { id: 6, name: "Mochila Nomad", category: "accesorios", price: 59.99, seed: "mochila-nomad", desc: "Mochila para laptop y viajes cortos." },
  { id: 7, name: "Sudadera Glow", category: "ropa", price: 54.99, seed: "sudadera-glow", desc: "Sudadera con capucha y detalles reflectantes." },
  { id: 8, name: "Cargador ZipCharge", category: "tecnologia", price: 19.99, seed: "cargador-zipcharge", desc: "Cargador portátil rápido para móviles." }
];

// Genera URL de imagen estable usando picsum.photos con un seed único por producto
function imgUrl(seed){
  // 800x800, la respuesta es siempre válida y carga desde picsum
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/800/800`;
}

const productGrid = document.getElementById('productGrid');
const cartListEl = document.getElementById('cartList');
const cartTotalEl = document.getElementById('cartTotal');
const cartBtn = document.getElementById('cartBtn');
const modal = document.getElementById('modal');
let cart = [];

// Renderiza productos
function renderProducts(list){
  productGrid.innerHTML = '';
  list.forEach(p=>{
    const div = document.createElement('article');
    div.className = 'card';
    div.innerHTML = `
      <div class="thumb"><img loading="lazy" src="${imgUrl(p.seed)}" alt="${p.name}"></div>
      <h3>${p.name}</h3>
      <p class="desc">${p.desc}</p>
      <div class="price">$${p.price.toFixed(2)}</div>
      <div style="display:flex;gap:8px;margin-top:8px">
        <button class="btn" data-action="view" data-id="${p.id}">Ver</button>
        <button class="btn primary" data-action="add" data-id="${p.id}">Agregar</button>
      </div>
    `;
    productGrid.appendChild(div);
  });
}

// Filtros
document.querySelectorAll('[data-filter]').forEach(btn=>{
  btn.addEventListener('click', ()=> {
    const f = btn.getAttribute('data-filter');
    if(f === 'all') renderProducts(products);
    else renderProducts(products.filter(x => x.category === f));
  });
});

// Buscador
document.getElementById('searchInput').addEventListener('input', e=>{
  const q = e.target.value.toLowerCase().trim();
  if(!q) renderProducts(products);
  else renderProducts(products.filter(p => (p.name + ' ' + p.desc).toLowerCase().includes(q)));
});

// Delegación botones de producto
productGrid.addEventListener('click', e => {
  const b = e.target.closest('button');
  if(!b) return;
  const id = Number(b.getAttribute('data-id'));
  const action = b.getAttribute('data-action');
  const prod = products.find(x => x.id === id);
  if(!prod) return;
  if(action === 'view') openModal(prod);
  if(action === 'add') addToCart(prod, 1);
});

// Modal
function openModal(prod){
  modal.setAttribute('aria-hidden', 'false');
  modal.classList.add('show');
  document.getElementById('modalImg').src = imgUrl(prod.seed);
  document.getElementById('modalTitle').textContent = prod.name;
  document.getElementById('modalDesc').textContent = prod.desc;
  document.getElementById('modalPrice').textContent = `$${prod.price.toFixed(2)}`;
  document.getElementById('modalQty').value = 1;
  document.getElementById('addToCartBtn').onclick = ()=> {
    const qty = Math.max(1, Number(document.getElementById('modalQty').value || 1));
    addToCart(prod, qty);
    closeModal();
  };
}
function closeModal(){
  modal.setAttribute('aria-hidden', 'true');
  modal.classList.remove('show');
}
document.getElementById('closeModal').addEventListener('click', closeModal);
modal.addEventListener('click', e => { if(e.target === modal) closeModal(); });

// Carrito
function addToCart(prod, qty){
  const existing = cart.find(c => c.id === prod.id);
  if(existing) existing.qty += qty;
  else cart.push({ id: prod.id, name: prod.name, price: prod.price, image: imgUrl(prod.seed), qty });
  updateCartUI();
}
function updateCartUI(){
  cartListEl.innerHTML = '';
  let total = 0;
  let count = 0;
  cart.forEach(item=>{
    total += item.price * item.qty;
    count += item.qty;
    const row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML = `<img src="${item.image}" alt="${item.name}"><div style="flex:1"><div style="font-weight:600">${item.name}</div><div style="color:#9aa4b2;font-size:13px">$${item.price.toFixed(2)} · x${item.qty}</div></div>
      <div style="display:flex;flex-direction:column;gap:6px">
        <button class="btn" data-action="inc" data-id="${item.id}">+</button>
        <button class="btn" data-action="dec" data-id="${item.id}">-</button>
      </div>`;
    cartListEl.appendChild(row);
  });
  cartTotalEl.textContent = `$${total.toFixed(2)}`;
  cartBtn.textContent = `Carrito (${count})`;
}

// Manejo + / - en carrito
cartListEl.addEventListener('click', e=>{
  const b = e.target.closest('button');
  if(!b) return;
  const id = Number(b.getAttribute('data-id'));
  const action = b.getAttribute('data-action');
  const idx = cart.findIndex(c => c.id === id);
  if(idx === -1) return;
  if(action === 'inc') cart[idx].qty += 1;
  if(action === 'dec'){ cart[idx].qty -= 1; if(cart[idx].qty <= 0) cart.splice(idx,1); }
  updateCartUI();
});

// Vaciar / pagar
document.getElementById('clearCart').addEventListener('click', ()=> { cart = []; updateCartUI(); });
document.getElementById('checkout').addEventListener('click', ()=> {
  if(cart.length === 0) return alert('El carrito está vacío.');
  alert('Total: ' + cartTotalEl.textContent + '\\n(En este prototipo el pago no está integrado)');
});

// Botón carrito muestra resumen
cartBtn.addEventListener('click', ()=> {
  if(cart.length === 0) return alert('Carrito vacío');
  let text = 'Resumen:\\n';
  cart.forEach(i => text += `${i.name} x${i.qty} — $${(i.price*i.qty).toFixed(2)}\\n`);
  text += 'Total: ' + cartTotalEl.textContent;
  alert(text);
});

// Inicial
renderProducts(products);
updateCartUI();
