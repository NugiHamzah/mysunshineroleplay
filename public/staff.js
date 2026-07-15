// ==========================================
// My Sunshine Roleplay
// Staff Permission System
// ==========================================

import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

// ==========================================

export let currentRole = "player";

export let currentUser = null;

// ==========================================
// Staff Roles
// ==========================================

const STAFF_ROLES = [

    "owner",

    "developer",

    "management",

    "headadmin",

    "admin",

    "moderator",

    "helper"

];

// ==========================================
// Get User Role
// ==========================================

export async function loadStaffData(){

    return new Promise((resolve)=>{

        onAuthStateChanged(auth, async(user)=>{

            if(!user){

                resolve(null);

                return;

            }

            currentUser = user;

            const ref = doc(db,"users",user.uid);

            const snap = await getDoc(ref);

            if(snap.exists()){

                const data = snap.data();

                currentRole = data.role || "player";

            }

            resolve({

                user,

                role: currentRole,

                isStaff: STAFF_ROLES.includes(currentRole)

            });

        });

    });

}

// ==========================================
// Permission
// ==========================================

export function isStaff(){

    return STAFF_ROLES.includes(currentRole);

}

export function isOwner(){

    return currentRole === "owner";

}

export function isDeveloper(){

    return currentRole === "developer";

}

export function canDelete(){

    return STAFF_ROLES.includes(currentRole);

}

export function canPin(){

    return STAFF_ROLES.includes(currentRole);

}

export function canEdit(){

    return STAFF_ROLES.includes(currentRole);

}

export function canManageUsers(){

    return currentRole==="owner"

    || currentRole==="developer"

    || currentRole==="management";

}

// ==========================================
// Badge
// ==========================================

export function getBadge(){

    switch(currentRole){

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

        default:
            return "👤 Player";

    }

}

// ==========================================
// Show Staff Buttons
// ==========================================

export function showStaffButtons(){

    if(!isStaff()) return;

    document.querySelectorAll("[data-staff]").forEach(btn=>{

        btn.style.display="inline-flex";

    });

}

// ==========================================
// Hide Staff Buttons
// ==========================================

export function hideStaffButtons(){

    document.querySelectorAll("[data-staff]").forEach(btn=>{

        btn.style.display="none";

    });

}

// ==========================================
// Apply Permissions
// ==========================================

export async function applyPermissions(){

    const info = await loadStaffData();

    if(!info){

        hideStaffButtons();

        return;

    }

    if(info.isStaff){

        showStaffButtons();

    }else{

        hideStaffButtons();

    }

}