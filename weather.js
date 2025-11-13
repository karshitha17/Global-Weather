/* 🌍 Weather App JavaScript */

const weatherCodes = {
  0:"Clear sky",1:"Mainly clear",2:"Partly cloudy",3:"Overcast",
  45:"Fog",48:"Rime fog",51:"Light drizzle",53:"Drizzle",55:"Dense drizzle",
  61:"Light rain",63:"Rain",65:"Heavy rain",71:"Light snow",73:"Snow",75:"Heavy snow",
  80:"Rain showers",81:"Heavy showers",82:"Violent showers"
};

let chart;

function getIcon(code) {
  if (code === 0) return "https://cdn-icons-png.flaticon.com/512/869/869869.png";
  if (code <= 3) return "https://cdn-icons-png.flaticon.com/512/414/414825.png";
  if (code >= 45 && code <= 48) return "https://cdn-icons-png.flaticon.com/512/4005/4005901.png";
  if (code >= 51 && code <= 82) return "https://cdn-icons-png.flaticon.com/512/1163/1163624.png";
  return "https://cdn-icons-png.flaticon.com/512/1163/1163675.png";
}

async function getWeather(lat, lon, cityName = "Your Location") {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,relative_humidity_2m&daily=temperature_2m_max,temperature_2m_min,weathercode,sunrise,sunset&timezone=auto`;
    const res = await fetch(url);
    const data = await res.json();

    const w = data.current_weather;
    const condition = weatherCodes[w.weathercode] || "Unknown";

    document.getElementById("city").textContent = cityName.toUpperCase();
    document.getElementById("temp").textContent = `${w.temperature}°C`;
    document.getElementById("condition").textContent = condition;
    document.getElementById("icon").src = getIcon(w.weathercode);
    document.getElementById("windspeed").textContent = `Wind: ${w.windspeed} km/h`;

    const sunr = data.daily.sunrise[0].split("T")[1];
    const suns = data.daily.sunset[0].split("T")[1];
    document.getElementById("sun").textContent = `☀️ Sunrise: ${sunr} | 🌇 Sunset: ${suns}`;

    // 5-day Forecast
    const days = data.daily.time.slice(0, 5);
    const max = data.daily.temperature_2m_max;
    const min = data.daily.temperature_2m_min;
    const codes = data.daily.weathercode;
    document.getElementById("forecast").innerHTML = days.map((d, i) => `
      <div class='day'>
        <p><b>${new Date(d).toLocaleDateString('en-US', { weekday: 'short' })}</b></p>
        <img src='${getIcon(codes[i])}'>
        <p>${max[i]}° / ${min[i]}°</p>
      </div>
    `).join('');

    // Temperature Chart
    const ctx = document.getElementById("tempChart");
    if (chart) chart.destroy();
    chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: days,
        datasets: [{
          label: "Max Temp (°C)",
          data: max,
          borderColor: "#ff6b6b",
          backgroundColor: "rgba(255,107,107,0.2)",
          fill: true
        }]
      },
      options: {
        responsive: true,
        scales: { y: { beginAtZero: false } }
      }
    });

  } catch (e) {
    alert("Failed to fetch data");
  }
}

/* 🔍 Search Function */
function searchCity() {
  const city = document.getElementById("searchCity").value.trim();
  if (!city) return;
  fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}`)
    .then(r => r.json())
    .then(d => {
      if (!d.results) return alert("City not found");
      const c = d.results[0];
      getWeather(c.latitude, c.longitude, c.name);
    });
}

/* 📍 Current Location */
function getLocationWeather() {
  navigator.geolocation.getCurrentPosition(pos => {
    getWeather(pos.coords.latitude, pos.coords.longitude, "Your Location");
  });
}

/* Default City: Nizamabad */
getWeather(18.6725, 78.094, "Nizamabad");
