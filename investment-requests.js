import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getFirestore, collection, addDoc, doc, query, where, getDocs, serverTimestamp, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";

// Firebase
const firebaseConfig = {
    apiKey: "AIzaSyC68KD9M_rGGOoyfQaW925LT8ipoj9jE44",
    authDomain: "wasl-523b4.firebaseapp.com",
    projectId: "wasl-523b4",
    storageBucket: "wasl-523b4.appspot.com",
    messagingSenderId: "410509570015",
    appId: "1:410509570015:web:4c9a86048b3e8be0bd1e6a",
    measurementId: "G-DD60XW5EVT"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const database = getFirestore(app);
const auth = getAuth(app);

window.onload = function () {
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            alert("يتطلب تسجيل الدخول");
            window.location.href = "index.html";
        }
    });
};

// إرسال طلب استثمار
async function requestInvestment() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const ideaId = urlParams.get('id'); 

        if (!auth.currentUser) {
            alert("يتطلب تسجيل الدخول");
            return;
        }

        const requestDate = serverTimestamp();
        const investorId = auth.currentUser.uid;
        const status = "بانتظار الرد"; // Default status

        const requestsRef = collection(database, "requests");

        const ideaRef = doc(database, "ideas", ideaId);
        const ideaSnapshot = await getDoc(ideaRef);

        if (!ideaSnapshot.exists()) {
            console.error(" Idea not found");
            return;
        }

        const innovatorId = ideaSnapshot.data().userId;

        if (innovatorId === investorId) {
            console.warn(" Investor cannot invest in their own idea!");
            return;
        }
        const q = query(
            requestsRef,
            where("investorId", "==", investorId),
            where("ideaId", "==", ideaId)
        );

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            alert("لقد قمت بالفعل بإرسال طلب استثمار لهذه الفكرة!");
            return;
        }

        const request = {
            requestDate,
            status,
            investorId,
            ideaId
        };
        
        await addDoc(requestsRef, request);
        alert("تم إرسال الطلب بنجاح!");
    } catch (error) {
        console.error(" Error sending investment request:", error);
    }
}

async function fetchInvestmentRequests() {
    if (!auth.currentUser) {
        console.error(" No user is currently signed in.");
        return;
    }

    const userIdeas = await getUserIdeas(auth.currentUser.uid);
    let ideaIDs = Object.keys(userIdeas || {});

    if (!ideaIDs || ideaIDs.length === 0) {
        console.log("لا توجد أفكار لهذا المستخدم.");
        const pS = document.getElementById("load-i");
        pS.innerHTML = "لا توجد طلبات استثمار حتى الان...";
        return;
    }
    
    const allRequestsSnapshot = await getDocs(collection(database, "requests"));
    const filteredRequests = allRequestsSnapshot.docs
    .map(docSnap => ({ id: docSnap.id, ...docSnap.data() })) // استخراج البيانات من كل مستند
    .filter(request => ideaIDs.includes(request.ideaId));
    const container = document.getElementById("requestsContainer");
    if(filteredRequests.length == 0){
      const pS = document.getElementById("load-i");
      pS.innerHTML = "لا توجد طلبات استثمار حتى الان...";
      return;
    }
    container.innerHTML = "";
    
    for (const data of filteredRequests)  {
        // بيانات المستثمر (صاحب الطلب)
        const investorRef = data.investorId;
        const investorSnapshot = await getDoc(doc(database, "users", investorRef));
        const investorData = investorSnapshot.exists() ? investorSnapshot.data() : { username: "غير معروف", email: "غير متوفر" };
        
        const ideaDocRef = doc(database, "ideas", data.ideaId);
        const ideaSnapshot = await getDoc(ideaDocRef);
        if (!ideaSnapshot.exists()) continue;
        const ideaData = ideaSnapshot.data();
        // إنشاء الطلب
        const requestElement = document.createElement("div");
        requestElement.classList.add("invRequest");
        const formattedHijriDate = data.requestDate?.toDate ? 
        new Intl.DateTimeFormat("ar-SA", {
            year: "numeric",
            month: "long",
            day: "numeric",
            weekday: "long",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        }).format(data.requestDate.toDate()) : 
        "غير متوفر";
        if(data.status == "بانتظار الرد" ){
        requestElement.innerHTML = `
            <p><strong>عنوان الفكرة:</strong> ${ideaData.title}</p>
            <p><strong>المستثمر:</strong> ${investorData.username} (${investorData.email})</p>
            <div class="user-info">
                <img src= ${investorData.profileImage ? investorData.profileImage : 'images/default-avatar.png' } alt="صورة ${investorData.username}">
                <p>${investorData.username}</p>
            </div>
            <hr>
            <p><strong>تاريخ الطلب:</strong>  ${formattedHijriDate}</p>
            <p><strong>حالة الطلب:</strong> ${data.status}</p>
            <div class="actions">
                <button class="btn approve" id="accept" data-id="${data.id}"><span class="material-symbols-outlined">check</span>موافقة</button>
                <button class="btn reject" id ="reject" data-id="${data.id}"><span class="material-symbols-outlined">close</span>رفض</button>
            </div>
        `;
        container.appendChild(requestElement);
        const aButton = document.getElementById("accept");
        const rButton = document.getElementById("reject");
        aButton.addEventListener("click", () => updateRequestStatus("مقبول", data.id));
        rButton.addEventListener("click", () => updateRequestStatus("مرفوض", data.id));
        } else{
            requestElement.innerHTML = `
            <p><strong>عنوان الفكرة:</strong> ${ideaData.title}</p>
            <p><strong>المستثمر:</strong> ${investorData.username} (${investorData.email})</p>
            <div class="user-info">
                       <img src= ${investorData.profileImage ? investorData.profileImage : 'images/default-avatar.png'} alt="صورة ${investorData.username}">
                        <p>${investorData.username}</p>
            </div>
            <hr>
            <p><strong>تاريخ الطلب:</strong>  ${formattedHijriDate}</p>
            <p><strong>حالة الطلب:</strong> ${data.status}</p>
            
        `;
        container.appendChild(requestElement);
        }
            
    }
}
//  وظيفة لجلب جميع الأفكار التي يملكها المستخدم
async function getUserIdeas(userId) {
    const userRef = collection(database, "users"); 
    const q = query(userRef, where("userId", "==", userId)); 

    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0]; 
        return doc.data().ideas;
        
    }
    
    return null; // في حالة عدم وجود بيانات
}
async function updateRequestStatus(newStatus, requestId) {
    
    try {
        
        const requestRef = doc(database, "requests", requestId);
        await updateDoc(requestRef, {
            status: newStatus
          });
        alert(`تم إرسال الرد بنجاح!`);
        window.location.reload(true);

    } catch (error) {
        console.error("Error updating request status:", error);
    }
}

