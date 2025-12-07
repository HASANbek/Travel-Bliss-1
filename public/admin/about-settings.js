// About Page Settings Management
const API_URL = 'http://localhost:5000/api';

let aboutSettings = null;

// Load about settings
async function loadAboutSettings() {
    try {
        const response = await fetch(`${API_URL}/about-settings`);
        const result = await response.json();

        if (result.success && result.data.settings) {
            aboutSettings = result.data.settings;
            renderAboutSettings();
        }
    } catch (error) {
        console.error('Error loading about settings:', error);
        showNotification('Error loading about settings', 'error');
    }
}

// Render all about settings
function renderAboutSettings() {
    if (!aboutSettings) return;

    // Hero Section
    document.getElementById('heroTitle').value = aboutSettings.heroTitle || '';
    document.getElementById('heroSubtitle').value = aboutSettings.heroSubtitle || '';
    document.getElementById('heroImage').value = aboutSettings.heroImage || '';
    if (aboutSettings.heroImage) {
        document.getElementById('heroImagePreview').innerHTML = `<img src="${aboutSettings.heroImage}" alt="Hero" style="max-width: 200px; border-radius: 8px;">`;
    }

    // Story Section
    document.getElementById('storyEyebrow').value = aboutSettings.storyEyebrow || '';
    document.getElementById('storyTitle').value = aboutSettings.storyTitle || '';
    document.getElementById('storyContent').value = aboutSettings.storyContent || '';
    document.getElementById('storyImageMain').value = aboutSettings.storyImageMain || '';
    document.getElementById('storyImageSecondary').value = aboutSettings.storyImageSecondary || '';

    // Why Choose Section
    document.getElementById('whyChooseEyebrow').value = aboutSettings.whyChooseEyebrow || '';
    document.getElementById('whyChooseTitle').value = aboutSettings.whyChooseTitle || '';
    renderFeatures();

    // Stats
    renderStats();

    // Team Section
    document.getElementById('teamEyebrow').value = aboutSettings.teamEyebrow || '';
    document.getElementById('teamTitle').value = aboutSettings.teamTitle || '';
    renderTeamMembers();

    // Reviews Section
    document.getElementById('reviewsEyebrow').value = aboutSettings.reviewsEyebrow || '';
    document.getElementById('reviewsTitle').value = aboutSettings.reviewsTitle || '';
    document.getElementById('tripadvisorRating').value = aboutSettings.tripadvisorRating || '';
    document.getElementById('googleRating').value = aboutSettings.googleRating || '';
    renderReviews();
}

// Render team members
function renderTeamMembers() {
    const container = document.getElementById('teamMembersContainer');
    if (!aboutSettings.teamMembers || aboutSettings.teamMembers.length === 0) {
        container.innerHTML = '<p style="color: #666; padding: 20px;">No team members yet. Click "Add Team Member" to add one.</p>';
        return;
    }

    container.innerHTML = aboutSettings.teamMembers
        .sort((a, b) => a.order - b.order)
        .map(member => `
            <div class="team-member-card" data-id="${member._id}">
                <div class="team-photo-preview">
                    ${member.photo ?
                        `<img src="${member.photo}" alt="${member.name}">` :
                        `<div class="no-photo"><i class="bi bi-person"></i></div>`
                    }
                </div>
                <div class="team-info">
                    <h4>${member.name}</h4>
                    <p class="role">${member.role}</p>
                    <p class="desc">${member.description || ''}</p>
                </div>
                <div class="team-actions">
                    <button onclick="editTeamMember('${member._id}')" class="btn-edit"><i class="bi bi-pencil"></i></button>
                    <button onclick="deleteTeamMember('${member._id}')" class="btn-delete"><i class="bi bi-trash"></i></button>
                </div>
            </div>
        `).join('');
}

