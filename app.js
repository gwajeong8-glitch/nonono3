// app.js
import { db, getTableDocRef, getCurrentUserId, getIsAuthReady } from './firebase-config.js';
import { onSnapshot, setDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// --- 상수 및 DOM 요소 참조 ---
const COLOR_PALETTE = [
    '#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#00FFFF', '#FF00FF',
    '#FFA500', '#800080', '#008000', '#808000', '#000080', '#800000', '#C0C0C0', '#808080',
    '#FF4500', '#ADFF2F', '#1E90FF', '#FFD700', '#20B2AA', '#E9967A', '#9400D3', '#FF69B4',
    '#A0522D', '#D2B48C', '#87CEEB', '#F08080', '#4682B4', '#DA70D6', '#B0C4DE', '#F4A460',
    '#5F9EA0', '#DDA0DD', '#7FFF00', '#6495ED', '#DC143C', '#FF8C00', '#9ACD32', '#40E0D0'
];

const table = document.querySelector('.data-table');
const colorPaletteContainer = document.getElementById('colorPaletteContainer');
const applyFontSizeBtn = document.getElementById('applyFontSizeBtn');
const fontSizeInput = document.getElementById('fontSizeInput');
const downloadButton = document.getElementById('downloadBtn');
const selectionBox = document.getElementById('selectionBox');

// --- 드래그 선택 관련 변수 ---
let isDragging = false;
let startCell = null;
let endCell = null;

// --- 데이터 로드 상태 플래그 ---
let initialLoadDone = false; // 최초 데이터 로드 여부 플래그

// --- 헬퍼 함수: 테이블 상태 저장 ---
const saveTableState = async () => {
    const userId = getCurrentUserId();
    const authReady = getIsAuthReady();

    if (!userId || !authReady) {
        console.warn("Cannot save state: Auth not ready or user ID is null.");
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
        await setDoc(getTableDocRef(userId), tableState, { merge: true });
        // console.log("Table state saved successfully.");
    } catch (e) {
        console.error("Error saving table state: ", e);
    }
};

// --- 헬퍼 함수: 로드된 상태 적용 ---
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
            applyRowHeight(key, value);
        }
    }
    clearSelection();
};

// --- 헬퍼 함수: 테이블 상태 로드 및 실시간 감지 ---
const loadTableState = (userId) => {
    const docRef = getTableDocRef(userId);

    onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            applyLoadedState(data);
        } else if (!initialLoadDone) {
            saveTableState(); // 최초 로드 시 데이터가 없으면 초기 상태 저장
        }
        initialLoadDone = true;
    }, (error) => console.error("Error listening to state changes:", error));
};

// --- UI 로직: 드래그 선택 ---
const handleDragStart = (e) => {
    if (e.target.closest('.setting-panel')) { // 설정 패널 클릭 시 드래그 방지
        return;
    }
    
    const cell = e.target.closest('td');
    if (!cell) return;

    if (cell.isContentEditable && !e.ctrlKey && !e.metaKey) {
         startCell = cell;
         document.addEventListener('mousemove', handleDraggingCheck);
         document.addEventListener('mouseup', handleDragEndCleanup);
         return;
    }

    e.preventDefault();
    startDragSelection(cell, e.shiftKey);
};

const handleDraggingCheck = (e) => {
    isDragging = true;
    document.removeEventListener('mousemove', handleDraggingCheck);
    document.removeEventListener('mouseup', handleDragEndCleanup);
    
    window.getSelection()?.removeAllRanges();
    
    startDragSelection(startCell, false);
    handleDragging(e);
};

const handleDragEndCleanup = () => {
     document.removeEventListener('mousemove', handleDraggingCheck);
     document.removeEventListener('mouseup', handleDragEndCleanup);
     startCell = null;
}

const startDragSelection = (cell, isShiftPressed) => {
    isDragging = true;
    startCell = cell;

    if (!isShiftPressed) {
        clearSelection();
    }
