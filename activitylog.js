// ==========================================================
// MODULE 11: ACTIVITY LOGS (Daily, Weekly, Monthly, Range)
// ==========================================================

let activityLogs = [
    { time: "11:20 AM", user: "Unknown", action: "FAILED LOGIN ATTEMPT (3x)", date: "2024-10-24", rawTimestamp: "2024-10-24 11:20:00", isAnomaly: 1 },
    { time: "10:45 AM", user: "Agustin, Amos", action: "Logged in to system", date: "2024-10-24", rawTimestamp: "2024-10-24 10:45:00", isAnomaly: 0 },
    { time: "09:30 AM", user: "Vasallo, Patrick", action: "Updated stock for Luxe Handbag", date: "2024-10-23", rawTimestamp: "2024-10-23 09:30:00", isAnomaly: 0 },
    { time: "03:15 PM", user: "Staff #4", action: "MANUAL STOCK OVERRIDE: -15 ITEMS", date: "2024-10-22", rawTimestamp: "2024-10-22 15:15:00", isAnomaly: 1 }
];

let currentLogsView = activityLogs;

function filterLogsByPeriod(period) {
    document.getElementById('logRangeStart').value = '';
    document.getElementById('logRangeEnd').value = '';
    const indicator = document.getElementById('logPeriodIndicator');
    const now = new Date();
    const todayStr = getLocalDateString(now);
    const curYear = now.getFullYear();
    const curMonth = now.getMonth();

    if (period === 'all') {
        indicator.innerText = 'Showing: All Records';
        renderLogsTable(activityLogs);
        return;
    }

    let filtered = [];
    for (let i = 0; i < activityLogs.length; i++) {
        const log = activityLogs[i];
        const logDateObj = new Date(log.date + 'T00:00:00');

        if (period === 'daily' && log.date === todayStr) {
            arrayPush(filtered, log);
        } else if (period === 'weekly') {
            const diffDays = (now.getTime() - logDateObj.getTime()) / (1000 * 3600 * 24);
            if (diffDays >= 0 && diffDays <= 7) arrayPush(filtered, log);
        } else if (period === 'monthly') {
            if (logDateObj.getFullYear() === curYear && logDateObj.getMonth() === curMonth) {
                arrayPush(filtered, log);
            }
        }
    }

    if (period === 'daily') indicator.innerText = `Showing Daily: Today (${todayStr})`;
    else if (period === 'weekly') indicator.innerText = `Showing Weekly: Past 7 Days`;
    else if (period === 'monthly') indicator.innerText = `Showing Monthly: ${monthNames[curMonth]} ${curYear}`;

    renderLogsTable(filtered);
}

function applyLogDateRange() {
    const startVal = document.getElementById('logRangeStart').value;
    const endVal = document.getElementById('logRangeEnd').value;
    const indicator = document.getElementById('logPeriodIndicator');

    if (!startVal && !endVal) return;
    if (startVal && endVal && startVal > endVal) {
        alert('⚠️ Start Date cannot be after End Date!');
        return;
    }

    document.getElementById('logPeriodFilter').value = 'all';

    let filtered = [];
    for (let i = 0; i < activityLogs.length; i++) {
        const item = activityLogs[i];
        if (startVal && item.date < startVal) continue;
        if (endVal && item.date > endVal) continue;
        arrayPush(filtered, item);
    }

    indicator.innerText = `Showing Range: ${startVal || 'Start'} to ${endVal || 'End'} (${filtered.length} found)`;
    renderLogsTable(filtered);
}

function clearLogDateRange() {
    document.getElementById('logRangeStart').value = '';
    document.getElementById('logRangeEnd').value = '';
    document.getElementById('logPeriodIndicator').innerText = 'Showing: All Records';
    renderLogsTable(activityLogs);
}

function bubbleSortLogs(criteria) {
    let n = activityLogs.length;
    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            let swapNeeded = false;
            if (criteria === 'anomalies') {
                if (activityLogs[j].isAnomaly < activityLogs[j + 1].isAnomaly) swapNeeded = true;
                else if (activityLogs[j].isAnomaly === activityLogs[j + 1].isAnomaly && activityLogs[j].rawTimestamp < activityLogs[j + 1].rawTimestamp) swapNeeded = true;
            } else if (criteria === 'date-desc') {
                if (activityLogs[j].rawTimestamp < activityLogs[j + 1].rawTimestamp) swapNeeded = true;
            } else if (criteria === 'date-asc') {
                if (activityLogs[j].rawTimestamp > activityLogs[j + 1].rawTimestamp) swapNeeded = true;
            }
            if (swapNeeded) {
                let temp = activityLogs[j];
                activityLogs[j] = activityLogs[j + 1];
                activityLogs[j + 1] = temp;
            }
        }
    }
    renderLogsTable(activityLogs);
}

