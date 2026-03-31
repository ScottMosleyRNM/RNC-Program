/* ============================================
   RNC 2026 — Shared App Utilities
   ============================================ */

const App = {
  cache: {},

  async loadJSON(path) {
    if (this.cache[path]) return this.cache[path];
    const res = await fetch(path);
    const data = await res.json();
    this.cache[path] = data;
    return data;
  },

  async getSpeakers() {
    const data = await this.loadJSON('data/speakers.json');
    return data.speakers;
  },

  async getSpeaker(id) {
    const speakers = await this.getSpeakers();
    return speakers.find(s => s.id === id);
  },

  async getSchedule() {
    const data = await this.loadJSON('data/schedule.json');
    return data.days;
  },

  async getVenues() {
    const data = await this.loadJSON('data/venues.json');
    return data.rooms;
  },

  async getLocalGuide() {
    const data = await this.loadJSON('data/local-guide.json');
    return data.categories;
  },

  getParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  },

  /* ---- Placeholder helpers (fallback when no image) ---- */

  speakerPlaceholder(speaker, width, height) {
    return `<div class="placeholder-img" style="width:${width}px;height:${height}px;background:${speaker.color};border-radius:4px;font-size:${Math.floor(width/3.5)}px;">${speaker.initials}</div>`;
  },

  speakerPlaceholderRound(speaker, size) {
    return `<div class="placeholder-img round" style="width:${size}px;height:${size}px;background:${speaker.color};font-size:${Math.floor(size/3)}px;">${speaker.initials}</div>`;
  },

  /* ---- Progressive image helpers ---- */

  // Rectangular speaker image with colored placeholder underneath
  speakerImage(speaker, width, height) {
    if (!speaker.image) return this.speakerPlaceholder(speaker, width, height);
    return `<div class="prog-img" style="width:${width}px;height:${height}px;background:${speaker.color};border-radius:4px;">
      <span class="prog-img-initials" style="font-size:${Math.floor(width/3.5)}px;">${speaker.initials}</span>
      <img src="${speaker.image}" alt="${speaker.name}" width="${width}" height="${height}" loading="lazy" onload="this.parentNode.classList.add('loaded')" onerror="this.remove()">
    </div>`;
  },

  // Round speaker image with colored placeholder underneath
  speakerImageRound(speaker, size) {
    if (!speaker.image) return this.speakerPlaceholderRound(speaker, size);
    return `<div class="prog-img round" style="width:${size}px;height:${size}px;background:${speaker.color};">
      <span class="prog-img-initials" style="font-size:${Math.floor(size/3)}px;">${speaker.initials}</span>
      <img src="${speaker.image}" alt="${speaker.name}" width="${size}" height="${size}" loading="lazy" onload="this.parentNode.classList.add('loaded')" onerror="this.remove()">
    </div>`;
  },

  // Listing image with emoji placeholder underneath
  listingImage(listing, height) {
    const emoji = listing.type === 'BBQ' ? '🍖' : listing.type === 'Mexican' ? '🌮' : listing.type === 'Tacos' ? '🌮' : listing.type === 'Pizza' ? '🍕' : listing.type.includes('Coffee') || listing.type.includes('Cafe') || listing.type.includes('Roaster') ? '☕' : listing.type.includes('Garden') ? '🌿' : listing.type.includes('Tower') || listing.type.includes('Observation') ? '🏙️' : listing.type.includes('Shopping') ? '🛍️' : listing.type.includes('Park') ? '🌳' : '📍';
    if (!listing.image) {
      return `<div class="listing-img placeholder-img" style="height:${height}px;background:linear-gradient(135deg,var(--bg-card),var(--bg-secondary));font-size:2rem;">${emoji}</div>`;
    }
    return `<div class="prog-img listing-img" style="height:${height}px;background:linear-gradient(135deg,var(--bg-card),var(--bg-secondary));">
      <span class="prog-img-initials" style="font-size:2rem;">${emoji}</span>
      <img src="${listing.image}" alt="${listing.name}" style="width:100%;height:${height}px;object-fit:cover;" loading="lazy" onload="this.parentNode.classList.add('loaded')" onerror="this.remove()">
    </div>`;
  }
};

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
