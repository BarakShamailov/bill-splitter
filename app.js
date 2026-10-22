/**
 * Bill Splitter Pro - UI Application
 * Pure JavaScript, no frameworks
 */

// ========== STATE ==========
// persons:    [{ name, couple_group }]
// categories: [{ name, participants: [names], payers: [{ name, amount }] }]
let persons = [];
let categories = [];
let currentStep = 1;
let lastResult = null;
let editingName = null;   // person being edited in the step-1 form
const openCats = new Set(); // expense objects whose editor is expanded

const STORAGE_KEY = 'billSplitter.v2';
const RLM = '‏'; // keeps WhatsApp lines right-to-left

// ========== ICONS ==========
const ICONS = {
    plus: '<path d="M12 5v14M5 12h14"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/>',
    edit: '<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4M13.5 6.5l4 4"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M5 21v-1a6 6 0 0 1 6-6h2a6 6 0 0 1 6 6v1"/>',
    users: '<circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2M16 3.1a4 4 0 0 1 0 7.8M21 21v-2a4 4 0 0 0-3-3.9"/>',
    receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h4"/>',
    calculator: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15v3M8 18h4"/>',
    whatsapp: '<path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9z"/><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
    link: '<path d="M9 15l6-6M11 6l.5-.5a5 5 0 0 1 7 7L18 13M13 18l-.5.5a5 5 0 0 1-7-7L6 11"/>',
    chevron: '<path d="m6 9 6 6 6-6"/>',
    arrow: '<path d="M19 12H5M11 18l-6-6 6-6"/>',
    refresh: '<path d="M20 11A8 8 0 1 0 18 17M20 4v7h-7"/>',
    check: '<path d="m5 12 5 5L20 7"/>',
    circleCheck: '<circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
    alert: '<circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v4h1"/>',
    printer: '<path d="M7 9V3h10v6M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"/><rect x="7" y="14" width="10" height="7" rx="1"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    pie: '<path d="M12 3a9 9 0 1 0 9 9h-9z"/><path d="M15 2.5A9 9 0 0 1 21.5 9H15z"/>',
    send: '<path d="M3 11.5 21 3l-8.5 18-2.5-7z"/><path d="m10 14 5-5"/>',
    utensils: '<path d="M7 3v8M4 3v5a3 3 0 0 0 6 0V3M7 11v10M17 3c-2 1.5-3 4-3 7h3v11"/>',
    glass: '<path d="M7 3h10l-1 7a4 4 0 0 1-8 0zM12 14v7M8 21h8M7.5 7h9"/>',
    pizza: '<path d="M12 21 3 6a15 15 0 0 1 18 0z"/><path d="M5 9.5a12 12 0 0 1 14 0"/><circle cx="10.5" cy="12" r="1"/><circle cx="13.5" cy="15.5" r="1"/>',
    coffee: '<path d="M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM17 10h1.5a2.5 2.5 0 0 1 0 5H17M8 3v3M12 3v3"/>',
    bed: '<path d="M3 19V6M3 13h18v6M21 13a3 3 0 0 0-3-3h-7v3"/><circle cx="7" cy="10" r="2"/>',
    car: '<path d="M5 16v3h3v-2h8v2h3v-3l-1.5-6A2 2 0 0 0 15.6 8.5H8.4A2 2 0 0 0 6.5 10z"/><path d="M5 13h14M7.5 14.5h.01M16.5 14.5h.01"/>',
    fuel: '<path d="M4 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M3 21h12M4 10h10M14 8l3 3v6a1.5 1.5 0 0 0 3 0V8l-3-3"/>',
    cart: '<path d="M3 4h2l2.5 11h10L20 7H6.2"/><circle cx="9" cy="19.5" r="1.5"/><circle cx="17" cy="19.5" r="1.5"/>',
    plane: '<path d="M10.5 13.5 3 11l1.5-1.5 8 .5 4.5-4.5a2 2 0 0 1 3 3L15.5 13l.5 8-1.5 1.5-2.5-7.5-3 3V20l-1.5 1.5-1-3.5L3 17l1.5-1.5H7z"/>',
    ticket: '<path d="M3 8a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 0-2 2H5a2 2 0 0 0-2-2v-2a2 2 0 0 0 0-4z"/><path d="M14 6v12" stroke-dasharray="2 2"/>',
    home: '<path d="M4 11 12 4l8 7v9H4z"/><path d="M10 20v-5h4v5"/>',
    gift: '<rect x="4" y="9" width="16" height="12" rx="1"/><path d="M3 9h18M12 9v12M12 9C10 5 7 5 7 7s3 2 5 2c2 0 5 0 5-2s-3-2-5 2"/>'
};

function icon(name, cls = 'icon') {
    return `<svg class="${cls}" aria-hidden="true" viewBox="0 0 24 24">${ICONS[name]}</svg>`;
}

// ========== PERSON COLORS ==========
// Every friend owns a color by position in the list; it follows them everywhere
let colorNames = null; // set by the shared view; editor uses the live list

function colorOf(name) {
    const names = colorNames || persons.map(p => p.name);
    const i = names.indexOf(name);
    return i < 0 ? 0 : i % 10;
}

function avatarHtml(name, size = '') {
    return `<span class="avatar pc-${colorOf(name)} ${size}" aria-hidden="true">${esc(initials(name))}</span>`;
}

// ========== EXPENSE TYPES ==========
// Guess an icon from the expense name, so the list scans by kind
const EXPENSE_KINDS = [
    { icon: 'pizza',    cls: 'c-orange', words: ['פיצ', 'pizza'] },
    { icon: 'glass',    cls: 'c-violet', words: ['אלכוהול', 'בירה', 'יין', 'שתי', 'פאב', 'קוקטייל', 'וודקה', 'drink', 'beer', 'wine'] },
    { icon: 'coffee',   cls: 'c-orange', words: ['קפה', 'בוקר', 'מאפ', 'coffee'] },
    { icon: 'utensils', cls: 'c-orange', words: ['ארוח', 'אוכל', 'מסעד', 'ערב', 'צהריים', 'המבורגר', 'סושי', 'על האש', 'בשר', 'food', 'dinner', 'lunch'] },
    { icon: 'cart',     cls: 'c-teal',   words: ['סופר', 'קניות', 'מכולת', 'שוק', 'מצרכים'] },
    { icon: 'bed',      cls: 'c-pink',   words: ['מלון', 'לינה', 'צימר', 'דירה', 'airbnb', 'hotel', 'וילה', 'אכסני'] },
    { icon: 'fuel',     cls: 'c-blue',   words: ['דלק', 'בנזין', 'סולר', 'חניה', 'כביש', 'fuel'] },
    { icon: 'car',      cls: 'c-blue',   words: ['רכב', 'מונית', 'השכר', 'אוטו', 'נסיע', 'הסע', 'uber', 'taxi'] },
    { icon: 'plane',    cls: 'c-blue',   words: ['טיס', 'כרטיס טיסה', 'flight'] },
    { icon: 'ticket',   cls: 'c-violet', words: ['כרטיס', 'הופעה', 'סרט', 'כניסה', 'אטרקצי', 'פארק', 'מוזיאון', 'סיור'] },
    { icon: 'home',     cls: 'c-teal',   words: ['שכירות', 'חשמל', 'מים', 'ארנונה', 'גז', 'ועד', 'אינטרנט'] },
    { icon: 'gift',     cls: 'c-pink',   words: ['מתנה', 'gift'] }
];

function expenseKind(name) {
    const n = String(name).toLowerCase();
    return EXPENSE_KINDS.find(k => k.words.some(w => n.includes(w))) || { icon: 'receipt', cls: 'c-green' };
}

function expenseIconHtml(name) {
    const kind = expenseKind(name);
    return `<span class="expense-icon ${kind.cls}" aria-hidden="true">${icon(kind.icon)}</span>`;
}

