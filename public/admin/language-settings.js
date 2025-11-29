/**
 * Language Settings Module for Admin Panel
 * Provides full CRUD operations for site languages with flag picker
 */

var languageData = {
    languages: [],
    defaultLanguage: 'en'
};

// Country flags list for picker
var availableFlags = [    { name: "Ozbekiston", img: "https://flagcdn.com/w80/uz.png" },    { name: "Rossiya", img: "https://flagcdn.com/w80/ru.png" },    { name: "AQSH", img: "https://flagcdn.com/w80/us.png" },    { name: "Buyuk Britaniya", img: "https://flagcdn.com/w80/gb.png" },    { name: "Germaniya", img: "https://flagcdn.com/w80/de.png" },    { name: "Fransiya", img: "https://flagcdn.com/w80/fr.png" },    { name: "Italiya", img: "https://flagcdn.com/w80/it.png" },    { name: "Ispaniya", img: "https://flagcdn.com/w80/es.png" },    { name: "Xitoy", img: "https://flagcdn.com/w80/cn.png" },    { name: "Yaponiya", img: "https://flagcdn.com/w80/jp.png" },    { name: "Janubiy Koreya", img: "https://flagcdn.com/w80/kr.png" },    { name: "Turkiya", img: "https://flagcdn.com/w80/tr.png" },    { name: "Saudiya Arabistoni", img: "https://flagcdn.com/w80/sa.png" },    { name: "BAA", img: "https://flagcdn.com/w80/ae.png" },    { name: "Hindiston", img: "https://flagcdn.com/w80/in.png" },    { name: "Qozogiston", img: "https://flagcdn.com/w80/kz.png" },    { name: "Tojikiston", img: "https://flagcdn.com/w80/tj.png" },    { name: "Qirgiziston", img: "https://flagcdn.com/w80/kg.png" },    { name: "Ozarbayjon", img: "https://flagcdn.com/w80/az.png" },    { name: "Portugaliya", img: "https://flagcdn.com/w80/pt.png" },    { name: "Niderlandiya", img: "https://flagcdn.com/w80/nl.png" },    { name: "Polsha", img: "https://flagcdn.com/w80/pl.png" },    { name: "Braziliya", img: "https://flagcdn.com/w80/br.png" },    { name: "Avstraliya", img: "https://flagcdn.com/w80/au.png" },    { name: "Kanada", img: "https://flagcdn.com/w80/ca.png" },    { name: "Shvetsiya", img: "https://flagcdn.com/w80/se.png" },    { name: "Isroil", img: "https://flagcdn.com/w80/il.png" },    { name: "Misr", img: "https://flagcdn.com/w80/eg.png" },    { name: "Tailand", img: "https://flagcdn.com/w80/th.png" },    { name: "Vyetnam", img: "https://flagcdn.com/w80/vn.png" },    { name: "Gretsiya", img: "https://flagcdn.com/w80/gr.png" },    { name: "Ukraina", img: "https://flagcdn.com/w80/ua.png" },    { name: "Eron", img: "https://flagcdn.com/w80/ir.png" },    { name: "Afgoniston", img: "https://flagcdn.com/w80/af.png" },    { name: "Pokiston", img: "https://flagcdn.com/w80/pk.png" },    { name: "Indoneziya", img: "https://flagcdn.com/w80/id.png" },    { name: "Malayziya", img: "https://flagcdn.com/w80/my.png" },    { name: "Shveytsariya", img: "https://flagcdn.com/w80/ch.png" },    { name: "Avstriya", img: "https://flagcdn.com/w80/at.png" },    { name: "Belgiya", img: "https://flagcdn.com/w80/be.png" },    { name: "Meksika", img: "https://flagcdn.com/w80/mx.png" },    { name: "Argentina", img: "https://flagcdn.com/w80/ar.png" },    { name: "Chili", img: "https://flagcdn.com/w80/cl.png" },    { name: "Norvegiya", img: "https://flagcdn.com/w80/no.png" },    { name: "Finlandiya", img: "https://flagcdn.com/w80/fi.png" },    { name: "Daniya", img: "https://flagcdn.com/w80/dk.png" },    { name: "Vengriya", img: "https://flagcdn.com/w80/hu.png" },    { name: "Chexiya", img: "https://flagcdn.com/w80/cz.png" },    { name: "Ruminiya", img: "https://flagcdn.com/w80/ro.png" },    { name: "Bolgariya", img: "https://flagcdn.com/w80/bg.png" },    { name: "Irlandiya", img: "https://flagcdn.com/w80/ie.png" },    { name: "Singapur", img: "https://flagcdn.com/w80/sg.png" },    { name: "Gruziya", img: "https://flagcdn.com/w80/ge.png" },    { name: "Armaniston", img: "https://flagcdn.com/w80/am.png" },    { name: "Belarus", img: "https://flagcdn.com/w80/by.png" },    { name: "Estoniya", img: "https://flagcdn.com/w80/ee.png" },    { name: "Latviya", img: "https://flagcdn.com/w80/lv.png" },    { name: "Litva", img: "https://flagcdn.com/w80/lt.png" },    { name: "Xorvatiya", img: "https://flagcdn.com/w80/hr.png" },    { name: "Serbiya", img: "https://flagcdn.com/w80/rs.png" },    { name: "Albaniya", img: "https://flagcdn.com/w80/al.png" },    { name: "Qatar", img: "https://flagcdn.com/w80/qa.png" },    { name: "Kuvayt", img: "https://flagcdn.com/w80/kw.png" },    { name: "Iordaniya", img: "https://flagcdn.com/w80/jo.png" },    { name: "Livan", img: "https://flagcdn.com/w80/lb.png" },    { name: "Iroq", img: "https://flagcdn.com/w80/iq.png" },    { name: "Turkmaniston", img: "https://flagcdn.com/w80/tm.png" },    { name: "Kuba", img: "https://flagcdn.com/w80/cu.png" },    { name: "Peru", img: "https://flagcdn.com/w80/pe.png" },    { name: "Kolumbiya", img: "https://flagcdn.com/w80/co.png" }];

