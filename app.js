// app.js (통짜 완성본)
// Firebase SDK (module 로드 필요)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

/* ===========================
   Firebase 설정 — 본인 프로젝트로 교체 가능
   =========================== */
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

const APP_DOC_ID = 'main_table_state'; // Firestore 문서 id
const APP_COLLECTION_PATH_PREFIX = 'artifacts'; // 동일 구조 사용(기존 코드와 호환)

/* ===========================
   DOM References
   =========================== */
const wrap = document.querySelector('.wrap') || document.body;
const table = document.querySelector('.data-table');
const selectionBox = document.getElementById('selectionBox');

const colorPaletteContainer = document.getElementById('colorPaletteContainer');
const fontSizeInput = document.getElementById('fontSizeInput');
const applyFontSizeBtn = document.getElementById('applyFontSizeBtn');
const downloadButton = document.getElementById('downloadBtn');
const settingPanel = document.getElementById('settingPanel');
const colorTargetRadios = document.getElementsByName('colorTarget');

// row height controls (may exist in HTML)
let topRowHeightInput = document.getElementById('topRowHeightInput');
let applyTopRowHeightBtn = document.getElementById('applyTopRowHeightBtn');

let middleNoticeRowHeightInput = document.getElementById('middleNoticeRowHeightInput');
let applyMiddleNoticeRowHeightBtn = document.getElementById('applyMiddleNoticeRowHeightBtn');

let bottomRowHeightInput = document.getElementById('bottomRowHeightInput');
let applyBottomRowHeightBtn = document.getElementById('applyBottomRowHeightBtn');

let headerRowHeightInput = document.getElementById('headerRowHeightInput');
let applyHeaderRowHeightBtn = document.getElementById('applyHeaderRowHeightBtn');

/* ===========================
   Local state
   =========================== */
let currentUserId = null;
let isAuthReady = false;
let initialLoadDone = false;

/* ===========================
   Palette colors
   =========================== */
const COLOR_PALETTE = [
  '#FFFFFF','#000000','#FF0000','#00FF00','#0000FF','#FFFF00','#00FFFF','#FF00FF',
  '#FFA500','#800080','#008000','#808000','#000080','#800000','#C0C0C0','#808080',
  '#FF4500','#ADFF2F','#1E90FF','#FFD700','#20B2AA','#E9967A','#9400D3','#FF69B4',
  '#A0522D','#D2B48C','#87CEEB','#F08080','#4682B4','#DA70D6','#B0C4DE','#F4A460',
  '#5F9EA0','#DDA0DD','#7FFF00','#6495ED','#DC143C','#FF8C00','#9ACD32','#40E0D0'
];

/* ===========================
   Selection / Drag logic
   =========================== */
let isDragging = false;
let dragStartCell = null;
let dragEndCell = null;
let dragStartClient = { x: 0, y: 0 };

// utility: get row/col indices for a cell
const getCellCoordinates = (cell) => {
  const tr = cell.closest('tr');
  return { rowIndex: tr ? tr.rowIndex : 0, cellIndex: cell.cellIndex };
};

// clear selection classes & hide box
const clearSelection = () => {
  document.querySelectorAll('.data-table td.selected').forEach(td => td.classList.remove('selected'));
  if (selectionBox) {
    selectionBox.style.display = 'none';
    selectionBox.style.width = '0px';
    selectionBox.style.height = '0px';
  }
};

// convert client coords -> wrap-relative coords (handles wrap scroll)
const getWrapRect = () => wrap.getBoundingClientRect();
const clientToWrapCoords = (clientX, clientY) => {
  const wr = getWrapRect();
  return { x: clientX - wr.left + wrap.scrollLeft, y: clientY - wr.top + wrap.scrollTop };
};