// ========== FORMATTING ==========
function esc(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function money(n) {
    const v = Math.round(Math.abs(n) * 100) / 100;
    const s = Number.isInteger(v)
        ? v.toLocaleString('he-IL')
        : v.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `₪${s}`;
}

// Money wrapped so it never reorders inside Hebrew text
function moneyHtml(n, cls = '') {
    return `<bdi class="num ${cls}" dir="ltr">${money(n)}</bdi>`;
}

// Signed amount, sign kept inside the LTR run: "−₪275"
function signedMoneyHtml(n, sign, cls = '') {
    return `<bdi class="num ${cls}" dir="ltr">${sign}${money(n)}</bdi>`;
}

function nameHtml(name) {
    return `<bdi>${esc(name)}</bdi>`;
}

// "א", "א וב", "א, ב וג"
function joinNames(names) {
    if (names.length <= 1) return names.join('');
    return names.slice(0, -1).join(', ') + ' ו' + names[names.length - 1];
}

function initials(name) {
    const clean = name.replace(/[^\p{L}\p{N}\s]/gu, '').trim() || name.trim();
    const parts = clean.split(/\s+/);
    const s = parts.length > 1 ? parts[0][0] + parts[1][0] : clean.slice(0, 2);
    return s.toUpperCase();
}

function plural(n, one, many) {
    return n === 1 ? one : `${n} ${many}`;
}

// ========== PERSISTENCE ==========
function save() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ persons, categories }));
    } catch (e) { /* storage unavailable */ }
    renderHeroStatus();
}

// ========== THEME ==========
const THEME_KEY = 'billSplitter.theme';

function applyTheme(theme) {
    const dark = theme === 'dark';
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    document.querySelector('meta[name="theme-color"]').content = dark ? '#0E1220' : '#FFFFFF';
    const btn = document.getElementById('themeBtn');
    btn.setAttribute('aria-pressed', String(dark));
    btn.setAttribute('aria-label', dark ? 'מצב בהיר' : 'מצב כהה');
}

function toggleTheme() {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* storage unavailable */ }
}

// ========== HERO STATUS ==========
function renderHeroStatus() {
    const box = document.getElementById('heroStatus');
    if (!box) return;
    const total = categories.reduce((s, c) => s + categoryTotal(c), 0);

    if (persons.length === 0) {
        box.innerHTML = `
            <p class="hs-label">סה"כ הוצאות</p>
            <span class="hs-total">${moneyHtml(0)}</span>
            <p class="hs-empty">עוד לא הוזן כלום. רוצים לראות איך זה נראה?</p>
            <p class="hs-empty"><button type="button" class="btn btn-sm" data-action="load-example">טען דוגמה</button></p>`;
        return;
    }

    const shown = persons.slice(0, 6);
    const more = persons.length - shown.length;
    box.innerHTML = `
        <p class="hs-label">סה"כ הוצאות</p>
        <span class="hs-total">${moneyHtml(total)}</span>
        <p class="hs-meta">${plural(persons.length, 'משתתף אחד', 'משתתפים')} · ${categories.length === 0 ? 'אין הוצאות' : plural(categories.length, 'הוצאה אחת', 'הוצאות')}</p>
        <div class="hs-people">
            ${shown.map(p => avatarHtml(p.name)).join('')}
            ${more > 0 ? `<span class="hs-more">+${more}</span>` : ''}
        </div>`;
}

function restore() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const data = JSON.parse(raw);
        if (Array.isArray(data.persons) && Array.isArray(data.categories)) {
            persons = data.persons;
            categories = data.categories;
        }
    } catch (e) { /* ignore corrupt storage */ }
}

// ========== FIELD ERRORS ==========
function setFieldError(inputId, message) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(`${inputId}Error`);
    if (error) error.textContent = message || '';
    if (message) {
        input.setAttribute('aria-invalid', 'true');
        shakeElement(input);
        input.focus();
    } else {
        input.removeAttribute('aria-invalid');
    }
}

// ========== PERSONS ==========
function submitPerson() {
    const nameInput = document.getElementById('personName');
    const groupInput = document.getElementById('coupleGroup');
    const name = nameInput.value.trim();
    const group = groupInput.value.trim() || null;

    if (!name) {
        setFieldError('personName', 'כתבו שם כדי להוסיף משתתף.');
        return;
    }
    if (persons.some(p => p.name === name && p.name !== editingName)) {
        setFieldError('personName', `כבר יש משתתף בשם ${name}. הוסיפו שם משפחה או כינוי.`);
        return;
    }
    setFieldError('personName', '');

    if (editingName) {
        const person = persons.find(p => p.name === editingName);
        const oldName = person.name;
        person.name = name;
        person.couple_group = group;
        if (oldName !== name) {
            categories.forEach(cat => {
                cat.participants = cat.participants.map(n => (n === oldName ? name : n));
                cat.payers.forEach(p => { if (p.name === oldName) p.name = name; });
            });
        }
        showToast(`הפרטים של ${name} עודכנו`, 'success');
        save();
        endEdit();
        return;
    }

    persons.push({ name, couple_group: group });
    nameInput.value = '';
    groupInput.value = '';
    nameInput.focus();
    save();
    renderPersons();
}

function startEdit(name) {
    const person = persons.find(p => p.name === name);
    if (!person) return;
    editingName = name;
    document.getElementById('personName').value = person.name;
    document.getElementById('coupleGroup').value = person.couple_group || '';
    setFieldError('personName', '');
    updatePersonForm();
    renderPersons();
    document.getElementById('personForm').scrollIntoView({ behavior: 'smooth', block: 'center' });
    document.getElementById('personName').focus({ preventScroll: true });
}

function endEdit() {
    editingName = null;
    document.getElementById('personName').value = '';
    document.getElementById('coupleGroup').value = '';
    setFieldError('personName', '');
    updatePersonForm();
    renderPersons();
}

function updatePersonForm() {
    const editing = editingName !== null;
    document.getElementById('personForm').classList.toggle('is-editing', editing);
    document.getElementById('personFormTitle').textContent = editing ? `עריכת ${editingName}` : 'משתתף חדש';
    document.getElementById('personSubmit').innerHTML = editing
        ? `${icon('check')} שמירה`
        : `${icon('plus')} הוספה`;
    document.getElementById('personCancel').hidden = !editing;
}

function removePerson(name) {
    persons = persons.filter(p => p.name !== name);
    categories.forEach(cat => {
        cat.participants = cat.participants.filter(p => p !== name);
        cat.payers = cat.payers.filter(p => p.name !== name);
        if (cat.payers.length === 0) cat.payers.push({ name: '', amount: 0 });
    });
    save();
    if (editingName === name) endEdit();
    else renderPersons();
    showToast(`${name} הוסר/ה מהרשימה`, 'info');
}

function personRowHtml(p) {
    const editing = p.name === editingName;
    return `
        <li class="person-chip ${editing ? 'is-editing' : ''}">
            ${avatarHtml(p.name)}
            <span class="row-name">${nameHtml(p.name)}</span>
            <button type="button" class="icon-btn" data-action="edit-person" data-name="${esc(p.name)}"
                    aria-label="עריכת ${esc(p.name)}">${icon('edit')}</button>
            <button type="button" class="icon-btn danger" data-action="remove-person" data-name="${esc(p.name)}"
                    aria-label="הסרת ${esc(p.name)}">${icon('trash')}</button>
        </li>`;
}

function renderPersons() {
    const container = document.getElementById('personsList');
    const groupNames = [...new Set(persons.map(p => p.couple_group).filter(Boolean))];
    document.getElementById('groupOptions').innerHTML =
        groupNames.map(g => `<option value="${esc(g)}">`).join('');

    if (persons.length === 0) {
        container.innerHTML = `
            <div class="empty">
                ${icon('users', 'empty-icon')}
                <p class="empty-title">עוד אין משתתפים</p>
                <p class="empty-text">הוסיפו לפחות שניים כדי להתחיל, או טענו דוגמה כדי לראות איך זה עובד.</p>
                <button type="button" class="btn btn-secondary" data-action="load-example">טען דוגמה</button>
            </div>`;
        updateActionbar();
        return;
    }

    const groups = {};
    const singles = [];
    persons.forEach(p => {
        if (p.couple_group) (groups[p.couple_group] = groups[p.couple_group] || []).push(p);
        else singles.push(p);
    });

    let html = `
        <div class="people-wrap">
            <div class="people-head">
                <h3>מי משתתף</h3>
                <span class="count" aria-label="${persons.length} משתתפים">${persons.length}</span>
            </div>`;

    for (const [groupName, members] of Object.entries(groups)) {
        html += `
            <div class="people-group">
                <p class="group-label">
                    ${icon('users')}
                    <bdi>${esc(groupName)}</bdi>
                    <span>· מתקזזים ביניהם</span>
                </p>
                <ul class="person-grid">${members.map(personRowHtml).join('')}</ul>
            </div>`;
    }
    if (singles.length) {
        html += `
            <div class="people-group">
                ${Object.keys(groups).length ? `<p class="group-label">${icon('user')}בלי קבוצה</p>` : ''}
                <ul class="person-grid">${singles.map(personRowHtml).join('')}</ul>
            </div>`;
    }
    html += '</div>';

    container.innerHTML = html;
    updateActionbar();
}