var selectedFlag = "";

// Load languages from API
async function loadLanguageSettings() {
    try {
        var response = await fetch("/api/languages/public");
        var data = await response.json(); console.log("Save response:", data);
        if (data.success) { languageData = data.data; renderLanguagesList();
            renderDefaultLanguageSelect();
        }
    } catch (error) {
        console.error("Error loading languages:", error);
    }
}

// Render languages list with edit/delete actions
function renderLanguagesList() { console.log("Rendering languages:", languageData);
    var container = document.getElementById("languagesListFull");
    if (!container) return;

    var languages = languageData.languages || [];
    var html = "";

    if (languages.length === 0) {
        html = '<div style="text-align:center;padding:40px;color:#6b7280;">Hech qanday til qo\'shilmagan</div>';
    } else {
        for (var i = 0; i < languages.length; i++) {
            var lang = languages[i];
            var isDefault = lang.isDefault || lang.code === languageData.defaultLanguage;
            var statusBadge = isDefault
                ? '<span style="background:#10b981;color:white;padding:2px 8px;border-radius:12px;font-size:11px;margin-left:8px;">Asosiy</span>'
                : '';
            var enabledBadge = lang.enabled
                ? '<span style="background:#3b82f6;color:white;padding:2px 8px;border-radius:12px;font-size:11px;">Faol</span>'
                : '<span style="background:#9ca3af;color:white;padding:2px 8px;border-radius:12px;font-size:11px;">O\'chirilgan</span>';

            html += '<div style="display:flex;align-items:center;gap:16px;padding:16px;background:#f9fafb;border-radius:12px;margin-bottom:12px;border:1px solid #e5e7eb;">';
            // Check if flag is a URL (image) or emoji
            if (lang.flag && lang.flag.startsWith('http')) {
                html += '<img src="' + lang.flag + '" style="width:48px;height:32px;object-fit:cover;border-radius:4px;box-shadow:0 2px 4px rgba(0,0,0,0.1);">';
            } else {
                html += '<span style="font-size:36px;">' + (lang.flag || '🌐') + '</span>';
            }
            html += '<div style="flex:1;">';
            html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">';
            html += '<span style="font-weight:700;font-size:18px;color:#1f2937;">' + lang.code.toUpperCase() + '</span>';
            html += statusBadge;
            html += enabledBadge;
            html += '</div>';
            html += '<span style="color:#6b7280;font-size:14px;">' + lang.name + '</span>';
            html += '</div>';
            html += '<div style="display:flex;gap:8px;">';

            // Set as default button (only if not already default)
            if (!isDefault) {
                html += '<button onclick="setAsDefaultLanguage(\'' + lang.code + '\')" style="background:#10b981;color:white;border:none;padding:8px 12px;border-radius:6px;cursor:pointer;font-size:13px;" title="Asosiy qilish">⭐</button>';
            }

            // Toggle enabled button
            html += '<button onclick="toggleLanguageEnabled(\'' + lang.code + '\',' + !lang.enabled + ')" style="background:' + (lang.enabled ? '#f59e0b' : '#3b82f6') + ';color:white;border:none;padding:8px 12px;border-radius:6px;cursor:pointer;font-size:13px;" title="' + (lang.enabled ? 'O\'chirish' : 'Yoqish') + '">' + (lang.enabled ? '👁️' : '👁️‍🗨️') + '</button>';

            // Edit button
            html += '<button onclick="editLanguage(\'' + lang.code + '\')" style="background:#6366f1;color:white;border:none;padding:8px 12px;border-radius:6px;cursor:pointer;font-size:13px;" title="Tahrirlash">✏️</button>';

            // Delete button (only if not default)
            if (!isDefault) {
                html += '<button onclick="deleteLanguage(\'' + lang.code + '\')" style="background:#ef4444;color:white;border:none;padding:8px 12px;border-radius:6px;cursor:pointer;font-size:13px;" title="O\'chirish">🗑️</button>';
            }

            html += '</div></div>';
        }
    }

    container.innerHTML = html;
}

