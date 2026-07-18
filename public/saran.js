const express = require("express");
const app = express();
const multer = require("multer");
const path = require("path");

// ===============================
// Preview File
// ===============================

function previewFile(file) {

    preview.innerHTML = "";

    if (!file) return;

    const url = URL.createObjectURL(file);

    preview.innerHTML = `
        <img src="${url}" alt="Preview">
        <p class="info">${file.name}</p>
    `;

}

fileInput.addEventListener("change", () => {

    if (fileInput.files.length)
        previewFile(fileInput.files[0]);

});

// ===============================
// Drag & Drop
// ===============================

["dragenter", "dragover"].forEach(event => {

    uploadBox.addEventListener(event, e => {

        e.preventDefault();

        uploadBox.style.borderColor = "#00ff88";
        uploadBox.style.background = "#202020";

    });

});

["dragleave", "drop"].forEach(event => {

    uploadBox.addEventListener(event, e => {

        e.preventDefault();

        uploadBox.style.borderColor = "#FFD700";
        uploadBox.style.background = "";

    });

});

uploadBox.addEventListener("drop", e => {

    e.preventDefault();

    const files = e.dataTransfer.files;

    if (!files.length) return;

    fileInput.files = files;

    previewFile(files[0]);

});

// ===============================
// Submit Form
// ===============================

form.addEventListener("submit", function (e) {

    e.preventDefault();

    const ucp = form.ucp.value.trim();
    const judul = form.judul.value.trim();
    const pesan = form.pesan.value.trim();

    if (!ucp) {

        alert("Nama UCP wajib diisi.");
        return;

    }

    if (!judul) {

        alert("Judul masukan wajib diisi.");
        return;

    }

    if (!pesan) {

        alert("Isi kritik & saran wajib diisi.");
        return;

    }

    submitFeedback();

});

// ===============================
// Upload
// ===============================

function submitFeedback() {

    submitBtn.disabled = true;

    submitBtn.innerHTML = "Mengirim...";

    const data = new FormData(form);

    const xhr = new XMLHttpRequest();

    xhr.open("POST", "/api/feedback", true);

    xhr.upload.onprogress = function (e) {

        if (!e.lengthComputable) return;

        const percent = Math.round((e.loaded / e.total) * 100);

        submitBtn.innerHTML = `Mengupload ${percent}%`;

    };

    xhr.onload = function () {

        submitBtn.disabled = false;

        submitBtn.innerHTML = "💡 Kirim Kritik & Saran";

        if (xhr.status === 200) {

            let res = {};

            try {

                res = JSON.parse(xhr.responseText);

            } catch {

                alert("Response server tidak valid.");
                return;

            }

            if (res.success) {

                alert("✅ Terima kasih! Kritik & saran berhasil dikirim.");

                form.reset();

                preview.innerHTML = "";

            } else {

                alert(res.message || "Gagal mengirim kritik & saran.");

            }

        } else {

            alert("Server Error (" + xhr.status + ")");

        }

    };

    xhr.onerror = function () {

        submitBtn.disabled = false;

        submitBtn.innerHTML = "💡 Kirim Kritik & Saran";

        alert("Tidak dapat terhubung ke server.");

    };

    xhr.send(data);

}

// ===============================
// File Validation
// ===============================

fileInput.addEventListener("change", () => {

    const file = fileInput.files[0];

    if (!file) return;

    const maxSize = 10 * 1024 * 1024; // 10 MB

    if (file.size > maxSize) {

        alert("Ukuran gambar maksimal 10 MB.");

        fileInput.value = "";

        preview.innerHTML = "";

        return;

    }

    const allowed = [

        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp"

    ];

    if (!allowed.includes(file.type)) {

        alert("Hanya file JPG, PNG, atau WEBP yang diperbolehkan.");

        fileInput.value = "";

        preview.innerHTML = "";

        return;

    }

    previewFile(file);

});

console.log("✅ Kritik & Saran System Loaded");