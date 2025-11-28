const fs = require('fs');

let html = fs.readFileSync('public/admin/index.html', 'utf8');

const oldToggleFunction = `        // Toggle destination status
        async function toggleDestinationStatus(id, currentStatus) {
            const newStatus = currentStatus === 'active' ? 'draft' : 'active';
            try {
                const response = await fetch(API_URL + '/destinations/' + id, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: newStatus })
                });
                const result = await response.json();
                if (result.success) {
                    showNotification('Status changed to ' + newStatus, 'success');
                    loadDestinations();
                } else {
                    showNotification(result.message || 'Failed to update status', 'error');
                }
            } catch (error) {
                console.error('Error updating status:', error);
                showNotification('Failed to update status', 'error');
            }
        }`;

const newToggleFunction = `        // Toggle destination status with instant UI update
        async function toggleDestinationStatus(id, currentStatus) {
            const newStatus = currentStatus === 'active' ? 'draft' : 'active';

            // Instant UI update (optimistic)
            const btn = event.target.closest('.status-toggle-btn');
            if (btn) {
                btn.classList.toggle('active');
                const statusText = btn.querySelector('.status-text');
                if (statusText) {
                    statusText.textContent = newStatus === 'active' ? 'Active' : 'Draft';
                }
                btn.setAttribute('onclick', "toggleDestinationStatus('" + id + "', '" + newStatus + "')");
            }

            // Update local data
            const destIndex = allDestinations.findIndex(d => d._id === id);
            if (destIndex !== -1) {
                allDestinations[destIndex].status = newStatus;
                updateDestinationStats();
            }

            try {
                const response = await fetch(API_URL + '/destinations/' + id, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: newStatus })
                });
                const result = await response.json();
                if (result.success) {
                    showNotification('Status changed to ' + newStatus, 'success');
                } else {
                    // Revert on error
                    showNotification(result.message || 'Failed to update status', 'error');
                    loadDestinations();
                }
            } catch (error) {
                console.error('Error updating status:', error);
                showNotification('Failed to update status', 'error');
                loadDestinations();
            }
        }`;

// Replace all occurrences
html = html.split(oldToggleFunction).join(newToggleFunction);

fs.writeFileSync('public/admin/index.html', html);
console.log('Status toggle function updated with instant UI!');
