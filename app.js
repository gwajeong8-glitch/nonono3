// app.js (완성형)
// 모든 기능 통합: 드래그 멀티셀 선택, 색상 팔레트, 폰트 사이즈, 행 높이(최상단/상단/중단/하단),
// Firebase 저장/로드, html2canvas 이미지 다운로드

// Firebase SDK imports (페이지에서 <script type="module" src="app.js"></script> 로 로드해야 함)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// --- Firebase 설정 (사용자 제공값 유지) ---
const firebaseConfig = {
  apiKey: "AIzaSyBSkdUP_bU60GiLY6w9Uo7e8g_pkLllFPg",
  authDomain: "my-nonono3.firebaseapp.com",
  projectId: "my-nonono3",
  storageBucket: "my-nonono3.firebasestorage.app",
  messagingSenderId: "167865896202",
  appId: "1:167865896202:web:2567994bd29509f9d6fef3",
  measurementId: "G-T126HT4T7X"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const appId = firebaseConfig.appId || 'default_app';
const TABLE_DOC_ID = 'main_table_state';

let currentUserId = null;
let isAuthReady = false;
let initialLoadDone = false;

// --- DOM refs (HTML 구조에 맞춰져 있음) ---
const table = document.querySelector('.data-table');
const colorPaletteContainer = document.getElementById('colorPaletteContainer');
const applyFontSizeBtn = document.getElementById('applyFontSizeBtn');
const fontSizeInput = document.getElementById('fontSizeInput');
const downloadButton = document.getElementById('downloadBtn');
const selectionBox = document.getElementById('selectionBox');
const settingPanel = document.getElementById('settingPanel');
const wrap = document.querySelector('.wrap') || document.body;
const colorTargetRadios = document.getElementsByName('colorTarget');

// height controls (may exist in HTML already)
let topRowHeightInput = document.getElementById('topRowHeightInput');
let applyTopRowHeightBtn = document.getElementById('applyTopRowHeightBtn');
let middleNoticeRowHeightInput = document.getElementById('middleNoticeRowHeightInput');
let applyMiddleNoticeRowHeightBtn = document.getElementById('applyMiddleNoticeRowHeightBtn');
let bottomRowHeightInput = document.getElementById('bottomRowHeightInput');
let applyBottomRowHeightBtn = document.getElementById('applyBottomRowHeightBtn');
let headerRowHeightInput = document.getElementById('headerRowHeightInput');
let applyHeaderRowHeightBtn = document.getElementById('applyHeaderRowHeightBtn');

// --- color palette ---
const COLOR_PALETTE = [
  '#FFFFFF','#000000','#FF0000','#00FF00','#0000FF','#FFFF00','#00FFFF','#FF00FF',
  '#FFA500','#800080','#008000','#808000','#000080','#800000','#C0C0C0','#808080',
  '#FF4500','#ADFF2F','#1E90FF','#FFD700','#20B2AA','#E9967A','#9400D3','#FF69B4',
  '#A0522D','#D2B48C','#87CEEB','#F08080','#4682B4','#DA70D6','#B0C4DE','#F4A460',
  '#5F9EA0','#DDA0DD','#7FFF00','#6495ED','#DC143C','#FF8C00','#9ACD32','#40E0D0'
];

// --- drag/selection state ---
let isDragging = false;
let startCell = null;
let endCell = null;
let dragStartClient = { x: 0, y: 0 };

// --- Firestore helpers ---
const getTableDocRef = (userId) => doc(db, 'artifacts', appId, 'users', userId, 'table_data', TABLE_DOC_ID);

const saveTableState = async () => {
  if (!currentUserId || !isAuthReady) return;
  try {
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
    if (snap.exists()) applyLoadedState(snap.data());
    else if (!initialLoadDone) saveTableState();
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

// --- selection helpers ---
const getCellCoordinates = (cell) => {
  const rowIndex = cell.closest('tr').rowIndex;
  const cellIndex = cell.cellIndex;
  return { rowIndex, cellIndex };
};

const clearSelection = () => {
  document.querySelectorAll('.data-table td.selected').forEach(c => c.classList.remove('selected'));
  if (selectionBox) {
    selectionBox.style.display = 'none';
    selectionBox.style.width = '0px';
    selectionBox.style.height = '0px';
  }
};

const getWrapRect = () => wrap.getBoundingClientRect();
const clientToWrapCoords = (clientX, clientY) => {
  const wr = getWrapRect();
  return { x: clientX - wr.left + wrap.scrollLeft, y: clientY - wr.top + wrap.scrollTop };
};

const updateSelectionBoxVisual = (cellA, cellB) => {
  if (!selectionBox) return;
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
  if (!preserveExisting) document.querySelectorAll('.data-table td.selected').forEach(c => c.classList.remove('selected'));
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

// --- drag handlers ---
const handleDragStart = (e) => {
  // only left button
  if (e.button !== 0) return;
  if (e.target.closest && e.target.closest('.setting-panel')) return;
  if (['INPUT','BUTTON','SELECT','TEXTAREA'].includes(e.target.tagName)) return;

  const cell = e.target.closest && e.target.closest('td');
  if (!cell) return;

  // if contenteditable cell and no modifier -> may want to edit instead of select
  if (cell.isContentEditable && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
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
  const cellUnderMouse = e.target.closest && e.target.closest('td');
  if (cellUnderMouse && cellUnderMouse !== endCell) {
    endCell = cellUnderMouse;
    const preserve = !!(e.shiftKey || document.querySelectorAll('.data-table td.selected').length > 0);
    selectCellsInDragArea(startCell, endCell, preserve);
    updateSelectionBoxVisual(startCell, endCell);
  } else {
    // pointer not over td: just update visual selection box using client coords
    const startWrap = clientToWrapCoords(dragStartClient.x, dragStartClient.y);
    const currentWrap = clientToWrapCoords(e.clientX, e.clientY);
    const x1 = Math.min(startWrap.x, currentWrap.x), y1 = Math.min(startWrap.y, currentWrap.y);
    const x2 = Math.max(startWrap.x, currentWrap.x), y2 = Math.max(startWrap.y, currentWrap.y);
    if (selectionBox) {
      selectionBox.style.display = 'block';
      selectionBox.style.left = `${x1}px`;
      selectionBox.style.top = `${y1}px`;
      selectionBox.style.width = `${Math.max(1, x2 - x1)}px`;
      selectionBox.style.height = `${Math.max(1, y2 - y1)}px`;
    }
  }
};

const handleDragEnd = (e) => {
  if (!isDragging) return;
  isDragging = false;
  if (startCell && endCell) {
    const preserve = !!(e.shiftKey || document.querySelectorAll('.data-table td.selected').length > 0);
    selectCellsInDragArea(startCell, endCell, preserve);
  }
  if (selectionBox) {
    selectionBox.style.display = 'none';
    selectionBox.style.width = '0px';
    selectionBox.style.height = '0px';
  }
  startCell = null; endCell = null;
  document.removeEventListener('mousemove', handleDragging);
  document.removeEventListener('mouseup', handleDragEnd);
};

// single click selection / editing behavior
if (table) {
  table.addEventListener('click', (e) => {
    const cell = e.target.closest && e.target.closest('td');
    if (!cell) return;
    if (isDragging) return;
    if (cell.isContentEditable && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
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

  table.addEventListener('mousedown', handleDragStart);
}

document.addEventListener('dragstart', (e) => e.preventDefault());

// --- UI: palette / color / font size / row heights / download ---
const buildPalette = () => {
  if (!colorPaletteContainer) return;
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

if (applyFontSizeBtn && fontSizeInput) {
  applyFontSizeBtn.addEventListener('click', () => {
    const v = Number(fontSizeInput.value);
    if (!v) return;
    const sels = document.querySelectorAll('.data-table td.selected');
    if (!sels.length) return;
    sels.forEach(c => c.style.fontSize = `${v}px`);
    saveTableState();
  });
}

// apply row height (handles table-header, top-data, middle-notice, bottom-data)
const applyRowHeight = (target, value) => {
  const v = Number(value);
  if (isNaN(v)) return;

  if (target === 'table-header') {
    // try to find a row that should be header: prefer .top-notice-row (first row in user's markup is top-notice)
    const headerRow = table.querySelector('.top-notice-row') || table.querySelector('tr');
    if (headerRow) headerRow.querySelectorAll('td,th').forEach(cell => cell.style.height = `${v}px`);
  } else if (target === 'top-data') {
    document.querySelectorAll('.top-data-row, .top-data-header').forEach(r => {
      r.querySelectorAll('td').forEach(td => td.style.height = `${v}px`);
    });
    // enlarge top-notice slightly to keep legibility
    document.querySelectorAll('.top-notice-row td').forEach(td => td.style.height = `${v + 10}px`);
  } else if (target === 'middle-notice') {
    // reliable application for middle-notice rows
    document.querySelectorAll('.middle-notice-row').forEach(tr => tr.querySelectorAll('td').forEach(td => td.style.height = `${v}px`));
  } else if (target === 'bottom-data') {
    document.querySelectorAll('.bottom-data-row, .bottom-data-header').forEach(r => {
      r.querySelectorAll('td').forEach(td => td.style.height = `${v}px`);
    });
  }

  saveTableState();
};

// Ensure header controls exist in the DOM (some HTML variants might not have it)
const ensureHeaderControls = () => {
  if (!settingPanel) return;
  if (!headerRowHeightInput || !applyHeaderRowHeightBtn) {
    const container = document.createElement('div');
    container.style.marginTop = '12px';
    container.innerHTML = `\
      <label style="display:block; color:#ffdd66; margin-bottom:6px;">🔺 표 최상단 헤더 행 높이 (px)</label>\
      <div style="display:flex; gap:8px; align-items:center;">\
        <input id="headerRowHeightInput" type="number" value="40" min="8" style="width:70px; padding:6px; color:black; border-radius:3px; border:none;">\
        <button id="applyHeaderRowHeightBtn" class="height-apply-btn" data-target="table-header" style="padding:6px 10px; background:#555; color:white; border-radius:3px; border:none; cursor:pointer;">적용</button>\
      </div>`;
    settingPanel.appendChild(container);
    headerRowHeightInput = document.getElementById('headerRowHeightInput');
    applyHeaderRowHeightBtn = document.getElementById('applyHeaderRowHeightBtn');

    if (applyHeaderRowHeightBtn) applyHeaderRowHeightBtn.addEventListener('click', () => applyRowHeight('table-header', headerRowHeightInput.value));
  }
};

// Hook existing buttons (if present)
if (applyTopRowHeightBtn && topRowHeightInput) applyTopRowHeightBtn.addEventListener('click', () => applyRowHeight('top-data', topRowHeightInput.value));
if (applyMiddleNoticeRowHeightBtn && middleNoticeRowHeightInput) applyMiddleNoticeRowHeightBtn.addEventListener('click', () => applyRowHeight('middle-notice', middleNoticeRowHeightInput.value));
if (applyBottomRowHeightBtn && bottomRowHeightInput) applyBottomRowHeightBtn.addEventListener('click', () => applyRowHeight('bottom-data', bottomRowHeightInput.value));

// download image using html2canvas
if (downloadButton) {
  downloadButton.addEventListener('click', async () => {
    if (typeof html2canvas === 'undefined') { alert('html2canvas가 로드되지 않았습니다.'); return; }
    const captureArea = document.getElementById('capture-area');
    if (!captureArea) return;
    const selectedCells = document.querySelectorAll('.data-table td.selected');
    selectedCells.forEach(c => c.classList.add('temp-remove-outline'));
    try {
      const canvas = await html2canvas(captureArea, { backgroundColor: null, scale: 2, useCORS: true, scrollY: -window.scrollY });
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a'); a.href = url; a.download = `table_capture_${Date.now()}.png`; document.body.appendChild(a); a.click(); a.remove();
    } catch (err) {
      console.error('html2canvas error', err); alert('이미지 생성에 실패했습니다.');
    } finally { selectedCells.forEach(c => c.classList.remove('temp-remove-outline')); }
  });
}

// Build palette, ensure header controls, init auth
buildPalette();
ensureHeaderControls();
initAuth();

// expose for debugging
window.saveTableState = saveTableState;

// end of file
