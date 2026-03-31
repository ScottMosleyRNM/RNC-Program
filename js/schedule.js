/* ============================================
   RNC 2026 — Schedule Overview Page
   ============================================ */

(async function() {
  const days = await App.getSchedule();
  const speakers = await App.getSpeakers();
  const speakerMap = {};
  speakers.forEach(s => speakerMap[s.id] = s);

  const tabsContainer = document.getElementById('day-tabs');
  const content = document.getElementById('schedule-content');

  let activeDay = parseInt(App.getParam('day')) || 0;

  function renderTabs() {
    tabsContainer.innerHTML = days.map((day, i) =>
      `<button class="day-tab${i === activeDay ? ' active' : ''}" data-day="${i}">${day.tabLabel}</button>`
    ).join('');
  }

  function renderDay(dayIndex) {
    const day = days[dayIndex];
    let html = `
      <div class="day-header">
        <div class="day-name">${day.label}</div>
        <div class="day-date">${day.dateDisplay}</div>
      </div>
    `;

    day.events.forEach((event, evtIdx) => {
      if (event.type === 'info') {
        html += `
          <div class="event-card concludes">
            <div class="event-time">${event.startTime}</div>
            <div class="event-title">${event.title}</div>
            ${event.roomLabel ? `<div class="event-location">${event.roomLabel}</div>` : ''}
          </div>
        `;
      } else if (event.type === 'main') {
        const eventSpeakers = event.speakerIds.map(id => speakerMap[id]).filter(Boolean);
        html += `
          <div class="event-card" onclick="location.href='event?id=${event.id}&day=${dayIndex}'">
            <div class="event-time">${event.startTime}</div>
            <div class="event-content">
              <div class="event-info">
                <div class="event-title">${event.title}</div>
                <div class="event-location">${event.roomLabel}</div>
                <a class="btn-details" href="event?id=${event.id}&day=${dayIndex}">Details</a>
              </div>
              <div class="event-speakers-photos">
                ${eventSpeakers.map(s => `
                  <div class="speaker-photo-card">
                    ${App.speakerImage(s, 120, 140)}
                    <div class="speaker-name-label">${s.name}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        `;
      } else if (event.type === 'breakout-group') {
        html += `
          <div class="breakout-group">
            <div class="breakout-group-time">${event.startTime}</div>
            <div class="breakout-group-label">${event.title}</div>
            <div class="breakout-list">
              ${event.breakouts.map(bo => {
                const sp = speakerMap[bo.speakerId];
                return `
                  <a class="breakout-item" href="event?id=${bo.id}&day=${dayIndex}&parent=${event.id}">
                    ${sp ? App.speakerImageRound(sp, 52) : ''}
                    <div class="breakout-item-info">
                      <div class="breakout-item-title">${bo.title}</div>
                      <div class="breakout-item-speaker">${sp ? sp.name : ''}</div>
                      <div class="breakout-item-room">${bo.room}</div>
                    </div>
                  </a>
                `;
              }).join('')}
            </div>
          </div>
        `;
      }

      // Insert banners after certain events
      if (dayIndex === 0 && evtIdx === 0) {
        html += `
          <div class="promo-banner">
            <div class="promo-icon">▶</div>
            <div class="promo-text">
              <div class="promo-title">RightNow Media</div>
              <div class="promo-desc">Stream thousands of Bible study videos. Free for your entire church.</div>
            </div>
          </div>
        `;
      }
      if (dayIndex === 1 && evtIdx === 0) {
        html += `
          <div class="announcement-banner">
            <div class="banner-label">Announcement</div>
            <div class="banner-text">Schedule updates and room changes will appear here. Check back before each session!</div>
          </div>
        `;
      }
      if (dayIndex === 1 && evtIdx === 2) {
        html += `
          <div class="sponsor-banner">
            <div class="sponsor-label">Presented by</div>
            <div class="sponsor-content">Sponsor message and branding goes here. Partner with us to reach pastors and church leaders.</div>
          </div>
        `;
      }
    });

    // Emcee section at bottom of each day
    html += `
      <div class="emcee-section">
        <div class="placeholder-img round" style="width:80px;height:80px;background:#5a6a8c;font-size:24px;">EM</div>
        <div class="emcee-info">
          <div class="emcee-label">Meet Your Emcee</div>
          <div class="emcee-name">Your Host</div>
          <div class="emcee-bio">Your conference emcee will guide you through each day, keeping things on schedule and on track. More details coming soon!</div>
        </div>
      </div>
    `;

    content.innerHTML = html;
  }

  // Tab click handler
  tabsContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('day-tab')) {
      activeDay = parseInt(e.target.dataset.day);
      renderTabs();
      renderDay(activeDay);
      window.scrollTo(0, 0);
    }
  });

  renderTabs();
  renderDay(activeDay);
})();
