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

    const bagVal = document.getElementById('catBagVal');
    if (bagVal) {
        bagVal.innerText = `₱${bagRev.toLocaleString()}.00 (${bagPct}%)`;
        document.getElementById('catBagBar').style.width = `${bagPct}%`;
        document.getElementById('catClothingVal').innerText = `₱${clothingRev.toLocaleString()}.00 (${clothPct}%)`;
        document.getElementById('catClothingBar').style.width = `${clothPct}%`;
        document.getElementById('catPerfumeVal').innerText = `₱${perfumeRev.toLocaleString()}.00 (${perfPct}%)`;
        document.getElementById('catPerfumeBar').style.width = `${perfPct}%`;
        document.getElementById('catBodyCareVal').innerText = `₱${bodyCareRev.toLocaleString()}.00 (${bodyPct}%)`;
        document.getElementById('catBodyCareBar').style.width = `${bodyPct}%`;
    }
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

    const w1Elem = document.getElementById('week1Val');
    if (!w1Elem) return;

    w1Elem.innerText = `₱${w1.toLocaleString()}.00 (${p1}%)`;
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
