// =============================
// app.js — Full Complete Version
// =============================

// --- Firebase imports ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// --- Firebase 설정 ---
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

// =============================
// DOM 요소
// =============================
const table = document.querySelector('.data-table');
const wrap = document.querySelector('.wrap') || document.body;
const selectionBox = document.getElementById('selectionBox');

const colorPaletteContainer = document.getElementById('colorPaletteContainer');
const fontSizeInput = document.getElementById('fontSizeInput');
const applyFontSizeBtn = document.getElementById('applyFontSizeBtn');
const downloadButton = document.getElementById('downloadBtn');
const settingPanel = document.getElementById('settingPanel');

const colorTargetRadios = document.getElementsByName('colorTarget');

// 행 높이 입력들
const topRowHeightInput = document.getElementById('topRowHeightInput');
const applyTopRowHeightBtn = document.getElementById('applyTopRowHeightBtn');

const middleNoticeRowHeightInput = document.getElementById('middleNoticeRowHeightInput');
const applyMiddleNoticeRowHeightBtn = document.getElementById('applyMiddleNoticeRowHeightBtn');

const bottomRowHeightInput = document.getElementById('bottomRowHeightInput');
const applyBottomRowHeightBtn = document.getElementById('applyBottomRowHeightBtn');

// 최상단 헤더
const headerRowHeightInput = document.getElementById('headerRowHeightInput');
const applyHeaderRowHeightBtn = document.getElementById('applyHeaderRowHeightBtn');

// =============================
// 색상 팔레트
// =============================
const COLOR_PALETTE = [
    '#FFFFFF','#000000','#FF0000','#00FF00','#0000FF','#FFFF00','#00FFFF','#FF00FF',
    '#FFA500','#800080','#008000','#808000','#000080','#800000','#C0C0C0','#808080',
    '#FF4500','#ADFF2F','#1E90FF','#FFD700','#20B2AA','#E9967A','#9400D3','#FF69B4'
];

// 팔레트 생성
COLOR_PALETTE.forEach(color => {
    const btn = document.createElement('div');
    btn.className = 'color-button';
    btn.style.backgroundColor = color;
    btn.dataset.color = color;
    colorPaletteContainer.appendChild(btn);
});

// =============================
// 선택 기능 (드래그 박스)
// =============================
let isDragging = false;
let startCell = null;
let endCell = null;

const clearSelection = () => {
    document.querySelectorAll('.data-table td.selected')
        .forEach(c => c.classList.remove('selected'));
};

const getCellCoords = (cell) => ({
    r: cell.closest('tr').rowIndex,
    c: cell.cellIndex
});

// 박스 위치 업데이트
const updateBox = (cellA, cellB) => {
    const rectA = cellA.getBoundingClientRect();
    const rectB = cellB.getBoundingClientRect();

    const wrapRect = wrap.getBoundingClientRect();

    selectionBox.style.display = 'block';
    selectionBox.style.left = (Math.min(rectA.left, rectB.left) - wrapRect.left + wrap.scrollLeft) + 'px';
    selectionBox.style.top = (Math.min(rectA.top, rectB.top) - wrapRect.top + wrap.scrollTop) + 'px';
    selectionBox.style.width = Math.abs(rectA.left - rectB.left) + cellA.offsetWidth + 'px';
    selectionBox.style.height = Math.abs(rectA.top - rectB.top) + cellA.offsetHeight + 'px';
};

// 드래그로 셀 선택
const selectCells = (cellA, cellB) => {
    clearSelection();

    const A = getCellCoords(cellA);
    const B = getCellCoords(cellB);

    const r1 = Math.min(A.r, B.r);
    const r2 = Math.max(A.r, B.r);
    const c1 = Math.min(A.c, B.c);
    const c2 = Math.max(A.c, B.c);

    const trs = table.querySelectorAll('tr');
    for (let r = r1; r <= r2; r++) {
        const tds = trs[r].querySelectorAll('td');
        for (let c = c1; c <= c2; c++) {
            tds[c]?.classList.add('selected');
        }
    }
};

