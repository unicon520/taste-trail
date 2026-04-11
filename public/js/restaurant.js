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

    let currentRest = null;
    let currentReviews = [];

    fetchRestaurant();

    async function fetchRestaurant() {
        try {
            const res = await fetch(`/api/restaurants/${restId}`);
            if (!res.ok) throw new Error('Not found');
            const data = await res.json();
            
            // Map defaults for new schema features
            currentRest = augmentData(data);
            currentReviews = [...currentRest.reviews].reverse();
            renderDetails(currentRest);
        } catch (error) {
            console.error(error);
            container.innerHTML = '<div style="text-align:center; margin-top:50px;">Restaurant not found. <a href="/">Go back</a></div>';
        }
    }

    function augmentData(rest) {
        return {
            ...rest,
            gallery: rest.gallery?.length ? rest.gallery : [
                rest.imageUrl,
                'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800',
                'https://images.unsplash.com/photo-1414235077428-338988a2e8c0?auto=format&fit=crop&q=80&w=800'
            ],
            categoryRatings: rest.categoryRatings?.food ? rest.categoryRatings : { food: 4.5, service: 4.2, value: 3.8, ambience: 4.7 },
            decisionScore: parseFloat(rest.decisionScore) || parseFloat(((rest.rating || 4.2) / 5) * 10).toFixed(1) || 8.5,
            pros: rest.pros?.length ? rest.pros : ['Great Atmosphere', 'Delicious Signature Dish', 'Friendly Staff'],
            cons: rest.cons?.length ? rest.cons : ['Can be loud during peak hours', 'Slightly pricey'],
            verdict: rest.verdict || 'A must-visit for foodies looking for a vibrant evening out.',
            popularDishes: rest.popularDishes?.length ? rest.popularDishes : ['Truffle Pasta', 'Spicy Tuna Roll', 'Wagyu Burger'],
            bestFor: rest.bestFor?.length ? rest.bestFor : ['Date Night', 'Groups'],
            avoidIf: rest.avoidIf?.length ? rest.avoidIf : ['In a rush', 'On a strict budget'],
            priceRange: rest.priceRange || '$$',
            statusHours: rest.statusHours || '11:00 AM - 10:00 PM (Open Now)',
            peakHours: rest.peakHours || '7:00 PM - 9:00 PM',
            reservations: rest.reservations || 'Available via App'
        };
    }

    function renderDetails(rest) {
        document.title = `${rest.name} | TasteTrail`;
        
        container.innerHTML = `
            <!-- 4. Image & Visual Gallery -->
            <div class="gallery-grid">
                <img src="${rest.gallery[0]}" class="gallery-img gallery-main" alt="${rest.name} Main">
                <img src="${rest.gallery[1]}" class="gallery-img" alt="Interior">
                <img src="${rest.gallery[2]}" class="gallery-img" alt="Food">
            </div>

            <!-- 1. & 12. Decision Summary & Decision Score -->
            <div class="decision-summary">
                <div class="score-dial">
                    ${rest.decisionScore}<span>/10</span>
                </div>
                <div class="score-details-inner" style="flex:1;">
                    <h2>Recommendation Score</h2>
                    <p style="color:var(--text-muted); font-size:14px;">Our smart aggregate score based on reviews and features.</p>
                    <div class="verdict-badge">Verdict: ${rest.verdict}</div>
                </div>
                <div class="pros-cons">
                    <div>
                        <b style="color:white; font-size:14px; display:block; margin-bottom:8px;">Pros</b>
                        ${rest.pros.map(p => `<div class="pro-item"><i class="ph-fill ph-check-circle"></i> ${p}</div>`).join('')}
                    </div>
                    <div>
                        <b style="color:white; font-size:14px; display:block; margin-bottom:8px;">Cons</b>
                        ${rest.cons.map(c => `<div class="con-item"><i class="ph-fill ph-minus-circle"></i> ${c}</div>`).join('')}
                    </div>
                </div>
            </div>

            <div class="detail-content">
                <!-- Main Column -->
                <div class="main-column">
                    <!-- 5. Scan-Friendly Layout Overview -->
                    <div style="margin-bottom: 24px;">
                        <h1 style="font-size: 40px; margin-bottom:8px;">${rest.name}</h1>
                        <div class="rest-meta" style="color:var(--text-muted); margin:0;">
                            <span class="rest-cuisine">${rest.cuisine}</span>
                            <span style="margin: 0 8px;">|</span>
                            <i class="ph ph-map-pin" style="color:#f2994a"></i> ${rest.location}
                        </div>
                    </div>

                    <!-- 3. Smart Insights Feature -->
                    <h3 class="section-title"><i class="ph ph-lightbulb"></i> Smart Insights</h3>
                    <div class="smart-insights">
                        <div class="insight-card">
                            <h4><i class="ph-fill ph-fire"></i> Popular Dishes</h4>
                            <div class="tags-list">
                                ${rest.popularDishes.map(d => `<span class="tag">${d}</span>`).join('')}
                            </div>
                        </div>
                        <div class="insight-card">
                            <h4><i class="ph-fill ph-thumbs-up"></i> Best For</h4>
                            <div class="tags-list">
                                ${rest.bestFor.map(d => `<span class="tag">${d}</span>`).join('')}
                            </div>
                        </div>
                        <div class="insight-card">
                            <h4><i class="ph-fill ph-warning-circle" style="color:#f87171;"></i> Avoid If</h4>
                            <div class="tags-list">
                                ${rest.avoidIf.map(d => `<span class="tag">${d}</span>`).join('')}
                            </div>
                        </div>
                    </div>

                    <!-- Reviews Section -->
                    <div class="review-section" id="reviewsContainer">
                        <!-- Populated by renderReviews() -->
                    </div>

                    <!-- 9. Discovery & Recommendations -->
                    <h3 class="section-title" style="margin-top:40px;"><i class="ph ph-compass"></i> You Might Also Like</h3>
                    <div class="smart-insights" style="margin-bottom: 0;">
                        <div class="insight-card" style="text-align:center; padding: 24px;">
                            <i class="ph-fill ph-map-pin" style="font-size:32px; color:var(--text-muted); margin-bottom:12px;"></i>
                            <p style="color:var(--text-muted);">Explore nearby Dining Options</p>
                            <button class="btn btn-outline" style="margin-top:12px; font-size:12px;">Browse Area</button>
                        </div>
                    </div>
                </div>

                <!-- 6. Essential Decision Info (Sidebar) -->
                <div class="info-sidebar">
                    <div class="sidebar-card">
                        <!-- 10. Call-To-Action Buttons -->
                        <button class="btn btn-primary btn-block" style="margin-top:0; margin-bottom:12px;"><i class="ph ph-calendar-plus"></i> Book Now</button>
                        <button class="btn btn-outline btn-block" style="margin-top:0; margin-bottom:12px;"><i class="ph ph-map-trifold"></i> View on Map</button>
                        <button class="btn btn-outline btn-block" style="margin-top:0; border-color:var(--primary); color:var(--primary);"><i class="ph ph-bookmark-simple"></i> Save Restaurant</button>
                    </div>

                    <div class="sidebar-card">
                        <h3 style="margin-bottom: 16px;">Key Info</h3>
                        <div class="sidebar-info-row">
                            <span><i class="ph ph-clock"></i> Hours</span>
                            <span>${rest.statusHours}</span>
                        </div>
                        <div class="sidebar-info-row">
                            <span><i class="ph ph-users"></i> Peak Hours</span>
                            <span>${rest.peakHours}</span>
                        </div>
                        <div class="sidebar-info-row">
                            <span><i class="ph ph-currency-dollar"></i> Price Range</span>
                            <span style="color:#4ade80;">${rest.priceRange}</span>
                        </div>
                        <div class="sidebar-info-row">
                            <span><i class="ph ph-address-book"></i> Reservations</span>
                            <span>${rest.reservations}</span>
                        </div>
                    </div>

                    <!-- 2. Ratings Breakdown -->
                    <div class="sidebar-card">
                        <h3 style="margin-bottom: 16px;">Overall Rating <b style="color:#f2c94c;">${rest.rating || 'New'}</b></h3>
                        <div class="rating-bars">
                            ${Object.entries(rest.categoryRatings).map(([cat, val]) => `
                                <div class="rating-bar-item">
                                    <div class="rating-label">${cat}</div>
                                    <div class="progress-track">
                                        <div class="progress-fill" style="width: ${(val/5)*100}%"></div>
                                    </div>
                                    <div class="rating-value">${val}</div>
                                </div>
                            `).join('')}
                        </div>
                        
                        <!-- 8. Review Trends -->
                        <div style="margin-top:24px; border-top:1px solid var(--border-color); padding-top:16px;">
                            <h4 style="font-size:14px; margin-bottom:8px;"><i class="ph ph-trend-up"></i> Satisfaction Trend</h4>
                            <p style="font-size:12px; color:var(--text-muted);">Trending higher over the last 3 months</p>
                            <div class="trend-chart">
                                <div class="trend-bar" style="height: 60%"></div>
                                <div class="trend-bar" style="height: 50%"></div>
                                <div class="trend-bar" style="height: 70%"></div>
                                <div class="trend-bar" style="height: 85%"></div>
                                <div class="trend-bar" style="height: 90%"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        renderReviews();
    }

    // 7. Improved Review System (Sorting & Highlight)
    function renderReviews() {
        const rc = document.getElementById('reviewsContainer');
        if (!rc) return;

        rc.innerHTML = `
            <div class="review-actions" style="margin-top: 40px;">
                <h3 class="section-title" style="margin:0;"><i class="ph ph-chat-centered-text"></i> Reviews (${currentReviews.length})</h3>
                <div style="display:flex; gap:12px; align-items:center;">
                    <select id="reviewSort" style="background:var(--bg-card); color:white; border:1px solid var(--border-color); padding:8px; border-radius:8px; font-family:Inter; cursor:pointer;">
                        <option value="latest">Latest</option>
                        <option value="highest">Highest Rating</option>
                        <option value="lowest">Lowest Rating</option>
                    </select>
                    <button class="btn btn-primary" id="openReviewBtn" style="padding: 8px 16px;"><i class="ph ph-pencil-simple"></i> Leave Review</button>
                </div>
            </div>
            <div class="review-full-list" style="margin-top:24px;">
                ${currentReviews.length === 0 ? '<p style="color:#a1a1aa;">No reviews yet. Be the first to review!</p>' : ''}
                ${currentReviews.map((r, i) => `
                    <div class="review-full-item">
                        ${(r.helpfulVotes > 5 || i === 0) && currentReviews.length > 0 ? '<div class="helpful-badge"><i class="ph-fill ph-fire"></i> Most Helpful</div>' : ''}
                        <div class="review-full-item-header">
                            <div>
                                <h4 style="color: var(--primary-hover); margin-bottom:4px;">${r.user}</h4>
                                <div class="tags-list">
                                    ${r.tags && r.tags.length > 0 ? r.tags.map(t => `<span class="tag" style="font-size:10px; padding:2px 8px;">${t}</span>`).join('') : ''}
                                </div>
                            </div>
                            <div class="rest-rating"><i class="ph-fill ph-star"></i> ${r.rating}</div>
                        </div>
                        <p style="color:#d4d4d8; margin-top:12px;">${r.comment}</p>
                    </div>
                `).join('')}
            </div>
        `;

        document.getElementById('openReviewBtn').addEventListener('click', () => {
            formReview.reset();
            document.getElementById('ratingDisplay').innerText = '5 ?';
            document.getElementById('reviewRestId').value = restId;
            openModal(addReviewModal);
        });

        document.getElementById('reviewSort').addEventListener('change', (e) => {
            sortReviews(e.target.value);
        });
    }

    function sortReviews(method) {
        if (method === 'highest') {
            currentReviews.sort((a, b) => b.rating - a.rating);
        } else if (method === 'lowest') {
            currentReviews.sort((a, b) => a.rating - b.rating);
        } else {
            // Latest (assuming original array order or by date)
            currentReviews = [...currentRest.reviews].reverse();
        }
        renderReviews();
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
        document.getElementById('ratingDisplay').innerText = `${e.target.value} ?`;
    });

    // Submit Review
    formReview.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const rawTags = document.getElementById('reviewTags').value;
        const tagsArray = rawTags ? rawTags.split(',').map(t => t.trim()) : [];

        const payload = {
            user: document.getElementById('reviewUser').value,
            rating: document.getElementById('reviewRating').value,
            comment: document.getElementById('reviewComment').value,
            tags: tagsArray
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
