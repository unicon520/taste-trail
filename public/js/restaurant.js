document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('detailContainer');
    const overlay = document.getElementById('modalOverlay');
    const addReviewModal = document.getElementById('addReviewModal');
    const formReview = document.getElementById('addReviewForm');
    
    // Get ID from URL
    const params = new URLSearchParams(window.location.search);
    const restId = params.get('id');

    if (!restId) {
        container.innerHTML = '<div style="text-align:center; margin-top:50px;">Restaurant not found. <a href="/">Go back</a></div>';
        return;
    }

    fetchRestaurant();

    async function fetchRestaurant() {
        try {
            const res = await fetch(`/api/restaurants/${restId}`);
            if (!res.ok) throw new Error('Not found');
            const data = await res.json();
            renderDetails(data);
        } catch (error) {
            console.error(error);
            container.innerHTML = '<div style="text-align:center; margin-top:50px;">Restaurant not found. <a href="/">Go back</a></div>';
        }
    }

    function renderDetails(rest) {
        document.title = `${rest.name} | TasteTrail`;
        
        container.innerHTML = `
            <div class="detail-hero">
                <img src="${rest.imageUrl}" alt="${rest.name}">
                <div class="detail-header">
                    <div class="rest-cuisine" style="font-size:14px; margin-bottom:8px;">${rest.cuisine}</div>
                    <h1>${rest.name}</h1>
                    <div class="rest-meta" style="color:white; margin:0;">
                        <i class="ph ph-map-pin" style="color:#f2994a"></i> ${rest.location}
                        <span style="margin: 0 16px;">|</span>
                        <div class="rest-rating" style="display:inline-flex;">
                            <i class="ph-fill ph-star"></i> ${rest.rating || 'New'}
                        </div>
                    </div>
                </div>
            </div>

            <div class="detail-content">
                <div class="review-section">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <h2>Reviews (${rest.reviews.length})</h2>
                        <button class="btn btn-primary" id="openReviewBtn"><i class="ph ph-pencil-simple"></i> Leave Review</button>
                    </div>
                    
                    <div class="review-full-list">
                        ${rest.reviews.length === 0 ? '<p style="color:#a1a1aa;">No reviews yet. Be the first to review!</p>' : ''}
                        ${rest.reviews.slice().reverse().map(r => `
                            <div class="review-full-item">
                                <div class="review-full-item-header">
                                    <h4 style="color: var(--primary-hover);">${r.user}</h4>
                                    <div class="rest-rating"><i class="ph-fill ph-star"></i> ${r.rating}</div>
                                </div>
                                <p style="color:#d4d4d8;">${r.comment}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="sidebar">
                    <div class="rest-card" style="padding:24px; border:1px solid rgba(255,255,255,0.1);">
                        <h3>About</h3>
                        <p style="color:var(--text-muted); margin-top:12px;">This is a detailed view for ${rest.name}. Here, users will later be able to add this spot to a Journey, view opening hours, and more.</p>
                    </div>
                </div>
            </div>
        `;

        // Attach event listener to new button
        document.getElementById('openReviewBtn').addEventListener('click', () => {
            formReview.reset();
            document.getElementById('ratingDisplay').innerText = '5 ⭐';
            document.getElementById('reviewRestId').value = rest.id;
            openModal(addReviewModal);
        });
    }

    // Modal Logic
    document.querySelector('.close-modal').addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
        if(e.target === overlay) closeModal();
    });

    function openModal(modal) {
        overlay.classList.add('active');
        modal.classList.add('active');
    }

    function closeModal() {
        overlay.classList.remove('active');
        addReviewModal.classList.remove('active');
    }

    // Rating Slider
    document.getElementById('reviewRating').addEventListener('input', (e) => {
        document.getElementById('ratingDisplay').innerText = `${e.target.value} ⭐`;
    });

    // Submit Review
    formReview.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const payload = {
            user: document.getElementById('reviewUser').value,
            rating: document.getElementById('reviewRating').value,
            comment: document.getElementById('reviewComment').value
        };

        try {
            const res = await fetch(`/api/restaurants/${restId}/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            if (res.ok) {
                closeModal();
                fetchRestaurant(); // Refresh details
            }
        } catch (error) {
            console.error('Error adding review', error);
        }
    });
});
