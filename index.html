<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>노블레스 데이터 현황 (드래그 편집 최종)</title>
    
    <!-- Tailwind CSS for utility classes (used minimally, main styling is custom) -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- html2canvas Library for PNG download -->
    <script src="https://html2canvas.hertzen.com/dist/html2canvas.min.js"></script>
    
    <style>
        /* Base Styling */
        body {
            font-family: 'Inter', 'Noto Sans KR', sans-serif;
            background-color: #1a1a1a;
            color: #ddd;
            margin: 0;
            padding: 0;
            display: flex;
            min-height: 100vh;
        }

        .wrap {
            flex-grow: 1;
            padding: 20px 20px 20px 180px; /* Space for left menu */
            position: relative;
            max-width: calc(100vw - 320px); /* 180px left menu + 300px settings panel + padding */
            overflow: auto;
        }
        
        /* Setting Panel Styling */
        .setting-panel {
            position: fixed;
            top: 0;
            right: 0;
            width: 300px;
            height: 100vh;
            background-color: #2c2c2c;
            padding: 15px;
            box-shadow: -3px 0 10px rgba(0, 0, 0, 0.5);
            overflow-y: auto;
            z-index: 100;
        }

        .setting-panel h3 {
            font-size: 1.1em;
            color: #ffdd66;
            margin-top: 15px;
            margin-bottom: 10px;
        }
        
        .color-target-control label {
            margin-right: 15px;
            cursor: pointer;
            font-size: 0.9em;
        }

        .color-palette {
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
            padding: 5px 0;
            border: 1px solid #444;
            border-radius: 5px;
            background-color: #333;
        }

        .color-swatch {
            width: 20px;
            height: 20px;
            border: 1px solid #555;
            cursor: pointer;
            border-radius: 3px;
            transition: transform 0.1s;
        }

        .color-swatch:hover {
            transform: scale(1.1);
            border-color: #ffdd66;
        }

        .download-button {
            width: 100%;
            margin-top: 20px;
            padding: 10px;
            background-color: #4CAF50;
            color: white;
            border: none;
            border-radius: 5px;
            font-weight: bold;
            cursor: pointer;
            transition: background-color 0.2s;
        }

        .download-button:hover {
            background-color: #45a049;
        }

        /* Menu Styling */
        .top-sub-menu {
            display: flex;
            margin-bottom: 20px;
            border-bottom: 2px solid #555;
            padding-bottom: 10px;
        }

        .menu {
            margin-right: 20px;
            font-size: 0.9em;
            color: #aaa;
            cursor: pointer;
            transition: color 0.2s;
        }

        .menu:hover {
            color: #fff;
        }

        .left-menu {
            position: fixed;
            top: 0;
            left: 0;
            width: 160px;
            height: 100vh;
            background-color: #222;
            padding: 20px 0;
            box-shadow: 3px 0 10px rgba(0, 0, 0, 0.5);
        }

        .left-item {
            padding: 8px 15px;
            font-size: 0.9em;
            color: #bbb;
            cursor: pointer;
            transition: background-color 0.1s;
            border-left: 3px solid transparent;
        }

        .left-item.active, .left-item:hover {
            background-color: #333;
            border-left-color: #ffdd66;
            color: #fff;
        }

        /* Table Styling */
        .data-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
            table-layout: fixed; /* Ensures column resizing works consistently */
        }

        .data-table td {
            border: 1px solid #444;
            padding: 5px 8px;
            text-align: center;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            position: relative; /* For resizers */
            line-height: 1; /* For consistent row height application */
            height: 15px; /* Base height for data rows */
            box-sizing: border-box;
            transition: background-color 0.1s, border-color 0.1s;
        }

        /* Row Group Styles */
        .top-notice-row td {
            background-color: #581616;
            color: #ffe6e6;
            font-weight: bold;
            text-align: left;
            padding: 8px 12px;
            height: 25px;
        }
        .top-notice-mark {
            color: #ffdd66;
            margin-right: 8px;
        }

        .top-data-header td, .bottom-data-header td {
            background-color: #444;
            color: #fff;
            font-weight: bold;
            height: 30px;
            min-width: 80px;
        }

        .middle-notice-row td {
            background-color: #3a3a3a;
            color: #ffb3b3;
            text-align: left;
            font-size: 0.9em;
            line-height: 1.4;
            height: 50px;
        }

        .bottom-data-row td {
            background-color: #333;
            color: #ddd;
        }
        
        /* Editable Content Styling */
        .data-table td[contenteditable="true"] {
            outline: none;
        }
        
        /* Selection Box (for drag) */
        #selectionBox {
            position: absolute;
            border: 1px dashed #FFD700;
            background-color: rgba(255, 215, 0, 0.1);
            pointer-events: none; /* Allows mouse events to pass through to the table */
            z-index: 10;
            display: none;
        }

        /* Selected Cell Styling */
        .data-table td.selected {
            border: 2px solid #ffdd66;
            box-shadow: 0 0 5px rgba(255, 221, 102, 0.5);
        }

        /* Resizer Styling */
        .col-resizer {
            position: absolute;
            right: -4px;
            top: 0;
            width: 8px;
            height: 100%;
            cursor: col-resize;
            z-index: 20;
        }

        .row-resizer {
            position: absolute;
            bottom: -4px;
            right: 0;
            width: 100%;
            height: 8px;
            cursor: row-resize;
            z-index: 20;
        }

        .resizer-display {
            position: fixed;
            padding: 5px 10px;
            background: rgba(0, 0, 0, 0.8);
            color: #ffdd66;
            border-radius: 4px;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.2s;
            z-index: 101;
            font-size: 0.8em;
            white-space: nowrap;
        }
    </style>
