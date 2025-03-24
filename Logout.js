
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { auth } from "./LogIn-Register.js"; 

export function logoutUser() {
    signOut(auth)
        .then(() => {
            alert("تم تسجيل الخروج بنجاح");
            window.location.href = "Login.html";
        })
        .catch((error) => {
            console.error(" خطأ في تسجيل الخروج:", error);
            alert("حدث خطأ أثناء تسجيل الخروج، حاول مرة أخرى.");
        });
}
