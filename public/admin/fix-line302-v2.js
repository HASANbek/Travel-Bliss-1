const fs = require('fs');
let content = fs.readFileSync('language-settings.js', 'utf8');
const lines = content.split('\n');

// Find the line number (0-indexed would be 301 for line 302)
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("selectFlag(''") && lines[i].includes("onmouseover")) {
        // Build the correct line using string concatenation to avoid escaping issues
        lines[i] = '        html += \'<div onclick="selectFlag(\\'' + "'" + '\' + f.img + \'' + "'" + '\\')" style="display:flex;flex-direction:column;align-items:center;padding:12px 8px;border:2px solid transparent;border-radius:12px;background:#f8fafc;cursor:pointer;transition:all 0.2s;min-width:80px;" onmouseover="this.style.borderColor=\\'' + "'" + '#6366f1\\'' + "'" + ';this.style.background=\\'' + "'" + '#eef2ff\\'' + "'" + ';this.style.transform=\\'' + "'" + 'scale(1.05)\\'' + "'" + '" onmouseout="this.style.borderColor=\\'' + "'" + 'transparent\\'' + "'" + ';this.style.background=\\'' + "'" + '#f8fafc\\'' + "'" + ';this.style.transform=\\'' + "'" + 'scale(1)\\'' + "'" + '">\';';
        console.log('Found and fixed line', i + 1);
        break;
    }
}

content = lines.join('\n');
fs.writeFileSync('language-settings.js', content);
