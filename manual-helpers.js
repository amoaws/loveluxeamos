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

function getLocalDateString(d) {
    return d.getFullYear() + '-' + padNumberWithZeros(d.getMonth() + 1, 2) + '-' + padNumberWithZeros(d.getDate(), 2);
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
// MANUAL NUMBER & CONTACT VALIDATION
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

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
