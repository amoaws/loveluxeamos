// ==========================================================
// MODULE 10: POS CART & TRANSACTIONS
// ==========================================================

let customers = [];

const products = [
    { name: "Luxe Handbag", price: 4500, category: "bag" },
    { name: "Velvet Clutch", price: 2100, category: "bag" },
    { name: "Monogram Tote", price: 3800, category: "bag" },
    { name: "Silk Evening Dress", price: 2800, category: "clothing" },
    { name: "Satin Robe", price: 1950, category: "clothing" },
    { name: "Luxe Blazer Set", price: 3400, category: "clothing" },
    { name: "EA Signature Parfum", price: 2200, category: "perfume" },
    { name: "Amber Noir Fragrance", price: 2600, category: "perfume" },
    { name: "Gold Body Mist", price: 850, category: "bodycare" },
    { name: "Body Oil Elixir", price: 1200, category: "bodycare" },
    { name: "Velvet Body Cream", price: 750, category: "bodycare" }
];

let cart = [];
let trnCounter = 1;

// Lock POS Date to PC System Date on Load
const todayPcDate = getLocalDateString(new Date());
const custDateElem = document.getElementById('custDate');
if (custDateElem) custDateElem.value = todayPcDate;

function addToOrder(name, price) {
    const qtyElem = document.getElementById('quickAddQty');
    let addAmount = qtyElem ? parseInt(qtyElem.value) : 1;
    if (!addAmount || addAmount <= 0) addAmount = 1;

    let foundIndex = -1;
    for (let i = 0; i < cart.length; i++) {
        if (cart[i].name === name) {
            foundIndex = i;
            break;
        }
    }

    if (foundIndex !== -1) {
        cart[foundIndex].qty += addAmount;
    } else {
        arrayPush(cart, { name: name, price: price, qty: addAmount });
    }
    renderCart();
}

function updateQty(idx, delta) {
    cart[idx].qty += delta;
    if (cart[idx].qty <= 0) arrayRemoveAt(cart, idx);
    renderCart();
}

function setManualQty(idx, val) {
    let num = parseInt(val);
    if (isNaN(num) || num <= 0) num = 1;
    cart[idx].qty = num;
    renderCart();
}

function removeCartItem(idx) {
    arrayRemoveAt(cart, idx);
    renderCart();
}

function renderCart() {
    const tbody = document.getElementById('cart-rows');
    if (!tbody) return;
    if (cart.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-muted);">No items selected</td></tr>`;
        document.getElementById('cart-total').innerText = '₱0.00';
        return;
    }
    let total = 0;
    let html = '';
    for (let i = 0; i < cart.length; i++) {
        const line = cart[i].price * cart[i].qty;
        total += line;
        html += `
          <tr>
            <td>
              <strong>${cart[i].name}</strong><br>
              <small style="color:var(--text-muted)">₱${cart[i].price.toLocaleString()}</small>
            </td>
            <td style="text-align:center; white-space:nowrap;">
              <button type="button" class="qty-btn" onclick="updateQty(${i}, -1)">-</button>
              <input type="number" min="1" step="1" value="${cart[i].qty}" class="qty-input" onkeydown="blockInvalidNumberKeys(event)" onchange="setManualQty(${i}, this.value)">
              <button type="button" class="qty-btn" onclick="updateQty(${i}, 1)">+</button>
            </td>
            <td style="text-align:right; font-weight:600;">₱${line.toLocaleString()}</td>
            <td style="text-align:center;">
              <button type="button" style="background:#fee2e2; color:#ef4444; border:none; border-radius:4px; padding:3px 8px; font-weight:700; cursor:pointer;" onclick="removeCartItem(${i})">✖</button>
            </td>
          </tr>`;
    }
    tbody.innerHTML = html;
    document.getElementById('cart-total').innerText = `₱${total.toLocaleString()}.00`;
}

function renderCustomerDropdown() {
    const select = document.getElementById('customerDropdown');
    if (!select) return;
    let html = '<option value="new">➕ Add New Customer</option>';
    for (let i = 0; i < customers.length; i++) {
        html += `<option value="${i}">${customers[i].name} (+63 ${customers[i].contact})</option>`;
    }
    select.innerHTML = html;
}

function onSelectCustomer(val) {
    const contactInput = document.getElementById('custContact');
    if (val === 'new') {
        document.getElementById('custName').value = '';
        contactInput.value = '';
        document.getElementById('custAddress').value = '';
        handleContactInput(contactInput);
        document.getElementById('custName').focus();
    } else {
        const c = customers[parseInt(val)];
        document.getElementById('custName').value = c.name;
        contactInput.value = c.contact;
        document.getElementById('custAddress').value = c.address;
        handleContactInput(contactInput);
    }
}

function selectCategory(cat, btn) {
    const catButtons = document.querySelectorAll('.cat-btn');
    for (let i = 0; i < catButtons.length; i++) catButtons[i].classList.remove('active');
    btn.classList.add('active');

    let filtered = [];
    for (let i = 0; i < products.length; i++) {
        if (products[i].category === cat) arrayPush(filtered, products[i]);
    }

    let html = '';
    for (let i = 0; i < filtered.length; i++) {
        html += `
          <div class="product-box" onclick="addToOrder('${filtered[i].name}', ${filtered[i].price})">
            <strong>${filtered[i].name}</strong>
            <p style="color:var(--brand-gold); font-size:0.85rem; font-weight:600; margin-top:4px;">₱${filtered[i].price.toLocaleString()}</p>
          </div>`;
    }
    document.getElementById('catalogGrid').innerHTML = html;
}

