// Admin panel logic (demo auth + CRUD via localStorage)
document.addEventListener("DOMContentLoaded", ()=>{
  const path = location.pathname;

  if(path.endsWith("/admin/login.html")){
    const form = document.getElementById("adminLoginForm");
    form.addEventListener("submit",(e)=>{
      e.preventDefault();
      const u = document.getElementById("adminUser").value;
      const p = document.getElementById("adminPass").value;
      const admin = store.get("admin");
      if(u===admin.user && p===admin.pass){
        admin.authed = true;
        store.set("admin", admin);
        location.href="/admin/dashboard.html";
      }else{
        alert("Invalid credentials");
      }
    });
  } else {
    // Redirect to login if not authed
    const admin = store.get("admin");
    if(!admin?.authed){
      location.href="/admin/login.html"; return;
    }
    const logout = document.getElementById("adminLogout");
    if(logout) logout.addEventListener("click", (e)=>{
      e.preventDefault();
      admin.authed=false; store.set("admin", admin);
      location.href="/admin/login.html";
    });
  }

  if(path.endsWith("/admin/dashboard.html")){
    renderKPIs();
  }
  if(path.endsWith("/admin/products.html")){
    renderProductsTable();
    setupProductForm();
  }
  if(path.endsWith("/admin/orders.html")){
    renderOrdersTable();
  }
  if(path.endsWith("/admin/settings.html")){
    renderSettings();
  }
});

function renderKPIs(){
  const orders = store.get("orders", []);
  const products = store.get("products", []);
  const revenue = orders.reduce((a,o)=>a+o.total,0);
  document.getElementById("kpiOrders").textContent = orders.length;
  document.getElementById("kpiRevenue").textContent = money(revenue);
  document.getElementById("kpiProducts").textContent = products.length;

  const recentWrap = document.getElementById("recentOrders");
  if(orders.length===0){
    recentWrap.innerHTML = '<div class="text-muted">No orders yet.</div>';
    return;
  }
  recentWrap.innerHTML = `<div class="table-responsive"><table class="table table-sm">
    <thead><tr><th>ID</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
    <tbody>
      ${orders.slice(0,5).map(o=>`
        <tr>
          <td>${o.id}</td>
          <td>${o.customer.name}</td>
          <td>${money(o.total)}</td>
          <td>${o.status}</td>
          <td>${new Date(o.createdAt).toLocaleString()}</td>
        </tr>
      `).join("")}
    </tbody>
  </table></div>`;
}

function renderProductsTable(){
  const wrap = document.getElementById("adminProductsTable");
  const products = store.get("products", []);
  wrap.innerHTML = `<div class="table-responsive"><table class="table align-middle">
    <thead><tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th></th></tr></thead>
    <tbody>
      ${products.map(p=>`
        <tr>
          <td><img src="${p.img}" width="48" class="rounded"></td>
          <td>${p.name}</td>
          <td>${p.category}</td>
          <td>${money(p.price)}</td>
          <td>${p.stock}</td>
          <td class="text-end">
            <button class="btn btn-sm btn-outline-primary me-2 edit" data-id="${p.id}" data-bs-toggle="modal" data-bs-target="#productModal">Edit</button>
            <button class="btn btn-sm btn-outline-danger delete" data-id="${p.id}">Delete</button>
          </td>
        </tr>
      `).join("")}
    </tbody>
  </table></div>`;

  wrap.querySelectorAll(".edit").forEach(btn=> btn.addEventListener("click", ()=>{
    const id = btn.getAttribute("data-id");
    const p = products.find(x=>x.id===id);
    document.getElementById("productId").value = p.id;
    document.getElementById("pName").value = p.name;
    document.getElementById("pCategory").value = p.category;
    document.getElementById("pPrice").value = p.price;
    document.getElementById("pStock").value = p.stock;
    document.getElementById("pImage").value = p.img;
    document.getElementById("pDesc").value = p.desc;
  }));

  wrap.querySelectorAll(".delete").forEach(btn=> btn.addEventListener("click", ()=>{
    const id = btn.getAttribute("data-id");
    if(confirm("Delete this product?")){
      const products = store.get("products", []);
      const next = products.filter(p=>p.id!==id);
      store.set("products", next);
      renderProductsTable();
    }
  }));
}

function setupProductForm(){
  document.getElementById("saveProductBtn").addEventListener("click", ()=>{
    const id = document.getElementById("productId").value || ("p"+Math.random().toString(36).slice(2,7));
    const p = {
      id,
      name: document.getElementById("pName").value,
      category: document.getElementById("pCategory").value,
      price: parseFloat(document.getElementById("pPrice").value||0),
      stock: parseInt(document.getElementById("pStock").value||0),
      img: document.getElementById("pImage").value || "/assets/img/p1.webp",
      desc: document.getElementById("pDesc").value || ""
    };
    const products = store.get("products", []);
    const exists = products.findIndex(x=>x.id===id);
    if(exists>-1) products[exists]=p; else products.unshift(p);
    store.set("products", products);
    document.querySelector("#productModal .btn-close").click();
    renderProductsTable();
  });
}

