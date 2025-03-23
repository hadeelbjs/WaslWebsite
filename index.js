import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getFirestore} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { getStorage} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-storage.js";


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


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app); 

export {
    db, app, auth, storage
};
