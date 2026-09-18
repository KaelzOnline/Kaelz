const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const money = n => "Rp " + Number(n || 0).toLocaleString("id-ID");
const esc = s => String(s ?? "").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));

const catalog = [
  ["game","FREE FIRE","50 DIAMOND",8000,"💎",1],
  ["game","FREE FIRE","140 DIAMOND",18000,"💎",2],
  ["game","FREE FIRE","210 DIAMOND",27000,"💎",3],
  ["game","FREE FIRE","355 DIAMOND",44000,"💎",4],
  ["game","FREE FIRE","500 DIAMOND",61000,"💎",5],
  ["game","FREE FIRE","720 DIAMOND",85000,"💎",6],
  ["game","FREE FIRE","1450 DIAMOND",170000,"💎",7],
  ["game","MOBILE LEGENDS","56 DIAMOND",17000,"💎",8],
  ["game","MOBILE LEGENDS","144 DIAMOND",39000,"💎",9],
  ["game","MOBILE LEGENDS","240 DIAMOND",65000,"💎",10],
  ["game","MOBILE LEGENDS","355 DIAMOND",90000,"💎",11],
  ["game","MOBILE LEGENDS","460 DIAMOND",117000,"💎",12],
  ["game","MOBILE LEGENDS","712 DIAMOND",179000,"💎",13],
  ["game","MOBILE LEGENDS","1159 DIAMOND",289000,"💎",14],
  ["game","LAINNYA","LAINNYA DALAM PROSES",0,"🎮",99],
  ["virtual","WHATSAPP","INDONESIA",4000,"🇮🇩",1],
  ["virtual","WHATSAPP","COLOMBIA",6000,"🇨🇴",2],
  ["virtual","WHATSAPP","MALAYSIA",10000,"🇲🇾",3],
  ["virtual","WHATSAPP","PHILIPINA",7000,"🇵🇭",4],
  ["virtual","SHOPEE","INDONESIA",3000,"🇮🇩",5],
  ["virtual","SHOPEE","PHILIPINA",4000,"🇵🇭",6],
  ["virtual","SHOPEE","MALAYSIA",5000,"🇲🇾",7],
  ["logo","JASA LOGO","LOGO JB",1000,"🎨",1],
  ["logo","JASA LOGO","LOGO FT",3000,"🖼️",2],
  ["logo","JASA LOGO","LOGO ANIME",2000,"🌌",3],
  ["logo","JASA LOGO","LOGO CHIBI",2000,"✨",4],
  ["logo","JASA LOGO","LOGO QRIS",3000,"▣",5],
  ["logo","JASA LOGO","LOGO MUKA",5000,"👤",6],
  ["logo","JASA LOGO","LOGO TESTIMONI",3000,"💬",7],
  ["logo","JASA LOGO","LOGO WALPAPER",1000,"📱",8],
  ["logo","JASA LOGO","LOGO INFO SELL",5000,"🛍️",9]
];

function localProducts(category){
  return catalog.filter(x=>x[0]===category).map((x,i)=>({
    id:"local-"+category+"-"+i, category:x[0], subcategory:x[1], name:x[2],
    price:x[3], icon:x[4], active:true, sort_order:x[5]
  }));
}

async function dbProducts(category){
  if(!window.supabaseClient) return localProducts(category);
  try{
    const {data,error}=await window.supabaseClient.from("products")
      .select("*").eq("category",category).eq("active",true).order("sort_order");
    if(error || !data?.length) return localProducts(category);
    return data;
  }catch(e){ console.warn(e); return localProducts(category); }
}

function card(p){
  return `<article class="product">
    <div class="product-top">
      <div class="game-art">${esc(p.icon||"🎮")}</div>
      <div><h3>${esc(p.name)}</h3><small>${esc(p.subcategory||"Digital Service")}</small></div>
    </div>
    <div class="row"><b class="price">${money(p.price)}</b>
      <button class="cta small choose" data-id="${esc(p.id)}">Pilih</button>
    </div>
  </article>`;
}

