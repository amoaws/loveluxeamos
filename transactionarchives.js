// ==========================================================
// TRANSACTION ARCHIVES & 30-DAY RETENTION
// ==========================================================

let archivedTransactions = [];
let currentArchiveView = [];

function archiveTransaction(trnCode) {
    let targetIdx = -1;
    for (let i = 0; i < transactionHistory.length; i++) {
        if (transactionHistory[i].trn === trnCode) {
            targetIdx = i;
            break;
        }
    }
    if (targetIdx === -1) return;

    const itemToArchive = transactionHistory[targetIdx];
    if (!confirm(`Archive transaction ${trnCode}? It will be stored in the Recovery Vault for 30 days before permanent deletion.`)) return;

    const now = new Date();
    itemToArchive.archivedTimestamp = now.getTime();
    itemToArchive.archivedDate = getLocalDateString(now);

    arrayRemoveAt(transactionHistory, targetIdx);
    arrayUnshiftFront(archivedTransactions, itemToArchive);

    const datePart = getLocalDateString(now);
    const fullTimestamp = `${datePart} ${padNumberWithZeros(now.getHours(), 2)}:${padNumberWithZeros(now.getMinutes(), 2)}:${padNumberWithZeros(now.getSeconds(), 2)}`;

    arrayUnshiftFront(activityLogs, {
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        user: "Agustin, Amos",
        action: `Archived transaction ${trnCode} (30-day retention countdown started)`,
        date: datePart,
        rawTimestamp: fullTimestamp,
        isAnomaly: 0
    });

    bubbleSortLogs(document.getElementById('sortCriteria').value);
    calculateOverallRevenue();
    applyTransactionFilters();
    applyArchiveFilters();
    calculateCategoryAnalytics();
    calculateWeeklyAnalytics();
    alert(`Transaction ${trnCode} moved to Archives. It will auto-delete in 30 days if not restored.`);
}

function restoreTransaction(trnCode) {
    let targetIdx = -1;
    for (let i = 0; i < archivedTransactions.length; i++) {
        if (archivedTransactions[i].trn === trnCode) {
            targetIdx = i;
            break;
        }
    }
    if (targetIdx === -1) return;

    const itemToRestore = archivedTransactions[targetIdx];
    if (!confirm(`Restore transaction ${trnCode} back to active ledger? Its revenue will be added back to your books.`)) return;

    arrayRemoveAt(archivedTransactions, targetIdx);
    arrayUnshiftFront(transactionHistory, itemToRestore);

    const now = new Date();
    const datePart = getLocalDateString(now);
    const fullTimestamp = `${datePart} ${padNumberWithZeros(now.getHours(), 2)}:${padNumberWithZeros(now.getMinutes(), 2)}:${padNumberWithZeros(now.getSeconds(), 2)}`;

    arrayUnshiftFront(activityLogs, {
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        user: "Agustin, Amos",
        action: `Restored archived transaction ${trnCode} to active ledger`,
        date: datePart,
        rawTimestamp: fullTimestamp,
        isAnomaly: 0
    });

    bubbleSortLogs(document.getElementById('sortCriteria').value);
    calculateOverallRevenue();
    applyTransactionFilters();
    applyArchiveFilters();
    calculateCategoryAnalytics();
    calculateWeeklyAnalytics();
    alert(`Transaction ${trnCode} restored to active ledger!`);
}