// update selectionBox rectangle based on two cells
const updateSelectionBoxVisual = (cellA, cellB) => {
  if (!selectionBox || !cellA || !cellB) return;
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

// add .selected to cells in rectangle between cellA and cellB
const selectCellsInDragArea = (cellA, cellB, preserveExisting = false) => {
  if (!cellA || !cellB) return;
  if (!preserveExisting) {
    document.querySelectorAll('.data-table td.selected').forEach(c => c.classList.remove('selected'));
  }

  const a = getCellCoordinates(cellA);
  const b = getCellCoordinates(cellB);

  const r1 = Math.min(a.rowIndex, b.rowIndex);
  const r2 = Math.max(a.rowIndex, b.rowIndex);
  const c1 = Math.min(a.cellIndex, b.cellIndex);
  const c2 = Math.max(a.cellIndex, b.cellIndex);

  const rows = table.querySelectorAll('tr');
  for (let ri = r1; ri <= r2; ri++) {
    const cols = rows[ri].querySelectorAll('td');
    for (let ci = c1; ci <= c2; ci++) {
      const cell = cols[ci];
      if (cell) cell.classList.add('selected');
    }
  }
};

/* Drag event handlers */
const handleDragStart = (e) => {
  if (e.button !== 0) return; // left only
  // ignore controls area clicks
  if (e.target.closest('.setting-panel') || e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') return;

  const cell = e.target.closest('td');
  if (!cell) return;

  // If cell is contenteditable and no modifier: let it be a click-to-edit (still track small movement)
  if (cell.isContentEditable && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
    dragStartCell = cell;
    document.addEventListener('mousemove', handleDraggingCheck);
    document.addEventListener('mouseup', handleDragEndCleanup);
    return;
  }

  e.preventDefault();
  dragStartClient = { x: e.clientX, y: e.clientY };

  const preserve = !!e.shiftKey;
  if (!preserve) clearSelection();

  dragStartCell = cell;
  dragEndCell = cell;
  isDragging = true;

  updateSelectionBoxVisual(dragStartCell, dragStartCell);
  selectCellsInDragArea(dragStartCell, dragStartCell, preserve);

  document.addEventListener('mousemove', handleDragging);
  document.addEventListener('mouseup', handleDragEnd);
};

const handleDraggingCheck = (e) => {
  // small move threshold to decide if starting a drag when clicked on contenteditable
  if (!dragStartCell) return;
  if (Math.abs(e.movementX) > 2 || Math.abs(e.movementY) > 2) {
    isDragging = true;
    document.removeEventListener('mousemove', handleDraggingCheck);
    document.removeEventListener('mouseup', handleDragEndCleanup);
    window.getSelection()?.removeAllRanges();
    clearSelection();
    dragEndCell = dragStartCell;
    updateSelectionBoxVisual(dragStartCell, dragStartCell);
    document.addEventListener('mousemove', handleDragging);
    document.addEventListener('mouseup', handleDragEnd);
  }
};

const handleDragEndCleanup = () => {
  document.removeEventListener('mousemove', handleDraggingCheck);
  document.removeEventListener('mouseup', handleDragEndCleanup);
  dragStartCell = null;
};

const handleDragging = (e) => {
  if (!isDragging) return;
  e.preventDefault();

  const cellUnder = e.target.closest('td');
  if (cellUnder && cellUnder !== dragEndCell) {
    dragEndCell = cellUnder;
    const preserve = !!(e.shiftKey || document.querySelectorAll('.data-table td.selected').length > 0);
    selectCellsInDragArea(dragStartCell, dragEndCell, preserve);
    updateSelectionBoxVisual(dragStartCell, dragEndCell);
  } else {
    // pointer not over a cell — still show rubber-band box (from start client to current client)
    const startWrap = clientToWrapCoords(dragStartClient.x, dragStartClient.y);
    const curWrap = clientToWrapCoords(e.clientX, e.clientY);
    const x1 = Math.min(startWrap.x, curWrap.x);
    const y1 = Math.min(startWrap.y, curWrap.y);
    const x2 = Math.max(startWrap.x, curWrap.x);
    const y2 = Math.max(startWrap.y, curWrap.y);
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
  if (dragStartCell && dragEndCell) {
    const preserve = !!(e.shiftKey || document.querySelectorAll('.data-table td.selected').length > 0);
    selectCellsInDragArea(dragStartCell, dragEndCell, preserve);
  }
  if (selectionBox) selectionBox.style.display = 'none';
  dragStartCell = null;
  dragEndCell = null;
  document.removeEventListener('mousemove', handleDragging);
  document.removeEventListener('mouseup', handleDragEnd);
};

/* Click selection (toggle/shift semantics) */
table.addEventListener('click', (e) => {
  const cell = e.target.closest('td');
  if (!cell) return;
  if (isDragging) return; // ignore click during drag

  // contenteditable cell + plain click -> focus for editing
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

// prevent native drag
document.addEventListener('dragstart', (e) => e.preventDefault());
table.addEventListener('mousedown', handleDragStart);

/* ===========================
   Palette / styling actions
   =========================== */
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
    if (target === 'background' || target === 'bg') cell.style.backgroundColor = hex;
    else cell.style.color = hex;
  });
  saveTableState();
};

if (applyFontSizeBtn && fontSizeInput) {
  applyFontSizeBtn.addEventListener('click', () => {
    const v = fontSizeInput.value;
    if (!v) return;
    const sels = document.querySelectorAll('.data-table td.selected');
    if (!sels.length) return;
    sels.forEach(c => c.style.fontSize = `${v}px`);
    saveTableState();
  });
}

/* ===========================
   Row height controls
   =========================== */
const applyRowHeight = (target, value) => {
  const v = Number(value);
  if (isNaN(v)) return;

  if (target === 'table-header') {
    // apply to first row or any row with class .top-notice-row (as header)
    const firstRow = table.querySelector('tr');
    if (firstRow) firstRow.querySelectorAll('td,th').forEach(cell => cell.style.height = `${v}px`);
  } else if (target === 'top-data') {
    document.querySelectorAll('.top-data-row, .top-data-header').forEach(r => {
      r.querySelectorAll('td').forEach(td => td.style.height = `${v}px`);
    });
    document.querySelectorAll('.top-notice-row td').forEach(td => td.style.height = `${v + 10}px`);
  } else if (target === 'middle-notice') {
    // explicit middle-notice rows
    document.querySelectorAll('.middle-notice-row').forEach(tr => {
      tr.querySelectorAll('td').forEach(td => td.style.height = `${v}px`);
    });
  } else if (target === 'bottom-data') {
    document.querySelectorAll('.bottom-data-row, .bottom-data-header').forEach(r => {
      r.querySelectorAll('td').forEach(td => td.style.height = `${v}px`);
    });
  }

  saveTableState();
};

// attach existing buttons (guard checks)
if (applyTopRowHeightBtn && topRowHeightInput) {
  applyTopRowHeightBtn.addEventListener('click', () => applyRowHeight('top-data', topRowHeightInput.value));
}
if (applyMiddleNoticeRowHeightBtn && middleNoticeRowHeightInput) {
  applyMiddleNoticeRowHeightBtn.addEventListener('click', () => applyRowHeight('middle-notice', middleNoticeRowHeightInput.value));
}
if (applyBottomRowHeightBtn && bottomRowHeightInput) {
  applyBottomRowHeightBtn.addEventListener('click', () => applyRowHeight('bottom-data', bottomRowHeightInput.value));
}

/* If header inputs not present in HTML, create them inside settingPanel */
const ensureHeaderControls = () => {
  if (!settingPanel) return;
  if (!headerRowHeightInput || !applyHeaderRowHeightBtn) {
    const c = document.createElement('div');
    c.style.marginTop = '10px';
    c.innerHTML = `
      <label style="display:block; color:#ffdd66; margin-bottom:6px;">최상단 헤더 행 높이 (px)</label>
      <div style="display:flex; gap:8px; align-items:center;">
        <input id="headerRowHeightInput" type="number" value="40" min="8" style="width:70px; padding:6px; color:black; border-radius:3px; border:none;">
        <button id="applyHeaderRowHeightBtn" style="padding:6px 10px; background:#555; color:#fff; border:none; border-radius:3px; cursor:pointer;">적용</button>
      </div>
    `;
    settingPanel.appendChild(c);
    headerRowHeightInput = document.getElementById('headerRowHeightInput');
    applyHeaderRowHeightBtn = document.getElementById('applyHeaderRowHeightBtn');
    applyHeaderRowHeightBtn.addEventListener('click', () => applyRowHeight('table-header', headerRowHeightInput.value));
  }
};

/* ===========================
   html2canvas download
   =========================== */
if (downloadButton) {
  downloadButton.addEventListener('click', async () => {
    if (typeof html2canvas === 'undefined') {
      alert('html2canvas가 로드되지 않았습니다.');
      return;
    }
    const captureArea = document.getElementById('capture-area') || table;
    if (!captureArea) return;

    // temporarily hide selection glow for capture if needed
    document.querySelectorAll('.data-table td.selected').forEach(td => td.classList.add('temp-sel-hidden'));

    try {
      const canvas = await html2canvas(captureArea, { backgroundColor: null, scale: 2, useCORS: true, scrollY: -window.scrollY });
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `table_capture_${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error('html2canvas error', err);
      alert('이미지 생성 실패');
    } finally {
      document.querySelectorAll('.data-table td.selected').forEach(td => td.classList.remove('temp-sel-hidden'));
    }
  });
}

/* ===========================
   Firestore: save & load
   =========================== */
const getTableDocRef = (userId) => {
  // mirror original path structure: artifacts / appId / users / userId / table_data / TABLE_DOC_ID
  return doc(db, 'artifacts', firebaseConfig.appId, 'users', userId, 'table_data', APP_DOC_ID);
};

const saveTableState = async () => {
  if (!currentUserId || !isAuthReady) return;

  try {
    const cells = {};
    const rows = table.querySelectorAll('tr');
    rows.forEach((row, rIndex) => {
      row.querySelectorAll('td').forEach((cell, cIndex) => {
        const id = `r${rIndex}c${cIndex}`;
        cells[id] = {
          text: cell.innerHTML,
          color: cell.style.color || '',
          bg: cell.style.backgroundColor || '',
          fontSize: cell.style.fontSize || ''
        };
      });
    });

    const rowHeights = {};
    // pick up any height inputs with class height-apply-btn dataset.target
    document.querySelectorAll('.height-apply-btn').forEach(btn => {
      const tgt = btn.dataset.target;
      let inputId = `${tgt.replace('-data','RowHeightInput')}`;
      if (tgt === 'middle-notice') inputId = 'middleNoticeRowHeightInput';
      const inp = document.getElementById(inputId);
      if (inp) rowHeights[tgt] = inp.value;
    });

    await setDoc(getTableDocRef(currentUserId), { cells, rowHeights, updated: new Date() }, { merge: true });
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
        const id = `r${rIndex}c${cIndex}`;
        const st = data.cells[id];
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
      // try to set input value and apply
      let inputId = `${k.replace('-data','RowHeightInput')}`;
      if (k === 'middle-notice') inputId = 'middleNoticeRowHeightInput';
      const inp = document.getElementById(inputId);
      if (inp) inp.value = v;
      applyRowHeight(k, v);
    }
  }
  clearSelection();
};

const loadTableState = (userId) => {
  const ref = getTableDocRef(userId);
  onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      applyLoadedState(snap.data());
    } else if (!initialLoadDone) {
      // if no doc exist yet, create initial doc
      saveTableState();
    }
    initialLoadDone = true;
  }, (err) => console.error('onSnapshot error', err));
};

/* ===========================
   Auth init
   =========================== */
const initAuth = async () => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      currentUserId = user.uid;
    } else {
      try {
        await signInAnonymously(auth);
        currentUserId = auth.currentUser.uid;
      } catch (err) {
        console.error('anon signin failed', err);
        return;
      }
    }
    if (currentUserId && !isAuthReady) {
      isAuthReady = true;
      loadTableState(currentUserId);
    }
  });
};

/* ===========================
   Init: build UI, hooks
   =========================== */
buildPalette();
ensureHeaderControls();
initAuth();

// expose save for debugging
window.saveTableState = saveTableState;
