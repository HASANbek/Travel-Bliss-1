// Destinations Management Module
const API_URL = typeof window.API_URL !== 'undefined' ? window.API_URL : '/api';
let allDestinations = [];
let currentDestinationId = null;

// Load destinations
async function loadDestinations() {
  try {
    const searchInput = document.getElementById('destinationSearch');
    const statusFilter = document.getElementById('destinationStatusFilter');

    let url = `${API_URL}/destinations`;
    const params = new URLSearchParams();

    if (searchInput && searchInput.value) {
      params.append('search', searchInput.value);
    }
    if (statusFilter && statusFilter.value) {
      params.append('status', statusFilter.value);
    }

    if (params.toString()) {
      url += '?' + params.toString();
    }

    const response = await fetch(url);
    const result = await response.json();

    if (result.success) {
      allDestinations = result.data.destinations || [];
      renderDestinationsTable();
    }
  } catch (error) {
    console.error('Error loading destinations:', error);
    showNotification('Failed to load destinations', 'error');
  }
}

// Update stats
function updateDestinationStats() {
  const total = allDestinations.length;
  const active = allDestinations.filter(d => d.status === 'active').length;
  const draft = allDestinations.filter(d => d.status === 'draft').length;
  const featured = allDestinations.filter(d => d.featured).length;

  const totalEl = document.getElementById('totalDestinations');
  const activeEl = document.getElementById('activeDestinations');
  const draftEl = document.getElementById('draftDestinations');
  const featuredEl = document.getElementById('featuredDestinations');

  if (totalEl) totalEl.textContent = total;
  if (activeEl) activeEl.textContent = active;
  if (draftEl) draftEl.textContent = draft;
  if (featuredEl) featuredEl.textContent = featured;
}

// Render destinations table
function renderDestinationsTable() {
  const tbody = document.getElementById('destinationsTableBody');
  if (!tbody) return;

  // Update stats
  updateDestinationStats();

  if (allDestinations.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="text-center" style="padding: 40px; color: #9ca3af;">No destinations found</td></tr>';
    return;
  }

  tbody.innerHTML = allDestinations.map(dest => `
    <tr data-id="${dest._id}">
      <td>
        <img src="${dest.main_image || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="40" viewBox="0 0 60 40"%3E%3Crect fill="%23e5e7eb" width="60" height="40"/%3E%3Ctext fill="%239ca3af" font-family="Arial" font-size="8" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E'}"
             alt="${dest.title}"
             style="width: 60px; height: 40px; object-fit: cover; border-radius: 4px; background: #f3f4f6;"
             onerror="this.src='data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="40" viewBox="0 0 60 40"%3E%3Crect fill="%23e5e7eb" width="60" height="40"/%3E%3Ctext fill="%239ca3af" font-family="Arial" font-size="8" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E'">
      </td>
      <td>
        <strong>${dest.title || 'Untitled'}</strong>
        <br><small class="text-muted">${dest.slug}</small>
      </td>
      <td>${dest.country_code || 'UZ'}</td>
      <td>${dest.trips_count || 0}</td>
      <td>
        <div class="status-toggle-wrapper">
          <button class="status-toggle-btn ${dest.status === 'active' ? 'active' : ''}"
                  onclick="toggleDestinationStatus('${dest._id}', '${dest.status}')"
                  title="Click to toggle status">
            <span class="status-dot"></span>
            <span class="status-text">${dest.status === 'active' ? 'Active' : 'Draft'}</span>
          </button>
          ${dest.featured ? '<span class="featured-badge" title="Featured">&#9733;</span>' : ''}
        </div>
      </td>
      <td>${new Date(dest.createdAt).toLocaleDateString()}</td>
      <td>
        <div class="action-buttons">
          <button class="action-btn view-btn" onclick="viewDestination('${dest.slug}')" title="View on site">
            <i class="fas fa-eye"></i>
          </button>
          <button class="action-btn edit-btn" onclick="editDestination('${dest._id}')" title="Edit">
            <i class="fas fa-edit"></i>
          </button>
          <button class="action-btn delete-btn" onclick="deleteDestination('${dest._id}')" title="Delete">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

// Toggle destination status (active/draft)
async function toggleDestinationStatus(id, currentStatus) {
  const newStatus = currentStatus === 'active' ? 'draft' : 'active';

  try {
    const response = await fetch(`${API_URL}/destinations/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: newStatus })
    });

    const result = await response.json();

    if (result.success) {
      showNotification(`Status changed to ${newStatus}`, 'success');
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
  window.open(`/gofly/destination-details.html?slug=${slug}`, '_blank');
}