</head>
<body>

<div class="setting-panel" id="settingPanel">
    
    <div style="color: #ffdd66; margin-top: 5px; margin-bottom: 10px;">
        **셀 드래그 선택** 후 색상/크기 설정으로 변경하세요.
    </div>
    
    <div class="color-target-control">
        <label><input type="radio" name="colorTarget" value="text" checked> 글자색 적용</label>
        <label><input type="radio" name="colorTarget" value="background"> 배경색 적용</label>
    </div>
    
    <div class="color-control">
        <h3>🎨 색상 팔레트 선택 (40색)</h3>
        <div class="color-palette">
        </div>
    </div>
    
    <div style="margin-top: 10px; padding-top: 5px; border-top: 1px solid #333;">
        <label for="fontSizeInput">글꼴 크기 (px): </label>
        <input type="number" id="fontSizeInput" min="8" max="48" value="14" style="width: 50px; margin-left: 5px; color: black;">
        <button id="applyFontSizeBtn" style="margin-left: 5px; padding: 3px 8px; background: #555; color: white; border: none; border-radius: 3px; cursor: pointer;">적용</button>
    </div>
    
    <div style="margin-top: 10px; padding-top: 5px; border-top: 1px solid #333;">
        <h3>📐 그룹별 행 높이 (px)</h3>
        
        <label for="topRowHeightInput" style="display: block; margin-top: 5px;">상단 데이터 행 높이:</label>
        <input type="number" id="topRowHeightInput" min="10" max="60" value="15" style="width: 50px; color: black;">
        <button id="applyTopRowHeightBtn" class="height-apply-btn" data-target="top-data" style="margin-left: 5px;">적용</button>

        <label for="middleNoticeRowHeightInput" style="display: block; margin-top: 5px;">중단 공지/제목 행 높이:</label>
        <input type="number" id="middleNoticeRowHeightInput" min="20" max="100" value="30" style="width: 50px; color: black;">
        <button id="applyMiddleNoticeRowHeightBtn" class="height-apply-btn" data-target="middle-notice" style="margin-left: 5px;">적용</button>

        <label for="bottomRowHeightInput" style="display: block; margin-top: 5px;">하단 데이터 행 높이:</label>
        <input type="number" id="bottomRowHeightInput" min="10" max="60" value="15" style="width: 50px; color: black;">
        <button id="applyBottomRowHeightBtn" class="height-apply-btn" data-target="bottom-data" style="margin-left: 5px;">적용</button>
    </div>
    <button class="download-button">
        🖼️ 테이블 영역 이미지 다운로드 (PNG)
    </button>
</div>

