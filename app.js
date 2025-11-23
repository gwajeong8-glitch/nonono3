// app.js
// Firebase SDK import (app.js 내에서 직접 로드)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// --- Firebase 설정 정보 (여기에 자신의 Firebase 프로젝트 설정을 붙여넣으세요) ---
const firebaseConfig = {
    apiKey: "AIzaSyBSkdUP_bU60GiLY6w9Uo7e8g_pkLllFPg",
    authDomain: "my-nonono3.firebaseapp.com",
    projectId: "my-nonono3",
    storageBucket: "my-nonono3.firebasestorage.app",
    messagingSenderId: "167865896202",
    appId: "1:167865896202:web:2567994bd29509f9d6fef3",
    measurementId: "G-T126HT4T7X"
};


// 앱 ID는 Firestore 문서 경로에 사용될 수 있습니다 (필요에 따라)
const appId = firebaseConfig.appId;

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const TABLE_DOC_ID = 'main_table_state'; // Firestore에 저장될 문서 ID

let currentUserId = null;
let isAuthReady = false;
let initialLoadDone = false; // 최초 데이터 로드 여부 플래그

// --- DOM 요소 참조 ---
const table = document.querySelector('.data-table');
const colorPaletteContainer = document.getElementById('colorPaletteContainer');
const applyFontSizeBtn = document.getElementById('applyFontSizeBtn');
const fontSizeInput = document.getElementById('fontSizeInput');
const downloadButton = document.getElementById('downloadBtn');
const selectionBox = document.getElementById('selectionBox');
const settingPanel = document.getElementById('settingPanel');
const wrap = document.querySelector('.wrap'); // selectionBox는 wrap 내부에 위치하므로 기준으로 사용

// --- 상수 ---
const COLOR_PALETTE = [
    '#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#00FFFF', '#FF00FF',
    '#FFA500', '#800080', '#008000', '#808000', '#000080', '#800000', '#C0C0C0', '#808080',
    '#FF4500', '#ADFF2F', '#1E90FF', '#FFD700', '#20B2AA', '#E9967A', '#9400D3', '#FF69B4',
    '#A0522D', '#D2B48C', '#87CEEB', '#F08080', '#4682B4', '#DA70D6', '#B0C4DE', '#F4A460',
    '#5F9EA0', '#DDA0DD', '#7FFF00', '#6495ED', '#DC143C', '#FF8C00', '#9ACD32', '#40E0D0'
];

// --- 드래그 선택 관련 변수 ---
let isDragging = false;
let startCell = null;
let endCell = null;
let dragStartClient = { x: 0, y: 0 }; // client coordinates at drag start

// --- Firebase 인증 및 데이터 로드/저장 ---

// Firestore 문서 참조 경로 생성 함수
const getTableDocRef = (userId) => {
    // artifacts 컬렉션은 앱별로 고유한 데이터를 구분하기 위함.
    // users 컬렉션은 사용자별 데이터를 구분하기 위함.
    return doc(db, 'artifacts', appId, 'users', userId, 'table_data', TABLE_DOC_ID);
};

// 테이블 상태를 Firebase에 저장
const saveTableState = async () => {
    if (!currentUserId || !isAuthReady) {
        // console.warn("Cannot save state: Auth not ready or user ID is null.");
        return;
    }

    const cellStates = {};
    const rowHeights = {};
    
    // 1. 셀 내용 및 스타일 저장
    const rows = table.querySelectorAll('tr');
    rows.forEach((row, rIndex) => {
        row.querySelectorAll('td').forEach((cell, cIndex) => {
            const cellId = `r${rIndex}c${cIndex}`;
            cellStates[cellId] = {
                text: cell.innerHTML,
                color: cell.style.color || '',
                bg: cell.style.backgroundColor || '',
                fontSize: cell.style.fontSize || '',
            };
        });
    });

    // 2. 행 그룹 높이 저장
    document.querySelectorAll('.height-apply-btn').forEach(button => {
        const target = button.dataset.target;
        let inputId = `${target.replace('-data', 'RowHeightInput')}`;
        if (target === 'middle-notice') inputId = 'middleNoticeRowHeightInput';
        const input = document.getElementById(inputId);
        if (input) rowHeights[target] = input.value;
    });

    const tableState = {
        cells: cellStates,
        rowHeights: rowHeights,
        timestamp: new Date()
    };
    
    try {
        await setDoc(getTableDocRef(currentUserId), tableState, { merge: true });
        // console.log("Table state saved successfully.");
    } catch (e) {
        console.error("Error saving table state: ", e);
    }
};

