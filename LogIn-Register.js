import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

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

console.log(" Firebase Config Loaded:", firebaseConfig);

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export async function registerUser() {
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
            username: username,
            email: email,
            userId: user.uid,
            ideas: []  
        });

        alert("تم إنشاء الحساب بنجاح!");
        window.location.href = "Login.html";
    } catch (error) {
        alert("خطأ: " + error.message);
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