<div class="wrap">
    <!-- Selection Box will be inserted here by JavaScript -->
    <div id="selectionBox"></div>

    <div class="top-sub-menu">
        <div class="menu">블레스 전국 프레스티지 서비스</div>
        <div class="menu">VIP 회원 전용 통합 매니지먼트</div>
        <div class="menu">노블레스 회원 전용룸</div>
    </div>
    
    <div class="left-menu">
        <div class="left-item active">메인 화면</div>
        <div class="left-item">[매칭/고객 상태]</div>
        <div class="left-item">주문 상태</div>
        <div class="left-item">인증 상태</div>
        <div class="left-item">[상담/문의]</div>
        <div class="left-item">직무 문의</div>
        <div class="left-item">전국 만남</div>
        <div class="left-item">[관리/데이터]</div>
        <div class="left-item">실시간 데이터</div>
        <div class="left-item">실시간 오류</div>
        <div class="left-item">데이터 분석</div>
        <div class="left-item">포인트 조회</div>
        <div class="left-item">유흥 관리</div>
        <div class="left-item">회원 관리</div>
        <div class="left-item">회원 승인</div>
        <div class="left-item">회원 탈퇴</div>
        <div class="left-item">담당 실장</div>
    </div>

    <table class="data-table" id="capture-area">
        <tbody>
            <tr class="top-notice-row">
                <td colspan="5" contenteditable="true"> 
                    <span class="top-notice-mark">DAMAGE!</span> 주의사항 4단계에서 일치 파트너십으로 통합된 유형만을 선택하여 공유 임무를 완료하며 함께 할때의 금일 결제 금액 후 공동 이익을 마감해야 합니다!
                </td>
            </tr>
            
            <tr class="top-data-header">
                <td contenteditable="true">회원ID</td>
                <td contenteditable="true">주문상태</td>
                <td contenteditable="true">인증상태</td> 
                <td contenteditable="true">활성화 코드</td> 
                <td contenteditable="true">승인된 암호 코드</td> 
            </tr>
            
            <tr class="top-data-row">
                <td contenteditable="true">jkgov1203</td>
                <td contenteditable="true">발송 완료</td>
                <td contenteditable="true">승인 완료</td>
                <td contenteditable="true">NSACT2032897</td>
                <td contenteditable="true">NBS001001001</td> 
            </tr>
            <tr class="top-data-row">
                <td contenteditable="true">sxcv4752</td>
                <td contenteditable="true">검수 대기</td>
                <td contenteditable="true">미승인</td>
                <td contenteditable="true">NSACT2032898</td>
                <td contenteditable="true">NBS001001002</td> 
            </tr>
            <tr class="top-data-row">
                <td contenteditable="true">qwerty24689</td>
                <td contenteditable="true">진행 중</td>
                <td contenteditable="true">승인 완료</td>
                <td contenteditable="true">NSACT2032899</td>
                <td contenteditable="true">NBS001001003</td> 
            </tr>
            <tr class="top-data-row">
                <td contenteditable="true">xsgf1575</td>
                <td contenteditable="true">발송 오류</td>
                <td contenteditable="true">비활성화</td>
                <td contenteditable="true">NSACT2032891</td>
                <td contenteditable="true">NBS001001004</td> 
            </tr>
            
            <tr class="middle-notice-row">
                <td colspan="5" contenteditable="true"> 
                    1. 위 공동구매 회원들이 클리어 데이터를 지시에 따라 진행하지 못하여 실패로 인해 회원가입 및 계정 비활성화되어 출금불가 <br>
                    2. 상호협력의 발전목적을 실천하기 위해 공식적으로 1~2회 연속 클리어수정을 특별히 승인하였으며, 수정주문은 만장일치로 합의되어야 합니다.<br>
                    3. 수정주문은 계좌와 계좌 이상 데이터 복구 후 출금 코드를 매니저 갱신을 완료해야 출금가능하며 데이터 완료 이전에는 현금 출금이 불가능합니다<br>
                    4.정산시스템에서 승인할 수 없어 출금할수 없게 되었습니다. 데이터 완료 이전에는 현금 출금이 불가능합니다.<br>
                    (예: 부활 포기한 계정의 경우 포인트출금 불가)
                </td>
            </tr>

            <tr class="bottom-data-header">
                <td class="w-20" contenteditable="true">주문유형</td>
                <td class="w-20" contenteditable="true">주문상세</td>
                <td contenteditable="true">투자금액 (원)</td>
                <td contenteditable="true">원금+수익금액</td>
                <td contenteditable="true">보장비율</td>
            </tr>

            <tr class="bottom-data-row">
                <td contenteditable="true">A</td>
                <td contenteditable="true">[2종택1]</td>
                <td contenteditable="true" class="red-text">1,500,000</td>
                <td contenteditable="true">1,650,000</td>
                <td contenteditable="true" class="red-text">0%</td>
            </tr>
            <tr class="bottom-data-row">
                <td contenteditable="true">B</td>
                <td contenteditable="true">[2종택1]</td>
                <td contenteditable="true">2,500,000</td>
                <td contenteditable="true">2,750,000</td>
                <td contenteditable="true">100%</td>
            </tr>
            <tr class="bottom-data-row">
                <td contenteditable="true">C</td>
                <td contenteditable="true">[2종택1]</td>
                <td contenteditable="true">0</td>
                <td contenteditable="true">0</td>
                <td contenteditable="true" class="red-text">0%</td>
            </tr>
            <tr class="bottom-data-row">
                <td contenteditable="true">D</td>
                <td contenteditable="true">[2종택1]</td>
                <td contenteditable="true">0</td>
                <td contenteditable="true">0</td>
                <td contenteditable="true" class="red-text">0%</td>
            </tr>

        </tbody>
    </table>
</div>

<div class="resizer-display" id="resizerDisplay"></div>

<script type="module">
// Firebase Imports (Canvas 환경 전역 변수 사용)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { setLogLevel } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// --- Global Variables and Firebase Setup ---
const TABLE_DOC_ID = 'main_table_state';
const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