// 로드된 상태를 테이블에 적용
const applyLoadedState = (data) => {
    if (data.cells) {
        const rows = table.querySelectorAll('tr');
        rows.forEach((row, rIndex) => {
            row.querySelectorAll('td').forEach((cell, cIndex) => {
                const cellId = `r${rIndex}c${cIndex}`;
                const state = data.cells[cellId];
                if (state) {
                    if (cell.innerHTML !== state.text) cell.innerHTML = state.text;
                    cell.style.color = state.color || '';
                    cell.style.backgroundColor = state.bg || '';
                    cell.style.fontSize = state.fontSize || '';
                }
            });
        });
    }

    if (data.rowHeights) {
        for (const [key, value] of Object.entries(data.rowHeights)) {
            let inputId = `${key.replace('-data', 'RowHeightInput')}`;
            if (key === 'middle-notice') inputId = 'middleNoticeRowHeightInput';
            const input = document.getElementById(inputId);
            if (input) input.value = value;
            applyRowHeight(key, value); // 실제 높이 적용 함수 호출
        }
    }
    clearSelection(); // 모든 선택 해제
};

// Firebase에서 테이블 상태 로드 및 실시간 감지
const loadTableState = (userId) => {
    const docRef = getTableDocRef(userId);

    onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            applyLoadedState(data);
        } else if (!initialLoadDone) {
            // 문서가 없으면 초기 상태를 저장
            saveTableState(); 
        }
        initialLoadDone = true; // 최초 로드 완료 플래그 설정
    }, (error) => console.error("Error listening to state changes:", error));
};

// Firebase 인증 초기화 및 상태 변경 감지
const initAuth = async () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUserId = user.uid;
        } else {
            try {
                // 사용자가 없으면 익명 로그인 시도
                await signInAnonymously(auth);
                currentUserId = auth.currentUser.uid;
            } catch (error) {
                console.error("Anonymous sign-in failed.", error);
                return;
            }
        }
        
        // 인증 준비 완료 (최초 1회만 실행)
        if (currentUserId && !isAuthReady) {
            isAuthReady = true;
            console.log("Firebase Auth ready. User ID:", currentUserId);
            loadTableState(currentUserId); // 인증 완료 후 데이터 로드 시작
        }
    });
};

// --- UI 로직: 드래그 선택 및 스타일 적용 ---

const getCellCoordinates = (cell) => {
    const rowIndex = cell.closest('tr').rowIndex;
    const cellIndex = cell.cellIndex;
    return { rowIndex, cellIndex };
};

const clearSelection = () => {
    document.querySelectorAll('.data-table td.selected').forEach(cell => {
        cell.classList.remove('selected');
    });
    selectionBox.style.display = 'none';
    // reset selectionBox sizing
    selectionBox.style.width = '0px';
    selectionBox.style.height = '0px';
};

// --- helper: wrap-relative coordinates for selectionBox (accounts for scroll) ---
const getWrapRect = () => wrap.getBoundingClientRect();

const clientToWrapCoords = (clientX, clientY) => {
    const wrapRect = getWrapRect();
    // include wrap's scroll offsets to handle inner scroll
    const x = clientX - wrapRect.left + wrap.scrollLeft;
    const y = clientY - wrapRect.top + wrap.scrollTop;
    return { x, y };
};

