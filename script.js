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
// MANUAL CONTACT VALIDATION HELPERS
// ==========================================================

// ==========================================================
// NUMBER & INPUT LOCKDOWN (Strictly No Negatives, No Decimals)
// ==========================================================

function blockInvalidNumberKeys(e) {
    // Blocks negative sign (-), decimal point (.), scientific notation (e), and plus (+)
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

function isDigitChar(ch) {
    return ch >= '0' && ch <= '9';
}

function handleContactInput(inputElem) {
    let raw = inputElem.value;
    let digitsOnly = '';
    for (let i = 0; i < raw.length; i++) {
        let ch = raw[i];
        if (isDigitChar(ch)) {
            if (digitsOnly.length === 0 && ch === '0') {
                continue;
            }
            if (digitsOnly.length < 10) {
                digitsOnly += ch;
            }
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
// DATA SEED
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
document.getElementById('custDate').value = getLocalDateString(new Date());

let transactionHistory = [];
let currentTxView = [];

// ==========================================================
// MODULE 12: CALENDAR LOGIC
// ==========================================================

let currentCalYear = new Date().getFullYear();
let currentCalMonth = new Date().getMonth();
let selectedCalDate = getLocalDateString(new Date());

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
            if (appointments[a].date === cellDate) {
                apptCount++;
            }
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
            cell.onclick = function () {
                selectedCalDate = cellDate;
                renderCalendar();
                renderSelectedDayAgenda();
            };
        }
        grid.appendChild(cell);
    }

    renderSelectedDayAgenda();
}

function renderSelectedDayAgenda() {
    const titleElem = document.getElementById('selectedDateTitle');
    const listElem = document.getElementById('selectedDayBookingsList');

    const parts = selectedCalDate.split('-');
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
        html += `
      <div style="border:1px solid var(--border-color); border-radius:8px; padding:10px 12px; margin-bottom:8px; background:#fafafa;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <strong>${item.clientName}</strong>
          <span class="badge ${status.cssClass}">${status.label}</span>
        </div>
        <div style="font-size:0.78rem; color:var(--text-muted); margin-top:4px;">
          🕒 ${item.time} &bull; ${item.service}
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
    document.getElementById('bookDate').value = getLocalDateString(now);

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
document.getElementById('bookingOverlay').addEventListener('click', function (e) {
    if (e.target === document.getElementById('bookingOverlay')) closeBookingModal();
});

document.getElementById('bookingForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const clientName = document.getElementById('bookClientName').value.trim();
    const serviceChoice = document.getElementById('bookService').value;
    const otherServiceVal = document.getElementById('bookServiceOther').value.trim();
    const date = document.getElementById('bookDate').value.trim();
    const time = document.getElementById('bookTime').value.trim();

    // Read Duration with safe fallbacks
    const durHoursElem = document.getElementById('bookDurationHours');
    const durMinsElem = document.getElementById('bookDurationMins');
    const durHours = durHoursElem ? (parseInt(durHoursElem.value) || 0) : 1;
    const durMins = durMinsElem ? (parseInt(durMinsElem.value) || 0) : 0;

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

    // Duration calculation (Must be at least 15 minutes)
    const totalDurationMins = (durHours * 60) + durMins;
    if (totalDurationMins < 15) {
        showBookingMsg('⚠️ Duration must be at least 15 minutes.', true);
        return;
    }

    // Time boundary check (9:00 AM to 5:00 PM)
    const timeParts = time.split(':');
    const startMins = parseInt(timeParts[0]) * 60 + parseInt(timeParts[1]);
    const endMins = startMins + totalDurationMins;

    if (startMins < 540) {
        showBookingMsg('⚠️ The shop opens at 9:00 AM.', true);
        return;
    }

    if (endMins > 1020) {
        const excess = endMins - 1020;
        showBookingMsg(`⚠️ Appointment exceeds closing time! The shop closes at 5:00 PM (exceeds by ${excess} mins).`, true);
        return;
    }

    let durationLabel = '';
    if (durHours > 0 && durMins > 0) durationLabel = `${durHours}h ${durMins}m`;
    else if (durHours > 0) durationLabel = `${durHours}h`;
    else durationLabel = `${durMins}m`;

    // Overlapping Time Interval Collision Check
    let conflictAppt = null;
    let conflictDetails = '';

    for (let i = 0; i < appointments.length; i++) {
        const existing = appointments[i];

        if (existing.date === date) {
            const exParts = existing.time.split(':');
            const exStartMins = parseInt(exParts[0]) * 60 + parseInt(exParts[1]);
            const exDuration = existing.durationMins || 60;
            const exEndMins = exStartMins + exDuration;

            // StartA < EndB && StartB < EndA
            if (startMins < exEndMins && exStartMins < endMins) {
                conflictAppt = existing;

                const exEndHour = Math.floor(exEndMins / 60);
                const exEndMin = exEndMins % 60;
                const exFormattedEnd = new Date(date + 'T' + padNumberWithZeros(exEndHour, 2) + ':' + padNumberWithZeros(exEndMin, 2))
                    .toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
                const exFormattedStart = new Date(date + 'T' + existing.time)
                    .toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

                conflictDetails = `"${existing.clientName}" is booked from ${exFormattedStart} to ${exFormattedEnd}`;
                break;
            }
        }
    }

    if (conflictAppt !== null) {
        showBookingMsg(`⚠️ Slot Overlap Conflict: ${conflictDetails}. Please select another time slot.`, true);
        return;
    }

    // PUSH ONCE ONLY
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

    addLog(`Booked appointment for ${clientName} (${durationLabel})`, 0);

    closeBookingModal();
    renderAppointments();
    alert(`Appointment confirmed for ${clientName} (${durationLabel}).`);
});

// ==========================================================
// POS CART & QUANTITY LOGIC (With Manual Number Input)
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
    if (cart[idx].qty <= 0) {
        arrayRemoveAt(cart, idx);
    }
    renderCart();
}

function setManualQty(idx, val) {
    let cleaned = '';
    for (let i = 0; i < val.length; i++) {
        if (isDigitChar(val[i])) {
            cleaned += val[i];
        }
    }
    let num = parseInt(cleaned);
    // If negative, decimal, or 0, force to minimum of 1
    if (isNaN(num) || num <= 0) {
        num = 1;
    }
    cart[idx].qty = num;
    renderCart();
}



// ==========================================================
// MODULE 13: TRANSACTION HISTORY & REVENUE (MANUAL LOOPS)
// ==========================================================









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



// ==========================================================
// MODULE 14: SALES ANALYTICS (CATEGORIES, WEEKLY, MONTHLY)
// ==========================================================

let analyticsCategoryDate = 'all';



function calculateCategoryAnalytics() {
    let bagRev = 0;
    let clothingRev = 0;
    let perfumeRev = 0;
    let bodyCareRev = 0;

    for (let i = 0; i < transactionHistory.length; i++) {
        const tx = transactionHistory[i];
        if (analyticsCategoryDate !== 'all' && tx.date !== analyticsCategoryDate) {
            continue;
        }

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



function calculateWeeklyAnalytics() {
    let w1 = 0, w2 = 0, w3 = 0, w4 = 0;
    let targetYearMonth = analyticsWeeklyMonth !== 'all' ? analyticsWeeklyMonth : '';

    // Manual loop over transactionHistory
    for (let i = 0; i < transactionHistory.length; i++) {
        const item = transactionHistory[i];

        // Check if transaction matches chosen Year-Month (e.g. "2026-09")
        if (targetYearMonth !== '') {
            const itemParts = item.date.split('-');
            const itemYearMonth = itemParts[0] + '-' + itemParts[1];
            if (itemYearMonth !== targetYearMonth) {
                continue;
            }
        }

        const day = parseInt(item.date.split('-')[2]);
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

    // Monthly cards update
    document.getElementById('monthGrossVal').innerText = `₱${totalMonthly.toLocaleString()}.00`;

    let monthOrdersCount = 0;
    for (let i = 0; i < transactionHistory.length; i++) {
        if (targetYearMonth === '' || (transactionHistory[i].date.split('-')[0] + '-' + transactionHistory[i].date.split('-')[1] === targetYearMonth)) {
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

    // Update subtext
    const subtext = document.getElementById('weeklySubtext');
    if (subtext) {
        if (targetYearMonth !== '') {
            const parts = targetYearMonth.split('-');
            const displayMonth = monthNames[parseInt(parts[1]) - 1] + ' ' + parts[0];
            subtext.innerHTML = `Filtered for <strong>${displayMonth}</strong> &bull; Weeks 1–4 Breakdown`;
        } else {
            subtext.innerText = 'Breakdown of gross sales across billing cycles of all records';
        }
    }
}

// ==========================================================
// EXPORT TRANSACTION HISTORY TO PDF (Pure Local JS, No fetch)
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
  <script>window.onload=function(){setTimeout(function(){window.print();},350);};<\/script>
</body></html>`;

    const win = window.open('', '_blank');
    win.document.write(reportHtml);
    win.document.close();
}

// ==========================================================
// EXPORT AUDIT LOG TO PDF (Pure Local JS, No fetch)
// ==========================================================
function exportAuditLogPDF() {
    const logsToPrint = currentLogsView || activityLogs;
    if (logsToPrint.length === 0) return alert('No activity logs found!');

    let totalCount = logsToPrint.length;
    let anomalyCount = 0;
    let normalCount = 0;
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
  <script>window.onload=function(){setTimeout(function(){window.print();},350);};<\/script>
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

    addLog(`Processed ${trnCode} for ${name} (₱${sum.toLocaleString()})`, 0);

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

    if (viewId === 'dashboard') {
        updateDashboard();
    } else if (viewId === 'appointments') {
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

// ==========================================================
// RESTORED MISSING ALGORITHMS
// ==========================================================





let currentLogsView = activityLogs;


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

// ==========================================================
// HELPERS ----------
function getLocalDateString(d) {
    return d.getFullYear() + '-' + padNumberWithZeros(d.getMonth() + 1, 2) + '-' + padNumberWithZeros(d.getDate(), 2);
}

function escapeHtml(text) {
    const s = '' + text;
    let out = '';
    for (let i = 0; i < s.length; i++) {
        const ch = s[i];
        if (ch === '&') out += '&amp;';
        else if (ch === '<') out += '&lt;';
        else if (ch === '>') out += '&gt;';
        else if (ch === '"') out += '&quot;';
        else if (ch === "'") out += '&#39;';
        else out += ch;
    }
    return out;
}

function formatPeso(n) {
    return '₱' + n.toLocaleString() + '.00';
}

function findTxIndex(trn) {
    for (let i = 0; i < transactionHistory.length; i++) {
        if (transactionHistory[i].trn === trn) return i;
    }
    return -1;
}

function refreshAllTxViews() {
    updateDashboard();
    calculateOverallRevenue();
    applyTransactionFilters();
    calculateCategoryAnalytics();
    calculateWeeklyAnalytics();
}

// ---------- ACTIVITY LOG: one helper + one view function ----------
function addLog(action, isAnomaly) {
    const now = new Date();
    const datePart = getLocalDateString(now);
    arrayUnshiftFront(activityLogs, {
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        user: "Agustin, Amos",
        action: action,
        date: datePart,
        rawTimestamp: datePart + ' ' + padNumberWithZeros(now.getHours(), 2) + ':' + padNumberWithZeros(now.getMinutes(), 2) + ':' + padNumberWithZeros(now.getSeconds(), 2),
        isAnomaly: isAnomaly
    });
    bubbleSortLogs(document.getElementById('sortCriteria').value);
}

// Applies period filter + search on the (already sorted) activityLogs
function refreshLogsView() {
    const period = document.getElementById('logPeriodFilter').value;
    const query = document.getElementById('logSearchInput').value.toLowerCase();
    const today = new Date();
    const todayStr = getLocalDateString(today);
    const weekStr = getLocalDateString(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6));
    const monthPrefix = todayStr.substring(0, 7);

    let result = [];
    for (let i = 0; i < activityLogs.length; i++) {
        const log = activityLogs[i];
        if (period === 'daily' && log.date !== todayStr) continue;
        if (period === 'weekly' && (log.date < weekStr || log.date > todayStr)) continue;
        if (period === 'monthly' && log.date.substring(0, 7) !== monthPrefix) continue;
        const combined = (log.user + ' ' + log.action + ' ' + log.date + ' ' + log.time).toLowerCase();
        if (!containsSubstring(combined, query)) continue;
        arrayPush(result, log);
    }

    let label = 'Showing: All Records';
    if (period === 'daily') label = 'Showing Daily: ' + todayStr;
    else if (period === 'weekly') label = 'Showing Weekly: ' + weekStr + ' to ' + todayStr;
    else if (period === 'monthly') label = 'Showing Monthly: ' + monthNames[today.getMonth()] + ' ' + today.getFullYear();
    document.getElementById('logPeriodIndicator').innerText = label;

    renderLogsTable(result);
}

function filterLogsByPeriod() { refreshLogsView(); }
function linearSearchLogs() { refreshLogsView(); }

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
    refreshLogsView();
}

function renderLogsTable(list) {
    list = list || activityLogs;
    currentLogsView = list;
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
            <td>${escapeHtml(log.user)}</td>
            <td>${escapeHtml(log.action)}</td>
            <td>${badge}</td>
            <td>${log.date}</td>
          </tr>`;
    }
    tbody.innerHTML = html;
}

// ---------- POS CART: remove button ----------
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
          <strong>${escapeHtml(cart[i].name)}</strong><br>
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
    document.getElementById('cart-total').innerText = formatPeso(total);
}

// ---------- APPOINTMENTS: cancel ----------
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
    if (getAppointmentStatus(appt).label === 'Completed') {
        return alert('Completed appointments cannot be cancelled.');
    }
    if (!confirm(`Cancel the appointment for ${appt.clientName}?`)) return;

    arrayRemoveAt(appointments, targetIdx);
    updateDashboard();
    addLog(`Cancelled appointment for ${appt.clientName}`, 0);
    renderAppointments(); // also refreshes the calendar
    alert(`Appointment for ${appt.clientName} has been cancelled.`);
}

function renderAppointments(list) {
    const tbody = document.getElementById('appointments-rows');
    const source = list || appointments;

    if (source.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted); padding:20px;">No appointments found.</td></tr>`;
        renderCalendar();
        return;
    }

    let html = '';
    for (let i = 0; i < source.length; i++) {
        const appt = source[i];
        const status = getAppointmentStatus(appt);
        html += `
      <tr>
        <td><strong>${escapeHtml(appt.clientName)}</strong></td>
        <td>${escapeHtml(appt.service)}</td>
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

// ---------- TRANSACTION HISTORY: profit, month filter, edit, delete ----------
function calculateOverallRevenue() {
    let masterTotal = 0;
    for (let i = 0; i < transactionHistory.length; i++) {
        masterTotal += transactionHistory[i].amount;
    }
    // Estimated profit = 40% of sales (integer math avoids floating-point errors)
    const profitTotal = Math.round(masterTotal * 40 / 100);

    const overallElem = document.getElementById('overallRevenueVal');
    const profitElem = document.getElementById('overallProfitVal');
    if (overallElem) overallElem.innerText = formatPeso(masterTotal);
    if (profitElem) profitElem.innerText = formatPeso(profitTotal);
}

function applyTransactionFilters() {
    const selectedPayment = document.getElementById('txPaymentFilter').value;
    const selectedMonth = document.getElementById('txMonthFilter').value; // YYYY-MM
    const query = document.getElementById('txSearchInput').value.toLowerCase().trim();

    let matchedList = [];
    let dynamicRevenue = 0;

    for (let i = 0; i < transactionHistory.length; i++) {
        const item = transactionHistory[i];
        if (selectedPayment !== 'all' && item.payment !== selectedPayment) continue;
        if (selectedMonth !== '' && item.date.substring(0, 7) !== selectedMonth) continue;

        const combined = (item.trn + " " + item.customer + " " + item.payment + " " + item.date).toLowerCase();
        if (!containsSubstring(combined, query)) continue;

        arrayPush(matchedList, item);
        dynamicRevenue += item.amount;
    }

    currentTxView = matchedList;
    document.getElementById('filteredRevenueVal').innerText = formatPeso(dynamicRevenue);

    const labelElem = document.getElementById('filteredRevenueLabel');
    if (selectedPayment !== 'all' && selectedMonth !== '') labelElem.innerText = `${selectedPayment} Revenue in ${selectedMonth}`;
    else if (selectedPayment !== 'all') labelElem.innerText = `Total ${selectedPayment} Revenue`;
    else if (selectedMonth !== '') labelElem.innerText = `Total Revenue in ${selectedMonth}`;
    else labelElem.innerText = 'Filtered Revenue';

    document.getElementById('filteredCountLabel').innerText = `${matchedList.length} of ${transactionHistory.length} transactions matched`;
    renderTxTable(matchedList);
}

function renderTxTable(list) {
    const tbody = document.getElementById('txHistoryRows');
    if (!tbody) return;

    if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--text-muted); padding:20px;">No transactions recorded.</td></tr>`;
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
        <td>${escapeHtml(item.customer)}</td>
        <td style="color:var(--text-muted); font-size:0.78rem;">${escapeHtml(item.contact)}</td>
        <td><span class="badge ${badgeClass}">${item.payment}</span></td>
        <td><strong>${formatPeso(item.amount)}</strong></td>
        <td style="text-align:center; white-space:nowrap;">
          <button type="button" class="btn" style="padding:4px 8px; font-size:0.75rem; background:var(--brand-gold); color:#fff;" onclick="viewPastReceipt('${item.trn}')">🧾 View</button>
          <button type="button" class="btn" style="padding:4px 8px; font-size:0.75rem; background:#3b82f6; color:#fff;" onclick="openEditTxModal('${item.trn}')">✏️ Edit</button>
          <button type="button" class="btn" style="padding:4px 8px; font-size:0.75rem; background:#ef4444; color:#fff;" onclick="deleteTransaction('${item.trn}')">🗑️ Delete</button>
        </td>
      </tr>`;
    }
    tbody.innerHTML = html;
}

function resetTxFilters() {
    document.getElementById('txPaymentFilter').value = 'all';
    document.getElementById('txMonthFilter').value = '';
    document.getElementById('txSearchInput').value = '';
    applyTransactionFilters();
}

function deleteTransaction(trnCode) {
    const idx = findTxIndex(trnCode);
    if (idx === -1) return;
    if (!confirm(`Delete transaction ${trnCode}? This action cannot be undone.`)) return;

    const deleted = transactionHistory[idx];
    arrayRemoveAt(transactionHistory, idx);
    addLog(`Deleted transaction ${trnCode} (₱${deleted.amount.toLocaleString()})`, 1);
    refreshAllTxViews();
    alert(`Transaction ${trnCode} has been deleted.`);
}

function openEditTxModal(trnCode) {
    const idx = findTxIndex(trnCode);
    if (idx === -1) return;
    const tx = transactionHistory[idx];

    // contact is stored as "+63 9XXXXXXXXX"; show only the 10 digits
    let digits = '';
    for (let i = 0; i < tx.contact.length; i++) {
        if (isDigitChar(tx.contact[i])) digits += tx.contact[i];
    }
    if (digits.length === 12) digits = digits.substring(2);

    document.getElementById('editTxTrn').value = tx.trn;
    document.getElementById('editTxCustomer').value = tx.customer;
    document.getElementById('editTxContact').value = digits;
    document.getElementById('editTxAddress').value = tx.address || '';
    document.getElementById('editTxPayment').value = tx.payment;
    document.getElementById('editTxDate').value = tx.date;
    document.getElementById('editTxOverlay').classList.add('open');
}

function closeEditTxModal() {
    document.getElementById('editTxOverlay').classList.remove('open');
}

document.getElementById('editTxForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const trn = document.getElementById('editTxTrn').value;
    const idx = findTxIndex(trn);
    if (idx === -1) return;

    const rawContact = document.getElementById('editTxContact').value;
    let contact = '';
    for (let i = 0; i < rawContact.length; i++) {
        if (isDigitChar(rawContact[i])) contact += rawContact[i];
    }
    if (!isValidPhilippineMobile(contact)) {
        return alert('⚠️ Enter a valid 10-digit Philippine number starting with 9.');
    }

    const tx = transactionHistory[idx];
    tx.customer = document.getElementById('editTxCustomer').value.trim();
    tx.contact = '+63 ' + contact;
    tx.address = document.getElementById('editTxAddress').value.trim();
    tx.payment = document.getElementById('editTxPayment').value;
    tx.date = document.getElementById('editTxDate').value;
    tx.formattedDate = new Date(tx.date + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    addLog(`Edited transaction record ${trn}`, 0);
    closeEditTxModal();
    refreshAllTxViews();
    alert(`Transaction ${trn} updated successfully!`);
});

// ---------- SMALL FIXES ----------
// Clearing a date/month input sends '' — treat it as "All"
function setAnalyticsDateFilter(dateVal) {
    if (dateVal === '') dateVal = 'all';
    analyticsCategoryDate = dateVal;
    const allBtn = document.getElementById('catDateAllBtn');
    if (dateVal === 'all') {
        allBtn.classList.add('active');
        document.getElementById('catDateInput').value = '';
    } else {
        allBtn.classList.remove('active');
    }
    calculateCategoryAnalytics();
}

function setWeeklyMonthFilter(monthVal) {
    if (monthVal === '') monthVal = 'all';
    analyticsWeeklyMonth = monthVal;
    const allBtn = document.getElementById('weeklyMonthAllBtn');
    if (monthVal === 'all') {
        allBtn.classList.add('active');
        document.getElementById('weeklyMonthInput').value = '';
    } else {
        allBtn.classList.remove('active');
    }
    calculateWeeklyAnalytics();
}

// Prevents the POS receipt from printing together with a past receipt
// (needs the .printing-past CSS rule)
function printPastReceiptModal() {
    document.body.classList.add('printing-past');
    window.print();
    document.body.classList.remove('printing-past');
}

// ---------- DASHBOARD (live numbers) ----------
function updateDashboard() {
    const today = getLocalDateString(new Date());
    let sales = 0, orders = 0, apptCount = 0;
    for (let i = 0; i < transactionHistory.length; i++) {
        if (transactionHistory[i].date === today) {
            sales += transactionHistory[i].amount;
            orders++;
        }
    }
    for (let i = 0; i < appointments.length; i++) {
        if (appointments[i].date === today) apptCount++;
    }
    document.getElementById('dashSales').innerText = formatPeso(sales);
    document.getElementById('dashOrders').innerText = orders;
    document.getElementById('dashAppts').innerText = apptCount + ' Scheduled';
}
updateDashboard();