// ========== CATEGORIES ==========
function addCategory() {
    const nameInput = document.getElementById('categoryName');
    const name = nameInput.value.trim();

    if (!name) {
        setFieldError('categoryName', 'כתבו שם להוצאה, למשל "פיצות".');
        return;
    }
    if (categories.some(c => c.name === name)) {
        setFieldError('categoryName', `כבר יש הוצאה בשם ${name}.`);
        return;
    }
    setFieldError('categoryName', '');

    const cat = {
        name,
        participants: persons.map(p => p.name),
        payers: [{ name: '', amount: 0 }]
    };
    categories.push(cat);
    openCats.add(cat);

    nameInput.value = '';
    save();
    renderCategories();
    const cards = document.querySelectorAll('.expense');
    const last = cards[cards.length - 1];
    if (last) last.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function removeCategory(index) {
    const name = categories[index].name;
    categories.splice(index, 1);
    save();
    renderCategories();
    showToast(`ההוצאה ${name} נמחקה`, 'info');
}

function categoryTotal(cat) {
    return cat.payers.reduce((s, p) => s + (p.name && p.amount > 0 ? p.amount : 0), 0);
}

function categoryPayments(cat) {
    const payments = {};
    cat.payers.forEach(p => {
        if (p.name && p.amount > 0) {
            payments[p.name] = (payments[p.name] || 0) + p.amount;
        }
    });
    return payments;
}

function mathLineHtml(cat) {
    const total = categoryTotal(cat);
    const n = cat.participants.length;
    if (total > 0 && n === 0) {
        return `<span class="warn">${icon('alert')} סמנו מי השתתף, אחרת אי אפשר לחלק את ${moneyHtml(total)}</span>`;
    }
    if (total === 0) {
        return `<span class="muted">בחרו מי שילם והזינו סכום</span>`;
    }
    return `${moneyHtml(total)} ÷ ${n} = <strong>${moneyHtml(total / n)}</strong> לכל משתתף`;
}

function updateCategoryMath(catIdx) {
    const cat = categories[catIdx];
    const line = document.getElementById(`math_${catIdx}`);
    const total = document.getElementById(`total_${catIdx}`);
    const meta = document.getElementById(`meta_${catIdx}`);
    if (line) line.innerHTML = mathLineHtml(cat);
    if (meta) meta.innerHTML = expenseMetaHtml(cat);
    if (total) {
        total.innerHTML = moneyHtml(categoryTotal(cat));
        total.classList.toggle('zero', categoryTotal(cat) === 0);
    }
}

function payerRowHtml(payer, pIdx) {
    return `
        <div class="payer-row" data-payer="${pIdx}">
            <select data-action="payer-name" aria-label="מי שילם">
                <option value="">בחרו משתתף</option>
                ${persons.map(p => `<option value="${esc(p.name)}" ${p.name === payer.name ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}
            </select>
            <div class="amount">
                <span class="amount-symbol" aria-hidden="true">₪</span>
                <input type="number" inputmode="decimal" min="0" step="0.01" placeholder="0"
                       value="${payer.amount > 0 ? payer.amount : ''}"
                       data-action="payer-amount" aria-label="סכום ששולם">
            </div>
            <button type="button" class="icon-btn" data-action="remove-payer"
                    aria-label="הסרת שורת תשלום">${icon('x')}</button>
            <p class="field-error payer-error" role="alert"></p>
        </div>`;
}

function renderCategories() {
    const container = document.getElementById('categoriesList');

    if (categories.length === 0) {
        container.innerHTML = `
            <div class="empty">
                ${icon('receipt', 'empty-icon')}
                <p class="empty-title">עוד אין הוצאות</p>
                <p class="empty-text">הוסיפו הוצאה לכל דבר שחולק בין קבוצה אחרת של אנשים: אוכל, שתייה, דלק.</p>
            </div>`;
        renderReview();
        return;
    }

    container.innerHTML = `<div class="expense-list">${categories.map((cat, catIdx) => {
        const all = persons.length > 0 && cat.participants.length === persons.length;
        const open = openCats.has(cat);
        return `
        <article class="expense ${open ? 'open' : ''}" data-cat="${catIdx}" id="cat_${catIdx}">
            <button type="button" class="expense-row" data-action="toggle-expense"
                    aria-expanded="${open}" aria-controls="catbody_${catIdx}">
                ${expenseIconHtml(cat.name)}
                <span class="expense-main">
                    <span class="expense-name"><bdi>${esc(cat.name)}</bdi></span>
                    <span class="expense-meta" id="meta_${catIdx}">${expenseMetaHtml(cat)}</span>
                </span>
                <span class="expense-total ${categoryTotal(cat) ? '' : 'zero'}" id="total_${catIdx}">${moneyHtml(categoryTotal(cat))}</span>
                ${icon('chevron', 'icon chev')}
            </button>

            <div class="expense-body" id="catbody_${catIdx}" ${open ? '' : 'hidden'}>
                <div class="expense-section">
                    <div class="section-row">
                        <h3>מי השתתף <span class="muted">${cat.participants.length} מתוך ${persons.length}</span></h3>
                        <button type="button" class="link-btn" data-action="${all ? 'clear-all' : 'select-all'}">
                            ${all ? 'ניקוי' : 'בחירת כולם'}
                        </button>
                    </div>
                    <div class="chips">
                        ${persons.map(p => {
                            const on = cat.participants.includes(p.name);
                            return `<button type="button" class="chip toggle pc-${colorOf(p.name)} ${on ? 'on' : ''}"
                                        aria-pressed="${on}" data-action="toggle-participant"
                                        data-name="${esc(p.name)}">${avatarHtml(p.name)}${nameHtml(p.name)}</button>`;
                        }).join('')}
                    </div>
                </div>

                <div class="expense-section">
                    <h3>מי שילם</h3>
                    <div class="payers">${cat.payers.map(payerRowHtml).join('')}</div>
                    <button type="button" class="link-btn add-payer" data-action="add-payer">${icon('plus')} עוד משלם</button>
                </div>

                <p class="math-line" id="math_${catIdx}" aria-live="polite">${mathLineHtml(cat)}</p>

                <div class="rename-row">
                    <div class="field">
                        <label for="rename_${catIdx}">שם ההוצאה</label>
                        <input type="text" id="rename_${catIdx}" value="${esc(cat.name)}"
                               data-action="rename-category" maxlength="40">
                    </div>
                    <button type="button" class="btn btn-ghost danger-text" data-action="remove-category">
                        ${icon('trash')} מחיקה
                    </button>
                </div>
            </div>
        </article>`;
    }).join('')}</div>`;

    renderReview();
}

// "4 משתתפים · שילם: דנה" under each expense name
function expenseMetaHtml(cat) {
    const payers = Object.keys(categoryPayments(cat));
    const n = cat.participants.length;
    if (categoryTotal(cat) > 0 && n === 0) {
        return 'לא סומן מי השתתף';
    }
    const who = n === persons.length && n > 1 ? 'כולם' : plural(n, 'משתתף אחד', 'משתתפים');
    return payers.length
        ? `${who} · ${payers.length > 1 ? 'שילמו' : 'שילם/ה'}: <bdi>${esc(joinNames(payers))}</bdi>`
        : `${who} · עוד לא הוזן תשלום`;
}

// ========== REVIEW / VALIDATION ==========
// error = blocks calculation, warn = calculation runs but something is ignored
function getIssues() {
    const issues = [];
    if (persons.length < 2) {
        issues.push({ level: 'error', msg: 'צריך לפחות שני משתתפים.', fix: { step: 1 } });
    }
    if (categories.length === 0) {
        issues.push({ level: 'error', msg: 'עוד לא הוספתם הוצאות.', fix: { step: 2, focus: 'categoryName' } });
        return issues;
    }
    if (!categories.some(cat => categoryTotal(cat) > 0)) {
        issues.push({ level: 'error', msg: 'עוד לא הוזן אף תשלום. בחרו מי שילם והזינו סכום.', fix: { step: 2, cat: 0 } });
    }
    categories.forEach((cat, i) => {
        if (categoryTotal(cat) > 0 && cat.participants.length === 0) {
            issues.push({ level: 'error', msg: `ב"${cat.name}" יש תשלום, אבל לא סומן מי השתתף.`, fix: { step: 2, cat: i } });
        }
    });
    categories.forEach((cat, i) => {
        if (categoryTotal(cat) === 0 && cat.participants.length > 0) {
            issues.push({ level: 'warn', msg: `ב"${cat.name}" לא הוזן תשלום, אז היא לא תיכנס לחישוב.`, fix: { step: 2, cat: i } });
        }
        if (cat.payers.some(p => !p.name && p.amount > 0)) {
            issues.push({ level: 'warn', msg: `ב"${cat.name}" יש סכום בלי שם של מי ששילם. הסכום הזה לא נספר.`, fix: { step: 2, cat: i } });
        }
    });
    const involved = new Set();
    categories.forEach(cat => {
        if (categoryTotal(cat) > 0) cat.participants.forEach(n => involved.add(n));
        Object.keys(categoryPayments(cat)).forEach(n => involved.add(n));
    });
    const idle = persons.filter(p => !involved.has(p.name)).map(p => p.name);
    if (idle.length && categories.some(cat => categoryTotal(cat) > 0)) {
        issues.push({
            level: 'warn',
            msg: `${joinNames(idle)} לא ${idle.length === 1 ? 'משתתף/ת' : 'משתתפים'} באף הוצאה ולא ${idle.length === 1 ? 'שילם/ה' : 'שילמו'}.`,
            fix: { step: 2 }
        });
    }
    return issues;
}

function blockingIssue() {
    return getIssues().find(i => i.level === 'error') || null;
}

function renderReview() {
    const box = document.getElementById('reviewPanel');
    const issues = getIssues();
    const errors = issues.filter(i => i.level === 'error');
    const total = categories.reduce((s, c) => s + categoryTotal(c), 0);

    const issueItem = (issue, idx) => `
        <li class="issue ${issue.level}">
            ${icon(issue.level === 'error' ? 'alert' : 'info')}
            <span class="issue-text">${esc(issue.msg)}</span>
            <button type="button" class="link-btn" data-action="fix-issue" data-issue="${idx}">תיקון</button>
        </li>`;

    box.innerHTML = `
        <section class="card review" id="review" aria-labelledby="h-review" tabindex="-1">
            <div class="card-head tight">
                <span class="card-icon c-violet" aria-hidden="true">${icon('circleCheck')}</span>
                <div class="card-titles">
                    <h2 id="h-review">לפני החישוב</h2>
                    <p class="card-sub">בדיקה אחרונה שהכול הוזן כמו שצריך.</p>
                </div>
            </div>
            <dl class="review-stats">
                <div><dt>משתתפים</dt><dd class="num">${persons.length}</dd></div>
                <div><dt>הוצאות</dt><dd class="num">${categories.length}</dd></div>
                <div><dt>סה"כ שולם</dt><dd>${moneyHtml(total)}</dd></div>
            </dl>
            ${issues.length ? `<ul class="issues">${issues.map(issueItem).join('')}</ul>` : ''}
            ${errors.length === 0 ? `<p class="ready">${icon('circleCheck')} הכול מוכן. לחצו "חישוב החלוקה".</p>` : ''}
        </section>`;
    updateActionbar();
}

function fixIssue(index) {
    const issue = getIssues()[index];
    if (!issue) return;
    const { step, cat, focus } = issue.fix;
    if (step !== currentStep) goToStep(step);
    afterStepScroll(() => {
        if (focus) {
            const el = document.getElementById(focus);
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.focus({ preventScroll: true });
        } else if (cat !== undefined) {
            if (categories[cat] && !openCats.has(categories[cat])) {
                openCats.add(categories[cat]);
                renderCategories();
            }
            const card = document.getElementById(`cat_${cat}`);
            if (card) {
                card.scrollIntoView({ behavior: 'smooth', block: 'start' });
                card.classList.remove('flash');
                void card.offsetWidth;
                card.classList.add('flash');
            }
        } else if (step === 1) {
            document.getElementById('personName').focus();
        }
    });
}

// Run after goToStep's own scroll-to-top so the two scrolls don't cancel out
function afterStepScroll(fn) {
    setTimeout(fn, 80);
}

// ========== CALCULATE ==========
function runCalculator(personList, categoryList) {
    const calc = new BillCalculator();
    personList.forEach(p => calc.addPerson(p.name, p.couple_group));
    categoryList.forEach(cat => {
        const payments = cat.payments || categoryPayments(cat);
        if (Object.keys(payments).length === 0 && cat.participants.length === 0) return;
        calc.addCategory(cat.name, cat.participants, payments);
    });
    return calc.calculate();
}

// Who is who: person -> entity key, entity key -> display label
function buildEntities(data) {
    const entityOf = {};
    const label = {};
    const members = {};
    Object.entries(data.couples).forEach(([group, c]) => {
        c.members.forEach(m => { entityOf[m] = group; });
        members[group] = c.members;
        label[group] = joinNames(c.members);
    });
    Object.keys(data.persons).forEach(name => {
        if (!entityOf[name]) {
            entityOf[name] = name;
            members[name] = [name];
            label[name] = name;
        }
    });
    return { entityOf, label, members };
}

// What an entity actually sends/receives, so every number on screen
// matches the transfer list (balances can differ by a rounding cent)
function netOf(key, data) {
    let net = 0;
    data.transfers.forEach(t => {
        if (t.from === key) net -= t.amount;
        if (t.to === key) net += t.amount;
    });
    return Math.round(net * 100) / 100;
}

// ========== RESULTS ==========
function entityAvatar(key, ent, size = '') {
    return avatarHtml(ent.members[key][0], size);
}

function transferItem(t, ent) {
    return `
        <li class="transfer">
            <span class="t-person">
                ${entityAvatar(t.from, ent)}
                <span><span class="t-role">מעביר</span><span class="t-name">${nameHtml(ent.label[t.from])}</span></span>
            </span>
            <span class="t-arrow" aria-label="ל">${icon('arrow')}</span>
            <span class="t-person">
                ${entityAvatar(t.to, ent)}
                <span><span class="t-role">מקבל</span><span class="t-name">${nameHtml(ent.label[t.to])}</span></span>
            </span>
            <span class="t-amount">${moneyHtml(t.amount)}</span>
        </li>`;
}

function transfersHtml(transfers, ent) {
    return `<ul class="transfer-list">${transfers.map(x => transferItem(x, ent)).join('')}</ul>`;
}

function statusHtml(balance, isGroup) {
    if (balance < -0.01) {
        return `<span class="status neg">${isGroup ? 'מעבירים' : 'מעביר/ה'} ${moneyHtml(balance)}</span>`;
    }
    if (balance > 0.01) {
        return `<span class="status pos">${isGroup ? 'מקבלים' : 'מקבל/ת'} ${moneyHtml(balance)}</span>`;
    }
    return `<span class="status zero">${icon('check')} ${isGroup ? 'מאוזנים' : 'מאוזן/ת'}</span>`;
}

// Short "to do" text for selects and messages, without gendered verbs
function actionText(key, data) {
    const bal = netOf(key, data);
    if (bal < -0.01) return `להעביר ${money(bal)}`;
    if (bal > 0.01) return `לקבל ${money(bal)}`;
    return 'מאוזן';
}

// Per-person calculation lines: share of every expense, then what they paid
function personBreakdownHtml(name, data, you = false) {
    const p = data.persons[name];
    const shares = Object.entries(data.categories).filter(([, c]) => c.participants.includes(name));
    const paid = Object.entries(data.categories).filter(([, c]) => c.payments[name] > 0);

    let html = '<dl class="calc">';
    shares.forEach(([catName, c]) => {
        html += `
            <div class="calc-row">
                <dt>${nameHtml(catName)}<span class="calc-how">${moneyHtml(c.total)} ÷ ${c.participantsCount}</span></dt>
                <dd>${moneyHtml(c.total / c.participantsCount)}</dd>
            </div>`;
    });
    if (shares.length === 0) {
        html += '<div class="calc-row"><dt class="muted">לא השתתף/ה באף הוצאה</dt><dd></dd></div>';
    }
    html += `
        <div class="calc-row calc-sub"><dt>${you ? 'החלק שלך' : 'החלק'}</dt><dd>${moneyHtml(p.owes)}</dd></div>`;
    paid.forEach(([catName, c]) => {
        html += `
            <div class="calc-row"><dt>${you ? 'שילמת' : 'שילם/ה'} על ${nameHtml(catName)}</dt><dd>${signedMoneyHtml(c.payments[name], '−')}</dd></div>`;
    });
    if (paid.length === 0) {
        html += `<div class="calc-row"><dt>${you ? 'שילמת' : 'שילם/ה'}</dt><dd>${moneyHtml(0)}</dd></div>`;
    }
    const bal = p.balance;
    html += `
        <div class="calc-row calc-total">
            <dt>${bal < -0.01 ? 'נשאר לשלם' : bal > 0.01 ? (you ? 'מגיע לך' : 'מגיע') : 'יתרה'}</dt>
            <dd class="${bal < -0.01 ? 'neg' : bal > 0.01 ? 'pos' : ''}">${moneyHtml(bal)}</dd>
        </div>`;
    html += '</dl>';
    return html;
}

function coupleNoteHtml(group, data) {
    const c = data.couples[group];
    if (!c) return '';
    const lines = c.members.map(m => {
        const b = data.persons[m].balance;
        return `${nameHtml(m)} ${signedMoneyHtml(b, b < -0.01 ? '−' : b > 0.01 ? '+' : '')}`;
    }).join(' · ');
    const net = netOf(group, data);
    return `
        <p class="couple-note">
            ${icon('users')}
            <span>${lines}. בני הקבוצה מתקזזים ביניהם, אז ביחד ${net < -0.01 ? `מעבירים ${moneyHtml(net)}` : net > 0.01 ? `מקבלים ${moneyHtml(net)}` : 'הם מאוזנים'}.</span>
        </p>`;
}

function peopleListHtml(data, ent) {
    let html = '<ul class="people-list">';
    const seen = new Set();
    Object.keys(data.persons).forEach(name => {
        const key = ent.entityOf[name];
        if (seen.has(key)) return;
        seen.add(key);
        const members = ent.members[key];
        const isGroup = members.length > 1;
        const owes = members.reduce((s, m) => s + data.persons[m].owes, 0);
        const paid = members.reduce((s, m) => s + data.persons[m].paid, 0);
        html += `
            <li>
                <details class="person">
                    <summary>
                        ${entityAvatar(key, ent)}
                        <span class="person-main">
                            <span class="person-name">${nameHtml(ent.label[key])}</span>
                            <span class="person-meta"><span>חלק ${moneyHtml(owes)}</span> · <span>שולם ${moneyHtml(paid)}</span></span>
                        </span>
                        ${statusHtml(netOf(key, data), isGroup)}
                        ${icon('chevron', 'icon chev')}
                    </summary>
                    <div class="person-body">
                        ${members.map(m => `
                            ${isGroup ? `<h4>${nameHtml(m)}</h4>` : ''}
                            ${personBreakdownHtml(m, data)}`).join('')}
                        ${isGroup ? coupleNoteHtml(key, data) : ''}
                    </div>
                </details>
            </li>`;
    });
    return html + '</ul>';
}

// Donut of each person's share of the total, in their own color
function donutHtml(data) {
    const rows = Object.values(data.persons)
        .filter(p => p.owes > 0.005)
        .sort((a, b) => b.owes - a.owes);
    const sum = rows.reduce((s, p) => s + p.owes, 0) || 1;
    const gap = rows.length > 1 ? 0.6 : 0;
    let offset = 0;

    const segs = rows.map(p => {
        const len = (p.owes / sum) * 100;
        const seg = `<circle class="donut-seg pc-${colorOf(p.name)}" cx="21" cy="21" r="15.9155"
                        style="stroke: var(--c)" stroke-dasharray="${Math.max(len - gap, 0.2)} ${100 - Math.max(len - gap, 0.2)}"
                        stroke-dashoffset="${-offset}"></circle>`;
        offset += len;
        return seg;
    }).join('');

    const legend = rows.map(p => `
        <li class="pc-${colorOf(p.name)}">
            <span class="dot" aria-hidden="true"></span>
            <span class="l-name">${nameHtml(p.name)}</span>
            <span class="l-amount">${moneyHtml(p.owes)}</span>
            <span class="l-pct">${(p.owes / sum * 100).toFixed(1)}%</span>
        </li>`).join('');

    return `
        <div class="split-grid">
            <div class="donut">
                <svg viewBox="0 0 42 42" role="img" aria-label="החלק של כל משתתף מסך ההוצאות">
                    <circle class="donut-track" cx="21" cy="21" r="15.9155"></circle>
                    ${segs}
                </svg>
                <div class="donut-center">
                    <span class="donut-total">${moneyHtml(data.totalEvent)}</span>
                    <span class="donut-label">סה"כ הוצאות</span>
                </div>
            </div>
            <ul class="legend ${rows.length > 7 ? 'many' : ''}">${legend}</ul>
        </div>`;
}

function methodHtml(data, idp) {
    return `
        <section class="card method" aria-labelledby="${idp}h-method">
            <div class="card-head">
                <span class="card-icon c-orange" aria-hidden="true">${icon('calculator')}</span>
                <div class="card-titles">
                    <h2 id="${idp}h-method">איך חישבנו</h2>
                    <p class="card-sub">כל הוצאה, כמה עלתה ובין כמה התחלקה.</p>
                </div>
            </div>
            <ol class="method-steps">
                <li>כל הוצאה מתחלקת שווה בשווה רק בין מי שהשתתף בה.</li>
                <li>מהחלק של כל אחד מורידים את מה שהוא כבר שילם.</li>
                <li>זוגות וקבוצות מתקזזים בפנים, ומהיתרות נבנה מספר ההעברות הקטן ביותר.</li>
            </ol>
            <table class="cat-table">
                <thead>
                    <tr><th scope="col">הוצאה</th><th scope="col">סה"כ</th><th scope="col">משתתפים</th><th scope="col">לכל אחד</th></tr>
                </thead>
                <tbody>
                    ${Object.entries(data.categories).map(([name, c]) => `
                        <tr>
                            <th scope="row"><span class="cat-name">${expenseIconHtml(name)}${nameHtml(name)}</span></th>
                            <td>${moneyHtml(c.total)}</td>
                            <td class="num">${c.participantsCount}</td>
                            <td>${c.participantsCount ? moneyHtml(c.total / c.participantsCount) : '—'}</td>
                        </tr>`).join('')}
                </tbody>
            </table>
        </section>`;
}

// Step 3: who carries what, the math, and every person's breakdown
function calcHtml(data, opts = {}) {
    const ent = buildEntities(data);
    const idp = opts.shared ? 's-' : '';
    return `
        <section class="card" aria-labelledby="${idp}h-calc">
            <div class="card-head">
                <span class="card-icon c-blue" aria-hidden="true">${icon('pie')}</span>
                <div class="card-titles">
                    <h2 id="${idp}h-calc">החלק של כל אחד</h2>
                    <p class="card-sub">כמה מכל ההוצאות שייך לכל משתתף, לפי מה שהשתתף בו.</p>
                </div>
            </div>
            ${donutHtml(data)}
        </section>

        ${methodHtml(data, idp)}

        <section class="card" aria-labelledby="${idp}h-people-res">
            <div class="card-head">
                <span class="card-icon c-pink" aria-hidden="true">${icon('users')}</span>
                <div class="card-titles">
                    <h2 id="${idp}h-people-res">לפי משתתף</h2>
                    <p class="card-sub">לחצו על שם כדי לראות את החישוב המלא.</p>
                </div>
            </div>
            ${peopleListHtml(data, ent)}
        </section>`;
}

// Step 4: the answer (who pays whom), then sharing
function summaryHtml(data, opts = {}) {
    const ent = buildEntities(data);
    const idp = opts.shared ? 's-' : '';
    const catCount = Object.keys(data.categories).length;
    const personCount = Object.keys(data.persons).length;
    const t = data.transfers;

    let html = `
        <section class="card" aria-labelledby="${idp}h-summary">
            <div class="summary-hero">
                <div>
                    <h1 id="${idp}h-summary">מי מעביר למי</h1>
                    <p class="summary-meta">${personCount} משתתפים · ${plural(catCount, 'הוצאה אחת', 'הוצאות')} · ${t.length === 0 ? 'אין העברות' : plural(t.length, 'העברה אחת', 'העברות')}</p>
                </div>
                <p class="summary-total">
                    <span class="st-label">סה"כ הוצאות</span>
                    <span class="st-amount">${moneyHtml(data.totalEvent)}</span>
                </p>
            </div>
            <div class="summary-body">
                ${t.length === 0
                    ? `<p class="all-even">${icon('circleCheck')} כולם מאוזנים. אין צורך בהעברות.</p>`
                    : transfersHtml(t, ent)}
            </div>
        </section>`;

    if (!opts.shared) {
        html += shareSectionHtml(data, ent);
        html += `
            <div class="page-actions">
                <button type="button" class="btn btn-secondary" data-action="edit-expenses">${icon('edit')} עריכה</button>
                <button type="button" class="btn btn-secondary" data-action="copy-text">${icon('copy')} העתקת סיכום</button>
                <button type="button" class="btn btn-secondary" data-action="print">${icon('printer')} הדפסה או PDF</button>
                <button type="button" class="btn btn-ghost danger-text" data-action="reset">${icon('refresh')} חישוב חדש</button>
            </div>`;
    } else if (opts.hashBase) {
        html += `
            <section class="card pick-card" aria-labelledby="h-pick">
                <div class="card-head tight">
                    <span class="card-icon c-violet" aria-hidden="true">${icon('user')}</span>
                    <div class="card-titles">
                        <h2 id="h-pick">מה החלק שלי?</h2>
                        <p class="card-sub">בחרו את השם שלכם כדי לראות כמה להעביר ואיך זה חושב.</p>
                    </div>
                </div>
                <div class="chips">
                    ${Object.keys(data.persons).map((name, i) =>
                        `<a class="chip on pc-${colorOf(name)}" href="#${opts.hashBase}&me=${i}">${avatarHtml(name)}${nameHtml(name)}</a>`).join('')}
                </div>
            </section>`;
    }
    return html;
}

// Shared link without "me": the answer first, then the full math
function resultsHtml(data, opts = {}) {
    return summaryHtml(data, opts) + calcHtml(data, opts) + `
        <div class="page-actions">
            <button type="button" class="btn btn-secondary" data-action="print">${icon('printer')} הדפסה או PDF</button>
            <a class="btn btn-secondary" href="./">${icon('plus')} התחלת חישוב חדש</a>
        </div>`;
}

function shareSectionHtml(data, ent) {
    const isLocal = location.protocol === 'file:';
    const names = Object.keys(data.persons);
    return `
        <section class="card share" aria-labelledby="h-share">
            <div class="card-head">
                <span class="card-icon c-green" aria-hidden="true">${icon('send')}</span>
                <div class="card-titles">
                    <h2 id="h-share">שיתוף התוצאות</h2>
                    <p class="card-sub">הוואטסאפ ייפתח עם הודעה מוכנה. אתם בוחרים למי לשלוח ולוחצים שליחה.</p>
                </div>
            </div>
            ${isLocal ? `<p class="alert warn">${icon('info')} הקובץ פתוח מהמחשב, לכן הקישורים יעבדו רק אחרי שהאתר יפורסם (למשל ב־GitHub Pages).</p>` : ''}
            <div class="share-grid">
                <article class="share-card group">
                    <div class="share-card-head">
                        <span class="share-icon" aria-hidden="true">${icon('users')}</span>
                        <h3>קישור קבוצתי</h3>
                        <span class="tag">מומלץ</span>
                    </div>
                    <p class="share-desc">קישור אחד לקבוצת הוואטסאפ, וכל אחד לוחץ על השם שלו.</p>
                    <div class="share-actions">
                        <a class="btn btn-whatsapp" href="${esc(waUrl(groupMessage(data)))}" target="_blank" rel="noopener">
                            ${icon('whatsapp')} שיתוף בקבוצת וואטסאפ
                        </a>
                        <button type="button" class="btn btn-secondary" data-action="copy-group">${icon('link')} העתקת קישור קבוצתי</button>
                    </div>
                </article>
                <article class="share-card personal">
                    <div class="share-card-head">
                        <span class="share-icon" aria-hidden="true">${icon('user')}</span>
                        <h3>קישור אישי</h3>
                    </div>
                    <div class="field">
                        <label for="sharePerson">למי שולחים?</label>
                        <select id="sharePerson" data-action="share-person">
                            ${names.map((name, i) => {
                                const key = ent.entityOf[name];
                                const partners = ent.members[key].filter(m => m !== name);
                                const together = partners.length && Math.abs(netOf(key, data)) > 0.01
                                    ? ` יחד עם ${joinNames(partners)}` : '';
                                return `<option value="${i}">${esc(name)} · ${esc(actionText(key, data) + together)}</option>`;
                            }).join('')}
                        </select>
                    </div>
                    <div class="share-actions">
                        <a class="btn btn-primary" id="sharePersonalWa" href="${esc(waUrl(personalMessage(names[0], 0, data, ent)))}" target="_blank" rel="noopener">
                            ${icon('whatsapp')} שליחה אישית בוואטסאפ
                        </a>
                        <button type="button" class="btn btn-secondary" data-action="copy-personal">${icon('link')} העתקת קישור אישי</button>
                    </div>
                </article>
            </div>
        </section>`;
}

function renderResults(data) {
    lastResult = data;
    document.getElementById('calcBody').innerHTML = calcHtml(data);
    document.getElementById('summaryBody').innerHTML = summaryHtml(data);
    document.getElementById('editor').classList.add('has-results');
}

// ========== PERSONAL VIEW (from link) ==========
function personalHtml(name, data, hashBase) {
    const ent = buildEntities(data);
    const key = ent.entityOf[name];
    const isGroup = ent.members[key].length > 1;
    const partners = joinNames(ent.members[key].filter(m => m !== name));
    const bal = netOf(key, data);
    const outgoing = data.transfers.filter(t => t.from === key);
    const incoming = data.transfers.filter(t => t.to === key);

    let hero;
    if (bal < -0.01) {
        hero = `
            <p class="me-label">${isGroup ? `ביחד עם ${nameHtml(partners)}, להעביר` : 'להעביר'}</p>
            <p class="me-amount">${moneyHtml(bal)}</p>
            <ul class="me-list">
                ${outgoing.map(t => `<li>${icon('arrow')}<span>${moneyHtml(t.amount)} ל${nameHtml(ent.label[t.to])}</span></li>`).join('')}
            </ul>`;
    } else if (bal > 0.01) {
        hero = `
            <p class="me-label">${isGroup ? `ביחד עם ${nameHtml(partners)}, מגיע לכם` : 'מגיע לך'}</p>
            <p class="me-amount">${moneyHtml(bal)}</p>
            <ul class="me-list">
                ${incoming.map(t => `<li>${icon('arrow')}<span>${moneyHtml(t.amount)} מ${nameHtml(ent.label[t.from])}</span></li>`).join('')}
            </ul>`;
    } else {
        hero = `
            <p class="me-label">החלק שלך</p>
            <p class="me-amount">מאוזן</p>
            <p class="me-note">אין לך העברות. מה ששילמת שווה בדיוק לחלק שלך.</p>`;
    }

    return `
        <section class="me-hero pc-${colorOf(name)}">
            <h1>${avatarHtml(name, 'lg')}<span>היי ${nameHtml(name)}, זה החלק שלך</span></h1>
            ${hero}
        </section>
        <section class="card" aria-labelledby="h-me-calc">
            <div class="card-head">
                <span class="card-icon c-orange" aria-hidden="true">${icon('calculator')}</span>
                <div class="card-titles">
                    <h2 id="h-me-calc">איך זה חושב</h2>
                    <p class="card-sub">החלק שלך בכל הוצאה, פחות מה שכבר שילמת.</p>
                </div>
            </div>
            ${personBreakdownHtml(name, data, true)}
            ${isGroup ? coupleNoteHtml(key, data) : ''}
        </section>
        <div class="page-actions">
            <a class="btn btn-primary" href="#${hashBase}">${icon('eye')} לחישוב המלא של הקבוצה</a>
            <a class="btn btn-secondary" href="./">${icon('plus')} התחלת חישוב חדש</a>
        </div>`;
}

// ========== SHARE LINKS ==========
function toBase64Url(str) {
    const bytes = new TextEncoder().encode(str);
    let bin = '';
    bytes.forEach(b => { bin += String.fromCharCode(b); });
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(b64) {
    const norm = b64.replace(/-/g, '+').replace(/_/g, '/');
    const bin = atob(norm + '='.repeat((4 - norm.length % 4) % 4));
    const bytes = Uint8Array.from(bin, c => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
}

// Compact payload: names once, everything else by index
function encodeState() {
    const index = {};
    persons.forEach((p, i) => { index[p.name] = i; });
    const payload = {
        v: 1,
        p: persons.map(p => p.couple_group ? [p.name, p.couple_group] : [p.name]),
        c: categories
            .filter(cat => categoryTotal(cat) > 0 || cat.participants.length > 0)
            .map(cat => [
                cat.name,
                cat.participants.map(n => index[n]),
                Object.entries(categoryPayments(cat)).map(([n, a]) => [index[n], a])
            ])
    };
    return toBase64Url(JSON.stringify(payload));
}

function decodeState(encoded) {
    const payload = JSON.parse(fromBase64Url(encoded));
    if (!payload || payload.v !== 1 || !Array.isArray(payload.p) || !Array.isArray(payload.c)) {
        throw new Error('bad payload');
    }
    const ps = payload.p.map(([name, group]) => {
        if (typeof name !== 'string' || !name) throw new Error('bad person');
        return { name, couple_group: typeof group === 'string' && group ? group : null };
    });
    const nameAt = i => {
        if (!ps[i]) throw new Error('bad index');
        return ps[i].name;
    };
    const cs = payload.c.map(([name, parts, pays]) => {
        const payments = {};
        pays.forEach(([i, amount]) => {
            const a = Number(amount);
            if (!(a > 0)) throw new Error('bad amount');
            payments[nameAt(i)] = a;
        });
        return { name: String(name), participants: parts.map(nameAt), payments };
    });
    return { persons: ps, categories: cs };
}

function shareUrl(meIndex) {
    const base = location.href.split('#')[0];
    let url = `${base}#s=${encodeState()}`;
    if (meIndex !== undefined) url += `&me=${meIndex}`;
    return url;
}

function waUrl(text) {
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

function rtlLines(lines) {
    return lines.map(l => (l && !/^https?:/.test(l) ? RLM + l : l)).join('\n');
}

function groupMessage(data) {
    const t = data.transfers.length;
    return rtlLines([
        'היי לכולם! 👋',
        'הכנתי את חישוב חלוקת ההוצאות שלנו.',
        `סה"כ ${money(data.totalEvent)}, ${t === 0 ? 'כולם מאוזנים' : plural(t, 'העברה אחת', 'העברות')}.`,
        'אפשר לפתוח את הקישור ולראות את התוצאות:',
        shareUrl()
    ]);
}

function personalMessage(name, index, data, ent) {
    const key = ent.entityOf[name];
    const bal = netOf(key, data);
    const lines = [`היי ${name}! 👋`];
    if (bal < -0.01) {
        data.transfers.filter(t => t.from === key).forEach(t => {
            lines.push(`החלק שלך: להעביר ${money(t.amount)} ל${ent.label[t.to]}.`);
        });
    } else if (bal > 0.01) {
        data.transfers.filter(t => t.to === key).forEach(t => {
            lines.push(`מגיע לך ${money(t.amount)} מ${ent.label[t.from]}.`);
        });
    } else {
        lines.push('אין לך העברות, הכול מאוזן.');
    }
    lines.push('הנה הקישור האישי שלך עם פרטי חלוקת ההוצאות:', shareUrl(index));
    return rtlLines(lines);
}

function summaryText(data) {
    const ent = buildEntities(data);
    const lines = [`חלוקת הוצאות · סה"כ ${money(data.totalEvent)}`, ''];
    Object.entries(data.categories).forEach(([name, c]) => {
        lines.push(`${name}: ${money(c.total)} ÷ ${c.participantsCount} = ${money(c.participantsCount ? c.total / c.participantsCount : 0)}`);
    });
    lines.push('', 'מי מעביר למי:');
    if (data.transfers.length === 0) {
        lines.push('כולם מאוזנים.');
    } else {
        data.transfers.forEach(t => lines.push(`• ${ent.label[t.from]} ← ${ent.label[t.to]}: ${money(t.amount)}`));
    }
    return rtlLines(lines);
}

function copyText(text, message, button) {
    const done = () => {
        showToast(message, 'success');
        if (button) markCopied(button);
    };
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
    } else {
        fallbackCopy(text, done);
    }
}

function fallbackCopy(text, done) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
        document.execCommand('copy');
        done();
    } catch (e) {
        showToast('ההעתקה לא הצליחה. סמנו את הטקסט והעתיקו ידנית.', 'error');
    }
    document.body.removeChild(ta);
}

