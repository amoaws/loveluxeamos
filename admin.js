// ==========================================================
// MANUAL ARRAY HELPERS (No built-in array methods used)
// ==========================================================


function arrayPush(arr, item) {
    arr[arr.length] = item;
}

function arrayRemoveAt(arr, index) {
    for (let i = index; i < arr.length - 1; i++) {
        arr[i] = arr[i + 1];
    }
    arr.length = arr.length - 1;
}

function arrayUnshiftFront(arr, item) {
    for (let i = arr.length; i > 0; i--) {
        arr[i] = arr[i - 1];
    }
    arr[0] = item;
}

function containsSubstring(text, query) {
    if (query.length === 0) return true;
    for (let i = 0; i <= text.length - query.length; i++) {
        let isMatch = true;
        for (let j = 0; j < query.length; j++) {
            if (text[i + j] !== query[j]) {
                isMatch = false;
                break;
            }
        }
        if (isMatch) return true;
    }
    return false;
}

function splitManual(text, separator) {
    let parts = [];
    let current = '';
    for (let i = 0; i < text.length; i++) {
        if (text[i] === separator) {
            arrayPush(parts, current);
            current = '';
        } else {
            current += text[i];
        }
    }
    arrayPush(parts, current);
    return parts;
}

function extractDatePart(isoString) {
    let result = '';
    for (let i = 0; i < isoString.length; i++) {
        if (isoString[i] === 'T') break;
        result += isoString[i];
    }
    return result;
}

function padNumberWithZeros(num, targetLength) {
    let str = '' + num;
    while (str.length < targetLength) {
        str = '0' + str;
    }
    return str;
}

// ==========================================================
// MANUAL NUMBER & CONTACT VALIDATION (No decimals, no negatives)
// ==========================================================

function isDigitChar(ch) {
    return ch >= '0' && ch <= '9';
}

function blockInvalidNumberKeys(e) {
    if (e.key === '.' || e.key === '-' || e.key === 'e' || e.key === '+' || e.key === ',') {
        e.preventDefault();
    }
}

function cleanPositiveInteger(elem) {
    let raw = elem.value;
    let cleaned = '';
    for (let i = 0; i < raw.length; i++) {
        if (isDigitChar(raw[i])) {
            cleaned += raw[i];
        }
    }
    let val = parseInt(cleaned);
    if (isNaN(val) || val <= 0) val = 1;
    elem.value = val;
}

function handleContactInput(inputElem) {
    let raw = inputElem.value;
    let digitsOnly = '';
    for (let i = 0; i < raw.length; i++) {
        let ch = raw[i];
        if (isDigitChar(ch)) {
            if (digitsOnly.length === 0 && ch === '0') continue;
            if (digitsOnly.length < 10) digitsOnly += ch;
        }
    }
    inputElem.value = digitsOnly;

    const msg = document.getElementById('contactValidationMsg');
    if (!msg) return;
    if (digitsOnly.length === 0) {
        msg.innerText = 'Enter 10-digit number starting with 9';
        msg.style.color = 'var(--text-muted)';
    } else if (digitsOnly[0] !== '9') {
        msg.innerText = '⚠️ Must start with 9 (e.g. 9123456789)';
        msg.style.color = 'var(--danger)';
    } else if (digitsOnly.length < 10) {
        msg.innerText = `${digitsOnly.length}/10 digits entered`;
        msg.style.color = 'var(--brand-gold)';
    } else {
        msg.innerText = '✓ Valid mobile number (+63 ' + digitsOnly + ')';
        msg.style.color = '#166534';
    }
}

function isValidPhilippineMobile(num) {
    if (!num || num.length !== 10) return false;
    if (num[0] !== '9') return false;
    for (let i = 0; i < num.length; i++) {
        if (!isDigitChar(num[i])) return false;
    }
    return true;
}

// ==========================================================
// DATA SEED (In-memory only, 0% localStorage)
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

let activityLogs = [
    { time: "11:20 AM", user: "Unknown", action: "FAILED LOGIN ATTEMPT (3x)", date: "2024-10-24", rawTimestamp: "2024-10-24 11:20:00", isAnomaly: 1 },
    { time: "10:45 AM", user: "Agustin, Amos", action: "Logged in to system", date: "2024-10-24", rawTimestamp: "2024-10-24 10:45:00", isAnomaly: 0 },
    { time: "09:30 AM", user: "Vasallo, Patrick", action: "Updated stock for Luxe Handbag", date: "2024-10-23", rawTimestamp: "2024-10-23 09:30:00", isAnomaly: 0 },
    { time: "03:15 PM", user: "Staff #4", action: "MANUAL STOCK OVERRIDE: -15 ITEMS", date: "2024-10-22", rawTimestamp: "2024-10-22 15:15:00", isAnomaly: 1 }
];