let currentUserId = null;
let isAuthReady = false;

// Color Palette for user selection (40 colors)
const COLOR_PALETTE = [
    '#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#00FFFF', '#FF00FF',
    '#FFA500', '#800080', '#008000', '#808000', '#000080', '#800000', '#C0C0C0', '#808080',
    '#FF4500', '#ADFF2F', '#1E90FF', '#FFD700', '#20B2AA', '#E9967A', '#9400D3', '#FF69B4',
    '#A0522D', '#D2B48C', '#87CEEB', '#F08080', '#4682B4', '#DA70D6', '#B0C4DE', '#F4A460',
    '#5F9EA0', '#DDA0DD', '#7FFF00', '#6495ED', '#DC143C', '#FF8C00', '#9ACD32', '#40E0D0'
];

// Element References
const table = document.querySelector('.data-table');
const colorPalette = document.querySelector('.color-palette');
const applyFontSizeBtn = document.getElementById('applyFontSizeBtn');
const fontSizeInput = document.getElementById('fontSizeInput');
const downloadButton = document.querySelector('.download-button');
const resizerDisplay = document.getElementById('resizerDisplay');
const selectionBox = document.getElementById('selectionBox'); // Get the newly added selection box

// --- Drag Selection Variables ---
let isDragging = false;
let startCell = null; // Drag start cell
let endCell = null;   // Drag end cell
let isResizing = false; // Flag to prevent drag selection during resizing

// --- 1. Firebase Authentication & Data Path Setup ---

/**
 * 사용자 ID에 따라 Firestore 문서 참조를 생성합니다.
 * @param {string} userId 현재 인증된 사용자 ID
 * @returns {import("firebase/firestore").DocumentReference}
 */
const getTableDocRef = (userId) => {
    // Private data path: /artifacts/{appId}/users/{userId}/table_data/{TABLE_DOC_ID}
    return doc(db, 'artifacts', appId, 'users', userId, 'table_data', TABLE_DOC_ID);
};

// Sign in with custom token or anonymously
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUserId = user.uid;
    } else {
        // Fallback to sign in anonymously if custom token fails or is undefined
        try {
            await signInAnonymously(auth);
            currentUserId = auth.currentUser.uid;
        } catch (error) {
            console.error("Anonymous sign-in failed:", error);
            return; // Stop if sign-in fails
        }
    }
    isAuthReady = true;
    
    // Only proceed after authentication is ready AND userId is set
    if (currentUserId) {
        setLogLevel('Debug');
        setupTableEventListeners();
        setupControlListeners();
        loadTableState(currentUserId);
    }
});

// Initial authentication attempt if token is present
if (typeof __initial_auth_token !== 'undefined') {
    signInWithCustomToken(auth, __initial_auth_token)
        .catch(error => {
            console.error("Custom token sign-in failed, waiting for onAuthStateChanged to handle anonymous fallback.", error);
        });
} else {
    // If no custom token, onAuthStateChanged will handle the anonymous sign-in
}

// --- 2. State Management (Save/Load) ---

let initialLoadDone = false;

/**
 * 테이블의 현재 상태(텍스트, 스타일, 크기)를 Firestore에 저장합니다.
 * @param {string} userId 
 */
const saveTableState = async (userId) => {
    // CRITICAL FIX: Ensure user ID is set and auth is ready before saving
    if (!userId || !isAuthReady) {
        console.warn("Attempted to save state before auth was ready.");
        return;
    }

    const cellStates = {};
    const colWidths = {};
    const rowHeights = {};
    
    // 1. Save Cell Contents and Styles
    const rows = table.querySelectorAll('tr');
    rows.forEach((row, rIndex) => {
        row.querySelectorAll('td').forEach((cell, cIndex) => {
            const cellId = `r${rIndex}c${cIndex}`;
            cellStates[cellId] = {
                text: cell.textContent.trim(),
                color: cell.style.color || '',
                bg: cell.style.backgroundColor || '',
                fontSize: cell.style.fontSize || '',
            };
            // Only capture width from the header row for consistency
            if (rIndex === 1 && cell.style.width) { 
                 colWidths[`c${cIndex}`] = cell.style.width;
            }
        });
    });

    // 2. Save Row Group Heights
    document.querySelectorAll('.height-apply-btn').forEach(button => {
        const target = button.dataset.target;
        // Correctly target the input ID based on the data-target
        let inputId = `${target.replace('-data', 'RowHeightInput')}`;
        if (target === 'middle-notice') {
            inputId = 'middleNoticeRowHeightInput';
        }

        const input = document.getElementById(inputId);
        if (input) {
            rowHeights[target] = input.value;
        }
    });

    const tableState = {
        cells: cellStates,
        rowHeights: rowHeights,
        colWidths: colWidths,
        timestamp: new Date()
    };
    
    try {
        await setDoc(getTableDocRef(userId), tableState, { merge: true });
    } catch (e) {
        console.error("Error saving table state: ", e);
    }
};