function markCopied(button) {
    if (!button.dataset.label) button.dataset.label = button.innerHTML;
    button.innerHTML = `${icon('check')} הועתק`;
    button.classList.add('is-copied');
    clearTimeout(button._copiedTimer);
    button._copiedTimer = setTimeout(() => {
        button.innerHTML = button.dataset.label;
        button.classList.remove('is-copied');
    }, 2000);
}

// Print with every person's breakdown expanded
function printResults() {
    document.querySelectorAll('details.person').forEach(d => {
        d.dataset.wasOpen = d.open;
        d.open = true;
    });
    window.print();
}

window.addEventListener('afterprint', () => {
    document.querySelectorAll('details.person').forEach(d => {
        if (d.dataset.wasOpen !== undefined) d.open = d.dataset.wasOpen === 'true';
    });
});

// ========== STEPS ==========
function goToStep(step) {
    if (step >= 3) {
        const problem = blockingIssue();
        if (problem) {
            if (currentStep !== 2) goToStep(2);
            afterStepScroll(() => {
                const review = document.getElementById('review');
                review.scrollIntoView({ behavior: 'smooth', block: 'start' });
                review.focus({ preventScroll: true });
            });
            showToast(problem.msg, 'error');
            return;
        }
        renderResults(runCalculator(persons, categories));
    }
    if (step === 2) renderCategories();
    if (step !== 1 && editingName) endEdit();

    currentStep = step;
    [1, 2, 3, 4].forEach(s => {
        document.getElementById(`view${s}`).hidden = s !== step;
        const btn = document.querySelector(`.step[data-step="${s}"]`);
        btn.classList.toggle('done', s < step);
        btn.classList.toggle('active', s === step);
        if (s === step) btn.setAttribute('aria-current', 'step');
        else btn.removeAttribute('aria-current');
    });
    updateActionbar();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateActionbar() {
    const back = document.getElementById('backBtn');
    const next = document.getElementById('nextBtn');
    const bar = document.getElementById('actionbar');
    bar.hidden = currentStep === 4;
    back.hidden = currentStep === 1;
    next.removeAttribute('aria-disabled');

    if (currentStep === 1) {
        next.innerHTML = persons.length < 2
            ? 'המשך להוצאות'
            : `המשך עם ${persons.length} משתתפים`;
    } else if (currentStep === 2) {
        next.innerHTML = `${icon('calculator')} חישוב החלוקה`;
        if (blockingIssue()) next.setAttribute('aria-disabled', 'true');
    } else if (currentStep === 3) {
        next.innerHTML = `${icon('send')} מי מעביר למי ושיתוף`;
    }
}

// ========== RESET / EXAMPLE ==========
function resetAll() {
    if (!confirm('למחוק את כל המשתתפים וההוצאות ולהתחיל חישוב חדש?')) return;
    persons = [];
    categories = [];
    lastResult = null;
    editingName = null;
    save();
    updatePersonForm();
    renderPersons();
    renderCategories();
    goToStep(1);
    showToast('הכול נמחק. אפשר להתחיל מחדש.', 'info');
}

function loadExample() {
    if ((persons.length || categories.length) &&
        !confirm('הדוגמה תחליף את מה שהוזן עד עכשיו. להמשיך?')) return;

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
            name: "פיצות",
            participants: [
                "מיראל", "ריהד", "עמירם", "מאי",
                "נועה", "רועי", "פז", "צופיה",
                "ברק", "טופז", "אביב", "יעקב"
            ],
            payers: [{ name: "מיראל", amount: 275 }, { name: "מאי", amount: 40 }]
        },
        {
            name: "אלכוהול",
            participants: [
                "מיראל", "ריהד", "עמירם", "מאי",
                "ברק", "טופז", "אביב", "יעקב"
            ],
            payers: [
                { name: "ברק", amount: 46 },
                { name: "יעקב", amount: 48 },
                { name: "עמירם", amount: 420 }
            ]
        }
    ];

    editingName = null;
    save();
    updatePersonForm();
    renderPersons();
    renderCategories();
    goToStep(2);
    showToast('הדוגמה נטענה. בדקו את ההוצאות ולחצו "חישוב החלוקה".', 'success');
}

