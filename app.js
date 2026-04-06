/**
 * Bill Splitter Pro - UI Application
 * Pure JavaScript, no frameworks
 */

// ========== STATE ==========
let persons = [];
let categories = [];

// ========== PERSONS ==========
function addPerson() {
    const nameInput = document.getElementById('personName');
    const groupInput = document.getElementById('coupleGroup');
    const name = nameInput.value.trim();
    const group = groupInput.value.trim() || null;

    if (!name) {
        shakeElement(nameInput);
        return;
    }
    if (persons.find(p => p.name === name)) {
        showToast('השם הזה כבר קיים!', 'error');
        return;
    }

    persons.push({ name, couple_group: group });
    nameInput.value = '';
    groupInput.value = '';
    nameInput.focus();
    renderPersons();
    renderCategories();
    showToast(`${name} נוסף/ה בהצלחה ✓`, 'success');
}

function removePerson(name) {
    persons = persons.filter(p => p.name !== name);
    categories.forEach(cat => {
        cat.participants = cat.participants.filter(p => p !== name);
        delete cat.payments[name];
    });
    renderPersons();
    renderCategories();
}

function renderPersons() {
    const container = document.getElementById('personsList');
    const count = document.getElementById('personsCount');

    if (count) count.textContent = persons.length;

    if (persons.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">👥</span>
                <p>עדיין לא הוספת משתתפים</p>
            </div>`;
        return;
    }

    const groups = {};
    const singles = [];
    persons.forEach(p => {
        if (p.couple_group) {
            if (!groups[p.couple_group]) groups[p.couple_group] = [];
            groups[p.couple_group].push(p);
        } else {
            singles.push(p);
        }
    });

    let html = '<div class="persons-grid">';

    for (const [groupName, members] of Object.entries(groups)) {
        html += `
            <div class="person-chip couple-chip animate-in">
                <span class="couple-icon">💑</span>
                <span class="couple-name">${groupName}</span>
                <div class="couple-members">
                    ${members.map(m => `
                        <span class="member-name">
                            ${m.name}
                            <button class="btn-remove-small"
                                onclick="removePerson('${m.name}')"
                                title="הסר">✕</button>
                        </span>
                    `).join('')}
                </div>
            </div>`;
    }

    singles.forEach(p => {
        html += `
            <div class="person-chip single-chip animate-in">
                <span class="person-icon">👤</span>
                <span>${p.name}</span>
                <button class="btn-remove-small"
                    onclick="removePerson('${p.name}')"
                    title="הסר">✕</button>
            </div>`;
    });

    html += '</div>';
    container.innerHTML = html;
}

// ========== CATEGORIES ==========
function addCategory() {
    const nameInput = document.getElementById('categoryName');
    const name = nameInput.value.trim();

    if (!name) {
        shakeElement(nameInput);
        return;
    }

    categories.push({
        name,
        participants: [],
        payments: {}
    });

    nameInput.value = '';
    renderCategories();
    showToast(`קטגוריה "${name}" נוספה ✓`, 'success');
}

function removeCategory(index) {
    const name = categories[index].name;
    categories.splice(index, 1);
    renderCategories();
    showToast(`קטגוריה "${name}" נמחקה`, 'info');
}

function toggleParticipant(catIndex, personName) {
    const cat = categories[catIndex];
    const idx = cat.participants.indexOf(personName);
    if (idx === -1) {
        cat.participants.push(personName);
    } else {
        cat.participants.splice(idx, 1);
    }
    renderCategories();
}

function selectAllParticipants(catIndex) {
    categories[catIndex].participants = persons.map(p => p.name);
    renderCategories();
}

function clearAllParticipants(catIndex) {
    categories[catIndex].participants = [];
    renderCategories();
}

function updatePayment(catIndex, personName, value) {
    const amount = parseFloat(value) || 0;
    if (amount > 0) {
        categories[catIndex].payments[personName] = amount;
    } else {
        delete categories[catIndex].payments[personName];
    }
    updateCategoryTotal(catIndex);
}

function updateCategoryTotal(catIndex) {
    const cat = categories[catIndex];
    const total = Object.values(cat.payments).reduce((s, v) => s + v, 0);
    const el = document.getElementById(`catTotal_${catIndex}`);
    if (el) el.textContent = `₪${total.toFixed(2)}`;
}

function renderCategories() {
    const container = document.getElementById('categoriesList');

    if (categories.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">📦</span>
                <p>עדיין לא הוספת קטגוריות</p>
            </div>`;
        return;
    }

    let html = '';
    categories.forEach((cat, catIdx) => {
        const totalPaid = Object.values(cat.payments)
            .reduce((s, v) => s + v, 0);
        const participantCount = cat.participants.length;

        html += `
        <div class="category-card animate-in">
            <div class="category-header">
                <h3>${cat.name}</h3>
                <div class="category-stats">
                    <span class="category-total"
                          id="catTotal_${catIdx}">
                        ₪${totalPaid.toFixed(2)}
                    </span>
                    <span class="category-participants-count">
                        ${participantCount} משתתפים
                    </span>
                </div>
                <button class="btn-remove"
                        onclick="removeCategory(${catIdx})"
                        title="מחק קטגוריה">🗑️</button>
            </div>

            <div class="category-section">
                <h4>
                    <span>👥 מי השתתף?</span>
                    <div class="section-actions">
                        <button class="btn-mini"
                            onclick="selectAllParticipants(${catIdx})">
                            ✓ כולם
                        </button>
                        <button class="btn-mini"
                            onclick="clearAllParticipants(${catIdx})">
                            ✕ נקה
                        </button>
                    </div>
                </h4>
                <div class="participants-grid">
                    ${persons.map(p => `
                        <label class="participant-toggle
                            ${cat.participants.includes(p.name) ? 'active' : ''}">
                            <input type="checkbox"
                                ${cat.participants.includes(p.name)
                                    ? 'checked' : ''}
                                onchange="toggleParticipant(${catIdx},
                                    '${p.name}')">
                            <span>${p.name}</span>
                        </label>
                    `).join('')}
                </div>
            </div>

            <div class="category-section">
                <h4>💳 מי שילם?</h4>
                <div class="payments-grid">
                    ${persons.map(p => `
                        <div class="payment-row">
                            <label>${p.name}</label>
                            <div class="input-with-symbol">
                                <span class="symbol">₪</span>
                                <input type="number"
                                    min="0" step="0.01"
                                    placeholder="0"
                                    value="${cat.payments[p.name] || ''}"
                                    onchange="updatePayment(${catIdx},
                                        '${p.name}', this.value)"
                                    oninput="updatePayment(${catIdx},
                                        '${p.name}', this.value)">
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>`;
    });

    container.innerHTML = html;
}

// ========== CALCULATE ==========
function calculate() {
    // Validation
    if (persons.length === 0) {
        showToast('הוסף משתתפים קודם!', 'error');
        return;
    }
    if (categories.length === 0) {
        showToast('הוסף קטגוריות קודם!', 'error');
        return;
    }

    const hasPayments = categories.some(
        cat => Object.keys(cat.payments).length > 0
    );
    if (!hasPayments) {
        showToast('הוסף לפחות תשלום אחד!', 'error');
        return;
    }

    const hasParticipants = categories.some(
        cat => cat.participants.length > 0
    );
    if (!hasParticipants) {
        showToast('בחר משתתפים בקטגוריות!', 'error');
        return;
    }

    // Create calculator and run
    const calc = new BillCalculator();

    persons.forEach(p => {
        calc.addPerson(p.name, p.couple_group);
    });

    categories.forEach(cat => {
        calc.addCategory(cat.name, cat.participants, cat.payments);
    });

    const result = calc.calculate();
    renderResults(result);
}

// ========== RESULTS ==========
function renderResults(data) {
    const card = document.getElementById('resultsCard');
    const body = document.getElementById('resultsBody');
    card.style.display = 'block';

    let html = '';

    // ---- Summary ----
    html += `
    <div class="result-section summary-section animate-in">
        <h3>📋 סיכום האירוע</h3>
        <div class="summary-total">
            <span class="total-label">סה"כ הוצאות</span>
            <span class="total-amount">₪${data.totalEvent.toFixed(2)}</span>
        </div>
        <div class="categories-summary">
            ${Object.entries(data.categories).map(([name, cat]) => `
                <div class="cat-summary-item">
                    <span class="cat-name">${name}</span>
                    <span class="cat-total">₪${cat.total.toFixed(2)}</span>
                    <span class="cat-share">
                         ${cat.participantsCount} × ₪${cat.sharePerPerson.toFixed(2)}
                    </span>
                </div>
            `).join('')}
        </div>
    </div>`;

    // ---- Per Person Details ----
    html += `
    <div class="result-section animate-in">
        <h3>👤 פירוט אישי</h3>
        <div class="persons-table">
            <div class="table-header">
                <span>שם</span>
                <span>זוג</span>
                <span>שילם/ה</span>
                <span>חלק</span>
                <span>מאזן</span>
            </div>
            ${Object.values(data.persons).map(p => `
                <div class="table-row
                    ${p.balance > 0.01 ? 'positive' :
                      p.balance < -0.01 ? 'negative' : 'zero'}">
                    <span class="name-cell">${p.name}</span>
                    <span class="group-cell">${p.group || '—'}</span>
                    <span class="paid-cell">₪${p.paid.toFixed(2)}</span>
                    <span class="owes-cell">₪${p.owes.toFixed(2)}</span>
                    <span class="balance-cell">
                        ${p.balance > 0 ? '+' : ''}₪${p.balance.toFixed(2)}
                    </span>
                </div>
            `).join('')}
        </div>
    </div>`;

    // ---- Couple Balances ----
    if (Object.keys(data.couples).length > 0) {
        html += `
        <div class="result-section animate-in">
            <h3>💑 מאזן זוגות (אחרי קיזוז פנימי)</h3>
            <div class="couples-grid">
                ${Object.entries(data.couples).map(([name, c]) => `
                    <div class="couple-balance-card
                        ${c.netBalance > 0.01 ? 'positive' :
                          c.netBalance < -0.01 ? 'negative' : 'zero'}">
                        <div class="couple-title">💑 ${name}</div>
                        <div class="couple-members-list">
                            ${c.members.join(' + ')}
                        </div>
                        <div class="couple-numbers">
                            <div>
                                <span class="label">שילמו</span>
                                <span class="value">
                                    ₪${c.totalPaid.toFixed(2)}
                                </span>
                            </div>
                            <div>
                                <span class="label">חלקם</span>
                                <span class="value">
                                    ₪${c.totalOwes.toFixed(2)}
                                </span>
                            </div>
                        </div>
                        <div class="couple-net">
                            ${c.netBalance > 0.01
                                ? `<span class="positive-text">
                                    מגיע להם ₪${c.netBalance.toFixed(2)}
                                   </span>`
                                : c.netBalance < -0.01
                                ? `<span class="negative-text">
                                    חייבים ₪${(-c.netBalance).toFixed(2)}
                                   </span>`
                                : `<span class="zero-text">
                                    מאוזן ✓
                                   </span>`}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>`;
    }

    // ---- Transfers (Main Result) ----
    html += `
    <div class="result-section transfers-section animate-in">
        <h3>💸 העברות נדרשות</h3>
        <p class="transfers-subtitle">
            ${data.transfers.length === 0
                ? ''
                : `${data.transfers.length} העברות בלבד — הדרך היעילה ביותר!`}
        </p>
        ${data.transfers.length === 0
            ? '<div class="no-transfers">הכל מאוזן! 🎉</div>'
            : `<div class="transfers-list">
                ${data.transfers.map((t, i) => `
                    <div class="transfer-card"
                         style="animation-delay: ${i * 0.15}s">
                        <div class="transfer-number">${i + 1}</div>
                        <div class="transfer-details">
                            <div class="transfer-from">
                                <span class="transfer-label">משלם</span>
                                <span class="transfer-name">${t.from}</span>
                            </div>
                            <div class="transfer-arrow">
                                <span class="arrow-amount">
                                    ₪${t.amount.toFixed(2)}
                                </span>
                                <span class="arrow-icon">←</span>
                            </div>
                            <div class="transfer-to">
                                <span class="transfer-label">מקבל</span>
                                <span class="transfer-name">${t.to}</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
               </div>`
        }
    </div>`;

    // ---- Share Button ----
    html += `
    <div class="result-actions">
        <button class="btn btn-share" onclick="copyResults()">
            📋 העתק תוצאות
        </button>
        <button class="btn btn-reset" onclick="resetAll()">
            🔄 התחל מחדש
        </button>
    </div>`;

    body.innerHTML = html;
    card.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ========== COPY RESULTS ==========
function copyResults() {
    const calc = new BillCalculator();
    persons.forEach(p => calc.addPerson(p.name, p.couple_group));
    categories.forEach(cat =>
        calc.addCategory(cat.name, cat.participants, cat.payments));
    const data = calc.calculate();

    let text = `💰 חלוקת חשבון\n`;
    text += `${'═'.repeat(30)}\n\n`;
    text += `סה"כ: ₪${data.totalEvent.toFixed(2)}\n\n`;

    Object.entries(data.categories).forEach(([name, cat]) => {
        text += `📦 ${name}: ₪${cat.total.toFixed(2)}`;
        text += ` (₪${cat.sharePerPerson.toFixed(2)} x${cat.participantsCount})\n`;
    });

    text += `\n💸 העברות:\n`;
    if (data.transfers.length === 0) {
        text += `הכל מאוזן! 🎉\n`;
    } else {
        data.transfers.forEach((t, i) => {
            text += `${i + 1}. ${t.from} ← ${t.to}: ₪${t.amount.toFixed(2)}\n`;
        });
    }

    navigator.clipboard.writeText(text).then(() => {
        showToast('הועתק ללוח! 📋', 'success');
    }).catch(() => {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('הועתק ללוח! 📋', 'success');
    });
}

// ========== RESET ==========
function resetAll() {
    if (!confirm('למחוק הכל ולהתחיל מחדש?')) return;
    persons = [];
    categories = [];
    document.getElementById('resultsCard').style.display = 'none';
    renderPersons();
    renderCategories();
    showToast('הכל נמחק — התחל מחדש!', 'info');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========== LOAD EXAMPLE ==========
function loadExample() {
    persons = [
        { name: "מיראל", couple_group: "מיראל-ריהד" },
        { name: "ריהד", couple_group: "מיראל-ריהד" },
        { name: "עמירם", couple_group: "עמירם-מאי" },
        { name: "מאי", couple_group: "עמירם-מאי" },
        { name: "נועה", couple_group: "נועה-רועי" },
        { name: "רועי", couple_group: "נועה-רועי" },
        { name: "פז", couple_group: "פז-צופיה" },
        { name: "צופיה", couple_group: "פז-צופיה" },
        { name: "ברק", couple_group: "ברק-טופז" },
        { name: "טופז", couple_group: "ברק-טופז" },
        { name: "אביב", couple_group: null },
        { name: "יעקב", couple_group: null },
        { name: "נסטיה", couple_group: "שקד-נסטיה" },
        { name: "שקד", couple_group: "שקד-נסטיה" }
    ];

    categories = [
        {
            name: "פיצות 🍕",
            participants: [
                "מיראל", "ריהד", "עמירם", "מאי",
                "נועה", "רועי", "פז", "צופיה",
                "ברק", "טופז", "אביב", "יעקב"
            ],
            payments: { "מיראל": 275, "מאי": 40 }
        },
        {
            name: "אלכוהול 🍺",
            participants: [
                "מיראל", "ריהד", "עמירם", "מאי",
                "ברק", "טופז", "אביב", "יעקב"
            ],
            payments: { "ברק": 46, "יעקב": 48, "עמירם": 420 }
        }
    ];

    renderPersons();
    renderCategories();
    showToast('דוגמה נטענה! לחץ "חשב" 📋', 'success');
}

// ========== TOAST NOTIFICATIONS ==========
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

// ========== UTILITIES ==========
function shakeElement(el) {
    el.classList.add('shake');
    setTimeout(() => el.classList.remove('shake'), 500);
}

// Handle Enter key globally for inputs
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        if (e.target.id === 'personName' || e.target.id === 'coupleGroup') {
            addPerson();
        } else if (e.target.id === 'categoryName') {
            addCategory();
        }
    }
});

// ========== INIT ==========
document.addEventListener('DOMContentLoaded', () => {
    renderPersons();
    renderCategories();
});