// update visual selection box (given two cells or given client points)
const updateSelectionBoxVisual = (cellA, cellB) => {
    // If both are cells, compute bounding rect from their DOM rects
    const wrapRect = getWrapRect();
    const rectA = cellA.getBoundingClientRect();
    const rectB = cellB.getBoundingClientRect();

    const leftClient = Math.min(rectA.left, rectB.left);
    const topClient = Math.min(rectA.top, rectB.top);
    const rightClient = Math.max(rectA.right, rectB.right);
    const bottomClient = Math.max(rectA.bottom, rectB.bottom);

    const start = clientToWrapCoords(leftClient, topClient);
    const end = clientToWrapCoords(rightClient, bottomClient);

    const x1 = start.x;
    const y1 = start.y;
    const x2 = end.x;
    const y2 = end.y;

    selectionBox.style.display = 'block';
    selectionBox.style.left = `${x1}px`;
    selectionBox.style.top = `${y1}px`;
    selectionBox.style.width = `${Math.max(1, x2 - x1)}px`;
    selectionBox.style.height = `${Math.max(1, y2 - y1)}px`;
};

// select cells by startCell and endCell indices; if preserveExisting true, keep previously selected
const selectCellsInDragArea = (cellA, cellB, preserveExisting = false) => {
    if (!preserveExisting) {
        // unselect only table cells (not all other UI)
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
            if (cell) {
                cell.classList.add('selected');
            }
        }
    }
};

// 드래그 시작
const handleDragStart = (e) => {
    // 왼쪽 클릭만 처리
    if (e.button !== 0) return;

    // 설정 패널이나 입력 필드 클릭 시 드래그 방지
    if (e.target.closest('.setting-panel') || e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') {
        return;
    }

    const cell = e.target.closest('td');
    if (!cell) return;

    // 편집 가능한 셀 클릭 시: Ctrl/Meta 키가 없으면 텍스트 편집으로 간주 (따로 처리)
    if (cell.isContentEditable && !e.ctrlKey && !e.metaKey) {
         startCell = cell;
         // listen for small movement to determine drag vs click-edit
         document.addEventListener('mousemove', handleDraggingCheck);
         document.addEventListener('mouseup', handleDragEndCleanup);
         return;
    }

    e.preventDefault(); // 기본 텍스트 선택 방지

    // record client start for potential raw coord updates
    dragStartClient = { x: e.clientX, y: e.clientY };

    // If shift is pressed, preserve existing selections; otherwise clear
    const preserve = !!e.shiftKey;
    if (!preserve) {
        clearSelection();
    }

    startCell = cell;
    endCell = cell;
    isDragging = true;

    // show selection box around the single start cell initially
    updateSelectionBoxVisual(startCell, startCell);

    // attach dragging/up listeners
    document.addEventListener('mousemove', handleDragging);
    document.addEventListener('mouseup', handleDragEnd);
};

// 마우스 움직임 감지하여 드래그 시작 여부 결정 (for contenteditable click -> potential drag)
const handleDraggingCheck = (e) => {
    if (!startCell) return;
    if (Math.abs(e.movementX) > 2 || Math.abs(e.movementY) > 2) {
        // user moved enough -> treat as drag
        isDragging = true;
        document.removeEventListener('mousemove', handleDraggingCheck);
        document.removeEventListener('mouseup', handleDragEndCleanup);

        window.getSelection()?.removeAllRanges(); // 기존 텍스트 선택 해제

        // start drag selection preserving previous selection? treat as no-shift here
        const preserve = false;
        if (!preserve) clearSelection();

        endCell = startCell;
        updateSelectionBoxVisual(startCell, startCell);
        document.addEventListener('mousemove', handleDragging);
        document.addEventListener('mouseup', handleDragEnd);
    }
};

// 클릭만 하고 끝났을 때 정리 (드래그로 이어지지 않은 단순 클릭)
const handleDragEndCleanup = () => {
     document.removeEventListener('mousemove', handleDraggingCheck);
     document.removeEventListener('mouseup', handleDragEndCleanup);
     startCell = null;
}

