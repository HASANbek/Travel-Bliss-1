const fs = require('fs');

let html = fs.readFileSync('public/admin/index.html', 'utf8');

// Add uploadDestinationImage function after updateDestImagePreview
const searchStr = `        function updateDestImagePreview(inputId, previewId) {
            var input = document.getElementById(inputId);
            var preview = document.getElementById(previewId);
            if (input && preview) {
                if (input.value) {
                    preview.innerHTML = '<img src="' + input.value + '" style="max-width: 100%; max-height: 150px; object-fit: cover; border-radius: 6px;" onerror="this.parentElement.innerHTML=\\'Invalid image URL\\'">';
                } else {
                    preview.innerHTML = 'No image preview';
                }
            }
        }`;

const replaceStr = `        function updateDestImagePreview(inputId, previewId) {
            var input = document.getElementById(inputId);
            var preview = document.getElementById(previewId);
            if (input && preview) {
                if (input.value) {
                    preview.innerHTML = '<img src="' + input.value + '" style="max-width: 100%; max-height: 150px; object-fit: cover; border-radius: 6px;" onerror="this.parentElement.innerHTML=\\'Invalid image URL\\'">';
                } else {
                    preview.innerHTML = 'No image preview';
                }
            }
        }

        // Upload destination image
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

// Replace all occurrences
html = html.split(searchStr).join(replaceStr);

fs.writeFileSync('public/admin/index.html', html);
console.log('Upload function added!');
