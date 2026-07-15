// ==========================================
// My Sunshine Roleplay
// Live Kota System
// Part 1
// ==========================================

import {
    auth,
    db
} from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {
    collection,
    addDoc,
    onSnapshot,
    query,
    orderBy,
    serverTimestamp,
    updateDoc,
    increment,
    doc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

// ==========================================
// ELEMENT
// ==========================================

const profilePhoto = document.getElementById("profilePhoto");
const profileName = document.getElementById("profileName");

const totalPost = document.getElementById("totalPost");
const totalComment = document.getElementById("totalComment");

const feed = document.getElementById("feed");

const postInput = document.getElementById("postInput");
const postButton = document.getElementById("postButton");

// ==========================================

let currentUser = null;

let currentRole = "player";

let unsubscribeFeed = null;

// ==========================================
// Escape HTML
// ==========================================

function escapeHtml(text = "") {

    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}

// ==========================================
// Time Ago
// ==========================================

function timeAgo(timestamp) {

    if (!timestamp)
        return "Baru saja";

    if (!timestamp.toMillis)
        return "Baru saja";

    const diff = Math.floor(
        (Date.now() - timestamp.toMillis()) / 1000
    );

    if (diff < 60)
        return "Baru saja";

    if (diff < 3600)
        return Math.floor(diff / 60) + " menit lalu";

    if (diff < 86400)
        return Math.floor(diff / 3600) + " jam lalu";

    if (diff < 2592000)
        return Math.floor(diff / 86400) + " hari lalu";

    return new Date(timestamp.toMillis()).toLocaleDateString("id-ID");

}

// ==========================================
// AUTH
// ==========================================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location = "login.html";

        return;

    }

    currentUser = user;

    profilePhoto.src =
        user.photoURL ||
        "https://ui-avatars.com/api/?name=" +
        encodeURIComponent(user.displayName);

    profileName.textContent =
        user.displayName;

    await loadUser();

    loadFeed();

});

// ==========================================
// USER
// ==========================================

async function loadUser() {

    const ref = doc(db, "users", currentUser.uid);

    const snap = await getDoc(ref);

    if (!snap.exists()) {

        await setDoc(ref, {

            uid: currentUser.uid,

            name: currentUser.displayName,

            email: currentUser.email,

            photo: currentUser.photoURL,

            role: "player",

            verified: true,

            createdAt: serverTimestamp(),

            lastLogin: serverTimestamp()

        });

        currentRole = "player";

        return;

    }

    const data = snap.data();

    currentRole = data.role || "player";

    await setDoc(ref, {

        lastLogin: serverTimestamp()

    }, {

        merge: true

    });

}

// ==========================================
// CREATE POST
// ==========================================

postButton.addEventListener("click", createPost);

async function createPost() {

    const text = postInput.value.trim();

    if (text.length < 2) {

        alert("Postingan terlalu pendek.");

        return;

    }

    if (text.length > 500) {

        alert("Maksimal 500 karakter.");

        return;

    }

    postButton.disabled = true;

    try {

        await addDoc(collection(db, "posts"), {

            uid: currentUser.uid,

            name: currentUser.displayName,

            email: currentUser.email,

            photo: currentUser.photoURL,

            role: currentRole,

            verified: true,

            text,

            image: "",

            likes: 0,

            comments: 0,

            pinned: false,

            createdAt: serverTimestamp()

        });

        postInput.value = "";

    } catch (err) {

        console.error(err);

        alert("Gagal membuat postingan.");

    }

    postButton.disabled = false;

}

// ==========================================
// LOAD FEED
// ==========================================

function loadFeed() {

    if (unsubscribeFeed)
        unsubscribeFeed();

    const q = query(

        collection(db, "posts"),

        orderBy("createdAt", "desc")

    );

    unsubscribeFeed = onSnapshot(q, (snapshot) => {

        totalPost.textContent = snapshot.size;

        feed.innerHTML = "";

        let commentTotal = 0;

        snapshot.forEach((docSnap) => {

            const post = docSnap.data();

            commentTotal += post.comments || 0;

            renderPost(

                docSnap.id,

                post

            );

        });

        totalComment.textContent = commentTotal;

    });

}

// ==========================================
// RENDER POST
// Part 2
// ==========================================

function renderPost(id, post) {

    const card = document.createElement("div");

    card.className = "card post";

    card.dataset.id = id;

    const isStaff =
        currentRole !== "player";

    const badge = getBadge(post.role);

    card.innerHTML = `

    <div class="post-header">

        <img
            class="avatar"
            src="${post.photo || "https://ui-avatars.com/api/?name=" + encodeURIComponent(post.name)}"
        >

        <div class="post-info">

            <div class="post-name">

                ${escapeHtml(post.name)}

                ${badge}

            </div>

            <div class="time">

                ${timeAgo(post.createdAt)}

            </div>

        </div>

    </div>

    <div class="post-body">

        ${escapeHtml(post.text)}

    </div>

    ${

        post.image ?

        `<img class="post-image" src="${post.image}">`

        :

        ""

    }

    <div class="post-actions">

        <button
            class="likeBtn"
            data-id="${id}">

            ❤️ ${post.likes || 0}

        </button>

        <button
            class="commentBtn"
            data-id="${id}">

            💬 ${post.comments || 0}

        </button>

        ${

            isStaff ?

            `<button
                class="deleteBtn"
                data-id="${id}">

                🗑 Hapus

            </button>`

            :

            ""

        }

    </div>

    <div
        class="commentBox"
        id="commentBox-${id}">

    </div>

    `;

    feed.appendChild(card);

}