function purgeExpiredArchives() {
    const now = new Date();
    const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;

    for (let i = archivedTransactions.length - 1; i >= 0; i--) {
        const item = archivedTransactions[i];
        const itemTimestamp = item.archivedTimestamp || now.getTime();
        const elapsedMs = now.getTime() - itemTimestamp;

        if (elapsedMs >= thirtyDaysInMs) {
            const expiredTrn = item.trn;
            arrayRemoveAt(archivedTransactions, i);

            const datePart = getLocalDateString(now);
            const fullTimestamp = `${datePart} ${padNumberWithZeros(now.getHours(), 2)}:${padNumberWithZeros(now.getMinutes(), 2)}:${padNumberWithZeros(now.getSeconds(), 2)}`;

            arrayUnshiftFront(activityLogs, {
                time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                user: "System Daemon",
                action: `AUTO-PURGED expired archived record ${expiredTrn} (exceeded 30-day retention limit)`,
                date: datePart,
                rawTimestamp: fullTimestamp,
                isAnomaly: 0
            });
        }
    }
}

function applyArchiveFilters() {
    purgeExpiredArchives();

    const paymentElem = document.getElementById('archivePaymentFilter');
    const monthElem = document.getElementById('archiveMonthFilter');
    const searchElem = document.getElementById('archiveSearchInput');

    const selectedPayment = paymentElem ? paymentElem.value : 'all';
    const selectedMonth = monthElem ? monthElem.value : '';
    const query = searchElem ? searchElem.value.toLowerCase().trim() : '';

    let matchedList = [];

    for (let i = 0; i < archivedTransactions.length; i++) {
        const item = archivedTransactions[i];

        if (selectedPayment !== 'all' && item.payment !== selectedPayment) continue;

        if (selectedMonth !== '') {
            const itemYearMonth = splitManual(item.date, '-')[0] + '-' + splitManual(item.date, '-')[1];
            if (itemYearMonth !== selectedMonth) continue;
        }

        const combined = (item.trn + " " + item.customer + " " + item.payment + " " + item.date).toLowerCase();
        if (!containsSubstring(combined, query)) continue;

        arrayPush(matchedList, item);
    }

    currentArchiveView = matchedList;
    const subtextElem = document.getElementById('archiveCountSubtext');
    if (subtextElem) {
        subtextElem.innerText = `Storage Vault • ${matchedList.length} archived records • 30-Day Auto-Purge Active`;
    }
    renderArchiveTable(matchedList);
}

function renderArchiveTable(list) {
    const tbody = document.getElementById('archiveHistoryRows');
    if (!tbody) return;

    if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--text-muted); padding:20px;">No archived transactions found in storage.</td></tr>`;
        return;
    }

    const now = new Date();
    let html = '';
    for (let i = 0; i < list.length; i++) {
        const item = list[i];
        let badgeClass = 'badge-gold';
        if (item.payment === 'Cash') badgeClass = 'badge-success';
        if (item.payment === 'Card') badgeClass = 'badge-blue';

        const itemTimestamp = item.archivedTimestamp || now.getTime();
        const elapsedDays = Math.floor((now.getTime() - itemTimestamp) / (1000 * 60 * 60 * 24));
        const daysLeft = Math.max(0, 30 - elapsedDays);

        html += `
          <tr style="background:#fafafa;">
            <td>
              <strong>${item.trn}</strong><br>
              <small style="color:var(--danger); font-size:0.7rem;">⏳ ${daysLeft} days left</small>
            </td>
            <td>${item.date}</td>
            <td>${item.customer}</td>
            <td style="color:var(--text-muted); font-size:0.78rem;">${item.contact}</td>
            <td><span class="badge ${badgeClass}">${item.payment}</span></td>
            <td><strong>₱${item.amount.toLocaleString()}.00</strong></td>
            <td style="text-align:center; white-space:nowrap;">
              <button type="button" class="btn" style="padding:4px 10px; font-size:0.72rem; background:#10b981; color:#fff;" onclick="restoreTransaction('${item.trn}')">
                ♻️ Restore
              </button>
            </td>
          </tr>
        `;
    }
    tbody.innerHTML = html;
}

function resetArchiveFilters() {
    document.getElementById('archivePaymentFilter').value = 'all';
    document.getElementById('archiveMonthFilter').value = '';
    document.getElementById('archiveSearchInput').value = '';
    applyArchiveFilters();
}
