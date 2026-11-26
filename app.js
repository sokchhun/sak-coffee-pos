const FIXED_API_URL = 'https://script.google.com/macros/s/AKfycbyKb-JDPQ-UPZJncjuMaRFsvNrm4sfSXf_cXKbjgl9XVAv6euVMz-U1ZIUjNDk-rwJC/exec';
const STORAGE_KEY = 'sak_coffee_pos_legacy_v1';

const DEFAULT_DATA = {
  settings: {
    shopName: 'ស័ក្តិ កាហ្វេ (Sak Coffee)',
    shopAddress: 'ព្រែកលៀប ភ្នំពេញ | Tel: 012 796 756',
    exchangeRate: 4100,
    apiUrl: FIXED_API_URL,
    khqrImage: '',
    loginPin: '',
    adminPin: '',
    apiKey: ''
  },
  categories: [
    { id: 1, name: 'កាហ្វេ (Coffee)', icon: '☕' },
    { id: 2, name: 'តែ & តែបៃតង', icon: '🍵' },
    { id: 3, name: 'ភេសជ្ជៈត្រជាក់/ផ្លែឈើ', icon: '🥤' },
    { id: 4, name: 'នំ & អាហារសម្រន់', icon: '🥐' }
  ],
  products: [
    { id: 1, category_id: 1, name: 'Iced Americano', price_usd: 1.50, cost_usd: 0.45, icon: '☕', image_url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=300&q=80', has_sweet_ice: true, is_available: true },
    { id: 2, category_id: 1, name: 'Iced Latte', price_usd: 2.00, cost_usd: 0.70, icon: '🥛', image_url: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=300&q=80', has_sweet_ice: true, is_available: true },
    { id: 3, category_id: 1, name: 'កាហ្វេទឹកដោះគោខាប់', price_usd: 1.75, cost_usd: 0.60, icon: '🧋', image_url: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=300&q=80', has_sweet_ice: true, is_available: true },
    { id: 4, category_id: 1, name: 'កាហ្វេពងមាន់ (Egg Coffee)', price_usd: 2.50, cost_usd: 0.90, icon: '🥚', image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=300&q=80', has_sweet_ice: true, is_available: true },
    { id: 5, category_id: 2, name: 'Matcha Latte', price_usd: 2.25, cost_usd: 0.85, icon: '🍵', image_url: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&w=300&q=80', has_sweet_ice: true, is_available: true },
    { id: 6, category_id: 2, name: 'តែក្រូចឆ្មារ (Lemon Tea)', price_usd: 1.50, cost_usd: 0.40, icon: '🍋', image_url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=300&q=80', has_sweet_ice: true, is_available: true },
    { id: 7, category_id: 3, name: 'Passion Soda', price_usd: 1.75, cost_usd: 0.50, icon: '🥤', image_url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=300&q=80', has_sweet_ice: true, is_available: true },
    { id: 8, category_id: 4, name: 'Croissant ប័រ', price_usd: 1.75, cost_usd: 0.80, icon: '🥐', image_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=300&q=80', has_sweet_ice: false, is_available: true }
  ],
  discounts: [
    { id: 1, name: 'និស្សិត CADT (10%)', type: 'percent', value: 10 },
    { id: 2, name: 'យកកែវមកខ្លួនឯង (-$0.25)', type: 'fixed', value: 0.25 }
  ],
  orders: [],
  heldOrders: [],
  deletedOrderCodes: [],
  deletedOrderIds: []
};

function injectSelectOptionStyles() {
  if (document.getElementById('sakSelectFixStyle')) return;
  const st = document.createElement('style');
  st.id = 'sakSelectFixStyle';
  st.textContent = `
    select, select option {
      background-color: #ffffff;
      color: #1f2937;
    }
    .view.active select {
      pointer-events: auto;
      opacity: 1;
    }
  `;
  document.head.appendChild(st);
}

function loadInitialState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return JSON.parse(JSON.stringify(DEFAULT_DATA));
    const parsed = JSON.parse(raw);
    const merged = {
      ...JSON.parse(JSON.stringify(DEFAULT_DATA)),
      ...parsed,
      settings: {
        ...DEFAULT_DATA.settings,
        ...(parsed.settings || {}),
        apiUrl: ((parsed.settings && parsed.settings.apiUrl) || '').trim() || FIXED_API_URL
      },
      categories: (Array.isArray(parsed.categories) && parsed.categories.length)
        ? parsed.categories
        : JSON.parse(JSON.stringify(DEFAULT_DATA.categories)),
      products: (Array.isArray(parsed.products) && parsed.products.length)
        ? parsed.products
        : JSON.parse(JSON.stringify(DEFAULT_DATA.products)),
      discounts: (Array.isArray(parsed.discounts) && parsed.discounts.length)
        ? parsed.discounts
        : JSON.parse(JSON.stringify(DEFAULT_DATA.discounts))
    };
    if (!Array.isArray(merged.orders)) merged.orders = [];
    if (!Array.isArray(merged.heldOrders)) merged.heldOrders = [];
    if (!Array.isArray(merged.deletedOrderCodes)) merged.deletedOrderCodes = [];
    if (!Array.isArray(merged.deletedOrderIds)) merged.deletedOrderIds = [];
    return merged;
  } catch (e) {
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
  }
}

let state = loadInitialState();
let cart = [];
let activeCat = 'all';
let expandedCartIdx = -1;
let selectedPay = 'Cash';
let receivedStr = '0';
let coCurrency = 'USD';
let catalogDirty = false;
let adminUnlocked = false;
let sessionLoggedIn = false;
let editingOrder = null;

function getApiUrl() {
  return ((state && state.settings && state.settings.apiUrl) || '').trim() || FIXED_API_URL;
}

function getApiKey() {
  return ((state && state.settings && state.settings.apiKey) || '').trim();
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  updateSyncIndicator();
  renderHeldOrders();
}

function fmtUsd(n) { return '$' + Number(n || 0).toFixed(2); }
function fmtKhr(usd) { return Math.round((usd || 0) * Number(state.settings.exchangeRate || 4100)).toLocaleString('en-US') + ' ៛'; }

function toLocalDateStr(d) {
  if (!d) return '';
  if (d instanceof Date) {
    if (isNaN(d.getTime())) return '';
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  const s = String(d).trim();
  const dmy = s.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/);
  if (dmy) return dmy[3] + '-' + String(dmy[2]).padStart(2, '0') + '-' + String(dmy[1]).padStart(2, '0');
  const dt = new Date(s);
  if (isNaN(dt.getTime())) return '';
  return dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0') + '-' + String(dt.getDate()).padStart(2, '0');
}

function extractOrderItems(o) {
  if (!o) return [];
  if (Array.isArray(o.items) && o.items.length) return o.items;
  const fields = [o.items, o.items_json, o.items_JSON];
  for (let i = 0; i < fields.length; i++) {
    const f = fields[i];
    if (typeof f === 'string' && f.trim().startsWith('[')) {
      try {
        const arr = JSON.parse(f);
        if (Array.isArray(arr) && arr.length) return arr;
      } catch (e) {}
    }
  }
  return [];
}

function sanitizeItemsForPayload(items) {
  if (!Array.isArray(items)) return [];
  return items.map(item => ({
    product_id: item.product_id || '',
    name: String(item.name || item.product_name || '').trim(),
    qty: Number(item.qty || 1),
    unit_price: Number(item.unit_price ?? item.unit_price_usd ?? 0),
    unit_cost: Number(item.unit_cost ?? item.unit_cost_usd ?? 0),
    size: String(item.size || ''),
    sugar_level: String(item.sugar_level || ''),
    ice_level: String(item.ice_level || ''),
    note: String(item.note || '')
  }));
}

function verifyAdminPin(actionLabel) {
  const pin = String((state.settings && state.settings.adminPin) || '').trim();
  if (!pin || adminUnlocked) return true;
  const entered = prompt('🔐 សូមបញ្ចូលលេខកូដសម្ងាត់អ្នកគ្រប់គ្រង (Admin PIN) ដើម្បី' + (actionLabel || 'ចូលប្រើ') + '៖');
  if (entered === null) return false;
  if (String(entered).trim() === pin) {
    adminUnlocked = true;
    return true;
  }
  alert('❌ លេខកូដសម្ងាត់មិនត្រឹមត្រូវទេ!');
  return false;
}

function switchView(name, btn) {
  if (name === 'menu' || name === 'reports' || name === 'settings') {
    const labels = { menu: 'គ្រប់គ្រងម៉ឺនុយ', reports: 'មើលរបាយការណ៍', settings: 'ចូលកំណត់ប្រព័ន្ធ' };
    if (!verifyAdminPin(labels[name])) return;
  }
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const targetView = document.getElementById('view-' + name);
  if (targetView) targetView.classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  if (name === 'orders') {
    renderOrders();
    if (navigator.onLine) pullFromBackend(true);
  }
  if (name === 'menu') {
    renderCategories();
    renderMenuTable();
  }
  if (name === 'reports') renderReports();
  if (name === 'settings') renderSettings();
}

function populateCategorySelect(prevValOverride) {
  const pCat = document.getElementById('pCat');
  if (!pCat) return;
  const cats = (Array.isArray(state.categories) && state.categories.length)
    ? state.categories
    : DEFAULT_DATA.categories;
  const prevVal = prevValOverride !== undefined ? String(prevValOverride) : String(pCat.value || '');
  pCat.disabled = false;
  pCat.innerHTML = cats
    .map(c => '<option value="' + String(c.id).replace(/"/g, '&quot;') + '">' + (c.icon || '') + ' ' + String(c.name || '') + '</option>')
    .join('');
  if (prevVal && cats.some(c => String(c.id) === prevVal)) {
    pCat.value = prevVal;
  } else if (cats.length) {
    pCat.value = String(cats[0].id);
  }
}

function renderCategories() {
  const bar = document.getElementById('catBar');
  if (bar) {
    let html = '<button class="cat-btn ' + (activeCat === 'all' ? 'active' : '') + '" onclick="setCat(\'all\')">ទាំងអស់</button>';
    state.categories.forEach(c => {
      const cidStr = String(c.id).replace(/'/g, "\\'");
      html += '<button class="cat-btn ' + (String(activeCat) === String(c.id) ? 'active' : '') + '" onclick="setCat(\'' + cidStr + '\')">' + (c.icon || '') + ' ' + c.name + '</button>';
    });
    bar.innerHTML = html;
  }
  populateCategorySelect();
}

function setCat(id) { activeCat = id; renderCategories(); renderProducts(); }

function renderProducts() {
  const grid = document.getElementById('productGrid');
  if (!grid) return;
  const q = (document.getElementById('searchInput')?.value || '').toLowerCase();
  const filtered = state.products.filter(p => (activeCat === 'all' || String(p.category_id) === String(activeCat)) && String(p.name || '').toLowerCase().includes(q));
  grid.innerHTML = filtered.map(p => {
    const pidStr = String(p.id).replace(/'/g, "\\'");
    const qtyInCart = cart.filter(c => String(c.product_id) === String(p.id)).reduce((s, c) => s + c.qty, 0);
    const imgSrc = p.image_url || 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=300&q=80';
    return '<div class="prod-card ' + (p.is_available === false ? 'soldout' : '') + '" onclick="addToCart(\'' + pidStr + '\')">' +
      (qtyInCart ? '<span class="prod-badge">' + qtyInCart + '</span>' : '') +
      '<img class="prod-img" src="' + imgSrc + '" onerror="this.onerror=null;this.src=\'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=300&q=80\';">' +
      '<div class="prod-name">' + p.name + '</div>' +
      '<div class="prod-price">' + fmtUsd(p.price_usd) + '</div>' +
    '</div>';
  }).join('');
}

function isDrinkProduct(p) {
  if (!p) return true;
  const pid = p.product_id !== undefined ? p.product_id : p.id;
  const prod = state.products.find(x => String(x.id) === String(pid)) || p;
  if (prod.has_sweet_ice === false || prod.has_sweet_ice === 0 || String(prod.has_sweet_ice).toUpperCase() === 'FALSE') return false;
  if (prod.has_sweet_ice === true || prod.has_sweet_ice === 1 || String(prod.has_sweet_ice).toUpperCase() === 'TRUE') return true;
  if (p.is_drink === false) return false;
  const catId = Number(prod.category_id);
  const cat = (state.categories || []).find(c => String(c.id) === String(prod.category_id));
  const text = ((cat && cat.name ? cat.name : '') + ' ' + (prod.name || '')).toLowerCase();
  const nonDrinkKeywords = ['នំ', 'អាហារ', 'សម្រន់', 'បាយ', 'គុយទាវ', 'សាំងវិច', 'ខេក', 'food', 'snack', 'cake', 'bread', 'croissant', 'sandwich'];
  if (nonDrinkKeywords.some(kw => text.includes(kw)) || catId === 4) return false;
  return true;
}

function addToCart(prodId) {
  const p = state.products.find(x => String(x.id) === String(prodId));
  if (!p) return;
  const drink = isDrinkProduct(p);
  const defSize = drink ? 'M' : '';
  const defSugar = drink ? '50%' : '';
  const defIce = drink ? 'ធម្មតា' : '';
  const idx = cart.findIndex(c => String(c.product_id) === String(prodId) && (c.size || '') === defSize && (c.sugar_level || '') === defSugar && (c.ice_level || '') === defIce && !c.note);
  if (idx > -1) cart[idx].qty++;
  else cart.push({
    product_id: p.id, name: p.name, base_price: Number(p.price_usd), unit_price: Number(p.price_usd),
    unit_cost: Number(p.cost_usd || 0), qty: 1, size: defSize, sugar_level: defSugar, ice_level: defIce, note: '', is_drink: drink
  });
  renderCart();
  renderProducts();
}

function renderDiscountOptions() {
  const sel = document.getElementById('discountSelect');
  if (!sel) return;
  const cur = sel.value;
  sel.innerHTML = '<option value="none">គ្មានបញ្ចុះតម្លៃ</option>' +
    state.discounts.map(d => '<option value="d_' + d.id + '">' + d.name + '</option>').join('') +
    '<option value="custom">បញ្ចុះផ្ទាល់ដៃ ($)</option>';
  if (cur && Array.from(sel.options).some(o => o.value === cur)) sel.value = cur;
}

function calcTotals() {
  const subtotal = cart.reduce((s, i) => s + i.unit_price * i.qty, 0);
  const sel = document.getElementById('discountSelect')?.value || 'none';
  const customInput = document.getElementById('customDiscount');
  if (customInput) customInput.style.display = sel === 'custom' ? 'block' : 'none';
  let discount = 0, discountName = '';
  if (sel === 'custom') {
    discount = Math.min(subtotal, Math.max(0, Number(customInput?.value || 0)));
    discountName = 'Custom';
  } else if (sel.startsWith('d_')) {
    const d = state.discounts.find(x => 'd_' + x.id === sel);
    if (d) {
      discountName = d.name;
      discount = d.type === 'percent' ? subtotal * (d.value / 100) : Math.min(subtotal, d.value);
    }
  }
  const total = Math.max(0, subtotal - discount);
  return { subtotal, discount, discountName, total };
}

function renderCart() {
  const list = document.getElementById('cartList');
  if (!list) return;
  if (!cart.length) {
    list.innerHTML = '<div class="cart-empty">ចុចលើទំនិញខាងស្តាំដើម្បីបញ្ចូលក្នុងកន្ត្រក</div>';
  } else {
    list.innerHTML = cart.map((item, idx) => {
      const showDrinkMods = isDrinkProduct(item);
      const sizeLabel = (showDrinkMods && item.size) ? ' (' + item.size + ')' : '';
      const metaParts = [fmtUsd(item.unit_price)];
      if (showDrinkMods) {
        if (item.sugar_level) metaParts.push('ផ្អែម ' + item.sugar_level);
        if (item.ice_level) metaParts.push('ទឹកកក ' + item.ice_level);
      }
      if (item.note) metaParts.push(item.note);
      const drinkHtml = showDrinkMods ? (
        '<div class="mod-line"><span class="mod-label">ទំហំ</span>' +
          ['M','L'].map(sz => '<button class="chip ' + ((item.size || 'M')===sz?'active':'') + '" onclick="setMod(' + idx + ',\'size\',\'' + sz + '\')">' + (sz==='L'?'L (+$0.50)':'M') + '</button>').join('') +
        '</div>' +
        '<div class="mod-line"><span class="mod-label">ផ្អែម</span>' +
          ['0%','25%','50%','75%','100%'].map(s => '<button class="chip ' + ((item.sugar_level || '50%')===s?'active':'') + '" onclick="setMod(' + idx + ',\'sugar_level\',\'' + s + '\')">' + s + '</button>').join('') +
        '</div>' +
        '<div class="mod-line"><span class="mod-label">ទឹកកក</span>' +
          ['ធម្មតា','តិច','គ្មាន'].map(ic => '<button class="chip ' + ((item.ice_level || 'ធម្មតា')===ic?'active':'') + '" onclick="setMod(' + idx + ',\'ice_level\',\'' + ic + '\')">' + ic + '</button>').join('') +
        '</div>'
      ) : '';
      return '<div class="cart-row ' + (expandedCartIdx === idx ? 'expanded' : '') + '">' +
        '<div class="cart-row-main" onclick="toggleExpand(' + idx + ')">' +
          '<div><div class="cart-item-name">' + item.name + sizeLabel + '</div><div class="cart-item-meta">' + metaParts.join(' • ') + '</div></div>' +
          '<div class="inline-qty" onclick="event.stopPropagation()"><button onclick="changeQty(' + idx + ', -1)">−</button><strong style="min-width:20px; text-align:center;">' + item.qty + '</strong><button onclick="changeQty(' + idx + ', 1)">+</button></div>' +
          '<div style="text-align:right; font-weight:700;">' + fmtUsd(item.unit_price * item.qty) + '</div>' +
          '<div style="text-align:center;" onclick="event.stopPropagation()"><button class="btn-x" onclick="removeCartItem(' + idx + ')">✖</button></div>' +
        '</div>' +
        '<div class="cart-mod">' +
          '<div class="mod-line"><span class="mod-label">ចំនួន</span><button class="qty-btn" onclick="changeQty(' + idx + ', -1)">-</button><strong style="padding:0 6px;">' + item.qty + '</strong><button class="qty-btn" onclick="changeQty(' + idx + ', 1)">+</button><span style="margin-left:auto;"></span><button class="btn btn-danger btn-sm" onclick="removeCartItem(' + idx + ')">លុប</button></div>' +
          drinkHtml +
          '<div class="mod-line"><span class="mod-label">ចំណាំ</span><input value="' + (item.note || '') + '" placeholder="បន្ថែមកំណត់ចំណាំ..." style="flex:1; padding:4px 8px; border:1px solid var(--border); border-radius:6px; font-size:12px;" onchange="setMod(' + idx + ',\'note\',this.value)"></div>' +
        '</div></div>';
    }).join('');
  }
  const t = calcTotals();
  document.getElementById('sumSubtotal').textContent = fmtUsd(t.subtotal);
  document.getElementById('sumDiscount').textContent = '-' + fmtUsd(t.discount);
  document.getElementById('sumTotal').textContent = fmtUsd(t.total);
  document.getElementById('sumKhr').textContent = fmtKhr(t.total);
}

function toggleExpand(idx) { expandedCartIdx = expandedCartIdx === idx ? -1 : idx; renderCart(); }
function changeQty(idx, delta) { cart[idx].qty += delta; if (cart[idx].qty <= 0) cart.splice(idx, 1); renderCart(); renderProducts(); }
function removeCartItem(idx) { cart.splice(idx, 1); expandedCartIdx = -1; renderCart(); renderProducts(); }
function setMod(idx, key, val) {
  cart[idx][key] = val;
  if (key === 'size') cart[idx].unit_price = cart[idx].base_price + (val === 'L' ? 0.5 : 0);
  renderCart();
}
function clearCart() { cart = []; expandedCartIdx = -1; const ds = document.getElementById('discountSelect'); if (ds) ds.value = 'none'; renderCart(); renderProducts(); }

function setCoCurrency(curr) {
  const rate = Number(state.settings.exchangeRate || 4100);
  const currentNum = Number(receivedStr || 0);
  if (curr !== coCurrency) {
    if (curr === 'KHR') receivedStr = String(Math.round((currentNum * rate) / 100) * 100 || 0);
    else {
      const usdVal = currentNum / rate;
      receivedStr = usdVal > 0 ? usdVal.toFixed(2) : '0';
    }
    coCurrency = curr;
  }
  document.getElementById('btnCurrUsd')?.classList.toggle('active', curr === 'USD');
  document.getElementById('btnCurrKhr')?.classList.toggle('active', curr === 'KHR');
  const lbl = document.getElementById('coRecLabel');
  if (lbl) lbl.textContent = curr === 'USD' ? 'ប្រាក់ទទួល (USD $)' : 'ប្រាក់ទទួល (KHR ៛)';
  updateCheckoutCalc(true);
  const inp = document.getElementById('coReceived');
  if (inp) { inp.focus(); inp.select(); }
}

function openCheckout() {
  if (!cart.length) return alert('សូមជ្រើសរើសទំនិញជាមុនសិន!');
  const t = calcTotals();
  document.getElementById('coTotalUsd').textContent = fmtUsd(t.total);
  document.getElementById('coTotalKhr').textContent = fmtKhr(t.total);
  coCurrency = 'USD';
  receivedStr = t.total.toFixed(2);
  document.getElementById('btnCurrUsd')?.classList.add('active');
  document.getElementById('btnCurrKhr')?.classList.remove('active');
  const lbl = document.getElementById('coRecLabel');
  if (lbl) lbl.textContent = 'ប្រាក់ទទួល (USD $)';
  updateCheckoutCalc(true);
  document.getElementById('checkoutModal')?.classList.add('open');
  setTimeout(() => { const el = document.getElementById('coReceived'); if (el) { el.focus(); el.select(); } }, 50);
}
function closeCheckout() { document.getElementById('checkoutModal')?.classList.remove('open'); }
function selectPay(method, btn) {
  selectedPay = method;
  document.querySelectorAll('.pay-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const box = document.getElementById('khqrBox');
  const img = document.getElementById('khqrPreview');
  const ph = document.getElementById('khqrPlaceholder');
  if (!box) return;
  if (method !== 'Cash') {
    box.style.display = 'block';
    if (state.settings.khqrImage && img) { img.src = state.settings.khqrImage; img.style.display = 'block'; if (ph) ph.style.display = 'none'; }
    else { if (img) img.style.display = 'none'; if (ph) ph.style.display = 'block'; }
  } else box.style.display = 'none';
}
function numKey(k) {
  if (k === 'C') receivedStr = '0';
  else if (k === 'BKSP') receivedStr = receivedStr.length > 1 ? receivedStr.slice(0, -1) : '0';
  else if (k === '.' && (coCurrency === 'KHR' || receivedStr.includes('.'))) return;
  else receivedStr = receivedStr === '0' && k !== '.' ? k : receivedStr + k;
  updateCheckoutCalc(true);
}
function setExactCash() {
  const totalUsd = calcTotals().total;
  const rate = Number(state.settings.exchangeRate || 4100);
  receivedStr = coCurrency === 'KHR' ? String(Math.ceil((totalUsd * rate) / 100) * 100) : totalUsd.toFixed(2);
  updateCheckoutCalc(true);
}
function addCash(amt) {
  const rate = Number(state.settings.exchangeRate || 4100);
  receivedStr = coCurrency === 'KHR' ? String(Number(receivedStr || 0) + Math.round(amt * rate)) : (Number(receivedStr || 0) + amt).toFixed(2);
  updateCheckoutCalc(true);
}
function addCashKhr(khr) {
  const rate = Number(state.settings.exchangeRate || 4100);
  receivedStr = coCurrency === 'KHR' ? String(Number(receivedStr || 0) + khr) : (Number(receivedStr || 0) + (khr / rate)).toFixed(2);
  updateCheckoutCalc(true);
}
function onCoReceivedInput(val) {
  const inp = document.getElementById('coReceived');
  const pattern = coCurrency === 'KHR' ? /[^0-9]/g : /[^0-9.]/g;
  let raw = String(val || '').replace(pattern, '');
  if (coCurrency !== 'KHR') {
    const dotIdx = raw.indexOf('.');
    if (dotIdx !== -1) raw = raw.slice(0, dotIdx + 1) + raw.slice(dotIdx + 1).replace(/\./g, '');
  }
  if (raw.length > 1 && raw[0] === '0' && raw[1] !== '.') raw = raw.replace(/^0+/, '');
  if (inp && inp.value !== raw) inp.value = raw;
  receivedStr = raw === '' ? '0' : raw;
  updateCheckoutCalc(false);
}
function updateCheckoutCalc(syncInput) {
  const t = calcTotals();
  const rate = Number(state.settings.exchangeRate || 4100);
  const rawNum = Number(receivedStr || 0);
  const recUsd = coCurrency === 'KHR' ? (rawNum / rate) : rawNum;
  const chgUsd = Math.max(0, recUsd - t.total);
  const inpUsd = document.getElementById('coReceived');
  if (inpUsd && syncInput !== false) inpUsd.value = receivedStr;
  const chgEl = document.getElementById('coChange');
  if (chgEl) chgEl.textContent = fmtUsd(chgUsd) + ' (' + fmtKhr(chgUsd) + ')';
}

async function completeOrder(doPrint) {
  const t = calcTotals();
  const now = new Date();
  const code = 'SC-' + now.toISOString().slice(2,10).replace(/-/g,'') + '-' + String(state.orders.length + 1).padStart(3, '0') + '-' + String(now.getTime()).slice(-4);
  const itemsCopy = sanitizeItemsForPayload(cart);
  const order = {
    id: Date.now(),
    order_code: code,
    subtotal: Number(t.subtotal.toFixed(2)),
    discount_name: t.discountName,
    discount: Number(t.discount.toFixed(2)),
    total_usd: Number(t.total.toFixed(2)),
    exchange_rate: Number(state.settings.exchangeRate || 4100),
    total_khr: Math.round(t.total * Number(state.settings.exchangeRate || 4100)),
    payment_method: selectedPay,
    order_type: document.getElementById('orderTypeSelect')?.value || 'Takeaway',
    created_at: now.toISOString(),
    synced: false,
    items: itemsCopy,
    items_json: JSON.stringify(itemsCopy)
  };
  state.orders.unshift(order);
  saveState();
  closeCheckout();
  clearCart();
  if (doPrint) printReceipt(order);
  if (getApiUrl() && navigator.onLine) {
    await pushOrderToBackend(order, 'create');
    renderOrders();
  }
}

function printReceipt(o) {
  const items = extractOrderItems(o);
  const el = document.getElementById('receipt-print');
  if (!el) return;
  el.innerHTML = '<div style="text-align:center; border-bottom:1px dashed #000; padding-bottom:6px; margin-bottom:6px;">' +
    '<div style="font-size:16px; font-weight:700;">' + state.settings.shopName + '</div>' +
    '<div style="font-size:11px;">' + state.settings.shopAddress + '</div>' +
    '<div style="font-size:11px; margin-top:4px;">' + o.order_code + ' • ' + new Date(o.created_at).toLocaleString() + '</div></div>' +
    '<table style="width:100%; font-size:12px; border-collapse:collapse;">' +
    items.map(i => {
      const drink = isDrinkProduct(i);
      const sizeLabel = (drink && i.size) ? ' (' + i.size + ')' : '';
      const subTxt = (drink && (i.sugar_level || i.ice_level))
        ? '<div style="font-size:10px;">ផ្អែម ' + (i.sugar_level || '-') + ', ទឹកកក ' + (i.ice_level || '-') + (i.note ? ' • ' + i.note : '') + '</div>'
        : (i.note ? '<div style="font-size:10px;">' + i.note + '</div>' : '');
      return '<tr><td>' + i.name + sizeLabel + ' x' + i.qty + subTxt + '</td><td style="text-align:right; vertical-align:top;">' + fmtUsd(i.unit_price * i.qty) + '</td></tr>';
    }).join('') +
    '</table><div style="border-top:1px dashed #000; margin-top:6px; padding-top:6px; font-size:12px;">' +
    '<div style="display:flex; justify-content:space-between;"><span>សរុបរង:</span><span>' + fmtUsd(o.subtotal) + '</span></div>' +
    (o.discount > 0 ? '<div style="display:flex; justify-content:space-between;"><span>បញ្ចុះតម្លៃ (' + o.discount_name + '):</span><span>-' + fmtUsd(o.discount) + '</span></div>' : '') +
    '<div style="display:flex; justify-content:space-between; font-weight:700; font-size:14px;"><span>ត្រូវបង់:</span><span>' + fmtUsd(o.total_usd) + '</span></div>' +
    '<div style="display:flex; justify-content:space-between;"><span>ប្រាក់រៀល:</span><span>' + Number(o.total_khr || 0).toLocaleString() + ' ៛</span></div>' +
    '<div style="display:flex; justify-content:space-between;"><span>ទូទាត់:</span><span>' + o.payment_method + ' (' + o.order_type + ')</span></div></div>' +
    '<div style="text-align:center; margin-top:10px; font-size:11px;">សូមអរគុណ! សង្ឃឹមថាបានជួបគ្នាម្តងទៀត ☕</div>';
  window.print();
}

async function syncCatalogToBackend(showToast) {
  const url = getApiUrl();
  if (!url) return false;
  catalogDirty = true;
  updateSyncIndicator();
  if (!navigator.onLine) return false;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'sync_catalog',
        categories: state.categories,
        products: state.products,
        discounts: state.discounts,
        apiKey: getApiKey()
      })
    });
    const data = await res.json();
    if (data.status === 'success') {
      catalogDirty = false;
      updateSyncIndicator();
      if (showToast) alert('✅ បាន Sync ម៉ឺនុយទៅ Google Sheets រួចរាល់!');
      return true;
    }
  } catch (e) {
    console.warn('Catalog sync failed:', e);
  }
  return false;
}

async function pushOrderToBackend(order, action) {
  const url = getApiUrl();
  if (!url) return false;
  try {
    const cleanItems = sanitizeItemsForPayload(extractOrderItems(order));
    const subVal = Number(order.subtotal ?? order.subtotal_usd ?? 0);
    const discVal = Number(order.discount ?? order.discount_usd ?? 0);
    const totVal = Number(order.total_usd ?? Math.max(0, subVal - discVal));
    const lightweightPayload = {
      action: action || 'create',
      id: order.id || '',
      order_code: String(order.order_code || '').trim(),
      subtotal: subVal,
      subtotal_usd: subVal,
      discount_name: String(order.discount_name || ''),
      discount: discVal,
      discount_usd: discVal,
      total_usd: totVal,
      exchange_rate: Number(order.exchange_rate || state.settings.exchangeRate || 4100),
      total_khr: Number(order.total_khr || Math.round(totVal * Number(order.exchange_rate || state.settings.exchangeRate || 4100))),
      payment_method: String(order.payment_method || 'Cash'),
      order_type: String(order.order_type || 'Takeaway'),
      created_at: String(order.created_at || new Date().toISOString()),
      items: cleanItems,
      items_json: JSON.stringify(cleanItems),
      apiKey: getApiKey()
    };
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(lightweightPayload)
    });
    const data = await res.json();
    if (data.status === 'success') {
      if (action !== 'delete') { order.synced = true; saveState(); }
      return true;
    }
  } catch (e) { console.warn('Sync offline:', e); }
  return false;
}

let isSyncing = false;
async function syncPendingOrders() {
  if (isSyncing) return;
  const url = getApiUrl();
  if (!url || !navigator.onLine) return;
  const pending = state.orders.filter(o => !o.synced);
  if (!pending.length && !catalogDirty) return;
  isSyncing = true;
  try {
    if (catalogDirty) await syncCatalogToBackend(false);
    for (let i = 0; i < pending.length; i++) {
      const o = pending[i];
      if (await pushOrderToBackend(o, o._syncAction || 'create')) delete o._syncAction;
    }
    saveState();
    renderOrders();
  } finally { isSyncing = false; }
}

async function syncAllNow() {
  if (!getApiUrl()) return alert('សូមបញ្ចូល Google Apps Script URL ក្នុងផ្ទាំង «⚙️ កំណត់» ជាមុនសិន!');
  if (!navigator.onLine) return alert('មិនមានអ៊ីនធឺណិតទេ! ប្រព័ន្ធកំពុងរក្សាទុកក្នុងម៉ាស៊ីន (Offline)។');
  await syncPendingOrders();
  await pullFromBackend(false);
}

let isPulling = false;
async function pullFromBackend(silent) {
  if (isPulling) return;
  const url = getApiUrl();
  if (!url || !navigator.onLine) return;
  if (catalogDirty) await syncCatalogToBackend(false);
  isPulling = true;
  try {
    const sep = url.includes('?') ? '&' : '?';
    const keyParam = getApiKey() ? ('&apiKey=' + encodeURIComponent(getApiKey())) : '';
    const res = await fetch(url + sep + '_t=' + Date.now() + keyParam, { cache: 'no-store' });
    const data = await res.json();
    if (data.status !== 'success') {
      if (!silent) alert('មិនអាចទាញទិន្នន័យពី Google Sheets បានទេ៖ ' + (data.message || ''));
      return;
    }
    if (Array.isArray(data.categories) && data.categories.length) {
      state.categories = data.categories.map((c, idx) => ({
        id: (c.id !== undefined && c.id !== '') ? c.id : (idx + 1),
        name: String(c.name || '').trim(),
        icon: String(c.icon || '☕')
      })).filter(c => c.name);
    }
    if (Array.isArray(data.products) && data.products.length) {
      const defMap = new Map(DEFAULT_DATA.products.map(dp => [String(dp.id), dp.image_url]));
      state.products = data.products.filter(p => p && p.name).map((p, idx) => {
        const pid = (p.id !== undefined && p.id !== '') ? p.id : (1000 + idx);
        return {
          ...p,
          id: pid,
          category_id: p.category_id || (state.categories[0] ? state.categories[0].id : 1),
          name: String(p.name).trim(),
          price_usd: Number(p.price_usd || 0),
          cost_usd: Number(p.cost_usd || 0),
          icon: String(p.icon || '☕'),
          image_url: p.image_url || defMap.get(String(pid)) || '',
          has_sweet_ice: p.has_sweet_ice === undefined || p.has_sweet_ice === '' ? undefined : (p.has_sweet_ice !== false && p.has_sweet_ice !== 0 && String(p.has_sweet_ice).toUpperCase() !== 'FALSE'),
          is_available: p.is_available !== false && p.is_available !== 'FALSE'
        };
      });
    }
    if (Array.isArray(data.discounts)) {
      state.discounts = data.discounts
        .filter(d => d && d.name && d.is_active !== false && d.is_active !== 'FALSE')
        .map((d, idx) => ({ id: d.id || (1000 + idx), name: String(d.name).trim(), type: d.type === 'fixed' ? 'fixed' : 'percent', value: Number(d.value || 0) }));
    }
    if (Array.isArray(data.orders)) {
      const deletedCodes = new Set((state.deletedOrderCodes || []).map(String));
      const deletedIds = new Set((state.deletedOrderIds || []).map(String));
      const existingByCode = new Map((state.orders || []).map(ex => [String(ex.order_code || ''), ex]));
      const itemsByOrderKey = new Map();
      if (Array.isArray(data.order_items)) {
        data.order_items.forEach(row => {
          if (!row) return;
          const keys = [String(row.order_code || '').trim(), String(row.order_id || '').trim()].filter(Boolean);
          const itemObj = {
            product_id: row.product_id || '',
            name: String(row.product_name || row.name || '').trim(),
            qty: Number(row.qty || 1),
            unit_price: Number(row.unit_price_usd !== undefined ? row.unit_price_usd : (row.unit_price || 0)),
            unit_cost: Number(row.unit_cost_usd !== undefined ? row.unit_cost_usd : (row.unit_cost || 0)),
            size: String(row.size || ''),
            sugar_level: String(row.sugar_level || ''),
            ice_level: String(row.ice_level || '')
          };
          if (!itemObj.name) return;
          keys.forEach(k => {
            if (!itemsByOrderKey.has(k)) itemsByOrderKey.set(k, []);
            itemsByOrderKey.get(k).push(itemObj);
          });
        });
      }
      const merged = new Map();
      data.orders.forEach((o, idx) => {
        const code = String(o.order_code || o.id || ('ROW-' + (idx + 1))).trim();
        const oid = String(o.id || '');
        if (!code || deletedCodes.has(code) || (oid && deletedIds.has(oid))) return;
        const pulledItems = extractOrderItems(o);
        const sheetOrderItems = itemsByOrderKey.get(code) || (oid ? itemsByOrderKey.get(oid) : null) || [];
        const prev = existingByCode.get(code);
        const finalItems = pulledItems.length ? pulledItems : (sheetOrderItems.length ? sheetOrderItems : (prev ? extractOrderItems(prev) : []));
        const sub = Number(o.subtotal !== undefined ? o.subtotal : (o.subtotal_usd !== undefined ? o.subtotal_usd : (o.total_usd || 0)));
        const disc = Number(o.discount !== undefined ? o.discount : (o.discount_usd || 0));
        const tot = Number(o.total_usd !== undefined ? o.total_usd : Math.max(0, sub - disc));
        merged.set(code, {
          ...o,
          id: o.id || (Date.now() + idx),
          order_code: code,
          subtotal: sub,
          discount: disc,
          total_usd: tot,
          exchange_rate: Number(o.exchange_rate || state.settings.exchangeRate || 4100),
          total_khr: Number(o.total_khr || Math.round(tot * Number(state.settings.exchangeRate || 4100))),
          payment_method: String(o.payment_method || 'Cash'),
          order_type: String(o.order_type || 'Takeaway'),
          created_at: String(o.created_at || new Date().toISOString()),
          items: finalItems,
          items_json: JSON.stringify(finalItems),
          synced: true
        });
      });
      (state.orders || []).forEach(localO => {
        const code = String(localO.order_code || '');
        if (!localO.synced && code && !deletedCodes.has(code)) merged.set(code, localO);
      });
      state.orders = Array.from(merged.values()).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    saveState();
    renderCategories();
    renderProducts();
    renderDiscountOptions();
    renderCart();
    renderOrders();
    renderMenuTable();
    renderReports();
    renderSettings();
    if (!silent) alert('✅ បានទាញទិន្នន័យពី Google Sheets រួចរាល់!');
  } catch (e) {
    if (!silent) alert('❌ មិនអាចភ្ជាប់ Google Sheets បានទេ៖ ' + e.message);
  } finally { isPulling = false; }
}

function updateSyncIndicator() {
  const dot = document.getElementById('syncDot');
  const txt = document.getElementById('syncText');
  if (!dot || !txt) return;
  const pending = state.orders.filter(o => !o.synced).length + (catalogDirty ? 1 : 0);
  if (!getApiUrl()) { dot.className = 'dot'; txt.textContent = 'Offline Only'; }
  else if (!navigator.onLine) { dot.className = 'dot pending'; txt.textContent = pending > 0 ? 'Offline (' + pending + ')' : 'Offline'; }
  else if (pending > 0) { dot.className = 'dot pending'; txt.textContent = 'រង់ចាំ Sync (' + pending + ')'; }
  else { dot.className = 'dot online'; txt.textContent = 'Cloud Synced'; }
}
window.addEventListener('offline', updateSyncIndicator);

function renderOrders() {
  const tbody = document.getElementById('ordersTable');
  if (!tbody) return;
  const todayStr = toLocalDateStr(new Date());
  const todayOrders = (state.orders || []).filter(o => o && toLocalDateStr(o.created_at) === todayStr);
  tbody.innerHTML = todayOrders.map(o => {
    const oidStr = String(o.id).replace(/'/g, "\\'");
    const arr = extractOrderItems(o);
    const itemsHtml = arr.length ? arr.map(i => (i.name || i.product_name || 'Item') + ' x' + (i.qty || 1)).join(', ') : '<span style="color:var(--muted);">មិនមានបញ្ជីមុខទំនិញ</span>';
    return '<tr>' +
      '<td><strong>' + o.order_code + '</strong></td>' +
      '<td>' + new Date(o.created_at).toLocaleString() + '</td>' +
      '<td>' + itemsHtml + '</td>' +
      '<td>' + (o.discount > 0 ? '-' + fmtUsd(o.discount) : '-') + '</td>' +
      '<td><strong>' + fmtUsd(o.total_usd) + '</strong></td>' +
      '<td>' + o.payment_method + '</td>' +
      '<td>' + (o.synced ? '✅' : '⏳') + '</td>' +
      '<td style="white-space:nowrap;">' +
        '<button class="btn btn-primary btn-sm" onclick="openEditOrder(\'' + oidStr + '\')">✏️ កែ</button> ' +
        '<button class="btn btn-light btn-sm" onclick="printOrderById(\'' + oidStr + '\')">🖨️</button> ' +
        '<button class="btn btn-danger btn-sm" onclick="deleteOrder(\'' + oidStr + '\')">លុប</button>' +
      '</td></tr>';
  }).join('') || '<tr><td colspan="8" style="text-align:center; color:var(--muted);">មិនទាន់មានប្រវត្តិលក់ថ្ងៃនេះនៅឡើយ</td></tr>';
}

function printOrderById(id) {
  const o = state.orders.find(x => String(x.id) === String(id));
  if (o) printReceipt(o);
}

function resizeImage(file, maxSize, cb) {
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      let w = img.width, h = img.height;
      if (w > h && w > maxSize) { h *= maxSize / w; w = maxSize; }
      else if (h > maxSize) { w *= maxSize / h; h = maxSize; }
      c.width = w; c.height = h;
      c.getContext('2d').drawImage(img, 0, 0, w, h);
      cb(c.toDataURL('image/jpeg', 0.78));
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function handleProdImage(e) {
  const f = e.target.files[0]; if (!f) return;
  resizeImage(f, 240, dataUrl => {
    document.getElementById('pImgData').value = dataUrl;
    const thumb = document.getElementById('pImgThumb');
    if (thumb) { thumb.src = dataUrl; thumb.style.display = 'inline-block'; }
    const st = document.getElementById('imgPreviewStatus');
    if (st) st.textContent = '✅ រូបភាពរួចរាល់!';
  });
}

async function saveProduct() {
  if (!verifyAdminPin('រក្សាទុក/កែប្រែម៉ឺនុយ')) return;
  const idVal = document.getElementById('editProdId').value;
  const existing = idVal ? state.products.find(p => String(p.id) === String(idVal)) : null;
  const sweetIceSel = document.getElementById('pHasSweetIce');
  const hasSweetIce = sweetIceSel ? (sweetIceSel.value !== '0') : true;
  const catVal = document.getElementById('pCat')?.value || (state.categories[0] ? state.categories[0].id : 1);
  const obj = {
    id: existing ? existing.id : Date.now(),
    name: document.getElementById('pName').value.trim(),
    category_id: isNaN(Number(catVal)) ? catVal : Number(catVal),
    price_usd: Number(document.getElementById('pPrice').value || 0),
    cost_usd: Number(document.getElementById('pCost').value || 0),
    icon: document.getElementById('pIcon')?.value || '☕',
    image_url: document.getElementById('pImgData').value,
    has_sweet_ice: hasSweetIce,
    is_available: existing ? (existing.is_available !== false) : true
  };
  if (!obj.name || obj.price_usd <= 0) return alert('សូមបញ្ចូលឈ្មោះ និងតម្លៃលក់!');
  const idx = existing ? state.products.findIndex(p => String(p.id) === String(existing.id)) : -1;
  if (idx > -1) state.products[idx] = obj; else state.products.push(obj);
  saveState(); resetProductForm(); renderMenuTable(); renderProducts();
  const synced = await syncCatalogToBackend(false);
  alert((idx > -1 ? 'បានកែប្រែទំនិញរួចរាល់!' : 'បានបន្ថែមទំនិញថ្មីរួចរាល់!') + (synced ? ' (បាន Sync ទៅ Google Sheets)' : ' (រក្សាទុកក្នុងម៉ាស៊ីន)'));
}

function editProduct(id) {
  const p = state.products.find(x => String(x.id) === String(id));
  if (!p) return alert('រកមិនឃើញទំនិញនេះទេ!');
  populateCategorySelect(p.category_id);
  document.getElementById('editProdId').value = String(p.id);
  document.getElementById('pName').value = p.name || '';
  const catSel = document.getElementById('pCat');
  if (catSel) catSel.value = String(p.category_id);
  document.getElementById('pPrice').value = p.price_usd || '';
  document.getElementById('pCost').value = p.cost_usd || 0;
  document.getElementById('pImgData').value = p.image_url || '';
  const sweetIceSel = document.getElementById('pHasSweetIce');
  if (sweetIceSel) sweetIceSel.value = isDrinkProduct(p) ? '1' : '0';
  const thumb = document.getElementById('pImgThumb');
  if (thumb) {
    if (p.image_url) { thumb.src = p.image_url; thumb.style.display = 'inline-block'; }
    else { thumb.src = ''; thumb.style.display = 'none'; }
  }
  const titleEl = document.getElementById('menuFormTitle');
  if (titleEl) titleEl.textContent = '✏️ កែប្រែទំនិញ (' + p.name + ')';
  const wrap = document.querySelector('#view-menu .page-wrap');
  if (wrap) wrap.scrollTo({ top: 0, behavior: 'smooth' });
  window.scrollTo({ top: 0, behavior: 'smooth' });
  setTimeout(() => { const inp = document.getElementById('pName'); if (inp) { inp.focus(); inp.select(); } }, 200);
}

function resetProductForm() {
  ['editProdId','pName','pPrice','pCost','pImgData','pImgFile'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const thumb = document.getElementById('pImgThumb');
  if (thumb) { thumb.src = ''; thumb.style.display = 'none'; }
  const st = document.getElementById('imgPreviewStatus');
  if (st) st.textContent = '';
  const titleEl = document.getElementById('menuFormTitle');
  if (titleEl) titleEl.textContent = '➕ បន្ថែមភេសជ្ជៈថ្មី';
  populateCategorySelect();
}

async function toggleStock(id) {
  if (!verifyAdminPin('ប្តូរស្ថានភាពស្តុកម៉ឺនុយ')) return;
  const p = state.products.find(x => String(x.id) === String(id));
  if (p) {
    p.is_available = p.is_available === false ? true : false;
    saveState(); renderMenuTable(); renderProducts();
    await syncCatalogToBackend(false);
  }
}

async function deleteProduct(id) {
  if (!verifyAdminPin('លុបម៉ឺនុយ')) return;
  if (!confirm('លុបទំនិញនេះចេញពីម៉ឺនុយ និង Google Sheets?')) return;
  state.products = state.products.filter(x => String(x.id) !== String(id));
  saveState(); renderMenuTable(); renderProducts();
  await syncCatalogToBackend(false);
}

function renderMenuTable() {
  populateCategorySelect();
  const tbody = document.getElementById('menuTable');
  if (!tbody) return;
  tbody.innerHTML = state.products.map(p => {
    const pidStr = String(p.id).replace(/'/g, "\\'");
    const catObj = state.categories.find(c => String(c.id) === String(p.category_id));
    const cat = catObj ? catObj.name : '-';
    return '<tr>' +
      '<td><img src="' + (p.image_url || 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=300&q=80') + '" style="width:42px;height:42px;border-radius:8px;object-fit:cover;"></td>' +
      '<td><strong>' + p.name + '</strong><div style="font-size:11px;color:var(--muted);">' + (isDrinkProduct(p) ? '🧊 មានស្ករ & ទឹកកក' : '🚫 គ្មានស្ករ & ទឹកកក') + '</div></td>' +
      '<td>' + cat + '</td>' +
      '<td>' + fmtUsd(p.price_usd) + '</td>' +
      '<td>' + fmtUsd(p.cost_usd) + '</td>' +
      '<td><button type="button" class="btn btn-sm ' + (p.is_available===false?'btn-light':'btn-success') + '" onclick="toggleStock(\'' + pidStr + '\')">' + (p.is_available===false?'អស់ស្តុក':'មានលក់') + '</button></td>' +
      '<td style="white-space:nowrap;">' +
        '<button type="button" class="btn btn-light btn-sm" onclick="editProduct(\'' + pidStr + '\')">កែ</button> ' +
        '<button type="button" class="btn btn-danger btn-sm" onclick="deleteProduct(\'' + pidStr + '\')">លុប</button>' +
      '</td></tr>';
  }).join('');
}

function initReportFilters() {
  const now = new Date();
  const todayLocal = toLocalDateStr(now);
  const rd = document.getElementById('repDate');
  const rm = document.getElementById('repMonth');
  const ry = document.getElementById('repYear');
  if (rd) rd.value = todayLocal;
  if (rm) rm.value = todayLocal.slice(0, 7);
  if (ry) {
    const curY = now.getFullYear();
    ry.innerHTML = [curY - 1, curY, curY + 1].map(y => '<option value="' + y + '" ' + (y===curY?'selected':'') + '>ឆ្នាំ ' + y + '</option>').join('');
  }
}

function renderReports() {
  const mode = document.getElementById('repMode')?.value || 'daily';
  const rd = document.getElementById('repDate');
  const rm = document.getElementById('repMonth');
  const ry = document.getElementById('repYear');
  const yc = document.getElementById('yearlyChartCard');
  if (rd) rd.style.display = mode === 'daily' ? 'inline-block' : 'none';
  if (rm) rm.style.display = mode === 'monthly' ? 'inline-block' : 'none';
  if (ry) ry.style.display = mode === 'yearly' ? 'inline-block' : 'none';
  if (yc) yc.style.display = mode === 'yearly' ? 'block' : 'none';

  const dVal = rd?.value || '';
  const mVal = rm?.value || '';
  const yVal = ry?.value || '';

  const filtered = state.orders.filter(o => {
    const dt = toLocalDateStr(o.created_at);
    if (mode === 'daily') return dt === dVal;
    if (mode === 'monthly') return dt.startsWith(mVal);
    return dt.startsWith(yVal);
  });

  const rev = filtered.reduce((s, o) => s + Number(o.total_usd || 0), 0);
  const disc = filtered.reduce((s, o) => s + Number(o.discount || 0), 0);
  const cost = filtered.reduce((s, o) => s + extractOrderItems(o).reduce((is, i) => is + Number(i.unit_cost || 0) * Number(i.qty || 1), 0), 0);
  const profit = rev - cost;

  document.getElementById('kpiRev').textContent = fmtUsd(rev);
  document.getElementById('kpiRevKhr').textContent = fmtKhr(rev);
  document.getElementById('kpiProfit').textContent = fmtUsd(profit);
  document.getElementById('kpiCost').textContent = 'ដើមទុន: ' + fmtUsd(cost);
  document.getElementById('kpiCount').textContent = filtered.length;
  document.getElementById('kpiAvg').textContent = 'មធ្យម: ' + fmtUsd(filtered.length ? rev / filtered.length : 0);
  document.getElementById('kpiDisc').textContent = fmtUsd(disc);

  const byPay = {};
  filtered.forEach(o => {
    byPay[o.payment_method] = byPay[o.payment_method] || { count: 0, sum: 0 };
    byPay[o.payment_method].count++;
    byPay[o.payment_method].sum += Number(o.total_usd || 0);
  });
  document.getElementById('repPayTable').innerHTML = Object.entries(byPay).map(([k, v]) =>
    '<tr><td><strong>' + k + '</strong></td><td style="text-align:center;">' + v.count + '</td><td style="text-align:right;">' + fmtUsd(v.sum) + '</td></tr>'
  ).join('') || '<tr><td colspan="3" style="text-align:center; color:var(--muted);">គ្មានទិន្នន័យ</td></tr>';

  const byItem = {};
  filtered.forEach(o => {
    const arr = extractOrderItems(o);
    arr.forEach(i => {
      const k = i.name || 'Unknown';
      byItem[k] = byItem[k] || { qty: 0, rev: 0 };
      byItem[k].qty += Number(i.qty || 1);
      byItem[k].rev += Number(i.unit_price || 0) * Number(i.qty || 1);
    });
  });
  const topList = Object.entries(byItem).sort((a, b) => b[1].qty - a[1].qty).slice(0, 10);
  document.getElementById('repTopItemsTable').innerHTML = topList.map(([name, v]) =>
    '<tr><td><strong>' + name + '</strong></td><td style="text-align:center;">' + v.qty + '</td><td style="text-align:right;">' + fmtUsd(v.rev) + '</td></tr>'
  ).join('') || '<tr><td colspan="3" style="text-align:center; color:var(--muted);">គ្មានទិន្នន័យ</td></tr>';

  if (mode === 'yearly') {
    const months = Array(12).fill(0);
    filtered.forEach(o => { const m = new Date(o.created_at).getMonth(); months[m] += Number(o.total_usd || 0); });
    const maxV = Math.max(...months, 1);
    document.getElementById('yearlyChart').innerHTML = months.map((v, i) =>
      '<div class="bar-col"><div class="bar-val">' + (v > 0 ? '$' + v.toFixed(0) : '') + '</div><div class="bar-fill" style="height:' + ((v / maxV) * 100) + '%;"></div><div class="bar-lbl">ខែ ' + (i + 1) + '</div></div>'
    ).join('');
  }
}

function renderSettings() {
  document.getElementById('setShopName').value = state.settings.shopName;
  document.getElementById('setShopAddress').value = state.settings.shopAddress;
  document.getElementById('setRate').value = state.settings.exchangeRate;
  document.getElementById('setApiUrl').value = getApiUrl();
  document.getElementById('setLoginPin').value = state.settings.loginPin || '';
  document.getElementById('setAdminPin').value = state.settings.adminPin || '';
  const apiKeyInp = document.getElementById('setApiKey');
  if (apiKeyInp) apiKeyInp.value = state.settings.apiKey || '';

  document.getElementById('categoriesTable').innerHTML = state.categories.map(c => {
    const cidStr = String(c.id).replace(/'/g, "\\'");
    return '<tr><td>' + (c.icon || '☕') + '</td><td><strong>' + c.name + '</strong></td><td><button type="button" class="btn btn-danger btn-sm" onclick="delCategory(\'' + cidStr + '\')">លុប</button></td></tr>';
  }).join('');
  document.getElementById('discountsTable').innerHTML = state.discounts.map(d => {
    const didStr = String(d.id).replace(/'/g, "\\'");
    return '<tr><td>' + d.name + '</td><td>' + (d.type === 'percent' ? '%' : '$') + '</td><td>' + d.value + '</td><td><button type="button" class="btn btn-danger btn-sm" onclick="delDiscount(\'' + didStr + '\')">លុប</button></td></tr>';
  }).join('');
}

function handleKhqrImage(e) {
  const f = e.target.files[0]; if (!f) return;
  resizeImage(f, 450, dataUrl => { state.settings.khqrImage = dataUrl; saveState(); alert('រក្សាទុករូប KHQR រួចរាល់!'); });
}

function saveSettings() {
  state.settings.shopName = document.getElementById('setShopName').value;
  state.settings.shopAddress = document.getElementById('setShopAddress').value;
  state.settings.exchangeRate = Number(document.getElementById('setRate').value || 4100);
  state.settings.apiUrl = (document.getElementById('setApiUrl').value || '').trim() || FIXED_API_URL;
  state.settings.loginPin = document.getElementById('setLoginPin').value.trim();
  state.settings.adminPin = document.getElementById('setAdminPin').value.trim();
  const apiKeyInp = document.getElementById('setApiKey');
  if (apiKeyInp) state.settings.apiKey = apiKeyInp.value.trim();
  saveState();
  alert('បានរក្សាទុកការកំណត់ក្នុងម៉ាស៊ីនរួចរាល់!');
}

async function addDiscount() {
  if (!verifyAdminPin('បន្ថែមបញ្ចុះតម្លៃ')) return;
  const name = document.getElementById('dName').value.trim();
  const type = document.getElementById('dType').value;
  const value = Number(document.getElementById('dVal').value || 0);
  if (!name || value <= 0) return alert('សូមបញ្ចូលឈ្មោះ និងចំនួនបញ្ចុះតម្លៃ!');
  state.discounts.push({ id: Date.now(), name, type, value });
  saveState(); renderSettings(); renderDiscountOptions();
  document.getElementById('dName').value = ''; document.getElementById('dVal').value = '';
  await syncCatalogToBackend(false);
}

async function delDiscount(id) {
  if (!verifyAdminPin('លុបបញ្ចុះតម្លៃ')) return;
  if (!confirm('លុបប្រភេទបញ្ចុះតម្លៃនេះ?')) return;
  state.discounts = state.discounts.filter(d => String(d.id) !== String(id));
  saveState(); renderSettings(); renderDiscountOptions(); renderCart();
  await syncCatalogToBackend(false);
}

async function addCategory() {
  if (!verifyAdminPin('បន្ថែមប្រភេទម៉ឺនុយ')) return;
  const name = document.getElementById('cName').value.trim();
  const icon = document.getElementById('cIcon').value.trim() || '☕';
  if (!name) return alert('សូមបញ្ចូលឈ្មោះប្រភេទម៉ឺនុយ!');
  const newCat = { id: Date.now(), name, icon };
  state.categories.push(newCat);
  saveState(); renderCategories(); renderSettings();
  const pCat = document.getElementById('pCat');
  if (pCat) pCat.value = String(newCat.id);
  document.getElementById('cName').value = '';
  await syncCatalogToBackend(false);
}

async function delCategory(id) {
  if (!verifyAdminPin('លុបប្រភេទម៉ឺនុយ')) return;
  if (state.products.some(p => String(p.category_id) === String(id))) return alert('មិនអាចលុបប្រភេទនេះបានទេ ព្រោះមានមុខទំនិញកំពុងប្រើប្រាស់វា!');
  if (!confirm('លុបប្រភេទម៉ឺនុយនេះ?')) return;
  state.categories = state.categories.filter(c => String(c.id) !== String(id));
  saveState(); renderCategories(); renderSettings();
  await syncCatalogToBackend(false);
}

function exportOrdersCSV() {
  const rows = [['Order Code','Date','Subtotal','Discount Name','Discount','Total USD','Total KHR','Payment','Type']];
  state.orders.forEach(o => rows.push([o.order_code, o.created_at, o.subtotal, o.discount_name || '', o.discount, o.total_usd, o.total_khr, o.payment_method, o.order_type]));
  const csv = '\uFEFF' + rows.map(r => r.map(x => '"' + String(x).replace(/"/g,'""') + '"').join(',')).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  a.download = 'sak_coffee_sales.csv';
  a.click();
}

function openEditOrder(id) {
  if (!verifyAdminPin('កែប្រែ ឬលុបទំនិញក្នុងវិក្កយបត្រ')) return;
  const o = state.orders.find(x => String(x.id) === String(id));
  if (!o) return;
  editingOrder = JSON.parse(JSON.stringify(o));
  editingOrder.items = sanitizeItemsForPayload(extractOrderItems(o));
  editingOrder._origSubtotal = Number(o.subtotal || 0);
  editingOrder._origDiscount = Number(o.discount || 0);
  document.getElementById('editOrderTitle').textContent = '✏️ កែប្រែវិក្កយបត្រ ' + o.order_code;
  renderEditOrderModal();
  document.getElementById('editOrderModal')?.classList.add('open');
}
function closeEditOrder() { editingOrder = null; document.getElementById('editOrderModal')?.classList.remove('open'); }
function renderEditOrderModal() {
  if (!editingOrder) return;
  const tbody = document.getElementById('editOrderItems');
  if (!tbody) return;
  if (!editingOrder.items.length) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:var(--danger);">អស់ទំនិញហើយ! ចុច «រក្សាទុក» ដើម្បីលុបវិក្កយបត្រនេះទាំងមូល។</td></tr>';
  } else {
    tbody.innerHTML = editingOrder.items.map((i, idx) => {
      const drink = isDrinkProduct(i);
      const sizeLabel = (drink && i.size) ? ' (' + i.size + ')' : '';
      const subMeta = (drink && (i.sugar_level || i.ice_level)) ? fmtUsd(i.unit_price) + ' • ផ្អែម ' + (i.sugar_level || '50%') : fmtUsd(i.unit_price);
      return '<tr>' +
        '<td><strong>' + i.name + sizeLabel + '</strong><div style="font-size:11px; color:var(--muted);">' + subMeta + '</div></td>' +
        '<td style="text-align:center;"><div class="inline-qty"><button onclick="editOrderQty(' + idx + ', -1)">−</button><strong style="min-width:20px; text-align:center;">' + i.qty + '</strong><button onclick="editOrderQty(' + idx + ', 1)">+</button></div></td>' +
        '<td style="text-align:right; font-weight:700;">' + fmtUsd(i.unit_price * i.qty) + '</td>' +
        '<td style="text-align:center;"><button class="btn btn-danger btn-sm" onclick="editOrderRemove(' + idx + ')">✖ លុប</button></td>' +
      '</tr>';
    }).join('');
  }
  const sub = editingOrder.items.reduce((s, i) => s + i.unit_price * i.qty, 0);
  let disc = 0;
  if (editingOrder._origSubtotal > 0 && editingOrder._origDiscount > 0) {
    const discObj = state.discounts.find(d => d.name === editingOrder.discount_name);
    if (discObj && discObj.type === 'percent') disc = sub * (discObj.value / 100);
    else if (discObj && discObj.type === 'fixed') disc = Math.min(sub, discObj.value);
    else disc = Math.min(sub, editingOrder._origDiscount * (sub / editingOrder._origSubtotal));
  }
  const total = Math.max(0, sub - disc);
  const rate = editingOrder.exchange_rate || state.settings.exchangeRate;
  editingOrder.subtotal = Number(sub.toFixed(2));
  editingOrder.discount = Number(disc.toFixed(2));
  editingOrder.total_usd = Number(total.toFixed(2));
  editingOrder.total_khr = Math.round(total * rate);
  document.getElementById('eoSubtotal').textContent = fmtUsd(editingOrder.subtotal);
  document.getElementById('eoDiscount').textContent = '-' + fmtUsd(editingOrder.discount);
  document.getElementById('eoTotal').textContent = fmtUsd(editingOrder.total_usd);
  document.getElementById('eoKhr').textContent = editingOrder.total_khr.toLocaleString('en-US') + ' ៛';
}
function editOrderQty(idx, delta) { editingOrder.items[idx].qty += delta; if (editingOrder.items[idx].qty <= 0) editingOrder.items.splice(idx, 1); renderEditOrderModal(); }
function editOrderRemove(idx) { editingOrder.items.splice(idx, 1); renderEditOrderModal(); }
async function saveEditedOrder(doPrint) {
  if (!editingOrder) return;
  const idx = state.orders.findIndex(x => String(x.id) === String(editingOrder.id));
  if (idx === -1) return closeEditOrder();
  if (!editingOrder.items.length) {
    if (!confirm('លុបវិក្កយបត្រនេះចោលតែម្តងទេ?')) return;
    const removed = state.orders[idx];
    state.orders.splice(idx, 1);
    saveState(); closeEditOrder(); renderOrders(); renderReports();
    if (getApiUrl() && removed.synced) await pushOrderToBackend(removed, 'delete');
    return;
  }
  delete editingOrder._origSubtotal;
  delete editingOrder._origDiscount;
  editingOrder.items = sanitizeItemsForPayload(editingOrder.items);
  editingOrder.items_json = JSON.stringify(editingOrder.items);
  const wasSynced = editingOrder.synced;
  editingOrder.synced = false;
  state.orders[idx] = editingOrder;
  saveState();
  const updated = state.orders[idx];
  closeEditOrder(); renderOrders(); renderReports();
  if (doPrint) printReceipt(updated);
  updated._syncAction = wasSynced ? 'update' : 'create';
  saveState();
  if (getApiUrl() && navigator.onLine) {
    if (await pushOrderToBackend(updated, updated._syncAction)) { delete updated._syncAction; saveState(); }
    renderOrders();
  }
}

async function deleteOrder(id) {
  if (!verifyAdminPin('លុបវិក្កយបត្រ')) return;
  if (!confirm('តើអ្នកពិតជាចង់លុបវិក្កយបត្រនេះមែនទេ?')) return;
  const target = state.orders.find(o => String(o.id) === String(id));
  state.deletedOrderIds.push(String(id));
  if (target && target.order_code) state.deletedOrderCodes.push(String(target.order_code));
  state.orders = state.orders.filter(o => String(o.id) !== String(id));
  saveState(); renderOrders(); renderReports();
  if (target && getApiUrl() && navigator.onLine) await pushOrderToBackend(target, 'delete');
}

async function resetSalesHistory() {
  if (!verifyAdminPin('Reset លុបប្រវត្តិលក់')) return;
  if (!confirm('តើអ្នកពិតជាចង់ Reset លុបប្រវត្តិវិក្កយបត្រលក់ និងរបាយការណ៍ទាំងអស់មែនទេ?')) return;
  state.orders = [];
  saveState(); renderOrders(); renderReports();
  if (getApiUrl() && navigator.onLine) {
    try {
      await fetch(getApiUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'reset', apiKey: getApiKey() })
      });
    } catch (e) {}
  }
  alert('បាន Reset ប្រវត្តិលក់រួចរាល់!');
}

function backupJSON() {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' }));
  a.download = 'sak_coffee_backup.json';
  a.click();
}
function restoreJSON(e) {
  if (!verifyAdminPin('Restore ទិន្នន័យ JSON')) { e.target.value = ''; return; }
  const f = e.target.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = ev => { state = JSON.parse(ev.target.result); saveState(); location.reload(); };
  r.readAsText(f);
}

function holdCurrentOrder() {
  if (!cart.length) return alert('មិនមានទំនិញក្នុងកន្ត្រកសម្រាប់ផ្អាកទេ!');
  const label = prompt('ដាក់ឈ្មោះ ឬលេខតុសម្រាប់វិក្កយបត្រផ្អាកនេះ៖', 'ភ្ញៀវ #' + (state.heldOrders.length + 1));
  if (label === null) return;
  state.heldOrders.push({
    id: Date.now(),
    label: label.trim() || ('ភ្ញៀវ #' + (state.heldOrders.length + 1)),
    orderType: document.getElementById('orderTypeSelect')?.value || 'Takeaway',
    discountVal: document.getElementById('discountSelect')?.value || 'none',
    items: sanitizeItemsForPayload(cart)
  });
  saveState(); clearCart(); renderHeldOrders();
}
function resumeHeldOrder(id) {
  const idx = state.heldOrders.findIndex(h => String(h.id) === String(id));
  if (idx === -1) return;
  if (cart.length && !confirm('ជំនួសកន្ត្រកបច្ចុប្បន្នដោយវិក្កយបត្រដែលផ្អាកនេះ?')) return;
  const held = state.heldOrders.splice(idx, 1)[0];
  cart = held.items || [];
  const ot = document.getElementById('orderTypeSelect');
  const ds = document.getElementById('discountSelect');
  if (ot) ot.value = held.orderType || 'Takeaway';
  if (ds) ds.value = held.discountVal || 'none';
  saveState(); renderCart(); renderProducts(); renderHeldOrders();
}
function renderHeldOrders() {
  const bar = document.getElementById('heldOrdersBar');
  if (!bar) return;
  if (!state.heldOrders || !state.heldOrders.length) { bar.style.display = 'none'; bar.innerHTML = ''; return; }
  bar.style.display = 'flex';
  bar.innerHTML = state.heldOrders.map(h => '<button class="chip" style="background:#fef3c7; border-color:#f59e0b; color:#92400e; font-weight:600;" onclick="resumeHeldOrder(\'' + String(h.id).replace(/'/g, "\\'") + '\')">⏸️ ' + h.label + ' (' + h.items.reduce((s,i)=>s+i.qty,0) + ')</button>').join('');
}

function showLoginModal() {
  const lpin = String((state.settings && state.settings.loginPin) || '').trim();
  if (!lpin || sessionLoggedIn) { sessionLoggedIn = true; return; }
  const overlay = document.createElement('div');
  overlay.id = 'loginPinOverlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.88);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:9999;padding:16px;';
  overlay.innerHTML = '<div style="background:#fff;color:#111827;width:100%;max-width:380px;border-radius:16px;padding:24px;box-shadow:0 20px 45px rgba(0,0,0,0.35);text-align:center;">' +
    '<div style="font-size:38px;margin-bottom:6px;">🔐</div>' +
    '<h2 style="font-size:20px;font-weight:700;">ចូលប្រើប្រព័ន្ធ POS</h2>' +
    '<p style="font-size:13px;color:#6b7280;margin:4px 0 16px;">ស័ក្តិ កាហ្វេ (Sak Coffee) — សូមបញ្ចូល Login PIN</p>' +
    '<input id="loginPinInput" type="password" inputmode="numeric" placeholder="បញ្ចូលលេខកូដ PIN..." style="width:100%;padding:12px;font-size:20px;font-weight:700;text-align:center;letter-spacing:6px;border:2px solid #cbd5e1;border-radius:10px;margin-bottom:10px;">' +
    '<div id="loginPinError" style="color:#dc2626;font-size:12px;font-weight:600;min-height:18px;margin-bottom:10px;"></div>' +
    '<button id="loginPinSubmit" type="button" style="width:100%;padding:12px;font-size:15px;font-weight:700;border:none;border-radius:10px;background:#2563eb;color:#fff;cursor:pointer;">🔓 ចូលប្រើ (Login)</button></div>';
  document.body.appendChild(overlay);
  const inp = document.getElementById('loginPinInput');
  const err = document.getElementById('loginPinError');
  const attempt = () => {
    if (String(inp.value || '').trim() === lpin) { sessionLoggedIn = true; overlay.remove(); }
    else { err.textContent = '❌ លេខកូដ PIN មិនត្រឹមត្រូវទេ!'; inp.value = ''; inp.focus(); }
  };
  document.getElementById('loginPinSubmit').onclick = attempt;
  inp.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); attempt(); } };
  setTimeout(() => inp.focus(), 40);
}
function lockPosSession() {
  sessionLoggedIn = false; adminUnlocked = false;
  if (!String((state.settings && state.settings.loginPin) || '').trim()) return alert('សូមកំណត់ Login PIN ក្នុងផ្ទាំង «⚙️ កំណត់» ជាមុនសិន!');
  showLoginModal();
}

injectSelectOptionStyles();
showLoginModal();
renderCategories();
renderProducts();
renderDiscountOptions();
renderCart();
initReportFilters();
updateSyncIndicator();
renderHeldOrders();

window.addEventListener('online', async () => { await syncPendingOrders(); await pullFromBackend(true); });
window.addEventListener('load', async () => { if (navigator.onLine) { await syncPendingOrders(); await pullFromBackend(true); } });
setInterval(async () => {
  if (!navigator.onLine) return;
  if (state.orders.some(o => !o.synced) || catalogDirty) { await syncPendingOrders(); return; }
  const inSettings = document.getElementById('view-settings')?.classList.contains('active');
  const inMenu = document.getElementById('view-menu')?.classList.contains('active');
  if (!inSettings && !inMenu) await pullFromBackend(true);
}, 20000);
