// ==========================================================
// MODULE 12: CALENDAR & APPOINTMENTS (Past Dates View-Only)
// ==========================================================

let appointments = [];
let nextAppointmentId = 1;

let currentCalYear = new Date().getFullYear();
let currentCalMonth = new Date().getMonth();
let selectedCalDate = getLocalDateString(new Date());

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
    const titleElem = document.getElementById('calMonthTitle');
    const grid = document.getElementById('calendarDaysGrid');
    if (!titleElem || !grid) return;

    titleElem.innerText = `${monthNames[currentCalMonth]} ${currentCalYear}`;
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

    const todayStr = getLocalDateString(new Date());

    for (let d = 1; d <= totalDays; d++) {
        const cellDate = `${currentCalYear}-${padNumberWithZeros(currentCalMonth + 1, 2)}-${padNumberWithZeros(d, 2)}`;
        const dateObj = new Date(currentCalYear, currentCalMonth, d);
        const isSunday = dateObj.getDay() === 0;
        const isPast = cellDate < todayStr;

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
        } else if (isPast) {
            innerHtml += `<span style="font-size:0.6rem; color:#94a3b8;">Passed</span>`;
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
    const bookBtn = document.getElementById('bookOnDayBtn');
    if (!titleElem || !listElem || !bookBtn) return;

    const parts = splitManual(selectedCalDate, '-');
    titleElem.innerText = `${monthNames[parseInt(parts[1]) - 1]} ${parseInt(parts[2])}, ${parts[0]}`;

    const todayStr = getLocalDateString(new Date());
    const isPastDate = selectedCalDate < todayStr;

    if (isPastDate) {
        bookBtn.disabled = true;
        bookBtn.innerText = "Past Date (View-Only)";
        bookBtn.style.opacity = "0.5";
        bookBtn.style.cursor = "not-allowed";
    } else {
        bookBtn.disabled = false;
        bookBtn.innerText = "+ Book on This Date";
        bookBtn.style.opacity = "1";
        bookBtn.style.cursor = "pointer";
    }

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
              <div>
                <strong style="color:var(--brand-gold);">${item.apptNo}</strong> &bull; <strong>${item.clientName}</strong>
              </div>
              <div>
                <span class="badge ${status.cssClass}">${status.label}</span>
                <button type="button" style="background:#fff; border:1px solid #ef4444; color:#ef4444; border-radius:4px; padding:2px 6px; font-size:0.7rem; cursor:pointer; margin-left:6px;" onclick="openCancelApptModal(${item.id})">Cancel</button>
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
    const todayStr = getLocalDateString(new Date());
    if (selectedCalDate < todayStr) {
        alert('⚠️ Past dates are view-only and cannot be booked.');
        return;
    }
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
    if (!tbody) return;
    const source = list || appointments;

    if (source.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:20px;">No appointments found.</td></tr>`;
        return;
    }

    let html = '';
    for (let i = 0; i < source.length; i++) {
        const appt = source[i];
        const status = getAppointmentStatus(appt);
        html += `
          <tr>
            <td><strong>${appt.apptNo}</strong></td>
            <td><strong>${appt.clientName}</strong></td>
            <td>${appt.service}</td>
            <td>${formatDisplayDateTime(appt.date, appt.time)}</td>
            <td><span class="badge ${status.cssClass}">${status.label}</span></td>
            <td style="text-align:center;">
              <button type="button" style="background:#fff; border:1px solid #ef4444; color:#ef4444; border-radius:4px; padding:3px 8px; font-size:0.72rem; cursor:pointer;" onclick="openCancelApptModal(${appt.id})">Cancel</button>
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
        const combined = (appt.apptNo + " " + appt.clientName + " " + appt.service + " " + appt.date + " " + appt.time + " " + status.label).toLowerCase();
        if (containsSubstring(combined, query)) {
            arrayPush(matched, appt);
        }
    }
    renderAppointments(matched);
}

// CANCELLATION MODAL
function openCancelApptModal(id) {
    let appt = null;
    for (let i = 0; i < appointments.length; i++) {
        if (appointments[i].id === id) {
            appt = appointments[i];
            break;
        }
    }
    if (!appt) return;

    document.getElementById('cancelApptId').value = id;
    document.getElementById('cancelApptPrompt').innerHTML = `Are you sure you want to cancel appointment <strong>${appt.apptNo}</strong> for <strong>${appt.clientName}</strong>?`;
    document.getElementById('cancelReasonSelect').value = '';
    document.getElementById('cancelReasonOtherWrapper').style.display = 'none';
    document.getElementById('cancelReasonOther').value = '';

    document.getElementById('cancelApptOverlay').classList.add('open');
}

function closeCancelApptModal() {
    document.getElementById('cancelApptOverlay').classList.remove('open');
}

function onCancelReasonChange(val) {
    const wrapper = document.getElementById('cancelReasonOtherWrapper');
    const input = document.getElementById('cancelReasonOther');
    if (val === 'Other') {
        wrapper.style.display = 'block';
        input.focus();
    } else {
        wrapper.style.display = 'none';
        input.value = '';
    }
}

function handleCancelApptSubmit(e) {
    e.preventDefault();

    const id = parseInt(document.getElementById('cancelApptId').value);
    const reasonSelect = document.getElementById('cancelReasonSelect').value;
    const reasonOther = document.getElementById('cancelReasonOther').value.trim();

    let resolvedReason = reasonSelect === 'Other' ? reasonOther : reasonSelect;
    if (!resolvedReason) {
        alert('Please specify the cancellation reason.');
        return;
    }

    let targetIdx = -1;
    for (let i = 0; i < appointments.length; i++) {
        if (appointments[i].id === id) {
            targetIdx = i;
            break;
        }
    }
    if (targetIdx === -1) return;

    const cancelledAppt = appointments[targetIdx];
    arrayRemoveAt(appointments, targetIdx);

    const now = new Date();
    const datePart = getLocalDateString(now);
    const fullTimestamp = `${datePart} ${padNumberWithZeros(now.getHours(), 2)}:${padNumberWithZeros(now.getMinutes(), 2)}:${padNumberWithZeros(now.getSeconds(), 2)}`;

    arrayUnshiftFront(activityLogs, {
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        user: "Agustin, Amos",
        action: `CANCELLED ${cancelledAppt.apptNo} for ${cancelledAppt.clientName} (Reason: ${resolvedReason})`,
        date: datePart,
        rawTimestamp: fullTimestamp,
        isAnomaly: 0
    });

    bubbleSortLogs(document.getElementById('sortCriteria').value);
    closeCancelApptModal();
    renderAppointments();
    alert(`Appointment ${cancelledAppt.apptNo} cancelled and logged with reason.`);
}

const cancelApptForm = document.getElementById('cancelApptForm');
if (cancelApptForm) cancelApptForm.addEventListener('submit', handleCancelApptSubmit);

function showBookingMsg(text, isError) {
    const msg = document.getElementById('bookingMsg');
    msg.textContent = text;
    msg.className = isError ? 'msg error' : 'msg ok';
}

function onServiceSelectChange(val) {
    const otherWrapper = document.getElementById('otherServiceWrapper');
    const otherInput = document.getElementById('bookServiceOther');
    const hoursInput = document.getElementById('bookDurationHours');
    const minsInput = document.getElementById('bookDurationMins');

    if (val === 'Size & Fitting' || val === 'Fragrance Shopping') {
        otherWrapper.style.display = 'none';
        otherInput.value = '';
        hoursInput.value = 1;
        minsInput.value = 0;
        hoursInput.disabled = true;
        minsInput.disabled = true;
    } else if (val === 'Private Styling & Consultation') {
        otherWrapper.style.display = 'none';
        otherInput.value = '';
        hoursInput.value = 2;
        minsInput.value = 0;
        hoursInput.disabled = true;
        minsInput.disabled = true;
    } else if (val === 'Other') {
        otherWrapper.style.display = 'block';
        otherInput.focus();
        hoursInput.disabled = false;
        minsInput.disabled = false;
        hoursInput.value = 1;
        minsInput.value = 0;
    } else {
        otherWrapper.style.display = 'none';
        hoursInput.disabled = false;
        minsInput.disabled = false;
    }
    showBookingMsg('', false);
}

function openBookingModal() {
    document.getElementById('bookingForm').reset();
    document.getElementById('otherServiceWrapper').style.display = 'none';
    document.getElementById('bookServiceOther').value = '';

    const todayStr = getLocalDateString(new Date());
    const dateInput = document.getElementById('bookDate');
    dateInput.min = todayStr;
    dateInput.value = todayStr;

    const curHour = new Date().getHours();
    if (curHour < 9 || curHour >= 17) {
        document.getElementById('bookTime').value = '09:00';
    } else {
        document.getElementById('bookTime').value = padNumberWithZeros(curHour, 2) + ':' + padNumberWithZeros(new Date().getMinutes(), 2);
    }

    document.getElementById('bookDurationHours').disabled = false;
    document.getElementById('bookDurationMins').disabled = false;
    showBookingMsg('', false);
    document.getElementById('bookingOverlay').classList.add('open');
}

function closeBookingModal() {
    document.getElementById('bookingOverlay').classList.remove('open');
    document.getElementById('bookingForm').reset();
    showBookingMsg('', false);
}

const cancelBtn = document.getElementById('bookingCancelBtn');
if (cancelBtn) cancelBtn.addEventListener('click', closeBookingModal);

const overlay = document.getElementById('bookingOverlay');
if (overlay) {
    overlay.addEventListener('click', function (e) {
        if (e.target === overlay) closeBookingModal();
    });
}

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

    const todayStr = getLocalDateString(new Date());
    if (date < todayStr) {
        showBookingMsg('⚠️ Past dates cannot be booked. Please choose today or a future date.', true);
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

    if (totalDurationMins > 120) {
        showBookingMsg('⚠️ Appointment duration cannot exceed 2 hours (120 minutes).', true);
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

                showBookingMsg(`⚠️ Slot Conflict: "${existing.clientName}" is booked from ${exFormattedStart} to ${exFormattedEnd}.`, true);
                return;
            }
        }
    }

    const apptCode = `APT-${padNumberWithZeros(nextAppointmentId, 3)}`;

    arrayPush(appointments, {
        id: nextAppointmentId,
        apptNo: apptCode,
        clientName: clientName,
        service: `${resolvedService} (${durationLabel})`,
        date: date,
        time: time,
        durationMins: totalDurationMins,
        durationLabel: durationLabel
    });
    nextAppointmentId++;

    const now = new Date();
    const datePart = getLocalDateString(now);
    const fullTimestamp = `${datePart} ${padNumberWithZeros(now.getHours(), 2)}:${padNumberWithZeros(now.getMinutes(), 2)}:${padNumberWithZeros(now.getSeconds(), 2)}`;

    arrayUnshiftFront(activityLogs, {
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        user: "Agustin, Amos",
        action: `Booked ${apptCode} for ${clientName} (${durationLabel})`,
        date: datePart,
        rawTimestamp: fullTimestamp,
        isAnomaly: 0
    });
    bubbleSortLogs(document.getElementById('sortCriteria').value);

    closeBookingModal();
    renderAppointments();
    alert(`Appointment ${apptCode} confirmed for ${clientName} (${durationLabel}).`);
}

const bookingForm = document.getElementById('bookingForm');
if (bookingForm) bookingForm.addEventListener('submit', handleBookingSubmit);
