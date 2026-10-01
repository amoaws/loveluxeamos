// ==========================================================
// MODULE 13: TRANSACTION HISTORY, PROFIT, EDIT
// ==========================================================

let transactionHistory = [];
let currentTxView = [];

function calculateOverallRevenue() {
    let masterTotal = 0;
    for (let i = 0; i < transactionHistory.length; i++) {
        masterTotal += transactionHistory[i].amount;
    }
    let profitTotal = Math.round(masterTotal * 40 / 100);

    const overallElem = document.getElementById('overallRevenueVal');
    const profitElem = document.getElementById('overallProfitVal');

    if (overallElem) overallElem.innerText = `₱${masterTotal.toLocaleString()}.00`;
    if (profitElem) profitElem.innerText = `₱${profitTotal.toLocaleString()}.00`;
}

function applyTransactionFilters() {
    const selectedPayment = document.getElementById('txPaymentFilter').value;
    const selectedMonth = document.getElementById('txMonthFilter').value;
    const searchElem = document.getElementById('txSearchInput');
    const query = searchElem ? searchElem.value.toLowerCase().trim() : '';

    let matchedList = [];
    let dynamicRevenue = 0;

    for (let i = 0; i < transactionHistory.length; i++) {
        const item = transactionHistory[i];

        if (selectedPayment !== 'all' && item.payment !== selectedPayment) continue;

        if (selectedMonth !== '') {
            const itemYearMonth = splitManual(item.date, '-')[0] + '-' + splitManual(item.date, '-')[1];
            if (itemYearMonth !== selectedMonth) continue;
        }

        const combined = (item.trn + " " + item.customer + " " + item.payment + " " + item.date).toLowerCase();
        if (!containsSubstring(combined, query)) continue;

        arrayPush(matchedList, item);
        dynamicRevenue += item.amount;
    }

    currentTxView = matchedList;
    const dynamicProfit = Math.round(dynamicRevenue * 40 / 100);

    document.getElementById('filteredRevenueVal').innerText = `₱${dynamicRevenue.toLocaleString()}.00`;
    document.getElementById('filteredProfitVal').innerText = `₱${dynamicProfit.toLocaleString()}.00`;

    const labelElem = document.getElementById('filteredRevenueLabel');
    let criteriaText = '';
    if (selectedPayment !== 'all' && selectedMonth !== '') {
        criteriaText = `${selectedPayment} in ${selectedMonth}`;
    } else if (selectedPayment !== 'all') {
        criteriaText = `Total ${selectedPayment}`;
    } else if (selectedMonth !== '') {
        criteriaText = `Total in ${selectedMonth}`;
    }

    if (criteriaText !== '') {
        labelElem.innerText = `${criteriaText} Revenue`;
    } else {
        labelElem.innerText = 'Filtered Revenue';
    }

    document.getElementById('filteredCountLabel').innerText = `${matchedList.length} of ${transactionHistory.length} transactions matched`;
    renderTxTable(matchedList);
}

function renderTxTable(list) {
    const tbody = document.getElementById('txHistoryRows');
    if (!tbody) return;

    if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--text-muted); padding:20px;">No transactions recorded yet. Complete a checkout in POS to see it here!</td></tr>`;
        return;
    }

    let html = '';
    for (let i = 0; i < list.length; i++) {
        const item = list[i];
        let badgeClass = 'badge-gold';
        if (item.payment === 'Cash') badgeClass = 'badge-success';
        if (item.payment === 'Card') badgeClass = 'badge-blue';

        html += `
          <tr>
            <td><strong>${item.trn}</strong></td>
            <td>${item.date}</td>
            <td>${item.customer}</td>
            <td style="color:var(--text-muted); font-size:0.78rem;">${item.contact}</td>
            <td><span class="badge ${badgeClass}">${item.payment}</span></td>
            <td><strong>₱${item.amount.toLocaleString()}.00</strong></td>
            <td style="text-align:center; white-space:nowrap;">
              <button type="button" class="btn" style="padding:4px 8px; font-size:0.72rem; background:var(--brand-gold); color:#fff;" onclick="viewPastReceipt('${item.trn}')"> View</button>
              <button type="button" class="btn" style="padding:4px 8px; font-size:0.72rem; background:#3b82f6; color:#fff;" onclick="openEditTxModal('${item.trn}')"> Edit</button>
              <button type="button" class="btn" style="padding:4px 8px; font-size:0.72rem; background:#eab308; color:#fff;" onclick="archiveTransaction('${item.trn}')"> Archive</button>
            </td>
          </tr>
        `;
    }
    tbody.innerHTML = html;
}

