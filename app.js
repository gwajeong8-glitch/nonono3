// app.js
// Firebase SDK import (app.js 내에서 직접 로드)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// --- Firebase 설정 정보 ---
const firebaseConfig = {
    apiKey: "AIzaSyBSkdUP_bU60GiLY6w9Uo7e8g_pkLllFPg",
    authDomain: "my-nonono3.firebaseapp.com",
    projectId: "my-nonono3",
    storageBucket: "my-nonono3.firebasestorage.app",
    messagingSenderId: "167865896202",
    appId: "1:167865896202:web:2567994bd29509f9d6fef3",
    measurementId: "G-T126HT4T7X"
};

const appId = firebaseConfig.appId;
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const TABLE_DOC_ID = 'main_table_state';
let currentUserId = null;
let isAuthReady = false;
let initialLoadDone = false;

// --- DOM refs ---
const table = document.querySelector('.data-table');
const colorPaletteContainer = document.getElementById('colorPaletteContainer');
const applyFontSizeBtn = document.getElementById('applyFontSizeBtn');
const fontSizeInput = document.getElementById('fontSizeInput');
const downloadButton = document.getElementById('downloadBtn');
const selectionBox = document.getElementById('selectionBox');
const settingPanel = document.getElementById('settingPanel');
const wrap = document.querySelector('.wrap');

// color target radios
const colorTargetRadios = document.getElementsByName('colorTarget');

// row height inputs and buttons
const topRowHeightInput = document.getElementById('topRowHeightInput');
const applyTopRowHeightBtn = document.getElementById('applyTopRowHeightBtn');
const middleNoticeRowHeightInput = document.getElementById('middleNoticeRowHeightInput');
const applyMiddleNoticeRowHeightBtn = document.getElementById('applyMiddleNoticeRowHeightBtn');
const bottomRowHeightInput = document.getElementById('bottomRowHeightInput');
const applyBottomRowHeightBtn = document.getElementById('applyBottomRowHeightBtn');

// --- constants ---
const COLOR_PALETTE = [
    '#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#00FFFF', '#FF00FF',
    '#FFA500', '#800080', '#008000', '#808000', '#000080', '#800000', '#C0C0C0', '#808080',
    '#FF4500', '#ADFF2F', '#1E90FF', '#FFD700', '#20B2AA', '#E9967A', '#9400D3', '#FF69B4',
    '#A0522D', '#D2B48C', '#87CEEB', '#F08080', '#4682B4', '#DA70D6', '#B0C4DE', '#F4A460',
    '#5F9EA0', '#DDA0DD', '#7FFF00', '#6495ED', '#DC143C', '#FF8C00', '#9ACD32', '#40E0D0'
];

// --- selection/drag variables ---
let isDragging = false;
let startCell = null;
let endCell = null;
let dragStartClient = { x: 0, y: 0 };

// --- Firestore helpers ---
const getTableDocRef = (userId) => doc(db, 'artifacts', appId, 'users', userId, 'table_data', TABLE_DOC_ID);

const saveTableState = async () => {
    if (!currentUserId || !isAuthReady) return;

    const cellStates = {};
    const rows = table.querySelectorAll('tr');
    rows.forEach((row, rIndex) => {
        row.querySelectorAll('td').forEach((cell, cIndex) => {
            const cellId = `r${rIndex}c${cIndex}`;
            cellStates[cellId] = {
                text: cell.innerHTML,
                color: cell.style.color || '',
                bg: cell.style.backgroundColor || '',
                fontSize: cell.style.fontSize || ''
            };
        });
    });

    const rowHeights = {};
    document.querySelectorAll('.height-apply-btn').forEach(button => {
        const target = button.dataset.target;
        let inputId = `${target.replace('-data', 'RowHeightInput')}`;
        if (target === 'middle-notice') inputId = 'middleNoticeRowHeightInput';
        const input = document.getElementById(inputId);
        if (input) rowHeights[target] = input.value;
    });

    try {
        await setDoc(getTableDocRef(currentUserId), { cells: cellStates, rowHeights, timestamp: new Date() }, { merge: true });
    } catch (err) {
        console.error('saveTableState error', err);
    }
};

