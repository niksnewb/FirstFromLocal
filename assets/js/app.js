// Front-store interactions
document.addEventListener("DOMContentLoaded", () => {
  updateMiniCart();

  const path = location.pathname;

  if(path.endsWith("/index.html") || path==="/"){
    renderNewArrivals();
  }
  if(path.endsWith("/products.html")){
    renderFilters();
    renderProducts();
    setupCatalogUI();
  }
  if(path.endsWith("/product.html")){
    renderProductDetail();
  }
  if(path.endsWith("/categories.html")){
    renderCategories();
  }
  if(path.endsWith("/cart.html")){
    renderCart();
  }
  if(path.endsWith("/checkout.html")){
    setupCheckout();
  }
});

function updateMiniCart(){
  const cart = store.get("cart", []);
  const count = cart.reduce((a,c)=>a+c.qty,0);
  const el = document.getElementById("miniCartCount");
  if(el) el.textContent = count;
}

function renderNewArrivals(){
  const products = store.get("products", []).slice(-6);
  const wrap = document.getElementById("newArrivals");
  wrap.innerHTML = products.map(cardMarkup).join("");
}

function renderFilters(){
  const cats = store.get("categories", []);
  const sel = document.getElementById("filterCategory");
  cats.forEach(c=>{
    const opt = document.createElement("option");
    opt.value = c.id; opt.textContent = c.name;
    sel.appendChild(opt);
  });
}

function renderProducts(){
  const wrap = document.getElementById("productsGrid");
  if(!wrap) return;
  let products = store.get("products", []);

  const minPrice = 0;
  let maxPrice = parseInt(document.getElementById("filterPrice").value || 200);
  document.getElementById("priceVal").textContent = `$${maxPrice}`;

  const cat = document.getElementById("filterCategory").value;
  const q = (document.getElementById("searchInput")?.value || "").toLowerCase();
  const sort = document.getElementById("sortSelect").value;

  let result = products.filter(p=> p.price>=minPrice && p.price<=maxPrice);
  if(cat) result = result.filter(p=>p.category===cat);
  if(q) result = result.filter(p => p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q));

  if(sort==="price-asc") result.sort((a,b)=>a.price-b.price);
  if(sort==="price-desc") result.sort((a,b)=>b.price-a.price);
  if(sort==="name-asc") result.sort((a,b)=>a.name.localeCompare(b.name));
  if(sort==="name-desc") result.sort((a,b)=>b.name.localeCompare(a.name));

  wrap.innerHTML = result.map(cardMarkup).join("");
}

function cardMarkup(p){
  return `
  <div class="col-6 col-md-4 col-xl-3">
    <div class="card product-card h-100 shadow-sm">
      <img src="${p.img}" class="w-100" alt="${p.name}">
      <div class="card-body d-flex flex-column">
        <div class="d-flex justify-content-between align-items-start">
          <h6 class="fw-bold">${p.name}</h6>
          <span class="badge badge-category">${p.category}</span>
        </div>
        <div class="mt-auto d-flex justify-content-between align-items-center">
          <div class="fw-bold">${money(p.price)}</div>
          <a href="/product.html?id=${p.id}" class="btn btn-sm btn-dark">View</a>
        </div>
      </div>
    </div>
  </div>`;
}

function setupCatalogUI(){
  document.getElementById("filterPrice").addEventListener("input", renderProducts);
  document.getElementById("filterCategory").addEventListener("change", renderProducts);
  document.getElementById("searchInput").addEventListener("input", renderProducts);
  document.getElementById("sortSelect").addEventListener("change", renderProducts);
  document.getElementById("clearFilters").addEventListener("click", ()=>{
    document.getElementById("filterCategory").value="";
    document.getElementById("filterPrice").value=200;
    document.getElementById("priceVal").textContent="$200";
    document.getElementById("searchInput").value="";
    document.getElementById("sortSelect").value="";
    renderProducts();
  });
}

