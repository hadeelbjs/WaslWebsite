import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-storage.js";


const firebaseConfig = {
    apiKey: "AIzaSyC68KD9M_rGGOoyfQaW925LT8ipoj9jE44",
    authDomain: "wasl-523b4.firebaseapp.com",
    databaseURL: "https://wasl-523b4-default-rtdb.firebaseio.com",
    projectId: "wasl-523b4",
    storageBucket: "wasl-523b4.firebasestorage.app", 
    messagingSenderId: "410509570015",
    appId: "1:410509570015:web:4c9a86048b3e8be0bd1e6a",
    measurementId: "G-DD60XW5EVT"
};

console.log("🔥 Firebase Config Loaded:", firebaseConfig);


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app); 


export async function registerUser() {
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const xHandle = document.getElementById("xHandle").value.trim() || "";
    const linkedinHandle = document.getElementById("linkedinHandle").value.trim() || "";
    const profileImage = document.getElementById("profileImage").files[0]; 

    if (!username) {
        alert("يرجى إدخال اسم المستخدم!");
        return;
    }

    try {
        console.log("🚀 جاري إنشاء الحساب...");
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log("✅ المستخدم تم إنشاؤه بنجاح:", user.uid);

        let profileImageUrl = ""; 

        if (profileImage) {
            console.log("🚀 جاري رفع الصورة...");
            const storageRef = ref(storage, `profileImages/${user.uid}`);
            const snapshot = await uploadBytes(storageRef, profileImage);
            profileImageUrl = await getDownloadURL(snapshot.ref);
            console.log("✅ تم رفع الصورة بنجاح:", profileImageUrl);
        }

   
        await setDoc(doc(db, "users", user.uid), {
            username: username,
            email: email,
            userId: user.uid,
            contactInfo: {
                xHandle: xHandle,
                linkedinHandle: linkedinHandle
            },
            profileImage: profileImageUrl, 
            ideas: [] 
        });
        

        console.log("✅ البيانات تم تخزينها في Firestore بنجاح!");
        alert("تم إنشاء الحساب بنجاح!");
        window.location.href = "Login.html";
    } catch (error) {
        console.error("❌ خطأ أثناء التسجيل:", error.message);
        alert("خطأ أثناء التسجيل: " + error.message);
    }
}


export async function loginUser() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        alert("تم تسجيل الدخول بنجاح!");
        window.location.href = "profile1.html";
    } catch (error) {
        alert("خطأ: " + error.message);
    }
}

export { db, auth };
