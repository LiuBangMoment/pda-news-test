// AQI data for major Nigerian cities
const aqiData = [
  { city: "Lagos",         aqi: 142, status: "Unhealthy",  color: "#e65100" },
  { city: "Abuja",         aqi:  68, status: "Moderate",   color: "#f4b400" },
  { city: "New Makoko",    aqi:  31, status: "Good",       color: "#00b050" },
  { city: "Kano",          aqi: 188, status: "Unhealthy",  color: "#e65100" },
  { city: "Ibadan",        aqi:  95, status: "Moderate",   color: "#f4b400" },
  { city: "Port Harcourt", aqi: 211, status: "V.Unhealthy",color: "#b71c1c" },
  { city: "Enugu",         aqi:  55, status: "Moderate",   color: "#f4b400" },
  { city: "Kaduna",        aqi: 121, status: "Unhealthy",  color: "#e65100" },
  { city: "Benin City",    aqi:  44, status: "Good",       color: "#00b050" },
  { city: "Maiduguri",     aqi: 163, status: "Unhealthy",  color: "#e65100" },
];

// Build AQI ticker
const scroll = document.getElementById('aqiScroll');
const buildTicker = () => {
  let html = '';
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
};

// Safe initialization (avoids console errors if element doesn't exist)
if (scroll) buildTicker();

// Click/touch drag scrolling for nav strip
const nav = document.querySelector('.nav-strip');
let isDown = false, startX, scrollLeft;

if (nav) {
  nav.addEventListener('mousedown', e => {
    isDown = true;
    nav.style.cursor = 'grabbing';
    startX = e.pageX - nav.offsetLeft;
    scrollLeft = nav.scrollLeft;
  });
  nav.addEventListener('mouseleave', () => { isDown = false; nav.style.cursor = ''; });
  nav.addEventListener('mouseup', () => { isDown = false; nav.style.cursor = ''; });
  nav.addEventListener('mousemove', e => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - nav.offsetLeft;
    nav.scrollLeft = scrollLeft - (x - startX);
  });
}