/**
 * Firestore에서 테이블 상태를 로드하고 UI에 적용합니다.
 * @param {string} userId 
 */
const loadTableState = (userId) => {
    // CRITICAL FIX: Ensure user ID is set and auth is ready before loading
    if (!userId || !isAuthReady) {
        console.warn("Attempted to load state before auth was ready. Aborting load.");
        return;
    }

    const docRef = getTableDocRef(userId);

    onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            applyLoadedState(data);
        } else if (!initialLoadDone) {
            // First time load, save initial state if no data exists
            saveTableState(userId); 
        }
        initialLoadDone = true;
    }, (error) => {
        // This is the error handler catching the permission denied issue
        console.error("Error listening to state changes:", error);
    });
};

/**
 * 로드된 데이터를 UI에 적용하는 실제 함수
 * @param {Object} data 
 */
const applyLoadedState = (data) => {
    if (data.cells) {
        const rows = table.querySelectorAll('tr');
        rows.forEach((row, rIndex) => {
            row.querySelectorAll('td').forEach((cell, cIndex) => {
                const cellId = `r${rIndex}c${cIndex}`;
                const state = data.cells[cellId];
                if (state) {
                    // Apply text content
                    if (cell.textContent.trim() !== state.text) {
                        cell.textContent = state.text;
                    }
                    // Apply styles
                    cell.style.color = state.color || '';
                    cell.style.backgroundColor = state.bg || '';
                    cell.style.fontSize = state.fontSize || '';
                }
            });
        });
    }

    // Apply column widths
    if (data.colWidths) {
        const headerRow = table.querySelector('.top-data-header');
        if (headerRow) {
             headerRow.querySelectorAll('td').forEach((cell, cIndex) => {
                const colWidth = data.colWidths[`c${cIndex}`];
                if (colWidth) {
                    // Apply width to all cells in this column (for display consistency)
                    table.querySelectorAll('tr').forEach(row => {
                         if(row.cells[cIndex]) {
                             row.cells[cIndex].style.width = colWidth;
                         }
                    });
                }
            });
        }
    }

    // Apply row group heights
    if (data.rowHeights) {
        for (const [key, value] of Object.entries(data.rowHeights)) {
            let inputId = `${key.replace('-data', 'RowHeightInput')}`;
            if (key === 'middle-notice') {
                inputId = 'middleNoticeRowHeightInput';
            }
            const input = document.getElementById(inputId);
            if (input) {
                input.value = value;
            }
            applyRowHeight(key, value);
        }
    }
    // Clear selection after loading
    document.querySelectorAll('.data-table td.selected').forEach(c => c.classList.remove('selected'));
};

// --- 3. Cell Interaction Logic (Drag Selection) ---

/**
 * 드래그 시작 이벤트 핸들러
 */
const handleDragStart = (e) => {
    // Check if click originated from resizer or setting panel
    if (e.target.closest('.col-resizer') || e.target.closest('.row-resizer') || isResizing || e.target.closest('.setting-panel')) {
        return;
    }
    // Allow text editing/selection drag if clicking inside a cell's current text selection
    if (e.target.tagName === 'TD' && e.target.getAttribute('contenteditable') === 'true' && window.getSelection().toString().length > 0) {
        return;
    }

    startCell = e.target.closest('td');
    if (!startCell) return;

    e.preventDefault(); // Prevent default browser drag behavior (e.g., image ghosting)
    isDragging = true;

    // Clear previous selection unless Shift key is pressed
    if (!e.shiftKey) {
        document.querySelectorAll('.data-table td.selected').forEach(cell => cell.classList.remove('selected'));
    }

    // Show and position selectionBox
    selectionBox.style.display = 'block';
    updateSelectionBoxVisual(startCell, startCell);

    document.addEventListener('mousemove', handleDragging);
    document.addEventListener('mouseup', handleDragEnd);
};

/**
 * 드래그 중 이벤트 핸들러
 */
const handleDragging = (e) => {
    if (!isDragging) return;

    const cellUnderMouse = e.target.closest('td');
    if (cellUnderMouse) {
        endCell = cellUnderMouse;
        selectCellsInDragArea(startCell, endCell, e.shiftKey);
        updateSelectionBoxVisual(startCell, endCell);
    }
};

/**
 * 드래그 종료 이벤트 핸들러
 */