function renderProductDetail(){
  const params = new URLSearchParams(location.search);
  const id = params.get("id");
  const p = store.get("products", []).find(x=>x.id===id);
  const wrap = document.getElementById("productDetail");
  if(!p){
    wrap.innerHTML = `<div class="alert alert-warning">Product not found.</div>`;
    return;
  }
  wrap.innerHTML = `
  <div class="row g-4">
    <div class="col-md-6">
      <img class="img-fluid rounded-4 shadow-sm" src="${p.img}" alt="${p.name}">
    </div>
    <div class="col-md-6">
      <h1 class="h3">${p.name}</h1>
      <div class="mb-2"><span class="badge badge-category">${p.category}</span></div>
      <div class="display-6 fw-bold mb-3">${money(p.price)}</div>
      <p class="text-muted">${p.desc}</p>
      <div class="input-group mb-3" style="max-width:200px">
        <span class="input-group-text">Qty</span>
        <input id="qty" type="number" class="form-control" min="1" value="1">
      </div>
      <button class="btn btn-dark" id="addToCartBtn">Add to Cart</button>
    </div>
  </div>`;

  document.getElementById("addToCartBtn").addEventListener("click", ()=>{
    const qty = parseInt(document.getElementById("qty").value||1);
    addToCart(p.id, qty);
  });
}

function addToCart(id, qty){
  const products = store.get("products", []);
  const p = products.find(x=>x.id===id);
  if(!p) return;
  const cart = store.get("cart", []);
  const existing = cart.find(c=>c.id===id);
  if(existing){ existing.qty += qty; } else { cart.push({id, qty}); }
  store.set("cart", cart);
  updateMiniCart();
  alert("Added to cart!");
}

function renderCategories(){
  const cats = store.get("categories", []);
  const products = store.get("products", []);
  const wrap = document.getElementById("categoriesGrid");
  wrap.innerHTML = cats.map(c=>{
    const count = products.filter(p=>p.category===c.id).length;
    return `<div class="col-6 col-md-4 col-lg-3">
      <a class="text-decoration-none" href="/products.html" onclick="localStorage.setItem('prefCat','${c.id}')">
        <div class="card shadow-sm h-100">
          <div class="card-body d-flex flex-column">
            <h6 class="fw-bold">${c.name}</h6>
            <span class="text-muted small mt-auto">${count} items</span>
          </div>
        </div>
      </a>
    </div>`;
  }).join("");

  // If a preferred category was set, populate filter on products page
  const pref = localStorage.getItem("prefCat");
  if(pref && location.pathname.endsWith("categories.html")){
    // no-op here, handled on products page if navigated
  }
}

function renderCart(){
  const cart = store.get("cart", []);
  const products = store.get("products", []);
  const settings = store.get("settings", {});
  const wrap = document.getElementById("cartView");
  if(cart.length===0){
    wrap.innerHTML = `<div class="alert alert-info">Your cart is empty.</div>`;
    return;
  }
  let subtotal = 0;
  const rows = cart.map(item=>{
    const p = products.find(x=>x.id===item.id);
    const line = p.price * item.qty;
    subtotal += line;
    return `<tr>
      <td><img src="${p.img}" width="64" class="rounded me-2"> ${p.name}</td>
      <td>${money(p.price)}</td>
      <td>
        <input data-id="${p.id}" type="number" min="1" value="${item.qty}" class="form-control form-control-sm cart-qty">
      </td>
      <td class="text-end">${money(line)}</td>
      <td class="text-end"><button class="btn btn-sm btn-outline-danger remove-item" data-id="${p.id}">Remove</button></td>
    </tr>`;
  }).join("");

  const ship = (subtotal >= (settings.shipping?.freeOver||999999)) ? 0 : (settings.shipping?.flat||0);
  const tax = (settings.tax?.rate||0)/100 * subtotal;
  const total = subtotal + ship + tax;

  wrap.innerHTML = `
    <div class="table-responsive">
      <table class="table align-middle">
        <thead><tr><th>Item</th><th>Price</th><th style="width:120px">Qty</th><th class="text-end">Line</th><th></th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <div class="card p-3 ms-auto" style="max-width:360px">
      <div class="d-flex justify-content-between"><span>Subtotal</span><strong>${money(subtotal)}</strong></div>
      <div class="d-flex justify-content-between"><span>Shipping</span><strong>${money(ship)}</strong></div>
      <div class="d-flex justify-content-between"><span>Tax</span><strong>${money(tax)}</strong></div>
      <div class="d-flex justify-content-between fs-5 mt-2"><span>Total</span><strong>${money(total)}</strong></div>
    </div>
  `;

  document.querySelectorAll(".cart-qty").forEach(input=>{
    input.addEventListener("change", (e)=>{
      const id = e.target.getAttribute("data-id");
      const cart = store.get("cart", []);
      const row = cart.find(x=>x.id===id);
      row.qty = Math.max(1, parseInt(e.target.value||1));
      store.set("cart", cart);
      renderCart();
      updateMiniCart();
    });
  });
  document.querySelectorAll(".remove-item").forEach(btn=>{
    btn.addEventListener("click", (e)=>{
      const id = e.target.getAttribute("data-id");
      let cart = store.get("cart", []);
      cart = cart.filter(x=>x.id!==id);
      store.set("cart", cart);
      renderCart();
      updateMiniCart();
    });
  });
}