let appointments = [];
let nextAppointmentId = 1;

let cart = [];
let trnCounter = 1;
document.getElementById('custDate').valueAsDate = new Date();

let transactionHistory = [];
let currentTxView = [];

// ==========================================================
// MODULE 12: CALENDAR & APPOINTMENT LOGIC
// ==========================================================

let currentCalYear = 2026;
let currentCalMonth = 8; // September
let selectedCalDate = "2026-09-17";

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function changeCalMonth(delta) {
    currentCalMonth += delta;
    if (currentCalMonth > 11) {
        currentCalMonth = 0;
        currentCalYear++;
    } else if (currentCalMonth < 0) {
        currentCalMonth = 11;
        currentCalYear--;
    }
    renderCalendar();
}

function renderCalendar() {
    document.getElementById('calMonthTitle').innerText = `${monthNames[currentCalMonth]} ${currentCalYear}`;
    const grid = document.getElementById('calendarDaysGrid');
    grid.innerHTML = '';

    const firstDay = new Date(currentCalYear, currentCalMonth, 1);
    const totalDays = new Date(currentCalYear, currentCalMonth + 1, 0).getDate();

    let startCol = firstDay.getDay() - 1;
    if (startCol === -1) startCol = 6;

    for (let b = 0; b < startCol; b++) {
        const blank = document.createElement('div');
        blank.style.visibility = 'hidden';
        grid.appendChild(blank);
    }

    for (let d = 1; d <= totalDays; d++) {
        const cellDate = `${currentCalYear}-${padNumberWithZeros(currentCalMonth + 1, 2)}-${padNumberWithZeros(d, 2)}`;
        const dateObj = new Date(currentCalYear, currentCalMonth, d);
        const isSunday = dateObj.getDay() === 0;

        let apptCount = 0;
        for (let a = 0; a < appointments.length; a++) {
            if (appointments[a].date === cellDate) apptCount++;
        }

        const cell = document.createElement('div');
        cell.className = 'cal-cell' + (isSunday ? ' sunday-cell' : '') + (cellDate === selectedCalDate ? ' active-cell' : '');

        let innerHtml = `<strong>${d}</strong>`;
        if (isSunday) {
            innerHtml += `<span style="font-size:0.6rem; color:#94a3b8;">Closed</span>`;
        } else if (apptCount > 0) {
            innerHtml += `<span class="cal-dot">● ${apptCount}</span>`;
        } else {
            innerHtml += `<span style="font-size:0.65rem; color:#cbd5e1;">Available</span>`;
        }
        cell.innerHTML = innerHtml;

        if (!isSunday) {
            cell.setAttribute('onclick', "selectCalendarDate('" + cellDate + "')");
        }
        grid.appendChild(cell);
    }

    renderSelectedDayAgenda();
}

function selectCalendarDate(dateStr) {
    selectedCalDate = dateStr;
    renderCalendar();
    renderSelectedDayAgenda();
}

function renderSelectedDayAgenda() {
    const titleElem = document.getElementById('selectedDateTitle');
    const listElem = document.getElementById('selectedDayBookingsList');

    const parts = splitManual(selectedCalDate, '-');
    titleElem.innerText = `${monthNames[parseInt(parts[1]) - 1]} ${parseInt(parts[2])}, ${parts[0]}`;

    let dayBookings = [];
    for (let i = 0; i < appointments.length; i++) {
        if (appointments[i].date === selectedCalDate) {
            arrayPush(dayBookings, appointments[i]);
        }
    }

    if (dayBookings.length === 0) {
        listElem.innerHTML = `<p style="color:var(--text-muted); font-size:0.85rem; padding:20px 0; text-align:center;">No bookings scheduled for this date.<br><small style="color:var(--brand-gold);">Operating hours: 9:00 AM – 5:00 PM</small></p>`;
        return;
    }

    let html = '';
    for (let i = 0; i < dayBookings.length; i++) {
        const item = dayBookings[i];
        const status = getAppointmentStatus(item);

        const sParts = splitManual(item.time, ':');
        const sMins = parseInt(sParts[0]) * 60 + parseInt(sParts[1]);
        const eMins = sMins + (item.durationMins || 60);
        const eHour = Math.floor(eMins / 60);
        const eMin = eMins % 60;
        const endTimeStr = new Date(item.date + 'T' + padNumberWithZeros(eHour, 2) + ':' + padNumberWithZeros(eMin, 2))
            .toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        const startTimeStr = new Date(item.date + 'T' + item.time)
            .toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

        html += `
          <div style="border:1px solid var(--border-color); border-radius:8px; padding:10px 12px; margin-bottom:8px; background:#fafafa;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <strong>${item.clientName}</strong>
              <div>
                <span class="badge ${status.cssClass}">${status.label}</span>
                <button type="button" style="background:#fff; border:1px solid #ef4444; color:#ef4444; border-radius:4px; padding:2px 6px; font-size:0.7rem; cursor:pointer; margin-left:6px;" onclick="cancelAppointment(${item.id})">Cancel</button>
              </div>
            </div>
            <div style="font-size:0.78rem; color:var(--text-muted); margin-top:4px;">
              🕒 ${startTimeStr} – ${endTimeStr} &bull; ${item.service}
            </div>
          </div>
        `;
    }
    listElem.innerHTML = html;
}