// Render default language dropdown
function renderDefaultLanguageSelect() {
    var select = document.getElementById("defaultLanguageSelect");
    if (!select) return;

    var languages = (languageData.languages || []).filter(function(l) { return l.enabled; });
    var html = "";

    for (var i = 0; i < languages.length; i++) {
        var lang = languages[i];
        var selected = (lang.code === languageData.defaultLanguage || lang.isDefault) ? "selected" : "";
        html += '<option value="' + lang.code + '" ' + selected + '>' + lang.flag + ' ' + lang.code.toUpperCase() + ' - ' + lang.name + '</option>';
    }

    select.innerHTML = html;
}

// Set default language
async function setAsDefaultLanguage(code) {
    try {
        var response = await fetch("/api/languages/set-default/" + code, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("accessToken")
            }
            
        });
        var data = await response.json();
        if (data.success) {
            languageData = data.data;
            renderLanguagesList();
            renderDefaultLanguageSelect();
            showNotification("Asosiy til o'zgartirildi!", "success");
        } else {
            showNotification(data.message || "Xatolik yuz berdi", "error");
        }
    } catch (error) {
        showNotification("Server xatosi", "error");
    }
}

// Change default language from dropdown
async function changeDefaultLanguage() {
    var select = document.getElementById("defaultLanguageSelect");
    if (!select) return;
    await setAsDefaultLanguage(select.value);
}

// Toggle language enabled/disabled
async function toggleLanguageEnabled(code, enabled) {
    try {
        var response = await fetch("/api/languages/" + code, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("accessToken")
            },
            body: JSON.stringify({ enabled: enabled })
        });
        var data = await response.json();
        if (data.success) {
            languageData = data.data;
            renderLanguagesList();
            renderDefaultLanguageSelect();
            showNotification(enabled ? "Til yoqildi" : "Til o'chirildi", "success");
        } else {
            showNotification(data.message || "Xatolik", "error");
        }
    } catch (error) {
        showNotification("Server xatosi", "error");
    }
}

// Delete language
async function deleteLanguage(code) {
    if (!confirm("'" + code.toUpperCase() + "' tilini o'chirishni xohlaysizmi?")) return;

    try {
        var response = await fetch("/api/languages/" + code, {
            method: "DELETE",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("accessToken")
            }
            
        });
        var data = await response.json();
        if (data.success) {
            languageData = data.data;
            renderLanguagesList();
            renderDefaultLanguageSelect();
            showNotification("Til o'chirildi", "success");
        } else {
            showNotification(data.message || "O'chirib bo'lmadi", "error");
        }
    } catch (error) {
        showNotification("Server xatosi", "error");
    }
}