function saveProduct(p){
  localStorage.setItem("ko_cart",JSON.stringify(p));
  location.href="checkout.html";
}

async function productPage(category){
  const target=$("#products"); if(!target)return;
  const tabs=$$(".tab");
  const search=$("#search");
  let all=await dbProducts(category), filter="ALL";
  const draw=()=>{
    const q=(search?.value||"").toLowerCase().trim();
    const list=all.filter(p=>
      (filter==="ALL" || String(p.subcategory).toUpperCase()===filter) &&
      (`${p.name} ${p.subcategory}`).toLowerCase().includes(q)
    );
    target.innerHTML=list.length?list.map(card).join(""):`<div class="empty">Produk tidak ditemukan.</div>`;
    $$(".choose",target).forEach(b=>b.onclick=()=>{
      const p=all.find(x=>String(x.id)===String(b.dataset.id)); if(p)saveProduct(p);
    });
  };
  tabs.forEach(t=>t.onclick=()=>{
    tabs.forEach(x=>x.classList.remove("active")); t.classList.add("active");
    filter=t.dataset.filter||"ALL"; draw();
  });
  search?.addEventListener("input",draw);
  draw();
}

function bindGlobal(){
  $$(".year").forEach(x=>x.textContent=new Date().getFullYear());
  const page=document.body.dataset.page;
  $$(".nav-item").forEach(a=>a.classList.toggle("active",a.dataset.page===page));
}

function renderHome(){
  const fav=$("#favorites"); if(!fav)return;
  const items=localProducts("game").filter(p=>["FREE FIRE","MOBILE LEGENDS"].includes(p.subcategory));
  fav.innerHTML=items.map(p=>`<a class="game-card" href="game.html"><div class="game-art">${p.icon}</div><div><b>${p.subcategory}</b><small>Top Up Diamond</small></div><span class="arrow">›</span></a>`).join("");
}

function checkout(){
  const cart=JSON.parse(localStorage.getItem("ko_cart")||"null"), box=$("#checkout");
  if(!box)return;
  if(!cart){box.innerHTML=`<div class="empty">Belum ada produk dipilih.<br><br><a class="cta" href="game.html">Pilih Produk</a></div>`;return;}
  box.innerHTML=`<div class="checkout-grid">
    <section class="panel">
      <h2 style="margin-top:0">Detail Pesanan</h2>
      <div class="product" style="margin-bottom:14px"><div class="row"><div><b>${esc(cart.name)}</b><div class="muted">${esc(cart.subcategory)}</div></div><b class="price">${money(cart.price)}</b></div></div>
      <form id="orderForm" class="form">
        <div class="field"><label>Nama / Username</label><input name="buyer" required placeholder="Masukkan nama kamu"></div>
        <div class="field"><label>Nomor WhatsApp</label><input name="wa" required placeholder="08xxxxxxxxxx"></div>
        <div class="field"><label>Detail Pesanan / ID Game / Catatan</label><textarea name="detail" required placeholder="Contoh: ID game, server, atau catatan pesanan"></textarea></div>
        <div class="field"><label>Metode Pembayaran</label><select name="payment" id="payment" required><option value="">Pilih pembayaran</option><option>QRIS</option><option>DANA</option><option>OVO</option><option>GoPay</option><option>Transfer Bank</option></select></div>
        <div id="qrisBox" class="panel qris" style="display:none"><b>Scan QRIS untuk Pembayaran</b><img src="qris.jpg" alt="QRIS"><small class="muted">Setelah membayar, upload bukti transfer asli.</small></div>
        <div class="field"><label>Upload Bukti Transfer *</label><input name="proof" id="proof" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" required><small class="muted">JPG, PNG, WEBP, PDF — maksimal 5 MB. File disimpan apa adanya.</small></div>
        <button class="cta" id="submitOrder">Buat Pesanan →</button>
      </form>
    </section>
    <aside class="panel"><h3>Ringkasan</h3><div class="order-row"><span>Produk</span><b>${esc(cart.name)}</b></div><div class="order-row"><span>Total</span><b class="price">${money(cart.price)}</b></div><div class="notice">Pesanan akan masuk ke database dan menunggu verifikasi.</div></aside>
  </div>`;
  $("#payment").onchange=e=>$("#qrisBox").style.display=e.target.value==="QRIS"?"block":"none";
  $("#orderForm").onsubmit=async e=>{
    e.preventDefault();
    const btn=$("#submitOrder"), f=new FormData(e.target), proof=f.get("proof");
    if(!proof?.size)return alert("Bukti transfer wajib diupload.");
    if(proof.size>5*1024*1024)return alert("Ukuran bukti maksimal 5 MB.");
    btn.disabled=true;btn.textContent="Mengirim...";
    try{
      if(!window.supabaseClient)throw new Error("Supabase belum terhubung.");
      const code="KO-"+Date.now().toString(36).toUpperCase();
      const safe=proof.name.replace(/[^a-zA-Z0-9._-]/g,"_");
      const path=`${code}/${crypto.randomUUID()}-${safe}`;
      const up=await window.supabaseClient.storage.from("payment-proofs").upload(path,proof,{contentType:proof.type});
      if(up.error)throw up.error;
      const {data,error}=await window.supabaseClient.from("orders").insert({
        order_code:code,product_id:cart.id,product_name:cart.name,buyer_name:f.get("buyer"),
        whatsapp:f.get("wa"),detail:f.get("detail"),payment_method:f.get("payment"),
        amount:cart.price,status:"Menunggu Verifikasi",proof_path:path
      }).select().single();
      if(error){await window.supabaseClient.storage.from("payment-proofs").remove([path]);throw error;}
      localStorage.removeItem("ko_cart");localStorage.setItem("ko_last_order_id",data.id||code);
      location.href="orders.html";
    }catch(err){console.error(err);alert("Pesanan gagal: "+err.message);btn.disabled=false;btn.textContent="Buat Pesanan →";}
  };
}