const handleDragEnd = () => {
    if (!isDragging) return;

    isDragging = false;
    startCell = null;
    endCell = null;
    selectionBox.style.display = 'none'; // Hide selection box

    document.removeEventListener('mousemove', handleDragging);
    document.removeEventListener('mouseup', handleDragEnd);
    // State is saved only when style is applied, not just on selection.
};

/**
 * 주어진 두 셀을 포함하는 직사각형 영역 내의 모든 셀에 'selected' 클래스를 적용합니다.
 */
const selectCellsInDragArea = (startCell, endCell) => {
    if (!startCell || !endCell) return;

    const allRows = Array.from(table.querySelectorAll('tr'));
    
    const getCellIndices = (cell) => {
        const row = cell.parentElement;
        const rowIndex = allRows.indexOf(row);
        const cellIndex = Array.from(row.children).indexOf(cell);
        return { rowIndex, cellIndex };
    };

    const start = getCellIndices(startCell);
    const end = getCellIndices(endCell);

    if (start.rowIndex === -1 || end.rowIndex === -1) return;

    const minRow = Math.min(start.rowIndex, end.rowIndex);
    const maxRow = Math.max(start.rowIndex, end.rowIndex);
    const minCol = Math.min(start.cellIndex, end.cellIndex);
    const maxCol = Math.max(start.cellIndex, end.cellIndex);

    // Get current selection state for shift key behavior
    const currentSelection = new Set(Array.from(table.querySelectorAll('td.selected')));
    const selectionToToggle = new Set();
    
    // Clear current selection (only cells not selected will be marked for selection)
    table.querySelectorAll('td.selected').forEach(c => c.classList.remove('selected'));

    allRows.forEach((row, rIndex) => {
        if (rIndex >= minRow && rIndex <= maxRow) {
            Array.from(row.children).forEach((cell, cIndex) => {
                if (cIndex >= minCol && cIndex <= maxCol) {
                    if (cell.tagName === 'TD') {
                         cell.classList.add('selected');
                    }
                }
            });
        }
    });
};

/**
 * selectionBox의 위치와 크기를 업데이트합니다.
 */
const updateSelectionBoxVisual = (cell1, cell2) => {
    if (!selectionBox || !cell1 || !cell2) return;

    // Get table's position relative to the viewport
    const tableRect = table.getBoundingClientRect();

    // Get cell positions relative to the viewport
    const rect1 = cell1.getBoundingClientRect();
    const rect2 = cell2.getBoundingClientRect();

    // Calculate bounding box in viewport coordinates
    const left = Math.min(rect1.left, rect2.left);
    const top = Math.min(rect1.top, rect2.top);
    const right = Math.max(rect1.right, rect2.right);
    const bottom = Math.max(rect1.bottom, rect2.bottom);
    
    // Position selection box relative to the table's container (the .wrap div)
    // Assuming .wrap is the positioning context for the selectionBox
    selectionBox.style.left = (left - tableRect.left) + 'px';
    selectionBox.style.top = (top - tableRect.top) + 'px';
    selectionBox.style.width = (right - left) + 'px';
    selectionBox.style.height = (bottom - top) + 'px';
};

/**
 * 단일 셀 클릭 이벤트 핸들러 (Shift + 클릭으로 여러 개 선택 가능)
 */
const handleCellClick = (e) => {
    if (e.target.tagName === 'TD') {
        const cell = e.target;
        
        // Prevent selection if resizing is active
        if (isResizing) return;

        if (e.shiftKey) {
            // Shift + click: Toggle selection
            cell.classList.toggle('selected');
        } else {
            // Normal click: Clear existing selections and select this cell
            document.querySelectorAll('.data-table td.selected').forEach(c => c.classList.remove('selected'));
            cell.classList.add('selected');
        }
    }
    // State is saved when style is applied, not just on selection.
};


/**
 * 선택된 셀들에 스타일을 적용하고 Firestore에 저장합니다.
 * @param {string} property 적용할 CSS 속성 ('color' 또는 'backgroundColor' 또는 'fontSize')
 * @param {string} value 적용할 값
 */
const applyStyleToSelectedCells = (property, value) => {
    const selectedCells = document.querySelectorAll('.data-table td.selected');
    if (selectedCells.length === 0) {
        // Custom message box logic should replace alert()
        console.warn("No cells selected."); 
        return;
    }
    
    selectedCells.forEach(cell => {
        if (property === 'color') {
            cell.style.color = value;
        } else if (property === 'backgroundColor') {
            cell.style.backgroundColor = value;
        } else if (property === 'fontSize') {
            cell.style.fontSize = value;
        }
    });
    saveTableState(currentUserId);
};


// --- 4. Control Panel Setup ---

// Generate color palette swatches
COLOR_PALETTE.forEach(color => {
    const swatch = document.createElement('div');
    swatch.className = 'color-swatch';
    swatch.style.backgroundColor = color;
    swatch.dataset.color = color;
    colorPalette.appendChild(swatch);
});

