/* ============================================
   RNC 2026 — Event Detail Page
   ============================================ */

(async function() {
  const eventId = App.getParam('id');
  const dayIndex = parseInt(App.getParam('day')) || 0;
  const parentId = App.getParam('parent');

  const days = await App.getSchedule();
  const speakers = await App.getSpeakers();
  const speakerMap = {};
  speakers.forEach(s => speakerMap[s.id] = s);

  const container = document.getElementById('event-detail');
  const day = days[dayIndex];

  // Find the event — could be top-level or a breakout
  let event = null;
  let isBreakout = false;

  for (const evt of day.events) {
    if (evt.id === eventId) {
      event = evt;
      break;
    }
    if (evt.breakouts) {
      const bo = evt.breakouts.find(b => b.id === eventId);
      if (bo) {
        event = {
          id: bo.id,
          title: bo.title,
          type: 'breakout',
          startTime: evt.startTime,
          endTime: evt.endTime,
          room: bo.room,
          roomLabel: bo.room,
          description: bo.description,
          speakerIds: [bo.speakerId]
        };
        isBreakout = true;
        break;
      }
    }
  }

  if (!event) {
    container.innerHTML = '<p style="padding:24px;color:#b0b5c5;">Event not found.</p>';
    return;
  }

  const eventSpeakers = (event.speakerIds || []).map(id => speakerMap[id]).filter(Boolean);

  // Find other sessions for these speakers
  function findOtherSessions(speakerId) {
    const others = [];
    days.forEach((d, di) => {
      d.events.forEach(evt => {
        if (evt.speakerIds && evt.speakerIds.includes(speakerId) && evt.id !== event.id) {
          others.push({ ...evt, dayIndex: di, dayLabel: d.label });
        }
        if (evt.breakouts) {
          evt.breakouts.forEach(bo => {
            if (bo.speakerId === speakerId && bo.id !== event.id) {
              others.push({
                id: bo.id,
                title: bo.title,
                startTime: evt.startTime,
                roomLabel: bo.room,
                dayIndex: di,
                dayLabel: d.label,
                parentId: evt.id
              });
            }
          });
        }
      });
    });
    return others;
  }

  let html = `
    <a class="back-link" href="index.html?day=${dayIndex}">← Back to Schedule</a>
    <div class="detail-header">
      <div class="detail-meta">${day.label} | ${event.startTime}${event.endTime ? ' – ' + event.endTime : ''}</div>
      <div class="detail-title">${event.title}</div>
      <div class="detail-location">${event.roomLabel || ''}</div>
      ${event.roomLabel ? `<a class="btn-map" href="map.html?room=${event.room || ''}">Map <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></a>` : ''}
    </div>
  `;

  if (event.description) {
    html += `<div class="detail-description">${event.description}</div>`;
  }

  // RightNow Media promo between description and speakers
  html += `
    <div class="promo-banner">
      <div class="promo-icon">▶</div>
      <div class="promo-text">
        <div class="promo-title">Watch on RightNow Media</div>
        <div class="promo-desc">Find related Bible studies and teaching content on RightNow Media.</div>
      </div>
    </div>
  `;

  eventSpeakers.forEach(speaker => {
    const otherSessions = findOtherSessions(speaker.id);

    html += `
      <div class="speaker-detail">
        ${App.speakerImage(speaker, 200, 220)}
        <div class="speaker-name">${speaker.name}</div>
        ${speaker.title ? `<div class="speaker-title-org">${speaker.title}${speaker.church ? ', ' + speaker.church : ''}</div>` : ''}
        <div class="speaker-divider"></div>
        <div class="speaker-bio">${speaker.bio}</div>
      </div>
    `;

    if (otherSessions.length > 0) {
      html += `
        <div class="other-sessions">
          <h3>Also featuring ${speaker.name}</h3>
          ${otherSessions.map(os => `
            <a class="other-session-link" href="event.html?id=${os.id}&day=${os.dayIndex}${os.parentId ? '&parent=' + os.parentId : ''}">
              <div class="os-title">${os.title}</div>
              <div class="os-meta">${os.dayLabel} · ${os.startTime} · ${os.roomLabel || ''}</div>
            </a>
          `).join('')}
        </div>
      `;
    }
  });

  container.innerHTML = html;
})();
