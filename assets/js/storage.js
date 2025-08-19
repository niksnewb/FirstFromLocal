// Lightweight storage & helpers
window.store = {
  get(key, fallback){ try{ return JSON.parse(localStorage.getItem(key)) ?? fallback; }catch(e){ return fallback; } },
  set(key, val){ localStorage.setItem(key, JSON.stringify(val)); },
  remove(key){ localStorage.removeItem(key); }
};

window.money = (n)=> `$${(n||0).toFixed(2)}`;

function ensureDefaults(){
  // Seed only once
  if(!store.get("products")){
    store.set("products", ThreadLabData.products);
  }
  if(!store.get("categories")){
    store.set("categories", ThreadLabData.categories);
  }
  if(!store.get("settings")){
    store.set("settings", {
      shipping:{ flat: 7.50, freeOver: 120 },
      tax:{ rate: 8.5 },
      coupons:{ "SAVE10": 10 }
    });
  }
  if(!store.get("payments")){
    store.set("payments", { cod:true, card:true, upi:true });
  }
  if(!store.get("orders")){
    store.set("orders", []);
  }
  if(!store.get("cart")){
    store.set("cart", []);
  }
  if(!store.get("admin")){
    store.set("admin", { user:"admin", pass:"admin123", authed:false });
  }
}

ensureDefaults();
