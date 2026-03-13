/* ============================================
   RNC 2026 — Explore / Local Guide Page
   ============================================ */

(async function() {
  const categories = await App.getLocalGuide();
  const tabsEl = document.getElementById('explore-tabs');
  const listEl = document.getElementById('explore-listings');

  let activeTab = 0;

  function renderTabs() {
    tabsEl.innerHTML = categories.map((cat, i) =>
      `<button class="explore-tab${i === activeTab ? ' active' : ''}" data-tab="${i}">${cat.name}</button>`
    ).join('');
  }

  function renderListings() {
    const cat = categories[activeTab];
    listEl.innerHTML = cat.listings.map(listing => `
      <div class="listing-card">
        <div class="listing-img placeholder-img" style="height:160px;background:linear-gradient(135deg,var(--bg-card),var(--bg-secondary));font-size:2rem;">
          ${listing.type === 'BBQ' ? '🍖' : listing.type === 'Mexican' ? '🌮' : listing.type === 'Tacos' ? '🌮' : listing.type === 'Pizza' ? '🍕' : listing.type.includes('Coffee') || listing.type.includes('Cafe') || listing.type.includes('Roaster') ? '☕' : listing.type.includes('Garden') ? '🌿' : listing.type.includes('Tower') || listing.type.includes('Observation') ? '🏙️' : listing.type.includes('Shopping') ? '🛍️' : listing.type.includes('Park') ? '🌳' : '📍'}
        </div>
        <div class="listing-body">
          <div class="listing-name">${listing.name}</div>
          <div class="listing-type">${listing.type}</div>
          <div class="listing-address"><a href="${listing.mapsUrl}" target="_blank" rel="noopener">${listing.address}</a></div>
          <div class="listing-hours">${listing.hours}</div>
          ${listing.deal ? `<div class="deal-badge">${listing.deal}</div>` : ''}
        </div>
      </div>
    `).join('');
  }

  tabsEl.addEventListener('click', (e) => {
    if (e.target.classList.contains('explore-tab')) {
      activeTab = parseInt(e.target.dataset.tab);
      renderTabs();
      renderListings();
    }
  });

  renderTabs();
  renderListings();
})();