// ==========================================
// Badge
// ==========================================

function getBadge(role){

    switch(role){

        case "owner":

            return `<span class="badge owner">👑 Owner</span>`;

        case "developer":

            return `<span class="badge dev">💻 Developer</span>`;

        case "management":

            return `<span class="badge management">🛡 Management</span>`;

        case "headadmin":

            return `<span class="badge headadmin">⭐ Head Admin</span>`;

        case "admin":

            return `<span class="badge admin">🔰 Admin</span>`;

        case "moderator":

            return `<span class="badge moderator">🟢 Moderator</span>`;

        case "helper":

            return `<span class="badge helper">🟡 Helper</span>`;

        default:

            return "";

    }

}

// ==========================================
// Events
// ==========================================

document.addEventListener("click", async(e)=>{

    // LIKE

    if(e.target.classList.contains("likeBtn")){

        const id = e.target.dataset.id;

        try{

            await updateDoc(

                doc(db,"posts",id),

                {

                    likes: increment(1)

                }

            );

        }catch(err){

            console.error(err);

        }

    }

    // DELETE

    if(e.target.classList.contains("deleteBtn")){

        const id = e.target.dataset.id;

        if(!confirm("Hapus postingan ini?")) return;

        try{

            await deleteDoc(

                doc(db,"posts",id)

            );

        }catch(err){

            console.error(err);

        }

    }

    // COMMENT

    if(e.target.classList.contains("commentBtn")){

        const id = e.target.dataset.id;

        loadComments(id);

    }

});

// ==========================================
// COMMENTS
// Part 3
// ==========================================

function loadComments(postId){

    const box = document.getElementById("commentBox-" + postId);

    if(!box) return;

    box.innerHTML = `
        <div class="comments">

            <div class="comment-list" id="commentList-${postId}">
                Memuat komentar...
            </div>

            <div class="comment-input">

                <input
                    type="text"
                    id="commentInput-${postId}"
                    placeholder="Tulis komentar..."
                >

                <button
                    class="sendComment"
                    data-post="${postId}">

                    Kirim

                </button>

            </div>

        </div>
    `;

    const q = query(

        collection(db,"posts",postId,"comments"),

        orderBy("createdAt","asc")

    );

    onSnapshot(q,(snapshot)=>{

        const list = document.getElementById("commentList-"+postId);

        list.innerHTML = "";

        if(snapshot.empty){

            list.innerHTML = `
                <div class="empty-comment">
                    Belum ada komentar.
                </div>
            `;

            return;

        }

        snapshot.forEach((commentDoc)=>{

            const comment = commentDoc.data();

            const div = document.createElement("div");

            div.className = "comment-item";

            div.innerHTML = `

                <div class="comment-header">

                    <img
                        class="avatar"
                        src="${
                            comment.photo ||
                            "https://ui-avatars.com/api/?name="+
                            encodeURIComponent(comment.name)
                        }"
                    >

                    <div>

                        <b>

                            ${escapeHtml(comment.name)}

                        </b>

                        <div class="time">

                            ${timeAgo(comment.createdAt)}

                        </div>

                    </div>

                </div>

                <div class="comment-text">

                    ${escapeHtml(comment.text)}

                </div>

                <div class="comment-actions">

                    ${
                        currentRole!="player"

                        ?

                        `<button
                            class="deleteComment"
                            data-post="${postId}"
                            data-comment="${commentDoc.id}">
                            🗑 Hapus
                        </button>`

                        :

                        ""

                    }

                </div>

            `;

            list.appendChild(div);

        });

    });

}

// ==========================================
// SEND COMMENT
// ==========================================

document.addEventListener("click",async(e)=>{

    if(!e.target.classList.contains("sendComment"))
        return;

    const postId = e.target.dataset.post;

    const input = document.getElementById(
        "commentInput-"+postId
    );

    const text = input.value.trim();

    if(text.length<1)
        return;

    try{

        await addDoc(

            collection(db,"posts",postId,"comments"),

            {

                uid:currentUser.uid,

                name:currentUser.displayName,

                photo:currentUser.photoURL,

                text,

                createdAt:serverTimestamp()

            }

        );

        await updateDoc(

            doc(db,"posts",postId),

            {

                comments:increment(1)

            }

        );

        input.value="";

    }catch(err){

        console.error(err);

        alert("Gagal mengirim komentar.");

    }

});

// ==========================================
// DELETE COMMENT
// ==========================================

document.addEventListener("click",async(e)=>{

    if(!e.target.classList.contains("deleteComment"))
        return;

    if(!confirm("Hapus komentar ini?"))
        return;

    try{

        await deleteDoc(

            doc(

                db,

                "posts",

                e.target.dataset.post,

                "comments",

                e.target.dataset.comment

            )

        );

        await updateDoc(

            doc(db,"posts",e.target.dataset.post),

            {

                comments:increment(-1)

            }

        );

    }catch(err){

        console.error(err);

    }

});

// ==========================================
// TODO (Tahap Berikutnya)
// ==========================================
//
// - Reply komentar:
//   posts/{postId}/comments/{commentId}/replies/{replyId}
//
// - Like komentar:
//   simpan daftar UID yang sudah memberi like agar
//   satu akun hanya bisa like sekali.
//
// - Edit posting milik sendiri.
//
// - Upload gambar menggunakan Firebase Storage.
//
// - Pin posting khusus staff.
//
// - Notifikasi realtime.
//
// ==========================================