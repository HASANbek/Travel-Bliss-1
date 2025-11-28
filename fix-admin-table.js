const fs = require('fs');

let html = fs.readFileSync('public/admin/index.html', 'utf8');

const oldRenderFunction = `function renderDestinationsTable() {
            const tbody = document.getElementById('destinationsTableBody');
            if (!tbody) return;
            updateDestinationStats();
            if (allDestinations.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" style="padding: 40px; text-align: center; color: #9ca3af;">No destinations found</td></tr>';
                return;
            }
            tbody.innerHTML = allDestinations.map(dest => '<tr>' +
                '<td><img src="' + (dest.main_image || '/images/placeholder.jpg') + '" alt="' + dest.title + '" style="width: 60px; height: 40px; object-fit: cover; border-radius: 4px;"></td>' +
                '<td><strong>' + dest.title + '</strong><br><small style="color: #6c757d;">' + dest.slug + '</small></td>' +
                '<td>' + (dest.country_code || 'UZ') + '</td>' +
                '<td>' + (dest.trips_count || 0) + '</td>' +
                '<td><span class="badge ' + (dest.status === 'active' ? 'badge-success' : 'badge-warning') + '">' + dest.status + '</span>' + (dest.featured ? '<span class="badge" style="background:#17a2b8;color:white;margin-left:5px;">Featured</span>' : '') + '</td>' +
                '<td>' + new Date(dest.createdAt).toLocaleDateString() + '</td>' +
                '<td><button class="action-btn edit-btn" onclick="editDestination(\\'' + dest._id + '\\')">Edit</button><button class="action-btn delete-btn" onclick="deleteDestination(\\'' + dest._id + '\\')">Delete</button></td>' +
                '</tr>').join('');
        }`;

const newRenderFunction = `function renderDestinationsTable() {
            const tbody = document.getElementById('destinationsTableBody');
            if (!tbody) return;
            updateDestinationStats();
            if (allDestinations.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" style="padding: 40px; text-align: center; color: #9ca3af;">No destinations found</td></tr>';
                return;
            }
            tbody.innerHTML = allDestinations.map(dest => '<tr>' +
                '<td><img src="' + (dest.main_image || 'https://via.placeholder.com/60x40?text=No+Image') + '" alt="' + (dest.title || 'Destination') + '" style="width: 60px; height: 40px; object-fit: cover; border-radius: 4px; background: #f3f4f6;" onerror="this.src=\\'https://via.placeholder.com/60x40?text=No+Image\\'"></td>' +
                '<td><strong>' + (dest.title || 'Untitled') + '</strong><br><small style="color: #6c757d;">' + dest.slug + '</small></td>' +
                '<td>' + (dest.country_code || 'UZ') + '</td>' +
                '<td>' + (dest.trips_count || 0) + '</td>' +
                '<td><div class="status-toggle-wrapper"><button class="status-toggle-btn ' + (dest.status === 'active' ? 'active' : '') + '" onclick="toggleDestinationStatus(\\'' + dest._id + '\\', \\'' + dest.status + '\\')" title="Click to toggle status"><span class="status-dot"></span><span class="status-text">' + (dest.status === 'active' ? 'Active' : 'Draft') + '</span></button>' + (dest.featured ? '<span class="featured-badge" title="Featured">★</span>' : '') + '</div></td>' +
                '<td>' + new Date(dest.createdAt).toLocaleDateString() + '</td>' +
                '<td><div class="action-buttons"><button class="action-btn view-btn" onclick="viewDestination(\\'' + dest.slug + '\\')" title="View"><i class="fas fa-eye"></i></button><button class="action-btn edit-btn" onclick="editDestination(\\'' + dest._id + '\\')" title="Edit"><i class="fas fa-edit"></i></button><button class="action-btn delete-btn" onclick="deleteDestination(\\'' + dest._id + '\\')" title="Delete"><i class="fas fa-trash"></i></button></div></td>' +
                '</tr>').join('');
        }

        // Toggle destination status
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
        }

        // View destination on frontend
        function viewDestination(slug) {
            window.open('/gofly/destination-details.html?slug=' + slug, '_blank');
        }`;

// Replace all occurrences
html = html.split(oldRenderFunction).join(newRenderFunction);

fs.writeFileSync('public/admin/index.html', html);
console.log('Admin table updated! Replacements made:', html.includes('toggleDestinationStatus') ? 'Success' : 'Failed');