function resetTxFilters() {
    document.getElementById('txPaymentFilter').value = 'all';
    document.getElementById('txMonthFilter').value = '';
    document.getElementById('txSearchInput').value = '';
    applyTransactionFilters();
}

function viewPastReceipt(trnCode) {
    let targetTx = null;

    for (let i = 0; i < transactionHistory.length; i++) {
        if (transactionHistory[i].trn === trnCode) {
            targetTx = transactionHistory[i];
            break;
        }
    }

    if (!targetTx) {
        for (let i = 0; i < archivedTransactions.length; i++) {
            if (archivedTransactions[i].trn === trnCode) {
                targetTx = archivedTransactions[i];
                break;
            }
        }
    }

    if (!targetTx) {
        alert('Transaction record not found!');
        return;
    }

    document.getElementById('pastRTrnNo').innerText = targetTx.trn || 'N/A';
    document.getElementById('pastRDate').innerText = targetTx.formattedDate || targetTx.date || 'N/A';
    document.getElementById('pastRName').innerText = targetTx.customer || 'Guest Customer';
    document.getElementById('pastRContact').innerText = targetTx.contact || 'N/A';
    document.getElementById('pastRAddress').innerText = targetTx.address || 'N/A';
    document.getElementById('pastRPayment').innerText = targetTx.payment || 'Cash';

    const itemsBody = document.getElementById('pastReceiptItemsBody');
    let itemsHtml = '';
    let computedSum = 0;

    if (targetTx.items && targetTx.items.length > 0) {
        for (let j = 0; j < targetTx.items.length; j++) {
            const it = targetTx.items[j];
            const priceNum = parseFloat(it.price) || 0;
            const qtyNum = parseInt(it.qty) || 1;
            const lineTotal = priceNum * qtyNum;
            computedSum += lineTotal;

            itemsHtml += `
                <tr>
                  <td><strong>${it.name}</strong></td>
                  <td style="text-align:center;">${qtyNum}</td>
                  <td style="text-align:right;">₱${priceNum.toLocaleString()}.00</td>
                  <td style="text-align:right; font-weight:600;">₱${lineTotal.toLocaleString()}.00</td>
                </tr>`;
        }
    } else {
        computedSum = parseFloat(targetTx.amount) || 0;
        itemsHtml = `
            <tr>
              <td><strong>General Boutique Order</strong></td>
              <td style="text-align:center;">1</td>
              <td style="text-align:right;">₱${computedSum.toLocaleString()}.00</td>
              <td style="text-align:right; font-weight:600;">₱${computedSum.toLocaleString()}.00</td>
            </tr>`;
    }

    itemsBody.innerHTML = itemsHtml;
    const finalAmount = targetTx.amount ? parseFloat(targetTx.amount) : computedSum;
    document.getElementById('pastRFinalTotal').innerText = `₱${finalAmount.toLocaleString()}.00`;

    document.getElementById('pastReceiptOverlay').classList.add('open');
}

function closePastReceiptModal() {
    document.getElementById('pastReceiptOverlay').classList.remove('open');
}

function printPastReceiptModal() {
    window.print();
}

// EDIT TRANSACTION
let editingTxItems = [];

function openEditTxModal(trnCode) {
    let tx = null;
    for (let i = 0; i < transactionHistory.length; i++) {
        if (transactionHistory[i].trn === trnCode) {
            tx = transactionHistory[i];
            break;
        }
    }
    if (!tx) return;

    document.getElementById('editTxTrn').value = tx.trn;
    document.getElementById('editTxCustomer').value = tx.customer;
    document.getElementById('editTxContact').value = tx.contact.replace('+63 ', '');
    document.getElementById('editTxAddress').value = tx.address || '';
    document.getElementById('editTxPayment').value = tx.payment;
    document.getElementById('editTxDate').value = tx.date;

    editingTxItems = [];
    if (tx.items) {
        for (let i = 0; i < tx.items.length; i++) {
            arrayPush(editingTxItems, {
                name: tx.items[i].name,
                price: tx.items[i].price,
                qty: tx.items[i].qty
            });
        }
    }

    renderEditTxItems();
    document.getElementById('editTxOverlay').classList.add('open');
}

