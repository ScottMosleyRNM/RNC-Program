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

  speakerPlaceholder(speaker, width, height) {
    return `<div class="placeholder-img" style="width:${width}px;height:${height}px;background:${speaker.color};border-radius:4px;font-size:${Math.floor(width/3.5)}px;">${speaker.initials}</div>`;
  },

  speakerPlaceholderRound(speaker, size) {
    return `<div class="placeholder-img round" style="width:${size}px;height:${size}px;background:${speaker.color};font-size:${Math.floor(size/3)}px;">${speaker.initials}</div>`;
  }
};

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