const applyLoadedState = (data) => {
    if (!data) return;
    if (data.cells) {
        const rows = table.querySelectorAll('tr');
        rows.forEach((row, rIndex) => {
            row.querySelectorAll('td').forEach((cell, cIndex) => {
                const cellId = `r${rIndex}c${cIndex}`;
                const st = data.cells[cellId];
                if (st) {
                    if (cell.innerHTML !== st.text) cell.innerHTML = st.text;
                    cell.style.color = st.color || '';
                    cell.style.backgroundColor = st.bg || '';
                    cell.style.fontSize = st.fontSize || '';
                }
            });
        });
    }
    if (data.rowHeights) {
        for (const [k, v] of Object.entries(data.rowHeights)) {
            let inputId = `${k.replace('-data', 'RowHeightInput')}`;
            if (k === 'middle-notice') inputId = 'middleNoticeRowHeightInput';
            const input = document.getElementById(inputId);
            if (input) input.value = v;
            applyRowHeight(k, v);
        }
    }
    clearSelection();
};

const loadTableState = (userId) => {
    const docRef = getTableDocRef(userId);
    onSnapshot(docRef, (snap) => {
        if (snap.exists()) {
            applyLoadedState(snap.data());
        } else if (!initialLoadDone) {
            saveTableState();
        }
        initialLoadDone = true;
    }, (err) => console.error('onSnapshot error', err));
};

const initAuth = async () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) currentUserId = user.uid;
        else {
            try {
                await signInAnonymously(auth);
                currentUserId = auth.currentUser.uid;
            } catch (e) {
                console.error('anon signin failed', e);
                return;
            }
        }
        if (currentUserId && !isAuthReady) {
            isAuthReady = true;
            loadTableState(currentUserId);
        }
    });
};

// --- Selection utilities ---
const getCellCoordinates = (cell) => {
    const rowIndex = cell.closest('tr').rowIndex;
    const cellIndex = cell.cellIndex;
    return { rowIndex, cellIndex };
};

const clearSelection = () => {
    document.querySelectorAll('.data-table td.selected').forEach(c => c.classList.remove('selected'));
    selectionBox.style.display = 'none';
    selectionBox.style.width = '0px';
    selectionBox.style.height = '0px';
};

const getWrapRect = () => wrap.getBoundingClientRect();
const clientToWrapCoords = (clientX, clientY) => {
    const wr = getWrapRect();
    return { x: clientX - wr.left + wrap.scrollLeft, y: clientY - wr.top + wrap.scrollTop };
};

const updateSelectionBoxVisual = (cellA, cellB) => {
    const rectA = cellA.getBoundingClientRect();
    const rectB = cellB.getBoundingClientRect();
    const leftClient = Math.min(rectA.left, rectB.left);
    const topClient = Math.min(rectA.top, rectB.top);
    const rightClient = Math.max(rectA.right, rectB.right);
    const bottomClient = Math.max(rectA.bottom, rectB.bottom);

    const start = clientToWrapCoords(leftClient, topClient);
    const end = clientToWrapCoords(rightClient, bottomClient);

    selectionBox.style.display = 'block';
    selectionBox.style.left = `${start.x}px`;
    selectionBox.style.top = `${start.y}px`;
    selectionBox.style.width = `${Math.max(1, end.x - start.x)}px`;
    selectionBox.style.height = `${Math.max(1, end.y - start.y)}px`;
};

const selectCellsInDragArea = (cellA, cellB, preserveExisting = false) => {
    if (!preserveExisting) {
        document.querySelectorAll('.data-table td.selected').forEach(c => c.classList.remove('selected'));
    }
    const a = getCellCoordinates(cellA);
    const b = getCellCoordinates(cellB);
    const r1 = Math.min(a.rowIndex, b.rowIndex), r2 = Math.max(a.rowIndex, b.rowIndex);
    const c1 = Math.min(a.cellIndex, b.cellIndex), c2 = Math.max(a.cellIndex, b.cellIndex);
    const rows = table.querySelectorAll('tr');
    for (let ri = r1; ri <= r2; ri++) {
        const cols = rows[ri].querySelectorAll('td');
        for (let ci = c1; ci <= c2; ci++) {
            const cell = cols[ci];
            if (cell) cell.classList.add('selected');
        }
    }
};

