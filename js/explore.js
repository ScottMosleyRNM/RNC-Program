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
        ${App.listingImage(listing, 160)}
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