// ========== TOAST NOTIFICATIONS ==========
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
    toast.textContent = message;
    container.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3200);
}

function shakeElement(el) {
    el.classList.remove('shake');
    void el.offsetWidth;
    el.classList.add('shake');
    setTimeout(() => el.classList.remove('shake'), 500);
}

// ========== EVENTS ==========
function catIndexOf(el) {
    const card = el.closest('[data-cat]');
    return card ? Number(card.dataset.cat) : -1;
}

function payerIndexOf(el) {
    const row = el.closest('[data-payer]');
    return row ? Number(row.dataset.payer) : -1;
}

document.addEventListener('click', e => {
    const el = e.target.closest('[data-action], .step');
    if (!el) return;

    if (el.classList.contains('step')) {
        goToStep(Number(el.dataset.step));
        return;
    }

    const action = el.dataset.action;
    const catIdx = catIndexOf(el);
    const cat = categories[catIdx];

    switch (action) {
        case 'load-example': loadExample(); break;
        case 'next': goToStep(Math.min(4, currentStep + 1)); break;
        case 'toggle-theme': toggleTheme(); break;
        case 'toggle-expense': {
            if (openCats.has(cat)) openCats.delete(cat);
            else openCats.add(cat);
            const open = openCats.has(cat);
            const card = el.closest('.expense');
            card.classList.toggle('open', open);
            el.setAttribute('aria-expanded', String(open));
            card.querySelector('.expense-body').hidden = !open;
            break;
        }
        case 'back': goToStep(Math.max(1, currentStep - 1)); break;
        case 'edit-person': startEdit(el.dataset.name); break;
        case 'cancel-edit': endEdit(); break;
        case 'remove-person': removePerson(el.dataset.name); break;
        case 'remove-category': removeCategory(catIdx); break;
        case 'toggle-participant': {
            const name = el.dataset.name;
            const i = cat.participants.indexOf(name);
            if (i === -1) cat.participants.push(name);
            else cat.participants.splice(i, 1);
            save();
            renderCategories();
            break;
        }
        case 'select-all':
            cat.participants = persons.map(p => p.name);
            save();
            renderCategories();
            break;
        case 'clear-all':
            cat.participants = [];
            save();
            renderCategories();
            break;
        case 'add-payer':
            cat.payers.push({ name: '', amount: 0 });
            save();
            renderCategories();
            break;
        case 'remove-payer':
            cat.payers.splice(payerIndexOf(el), 1);
            if (cat.payers.length === 0) cat.payers.push({ name: '', amount: 0 });
            save();
            renderCategories();
            break;
        case 'fix-issue': fixIssue(Number(el.dataset.issue)); break;
        case 'edit-expenses': goToStep(2); break;
        case 'copy-group':
            copyText(shareUrl(), 'הקישור הקבוצתי הועתק', el);
            break;
        case 'copy-personal': {
            const i = Number(document.getElementById('sharePerson').value);
            copyText(shareUrl(i), `הקישור האישי של ${persons[i].name} הועתק`, el);
            break;
        }
        case 'copy-text':
            if (lastResult) copyText(summaryText(lastResult), 'הסיכום הועתק', el);
            break;
        case 'print': printResults(); break;
        case 'reset': resetAll(); break;
    }
});

