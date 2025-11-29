// Flag Picker for Admin Panel - Visual Button Style
var countryFlags = [
    { flag: "🇺🇿", name: "Ozbekiston" },
    { flag: "🇷🇺", name: "Rossiya" },
    { flag: "🇺🇸", name: "AQSH" },
    { flag: "🇬🇧", name: "Buyuk Britaniya" },
    { flag: "🇩🇪", name: "Germaniya" },
    { flag: "🇫🇷", name: "Fransiya" },
    { flag: "🇮🇹", name: "Italiya" },
    { flag: "🇪🇸", name: "Ispaniya" },
    { flag: "🇨🇳", name: "Xitoy" },
    { flag: "🇯🇵", name: "Yaponiya" },
    { flag: "🇰🇷", name: "Janubiy Koreya" },
    { flag: "🇹🇷", name: "Turkiya" },
    { flag: "🇸🇦", name: "Saudiya Arabistoni" },
    { flag: "🇦🇪", name: "BAA" },
    { flag: "🇮🇳", name: "Hindiston" },
    { flag: "🇰🇿", name: "Qozogiston" },
    { flag: "🇹🇯", name: "Tojikiston" },
    { flag: "🇰🇬", name: "Qirgiziston" },
    { flag: "🇦🇿", name: "Ozarbayjon" },
    { flag: "🇵🇹", name: "Portugaliya" },
    { flag: "🇳🇱", name: "Niderlandiya" },
    { flag: "🇵🇱", name: "Polsha" },
    { flag: "🇧🇷", name: "Braziliya" },
    { flag: "🇦🇺", name: "Avstraliya" },
    { flag: "🇨🇦", name: "Kanada" },
    { flag: "🇸🇪", name: "Shvetsiya" },
    { flag: "🇮🇱", name: "Isroil" },
    { flag: "🇪🇬", name: "Misr" },
    { flag: "🇹🇭", name: "Tailand" },
    { flag: "🇻🇳", name: "Vyetnam" },
    { flag: "🇬🇷", name: "Gretsiya" },
    { flag: "🇺🇦", name: "Ukraina" },
    { flag: "🇮🇷", name: "Eron" },
    { flag: "🇦🇫", name: "Afgoniston" },
    { flag: "🇵🇰", name: "Pokiston" },
    { flag: "🇮🇩", name: "Indoneziya" },
    { flag: "🇲🇾", name: "Malayziya" },
    { flag: "🇨🇭", name: "Shveytsariya" },
    { flag: "🇦🇹", name: "Avstriya" },
    { flag: "🇧🇪", name: "Belgiya" },
    { flag: "🇲🇽", name: "Meksika" },
    { flag: "🇦🇷", name: "Argentina" },
    { flag: "🇨🇱", name: "Chili" },
    { flag: "🇳🇴", name: "Norvegiya" },
    { flag: "🇫🇮", name: "Finlandiya" },
    { flag: "🇩🇰", name: "Daniya" },
    { flag: "🇭🇺", name: "Vengriya" },
    { flag: "🇨🇿", name: "Chexiya" },
    { flag: "🇷🇴", name: "Ruminiya" },
    { flag: "🇧🇬", name: "Bolgariya" }
];

function initFlagPicker() {
    var element = document.getElementById("newLangFlag");
    if (!element || document.getElementById("flagPickerBtn")) return;

    var parent = element.parentNode;

    var container = document.createElement("div");
    container.style.cssText = "position: relative; width: 100%;";

    var hiddenInput = document.createElement("input");
    hiddenInput.type = "hidden";
    hiddenInput.id = "newLangFlag";
    hiddenInput.name = "newLangFlag";

    var btn = document.createElement("button");
    btn.type = "button";
    btn.id = "flagPickerBtn";
    btn.innerHTML = "<span style=\"font-size: 24px;\">🏳️</span> <span style=\"color: #6b7280;\">Bayroq tanlang</span> <span style=\"margin-left: auto; color: #9ca3af;\">▼</span>";
    btn.style.cssText = "width: 100%; padding: 14px 18px; font-size: 15px; border: 2px solid #e5e7eb; border-radius: 10px; background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%); cursor: pointer; display: flex; align-items: center; gap: 12px; transition: all 0.25s ease; box-shadow: 0 2px 4px rgba(0,0,0,0.05);";

    var dropdown = document.createElement("div");
    dropdown.id = "flagDropdown";
    dropdown.style.cssText = "display: none; position: absolute; top: calc(100% + 8px); left: 0; right: 0; background: white; border: 2px solid #e5e7eb; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.25); padding: 16px; z-index: 99999; max-height: 350px; overflow-y: auto;";

    var grid = "<div style=\"display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px;\">";
    countryFlags.forEach(function(c) {
        grid += "<button type=\"button\" class=\"fp-btn\" data-flag=\"" + c.flag + "\" data-name=\"" + c.name + "\" title=\"" + c.name + "\" style=\"font-size: 32px; width: 50px; height: 50px; border: 2px solid transparent; border-radius: 12px; background: #f8fafc; cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; justify-content: center;\">" + c.flag + "</button>";
    });
    grid += "</div>";
    dropdown.innerHTML = grid;

    container.appendChild(hiddenInput);
    container.appendChild(btn);
    container.appendChild(dropdown);

    element.parentNode.replaceChild(container, element);

    btn.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        var isOpen = dropdown.style.display === "block";
        dropdown.style.display = isOpen ? "none" : "block";
        btn.style.borderColor = isOpen ? "#e5e7eb" : "#6366f1";
        btn.style.boxShadow = isOpen ? "0 2px 4px rgba(0,0,0,0.05)" : "0 4px 12px rgba(99,102,241,0.3)";
    };

    btn.onmouseover = function() {
        if (dropdown.style.display !== "block") {
            this.style.borderColor = "#a5b4fc";
            this.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
        }
    };
    btn.onmouseout = function() {
        if (dropdown.style.display !== "block") {
            this.style.borderColor = "#e5e7eb";
            this.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";
        }
    };

    dropdown.querySelectorAll(".fp-btn").forEach(function(b) {
        b.onmouseover = function() {
            this.style.borderColor = "#6366f1";
            this.style.background = "#eef2ff";
            this.style.transform = "scale(1.15)";
            this.style.boxShadow = "0 4px 12px rgba(99,102,241,0.3)";
        };
        b.onmouseout = function() {
            this.style.borderColor = "transparent";
            this.style.background = "#f8fafc";
            this.style.transform = "scale(1)";
            this.style.boxShadow = "none";
        };
        b.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            var flag = this.dataset.flag;
            var name = this.dataset.name;
            hiddenInput.value = flag;
            btn.innerHTML = "<span style=\"font-size: 28px;\">" + flag + "</span> <span style=\"font-weight: 600; color: #1f2937;\">" + name + "</span> <span style=\"margin-left: auto; color: #9ca3af;\">▼</span>";
            btn.style.background = "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)";
            btn.style.borderColor = "#6366f1";
            dropdown.style.display = "none";
        };
    });

    document.addEventListener("click", function(e) {
        if (!container.contains(e.target)) {
            dropdown.style.display = "none";
            btn.style.borderColor = "#e5e7eb";
            btn.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";
        }
    });
}

setInterval(function() {
    var element = document.getElementById("newLangFlag");
    var btn = document.getElementById("flagPickerBtn");
    if (element && !btn && (element.tagName === "INPUT" || element.tagName === "SELECT")) {
        initFlagPicker();
    }
}, 300);

document.addEventListener("DOMContentLoaded", function() {
    setTimeout(initFlagPicker, 500);
});