function closeEditTxModal() {
    document.getElementById('editTxOverlay').classList.remove('open');
}

function updateEditTxItemQty(idx, delta) {
    editingTxItems[idx].qty += delta;
    if (editingTxItems[idx].qty <= 0) arrayRemoveAt(editingTxItems, idx);
    renderEditTxItems();
}

function setEditTxManualQty(idx, val) {
    let num = parseInt(val);
    if (isNaN(num) || num <= 0) num = 1;
    editingTxItems[idx].qty = num;
    renderEditTxItems();
}

function removeEditTxItem(idx) {
    arrayRemoveAt(editingTxItems, idx);
    renderEditTxItems();
}

function renderEditTxItems() {
    const tbody = document.getElementById('editTxItemsBody');
    const totalElem = document.getElementById('editTxTotalDisplay');

    if (editingTxItems.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--danger); padding:10px;">At least one item must remain!</td></tr>`;
        totalElem.innerText = '₱0.00';
        return;
    }

    let sum = 0;
    let html = '';
    for (let i = 0; i < editingTxItems.length; i++) {
        const it = editingTxItems[i];
        const line = it.price * it.qty;
        sum += line;
        html += `
          <tr>
            <td><strong>${it.name}</strong><br><small style="color:var(--text-muted)">₱${it.price.toLocaleString()}</small></td>
            <td style="text-align:center; white-space:nowrap;">
              <button type="button" class="qty-btn" onclick="updateEditTxItemQty(${i}, -1)">-</button>
              <input type="number" min="1" step="1" value="${it.qty}" class="qty-input" onkeydown="blockInvalidNumberKeys(event)" onchange="setEditTxManualQty(${i}, this.value)">
              <button type="button" class="qty-btn" onclick="updateEditTxItemQty(${i}, 1)">+</button>
            </td>
            <td style="text-align:right; font-weight:600;">₱${line.toLocaleString()}</td>
            <td style="text-align:center;">
              <button type="button" style="background:#fee2e2; color:#ef4444; border:none; border-radius:4px; padding:2px 6px; font-weight:700; cursor:pointer;" onclick="removeEditTxItem(${i})">✖</button>
            </td>
          </tr>
        `;
    }
    tbody.innerHTML = html;
    totalElem.innerText = `₱${sum.toLocaleString()}.00`;
}

function handleEditTxSubmit(e) {
    e.preventDefault();

    if (editingTxItems.length === 0) {
        alert('Transaction must contain at least one item!');
        return;
    }

    const trn = document.getElementById('editTxTrn').value;
    let targetTx = null;
    for (let i = 0; i < transactionHistory.length; i++) {
        if (transactionHistory[i].trn === trn) {
            targetTx = transactionHistory[i];
            break;
        }
    }
    if (!targetTx) return;

    const oldAmount = targetTx.amount;

    let newSum = 0;
    for (let i = 0; i < editingTxItems.length; i++) {
        newSum += editingTxItems[i].price * editingTxItems[i].qty;
    }

    targetTx.customer = document.getElementById('editTxCustomer').value.trim();
    targetTx.contact = '+63 ' + document.getElementById('editTxContact').value.trim();
    targetTx.address = document.getElementById('editTxAddress').value.trim();
    targetTx.payment = document.getElementById('editTxPayment').value;
    targetTx.items = editingTxItems;
    targetTx.amount = newSum;

    const now = new Date();
    const datePart = getLocalDateString(now);
    const fullTimestamp = `${datePart} ${padNumberWithZeros(now.getHours(), 2)}:${padNumberWithZeros(now.getMinutes(), 2)}:${padNumberWithZeros(now.getSeconds(), 2)}`;

    arrayUnshiftFront(activityLogs, {
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        user: "Agustin, Amos",
        action: `MODIFIED TRANSACTION ${trn}: Qty/Amount altered (₱${oldAmount.toLocaleString()} -> ₱${newSum.toLocaleString()})`,
        date: datePart,
        rawTimestamp: fullTimestamp,
        isAnomaly: 1
    });

    bubbleSortLogs(document.getElementById('sortCriteria').value);
    closeEditTxModal();
    calculateOverallRevenue();
    applyTransactionFilters();
    calculateCategoryAnalytics();
    calculateWeeklyAnalytics();
    alert(`Transaction ${trn} updated and logged as an ANOMALY in audit trail!`);
}