document.addEventListener('input', e => {
    const el = e.target;
    if (el.dataset.action !== 'payer-amount') return;
    const catIdx = catIndexOf(el);
    const payer = categories[catIdx].payers[payerIndexOf(el)];
    const error = el.closest('.payer-row').querySelector('.payer-error');
    const raw = el.value.trim();
    const value = parseFloat(raw);
    const invalid = el.validity.badInput || (raw !== '' && !Number.isFinite(value)) || value < 0;

    payer.amount = invalid || !Number.isFinite(value) ? 0 : Math.round(value * 100) / 100;
    error.textContent = invalid ? 'הזינו סכום חיובי, למשל 120 או 45.50.' : '';
    if (invalid) el.setAttribute('aria-invalid', 'true');
    else el.removeAttribute('aria-invalid');
    save();
    updateCategoryMath(catIdx);
    renderReview();
});

document.addEventListener('change', e => {
    const el = e.target;
    const catIdx = catIndexOf(el);
    if (el.dataset.action === 'payer-name') {
        categories[catIdx].payers[payerIndexOf(el)].name = el.value;
        save();
        updateCategoryMath(catIdx);
        renderReview();
        if (el.value) {
            const amount = el.closest('.payer-row').querySelector('input');
            if (amount && !amount.value) amount.focus();
        }
    } else if (el.dataset.action === 'rename-category') {
        const name = el.value.trim();
        if (!name || categories.some((c, i) => i !== catIdx && c.name === name)) {
            el.value = categories[catIdx].name;
            showToast(name ? `כבר יש הוצאה בשם ${name}.` : 'להוצאה חייב להיות שם.', 'error');
            return;
        }
        categories[catIdx].name = name;
        save();
        renderCategories();
    } else if (el.dataset.action === 'share-person' && lastResult) {
        const i = Number(el.value);
        const ent = buildEntities(lastResult);
        document.getElementById('sharePersonalWa').href =
            waUrl(personalMessage(persons[i].name, i, lastResult, ent));
    }
});