// Render stats
function renderStats() {
    const container = document.getElementById('statsContainer');
    if (!aboutSettings.stats || aboutSettings.stats.length === 0) {
        container.innerHTML = '<p style="color: #666; padding: 20px;">No stats yet. Click "Add Stat" to add one.</p>';
        return;
    }

    container.innerHTML = aboutSettings.stats
        .sort((a, b) => a.order - b.order)
        .map(stat => `
            <div class="stat-card-admin" data-id="${stat._id}">
                <div class="stat-number-display">${stat.number}</div>
                <div class="stat-label-display">${stat.label}</div>
                <div class="stat-desc-display">${stat.description || ''}</div>
                <div class="stat-actions">
                    <button onclick="editStat('${stat._id}')" class="btn-edit"><i class="bi bi-pencil"></i></button>
                    <button onclick="deleteStat('${stat._id}')" class="btn-delete"><i class="bi bi-trash"></i></button>
                </div>
            </div>
        `).join('');
}

// Render features
function renderFeatures() {
    const container = document.getElementById('featuresContainer');
    if (!aboutSettings.features || aboutSettings.features.length === 0) {
        container.innerHTML = '<p style="color: #666; padding: 20px;">No features yet. Click "Add Feature" to add one.</p>';
        return;
    }

    container.innerHTML = aboutSettings.features
        .sort((a, b) => a.order - b.order)
        .map(feature => `
            <div class="feature-card-admin" data-id="${feature._id}">
                <div class="feature-icon-display"><i class="bi bi-${getFeatureIcon(feature.icon)}"></i></div>
                <h4>${feature.title}</h4>
                <p>${feature.description || ''}</p>
                <div class="feature-actions">
                    <button onclick="editFeature('${feature._id}')" class="btn-edit"><i class="bi bi-pencil"></i></button>
                    <button onclick="deleteFeature('${feature._id}')" class="btn-delete"><i class="bi bi-trash"></i></button>
                </div>
            </div>
        `).join('');
}

// Render reviews
function renderReviews() {
    const container = document.getElementById('reviewsContainer');
    if (!aboutSettings.featuredReviews || aboutSettings.featuredReviews.length === 0) {
        container.innerHTML = '<p style="color: #666; padding: 20px;">No reviews yet. Click "Add Review" to add one.</p>';
        return;
    }

    container.innerHTML = aboutSettings.featuredReviews.map(review => `
        <div class="review-card-admin" data-id="${review._id}">
            <div class="review-content-admin">
                <p>"${review.content}"</p>
                <div class="reviewer-admin">
                    <strong>${review.authorName}</strong>
                    <span>${review.authorLocation} • ${review.tourName} • ${review.date}</span>
                </div>
            </div>
            <div class="review-actions">
                <button onclick="deleteReview('${review._id}')" class="btn-delete"><i class="bi bi-trash"></i></button>
            </div>
        </div>
    `).join('');
}

// Get feature icon class
function getFeatureIcon(iconName) {
    const icons = {
        'home': 'house',
        'smile': 'emoji-smile',
        'dollar': 'currency-dollar',
        'star': 'star',
        'heart': 'heart',
        'globe': 'globe',
        'map': 'map',
        'people': 'people'
    };
    return icons[iconName] || 'star';
}

// Save general settings
async function saveGeneralSettings() {
    try {
        const data = {
            heroTitle: document.getElementById('heroTitle').value,
            heroSubtitle: document.getElementById('heroSubtitle').value,
            heroImage: document.getElementById('heroImage').value,
            storyEyebrow: document.getElementById('storyEyebrow').value,
            storyTitle: document.getElementById('storyTitle').value,
            storyContent: document.getElementById('storyContent').value,
            storyImageMain: document.getElementById('storyImageMain').value,
            storyImageSecondary: document.getElementById('storyImageSecondary').value,
            whyChooseEyebrow: document.getElementById('whyChooseEyebrow').value,
            whyChooseTitle: document.getElementById('whyChooseTitle').value,
            teamEyebrow: document.getElementById('teamEyebrow').value,
            teamTitle: document.getElementById('teamTitle').value,
            reviewsEyebrow: document.getElementById('reviewsEyebrow').value,
            reviewsTitle: document.getElementById('reviewsTitle').value,
            tripadvisorRating: document.getElementById('tripadvisorRating').value,
            googleRating: document.getElementById('googleRating').value
        };

        const response = await fetch(`${API_URL}/about-settings`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            aboutSettings = result.data.settings;
            showNotification('Settings saved successfully!', 'success');
        } else {
            showNotification('Failed to save settings', 'error');
        }
    } catch (error) {
        console.error('Error saving settings:', error);
        showNotification('Error saving settings', 'error');
    }
}