// Event listener for color palette clicks
colorPalette.addEventListener('click', (e) => {
    const swatch = e.target.closest('.color-swatch');
    if (!swatch) return;

    const color = swatch.dataset.color;
    const target = document.querySelector('input[name="colorTarget"]:checked').value;
    
    if (target === 'text') {
        applyStyleToSelectedCells('color', color);
    } else {
        applyStyleToSelectedCells('backgroundColor', color);
    }
});

// Event listener for font size application
applyFontSizeBtn.addEventListener('click', () => {
    const selectedCells = document.querySelectorAll('.data-table td.selected');
    if (selectedCells.length === 0) {
        console.warn("No cells selected to change font size.");
        return;
    }

    const size = parseInt(fontSizeInput.value, 10);
    if (size >= 8 && size <= 48) {
        applyStyleToSelectedCells('fontSize', `${size}px`);
    } else {
        console.warn("Font size must be between 8px and 48px.");
    }
});

/**
 * 지정된 클래스의 모든 행에 높이를 적용하고 저장합니다.
 */
const applyRowHeight = (targetClassPrefix, height) => {
    let selector = '';
    if (targetClassPrefix === 'top-data') {
        selector = '.top-data-header, .top-data-row';
    } else if (targetClassPrefix === 'middle-notice') {
        selector = '.middle-notice-row';
    } else if (targetClassPrefix === 'bottom-data') {
        selector = '.bottom-data-header, .bottom-data-row';
    } else {
        console.warn(`Unknown targetClassPrefix: ${targetClassPrefix}`);
        return;
    }

    const rows = table.querySelectorAll(selector);

    rows.forEach(row => {
        // Apply height to all TDs in the row
        row.querySelectorAll('td').forEach(cell => {
            cell.style.height = `${height}px`;
            cell.style.paddingTop = '0px';
            cell.style.paddingBottom = '0px';
            cell.style.lineHeight = '1';
        });
        // Apply min-height to the row itself
        row.style.height = `${height}px`;
    });
};

// Event listener for row height buttons
document.querySelectorAll('.height-apply-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        const target = e.currentTarget.dataset.target; // e.g., 'top-data', 'middle-notice'
        // Build the correct input ID
        let inputId = `${target.replace('-data', 'RowHeightInput')}`;
        if (target === 'middle-notice') {
            inputId = 'middleNoticeRowHeightInput';
        }
        const input = document.getElementById(inputId);
        
        if (!input) {
            console.error(`Input element with ID '${inputId}' not found.`);
            return;
        }
        
        const height = parseInt(input.value, 10);
        
        if (height > 0) {
            applyRowHeight(target, height);
            saveTableState(currentUserId); // Save state after applying
        } else {
            console.warn("Invalid row height entered.");
        }
    });
});

// --- 5. Table Resizing Logic (Column and Row) ---

const makeResizable = (element, type) => {
    let startX, startY, startWidth, startHeight, targetCell, targetRow;

    const resizer = document.createElement('div');
    resizer.className = type === 'col' ? 'col-resizer' : 'row-resizer';
    element.appendChild(resizer);

    resizer.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation(); // Stop drag selection from starting

        isResizing = true;

        startX = e.clientX;
        startY = e.clientY;
        targetCell = element;
        targetRow = element.parentElement;

        resizerDisplay.style.opacity = '1';

        if (type === 'col') {
            startWidth = targetCell.offsetWidth;
            document.addEventListener('mousemove', handleMouseMoveCol);
            document.addEventListener('mouseup', handleMouseUpCol);
        } else { // type === 'row'
            startHeight = targetRow.offsetHeight;
            document.addEventListener('mousemove', handleMouseMoveRow);
            document.addEventListener('mouseup', handleMouseUpRow);
        }
    });

    const handleMouseMoveCol = (e) => {
        const deltaX = e.clientX - startX;
        let newWidth = startWidth + deltaX;
        if (newWidth < 50) newWidth = 50;

        resizerDisplay.textContent = `Column Width: ${newWidth.toFixed(0)}px`;
        resizerDisplay.style.left = `${e.clientX + 15}px`;
        resizerDisplay.style.top = `${e.clientY - 30}px`;

        // Apply width to all cells in the column using nth-child
        const cIndex = targetCell.cellIndex + 1; // nth-child is 1-indexed
        table.querySelectorAll(`tr > td:nth-child(${cIndex})`).forEach(cell => {
             cell.style.width = `${newWidth}px`;
        });
    };

    const handleMouseUpCol = () => {
        document.removeEventListener('mousemove', handleMouseMoveCol);
        document.removeEventListener('mouseup', handleMouseUpCol);
        resizerDisplay.style.opacity = '0';
        isResizing = false;
        saveTableState(currentUserId);
    };

    const handleMouseMoveRow = (e) => {
        const deltaY = e.clientY - startY;
        let newHeight = startHeight + deltaY;
        if (newHeight < 10) newHeight = 10;

        resizerDisplay.textContent = `Row Height: ${newHeight.toFixed(0)}px`;
        resizerDisplay.style.left = `${e.clientX + 15}px`;
        resizerDisplay.style.top = `${e.clientY - 30}px`;

        // Apply height to the entire row (all TDs)
        targetRow.querySelectorAll('td').forEach(cell => {
            cell.style.height = `${newHeight}px`;
        });
        targetRow.style.height = `${newHeight}px`;
    };

    const handleMouseUpRow = () => {
        document.removeEventListener('mousemove', handleMouseMoveRow);
        document.removeEventListener('mouseup', handleMouseUpRow);
        resizerDisplay.style.opacity = '0';
        isResizing = false;
        saveTableState(currentUserId);
    };
};