// --- Drag handlers ---
const handleDragStart = (e) => {
    if (e.button !== 0) return;
    if (e.target.closest('.setting-panel') || e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') return;
    const cell = e.target.closest('td');
    if (!cell) return;

    // Allow click->edit if contenteditable and no modifiers
    if (cell.isContentEditable && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        // don't prevent editing; let click go through but attach a small move check to detect drag
        startCell = cell;
        document.addEventListener('mousemove', handleDraggingCheck);
        document.addEventListener('mouseup', handleDragEndCleanup);
        return;
    }

    e.preventDefault();
    dragStartClient = { x: e.clientX, y: e.clientY };

    const preserve = !!e.shiftKey;
    if (!preserve) clearSelection();

    startCell = cell;
    endCell = cell;
    isDragging = true;
    updateSelectionBoxVisual(startCell, startCell);

    document.addEventListener('mousemove', handleDragging);
    document.addEventListener('mouseup', handleDragEnd);
};

const handleDraggingCheck = (e) => {
    if (!startCell) return;
    if (Math.abs(e.movementX) > 2 || Math.abs(e.movementY) > 2) {
        isDragging = true;
        document.removeEventListener('mousemove', handleDraggingCheck);
        document.removeEventListener('mouseup', handleDragEndCleanup);
        window.getSelection()?.removeAllRanges();
        // treat as drag start (no shift)
        clearSelection();
        endCell = startCell;
        updateSelectionBoxVisual(startCell, startCell);
        document.addEventListener('mousemove', handleDragging);
        document.addEventListener('mouseup', handleDragEnd);
    }
};

const handleDragEndCleanup = () => {
    document.removeEventListener('mousemove', handleDraggingCheck);
    document.removeEventListener('mouseup', handleDragEndCleanup);
    startCell = null;
};

const handleDragging = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const cellUnderMouse = e.target.closest('td');
    if (cellUnderMouse && cellUnderMouse !== endCell) {
        endCell = cellUnderMouse;
        const preserve = !!(e.shiftKey || document.querySelectorAll('.data-table td.selected').length > 0);
        selectCellsInDragArea(startCell, endCell, preserve);
        updateSelectionBoxVisual(startCell, endCell);
    } else {
        const startWrap = clientToWrapCoords(dragStartClient.x, dragStartClient.y);
        const currentWrap = clientToWrapCoords(e.clientX, e.clientY);
        const x1 = Math.min(startWrap.x, currentWrap.x), y1 = Math.min(startWrap.y, currentWrap.y);
        const x2 = Math.max(startWrap.x, currentWrap.x), y2 = Math.max(startWrap.y, currentWrap.y);
        selectionBox.style.display = 'block';
        selectionBox.style.left = `${x1}px`;
        selectionBox.style.top = `${y1}px`;
        selectionBox.style.width = `${Math.max(1, x2 - x1)}px`;
        selectionBox.style.height = `${Math.max(1, y2 - y1)}px`;
    }
};

const handleDragEnd = (e) => {
    if (!isDragging) return;
    isDragging = false;
    if (startCell && endCell) {
        const preserve = !!(e.shiftKey || document.querySelectorAll('.data-table td.selected').length > 0);
        selectCellsInDragArea(startCell, endCell, preserve);
    }
    selectionBox.style.display = 'none';
    selectionBox.style.width = '0px';
    selectionBox.style.height = '0px';
    startCell = null; endCell = null;
    document.removeEventListener('mousemove', handleDragging);
    document.removeEventListener('mouseup', handleDragEnd);
};

// single clicks behavior (toggle/shift/etc.)
table.addEventListener('click', (e) => {
    const cell = e.target.closest('td');
    if (!cell) return;
    if (isDragging) return;
    if (cell.isContentEditable && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        // allow edit: place caret
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(cell);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
        cell.focus();
        return;
    }
    if (e.ctrlKey || e.metaKey) {
        cell.classList.toggle('selected');
    } else if (e.shiftKey) {
        const last = document.querySelector('.data-table td.selected');
        if (last) selectCellsInDragArea(last, cell, true);
        else { clearSelection(); cell.classList.add('selected'); }
    } else {
        clearSelection();
        cell.classList.add('selected');
    }
});

