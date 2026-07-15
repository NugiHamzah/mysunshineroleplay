// ==========================================
// My Sunshine Roleplay
// Profile System
// ==========================================

import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {
    doc,
    getDoc,
    collection,
    query,
    where,
    orderBy,
    getDocs
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

// ==========================================
// Elements
// ==========================================

const photo = document.getElementById("photo");
const miniPhoto = document.getElementById("miniPhoto");

const name = document.getElementById("name");
const miniName = document.getElementById("miniName");

const email = document.getElementById("email");
const role = document.getElementById("role");

const staffBadge = document.getElementById("staffBadge");

const postCount = document.getElementById("postCount");
const commentCount = document.getElementById("commentCount");
const replyCount = document.getElementById("replyCount");
const likeCount = document.getElementById("likeCount");

const postsContainer = document.getElementById("posts");

const logoutBtn = document.getElementById("logout");

// ==========================================
// Role Color
// ==========================================

function getRoleName(roleName) {

    switch(roleName){

        case "owner":
            return "👑 Owner";

        case "developer":
            return "💻 Developer";

        case "management":
            return "🛡 Management";

        case "headadmin":
            return "⭐ Head Admin";

        case "admin":
            return "🔰 Admin";

        case "moderator":
            return "🟢 Moderator";

        case "helper":
            return "🟡 Helper";

        case "verified":
            return "✔ Verified Creator";

        default:
            return "👤 Player";

    }

}

// ==========================================
// Time Ago
// ==========================================

function timeAgo(timestamp){

    if(!timestamp) return "Baru saja";

    const now = Date.now();

    const seconds = Math.floor((now - timestamp.toMillis()) / 1000);

    if(seconds < 60)
        return "Baru saja";

    const minutes = Math.floor(seconds/60);

    if(minutes < 60)
        return minutes + " menit lalu";

    const hours = Math.floor(minutes/60);

    if(hours < 24)
        return hours + " jam lalu";

    const days = Math.floor(hours/24);

    return days + " hari lalu";

}

// ==========================================
// Auth
// ==========================================

onAuthStateChanged(auth, async(user)=>{

    if(!user){

        window.location="login.html";

        return;

    }

    photo.src = user.photoURL;
    miniPhoto.src = user.photoURL;

    name.textContent = user.displayName;
    miniName.textContent = user.displayName;

    email.textContent = user.email;

    // ======================================
    // User Profile
    // ======================================

    const userRef = doc(db,"users",user.uid);

    const userSnap = await getDoc(userRef);

    if(userSnap.exists()){

        const data = userSnap.data();

        role.textContent = getRoleName(data.role || "player");

        if(data.role && data.role !== "player"){

            staffBadge.style.display="inline-block";

        }

    }

    // ======================================
    // Statistics
    // ======================================

    const statsRef = doc(db,"stats",user.uid);

    const statsSnap = await getDoc(statsRef);

    if(statsSnap.exists()){

        const stats = statsSnap.data();

        postCount.textContent = stats.posts || 0;
        commentCount.textContent = stats.comments || 0;
        replyCount.textContent = stats.replies || 0;
        likeCount.textContent = stats.likes || 0;

    }

    // ======================================
    // My Posts
    // ======================================

    const q = query(

        collection(db,"posts"),

        where("uid","==",user.uid),

        orderBy("createdAt","desc")

    );

    const snapshot = await getDocs(q);

    postsContainer.innerHTML="";

    if(snapshot.empty){

        postsContainer.innerHTML=`

        <div class="post">

            Belum ada postingan.

        </div>

        `;

        return;

    }

    snapshot.forEach((docSnap)=>{

        const post = docSnap.data();

        postsContainer.innerHTML += `

        <div class="post">

            <div class="post-header">

                <img src="${user.photoURL}">

                <div>

                    <b>${user.displayName}</b><br>

                    <span>${timeAgo(post.createdAt)}</span>

                </div>

            </div>

            <div class="post-body">

                ${post.text}

            </div>

        </div>

        `;

    });

});

// ==========================================
// Logout
// ==========================================

logoutBtn.addEventListener("click",async()=>{

    await signOut(auth);

    window.location="login.html";

});