function openBookingModalForSelectedDay() {
    openBookingModal();
    document.getElementById('bookDate').value = selectedCalDate;
}

function getAppointmentStatus(appt) {
    const now = new Date();
    const apptDateTime = new Date(appt.date + 'T' + appt.time);
    const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const apptDateOnly = new Date(apptDateTime.getFullYear(), apptDateTime.getMonth(), apptDateTime.getDate());

    if (apptDateOnly.getTime() === nowDateOnly.getTime()) {
        if (apptDateTime.getTime() < now.getTime()) {
            return { label: 'Completed', cssClass: 'badge-success' };
        }
        return { label: 'Today', cssClass: 'badge-danger' };
    } else if (apptDateTime.getTime() > now.getTime()) {
        return { label: 'Upcoming', cssClass: 'badge-gold' };
    } else {
        return { label: 'Completed', cssClass: 'badge-success' };
    }
}

function formatDisplayDateTime(dateStr, timeStr) {
    const dt = new Date(dateStr + 'T' + timeStr);
    const datePart = dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const timePart = dt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    return `${datePart} @ ${timePart}`;
}

function renderAppointments(list) {
    const tbody = document.getElementById('appointments-rows');
    const source = list || appointments;

    if (source.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted); padding:20px;">No appointments found.</td></tr>`;
        return;
    }

    let html = '';
    for (let i = 0; i < source.length; i++) {
        const appt = source[i];
        const status = getAppointmentStatus(appt);
        html += `
          <tr>
            <td><strong>${appt.clientName}</strong></td>
            <td>${appt.service}</td>
            <td>${formatDisplayDateTime(appt.date, appt.time)}</td>
            <td><span class="badge ${status.cssClass}">${status.label}</span></td>
            <td style="text-align:center;">
              <button type="button" style="background:#fff; border:1px solid #ef4444; color:#ef4444; border-radius:4px; padding:3px 8px; font-size:0.72rem; cursor:pointer;" onclick="cancelAppointment(${appt.id})">Cancel</button>
            </td>
          </tr>`;
    }
    tbody.innerHTML = html;
    renderCalendar();
}

function searchAppointments() {
    const query = document.getElementById('appointmentSearchInput').value.toLowerCase();
    let matched = [];

    for (let i = 0; i < appointments.length; i++) {
        const appt = appointments[i];
        const status = getAppointmentStatus(appt);
        const combined = (appt.clientName + " " + appt.service + " " + appt.date + " " + appt.time + " " + status.label).toLowerCase();
        if (containsSubstring(combined, query)) {
            arrayPush(matched, appt);
        }
    }
    renderAppointments(matched);
}

function cancelAppointment(id) {
    let targetIdx = -1;
    for (let i = 0; i < appointments.length; i++) {
        if (appointments[i].id === id) {
            targetIdx = i;
            break;
        }
    }
    if (targetIdx === -1) return;

    const appt = appointments[targetIdx];
    if (!confirm(`Cancel appointment for ${appt.clientName}?`)) return;

    arrayRemoveAt(appointments, targetIdx);

    const now = new Date();
    const datePart = extractDatePart(now.toISOString());
    const fullTimestamp = `${datePart} ${padNumberWithZeros(now.getHours(), 2)}:${padNumberWithZeros(now.getMinutes(), 2)}:${padNumberWithZeros(now.getSeconds(), 2)}`;

    arrayUnshiftFront(activityLogs, {
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        user: "Agustin, Amos",
        action: `Cancelled appointment for ${appt.clientName}`,
        date: datePart,
        rawTimestamp: fullTimestamp,
        isAnomaly: 0
    });

    bubbleSortLogs(document.getElementById('sortCriteria').value);
    renderAppointments();
    alert(`Appointment for ${appt.clientName} has been cancelled.`);
}

