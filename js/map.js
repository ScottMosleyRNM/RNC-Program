/* ============================================
   RNC 2026 — Map Page
   ============================================ */

(async function() {
  const rooms = await App.getVenues();
  const highlightRoom = App.getParam('room');

  const legendContainer = document.getElementById('map-legend');
  const mapSvg = document.getElementById('map-svg');

  // Build a simple floor plan SVG
  const roomPositions = [
    { id: 'worship-center', x: 40, y: 30, w: 280, h: 100, label: 'Worship Center' },
    { id: 'fellowship-hall', x: 40, y: 150, w: 280, h: 60, label: 'Fellowship Hall' },
    { id: 'room-101', x: 40, y: 230, w: 85, h: 50, label: '101' },
    { id: 'room-102', x: 137, y: 230, w: 85, h: 50, label: '102' },
    { id: 'room-201', x: 234, y: 230, w: 85, h: 50, label: '201' },
    { id: 'room-202', x: 40, y: 295, w: 85, h: 50, label: '202' },
    { id: 'room-203', x: 137, y: 295, w: 85, h: 50, label: '203' },
    { id: 'room-301', x: 234, y: 295, w: 85, h: 50, label: '301' },
    { id: 'room-302', x: 40, y: 360, w: 85, h: 50, label: '302' },
    { id: 'room-303', x: 137, y: 360, w: 85, h: 50, label: '303' },
    { id: 'room-304', x: 234, y: 360, w: 85, h: 50, label: '304' }
  ];

  const roomColorMap = {};
  rooms.forEach(r => roomColorMap[r.id] = r.color);

  let svg = `<svg viewBox="0 0 360 430" xmlns="http://www.w3.org/2000/svg">`;
  svg += `<rect width="360" height="430" fill="#1a1f2e" rx="8"/>`;

  // Hallway lines
  svg += `<rect x="40" y="220" width="280" height="200" fill="none" stroke="#333" stroke-width="1" rx="4"/>`;

  roomPositions.forEach(rp => {
    const color = roomColorMap[rp.id] || '#555';
    const isHighlighted = highlightRoom === rp.id;
    const opacity = isHighlighted ? 0.9 : 0.4;
    const strokeW = isHighlighted ? 3 : 1;
    const cls = isHighlighted ? ' class="room-highlight"' : '';

    svg += `<rect x="${rp.x}" y="${rp.y}" width="${rp.w}" height="${rp.h}" fill="${color}" fill-opacity="${opacity}" stroke="${color}" stroke-width="${strokeW}" rx="4"${cls}/>`;
    svg += `<text x="${rp.x + rp.w/2}" y="${rp.y + rp.h/2 + 5}" text-anchor="middle" fill="white" font-size="${rp.w > 100 ? 14 : 11}" font-weight="bold" font-family="-apple-system,sans-serif">${rp.label}</text>`;
  });

  // Entrance marker
  svg += `<text x="180" y="425" text-anchor="middle" fill="#8a8fa0" font-size="10" font-family="-apple-system,sans-serif">▲ MAIN ENTRANCE</text>`;

  svg += `</svg>`;
  mapSvg.innerHTML = svg;

  // Legend
  let legendHtml = '<h3>Rooms</h3>';
  rooms.forEach(room => {
    const isHL = highlightRoom === room.id;
    legendHtml += `
      <div class="legend-item" style="${isHL ? 'background:rgba(200,164,78,0.1);border-radius:6px;padding:8px;' : ''}">
        <div class="legend-dot" style="background:${room.color};"></div>
        <span class="legend-label">${room.label}${isHL ? ' ← You are here' : ''}</span>
      </div>
    `;
  });
  legendContainer.innerHTML = legendHtml;
})();
