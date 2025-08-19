// Product catalog (seed data). You can replace with your Django API.
window.ThreadLabData = (function(){
  const categories = [
    { id: "shirts", name: "Shirts" },
    { id: "pants", name: "Pants" },
    { id: "bags", name: "Bags" },
    { id: "accessories", name: "Accessories" }
  ];

  const products = [
    {id:"p1", name:"Classic Oxford Shirt", category:"shirts", price:49.99, stock:50, img:"/assets/img/p1.webp", desc:"Crisp cotton oxford with a modern fit."},
    {id:"p2", name:"Linen Summer Shirt", category:"shirts", price:59.99, stock:30, img:"/assets/img/p2.webp", desc:"Breathable linen for warm days."},
    {id:"p3", name:"Tailored Chinos", category:"pants", price:64.99, stock:40, img:"/assets/img/p3.webp", desc:"Slim-fit chinos with stretch."},
    {id:"p4", name:"Athletic Joggers", category:"pants", price:54.99, stock:35, img:"/assets/img/p4.webp", desc:"Soft fleece joggers."},
    {id:"p5", name:"Minimalist Tote Bag", category:"bags", price:39.99, stock:25, img:"/assets/img/p5.webp", desc:"Everyday carry with style."},
    {id:"p6", name:"Compact Crossbody", category:"bags", price:44.99, stock:20, img:"/assets/img/p6.webp", desc:"Hands-free and versatile."},
    {id:"p7", name:"Wool Beanie", category:"accessories", price:19.99, stock:60, img:"/assets/img/p7.webp", desc:"Cozy rib-knit beanie."},
    {id:"p8", name:"Leather Belt", category:"accessories", price:24.99, stock:45, img:"/assets/img/p8.webp", desc:"Full-grain leather belt."},
    {id:"p9", name:"Denim Jacket", category:"shirts", price:89.99, stock:15, img:"/assets/img/p9.webp", desc:"Timeless medium wash denim."},
    {id:"p10", name:"Canvas Backpack", category:"bags", price:69.99, stock:18, img:"/assets/img/p10.webp", desc:"Rugged 20L daypack."}
  ];

  return { categories, products };
})();