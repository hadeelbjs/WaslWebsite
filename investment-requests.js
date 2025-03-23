import{db, app, auth, storage} from "./index.js";
import {onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs, setDoc, addDoc, serverTimestamp } from "firebase/firestore";


window.onload = function () {
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        alert("Must be signed in to access this page");
        window.location.href = "index.html";
      }
    });
  };

//Get All Invetment Requests 
async function getInvetmentRequests(){
    const q = query(collection(db, "requests"), where("user", "==", true));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
    console.log(doc.id, " => ", doc.data());
    });
}

async function requestInvestment(){
    const urlParams = new URLSearchParams(window.location.search);

    const ideaId = urlParams.get('id'); // الحصول على الـ id من الرابط
    requestDate = serverTimestamp();
    const investorId = user.uid;
    var status = "pending"; // Default
    
    const request = {
        requestDate,
        status,
        investorId,
        ideaId
    };

    await addDoc(collection(db, "requests"), request);
    alert("request sent");
}