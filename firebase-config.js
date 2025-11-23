// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Firebase 설정 정보 (여기에 자신의 Firebase 프로젝트 설정을 붙여넣으세요)
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// 앱 ID는 Firestore 문서 경로에 사용
const appId = firebaseConfig.appId;

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const TABLE_DOC_ID = 'main_table_state';

let currentUserId = null;
let isAuthReady = false;
let hasLoadedState = false; // 데이터 중복 로드 방지

// Firestore 문서 참조 경로 생성 함수
const getTableDocRef = (userId) => {
    return doc(db, 'artifacts', appId, 'users', userId, 'table_data', TABLE_DOC_ID);
};

// Firebase 인증 초기화 및 상태 변경 감지
const initAuth = async () => {
    try {
        // 커스텀 토큰이 있다면 사용 (예: 서버에서 발급받은 토큰)
        if (typeof __initial_auth_token !== 'undefined') {
            await signInWithCustomToken(auth, __initial_auth_token);
        }
    } catch (error) {
        console.warn("Custom token sign-in failed, attempting anonymous sign-in.", error);
    }
    
    // 인증 상태 변경 감지
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
        
        // 인증 준비 완료 (데이터 로드를 위임)
        if (currentUserId && !hasLoadedState) {
            isAuthReady = true;
            // app.js에서 loadTableState를 호출할 수 있도록 준비 알림
            window.dispatchEvent(new CustomEvent('firebaseAuthReady', {
                detail: { userId: currentUserId, dbInstance: db, getTableDocRefFn: getTableDocRef }
            }));
            hasLoadedState = true; // 최초 로드 완료 플래그 설정
            console.log("Firebase Auth ready and data load initiated.");
        }
    });
};

initAuth();

// 다른 파일에서 Firebase 인스턴스에 접근할 수 있도록 내보내기
export { db, auth, getTableDocRef, currentUserId, isAuthReady };

// currentUserId와 isAuthReady는 실시간으로 변경될 수 있으므로 getter 함수를 추가
export const getCurrentUserId = () => currentUserId;
export const getIsAuthReady = () => isAuthReady;

// 외부에서 saveTableState와 loadTableState를 호출하기 위해 필요 (app.js에서 정의)
// (초기에는 여기에 직접 정의하지 않음, app.js에서 호출할 예정)