// Edit language (opens modal or inline edit)
function editLanguage(code) {
    var lang = languageData.languages.find(function(l) { return l.code === code; });
    if (!lang) return;

    document.getElementById("editLangCode").value = lang.code;
    document.getElementById("editLangName").value = lang.name;
    selectedFlag = lang.flag;
    updateFlagPickerDisplay("editFlagBtn", lang.flag);
    document.getElementById("editLangModal").style.display = "flex";
    document.getElementById("editLangModal").dataset.originalCode = code;
}

// Save edited language
async function saveEditedLanguage() { console.log("Saving with flag:", selectedFlag);
    var originalCode = document.getElementById("editLangModal").dataset.originalCode;
    var newCode = document.getElementById("editLangCode").value.trim().toLowerCase();
    var newName = document.getElementById("editLangName").value.trim();

    if (!newCode || !newName) {
        showNotification("Kod va nom kerak", "error");
        return;
    }

    try {
        var response = await fetch("/api/languages/" + originalCode, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("accessToken")
            },
            body: JSON.stringify({
                code: newCode,
                name: newName,
                flag: selectedFlag
            })
        });
        var data = await response.json(); console.log("PUT response:", response.status, data); if (!response.ok) { showNotification(data.message || "Xatolik", "error"); return; }
        if (data.success) {
            languageData = data.data;
            renderLanguagesList();
            renderDefaultLanguageSelect();
            closeEditModal();
            showNotification("Til yangilandi", "success");
        } else {
            showNotification(data.message || "Xatolik", "error");
        }
    } catch (error) {
        showNotification("Server xatosi", "error");
    }
}

function closeEditModal() {
    document.getElementById("editLangModal").style.display = "none";
}

// Add new language
async function addNewLanguageAPI() {
    var code = document.getElementById("newLangCodeInput").value.trim().toLowerCase();
    var name = document.getElementById("newLangNameInput").value.trim();
    var flag = document.getElementById("newLangFlagHidden").value;

    if (!code || !name) {
        showNotification("Kod va nom kerak", "error");
        return;
    }

    if (!/^[a-z]{2,3}$/.test(code)) {
        showNotification("Kod 2-3 harf bo'lishi kerak (masalan: en, uz, rus)", "error");
        return;
    }

    try {
        var response = await fetch("/api/languages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("accessToken")
            },
            body: JSON.stringify({
                code: code,
                name: name,
                flag: flag,
                enabled: true
            })
        });
        var data = await response.json();
        if (data.success) {
            languageData = data.data;
            renderLanguagesList();
            renderDefaultLanguageSelect();
            // Clear form
            document.getElementById("newLangCodeInput").value = "";
            document.getElementById("newLangNameInput").value = "";
            document.getElementById("newLangFlagHidden").value = "";
            resetFlagPicker("addFlagBtn");
            showNotification("Yangi til qo'shildi!", "success");
        } else {
            showNotification(data.message || "Xatolik", "error");
        }
    } catch (error) {
        showNotification("Server xatosi", "error");
    }
}

// Flag picker functions - dropdown style
function showFlagPicker(targetBtnId, hiddenInputId) {
    var picker = document.getElementById('flagPickerModal');
    var btn = document.getElementById(targetBtnId);
    
    picker.dataset.targetBtn = targetBtnId;
    picker.dataset.hiddenInput = hiddenInputId || '';
    
    var grid = document.getElementById('flagPickerGrid');
    var html = '';
    for (var i = 0; i < availableFlags.length; i++) {
        var f = availableFlags[i];
        html += '<div onclick="selectFlag(\x27' + f.img + '\x27)" style="display:flex;flex-direction:row;align-items:center;padding:10px 12px;border:2px solid transparent;border-radius:8px;background:#f8fafc;cursor:pointer;transition:all 0.15s;gap:12px;" onmouseover="this.style.borderColor=\x27#6366f1\x27;this.style.background=\x27#eef2ff\x27" onmouseout="this.style.borderColor=\x27transparent\x27;this.style.background=\x27#f8fafc\x27">';
        html += '<img src="' + f.img + '" alt="' + f.name + '" style="width:50px;height:34px;object-fit:cover;border-radius:3px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">';
        html += '<span style="font-size:13px;color:#374151;font-weight:500;">' + f.name + '</span>';
        html += '</div>';
    }
    grid.innerHTML = html;
    
    if (btn) {
        var rect = btn.getBoundingClientRect();
        var pickerHeight = 320;
        if (rect.bottom + pickerHeight > window.innerHeight) {
            picker.style.top = (rect.top - pickerHeight - 5) + 'px';
        } else {
            picker.style.top = (rect.bottom + 5) + 'px';
        }
        picker.style.left = rect.left + 'px';
    }
    
    picker.style.display = 'block';
}