function linearSearchLogs() {
    const query = document.getElementById('logSearchInput').value.toLowerCase();
    let matched = [];
    for (let i = 0; i < activityLogs.length; i++) {
        const item = activityLogs[i];
        const combined = (item.user + " " + item.action + " " + item.date + " " + item.time).toLowerCase();
        if (containsSubstring(combined, query)) arrayPush(matched, item);
    }
    renderLogsTable(matched);
}

function renderLogsTable(list) {
    currentLogsView = list || activityLogs;
    const tbody = document.getElementById('log-rows');
    if (!tbody) return;
    if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted); padding:16px;">No logs found.</td></tr>`;
        return;
    }
    let html = '';
    for (let i = 0; i < list.length; i++) {
        const log = list[i];
        const rowClass = log.isAnomaly === 1 ? 'anomaly-row' : '';
        const badge = log.isAnomaly === 1 ? '<span class="badge badge-danger">ANOMALY</span>' : '<span class="badge badge-success">Normal</span>';
        html += `
          <tr class="${rowClass}">
            <td><strong>${log.time}</strong></td>
            <td>${log.user}</td>
            <td>${log.action}</td>
            <td>${badge}</td>
            <td>${log.date}</td>
          </tr>`;
    }
    tbody.innerHTML = html;
}

function exportAuditLogPDF() {
    const logsToPrint = currentLogsView || activityLogs;
    if (logsToPrint.length === 0) return alert('No activity logs found!');

    let totalCount = logsToPrint.length, anomalyCount = 0, normalCount = 0;
    for (let i = 0; i < logsToPrint.length; i++) {
        if (logsToPrint[i].isAnomaly === 1) anomalyCount++;
        else normalCount++;
    }

    const now = new Date();
    const generatedDate = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const reportId = `AUD-${now.getFullYear()}${padNumberWithZeros(now.getMonth() + 1, 2)}${padNumberWithZeros(now.getDate(), 2)}`;

    let tableRowsHtml = '';
    for (let i = 0; i < logsToPrint.length; i++) {
        const item = logsToPrint[i];
        const isAnom = item.isAnomaly === 1;
        tableRowsHtml += `
          <tr style="border-bottom: 1px solid #e2e8f0; ${isAnom ? 'background:#fff1f2;' : ''}">
            <td style="padding:9px 12px; text-align:center;">${i + 1}</td>
            <td style="padding:9px 12px; font-weight:600;">${item.time}</td>
            <td style="padding:9px 12px;">${item.date}</td>
            <td style="padding:9px 12px; font-weight:600;">${item.user}</td>
            <td style="padding:9px 12px;">${item.action}</td>
            <td style="padding:9px 12px; text-align:center;">${isAnom ? '<span style="color:red;font-weight:700;">ANOMALY</span>' : 'Normal'}</td>
          </tr>`;
    }

    const reportHtml = `
<!DOCTYPE html><html><head><meta charset="utf-8"><title>Audit Log Report</title>
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet">
<style>
  body{font-family:'Plus Jakarta Sans',sans-serif;padding:30px;color:#1e293b;}
  table{width:100%;border-collapse:collapse;margin-top:20px;}
  th,td{padding:9px 12px;font-size:12px;border-bottom:1px solid #e2e8f0;text-align:left;}
  th{background:#f8fafc;font-size:11px;text-transform:uppercase;}
  @media print{button{display:none;}}
</style></head><body>
  <div style="display:flex;justify-content:space-between;border-bottom:2px solid #c5a059;padding-bottom:14px;">
    <div><h1 style="font-family:'Cinzel',serif;color:#c5a059;font-size:22px;">LOVE LUXE</h1><small>System Activity Audit</small></div>
    <div style="text-align:right;"><h3 style="font-size:14px;margin:0;">Audit Trail Report</h3></div>
  </div>
  <table><thead><tr><th>#</th><th>Time</th><th>Date</th><th>User</th><th>Action</th><th>Status</th></tr></thead><tbody>${tableRowsHtml}</tbody></table>
  <script>function doPrint(){window.print();} function delayedPrint(){setTimeout(doPrint,350);} window.onload=delayedPrint;<\/script>
</body></html>`;

    const win = window.open('', '_blank');
    win.document.write(reportHtml);
    win.document.close();
}
