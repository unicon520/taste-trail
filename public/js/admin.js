document.addEventListener('DOMContentLoaded', () => {
    const restaurantsTableBody = document.getElementById('restaurantsTableBody');
    const blacklistTableBody = document.getElementById('blacklistTableBody');
    const blacklistForm = document.getElementById('blacklistForm');

    // Initial Load
    fetchRestaurants();
    fetchBlacklist();

    // --- Restaurants Management ---

    async function fetchRestaurants() {
        try {
            const res = await fetch('/api/restaurants');
            const data = await res.json();
            renderRestaurants(data);
        } catch (err) {
            console.error('Error fetching restaurants:', err);
        }
    }

    function renderRestaurants(restaurants) {
        restaurantsTableBody.innerHTML = restaurants.map(rest => `
            <tr>
                <td>${rest.name}</td>
                <td>${rest.location}</td>
                <td>
                    <button class="btn btn-outline btn-danger delete-rest-btn" data-id="${rest.id}">
                        <i class="ph ph-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `).join('');

        // Attach delete listeners
        document.querySelectorAll('.delete-rest-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                if (!confirm('Are you sure you want to delete this restaurant and all its reviews?')) return;
                const id = btn.dataset.id;
                try {
                    const res = await fetch(`/api/admin/restaurants/${id}`, { method: 'DELETE' });
                    if (res.ok) fetchRestaurants();
                    else alert('Failed to delete.');
                } catch (err) {
                    console.error('Error:', err);
                }
            });
        });
    }

    // --- Blacklist Management ---

    async function fetchBlacklist() {
        try {
            const res = await fetch('/api/admin/blacklist');
            const data = await res.json();
            renderBlacklist(data);
        } catch (err) {
            console.error('Error fetching blacklist:', err);
        }
    }

    function renderBlacklist(list) {
        blacklistTableBody.innerHTML = list.map(item => `
            <tr>
                <td>${item.identifier}</td>
                <td>${item.reason || 'No reason provided'}</td>
                <td>${new Date(item.createdAt).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-outline unblacklist-btn" data-id="${item._id}">
                        Remove
                    </button>
                </td>
            </tr>
        `).join('');

        // Attach unblacklist listeners
        document.querySelectorAll('.unblacklist-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = btn.dataset.id;
                try {
                    const res = await fetch(`/api/admin/blacklist/${id}`, { method: 'DELETE' });
                    if (res.ok) fetchBlacklist();
                } catch (err) {
                    console.error('Error:', err);
                }
            });
        });
    }

    blacklistForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            identifier: document.getElementById('blacklistIdentifier').value,
            reason: document.getElementById('blacklistReason').value
        };

        try {
            const res = await fetch('/api/admin/blacklist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                blacklistForm.reset();
                fetchBlacklist();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to blacklist.');
            }
        } catch (err) {
            console.error('Error blacklisting:', err);
        }
    });
});
