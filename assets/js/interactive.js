document.addEventListener("DOMContentLoaded", function() {

  // --- Navigation Grab & Scroll ---
  const nav = document.getElementById('navStrip');
  let isDn=false, stX, scL;
  if(nav) {
    nav.addEventListener('mousedown', e=>{isDn=true; nav.style.cursor='grabbing'; stX=e.pageX-nav.offsetLeft; scL=nav.scrollLeft;});
    nav.addEventListener('mouseleave', ()=>{isDn=false; nav.style.cursor='';});
    nav.addEventListener('mouseup', ()=>{isDn=false; nav.style.cursor='';});
    nav.addEventListener('mousemove', e=>{if(!isDn)return; e.preventDefault(); nav.scrollLeft=scL-(e.pageX-nav.offsetLeft-stX);});
  }

  // --- Parties Data ---
  window.parties = [
    { id:'ispn',   name:'Islamic Socialist Party of Nigeria',                 abbr:'ISPN',   color:'#16a34a', ideology:'Islamic Socialism',          seats: 4,   defaultSeats: 4,   inCoalition:false, tags: ['Hausa','Secular','Islamic', 'Socialist'] },
    { id:'pda',    name:"People's Democratic Alliance",                       abbr:'PDA',    color:'#e60000', ideology:'Nigerian path to Socialism', seats: 11,  defaultSeats: 11,  inCoalition:false, tags: ['Secular', 'Progressive', 'Socialist', 'Green'] },
    { id:'mecchi', name:"MOTTAINAI-EC/CHI",                                   abbr:'MECCHI', color:'#93c572', ideology:'Green Politics',             seats: 15,  defaultSeats: 15,  inCoalition:false, tags: ['Secular','Yoruba','Progressive', 'Green'] },
    { id:'naa',    name:'New African Alliance',                               abbr:'NAA',    color:'#37b5fd', ideology:'Social Liberalism',          seats: 36,  defaultSeats: 36,  inCoalition:false, tags: ['Igbo','Secular','Progressive', 'Liberal'] },
    { id:'friln',  name:'Front for the Restoration of Integrity and Liberty', abbr:'FLIRN',  color:'#d97706', ideology:'Liberalism',                 seats: 48,  defaultSeats: 48,  inCoalition:false, tags: ['Secular','Progressive', 'Liberal'] },
    { id:'abpl',   name:'All Biafra Progressive List',                        abbr:'ABPL',   color:'#241c69', ideology:'Regionalism (Igbo)',         seats: 91,  defaultSeats: 91,  inCoalition:false, tags: ['Igbo','Regional'] },
    { id:'ndf',    name:'National Democratic Front',                          abbr:'NDF',    color:'#019838', ideology:'Conservatism (Khalilism)',   seats: 68,  defaultSeats: 68,  inCoalition:false, tags: ['Yoruba','Secular', 'Conservative'] },
    { id:'srp',    name:'Southern Renewal Party',                             abbr:'SRP',    color:'#ffd700', ideology:'Regionalism (South)',        seats: 84,  defaultSeats: 84,  inCoalition:false, tags: ['Yoruba','Regional'] },
    { id:'fonr',   name:'Friends of New Rwanda',                              abbr:'FONR',   color:'#e5be01', ideology:'Kagamism',                   seats: 0,   defaultSeats: 0,   inCoalition:false, tags: ['Yoruba','Authoritarian'] },
    { id:'gland',  name:'Godliness Labor and New Democracy',                  abbr:'GLAND',  color:'#c026d3', ideology:'Christian Socialism',        seats: 13,  defaultSeats: 13,  inCoalition:false, tags: ['Christian', 'Socialist'] },
    { id:'salam',  name:'Salam!',                                             abbr:'SALAM!', color:'#65a30d', ideology:'Conservatism (Islamic)',     seats: 121, defaultSeats: 121, inCoalition:false, tags: ['Hausa','Islamic', 'Conservative'] },
    { id:'oba',    name:'Order and Brilliance Assembly',                      abbr:'OBA',    color:'#0b646a', ideology:'Regionalism (Yoruba)',       seats: 17,  defaultSeats: 17,  inCoalition:false, tags: ['Yoruba','Regional', 'Conservative', 'Christian'] },
    { id:'noa',    name:'NEO OMU ARO',                                        abbr:'NOA',    color:'#ffffff', ideology:'Futurist Fascism',           seats: 12,  defaultSeats: 12,  inCoalition:false, tags: ['Igbo','Authoritarian'] },
    { id:'ffa',    name:'Forgotten Farmer Alliance',                          abbr:'FFA',    color:'#e7c084', ideology:'Right-Wing Populism',        seats: 21,  defaultSeats: 21,  inCoalition:false, tags: ['Populist', 'Conservative'] },
    { id:'gop',    name:'Group of the People',                                abbr:'GOP',    color:'#16a34a', ideology:'Right-Wing Populism',        seats: 83,  defaultSeats: 83,  inCoalition:false, tags: ['Hausa','Islamic', 'Populist'] },
  ];

  window.totalSeats = function() { return parties.reduce((s,p) => s + p.seats, 0); };
  window.majorityNeeded = function() { 
    const tot = totalSeats();
    return tot === 0 ? 0 : Math.floor(tot / 2) + 1; 
  };
  window.coalitionSeats = function() { return parties.filter(p=>p.inCoalition).reduce((s,p)=>s+p.seats,0); };

  window.activeTagFilter = 'All';
  window.allTags = ['All', ...new Set(parties.flatMap(p => p.tags || []))].sort();

  window.renderFilters = function() {
    const filterList = document.getElementById('filterList');
    if (!filterList) return;
    filterList.innerHTML = allTags.map(tag => `
      <span class="tag ${tag === activeTagFilter ? 'active-filter' : ''}" 
            onclick="setFilter('${tag}')">${tag}</span>
    `).join('');
  };

  window.setFilter = function(tag) {
    activeTagFilter = tag;
    renderFilters();
    renderPartyList(); 
  };

  window.adjustSeats = function(id, delta) {
    const input = document.getElementById('input-' + id);
    if (input) {
      let newVal = parseInt(input.value) + delta;
      newVal = Math.max(0, newVal);
      input.value = newVal;
      updateSeats(id, newVal);
    }
  };

  window.updateSeats = function(id, val) {
    let targetSeats = parseInt(val);
    if (isNaN(targetSeats) || targetSeats < 0) targetSeats = 0; 
    const p = parties.find(x => x.id === id);
    p.seats = targetSeats;
    parties.forEach(party => {
      const seatDisplay = document.getElementById('seats-' + party.id);
      if (seatDisplay) seatDisplay.textContent = party.seats;
    });
    renderAll();
  };

  window.toggleCoalition = function(id) {
    const p = parties.find(x=>x.id===id);
    p.inCoalition = !p.inCoalition;
    const toggle = document.getElementById('toggle-'+id);
    if(toggle) {
      const row = toggle.closest('.party-row');
      toggle.className = 'coalition-toggle' + (p.inCoalition?' on':'');
      row.className = 'party-row' + (p.inCoalition?' in-coalition':'');
    }
    renderAll();
  };

  window.renderPartyList = function() { 
    const list = document.getElementById('partyList'); 
    if(!list) return;
    list.innerHTML = ''; 
    
    const partiesToShow = activeTagFilter === 'All' 
      ? parties 
      : parties.filter(p => p.tags && p.tags.includes(activeTagFilter));
    
    partiesToShow.forEach(p => { 
      const row = document.createElement('div'); 
      row.className = 'party-row' + (p.inCoalition ? ' in-coalition' : ''); 
      
      const tagsHtml = p.tags ? p.tags.map(t => 
        `<span onclick="setFilter('${t}')" style="cursor: pointer; font-family: 'IBM Plex Mono', monospace; font-size: 8px; color: ${p.color}; border: 1px solid ${p.color}40; padding: 2px 5px; border-radius: 2px; text-transform: uppercase; white-space: nowrap; transition: background 0.2s;" onmouseover="this.style.background='${p.color}20'" onmouseout="this.style.background='transparent'">${t}</span>`
      ).join('') : '';

      row.innerHTML = ` 
        <div class="party-top"> 
          <div class="party-dot" style="background:${p.color};box-shadow:0 0 6px ${p.color};"></div> 
          <div class="party-name">${p.name}</div> 
          <div class="party-abbr">${p.abbr}</div> 
          <div class="party-seats-display" style="color:${p.color};" id="seats-${p.id}">${p.seats}</div> 
          <div class="coalition-toggle ${p.inCoalition ? 'on' : ''}" id="toggle-${p.id}" onclick="toggleCoalition('${p.id}')"></div> 
        </div> 
        
        <div class="party-bottom">         
          <div class="percent-input-wrap"> 
            <button class="pct-btn" onclick="adjustSeats('${p.id}', -1)">−</button>
            <input type="number" 
                   min="0" step="1" 
                   value="${p.seats}" 
                   id="input-${p.id}" 
                   oninput="updateSeats('${p.id}', this.value)"
                   onblur="this.value = parties.find(x=>x.id==='${p.id}').seats">
            <span>Seats</span>
            <button class="pct-btn" onclick="adjustSeats('${p.id}', 1)">+</button>
          </div> 

          <div style="display: flex; gap: 6px; flex: 1; padding: 0 4px; overflow-x: auto; scrollbar-width: none;">
            ${tagsHtml}
          </div>

          <div class="party-ideology">${p.ideology}</div> 
        </div>`;
        
      list.appendChild(row); 
    });
  };

  window.renderMajorityBar = function() {
    const cs = coalitionSeats();
    const tot = totalSeats();
    const maj = majorityNeeded();

    const fill = document.getElementById('barFill');
    const count = document.getElementById('coalitionCount');
    const badge = document.getElementById('majorityBadge');
    const gap = document.getElementById('seatGap');
    const majNeededText = document.getElementById('majorityNeededText');
    const totalSeatsHeader = document.getElementById('totalSeatsHeader');

    if(!fill || !count || !badge || !gap) return;

    if(majNeededText) majNeededText.textContent = `${maj} / ${tot}`;
    if(totalSeatsHeader) totalSeatsHeader.textContent = `${parties.length} Parties · ${tot} Total Seats`;

    let html = '';
    parties.forEach(p => {
      if (!p.inCoalition || p.seats === 0) return;
      const pct = tot > 0 ? (p.seats / tot) * 100 : 0;
      html += `<div class="bar-segment" style="width:${pct}%;background:${p.color};opacity:0.9;"></div>`;
    });
    fill.innerHTML = html;
    
    count.textContent = cs;
    count.className = 'majority-count ' + (cs >= maj ? 'achieved' : cs >= maj-30 ? 'close' : 'far');
    badge.className = 'majority-badge ' + (cs >= maj ? 'achieved' : cs >= maj-30 ? 'close' : 'far');
    badge.textContent = cs >= maj ? '✓ Majority!' : cs >= Math.max(1, maj-30) ? 'Almost…' : 'No Majority';
    
    const need = maj - cs;
    if (need <= 0) {
      const surplus = cs - maj;
      gap.textContent = `Majority secured — ${surplus} seat${surplus===1?'':'s'} to spare`;
    } else {
      gap.textContent = `Need ${need} more seat${need===1?'':'s'} for majority`;
    }

    const majLine = document.querySelector('.bar-majority-line');
    if (majLine && tot > 0) {
      majLine.style.left = `calc(${maj} / ${tot} * 100%)`;
      majLine.setAttribute('data-majority', maj);
    } else if (majLine) {
      majLine.style.left = `50%`;
      majLine.setAttribute('data-majority', 0);
    }
  };

  window.renderParliament = function() {
    const svg = document.getElementById('parliament-svg');
    if(!svg) return;
    
    const total = totalSeats();
    const maj = majorityNeeded();
    const cs = coalitionSeats();

    const config = { width: 400, height: 220, rows: 7, rStart: 95, rStep: 14, seatRadius: 2.2, majority: maj };
    const cx = config.width / 2, cy = config.height - 25;

    const radii = Array.from({length: config.rows}, (_, r) => config.rStart + r * config.rStep);
    const propSum = radii.reduce((a, b) => a + b, 0);
    
    let seatsInRows = radii.map(r => total > 0 ? Math.round((r / propSum) * total) : 0);
    
    if (total > 0) {
      let diff = total - seatsInRows.reduce((a, b) => a + b, 0);
      seatsInRows[seatsInRows.length - 1] += diff;
    }

    let allSeats = [];
    parties.forEach(p => {
      for(let i = 0; i < p.seats; i++)
        allSeats.push({ id: p.id, name: p.name, color: p.color, inCoalition: p.inCoalition });
    });

    let svgContent = `<style>
      .seat-dot { transition: opacity 0.3s ease, transform 0.2s ease, filter 0.3s ease; }
    `;
    
    parties.forEach(p => {
      svgContent += `
        #parliament-svg:has(.group-${p.id}:hover) .group-${p.id} .seat-dot {
          opacity: 1;
          transform: scale(1.4);
          filter: drop-shadow(0px 0px 4px ${p.color}aa);
        }
      `;
    });
    svgContent += `</style>`;

    for (let r = 0; r < config.rows; r++) {
      const count = seatsInRows[r];
      for (let i = 0; i < count; i++) {
        const rowFraction = count > 1 ? i / (count - 1) : 0.5;
        const targetIdx = Math.min(
          Math.round(rowFraction * total - 0.5),
          allSeats.length - 1
        );
        const seat = allSeats[Math.max(0, targetIdx)];

        const angle = Math.PI * (1 - rowFraction);
        const x = cx + radii[r] * Math.cos(angle);
        const y = cy - radii[r] * Math.sin(angle);

        const opacity = seat.inCoalition ? 1 : 0.25;
        const glow = seat.inCoalition ? `filter: drop-shadow(0px 0px 4px ${seat.color}66);` : '';
        
        svgContent += `<g class="seat-wrapper group-${seat.id}" onclick="toggleCoalition('${seat.id}')" style="transform-origin: ${x.toFixed(1)}px ${y.toFixed(1)}px; cursor: pointer;">
          <title>${seat.name} (Click to toggle coalition)</title>
          <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${config.seatRadius}" fill="${seat.color}" opacity="${opacity}" style="${glow}" class="seat-dot"/>
        </g>`;
      }
    }

    const maxRadius = radii[radii.length - 1];
    svgContent += `<line x1="${cx - maxRadius - 10}" y1="${cy + 8}" x2="${cx + maxRadius + 10}" y2="${cy + 8}" stroke="rgba(150, 150, 150, 0.2)" stroke-width="1.5" stroke-dasharray="3,4"/>`;
    const clr = cs >= config.majority ? '#22c55e' : cs >= Math.max(1, config.majority - 30) ? '#f59e0b' : '#ef4444';
    svgContent += `<text x="${cx}" y="${cy - 10}" text-anchor="middle" font-family="'Bebas Neue', system-ui, sans-serif" font-size="34" font-weight="bold" fill="${clr}">${cs}</text>`;
    svg.innerHTML = svgContent;
  };

  window.renderCoalitionChips = function() {
    const chips = document.getElementById('coalitionChips');
    if(!chips) return;
    const inCoal = parties.filter(p=>p.inCoalition);
    if (inCoal.length === 0) {
      chips.innerHTML = '<span class="coalition-empty">No parties selected — toggle parties above</span>';
      return;
    }
    chips.innerHTML = inCoal.map(p=>
      `<span class="coalition-chip" style="color:${p.color};border-color:${p.color};background:${p.color}18;">${p.abbr} ${p.seats}</span>`
    ).join('');
  };

  window.renderAll = function() {
    renderMajorityBar();
    renderCoalitionChips();
    renderParliament();
  };

  window.resetAll = function() {
    parties.forEach(p => { p.seats=p.defaultSeats; p.inCoalition=false; });
    renderPartyList();
    renderAll();
  };

  // Initialization
  renderFilters();
  renderPartyList();
  renderAll();

});