function showBookingMsg(text, isError) {
    const msg = document.getElementById('bookingMsg');
    msg.textContent = text;
    msg.className = isError ? 'msg error' : 'msg ok';
}

function onServiceSelectChange(val) {
    const otherWrapper = document.getElementById('otherServiceWrapper');
    const otherInput = document.getElementById('bookServiceOther');
    if (val === 'Other') {
        otherWrapper.style.display = 'block';
        otherInput.focus();
    } else {
        otherWrapper.style.display = 'none';
        otherInput.value = '';
    }
    showBookingMsg('', false);
}

function openBookingModal() {
    document.getElementById('bookingForm').reset();
    document.getElementById('otherServiceWrapper').style.display = 'none';
    document.getElementById('bookServiceOther').value = '';

    const now = new Date();
    if (now.getDay() === 0) now.setDate(now.getDate() + 1);
    document.getElementById('bookDate').valueAsDate = now;

    const curHour = now.getHours();
    if (curHour < 9 || curHour >= 17) {
        document.getElementById('bookTime').value = '09:00';
    } else {
        document.getElementById('bookTime').value = padNumberWithZeros(curHour, 2) + ':' + padNumberWithZeros(now.getMinutes(), 2);
    }

    showBookingMsg('', false);
    document.getElementById('bookingOverlay').classList.add('open');
}

function closeBookingModal() {
    document.getElementById('bookingOverlay').classList.remove('open');
    document.getElementById('bookingForm').reset();
    showBookingMsg('', false);
}

document.getElementById('bookingCancelBtn').addEventListener('click', closeBookingModal);
function handleBookingOverlayClick(e) {
    if (e.target === document.getElementById('bookingOverlay')) closeBookingModal();
}

document.getElementById('bookingOverlay').addEventListener('click', handleBookingOverlayClick);

function handleBookingSubmit(e) {
    e.preventDefault();

    const clientName = document.getElementById('bookClientName').value.trim();
    const serviceChoice = document.getElementById('bookService').value;
    const otherServiceVal = document.getElementById('bookServiceOther').value.trim();
    const date = document.getElementById('bookDate').value.trim();
    const time = document.getElementById('bookTime').value.trim();

    const durHours = parseInt(document.getElementById('bookDurationHours').value) || 0;
    const durMins = parseInt(document.getElementById('bookDurationMins').value) || 0;
    const totalDurationMins = (durHours * 60) + durMins;

    if (clientName.length === 0) {
        showBookingMsg('⚠️ Please enter Client Name.', true);
        return;
    }

    let resolvedService = (serviceChoice === 'Other') ? otherServiceVal : serviceChoice;
    if (!resolvedService) {
        showBookingMsg('⚠️ Please specify service.', true);
        return;
    }

    const dateObj = new Date(date + 'T00:00:00');
    if (dateObj.getDay() === 0) {
        showBookingMsg('⚠️ The shop is closed on Sundays. Please select Mon – Sat.', true);
        return;
    }

    if (totalDurationMins < 15) {
        showBookingMsg('⚠️ Duration must be at least 15 minutes.', true);
        return;
    }

    const timeParts = splitManual(time, ':');
    const startMins = parseInt(timeParts[0]) * 60 + parseInt(timeParts[1]);
    const endMins = startMins + totalDurationMins;

    if (startMins < 540) {
        showBookingMsg('⚠️ The shop opens at 9:00 AM.', true);
        return;
    }

    if (endMins > 1020) {
        const excess = endMins - 1020;
        showBookingMsg(`⚠️ Appointment exceeds 5:00 PM closing time by ${excess} mins!`, true);
        return;
    }

    let durationLabel = '';
    if (durHours > 0 && durMins > 0) durationLabel = `${durHours}h ${durMins}m`;
    else if (durHours > 0) durationLabel = `${durHours}h`;
    else durationLabel = `${durMins}m`;

    // Overlapping interval collision check
    for (let i = 0; i < appointments.length; i++) {
        const existing = appointments[i];
        if (existing.date === date) {
            const exParts = splitManual(existing.time, ':');
            const exStartMins = parseInt(exParts[0]) * 60 + parseInt(exParts[1]);
            const exDuration = existing.durationMins || 60;
            const exEndMins = exStartMins + exDuration;

            if (startMins < exEndMins && exStartMins < endMins) {
                const exEndHour = Math.floor(exEndMins / 60);
                const exEndMin = exEndMins % 60;
                const exFormattedEnd = new Date(date + 'T' + padNumberWithZeros(exEndHour, 2) + ':' + padNumberWithZeros(exEndMin, 2))
                    .toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
                const exFormattedStart = new Date(date + 'T' + existing.time)
                    .toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

                showBookingMsg(`⚠️ Slot Overlap Conflict: "${existing.clientName}" is booked from ${exFormattedStart} to ${exFormattedEnd}.`, true);
                return;
            }
        }
    }

    arrayPush(appointments, {
        id: nextAppointmentId,
        clientName: clientName,
        service: `${resolvedService} (${durationLabel})`,
        date: date,
        time: time,
        durationMins: totalDurationMins,
        durationLabel: durationLabel
    });
    nextAppointmentId++;

    const now = new Date();
    const datePart = extractDatePart(now.toISOString());
    const fullTimestamp = `${datePart} ${padNumberWithZeros(now.getHours(), 2)}:${padNumberWithZeros(now.getMinutes(), 2)}:${padNumberWithZeros(now.getSeconds(), 2)}`;

    arrayUnshiftFront(activityLogs, {
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        user: "Agustin, Amos",
        action: `Booked appointment for ${clientName} (${durationLabel})`,
        date: datePart,
        rawTimestamp: fullTimestamp,
        isAnomaly: 0
    });
    bubbleSortLogs(document.getElementById('sortCriteria').value);

    closeBookingModal();
    renderAppointments();
    alert(`Appointment confirmed for ${clientName} (${durationLabel}).`);
}

