// ==========================================
// My Sunshine Roleplay Live
// ==========================================

import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {
    collection,
    addDoc,
    serverTimestamp,
    query,
    orderBy,
    onSnapshot,
    updateDoc,
    deleteDoc,
    doc,
    getDoc,
    increment
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

// ==========================================

const profilePhoto = document.getElementById("profilePhoto");
const profileName = document.getElementById("profileName");

const postInput = document.getElementById("postInput");
const postButton = document.getElementById("postButton");

const feed = document.getElementById("feed");

const totalPost = document.getElementById("totalPost");
const totalComment = document.getElementById("totalComment");

let currentUser = null;
let userRole = "player";

// ==========================================
// Time Ago
// ==========================================

function timeAgo(timestamp){

    if(!timestamp) return "Baru saja";

    const seconds =
    Math.floor((Date.now()-timestamp.toMillis())/1000);

    if(seconds<60) return "Baru saja";

    const minutes=Math.floor(seconds/60);

    if(minutes<60)
        return minutes+" menit lalu";

    const hours=Math.floor(minutes/60);

    if(hours<24)
        return hours+" jam lalu";

    const days=Math.floor(hours/24);

    return days+" hari lalu";

}

// ==========================================
// Login
// ==========================================

onAuthStateChanged(auth,async(user)=>{

    if(!user){

        location.href="login.html";

        return;

    }

    currentUser=user;

    profilePhoto.src=user.photoURL;
    profileName.textContent=user.displayName;

    const snap=await getDoc(doc(db,"users",user.uid));

    if(snap.exists()){

        userRole=snap.data().role || "player";

    }

    loadPosts();

});

// ==========================================
// Create Post
// ==========================================

postButton.onclick=async()=>{

    const text=postInput.value.trim();

    if(text===""){

        alert("Isi postingan terlebih dahulu.");

        return;

    }

    await addDoc(collection(db,"posts"),{

        uid:currentUser.uid,

        name:currentUser.displayName,

        photo:currentUser.photoURL,

        text:text,

        likes:0,

        comments:0,

        createdAt:serverTimestamp()

    });

    postInput.value="";

};

// ==========================================
// Load Posts
// ==========================================

function loadPosts(){

    const q=query(

        collection(db,"posts"),

        orderBy("createdAt","desc")

    );

    onSnapshot(q,(snapshot)=>{

        feed.innerHTML="";

        totalPost.innerHTML=snapshot.size;

        snapshot.forEach((document)=>{

            const post=document.data();

            const id=document.id;

            const card=document.createElement("div");

            card.className="card post";

            card.innerHTML=`

            <div class="post-header">

                <img src="${post.photo}">

                <div>

                    <div class="post-name">

                        ${post.name}

                    </div>

                    <div class="time">

                        ${timeAgo(post.createdAt)}

                    </div>

                </div>

            </div>

            <div class="post-body">

                ${escapeHtml(post.text)}

            </div>

            <div class="actions">

                <span class="likeBtn" data-id="${id}">
                    ❤️ ${post.likes || 0}
                </span>

                <span>
                    💬 ${post.comments || 0}
                </span>

                ${
                    userRole!="player"

                    ?

                    `<span class="deleteBtn" data-id="${id}" style="color:#ff6464">

                    🗑 Hapus

                    </span>`

                    :

                    ""

                }

            </div>

            `;

            feed.appendChild(card);

        });

        addEvents();

    });

}

// ==========================================
// Like
// ==========================================

function addEvents(){

    document.querySelectorAll(".likeBtn").forEach(btn=>{

        btn.onclick=async()=>{

            const ref=doc(db,"posts",btn.dataset.id);

            await updateDoc(ref,{

                likes:increment(1)

            });

        };

    });

    document.querySelectorAll(".deleteBtn").forEach(btn=>{

        btn.onclick=async()=>{

            if(!confirm("Hapus postingan ini?"))
                return;

            await deleteDoc(

                doc(db,"posts",btn.dataset.id)

            );

        };

    });

}

// ==========================================
// Escape HTML
// ==========================================

function escapeHtml(text){

    return text

    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");

}