function renderOrdersTable(){
  const orders = store.get("orders", []);
  const products = store.get("products", []);
  const wrap = document.getElementById("ordersTable");
  if(orders.length===0){ wrap.innerHTML = '<div class="text-muted">No orders yet.</div>'; return; }
  wrap.innerHTML = `<div class="table-responsive"><table class="table align-middle">
    <thead><tr><th>ID</th><th>Items</th><th>Customer</th><th>Total</th><th>Status</th><th></th></tr></thead>
    <tbody>
      ${orders.map(o=>`
        <tr>
          <td>${o.id}</td>
          <td>${o.items.map(i=>{
            const p = products.find(x=>x.id===i.id);
            return p ? p.name + " × " + i.qty : i.id + " × " + i.qty;
          }).join(", ")}</td>
          <td>${o.customer.name}</td>
          <td>${money(o.total)}</td>
          <td>
            <select class="form-select form-select-sm order-status" data-id="${o.id}">
              ${["Processing","Shipped","Delivered","Cancelled"].map(s=>`<option ${o.status===s?"selected":""}>${s}</option>`).join("")}
            </select>
          </td>
          <td class="text-end">
            <button class="btn btn-sm btn-outline-danger cancel" data-id="${o.id}">Delete</button>
          </td>
        </tr>
      `).join("")}
    </tbody></table></div>`;

  wrap.querySelectorAll(".order-status").forEach(sel=> sel.addEventListener("change", (e)=>{
    const id = sel.getAttribute("data-id");
    const orders = store.get("orders", []);
    const o = orders.find(x=>x.id===id);
    o.status = sel.value;
    store.set("orders", orders);
  }));

  wrap.querySelectorAll(".cancel").forEach(btn=> btn.addEventListener("click", ()=>{
    const id = btn.getAttribute("data-id");
    if(confirm("Delete this order?")){
      let orders = store.get("orders", []);
      orders = orders.filter(o=>o.id!==id);
      store.set("orders", orders);
      renderOrdersTable();
    }
  }));
}

function renderSettings(){
  const settings = store.get("settings", {});
  const pays = store.get("payments", {});

  document.getElementById("shipFlat").value = settings.shipping?.flat ?? 0;
  document.getElementById("shipFreeOver").value = settings.shipping?.freeOver ?? 0;
  document.getElementById("taxRate").value = settings.tax?.rate ?? 0;
  document.getElementById("payCOD").checked = !!pays.cod;
  document.getElementById("payCard").checked = !!pays.card;
  document.getElementById("payUPI").checked = !!pays.upi;

  document.getElementById("saveShipping").addEventListener("click", ()=>{
    const settings = store.get("settings", {});
    settings.shipping = {
      flat: parseFloat(document.getElementById("shipFlat").value||0),
      freeOver: parseFloat(document.getElementById("shipFreeOver").value||0)
    };
    store.set("settings", settings);
    alert("Shipping saved.");
  });

  document.getElementById("saveTax").addEventListener("click", ()=>{
    const settings = store.get("settings", {});
    settings.tax = { rate: parseFloat(document.getElementById("taxRate").value||0) };
    store.set("settings", settings);
    alert("Tax saved.");
  });

  function renderCoupons(){
    const settings = store.get("settings", {});
    const coupons = settings.coupons || {};
    const list = Object.entries(coupons).map(([c, d])=> `<span class="badge bg-dark me-2">${c} − ${d}%</span>`).join("") || "<span class='text-muted'>No coupons.</span>";
    document.getElementById("couponsList").innerHTML = list;
  }
  renderCoupons();

  document.getElementById("addCoupon").addEventListener("click", ()=>{
    const code = (document.getElementById("couponCodeSet").value||"").trim().toUpperCase();
    const disc = parseFloat(document.getElementById("couponDiscount").value||0);
    if(!code || disc<=0){ alert("Enter code and discount."); return; }
    const settings = store.get("settings", {});
    settings.coupons = settings.coupons || {};
    settings.coupons[code] = disc;
    store.set("settings", settings);
    document.getElementById("couponCodeSet").value="";
    document.getElementById("couponDiscount").value="";
    renderCoupons();
  });

  document.getElementById("savePayments").addEventListener("click", ()=>{
    const pays = {
      cod: document.getElementById("payCOD").checked,
      card: document.getElementById("payCard").checked,
      upi: document.getElementById("payUPI").checked
    };
    store.set("payments", pays);
    alert("Payment options saved.");
  });
}