document.getElementById('bookingForm').addEventListener('submit', handleBookingSubmit);

// ==========================================================
// POS CART & QUANTITY LOGIC (With Direct Manual Input)
// ==========================================================

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

// ==========================================================
// MODULE 13: TRANSACTION HISTORY & EDIT ANOMALY
// ==========================================================

function calculateOverallRevenue() {
    let masterTotal = 0;
    for (let i = 0; i < transactionHistory.length; i++) {
        masterTotal += transactionHistory[i].amount;
    }
    let profitTotal = masterTotal * 0.40;

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

    // Calculate Dynamic Net Profit (40% Margin)
    const dynamicProfit = dynamicRevenue * 0.40;

    // Update Values
    document.getElementById('filteredRevenueVal').innerText = `₱${dynamicRevenue.toLocaleString()}.00`;
    document.getElementById('filteredProfitVal').innerText = `₱${dynamicProfit.toLocaleString()}.00`;

    // Dynamic Labels
    const revLabelElem = document.getElementById('filteredRevenueLabel');
    const profitLabelElem = document.getElementById('filteredProfitLabel');

    let criteriaText = '';
    if (selectedPayment !== 'all' && selectedMonth !== '') {
        criteriaText = `${selectedPayment} in ${selectedMonth}`;
    } else if (selectedPayment !== 'all') {
        criteriaText = `Total ${selectedPayment}`;
    } else if (selectedMonth !== '') {
        criteriaText = `Total on ${selectedMonth}`;
    }

    if (criteriaText !== '') {
        revLabelElem.innerText = `${criteriaText} Revenue`;
        profitLabelElem.innerText = `${criteriaText} Net Profit`;
    } else {
        revLabelElem.innerText = 'Filtered Revenue';
        profitLabelElem.innerText = 'Filtered Net Profit';
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
              <button type="button" class="btn" style="padding:4px 8px; font-size:0.72rem; background:var(--brand-gold); color:#fff;" onclick="viewPastReceipt('${item.trn}')">🧾 View</button>
              <button type="button" class="btn" style="padding:4px 8px; font-size:0.72rem; background:#3b82f6; color:#fff;" onclick="openEditTxModal('${item.trn}')">✏️ Edit</button>
              <button type="button" class="btn" style="padding:4px 8px; font-size:0.72rem; background:#ef4444; color:#fff;" onclick="deleteTransaction('${item.trn}')">🗑️ Delete</button>
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
    if (!targetTx) return alert('Transaction record not found!');

    document.getElementById('pastRTrnNo').innerText = targetTx.trn;
    document.getElementById('pastRDate').innerText = targetTx.formattedDate || targetTx.date;
    document.getElementById('pastRName').innerText = targetTx.customer;
    document.getElementById('pastRContact').innerText = targetTx.contact;
    document.getElementById('pastRAddress').innerText = targetTx.address || 'N/A';
    document.getElementById('pastRPayment').innerText = targetTx.payment;

    const itemsBody = document.getElementById('pastReceiptItemsBody');
    let itemsHtml = '';
    if (targetTx.items && targetTx.items.length > 0) {
        for (let j = 0; j < targetTx.items.length; j++) {
            const it = targetTx.items[j];
            itemsHtml += `
                <tr>
                  <td>${it.name}</td>
                  <td style="text-align:center;">${it.qty}</td>
                  <td style="text-align:right;">${it.price.toFixed(2)}</td>
                  <td style="text-align:right;">${(it.price * it.qty).toFixed(2)}</td>
                </tr>`;
        }
    }
    itemsBody.innerHTML = itemsHtml;
    document.getElementById('pastRFinalTotal').innerText = targetTx.amount.toFixed(2);
    document.getElementById('pastReceiptOverlay').classList.add('open');
}

function closePastReceiptModal() {
    document.getElementById('pastReceiptOverlay').classList.remove('open');
}

function printPastReceiptModal() {
    window.print();
}

function deleteTransaction(trnCode) {
    let targetIdx = -1;
    for (let i = 0; i < transactionHistory.length; i++) {
        if (transactionHistory[i].trn === trnCode) {
            targetIdx = i;
            break;
        }
    }
    if (targetIdx === -1) return;

    if (!confirm(`Delete transaction ${trnCode}? This action cannot be undone.`)) return;

    const deletedItem = transactionHistory[targetIdx];
    arrayRemoveAt(transactionHistory, targetIdx);

    const now = new Date();
    const datePart = extractDatePart(now.toISOString());
    const fullTimestamp = `${datePart} ${padNumberWithZeros(now.getHours(), 2)}:${padNumberWithZeros(now.getMinutes(), 2)}:${padNumberWithZeros(now.getSeconds(), 2)}`;

    // Log deletion as an ANOMALY
    arrayUnshiftFront(activityLogs, {
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        user: "Agustin, Amos",
        action: `Deleted transaction ${trnCode} (₱${deletedItem.amount.toLocaleString()})`,
        date: datePart,
        rawTimestamp: fullTimestamp,
        isAnomaly: 1
    });

    bubbleSortLogs(document.getElementById('sortCriteria').value);
    calculateOverallRevenue();
    applyTransactionFilters();
    calculateCategoryAnalytics();
    calculateWeeklyAnalytics();
    alert(`Transaction ${trnCode} deleted.`);
}

// EDIT TRANSACTION (With item deletions, quantity modifications, & Anomaly flag)
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

    // Working copy of items
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
    targetTx.date = document.getElementById('editTxDate').value;
    targetTx.formattedDate = new Date(targetTx.date + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    targetTx.items = editingTxItems;
    targetTx.amount = newSum;

    // Log as ANOMALY (Modifying financial records is flagged in audit!)
    const now = new Date();
    const datePart = extractDatePart(now.toISOString());
    const fullTimestamp = `${datePart} ${padNumberWithZeros(now.getHours(), 2)}:${padNumberWithZeros(now.getMinutes(), 2)}:${padNumberWithZeros(now.getSeconds(), 2)}`;

    arrayUnshiftFront(activityLogs, {
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        user: "Agustin, Amos",
        action: `MODIFIED TRANSACTION ${trn}: Qty/Amount altered (₱${oldAmount.toLocaleString()} -> ₱${newSum.toLocaleString()})`,
        date: datePart,
        rawTimestamp: fullTimestamp,
        isAnomaly: 1 // ANOMALY!
    });

    bubbleSortLogs(document.getElementById('sortCriteria').value);
    closeEditTxModal();
    calculateOverallRevenue();
    applyTransactionFilters();
    calculateCategoryAnalytics();
    calculateWeeklyAnalytics();
    alert(`Transaction ${trn} updated and logged in audit trail.`);
}

document.getElementById('editTxForm').addEventListener('submit', handleEditTxSubmit);

// ==========================================================
// MODULE 11: ACTIVITY LOGS & NEW SPECIFIC DATE FILTER
// ==========================================================

function filterLogsByPeriod(period) {
    document.getElementById('logDateFilter').value = '';
    const indicator = document.getElementById('logPeriodIndicator');
    const now = new Date();
    const todayStr = extractDatePart(now.toISOString());
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

function filterLogsBySpecificDate(dateVal) {
    const indicator = document.getElementById('logPeriodIndicator');
    document.getElementById('logPeriodFilter').value = 'all';

    if (!dateVal) {
        indicator.innerText = 'Showing: All Records';
        renderLogsTable(activityLogs);
        return;
    }

    let filtered = [];
    for (let i = 0; i < activityLogs.length; i++) {
        if (activityLogs[i].date === dateVal) {
            arrayPush(filtered, activityLogs[i]);
        }
    }

    indicator.innerText = `Showing Specific Date: ${dateVal} (${filtered.length} found)`;
    renderLogsTable(filtered);
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

let currentLogsView = activityLogs;
function renderLogsTable(list) {
    currentLogsView = list || activityLogs;
    const tbody = document.getElementById('log-rows');
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

// ==========================================================
// MODULE 14: SALES ANALYTICS
// ==========================================================

let analyticsCategoryDate = 'all';

function setAnalyticsDateFilter(dateVal) {
    analyticsCategoryDate = dateVal;
    const allBtn = document.getElementById('catDateAllBtn');
    const input = document.getElementById('catDateInput');

    if (dateVal === 'all') {
        allBtn.classList.add('active');
        input.value = '';
    } else {
        allBtn.classList.remove('active');
    }
    calculateCategoryAnalytics();
}

function calculateCategoryAnalytics() {
    let bagRev = 0, clothingRev = 0, perfumeRev = 0, bodyCareRev = 0;

    for (let i = 0; i < transactionHistory.length; i++) {
        const tx = transactionHistory[i];
        if (analyticsCategoryDate !== 'all' && tx.date !== analyticsCategoryDate) continue;

        if (tx.items) {
            for (let j = 0; j < tx.items.length; j++) {
                const it = tx.items[j];
                const lineRev = it.price * it.qty;

                let cat = 'bag';
                for (let p = 0; p < products.length; p++) {
                    if (products[p].name === it.name) {
                        cat = products[p].category;
                        break;
                    }
                }

                if (cat === 'bag') bagRev += lineRev;
                else if (cat === 'clothing') clothingRev += lineRev;
                else if (cat === 'perfume') perfumeRev += lineRev;
                else if (cat === 'bodycare') bodyCareRev += lineRev;
            }
        }
    }

    const grandSum = bagRev + clothingRev + perfumeRev + bodyCareRev;
    const bagPct = grandSum > 0 ? Math.round((bagRev / grandSum) * 100) : 0;
    const clothPct = grandSum > 0 ? Math.round((clothingRev / grandSum) * 100) : 0;
    const perfPct = grandSum > 0 ? Math.round((perfumeRev / grandSum) * 100) : 0;
    const bodyPct = grandSum > 0 ? Math.round((bodyCareRev / grandSum) * 100) : 0;

    document.getElementById('catBagVal').innerText = `₱${bagRev.toLocaleString()}.00 (${bagPct}%)`;
    document.getElementById('catBagBar').style.width = `${bagPct}%`;

    document.getElementById('catClothingVal').innerText = `₱${clothingRev.toLocaleString()}.00 (${clothPct}%)`;
    document.getElementById('catClothingBar').style.width = `${clothPct}%`;

    document.getElementById('catPerfumeVal').innerText = `₱${perfumeRev.toLocaleString()}.00 (${perfPct}%)`;
    document.getElementById('catPerfumeBar').style.width = `${perfPct}%`;

    document.getElementById('catBodyCareVal').innerText = `₱${bodyCareRev.toLocaleString()}.00 (${bodyPct}%)`;
    document.getElementById('catBodyCareBar').style.width = `${bodyPct}%`;
}

let analyticsWeeklyMonth = 'all';

function setWeeklyMonthFilter(monthVal) {
    analyticsWeeklyMonth = monthVal;
    const allBtn = document.getElementById('weeklyMonthAllBtn');
    const input = document.getElementById('weeklyMonthInput');

    if (monthVal === 'all') {
        allBtn.classList.add('active');
        input.value = '';
    } else {
        allBtn.classList.remove('active');
    }
    calculateWeeklyAnalytics();
}

function calculateWeeklyAnalytics() {
    let w1 = 0, w2 = 0, w3 = 0, w4 = 0;
    let targetYearMonth = analyticsWeeklyMonth !== 'all' ? analyticsWeeklyMonth : '';

    for (let i = 0; i < transactionHistory.length; i++) {
        const item = transactionHistory[i];

        if (targetYearMonth !== '') {
            const itemParts = splitManual(item.date, '-');
            const itemYearMonth = itemParts[0] + '-' + itemParts[1];
            if (itemYearMonth !== targetYearMonth) continue;
        }

        const day = parseInt(splitManual(item.date, '-')[2]);
        if (day <= 7) w1 += item.amount;
        else if (day <= 14) w2 += item.amount;
        else if (day <= 21) w3 += item.amount;
        else w4 += item.amount;
    }

    const totalMonthly = w1 + w2 + w3 + w4;

    const p1 = totalMonthly > 0 ? Math.round((w1 / totalMonthly) * 100) : 0;
    const p2 = totalMonthly > 0 ? Math.round((w2 / totalMonthly) * 100) : 0;
    const p3 = totalMonthly > 0 ? Math.round((w3 / totalMonthly) * 100) : 0;
    const p4 = totalMonthly > 0 ? Math.round((w4 / totalMonthly) * 100) : 0;

    document.getElementById('week1Val').innerText = `₱${w1.toLocaleString()}.00 (${p1}%)`;
    document.getElementById('week1Bar').style.width = `${p1}%`;
    document.getElementById('week2Val').innerText = `₱${w2.toLocaleString()}.00 (${p2}%)`;
    document.getElementById('week2Bar').style.width = `${p2}%`;
    document.getElementById('week3Val').innerText = `₱${w3.toLocaleString()}.00 (${p3}%)`;
    document.getElementById('week3Bar').style.width = `${p3}%`;
    document.getElementById('week4Val').innerText = `₱${w4.toLocaleString()}.00 (${p4}%)`;
    document.getElementById('week4Bar').style.width = `${p4}%`;

    document.getElementById('monthGrossVal').innerText = `₱${totalMonthly.toLocaleString()}.00`;

    let monthOrdersCount = 0;
    for (let i = 0; i < transactionHistory.length; i++) {
        if (targetYearMonth === '' || (splitManual(transactionHistory[i].date, '-')[0] + '-' + splitManual(transactionHistory[i].date, '-')[1] === targetYearMonth)) {
            monthOrdersCount++;
        }
    }
    const aov = monthOrdersCount > 0 ? Math.round(totalMonthly / monthOrdersCount) : 0;
    document.getElementById('monthAovVal').innerText = `₱${aov.toLocaleString()}.00`;

    let bestWeekName = "None";
    let maxWeekAmt = 0;
    if (w1 > maxWeekAmt) { maxWeekAmt = w1; bestWeekName = "Week 1"; }
    if (w2 > maxWeekAmt) { maxWeekAmt = w2; bestWeekName = "Week 2"; }
    if (w3 > maxWeekAmt) { maxWeekAmt = w3; bestWeekName = "Week 3"; }
    if (w4 > maxWeekAmt) { maxWeekAmt = w4; bestWeekName = "Week 4"; }

    const bestWeekElem = document.getElementById('bestWeekVal');
    if (bestWeekElem) bestWeekElem.innerText = bestWeekName;

    const subtext = document.getElementById('weeklySubtext');
    if (subtext) {
        if (targetYearMonth !== '') {
            const parts = splitManual(targetYearMonth, '-');
            const displayMonth = monthNames[parseInt(parts[1]) - 1] + ' ' + parts[0];
            subtext.innerHTML = `Filtered for <strong>${displayMonth}</strong> &bull; Weeks 1–4 Breakdown`;
        } else {
            subtext.innerText = 'Breakdown of gross sales across billing cycles of all records';
        }
    }
}

// ==========================================================
// EXPORTS (Pure Local HTML, No fetch)
// ==========================================================

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

// ==========================================================
// RECORD TRANSACTION (POS M10 + M13 + M14 Integration)
// ==========================================================

function recordTransaction() {
    if (cart.length === 0) return alert('⚠️ Cart is empty!');

    const name = document.getElementById('custName').value.trim();
    const contact = document.getElementById('custContact').value.trim();
    const address = document.getElementById('custAddress').value.trim();
    const selectedDate = document.getElementById('custDate').value.trim();

    if (!name) return alert('⚠️ Please enter Customer Name.');
    if (!contact || !isValidPhilippineMobile(contact)) return alert('⚠️ Please enter valid 10-digit Philippine number.');
    if (!address) return alert('⚠️ Please enter Customer Address.');
    if (!selectedDate) return alert('⚠️ Please select Date.');

    const now = new Date();
    const isoDate = selectedDate;
    const formattedDate = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

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

// ==========================================================
// OTHER HELPERS & INITIAL SETUP
// ==========================================================

function renderCustomerDropdown() {
    const select = document.getElementById('customerDropdown');
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

// INITIAL SETUP ON PAGE LOAD
renderCustomerDropdown();
if (customers.length > 0) onSelectCustomer(0);
else handleContactInput(document.getElementById('custContact'));
bubbleSortLogs('anomalies');
renderAppointments();
renderCalendar();

calculateOverallRevenue();
applyTransactionFilters();
calculateCategoryAnalytics();
calculateWeeklyAnalytics();