async function orders(){
  const box=$("#orders"); if(!box)return;
  if(!window.supabaseClient){box.innerHTML=`<div class="empty">Supabase belum terhubung.</div>`;return;}
  const {data,error}=await window.supabaseClient.from("orders").select("*").order("created_at",{ascending:false}).limit(50);
  if(error){box.innerHTML=`<div class="empty">${esc(error.message)}</div>`;return;}
  if(!data?.length){box.innerHTML=`<div class="empty">Belum ada riwayat transaksi.</div>`;return;}
  const html=await Promise.all(data.map(async o=>{
    let proof="";
    if(o.proof_path){
      const s=await window.supabaseClient.storage.from("payment-proofs").createSignedUrl(o.proof_path,3600);
      if(s.data?.signedUrl) proof=`<a class="cta small" target="_blank" href="${s.data.signedUrl}">Lihat Bukti</a>`;
    }
    return `<article class="order-card"><div class="row"><div><b>${esc(o.product_name)}</b><div class="muted">${esc(o.order_code||o.id)} • ${new Date(o.created_at).toLocaleString("id-ID")}</div></div><span class="badge">${esc(o.status)}</span></div><hr style="border-color:#17344f"><div class="order-row"><span>Pelanggan</span><b>${esc(o.buyer_name)}</b></div><div class="order-row"><span>Pembayaran</span><b>${esc(o.payment_method)}</b></div><div class="order-row"><span>Total</span><b class="price">${money(o.amount)}</b></div><div class="order-row"><span>Bukti</span>${proof||"<span class='muted'>Tersimpan</span>"}</div><div class="muted" style="margin-top:8px">${esc(o.detail)}</div></article>`;
  }));
  box.innerHTML=html.join("");
}

document.addEventListener("DOMContentLoaded",()=>{
  bindGlobal();renderHome();
  const p=document.body.dataset.page;
  if(p==="game"||p==="virtual"||p==="logo")productPage(p);
  if(p==="checkout")checkout();
  if(p==="orders")orders();
});