function selectFlag(flag) {
    var picker = document.getElementById("flagPickerModal");
    var targetBtn = picker.dataset.targetBtn;
    var hiddenInput = picker.dataset.hiddenInput;

    selectedFlag = flag;

    if (hiddenInput) {
        document.getElementById(hiddenInput).value = flag;
    }

    updateFlagPickerDisplay(targetBtn, flag);
    closeFlagPicker();
}

function updateFlagPickerDisplay(btnId, flag) {
    var btn = document.getElementById(btnId);
    if (btn) {
        if (flag && flag.startsWith('http')) {
            btn.innerHTML = '<img src="' + flag + '" style="width:32px;height:22px;object-fit:cover;border-radius:2px;"> <span style="color:#6b7280;">▼</span>';
        } else {
            btn.innerHTML = '<span style="font-size:28px;">' + (flag || '🏳️') + '</span> <span style="color:#6b7280;">▼</span>';
        }
        btn.style.background = "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)";
        btn.style.borderColor = "#6366f1";
    }
}

function resetFlagPicker(btnId) {
    var btn = document.getElementById(btnId);
    if (btn) {
        btn.innerHTML = '<span style="font-size:24px;">🏳️</span> <span style="color:#6b7280;">Bayroq tanlang</span> <span style="margin-left:auto;color:#9ca3af;">▼</span>';
        btn.style.background = "linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)";
        btn.style.borderColor = "#e5e7eb";
    }
}

function closeFlagPicker() {
    document.getElementById("flagPickerModal").style.display = "none";
}

// Notification helper
function showNotification(message, type) {
    var notif = document.createElement("div");
    notif.style.cssText = "position:fixed;top:20px;right:20px;padding:16px 24px;border-radius:12px;color:white;font-weight:500;z-index:99999;animation:slideIn 0.3s ease;box-shadow:0 10px 40px rgba(0,0,0,0.2);";
    notif.style.background = type === "success" ? "linear-gradient(135deg, #10b981, #059669)" : "linear-gradient(135deg, #ef4444, #dc2626)";
    notif.textContent = message;
    document.body.appendChild(notif);

    setTimeout(function() {
        notif.style.opacity = "0";
        notif.style.transform = "translateX(100px)";
        setTimeout(function() { notif.remove(); }, 300);
    }, 3000);
}

// Initialize - call immediately since DOM is already loaded
setTimeout(loadLanguageSettings, 100);
console.log("Language settings script loaded!");

// Also listen for page changes
document.addEventListener("DOMContentLoaded", function() {

    // Close flag picker when clicking outside
    document.addEventListener("click", function(e) {
        var picker = document.getElementById("flagPickerModal");
        if (picker && picker.style.display === "block") {
            var inner = document.getElementById("flagPickerInner");
            var targetBtn = document.getElementById(picker.dataset.targetBtn);
            if (inner && !inner.contains(e.target) && (!targetBtn || !targetBtn.contains(e.target))) {
                closeFlagPicker();
            }
        }
    });
});

// Save all language settings
async function saveLanguageSettings() {
    try {
        var defaultLangSelect = document.getElementById("defaultLanguageSelect");
        var defaultLang = defaultLangSelect ? defaultLangSelect.value : languageData.defaultLanguage;

        var response = await fetch("/api/languages/save-all", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("accessToken")
            },
            body: JSON.stringify({
                languages: languageData.languages,
                defaultLanguage: defaultLang
            })
        });
        var data = await response.json();
        if (data.success) {
            languageData = data.data;
            renderLanguagesList();
            renderDefaultLanguageSelect();
            showNotification("Til sozlamalari saqlandi!", "success");
        } else {
            showNotification(data.message || "Saqlashda xatolik", "error");
        }
    } catch (error) {
        console.error("Save error:", error);
        showNotification("Server xatosi", "error");
    }
}
