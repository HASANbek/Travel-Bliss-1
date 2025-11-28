const fs = require('fs');

let html = fs.readFileSync('public/admin/index.html', 'utf8');

// Remove the duplicate uploadGalleryImages function from index.html
// (the one we added earlier that conflicts with destinations.js)
const oldUploadGalleryFunc = `
        // Upload multiple gallery images
        async function uploadGalleryImages(fileInput) {
            if (!fileInput.files || fileInput.files.length === 0) {
                return;
            }

            const container = document.getElementById('galleryImagesContainer');
            const files = Array.from(fileInput.files);

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const formData = new FormData();
                formData.append('image', file);

                try {
                    const response = await fetch(API_URL + '/upload', {
                        method: 'POST',
                        body: formData
                    });

                    const result = await response.json();

                    if (result.success && result.data && result.data.filePath) {
                        addGalleryImageField(result.data.filePath);
                    }
                } catch (error) {
                    console.error('Gallery upload error:', error);
                }
            }

            showNotification(files.length + ' image(s) uploaded!', 'success');
            fileInput.value = '';
        }`;

// Remove all occurrences
html = html.split(oldUploadGalleryFunc).join('');

fs.writeFileSync('public/admin/index.html', html);
console.log('Removed duplicate uploadGalleryImages from index.html');

// Now update destinations.js to use alert instead of showNotification if not available
let destJs = fs.readFileSync('public/admin/destinations.js', 'utf8');

// Update the uploadGalleryImages function to handle missing showNotification
destJs = destJs.replace(
    "if (typeof showNotification === 'function') {\n    showNotification('Uploading ' + files.length + ' image(s)...', 'info');\n  }",
    "console.log('Uploading ' + files.length + ' image(s)...');"
);

destJs = destJs.replace(
    "if (typeof showNotification === 'function') {\n    showNotification(uploadedCount + ' image(s) uploaded successfully!', 'success');\n  }",
    "alert(uploadedCount + ' image(s) uploaded successfully!');"
);

fs.writeFileSync('public/admin/destinations.js', destJs);
console.log('Updated destinations.js notification handling');

console.log('Done!');
