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
    try {
        // 1. جمع بيانات المستخدم والتحقق منها
        const username = document.getElementById("username").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const dob = document.getElementById("dob").value.trim();
        const xHandle = document.getElementById("xHandle").value.trim() || "";
        const linkedinHandle = document.getElementById("linkedinHandle").value.trim() || "";
        const profileImage = document.getElementById("profileImage").files[0];

        // 2. التحقق من الحقول الإلزامية
        if (!username) {
            alert("يرجى إدخال اسم المستخدم!");
            return;
        }
        if (!email) {
            alert("يرجى إدخال البريد الإلكتروني");
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

        // 3. التحقق من صحة البريد الإلكتروني
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            alert("يرجى إدخال بريد إلكتروني صالح مثل example@example.com");
            return;
        }

        // 4. التحقق من قوة كلمة المرور
        const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        if (!passwordPattern.test(password)) {
            alert("كلمة المرور يجب أن تحتوي على 8 خانات على الأقل، وحرف صغير وكبير، ورقم، ورمز خاص.");
            return;
        }

        // 5. تعطيل زر التسجيل لمنع النقرات المتعددة
        const registerBtn = document.getElementById("registerBtn");
        registerBtn.disabled = true;
        registerBtn.textContent = "جاري التسجيل...";

        // 6. التحقق من توفر اسم المستخدم والبريد الإلكتروني
        console.log("التحقق من توفر الاسم والإيميل...");
        
        // استخدام الاستعلامات المباشرة بدلاً من جلب جميع المستخدمين
        const usernameQuery = query(collection(db, "users"), where("username", "==", username));
        const usernameSnapshot = await getDocs(usernameQuery);
        
        if (!usernameSnapshot.empty) {
            alert("عذرًا، اسم المستخدم مستخدم بالفعل. يرجى اختيار اسم مستخدم آخر.");
            registerBtn.disabled = false;
            registerBtn.textContent = "قم بالتسجيل";
            return;
        }
        
        const emailQuery = query(collection(db, "users"), where("email", "==", email));
        const emailSnapshot = await getDocs(emailQuery);
        
        if (!emailSnapshot.empty) {
            alert("عذرًا، البريد الإلكتروني مستخدم بالفعل. يرجى استخدام بريد إلكتروني آخر أو تسجيل الدخول.");
            registerBtn.disabled = false;
            registerBtn.textContent = "قم بالتسجيل";
            return;
        }

        // 7. إنشاء الحساب في Firebase Authentication
        console.log("جاري إنشاء الحساب...");
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 8. معالجة صورة الملف الشخصي (إذا تم تحميلها)
        let profileImageUrl = "";
        if (profileImage) {
            try {
                console.log("جاري رفع صورة الملف الشخصي...");
                const storageRef = ref(storage, `profileImages/${user.uid}`);
                const snapshot = await uploadBytes(storageRef, profileImage);
                profileImageUrl = await getDownloadURL(snapshot.ref);
                console.log("تم رفع الصورة بنجاح:", profileImageUrl);
            } catch (imageError) {
                console.error("خطأ في رفع الصورة:", imageError);
                // استمر في إنشاء الحساب حتى لو فشل رفع الصورة
            }
        }

        // 9. إنشاء وثيقة المستخدم في Firestore
        await setDoc(doc(db, "users", user.uid), {
            username,
            email,
            userId: user.uid,
            dob,
            favorites: [], 
            contactInfo: {
                xHandle,
                linkedinHandle
            },
            profileImage: profileImageUrl,
            ideas: [],
            createdAt: new Date().toISOString()
        });

        alert("تم إنشاء الحساب بنجاح!");
        window.location.href = "Login.html";
    } catch (error) {
        console.error("خطأ أثناء التسجيل:", error.code, error.message);
        
        // رسائل خطأ أكثر تفصيلاً حسب نوع الخطأ
        if (error.code === "auth/email-already-in-use") {
            alert("هذا البريد الإلكتروني مستخدم بالفعل. يرجى استخدام بريد إلكتروني آخر أو تسجيل الدخول.");
        } else if (error.code === "auth/weak-password") {
            alert("كلمة المرور ضعيفة جداً. يرجى اختيار كلمة مرور أقوى.");
        } else if (error.code === "auth/network-request-failed") {
            alert("حدث خطأ في الاتصال بالشبكة. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.");
        } else {
            alert("حدث خطأ أثناء إنشاء الحساب: " + error.message);
        }
        
        // إعادة تمكين زر التسجيل
        const registerBtn = document.getElementById("registerBtn");
        if (registerBtn) {
            registerBtn.disabled = false;
            registerBtn.textContent = "قم بالتسجيل";
        }
    }
}
export async function loginUser() {
    const input = document.getElementById("email").value.trim(); 
    const password = document.getElementById("password").value;
    
    if (!input || !password) {
        alert("يرجى إدخال اسم المستخدم/البريد الإلكتروني وكلمة المرور");
        return;
    }

    try {
        // تعطيل زر تسجيل الدخول أثناء المعالجة
        const loginBtn = document.getElementById("loginBtn");
        if (loginBtn) {
            loginBtn.disabled = true;
            loginBtn.textContent = "جاري تسجيل الدخول...";
        }

        let emailToUse = input;

        // إذا كان المدخل لا يحتوي على @ (أي أنه اسم مستخدم وليس بريدًا إلكترونيًا)
        if (!input.includes("@")) {
            console.log("البحث عن المستخدم باستخدام اسم المستخدم:", input);
            
            // إنشاء استعلام للبحث عن المستخدم بناءً على اسم المستخدم
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("username", "==", input));
            const querySnapshot = await getDocs(q);
            
            if (querySnapshot.empty) {
                alert("لم يتم العثور على مستخدم بهذا الاسم");
                if (loginBtn) {
                    loginBtn.disabled = false;
                    loginBtn.textContent = "تسجيل الدخول";
                }
                return;
            }
            
            // استخراج البريد الإلكتروني من الوثيقة الأولى المطابقة
            const userDoc = querySnapshot.docs[0];
            emailToUse = userDoc.data().email;
            console.log("تم العثور على البريد الإلكتروني المرتبط:", emailToUse);
        }

        // تسجيل الدخول باستخدام البريد الإلكتروني وكلمة المرور
        console.log("محاولة تسجيل الدخول باستخدام البريد الإلكتروني:", emailToUse);
        const userCredential = await signInWithEmailAndPassword(auth, emailToUse, password);
        
        // حفظ معرف المستخدم في التخزين المحلي
        localStorage.setItem("uid", userCredential.user.uid);
        
        alert("تم تسجيل الدخول بنجاح!");
        window.location.href = "profile1.html";
    } catch (error) {
        console.error("خطأ أثناء تسجيل الدخول:", error.message);
        
        // رسالة خطأ أكثر تفصيلاً
        if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
            alert("بيانات الدخول غير صحيحة. تأكد من اسم المستخدم/البريد الإلكتروني وكلمة المرور.");
        } else {
            alert("حدث خطأ أثناء تسجيل الدخول: " + error.message);
        }
        
        // إعادة تمكين زر تسجيل الدخول
        const loginBtn = document.getElementById("loginBtn");
        if (loginBtn) {
            loginBtn.disabled = false;
            loginBtn.textContent = "تسجيل الدخول";
        }
    }
}

export { db, auth };