// Open destination modal
function openDestinationModal(destination = null) {
  currentDestinationId = destination ? destination._id : null;

  const modalTitle = document.getElementById('destinationModalTitle');
  modalTitle.textContent = destination ? 'Edit Destination' : 'Add New Destination';

  // Reset form
  document.getElementById('destTitle').value = destination?.title || '';
  document.getElementById('destSlug').value = destination?.slug || '';
  document.getElementById('destCountryCode').value = destination?.country_code || 'UZ';
  document.getElementById('destMainImage').value = destination?.main_image || '';
  document.getElementById('destThumbnail').value = destination?.thumbnail_image || '';
  document.getElementById('destShortDesc').value = destination?.short_description || '';
  document.getElementById('destLongDesc').value = destination?.long_description || '';
  document.getElementById('destTripsCount').value = destination?.trips_count || 0;
  document.getElementById('destRating').value = destination?.rating || 0;
  document.getElementById('destLatitude').value = destination?.latitude || '';
  document.getElementById('destLongitude').value = destination?.longitude || '';
  document.getElementById('destMetaTitle').value = destination?.seo?.meta_title || '';
  document.getElementById('destMetaDesc').value = destination?.seo?.meta_description || '';
  document.getElementById('destMetaKeywords').value = (destination?.seo?.meta_keywords || []).join(', ');
  document.getElementById('destStatus').value = destination?.status || 'draft';
  document.getElementById('destFeatured').checked = destination?.featured || false;

  // Gallery images
  const galleryContainer = document.getElementById('galleryImagesContainer');
  galleryContainer.innerHTML = '';
  if (destination?.gallery_images?.length > 0) {
    destination.gallery_images.forEach(img => addGalleryImageField(img));
  }

  // Image previews
  updateImagePreview('destMainImage', 'mainImagePreview');
  updateImagePreview('destThumbnail', 'thumbnailPreview');

  document.getElementById('destinationModal').style.display = 'flex';
}

// Close destination modal
function closeDestinationModal() {
  document.getElementById('destinationModal').style.display = 'none';
  currentDestinationId = null;
}

// Add gallery image field with preview card
function addGalleryImageField(value = '') {
  console.log('addGalleryImageField called with:', value);
  const container = document.getElementById('galleryImagesContainer');
  console.log('Gallery container:', container);
  if (!container) {
    console.error('Gallery container not found!');
    return;
  }
  const div = document.createElement('div');
  div.className = 'gallery-image-item';
  div.style.cssText = 'position: relative; border-radius: 12px; overflow: hidden; background: #f3f4f6; aspect-ratio: 4/3;';

  const imgSrc = value || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"%3E%3Crect fill="%23e5e7eb" width="200" height="150"/%3E%3Ctext fill="%239ca3af" font-family="Arial" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';

  div.innerHTML = `
    <img src="${imgSrc}"
         style="width: 100%; height: 100%; object-fit: cover;"
         onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22150%22%3E%3Crect fill=%22%23fee2e2%22 width=%22200%22 height=%22150%22/%3E%3Ctext fill=%22%23ef4444%22 font-family=%22Arial%22 font-size=%2212%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22%3EInvalid URL%3C/text%3E%3C/svg%3E'">
    <input type="hidden" class="gallery-image-input" value="${value}">
    <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%); opacity: 0; transition: opacity 0.3s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0'">
      <button type="button" onclick="this.closest('.gallery-image-item').remove()"
              style="position: absolute; top: 8px; right: 8px; width: 28px; height: 28px; background: #ef4444; color: white; border: none; border-radius: 50%; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center;">×</button>
      <div style="position: absolute; bottom: 8px; left: 8px; right: 8px; color: white; font-size: 11px; word-break: break-all; max-height: 40px; overflow: hidden;">${value ? value.split('/').pop() : 'Enter URL'}</div>
    </div>
  `;

  // Add hover effect
  div.onmouseover = function() { this.querySelector('div').style.opacity = '1'; };
  div.onmouseout = function() { this.querySelector('div').style.opacity = '0'; };

  container.appendChild(div);
}