function recordTransaction() {
    if (cart.length === 0) return alert('⚠️ Cart is empty!');

    const name = document.getElementById('custName').value.trim();
    const contact = document.getElementById('custContact').value.trim();
    const address = document.getElementById('custAddress').value.trim();

    const isoDate = getLocalDateString(new Date());
    const formattedDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    if (!name) return alert('⚠️ Please enter Customer Name.');
    if (!contact || !isValidPhilippineMobile(contact)) return alert('⚠️ Please enter valid 10-digit Philippine number.');
    if (!address) return alert('⚠️ Please enter Customer Address.');

    let customerExists = false;
    for (let i = 0; i < customers.length; i++) {
        if (customers[i].name.toLowerCase() === name.toLowerCase()) {
            customerExists = true;
            customers[i].contact = contact;
            customers[i].address = address;
            break;
        }
    }
    if (!customerExists) {
        arrayPush(customers, { name: name, contact: contact, address: address });
        renderCustomerDropdown();
    }

    const trnCode = `TRN-${padNumberWithZeros(trnCounter, 3)}`;

    document.getElementById('rTrnNo').innerText = trnCode;
    document.getElementById('rDate').innerText = formattedDate;
    document.getElementById('rName').innerText = name;
    document.getElementById('rContact').innerText = '+63 ' + contact;
    document.getElementById('rAddress').innerText = address || 'N/A';
    document.getElementById('rPayment').innerText = document.getElementById('custPayment').value;

    let sum = 0;
    let receiptHtml = '';
    let itemsCopy = [];

    for (let i = 0; i < cart.length; i++) {
        const line = cart[i].price * cart[i].qty;
        sum += line;
        receiptHtml += `<tr><td>${cart[i].name}</td><td style="text-align:center;">${cart[i].qty}</td><td style="text-align:right;">${cart[i].price.toFixed(2)}</td><td style="text-align:right;">${line.toFixed(2)}</td></tr>`;

        arrayPush(itemsCopy, {
            name: cart[i].name,
            price: cart[i].price,
            qty: cart[i].qty
        });
    }
    document.getElementById('receipt-items-body').innerHTML = receiptHtml;
    document.getElementById('rFinalTotal').innerText = sum.toFixed(2);

    const rec = document.getElementById('receipt-section');
    rec.style.display = 'block';
    rec.scrollIntoView({ behavior: 'smooth' });

    const now = new Date();
    const fullTimestamp = `${isoDate} ${padNumberWithZeros(now.getHours(), 2)}:${padNumberWithZeros(now.getMinutes(), 2)}:${padNumberWithZeros(now.getSeconds(), 2)}`;
    arrayUnshiftFront(activityLogs, {
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        user: "Agustin, Amos",
        action: `Processed ${trnCode} for ${name} (₱${sum.toLocaleString()})`,
        date: isoDate,
        rawTimestamp: fullTimestamp,
        isAnomaly: 0
    });
    bubbleSortLogs(document.getElementById('sortCriteria').value);

    arrayUnshiftFront(transactionHistory, {
        trn: trnCode,
        date: isoDate,
        formattedDate: formattedDate,
        customer: name,
        contact: '+63 ' + contact,
        address: address,
        payment: document.getElementById('custPayment').value,
        amount: sum,
        items: itemsCopy
    });

    calculateOverallRevenue();
    applyTransactionFilters();
    calculateCategoryAnalytics();
    calculateWeeklyAnalytics();

    trnCounter++;
    cart = [];
    renderCart();
}

function printReceipt() {
    window.print();
}

// NAVIGATION / TAB SWITCHER
function switchTab(viewId, el) {
    const navItems = document.querySelectorAll('.nav-item');
    for (let i = 0; i < navItems.length; i++) navItems[i].classList.remove('active');
    el.classList.add('active');

    const panels = document.querySelectorAll('.view-panel');
    for (let i = 0; i < panels.length; i++) panels[i].classList.remove('active-view');
    document.getElementById(`view-${viewId}`).classList.add('active-view');
    document.getElementById('top-title').innerText = el.querySelector('span').innerText;

    if (viewId === 'appointments') {
        renderCalendar();
    } else if (viewId === 'analytics') {
        calculateCategoryAnalytics();
        calculateWeeklyAnalytics();
    } else if (viewId === 'archives') {
        applyArchiveFilters();
    }
}

// INITIAL STARTUP SEQUENCE (Runs when all files are loaded)
renderCustomerDropdown();
if (customers.length > 0) onSelectCustomer(0);
else handleContactInput(document.getElementById('custContact'));

bubbleSortLogs('anomalies');
renderAppointments();
renderCalendar();

calculateOverallRevenue();
applyTransactionFilters();
applyArchiveFilters();
calculateCategoryAnalytics();
calculateWeeklyAnalytics();
