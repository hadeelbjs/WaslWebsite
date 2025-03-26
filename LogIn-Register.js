import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-storage.js";
import { getDocs, collection, query, where } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";



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
const storage = getStorage(app); 


export async function registerUser() {
    const username = document.getElementById("username").value.trim();
    
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const dob = document.getElementById("dob").value.trim();

    const xHandle = document.getElementById("xHandle").value.trim() || "";
    const linkedinHandle = document.getElementById("linkedinHandle").value.trim() || "";
    const profileImage = document.getElementById("profileImage").files[0];

    if (!username) {
        alert("يرجى إدخال اسم المستخدم!");
        return;
    }
    if (!email) {
        alert("يرجى إدخال البريد الإلكتروني");
        return;
    }
    
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        alert("يرجى إدخال بريد إلكتروني صالح مثل example@example.com");
        return;
    }
    
    
    if (!password) {
        alert("يرجى إدخال كلمة المرور");
        return;
    }
    if (!dob) {
        alert("يرجى إدخال تاريخ الميلاد!");
        return;
    }
    


    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordPattern.test(password)) {
        alert("كلمة المرور يجب أن تحتوي على 8 خانات على الأقل، وحرف صغير وكبير، ورقم، ورمز خاص.");
        return;
    }

    try {
        console.log(" التحقق من توفر الاسم والإيميل...");
       
        const querySnapshot = await getDocs(collection(db, "users"));
        let usernameExists = false;
        let emailExists = false;

        querySnapshot.forEach(doc => {
            const data = doc.data();
            if (data.username.toLowerCase() === username.toLowerCase()) {
                usernameExists = true;
            }
            if (data.email.toLowerCase() === email.toLowerCase()) {
                emailExists = true;
            }
        });

        if (usernameExists || emailExists) {
            alert("عذرًا، يبدو أن اسم المستخدم أو البريد الإلكتروني مستخدم مسبقًا. يُرجى اختيار بيانات مختلفة أو تسجيل الدخول إذا كان لديك حساب.");
            return;
        }
        const registerBtn = document.getElementById("registerBtn");
        registerBtn.disabled = true;
        registerBtn.textContent = "جاري التسجيل...";
        
        console.log(" جاري إنشاء الحساب...");
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        let profileImageUrl = "";
        if (profileImage) {
            const storageRef = ref(storage, `profileImages/${user.uid}`);
            const snapshot = await uploadBytes(storageRef, profileImage);
            profileImageUrl = await getDownloadURL(snapshot.ref);
        }

        await setDoc(doc(db, "users", user.uid), {
            username,
            email,
            userId: user.uid,
            dob,
            bio,
            favorites: [], 
            contactInfo: {
                xHandle,
                linkedinHandle
            },
            profileImage: profileImageUrl,
            ideas: []
        });

        alert("تم إنشاء الحساب بنجاح!");
        window.location.href = "Login.html";
    } catch (error) {
        console.error(" خطأ أثناء التسجيل:", error.message);
        alert("حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة لاحقًا.");
        registerBtn.disabled = false;
registerBtn.textContent = "قم بالتسجيل";

    }
}



export async function loginUser() {
    const input = document.getElementById("email").value.trim(); 
    const password = document.getElementById("password").value;

    try {
        let emailToUse = input;

    
        if (!input.includes("@")) {
            const usersSnapshot = await getDocs(collection(db, "users"));
            let foundUser = null;

            usersSnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.username.toLowerCase() === input.toLowerCase()) {
                    foundUser = data;
                }
            });

            if (!foundUser) {
                alert("بيانات الدخول غير صحيحة. تأكد من اسم المستخدم أو البريد الإلكتروني وكلمة المرور.");
                return;
            }

            emailToUse = foundUser.email;
        }

        const userCredential = await signInWithEmailAndPassword(auth, emailToUse, password);
        localStorage.setItem("uid", userCredential.user.uid);



        alert("تم تسجيل الدخول بنجاح!");
        window.location.href = "profile1.html";
    } catch (error) {
        console.error(" خطأ أثناء تسجيل الدخول:", error.message);
        alert("بيانات الدخول غير صحيحة. تأكد من اسم المستخدم أو البريد الإلكتروني وكلمة المرور.");
    }
}


export { db, auth };
