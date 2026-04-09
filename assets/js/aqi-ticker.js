function initAQITicker() {
  const scroll = document.getElementById('aqiScroll');
  if (!scroll) return false;

  let html = '';
  // Repeat for smooth infinite loop
  for (let i = 0; i < 4; i++) {
    aqiData.forEach(d => {
      html += `<span class="aqi-item">
        <span class="aqi-dot" style="background:${d.color}"></span>
        <span class="aqi-city">${d.city}</span>
        <span class="aqi-val" style="color:${d.color}">${d.aqi}</span>
      </span>`;
    });
  }
  scroll.innerHTML = html;
  return true;
}

function initAQIPanel() {
  const panel = document.getElementById('aqiCities');
  if (!panel) return false;

  panel.innerHTML = '';
  aqiData.forEach(d => {
    const pct = Math.min((d.aqi / 300) * 100, 100);
    panel.innerHTML += `
      <div class="aqi-city-row">
        <span class="aqi-city-name">${d.city}</span>
        <div class="aqi-bar-track">
          <div class="aqi-bar-fill" style="width:${pct}%; background:${d.color}"></div>
        </div>
        <span class="aqi-number" style="color:${d.color}">${d.aqi}</span>
        <span class="aqi-status-badge" style="background:${d.color}22; color:${d.color}">${d.status}</span>
      </div>`;
  });
  return true;
}

// Global initialization function
window.initAQI = function() {
    const tickerDone = initAQITicker();
    const panelDone = initAQIPanel();
    return tickerDone || panelDone;
};

// Auto-retry mechanism to handle dynamic loading
(function autoInit() {
    let tickerInitialized = false;
    let panelInitialized = false;
    
    const attempt = () => {
        if (typeof aqiData === 'undefined') {
            setTimeout(attempt, 100);
            return;
        }
        
        if (!tickerInitialized) tickerInitialized = initAQITicker();
        if (!panelInitialized) panelInitialized = initAQIPanel();
        
        if (tickerInitialized && (panelInitialized || !document.querySelector('.aqi-panel'))) {
            return; 
        }
        setTimeout(attempt, 500);
    };
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', attempt);
    } else {
        attempt();
    }
})();