// 드래그 중
const handleDragging = (e) => {
    if (!isDragging) return;
    e.preventDefault(); // 기본 텍스트 선택 방지

    const cellUnderMouse = e.target.closest('td');
    if (cellUnderMouse && cellUnderMouse !== endCell) {
        endCell = cellUnderMouse;
        // preserveExisting true only if user held Shift at the start of drag
        // We'll infer preservation by checking if any selected cells existed before drag start.
        // A more explicit approach would store a flag at handleDragStart time.
        const preserve = !!(e.shiftKey || document.querySelectorAll('.data-table td.selected').length > 0);
        selectCellsInDragArea(startCell, endCell, preserve);
        updateSelectionBoxVisual(startCell, endCell);
    } else {
        // If pointer moved fast but not over a td (e.g. between cells), compute bounding box from client positions
        // and visually update selection box without changing selection until pointer is over a cell.
        const wrapRect = getWrapRect();
        const startWrap = clientToWrapCoords(dragStartClient.x, dragStartClient.y);
        const currentWrap = clientToWrapCoords(e.clientX, e.clientY);

        const x1 = Math.min(startWrap.x, currentWrap.x);
        const y1 = Math.min(startWrap.y, currentWrap.y);
        const x2 = Math.max(startWrap.x, currentWrap.x);
        const y2 = Math.max(startWrap.y, currentWrap.y);

        selectionBox.style.display = 'block';
        selectionBox.style.left = `${x1}px`;
        selectionBox.style.top = `${y1}px`;
        selectionBox.style.width = `${Math.max(1, x2 - x1)}px`;
        selectionBox.style.height = `${Math.max(1, y2 - y1)}px`;
    }
};

// 드래그 종료
const handleDragEnd = (e) => {
    if (!isDragging) return;
    isDragging = false;

    // if endCell exists, finalize selection (ensure selection covers area)
    if (startCell && endCell) {
        const preserve = !!(e.shiftKey || document.querySelectorAll('.data-table td.selected').length > 0);
        selectCellsInDragArea(startCell, endCell, preserve);
    }

    // hide selectionBox (keep selected classes on cells)
    selectionBox.style.display = 'none';
    selectionBox.style.width = '0px';
    selectionBox.style.height = '0px';

    // cleanup
    startCell = null;
    endCell = null;
    document.removeEventListener('mousemove', handleDragging);
    document.removeEventListener('mouseup', handleDragEnd);
};

// --- 기타: 단일 클릭으로 선택/편집 동작 처리 (원하면 수정 가능) ---
// 단일 클릭 시 선택 토글: Ctrl/Meta 클릭하면 토글, 아니면 단일 선택
table.addEventListener('click', (e) => {
    const cell = e.target.closest('td');
    if (!cell) return;

    // 클릭이 드래그 도중이거나 드래그 직후였으면 무시
    if (isDragging) return;

    // If user clicked into an editable cell and didn't hold ctrl/meta, allow editing (do not toggle)
    if (cell.isContentEditable && !e.ctrlKey && !e.metaKey) {
        // focus caret into the cell for immediate editing
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
        // toggle selection
        cell.classList.toggle('selected');
    } else if (e.shiftKey) {
        // Shift click: extend from last selected cell if exists, otherwise behave like normal click
        const lastSelected = document.querySelector('.data-table td.selected');
        if (lastSelected) {
            selectCellsInDragArea(lastSelected, cell, true);
        } else {
            clearSelection();
            cell.classList.add('selected');
        }
    } else {
        // single click without modifiers: clear and select this cell
        clearSelection();
        cell.classList.add('selected');
    }
});

// Prevent native drag of content to keep behavior consistent
document.addEventListener('dragstart', (e) => e.preventDefault());

// Attach mousedown to table to start our selection flow
table.addEventListener('mousedown', handleDragStart);

// initialize Firebase auth
initAuth();

// Expose save function to window for debugging if needed
window.saveTableState = saveTableState;