// --- 6. Event Listener Setup ---

const setupTableEventListeners = () => {
    // 1. Add Resizers (must be done only once)
    table.querySelectorAll('tr').forEach(row => {
        const rowClass = row.className;

        // Column Resizers (on header rows)
        if (rowClass.includes('data-header')) {
            row.querySelectorAll('td').forEach(cell => {
                // Remove existing resizers before adding
                cell.querySelectorAll('.col-resizer').forEach(r => r.remove());
                makeResizable(cell, 'col');
            });
        }
        
        // Row Resizers (on the last cell of each non-notice row)
        if (!rowClass.includes('notice-row')) {
            const lastCell = row.lastElementChild;
            if (lastCell && lastCell.tagName === 'TD') {
                // Remove existing resizers before adding
                lastCell.querySelectorAll('.row-resizer').forEach(r => r.remove());
                makeResizable(lastCell, 'row');
            }
        }
    });

    // 2. Cell Selection (Drag and Click)
    table.removeEventListener('mousedown', handleDragStart);
    table.removeEventListener('click', handleCellClick);
    table.addEventListener('mousedown', handleDragStart);
    table.addEventListener('click', handleCellClick);


    // 3. Cell Content Update Handler (input event bubbles up)
    table.querySelectorAll('td').forEach(cell => {
        cell.removeEventListener('input', () => saveTableState(currentUserId));
        cell.addEventListener('input', () => {
            saveTableState(currentUserId);
        });
    });
};

const setupControlListeners = () => {
    // Download Button Listener
    downloadButton.addEventListener('click', handleDownload);
}

// --- 7. Image Download Functionality ---

const handleDownload = () => {
    const captureArea = document.getElementById('capture-area');
    
    // Temporarily hide the settings panel during capture
    const settingPanel = document.getElementById('settingPanel');
    settingPanel.style.display = 'none';

    // Temporarily hide resizers and selectionBox
    table.querySelectorAll('.col-resizer, .row-resizer').forEach(r => r.style.display = 'none');
    selectionBox.style.display = 'none'; // Ensure selection box is hidden

    // Temporarily remove 'selected' class to clean up the screenshot
    const selectedCells = document.querySelectorAll('.data-table td.selected');
    selectedCells.forEach(c => c.classList.remove('selected'));


    html2canvas(captureArea, {
        allowTaint: true,
        useCORS: true,
        scrollX: -window.scrollX,
        scrollY: -window.scrollY,
        windowWidth: document.documentElement.offsetWidth,
        windowHeight: document.documentElement.offsetHeight,
        scale: 2 // Improve quality
    }).then(canvas => {
        // Restore hidden elements and selected classes
        settingPanel.style.display = 'block';
        table.querySelectorAll('.col-resizer, .row-resizer').forEach(r => r.style.display = 'block');
        selectedCells.forEach(c => c.classList.add('selected')); // Restore selection

        const link = document.createElement('a');
        link.download = 'vip_table_data_snapshot.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        // Custom feedback message
        const originalText = downloadButton.textContent;
        downloadButton.textContent = '✅ 다운로드 완료!';
        setTimeout(() => {
            downloadButton.textContent = originalText;
        }, 2000);

    }).catch(error => {
        // Restore on failure
        settingPanel.style.display = 'block';
        table.querySelectorAll('.col-resizer, .row-resizer').forEach(r => r.style.display = 'block');
        selectedCells.forEach(c => c.classList.add('selected'));
        console.error("Image capture failed:", error);
        
        // Custom feedback message
        const originalText = downloadButton.textContent;
        downloadButton.textContent = '❌ 다운로드 실패!';
        setTimeout(() => {
            downloadButton.textContent = originalText;
        }, 3000);
    });
};
</script>
</body>
</html>