// Upload multiple gallery images
async function uploadGalleryImages(fileInput) {
  console.log('uploadGalleryImages called', fileInput);

  if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
    console.log('No files selected');
    return;
  }

  const files = Array.from(fileInput.files);
  const apiUrl = (typeof API_URL !== 'undefined') ? API_URL : '/api';

  console.log('Uploading ' + files.length + ' image(s) to ' + apiUrl + '/upload');

  let uploadedCount = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    console.log('Uploading file:', file.name);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(apiUrl + '/upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      console.log('Upload result:', result);

      if (result.success && result.data && result.data.filePath) {
        addGalleryImageField(result.data.filePath);
        uploadedCount++;
      }
    } catch (error) {
      console.error('Gallery upload error:', error);
    }
  }

  if (uploadedCount > 0) {
    alert(uploadedCount + ' image(s) uploaded successfully!');
  } else {
    alert('Upload failed. Please try again.');
  }

  fileInput.value = '';
}

// Update image preview
function updateImagePreview(inputId, previewId) {
  const input = document.getElementById(inputId);
  const preview = document.getElementById(previewId);
  if (input && preview) {
    if (input.value) {
      preview.innerHTML = `<img src="${input.value}" alt="Preview" style="max-width: 150px; max-height: 100px; object-fit: cover;">`;
    } else {
      preview.innerHTML = '<span class="text-muted">No image</span>';
    }
  }
}

// Save destination
async function saveDestination() {
  const galleryInputs = document.querySelectorAll('.gallery-image-input');
  const galleryImages = Array.from(galleryInputs).map(input => input.value).filter(v => v);

  // Get status and featured from Step 3 or Step 1 (both sync)
  const statusStep3 = document.getElementById('destStatusStep3');
  const featuredStep3 = document.getElementById('destFeaturedStep3');
  const status = statusStep3 ? statusStep3.value : document.getElementById('destStatus').value;
  const featured = featuredStep3 ? featuredStep3.checked : document.getElementById('destFeatured').checked;

  // Sync status back to Step 1
  if (statusStep3) document.getElementById('destStatus').value = statusStep3.value;
  if (featuredStep3) document.getElementById('destFeatured').checked = featuredStep3.checked;

  // Get country code from either field
  const countryEl = document.getElementById('destCountry');
  const countryCode = (countryEl && countryEl.value) || document.getElementById('destCountryCode').value;

  // Get city
  const cityEl = document.getElementById('destCity');
  const city = cityEl ? cityEl.value : '';

  const destinationData = {
    title: document.getElementById('destTitle').value,
    slug: document.getElementById('destSlug').value,
    country_code: countryCode,
    city: city,
    main_image: document.getElementById('destMainImage').value,
    thumbnail_image: document.getElementById('destThumbnail').value,
    gallery_images: galleryImages,
    short_description: document.getElementById('destShortDesc').value,
    long_description: document.getElementById('destLongDesc').value,
    trips_count: parseInt(document.getElementById('destTripsCount').value) || 0,
    rating: parseFloat(document.getElementById('destRating').value) || 0,
    latitude: parseFloat(document.getElementById('destLatitude').value) || null,
    longitude: parseFloat(document.getElementById('destLongitude').value) || null,
    seo: {
      meta_title: document.getElementById('destMetaTitle').value,
      meta_description: document.getElementById('destMetaDesc').value,
      meta_keywords: document.getElementById('destMetaKeywords').value.split(',').map(k => k.trim()).filter(k => k)
    },
    status: status,
    featured: featured
  };

  try {
    const url = currentDestinationId
      ? `${API_URL}/destinations/${currentDestinationId}`
      : `${API_URL}/destinations`;

    const method = currentDestinationId ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(destinationData)
    });

    const result = await response.json();

    if (result.success) {
      showNotification(currentDestinationId ? 'Destination updated!' : 'Destination created!', 'success');
      closeDestinationModal();
      loadDestinations();
    } else {
      showNotification(result.message || 'Failed to save destination', 'error');
    }
  } catch (error) {
    console.error('Error saving destination:', error);
    showNotification('Failed to save destination', 'error');
  }
}

