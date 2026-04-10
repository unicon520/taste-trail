document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const grid = document.getElementById('restaurantGrid');
    
    // Modals
    const overlay = document.getElementById('modalOverlay');
    const addRestModal = document.getElementById('addRestaurantModal');
    const addReviewModal = document.getElementById('addReviewModal');
    
    // Buttons
    const btnAddRest = document.getElementById('addRestaurantBtn');
    const closeBtns = document.querySelectorAll('.close-modal');
    
    // Forms
    const formRest = document.getElementById('addRestaurantForm');
    const formReview = document.getElementById('addReviewForm');

    // State
    let currentRestaurants = [];

    // Initialize
    fetchRestaurants();

    // --- Actions ---

    async function fetchRestaurants() {
        try {
            const res = await fetch('/api/restaurants');
            currentRestaurants = await res.json();
            renderGrid(currentRestaurants);
        } catch (error) {
            console.error('Error fetching restaurants', error);
            grid.innerHTML = '<div class="loading">Failed to load spots. Check connection.</div>';
        }
    }

    // Modal Logic
    function openModal(modal) {
        overlay.classList.add('active');
        // hide all modals first
        document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
        modal.classList.add('active');
    }

    function closeModal() {
        overlay.classList.remove('active');
        document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
    }

    // Event Listeners for Modals
    btnAddRest.addEventListener('click', () => {
        formRest.reset();
        openModal(addRestModal);
    });

    closeBtns.forEach(btn => btn.addEventListener('click', closeModal));
    overlay.addEventListener('click', (e) => {
        if(e.target === overlay) closeModal();
    });

    // Rating Slider Visualizer
    const ratingInput = document.getElementById('reviewRating');
    const ratingDisplay = document.getElementById('ratingDisplay');
    ratingInput.addEventListener('input', (e) => {
        ratingDisplay.innerText = `${e.target.value} ⭐`;
    });

    // Delegate clicks on dynamically created grid
    grid.addEventListener('click', (e) => {
        const btn = e.target.closest('.add-review-btn');
        if (btn) {
            const id = btn.dataset.id;
            const name = btn.dataset.name;
            openReviewModal(id, name);
        }
    });

    function openReviewModal(id, name) {
        formReview.reset();
        ratingDisplay.innerText = '5 ⭐';
        document.getElementById('reviewRestId').value = id;
        document.getElementById('reviewTargetName').innerText = `Reviewing: ${name}`;
        openModal(addReviewModal);
    }

    // --- Form Submissions ---

    formRest.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const payload = {
            name: document.getElementById('restName').value,
            location: document.getElementById('restLocation').value,
            cuisine: document.getElementById('restCuisine').value,
            imageUrl: document.getElementById('restImageUrl').value
        };

        try {
            const res = await fetch('/api/restaurants', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            if (res.ok) {
                closeModal();
                fetchRestaurants(); // Refresh
            }
        } catch (error) {
            console.error('Error adding restaurant', error);
        }
    });

    formReview.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const restId = document.getElementById('reviewRestId').value;
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
                fetchRestaurants(); // Refresh
            }
        } catch (error) {
            console.error('Error adding review', error);
        }
    });


    // --- Rendering ---

    function renderGrid(restaurants) {
        if (restaurants.length === 0) {
            grid.innerHTML = '<div class="loading">No spots yet. Be the first to add one!</div>';
            return;
        }

        grid.innerHTML = restaurants.map(rest => `
            <div class="rest-card">
                <img src="${rest.imageUrl || 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80&w=800'}" alt="${rest.name}" class="rest-img">
                <div class="rest-content">
                    <div class="rest-header">
                        <div>
                            <div class="rest-cuisine">${rest.cuisine}</div>
                            <h3 class="rest-name">${rest.name}</h3>
                        </div>
                        <div class="rest-rating">
                            <i class="ph-fill ph-star"></i>
                            ${rest.rating || 'New'}
                        </div>
                    </div>
                    
                    <div class="rest-meta">
                        <i class="ph ph-map-pin"></i> ${rest.location}
                    </div>

                    <div class="reviews-preview">
                        ${rest.reviews.slice(-2).reverse().map(r => `
                            <div class="review-item">
                                <span>${r.user}</span>: "${r.comment}" (${r.rating}⭐)
                            </div>
                        `).join('')}
                        ${rest.reviews.length > 2 ? `<div class="review-item" style="text-align: center; background: none; color: #a1a1aa;">+ ${rest.reviews.length - 2} more reviews</div>` : ''}
                        
                        <button class="add-review-btn" data-id="${rest.id}" data-name="${rest.name}">
                            <i class="ph ph-pencil-simple"></i> Write a review
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
});
