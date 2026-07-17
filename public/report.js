// ==========================================
// My Sunshine Roleplay
// Report System
// report.js
// ==========================================

const form = document.getElementById("reportForm");
const fileInput = document.getElementById("file");
const preview = document.getElementById("preview");
const uploadBox = document.querySelector(".upload");
const submitBtn = form.querySelector("button");

// ===============================
// Preview File
// ===============================

function previewFile(file) {

    preview.innerHTML = "";

    if (!file) return;

    const url = URL.createObjectURL(file);

    if (file.type.startsWith("image/")) {

        preview.innerHTML = `
            <img src="${url}" alt="Preview">
            <p class="info">${file.name}</p>
        `;

    } else if (file.type.startsWith("video/")) {

        preview.innerHTML = `
            <video controls>
                <source src="${url}" type="${file.type}">
            </video>
            <p class="info">${file.name}</p>
        `;

    } else {

        preview.innerHTML = `
            <p class="info">${file.name}</p>
        `;
    }
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
    const ic = form.ic.value.trim();
    const laporan = form.laporan.value.trim();

    if (!ucp) {

        alert("Nama UCP wajib diisi.");
        return;

    }

    if (!ic) {

        alert("Nama IC wajib diisi.");
        return;

    }

    if (!laporan) {

        alert("Isi laporan wajib diisi.");
        return;

    }

    submitReport();

});

// ===============================
// Upload
// ===============================

function submitReport() {

    submitBtn.disabled = true;

    submitBtn.innerHTML = "Mengirim...";

    const data = new FormData(form);

    const xhr = new XMLHttpRequest();

    xhr.open("POST", "/api/report", true);

    xhr.upload.onprogress = function (e) {

        if (!e.lengthComputable) return;

        const percent = Math.round((e.loaded / e.total) * 100);

        submitBtn.innerHTML = `Uploading ${percent}%`;

    };

    xhr.onload = function () {

        submitBtn.disabled = false;

        submitBtn.innerHTML = "🚀 Kirim Report";

        if (xhr.status === 200) {

            let res = {};

            try {

                res = JSON.parse(xhr.responseText);

            } catch {

                alert("Response server tidak valid.");
                return;

            }

            if (res.success) {

                alert("✅ Report berhasil dikirim!");

                form.reset();

                preview.innerHTML = "";

            } else {

                alert(res.message || "Gagal mengirim report.");

            }

        } else {

            alert("Server Error (" + xhr.status + ")");

        }

    };

    xhr.onerror = function () {

        submitBtn.disabled = false;

        submitBtn.innerHTML = "🚀 Kirim Report";

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

    const maxSize = 25 * 1024 * 1024; // 25 MB

    if (file.size > maxSize) {

        alert("Ukuran file maksimal 25 MB.");

        fileInput.value = "";

        preview.innerHTML = "";

        return;

    }

    const allowed = [

        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "video/mp4",
        "video/webm",
        "video/quicktime"

    ];

    if (!allowed.includes(file.type)) {

        alert("Format file tidak didukung.");

        fileInput.value = "";

        preview.innerHTML = "";

        return;

    }

    previewFile(file);

});

console.log("✅ Report System Loaded");