function setupCheckout(){
  const cart = store.get("cart", []);
  const products = store.get("products", []);
  const settings = store.get("settings", {});
  const summary = document.getElementById("orderSummary");

  function compute(){
    let subtotal=0;
    cart.forEach(item=>{
      const p = products.find(x=>x.id===item.id);
      subtotal += p.price * item.qty;
    });
    let discount = 0;
    const code = (document.getElementById("couponCode").value||"").trim().toUpperCase();
    if(code && settings.coupons?.[code]){
      discount = subtotal * (settings.coupons[code]/100);
    }
    const ship = (subtotal >= (settings.shipping?.freeOver||999999)) ? 0 : (settings.shipping?.flat||0);
    const tax = (settings.tax?.rate||0)/100 * Math.max(0, subtotal-discount);
    const total = Math.max(0, subtotal-discount) + ship + tax;
    return { subtotal, discount, ship, tax, total, code };
  }

  function render(){
    const {subtotal, discount, ship, tax, total} = compute();
    const lines = cart.map(item=>{
      const p = products.find(x=>x.id===item.id);
      return `<div class="d-flex justify-content-between">
        <div>${p.name} × ${item.qty}</div>
        <div>${money(p.price*item.qty)}</div>
      </div>`;
    }).join("");
    summary.innerHTML = `
      ${lines || '<div class="text-muted">No items in cart.</div>'}
      <hr>
      <div class="d-flex justify-content-between"><span>Subtotal</span><strong>${money(subtotal)}</strong></div>
      <div class="d-flex justify-content-between"><span>Discount</span><strong>-${money(discount)}</strong></div>
      <div class="d-flex justify-content-between"><span>Shipping</span><strong>${money(ship)}</strong></div>
      <div class="d-flex justify-content-between"><span>Tax</span><strong>${money(tax)}</strong></div>
      <div class="d-flex justify-content-between fs-5 mt-2"><span>Total</span><strong>${money(total)}</strong></div>
    `;
  }

  render();

  document.getElementById("applyCoupon").addEventListener("click", render);

  document.getElementById("checkoutForm").addEventListener("submit", (e)=>{
    e.preventDefault();
    if(cart.length===0){ alert("Your cart is empty."); return; }

    const { total, code } = compute();
    const order = {
      id: "ORD"+Date.now(),
      items: cart,
      customer: {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        address: document.getElementById("address").value,
        city: document.getElementById("city").value,
        state: document.getElementById("state").value,
        zip: document.getElementById("zip").value
      },
      payment: document.getElementById("paymentMethod").value,
      coupon: code || null,
      total,
      status: "Processing",
      createdAt: new Date().toISOString()
    };
    const orders = store.get("orders", []);
    orders.unshift(order);
    store.set("orders", orders);
    store.set("cart", []);
    updateMiniCart();
    alert("Order placed! ID: "+order.id);
    location.href = "/index.html";
  });
}