// Add team member
async function addTeamMember() {
    const name = document.getElementById('newMemberName').value.trim();
    const role = document.getElementById('newMemberRole').value.trim();
    const description = document.getElementById('newMemberDescription').value.trim();
    const photo = document.getElementById('newMemberPhoto').value.trim();

    if (!name || !role) {
        showNotification('Name and role are required', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/about-settings/team`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, role, description, photo })
        });

        const result = await response.json();

        if (result.success) {
            aboutSettings.teamMembers = result.data.teamMembers;
            renderTeamMembers();
            closeTeamModal();
            showNotification('Team member added!', 'success');
        }
    } catch (error) {
        console.error('Error adding team member:', error);
        showNotification('Error adding team member', 'error');
    }
}

// Delete team member
async function deleteTeamMember(memberId) {
    if (!confirm('Are you sure you want to delete this team member?')) return;

    try {
        const response = await fetch(`${API_URL}/about-settings/team/${memberId}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
            aboutSettings.teamMembers = result.data.teamMembers;
            renderTeamMembers();
            showNotification('Team member deleted!', 'success');
        }
    } catch (error) {
        console.error('Error deleting team member:', error);
        showNotification('Error deleting team member', 'error');
    }
}

// Add stat
async function addStat() {
    const number = document.getElementById('newStatNumber').value.trim();
    const label = document.getElementById('newStatLabel').value.trim();
    const description = document.getElementById('newStatDescription').value.trim();

    if (!number || !label) {
        showNotification('Number and label are required', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/about-settings/stats`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ number, label, description })
        });

        const result = await response.json();

        if (result.success) {
            aboutSettings.stats = result.data.stats;
            renderStats();
            closeStatModal();
            showNotification('Stat added!', 'success');
        }
    } catch (error) {
        console.error('Error adding stat:', error);
        showNotification('Error adding stat', 'error');
    }
}

// Delete stat
async function deleteStat(statId) {
    if (!confirm('Are you sure you want to delete this stat?')) return;

    try {
        const response = await fetch(`${API_URL}/about-settings/stats/${statId}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
            aboutSettings.stats = result.data.stats;
            renderStats();
            showNotification('Stat deleted!', 'success');
        }
    } catch (error) {
        console.error('Error deleting stat:', error);
        showNotification('Error deleting stat', 'error');
    }
}

// Add feature
async function addFeature() {
    const title = document.getElementById('newFeatureTitle').value.trim();
    const description = document.getElementById('newFeatureDescription').value.trim();
    const icon = document.getElementById('newFeatureIcon').value;

    if (!title) {
        showNotification('Title is required', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/about-settings/features`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description, icon })
        });

        const result = await response.json();

        if (result.success) {
            aboutSettings.features = result.data.features;
            renderFeatures();
            closeFeatureModal();
            showNotification('Feature added!', 'success');
        }
    } catch (error) {
        console.error('Error adding feature:', error);
        showNotification('Error adding feature', 'error');
    }
}

// Delete feature
async function deleteFeature(featureId) {
    if (!confirm('Are you sure you want to delete this feature?')) return;

    try {
        const response = await fetch(`${API_URL}/about-settings/features/${featureId}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
            aboutSettings.features = result.data.features;
            renderFeatures();
            showNotification('Feature deleted!', 'success');
        }
    } catch (error) {
        console.error('Error deleting feature:', error);
        showNotification('Error deleting feature', 'error');
    }
}

// Add review
async function addReview() {
    const content = document.getElementById('newReviewContent').value.trim();
    const authorName = document.getElementById('newReviewAuthor').value.trim();
    const authorLocation = document.getElementById('newReviewLocation').value.trim();
    const tourName = document.getElementById('newReviewTour').value.trim();
    const date = document.getElementById('newReviewDate').value.trim();

    if (!content || !authorName) {
        showNotification('Review content and author name are required', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/about-settings/reviews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content, authorName, authorLocation, tourName, date })
        });

        const result = await response.json();

        if (result.success) {
            aboutSettings.featuredReviews = result.data.reviews;
            renderReviews();
            closeReviewModal();
            showNotification('Review added!', 'success');
        }
    } catch (error) {
        console.error('Error adding review:', error);
        showNotification('Error adding review', 'error');
    }
}