// طريقة أكثر كفاءة باستخدام المراجع المجمعة لتقليل عدد الطلبات
async function getRequestsWithIdeaTitles(userId) {
    try {
        // 1. الحصول على طلبات المستخدم
        const requestsRef = collection(database, "requests");
        const q = query(requestsRef, where("investorId", "==", userId));
        const requestsSnapshot = await getDocs(q);
        
        if (requestsSnapshot.empty) {
            return [];
        }
        
        // 2. استخراج جميع معرفات الأفكار من الطلبات
        const ideaIds = [];
        const requestsData = [];
        
        requestsSnapshot.forEach(docSnap => {
            const data = docSnap.data();
            ideaIds.push(data.ideaId);
            requestsData.push({
                id: docSnap.id,
                ideaId: data.ideaId,
                status: data.status
            });
        });
        
        // 3. استخدام عمليات الحصول المجمعة للأفكار
        const ideaPromises = ideaIds.map(ideaId => 
            getDoc(doc(database, "ideas", ideaId))
        );
        
        // 4. انتظار جميع الوعود (Promises)
        const ideaSnapshots = await Promise.all(ideaPromises);
        
        // 5. إنشاء قاموس من معرفات الأفكار إلى عناوينها
        const ideaTitles = {};
        ideaSnapshots.forEach(ideaDoc => {
            if (ideaDoc.exists()) {
                ideaTitles[ideaDoc.id] = ideaDoc.data().title;
            } else {
                ideaTitles[ideaDoc.id] = "غير متوفر";
            }
        });
        
        // 6. إضافة عناوين الأفكار إلى بيانات الطلبات
        const result = requestsData.map(request => ({
            id: request.id,
            ideaTitle: ideaTitles[request.ideaId] || "غير متوفر",
            status: request.status
        }));
        
        return result;
        
    } catch (error) {
        console.error("خطأ في الحصول على الطلبات مع عناوين الأفكار:", error);
        throw error;
    }
}

// استدعاء الدالة مع واجهة المستخدم
async function displayRequestsEfficiently() {
    try {
        const requestsContainer = document.getElementById("sent-requests-container");
        requestsContainer.innerHTML = '<div class="loading">جاري تحميل الطلبات...</div>';
        
        // الحصول على معرف المستخدم الحالي
        if (!auth.currentUser) {
            console.error("No user is currently signed in.");
            return;
        }
        const userId = auth.currentUser.uid;
        
        // استدعاء الدالة الأكثر كفاءة
        const requests = await getRequestsWithIdeaTitles(userId);
        
        if (requests.length === 0) {
            requestsContainer.innerHTML = "<p>لا توجد طلبات حالياً</p>";
            return;
        }
        
        // عرض الطلبات
        let requestsHTML = '<ul class="requests-list">';
        
        requests.forEach(request => {
            requestsHTML += `
                <li class="request-item">
                    <div class="request-info">
                        <p class="request-title">عنوان الفكرة: ${request.ideaTitle}</p>
                        <span class="request-status">الحالة: ${request.status}</span>
                    </div>
                </li>
            `;
        });
        
        requestsHTML += '</ul>';
        requestsContainer.innerHTML = requestsHTML;
        
    } catch (error) {
        console.error("حدث خطأ:", error);
        document.getElementById("sent-requests-container").innerHTML = 
            '<p class="error">حدث خطأ أثناء تحميل الطلبات. الرجاء المحاولة مرة أخرى.</p>';
    }
}

export { requestInvestment, fetchInvestmentRequests, updateRequestStatus, displayRequestsEfficiently };
