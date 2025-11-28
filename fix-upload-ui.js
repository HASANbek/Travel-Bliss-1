const fs = require('fs');

let html = fs.readFileSync('public/admin/index.html', 'utf8');

// Fix the upload function to use correct response field (filePath instead of url)
const oldUploadFunc = `        // Upload destination image
        async function uploadDestinationImage(fileInput, targetInputId, previewId) {
            if (!fileInput.files || !fileInput.files[0]) {
                return;
            }

            const file = fileInput.files[0];
            const preview = document.getElementById(previewId);
            const targetInput = document.getElementById(targetInputId);

            // Show loading state
            if (preview) {
                preview.innerHTML = '<div style="color: #667eea; padding: 20px;">⏳ Uploading...</div>';
            }

            const formData = new FormData();
            formData.append('image', file);

            try {
                const response = await fetch(API_URL + '/upload', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (result.success && result.data && result.data.url) {
                    // Set the URL to input field
                    targetInput.value = result.data.url;
                    // Update preview
                    updateDestImagePreview(targetInputId, previewId);
                    showNotification('Image uploaded successfully!', 'success');
                } else {
                    throw new Error(result.message || 'Upload failed');
                }
            } catch (error) {
                console.error('Upload error:', error);
                showNotification('Failed to upload image: ' + error.message, 'error');
                if (preview) {
                    preview.innerHTML = '<div style="color: #ef4444;">Upload failed. Try again.</div>';
                }
            }

            // Reset file input
            fileInput.value = '';
        }`;

const newUploadFunc = `        // Upload destination image (single)
        async function uploadDestinationImage(fileInput, targetInputId, previewId) {
            if (!fileInput.files || !fileInput.files[0]) {
                return;
            }

            const file = fileInput.files[0];
            const preview = document.getElementById(previewId);
            const targetInput = document.getElementById(targetInputId);

            // Show loading state
            if (preview) {
                preview.innerHTML = '<div style="color: #667eea; padding: 20px; text-align: center;"><div style="font-size: 24px;">⏳</div>Uploading...</div>';
            }

            const formData = new FormData();
            formData.append('image', file);

            try {
                const response = await fetch(API_URL + '/upload', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();
                console.log('Upload result:', result);

                if (result.success && result.data && result.data.filePath) {
                    // Set the URL to input field
                    targetInput.value = result.data.filePath;
                    // Update preview
                    updateDestImagePreview(targetInputId, previewId);
                    showNotification('Image uploaded successfully!', 'success');
                } else {
                    throw new Error(result.message || 'Upload failed');
                }
            } catch (error) {
                console.error('Upload error:', error);
                showNotification('Failed to upload image: ' + error.message, 'error');
                if (preview) {
                    preview.innerHTML = '<div style="color: #ef4444; padding: 20px; text-align: center;"><div style="font-size: 24px;">❌</div>Upload failed</div>';
                }
            }

            // Reset file input
            fileInput.value = '';
        }

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

html = html.split(oldUploadFunc).join(newUploadFunc);

fs.writeFileSync('public/admin/index.html', html);
console.log('Upload function fixed!');