// Delete review
async function deleteReview(reviewId) {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
        const response = await fetch(`${API_URL}/about-settings/reviews/${reviewId}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
            aboutSettings.featuredReviews = result.data.reviews;
            renderReviews();
            showNotification('Review deleted!', 'success');
        }
    } catch (error) {
        console.error('Error deleting review:', error);
        showNotification('Error deleting review', 'error');
    }
}

// Current editing IDs
let editingTeamMemberId = null;
let editingStatId = null;
let editingFeatureId = null;

// Edit team member
function editTeamMember(memberId) {
    const member = aboutSettings.teamMembers.find(m => m._id === memberId);
    if (!member) return;

    editingTeamMemberId = memberId;
    document.getElementById('teamModalTitle').textContent = 'Edit Team Member';
    document.getElementById('teamModalBtn').textContent = 'Update Member';
    document.getElementById('newMemberName').value = member.name || '';
    document.getElementById('newMemberRole').value = member.role || '';
    document.getElementById('newMemberDescription').value = member.description || '';
    document.getElementById('newMemberPhoto').value = member.photo || '';

    // Show photo preview
    const previewContainer = document.getElementById('memberPhotoPreview');
    if (previewContainer && member.photo) {
        previewContainer.innerHTML = `<img src="${member.photo}" alt="Preview" style="max-width: 150px; border-radius: 8px; margin-top: 10px;">`;
    }

    document.getElementById('teamModal').style.display = 'flex';
}

// Update team member
async function updateTeamMember() {
    if (!editingTeamMemberId) {
        await addTeamMember();
        return;
    }

    const name = document.getElementById('newMemberName').value.trim();
    const role = document.getElementById('newMemberRole').value.trim();
    const description = document.getElementById('newMemberDescription').value.trim();
    const photo = document.getElementById('newMemberPhoto').value.trim();

    if (!name || !role) {
        showNotification('Name and role are required', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/about-settings/team/${editingTeamMemberId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, role, description, photo })
        });

        const result = await response.json();

        if (result.success) {
            aboutSettings.teamMembers = result.data.teamMembers;
            renderTeamMembers();
            closeTeamModal();
            showNotification('Team member updated!', 'success');
        } else {
            showNotification(result.message || 'Failed to update', 'error');
        }
    } catch (error) {
        console.error('Error updating team member:', error);
        showNotification('Error updating team member', 'error');
    }
}

// Edit stat
function editStat(statId) {
    const stat = aboutSettings.stats.find(s => s._id === statId);
    if (!stat) return;

    editingStatId = statId;
    document.getElementById('statModalTitle').textContent = 'Edit Stat';
    document.getElementById('statModalBtn').textContent = 'Update Stat';
    document.getElementById('newStatNumber').value = stat.number || '';
    document.getElementById('newStatLabel').value = stat.label || '';
    document.getElementById('newStatDescription').value = stat.description || '';

    document.getElementById('statModal').style.display = 'flex';
}

// Update stat
async function updateStat() {
    if (!editingStatId) {
        await addStat();
        return;
    }

    const number = document.getElementById('newStatNumber').value.trim();
    const label = document.getElementById('newStatLabel').value.trim();
    const description = document.getElementById('newStatDescription').value.trim();

    if (!number || !label) {
        showNotification('Number and label are required', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/about-settings/stats/${editingStatId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ number, label, description })
        });

        const result = await response.json();

        if (result.success) {
            aboutSettings.stats = result.data.stats;
            renderStats();
            closeStatModal();
            showNotification('Stat updated!', 'success');
        } else {
            showNotification(result.message || 'Failed to update', 'error');
        }
    } catch (error) {
        console.error('Error updating stat:', error);
        showNotification('Error updating stat', 'error');
    }
}

// Edit feature
function editFeature(featureId) {
    const feature = aboutSettings.features.find(f => f._id === featureId);
    if (!feature) return;

    editingFeatureId = featureId;
    document.getElementById('featureModalTitle').textContent = 'Edit Feature';
    document.getElementById('featureModalBtn').textContent = 'Update Feature';
    document.getElementById('newFeatureTitle').value = feature.title || '';
    document.getElementById('newFeatureDescription').value = feature.description || '';
    document.getElementById('newFeatureIcon').value = feature.icon || 'star';

    document.getElementById('featureModal').style.display = 'flex';
}

// Update feature
async function updateFeature() {
    if (!editingFeatureId) {
        await addFeature();
        return;
    }

    const title = document.getElementById('newFeatureTitle').value.trim();
    const description = document.getElementById('newFeatureDescription').value.trim();
    const icon = document.getElementById('newFeatureIcon').value;

    if (!title) {
        showNotification('Title is required', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/about-settings/features/${editingFeatureId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description, icon })
        });

        const result = await response.json();

        if (result.success) {
            aboutSettings.features = result.data.features;
            renderFeatures();
            closeFeatureModal();
            showNotification('Feature updated!', 'success');
        } else {
            showNotification(result.message || 'Failed to update', 'error');
        }
    } catch (error) {
        console.error('Error updating feature:', error);
        showNotification('Error updating feature', 'error');
    }
}

// Modal functions
function openTeamModal() {
    editingTeamMemberId = null;
    document.getElementById('teamModalTitle').textContent = 'Add Team Member';
    document.getElementById('teamModalBtn').textContent = 'Add Member';
    document.getElementById('teamModal').style.display = 'flex';
    document.getElementById('newMemberName').value = '';
    document.getElementById('newMemberRole').value = '';
    document.getElementById('newMemberDescription').value = '';
    document.getElementById('newMemberPhoto').value = '';
    const previewContainer = document.getElementById('memberPhotoPreview');
    if (previewContainer) previewContainer.innerHTML = '';
}

function closeTeamModal() {
    editingTeamMemberId = null;
    document.getElementById('teamModal').style.display = 'none';
}

function openStatModal() {
    editingStatId = null;
    document.getElementById('statModalTitle').textContent = 'Add Stat';
    document.getElementById('statModalBtn').textContent = 'Add Stat';
    document.getElementById('statModal').style.display = 'flex';
    document.getElementById('newStatNumber').value = '';
    document.getElementById('newStatLabel').value = '';
    document.getElementById('newStatDescription').value = '';
}

function closeStatModal() {
    editingStatId = null;
    document.getElementById('statModal').style.display = 'none';
}

function openFeatureModal() {
    editingFeatureId = null;
    document.getElementById('featureModalTitle').textContent = 'Add Feature';
    document.getElementById('featureModalBtn').textContent = 'Add Feature';
    document.getElementById('featureModal').style.display = 'flex';
    document.getElementById('newFeatureTitle').value = '';
    document.getElementById('newFeatureDescription').value = '';
    document.getElementById('newFeatureIcon').value = 'star';
}

function closeFeatureModal() {
    editingFeatureId = null;
    document.getElementById('featureModal').style.display = 'none';
}

function openReviewModal() {
    document.getElementById('reviewModal').style.display = 'flex';
    document.getElementById('newReviewContent').value = '';
    document.getElementById('newReviewAuthor').value = '';
    document.getElementById('newReviewLocation').value = '';
    document.getElementById('newReviewTour').value = '';
    document.getElementById('newReviewDate').value = '';
}

function closeReviewModal() {
    document.getElementById('reviewModal').style.display = 'none';
}

// Notification helper
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Image upload handler
async function uploadImage(inputId, previewId, fieldId) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch(`${API_URL}/upload`, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                const imageUrl = result.data.url;
                document.getElementById(fieldId).value = imageUrl;
                if (previewId) {
                    document.getElementById(previewId).innerHTML = `<img src="${imageUrl}" alt="Preview" style="max-width: 200px; border-radius: 8px;">`;
                }
                showNotification('Image uploaded!', 'success');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            showNotification('Error uploading image', 'error');
        }
    };

    input.click();
}

// Initialize
document.addEventListener('DOMContentLoaded', loadAboutSettings);