document.getElementById('personForm').addEventListener('submit', e => {
    e.preventDefault();
    submitPerson();
});

document.getElementById('expenseForm').addEventListener('submit', e => {
    e.preventDefault();
    addCategory();
});

document.getElementById('personName').addEventListener('input', () => {
    document.getElementById('personNameError').textContent = '';
    document.getElementById('personName').removeAttribute('aria-invalid');
});
document.getElementById('categoryName').addEventListener('input', () => {
    document.getElementById('categoryNameError').textContent = '';
    document.getElementById('categoryName').removeAttribute('aria-invalid');
});

document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && editingName) endEdit();
});

// ========== ROUTING ==========
function route() {
    const params = new URLSearchParams(location.hash.slice(1));
    const encoded = params.get('s');
    const editor = document.getElementById('editor');
    const shared = document.getElementById('shared');
    const exampleBtn = document.getElementById('exampleBtn');
    document.body.classList.toggle('is-shared', Boolean(encoded));

    if (!encoded) {
        colorNames = null;
        editor.hidden = false;
        shared.hidden = true;
        exampleBtn.hidden = false;
        document.title = 'Bill Splitter Pro · חלוקת הוצאות';
        return;
    }

    editor.hidden = true;
    shared.hidden = false;
    exampleBtn.hidden = true;
    const body = document.getElementById('sharedBody');
    const banner = `<p class="shared-banner">${icon('eye')} חישוב ששותף איתך · לצפייה בלבד</p>`;

    try {
        const state = decodeState(encoded);
        colorNames = state.persons.map(p => p.name);
        const data = runCalculator(state.persons, state.categories);
        const hashBase = `s=${encoded}`;
        const me = params.get('me');
        const meName = me !== null && state.persons[Number(me)] ? state.persons[Number(me)].name : null;

        body.innerHTML = banner + (meName
            ? personalHtml(meName, data, hashBase)
            : resultsHtml(data, { shared: true, hashBase }));
        document.title = meName ? `החלק של ${meName} · Bill Splitter Pro` : 'חלוקת ההוצאות · Bill Splitter Pro';
    } catch (err) {
        body.innerHTML = `
            <div class="empty">
                ${icon('link', 'empty-icon')}
                <p class="empty-title">הקישור לא תקין</p>
                <p class="empty-text">ייתכן שהוא נקטע כשהועתק. בקשו מהשולח לשלוח אותו שוב.</p>
                <a class="btn btn-primary" href="./">התחלת חישוב חדש</a>
            </div>`;
        document.title = 'קישור לא תקין · Bill Splitter Pro';
    }
    window.scrollTo(0, 0);
}

window.addEventListener('hashchange', route);

// ========== INIT ==========
document.addEventListener('DOMContentLoaded', () => {
    restore();
    try { applyTheme(localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light'); }
    catch (e) { applyTheme('light'); }
    renderHeroStatus();
    updatePersonForm();
    renderPersons();
    renderCategories();
    goToStep(1);
    route();
});