// prevent native drag
document.addEventListener('dragstart', (e) => e.preventDefault());
table.addEventListener('mousedown', handleDragStart);

// --- UI actions: color palette, apply color, font size, row heights, download ---

// build palette UI
const buildPalette = () => {
    colorPaletteContainer.innerHTML = '';
    COLOR_PALETTE.forEach(hex => {
        const sw = document.createElement('div');
        sw.className = 'color-swatch';
        sw.title = hex;
        sw.style.background = hex;
        sw.addEventListener('click', () => applyColorToSelection(hex));
        colorPaletteContainer.appendChild(sw);
    });
};

// determine whether to set text color or background
const getColorTarget = () => {
    for (const r of colorTargetRadios) if (r.checked) return r.value;
    return 'text';
};

const applyColorToSelection = (hex) => {
    const target = getColorTarget();
    const sels = document.querySelectorAll('.data-table td.selected');
    if (!sels.length) return;
    sels.forEach(cell => {
        if (target === 'text') cell.style.color = hex;
        else cell.style.backgroundColor = hex;
    });
    saveTableState();
};

// font size apply
applyFontSizeBtn.addEventListener('click', () => {
    const v = fontSizeInput.value;
    if (!v) return;
    const sels = document.querySelectorAll('.data-table td.selected');
    if (!sels.length) return;
    sels.forEach(c => c.style.fontSize = `${v}px`);
    saveTableState();
});

// apply row height function
const applyRowHeight = (target, value) => {
    const v = Number(value);
    if (isNaN(v)) return;
    if (target === 'top-data') {
        document.querySelectorAll('.top-data-row, .top-data-header').forEach(r => {
            r.querySelectorAll('td').forEach(td => td.style.height = `${v}px`);
        });
        document.querySelectorAll('.top-notice-row td').forEach(td => td.style.height = `${v + 10}px`);
    } else if (target === 'middle-notice') {
        document.querySelectorAll('.middle-notice-row td').forEach(td => td.style.height = `${v}px`);
    } else if (target === 'bottom-data') {
        document.querySelectorAll('.bottom-data-row, .bottom-data-header').forEach(r => {
            r.querySelectorAll('td').forEach(td => td.style.height = `${v}px`);
        });
    }
    saveTableState();
};

// hook buttons
applyTopRowHeightBtn.addEventListener('click', () => applyRowHeight('top-data', topRowHeightInput.value));
applyMiddleNoticeRowHeightBtn.addEventListener('click', () => applyRowHeight('middle-notice', middleNoticeRowHeightInput.value));
applyBottomRowHeightBtn.addEventListener('click', () => applyRowHeight('bottom-data', bottomRowHeightInput.value));

// download using html2canvas
downloadButton.addEventListener('click', async () => {
    // we expect html2canvas to be loaded in the page
    if (typeof html2canvas === 'undefined') {
        alert('html2canvas가 로드되지 않았습니다.');
        return;
    }
    const captureArea = document.getElementById('capture-area');
    if (!captureArea) return;
    // temporarily remove selection outlines for clean image
    const selectedCells = document.querySelectorAll('.data-table td.selected');
    selectedCells.forEach(c => c.classList.add('temp-remove-outline'));
    // create canvas
    try {
        const canvas = await html2canvas(captureArea, {
            backgroundColor: null,
            scale: 2,
            useCORS: true,
            scrollY: -window.scrollY
        });
        const url = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = url;
        a.download = `table_capture_${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
    } catch (err) {
        console.error('html2canvas error', err);
        alert('이미지 생성에 실패했습니다.');
    } finally {
        // restore
        selectedCells.forEach(c => c.classList.remove('temp-remove-outline'));
    }
});

// build palette on load
buildPalette();

// init firebase auth
initAuth();

// expose save for debugging
window.saveTableState = saveTableState;