// 드래그 시작
table.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    const cell = e.target.closest('td');
    if (!cell) return;

    isDragging = true;
    startCell = cell;
    endCell = cell;

    updateBox(startCell, startCell);

    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', onDragEnd);
});

// 드래그 중
const onDrag = (e) => {
    if (!isDragging) return;

    const cell = e.target.closest('td');
    if (cell) {
        endCell = cell;
        selectCells(startCell, endCell);
        updateBox(startCell, endCell);
    }
};

// 드래그 종료
const onDragEnd = () => {
    isDragging = false;
    selectionBox.style.display = 'none';

    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', onDragEnd);
};

// =============================
// 색상 적용
// =============================
colorPaletteContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('.color-button');
    if (!btn) return;

    const color = btn.dataset.color;
    const target = [...colorTargetRadios].find(r => r.checked).value;

    document.querySelectorAll('td.selected').forEach(td => {
        if (target === 'bg') td.style.backgroundColor = color;
        else td.style.color = color;
    });

    saveTable();
});

// =============================
// 글자 크기 적용
// =============================
applyFontSizeBtn.addEventListener('click', () => {
    const size = fontSizeInput.value + 'px';

    document.querySelectorAll('td.selected').forEach(td => {
        td.style.fontSize = size;
    });

    saveTable();
});

// =============================
// 행 높이 변경 (전부 작동)
// =============================
applyTopRowHeightBtn.addEventListener('click', () => {
    const h = topRowHeightInput.value + 'px';
    document.querySelectorAll('tr.top-data').forEach(tr => tr.style.height = h);
    saveTable();
});

applyMiddleNoticeRowHeightBtn.addEventListener('click', () => {
    const h = middleNoticeRowHeightInput.value + 'px';
    document.querySelectorAll('tr.middle-notice').forEach(tr => tr.style.height = h);
    saveTable();
});

applyBottomRowHeightBtn.addEventListener('click', () => {
    const h = bottomRowHeightInput.value + 'px';
    document.querySelectorAll('tr.bottom-data').forEach(tr => tr.style.height = h);
    saveTable();
});

applyHeaderRowHeightBtn.addEventListener('click', () => {
    const h = headerRowHeightInput.value + 'px';
    document.querySelectorAll('tr.table-header').forEach(tr => tr.style.height = h);
    saveTable();
});

// =============================
// Firebase 저장 & 로드
// =============================
const saveTable = () => {
    const all = {};

    [...table.querySelectorAll('tr')].forEach((tr, r) => {
        all[r] = {};
        [...tr.querySelectorAll('td')].forEach((td, c) => {
            all[r][c] = {
                html: td.innerHTML,
                color: td.style.color,
                bg: td.style.backgroundColor,
                size: td.style.fontSize,
                height: td.style.height
            };
        });
    });

    setDoc(doc(db, "tables", "main"), { table: all }, { merge: true });
};

// Firebase 로그인
signInAnonymously(auth);

onAuthStateChanged(auth, (user) => {
    if (!user) return;

    onSnapshot(doc(db, "tables", "main"), (snap) => {
        const data = snap.data()?.table;
        if (!data) return;

        [...table.querySelectorAll('tr')].forEach((tr, r) => {
            [...tr.querySelectorAll('td')].forEach((td, c) => {
                const d = data[r]?.[c];
                if (!d) return;

                td.innerHTML = d.html ?? td.innerHTML;
                td.style.color = d.color ?? '';
                td.style.backgroundColor = d.bg ?? '';
                td.style.fontSize = d.size ?? '';
                tr.style.height = d.height ?? tr.style.height;
            });
        });
    });
});

// =============================
// 이미지 다운로드
// =============================
downloadButton.addEventListener('click', async () => {
    const canvas = await html2canvas(wrap);
    const link = document.createElement('a');
    link.download = 'table.png';
    link.href = canvas.toDataURL();
    link.click();
});
