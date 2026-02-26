/**
 * CoinCollection - Main JavaScript
 * Track your coin collection with style
 */

// State management
let coins = JSON.parse(localStorage.getItem('coinCollection')) || [];
let currentFilter = 'all';

// DOM Elements
const addCoinForm = document.getElementById('addCoinForm');
const coinGrid = document.getElementById('coinGrid');
const emptyState = document.getElementById('emptyState');
const countryFilter = document.getElementById('countryFilter');
const clearFilterBtn = document.getElementById('clearFilter');
const totalCoinsEl = document.getElementById('totalCoins');
const totalValueEl = document.getElementById('totalValue');
const totalCountriesEl = document.getElementById('totalCountries');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderCollection();
    updateStats();
    updateCountryFilter();
});

// Add Coin
addCoinForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = new FormData(addCoinForm);
    const currency = formData.get('currency') === 'other' ? '' : formData.get('currency');
    
    const newCoin = {
        id: Date.now(),
        country: formData.get('country').trim(),
        year: parseInt(formData.get('year')),
        value: parseFloat(formData.get('value')),
        currency: currency,
        description: formData.get('description').trim() || '',
        addedAt: new Date().toISOString()
    };
    
    coins.push(newCoin);
    saveCoins();
    
    // Reset form
    addCoinForm.reset();
    
    // Update UI
    renderCollection();
    updateStats();
    updateCountryFilter();
    
    // Show success animation
    showNotification('Coin added successfully!', 'success');
});

// Filter Change
countryFilter.addEventListener('change', (e) => {
    currentFilter = e.target.value;
    renderCollection();
});

// Clear Filter
clearFilterBtn.addEventListener('click', () => {
    currentFilter = 'all';
    countryFilter.value = 'all';
    renderCollection();
});

// Render Collection
function renderCollection() {
    // Filter coins
    let filteredCoins = coins;
    if (currentFilter !== 'all') {
        filteredCoins = coins.filter(coin => 
            coin.country.toLowerCase() === currentFilter.toLowerCase()
        );
    }
    
    // Show/hide empty state
    if (filteredCoins.length === 0) {
        coinGrid.innerHTML = '';
        emptyState.style.display = 'block';
        if (coins.length > 0 && currentFilter !== 'all') {
            emptyState.querySelector('p').textContent = 'No coins found for this country';
            emptyState.querySelector('.empty-hint').textContent = 'Try selecting a different filter';
        } else {
            emptyState.querySelector('p').textContent = 'Your collection is empty';
            emptyState.querySelector('.empty-hint').textContent = 'Add your first coin above to get started!';
        }
        return;
    }
    
    emptyState.style.display = 'none';
    
    // Sort by date added (newest first)
    filteredCoins.sort((a, b) => b.id - a.id);
    
    // Render coins
    coinGrid.innerHTML = filteredCoins.map(coin => `
        <div class="coin-card" data-id="${coin.id}">
            <div class="coin-header">
                <span class="coin-country">${escapeHtml(coin.country)}</span>
                <span class="coin-year">${coin.year}</span>
            </div>
            <div class="coin-value">${coin.currency}${coin.value.toFixed(2)}</div>
            <div class="coin-description">${escapeHtml(coin.description) || 'No description'}</div>
            <div class="coin-actions">
                <button class="btn-delete" onclick="deleteCoin(${coin.id})">
                    🗑️ Delete
                </button>
            </div>
        </div>
    `).join('');
}

// Delete Coin
function deleteCoin(id) {
    if (confirm('Are you sure you want to delete this coin?')) {
        coins = coins.filter(coin => coin.id !== id);
        saveCoins();
        renderCollection();
        updateStats();
        updateCountryFilter();
        showNotification('Coin deleted', 'info');
    }
}

// Update Statistics
function updateStats() {
    const totalCoins = coins.length;
    const totalValue = coins.reduce((sum, coin) => sum + coin.value, 0);
    const uniqueCountries = new Set(coins.map(coin => coin.country.toLowerCase())).size;
    
    // Animate numbers
    animateNumber(totalCoinsEl, parseInt(totalCoinsEl.textContent), totalCoins);
    totalValueEl.textContent = `$${totalValue.toFixed(2)}`;
    animateNumber(totalCountriesEl, parseInt(totalCountriesEl.textContent), uniqueCountries);
}

// Update Country Filter Dropdown
function updateCountryFilter() {
    const countries = [...new Set(coins.map(coin => coin.country))].sort();
    const currentSelection = countryFilter.value;
    
    countryFilter.innerHTML = '<option value="all">All Countries</option>';
    
    countries.forEach(country => {
        const option = document.createElement('option');
        option.value = country;
        option.textContent = country;
        countryFilter.appendChild(option);
    });
    
    // Restore selection if it still exists
    if (currentSelection !== 'all' && countries.includes(currentSelection)) {
        countryFilter.value = currentSelection;
    }
}

// Save to LocalStorage
function saveCoins() {
    localStorage.setItem('coinCollection', JSON.stringify(coins));
}

// Utility: Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Utility: Animate Number
function animateNumber(element, start, end) {
    const duration = 500;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
        
        const current = Math.round(start + (end - start) * easeProgress);
        element.textContent = current;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

// Utility: Show Notification
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        background: ${type === 'success' ? '#4ecca3' : '#3498db'};
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add notification animations to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Export for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { coins, addCoin, deleteCoin, getStats };
}