const editForm = document.getElementById('editTxForm');
if (editForm) editForm.addEventListener('submit', handleEditTxSubmit);

function exportTxHistoryPDF() {
    const recordsToPrint = currentTxView || transactionHistory;
    if (recordsToPrint.length === 0) return alert('No transaction records found to export!');

    let totalGross = 0, cashTotal = 0, gcashTotal = 0, digitalTotal = 0;

    for (let i = 0; i < recordsToPrint.length; i++) {
        const amt = recordsToPrint[i].amount;
        totalGross += amt;
        const p = recordsToPrint[i].payment;
        if (p === 'Cash') cashTotal += amt;
        else if (p === 'GCash') gcashTotal += amt;
        else digitalTotal += amt;
    }

    const now = new Date();
    const generatedDate = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const reportId = `LED-${now.getFullYear()}${padNumberWithZeros(now.getMonth() + 1, 2)}${padNumberWithZeros(now.getDate(), 2)}`;

    let tableRowsHtml = '';
    for (let i = 0; i < recordsToPrint.length; i++) {
        const item = recordsToPrint[i];
        tableRowsHtml += `
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 9px 12px; text-align: center; color:#64748b;">${i + 1}</td>
            <td style="padding: 9px 12px; font-weight: 700;">${item.trn}</td>
            <td style="padding: 9px 12px;">${item.date}</td>
            <td style="padding: 9px 12px; font-weight: 600;">${item.customer}</td>
            <td style="padding: 9px 12px; color:#64748b;">${item.contact}</td>
            <td style="padding: 9px 12px; font-weight: 600; color:#855f13;">${item.payment}</td>
            <td style="padding: 9px 12px; font-weight: 700; text-align: right;">₱${item.amount.toLocaleString()}.00</td>
          </tr>`;
    }

    const reportHtml = `
<!DOCTYPE html><html><head><meta charset="utf-8"><title>Transaction History Report</title>
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet">
<style>
  body{font-family:'Plus Jakarta Sans',sans-serif;padding:30px;color:#1e293b;}
  table{width:100%;border-collapse:collapse;margin-top:20px;}
  th,td{padding:9px 12px;font-size:12px;border-bottom:1px solid #e2e8f0;text-align:left;}
  th{background:#f8fafc;font-size:11px;text-transform:uppercase;color:#475569;}
  @media print{button{display:none;}}
</style></head><body>
  <div style="display:flex;justify-content:space-between;border-bottom:2px solid #c5a059;padding-bottom:14px;">
    <div><h1 style="font-family:'Cinzel',serif;color:#c5a059;font-size:22px;">LOVE LUXE</h1><small>by EA &bull; Est. 2024</small></div>
    <div style="text-align:right;"><h3 style="font-size:14px;margin:0;">Sales Transaction Ledger</h3><small>Doc ID: ${reportId} &bull; ${generatedDate}</small></div>
  </div>
  <div style="margin:20px 0;padding:14px;background:#fefbf4;border:1px solid #f7edd7;border-radius:6px;display:flex;justify-content:space-around;">
    <div><small>Total Gross</small><h3 style="color:#c5a059;margin:2px 0;">₱${totalGross.toLocaleString()}.00</h3></div>
    <div><small>Cash Sales</small><h3 style="color:#15803d;margin:2px 0;">₱${cashTotal.toLocaleString()}.00</h3></div>
    <div><small>GCash Sales</small><h3 style="color:#855f13;margin:2px 0;">₱${gcashTotal.toLocaleString()}.00</h3></div>
  </div>
  <table><thead><tr><th>#</th><th>Receipt</th><th>Date</th><th>Customer</th><th>Contact</th><th>Payment</th><th style="text-align:right;">Amount</th></tr></thead><tbody>${tableRowsHtml}</tbody></table>
  <div style="margin-top:40px;text-align:right;"><p style="border-top:1px solid #000;display:inline-block;padding-top:4px;">Neil Lorence Deocareza (Module 13 Auditor)</p></div>
  <script>function doPrint(){window.print();} function delayedPrint(){setTimeout(doPrint,350);} window.onload=delayedPrint;<\/script>
</body></html>`;

    const win = window.open('', '_blank');
    win.document.write(reportHtml);
    win.document.close();
}
