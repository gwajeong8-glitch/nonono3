// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Firebase 설정 정보 (여기에 자신의 Firebase 프로젝트 설정을 붙여넣으세요)
const firebaseConfig = {
    apiKey: "YOUR_API_KEY", // <-- 여기에 API 키 입력
    authDomain: "YOUR_AUTH_DOMAIN", // <-- 여기에 Auth 도메인 입력
    projectId: "YOUR_PROJECT_ID", // <-- 여기에 프로젝트 ID 입력
    storageBucket: "YOUR_STORAGE_BUCKET", // <-- 여기에 Storage Bucket 입력
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // <-- 여기에 Messaging Sender ID 입력
    appId: "YOUR_APP_ID" // <-- 여기에 App ID 입력
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

// Firestore 문서 참조 경로 생성 함수
const getTableDocRef = (userId) => {
    return doc(db, 'artifacts', appId, 'users', userId, 'table_data', TABLE_DOC_ID);
};

// Firebase 인증 초기화 및 상태 변경 감지
const initAuth = async () => {
    try {
        if (typeof __initial_auth_token !== 'undefined') {
            await signInWithCustomToken(auth, __initial_auth_token);
        }
    } catch (error) {
        console.warn("Custom token sign-in failed, attempting anonymous sign-in.", error);
    }
    
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUserId = user.uid;
        } else {
            try {
                await signInAnonymously(auth);
                currentUserId = auth.currentUser.uid;
            } catch (error) {
                console.error("Anonymous sign-in failed.", error);
                return;
            }
        }
        
        if (currentUserId && !isAuthReady) { // isAuthReady 플래그는 한 번만 true로 설정
            isAuthReady = true;
            // app.js에 인증 완료 이벤트 전달
            window.dispatchEvent(new CustomEvent('firebaseAuthReady', {
                detail: { userId: currentUserId }
            }));
            console.log("Firebase Auth ready and event dispatched.");
        }
    });
};

initAuth();

// 외부에서 접근할 수 있도록 내보내기
export { db, auth, getTableDocRef, currentUserId, isAuthReady };

// currentUserId와 isAuthReady는 실시간으로 변경될 수 있으므로 getter 함수를 추가
export const getCurrentUserId = () => currentUserId;
export const getIsAuthReady = () => isAuthReady;
