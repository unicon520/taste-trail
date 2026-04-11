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

    // Filters
    const searchInput = document.getElementById('searchInput');
    const cuisineFilters = document.querySelectorAll('.cuisine-filters .filter-chip');
    const priceFilters = document.querySelectorAll('.price-filters .filter-chip');

    // State
    let currentRestaurants = [];
    let currentCuisineFilter = 'all';
    let currentPriceFilter = 'any';

    // Initialize
    fetchRestaurants();

    // Setup Filters
    if(searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }
    
    if(cuisineFilters.length > 0) {
        cuisineFilters.forEach(btn => {
            btn.addEventListener('click', (e) => {
                cuisineFilters.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                currentCuisineFilter = e.target.dataset.cuisine;
                applyFilters();
            });
        });
    }

    if(priceFilters.length > 0) {
        priceFilters.forEach(btn => {
            btn.addEventListener('click', (e) => {
                priceFilters.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                currentPriceFilter = e.target.dataset.price;
                applyFilters();
            });
        });
    }

    function applyFilters() {
        const query = searchInput.value.toLowerCase();
        
        const filtered = currentRestaurants.filter(rest => {
            const matchesSearch = rest.name.toLowerCase().includes(query) || rest.location.toLowerCase().includes(query);
            const matchesCuisine = currentCuisineFilter === 'all' || rest.cuisine.toLowerCase() === currentCuisineFilter.toLowerCase();
            
            // Mock price range if it doesn't exist for filtering purposes
            const price = rest.priceRange || '$$'; 
            const matchesPrice = currentPriceFilter === 'any' || price === currentPriceFilter;

            return matchesSearch && matchesCuisine && matchesPrice;
        });

        renderGrid(filtered);
    }

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
        const btn = e.target.closest('.view-details-btn');
        if (btn) {
            window.location.href = `/restaurant.html?id=${btn.dataset.id}`;
        }
    });

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
            } else {
                const errorData = await res.json();
                alert('Action failed: ' + (errorData.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error adding restaurant', error);
            alert('A network error occurred. See console.');
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
                        
                        <button class="add-review-btn view-details-btn" data-id="${rest.id}">
                            View Details
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
});