// Edit destination
async function editDestination(id) {
  try {
    const response = await fetch(`${API_URL}/destinations/${id}`);
    const result = await response.json();

    if (result.success) {
      openDestinationModal(result.data.destination);
    } else {
      showNotification('Failed to load destination', 'error');
    }
  } catch (error) {
    console.error('Error loading destination:', error);
    showNotification('Failed to load destination', 'error');
  }
}

// Delete destination
async function deleteDestination(id) {
  if (!confirm('Are you sure you want to delete this destination?')) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/destinations/${id}`, {
      method: 'DELETE'
    });

    const result = await response.json();

    if (result.success) {
      showNotification('Destination deleted!', 'success');
      loadDestinations();
    } else {
      showNotification(result.message || 'Failed to delete destination', 'error');
    }
  } catch (error) {
    console.error('Error deleting destination:', error);
    showNotification('Failed to delete destination', 'error');
  }
}

// Upload destination image
async function uploadDestImage(inputId, targetFieldId) {
  const fileInput = document.getElementById(inputId);
  if (!fileInput.files || !fileInput.files[0]) {
    return;
  }

  const formData = new FormData();
  formData.append('image', fileInput.files[0]);

  try {
    const response = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      body: formData
    });

    const result = await response.json();

    if (result.success) {
      document.getElementById(targetFieldId).value = result.data.url;
      updateImagePreview(targetFieldId, targetFieldId.replace('dest', '').replace(/([A-Z])/g, '$1').toLowerCase() + 'Preview');
      showNotification('Image uploaded!', 'success');
    } else {
      showNotification('Failed to upload image', 'error');
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    showNotification('Failed to upload image', 'error');
  }
}

// Auto-generate slug from title
function generateSlugFromTitle() {
  const title = document.getElementById('destTitle').value;
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
  document.getElementById('destSlug').value = slug;
}

// Initialize destinations section
function initDestinations() {
  // Add event listeners for search and filter
  const searchInput = document.getElementById('destinationSearch');
  const statusFilter = document.getElementById('destinationStatusFilter');

  if (searchInput) {
    searchInput.addEventListener('input', debounce(loadDestinations, 300));
  }
  if (statusFilter) {
    statusFilter.addEventListener('change', loadDestinations);
  }

  // Auto-generate slug
  const titleInput = document.getElementById('destTitle');
  if (titleInput) {
    titleInput.addEventListener('blur', generateSlugFromTitle);
  }

  // Image preview listeners
  const mainImageInput = document.getElementById('destMainImage');
  const thumbnailInput = document.getElementById('destThumbnail');

  if (mainImageInput) {
    mainImageInput.addEventListener('input', () => updateImagePreview('destMainImage', 'mainImagePreview'));
  }
  if (thumbnailInput) {
    thumbnailInput.addEventListener('input', () => updateImagePreview('destThumbnail', 'thumbnailPreview'));
  }
}

// Debounce function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
