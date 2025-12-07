// Tours Pagination for Admin Panel
// Bu script admin panelda turlarni 10 tadan sahifalash uchun

(function() {
    // Pagination settings
    const TOURS_PER_PAGE = 10;
    let allTours = [];
    let currentPage = 1;
    let originalLoadTours = null;

    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', function() {
        // Override loadTours function after a short delay to ensure it's defined
        setTimeout(overrideLoadTours, 1000);
    });

    function overrideLoadTours() {
        // Check if loadTours exists
        if (typeof window.loadTours === 'function') {
            originalLoadTours = window.loadTours;

            // Override with paginated version
            window.loadTours = async function() {
                const container = document.getElementById('toursTableContainer');
                if (!container) {
                    console.log('Tours container not found, using original loadTours');
                    return originalLoadTours();
                }

                try {
                    console.log('📊 Loading tours with pagination...');
                    const API_URL = window.API_URL || 'http://localhost:5000/api';
                    const response = await fetch(`${API_URL}/tours?limit=100`);

                    if (!response.ok) {
                        throw new Error(`API error: ${response.status}`);
                    }

                    const result = await response.json();

                    if (!result.success || !result.data || !result.data.tours) {
                        throw new Error('Invalid API response');
                    }

                    allTours = result.data.tours;
                    console.log(`📦 Found ${allTours.length} tours`);

                    if (allTours.length === 0) {
                        container.innerHTML = '<p style="padding: 20px; text-align: center; color: #6c757d;">No tours found. Click "Add New Tour" to create one.</p>';
                        return;
                    }

                    currentPage = 1;
                    renderToursWithPagination(container);

                } catch (error) {
                    console.error('Error loading tours:', error);
                    container.innerHTML = `<p style="padding: 20px; text-align: center; color: #dc3545;">Error loading tours: ${error.message}</p>`;
                }
            };

            console.log('✅ Tours pagination enabled (10 per page)');
        } else {
            console.log('loadTours not found yet, retrying...');
            setTimeout(overrideLoadTours, 500);
        }
    }

    function renderToursWithPagination(container) {
        const totalPages = Math.ceil(allTours.length / TOURS_PER_PAGE);
        const startIndex = (currentPage - 1) * TOURS_PER_PAGE;
        const endIndex = startIndex + TOURS_PER_PAGE;
        const toursToShow = allTours.slice(startIndex, endIndex);

        let html = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding: 12px 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; color: white;">
                <span>📊 Jami: <strong>${allTours.length}</strong> ta tur</span>
                <span>📄 Sahifa: <strong>${currentPage}</strong> / <strong>${totalPages}</strong></span>
                <span>👁️ Ko'rsatilmoqda: <strong>${startIndex + 1}-${Math.min(endIndex, allTours.length)}</strong></span>
            </div>
            <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <thead>
                    <tr style="background: #f8f9fa; border-bottom: 2px solid #dee2e6;">
                        <th style="padding: 12px; text-align: left;">#</th>
                        <th style="padding: 12px; text-align: left;">Rasm</th>
                        <th style="padding: 12px; text-align: left;">Title</th>
                        <th style="padding: 12px; text-align: left;">Destination</th>
                        <th style="padding: 12px; text-align: left;">Price</th>
                        <th style="padding: 12px; text-align: left;">Duration</th>
                        <th style="padding: 12px; text-align: left;">Category</th>
                        <th style="padding: 12px; text-align: center;">SEO</th>
                        <th style="padding: 12px; text-align: left;">Status</th>
                        <th style="padding: 12px; text-align: center;">Actions</th>
                    </tr>
                </thead>
                <tbody>
        `;

        toursToShow.forEach((tour, index) => {
            const statusColor = tour.isActive ? '#28a745' : '#6c757d';
            const statusText = tour.isActive ? 'Active' : 'Inactive';
            const rowNum = startIndex + index + 1;

            // Get tour image
            const tourImage = tour.imageCover || tour.image || tour.images?.[0] || '';
            const imageUrl = tourImage ? (tourImage.startsWith('/') ? tourImage : `/uploads/${tourImage}`) : '';

            // SEO Badge
            let seoBadge = '';
            try {
                const hasSeo = tour.seo && (
                    (tour.seo.meta && tour.seo.meta.title && tour.seo.meta.title.length > 0) ||
                    (tour.seo.title && tour.seo.title.length > 0)
                );
                if (hasSeo) {
                    seoBadge = `<span style="background: #28a745; color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px; cursor: pointer;" onclick="viewTourSEO('${tour.id || tour._id}')" title="Click to view SEO details">✓ SEO</span>`;
                } else {
                    seoBadge = `<span style="background: #ffc107; color: #000; padding: 4px 8px; border-radius: 4px; font-size: 11px; cursor: pointer;" onclick="viewTourSEO('${tour.id || tour._id}')" title="Click to generate SEO">⚠ No SEO</span>`;
                }
            } catch (err) {
                seoBadge = '<span style="background: #dc3545; color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px;">✗ Error</span>';
            }

            html += `
                <tr style="border-bottom: 1px solid #dee2e6; transition: background 0.2s;" onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background='white'">
                    <td style="padding: 12px; color: #6c757d; font-weight: 600;">${rowNum}</td>
                    <td style="padding: 8px;">
                        ${imageUrl ?
                            `<img src="${imageUrl}" alt="${tour.title}" style="width: 60px; height: 45px; object-fit: cover; border-radius: 6px; box-shadow: 0 2px 6px rgba(0,0,0,0.15);" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2245%22><rect fill=%22%23ddd%22 width=%2260%22 height=%2245%22/><text x=%2230%22 y=%2227%22 font-size=%2210%22 text-anchor=%22middle%22 fill=%22%23999%22>No img</text></svg>'">`
                            : `<div style="width: 60px; height: 45px; background: #e9ecef; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #adb5bd; font-size: 10px;">No img</div>`
                        }
                    </td>
                    <td style="padding: 12px;">
                        <strong>${tour.title}</strong>
                        ${tour.featured || tour.isFeatured ? '<span style="background: #ffc107; color: #000; padding: 2px 8px; border-radius: 4px; font-size: 11px; margin-left: 8px;">FEATURED</span>' : ''}
                    </td>
                    <td style="padding: 12px;">${tour.destination || '-'}</td>
                    <td style="padding: 12px; font-weight: 600; color: #28a745;">$${tour.price}</td>
                    <td style="padding: 12px;">${tour.duration}D/${tour.nights || 0}N</td>
                    <td style="padding: 12px;">
                        <span style="background: #e7f3ff; color: #0066cc; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                            ${tour.category || 'N/A'}
                        </span>
                    </td>
                    <td style="padding: 12px; text-align: center;">${seoBadge}</td>
                    <td style="padding: 12px;">
                        <span style="color: ${statusColor}; font-weight: 600;">●</span> ${statusText}
                    </td>
                    <td style="padding: 12px; text-align: center;">
                        <button onclick="viewTour('${tour.id}')" style="background: #28a745; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; margin-right: 5px;" title="View on frontend">👁️</button>
                        <button onclick="editTour('${tour.id}')" style="background: #007bff; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; margin-right: 5px;">✏️</button>
                        <button onclick="deleteTour('${tour.id}')" style="background: #dc3545; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">🗑️</button>
                    </td>
                </tr>
            `;
        });

        html += `
                </tbody>
            </table>
        `;

        // Pagination controls
        if (totalPages > 1) {
            html += `
                <div style="display: flex; justify-content: center; align-items: center; gap: 8px; margin-top: 20px; padding: 15px; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <button onclick="window.toursPagination.goToPage(1)" style="padding: 8px 14px; border: 1px solid #dee2e6; background: white; border-radius: 6px; cursor: pointer; ${currentPage === 1 ? 'opacity: 0.5; cursor: not-allowed;' : ''}" ${currentPage === 1 ? 'disabled' : ''}>⏮️ Birinchi</button>
                    <button onclick="window.toursPagination.goToPage(${currentPage - 1})" style="padding: 8px 14px; border: 1px solid #dee2e6; background: white; border-radius: 6px; cursor: pointer; ${currentPage === 1 ? 'opacity: 0.5; cursor: not-allowed;' : ''}" ${currentPage === 1 ? 'disabled' : ''}>◀️ Oldingi</button>

                    <div style="display: flex; gap: 4px;">
            `;

            // Page numbers
            for (let i = 1; i <= totalPages; i++) {
                if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
                    const isActive = i === currentPage;
                    html += `<button onclick="window.toursPagination.goToPage(${i})" style="min-width: 40px; padding: 8px 12px; border: 1px solid ${isActive ? '#007bff' : '#dee2e6'}; background: ${isActive ? '#007bff' : 'white'}; color: ${isActive ? 'white' : '#333'}; border-radius: 6px; cursor: pointer; font-weight: ${isActive ? '600' : '400'};">${i}</button>`;
                } else if (i === currentPage - 3 || i === currentPage + 3) {
                    html += `<span style="padding: 8px; color: #6c757d;">...</span>`;
                }
            }

            html += `
                    </div>

                    <button onclick="window.toursPagination.goToPage(${currentPage + 1})" style="padding: 8px 14px; border: 1px solid #dee2e6; background: white; border-radius: 6px; cursor: pointer; ${currentPage === totalPages ? 'opacity: 0.5; cursor: not-allowed;' : ''}" ${currentPage === totalPages ? 'disabled' : ''}>Keyingi ▶️</button>
                    <button onclick="window.toursPagination.goToPage(${totalPages})" style="padding: 8px 14px; border: 1px solid #dee2e6; background: white; border-radius: 6px; cursor: pointer; ${currentPage === totalPages ? 'opacity: 0.5; cursor: not-allowed;' : ''}" ${currentPage === totalPages ? 'disabled' : ''}>Oxirgi ⏭️</button>
                </div>
            `;
        }

        container.innerHTML = html;
    }

    // Expose pagination functions globally
    window.toursPagination = {
        goToPage: function(page) {
            const totalPages = Math.ceil(allTours.length / TOURS_PER_PAGE);
            if (page < 1 || page > totalPages) return;
            currentPage = page;
            const container = document.getElementById('toursTableContainer');
            if (container) {
                renderToursWithPagination(container);
                // Scroll to top of table
                container.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    };
})();
