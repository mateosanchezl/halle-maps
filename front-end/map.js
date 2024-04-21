var icon = L.icon({
  iconUrl: "./blue_marker.png",

  iconSize: [20, 20], // size of the icon
  shadowSize: [50, 64], // size of the shadow
  iconAnchor: [20, 20], // point of the icon which will correspond to marker's location
  shadowAnchor: [4, 62], // the same for the shadow
  popupAnchor: [-3, -76], // point from which the popup should open relative to the iconAnchor
});

const map = L.map("map").setView([53.4808, -2.2426], 13); // Center on Manchester

L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
  attribution: "© OpenStreetMap contributors, © CARTO",
  maxZoom: 19,
}).addTo(map);

fetch("venue_data.json")
  .then((response) => response.json())
  .then((data) => {
    data.forEach((venue) => {
      if (venue.latitude && venue.longitude) {
        const marker = L.marker([venue.latitude, venue.longitude], {
          icon: icon,
        }).addTo(map);
        marker.bindPopup(createPopupContent(venue));
      }
    });
  });

map.on("popupclose", () => {
  const detailsDiv = document.getElementById("details-area");
  detailsDiv.style.display = "none"; // Hide the details area when any popup is closed
});

function createPopupContent(venue) {
  let content = `<strong>${venue.venue_name}, ${
    venue.venue_town
  }</strong><div class="concert-list" id="concert-list-${venue.venue_name.replace(
    /[^a-zA-Z0-9]/g,
    "-"
  )}">`;
  content += generateConcertListHTML(venue.concerts, venue.venue_name); // Pass venue name to function
  content += "</div>"; // Closing concert-list div
  return content;
}

function generateConcertListHTML(concerts, venueName) {
  let content = "<ul>";
  concerts.forEach((concert) => {
    let formattedDate = formatDate(new Date(concert.date));
    content += `<li><a href="javascript:void(0);" onclick="handleDateClick('${btoa(
      JSON.stringify(concert.performances)
    )}', '${formattedDate}', '${venueName.replace(
      /'/g,
      "\\'"
    )}');">${formattedDate}</a></li>`;
  });
  content += "</ul>";
  return content;
}
function handleDateClick(encodedPerformances, formattedDate, venueName) {
  showPerformances(encodedPerformances, formattedDate, venueName);
  fetchTemperatureDetails(formattedDate, venueName);
}

async function fetchTemperatureDetails(formattedDate, venueName) {
  const dateParts = formattedDate.split(" "); // ['28th', 'of', 'June', '1959']
  const month = new Date(`${dateParts[2]} 1, 2012`).getMonth() + 1;
  const year = parseInt(dateParts[3]);

  const response = await fetch("venue_data.json");
  const venues = await response.json();
  const venue = venues.find((v) => v.venue_name === venueName);

  if (venue) {
    try {
      const weatherResponse = await fetch(
        `http://127.0.0.1:5000/predict?year=${year}&month=${month}&latitude=${venue.latitude}&longitude=${venue.longitude}`
      );
      const weatherData = await weatherResponse.json();
      if (weatherData.error) {
        console.error("Error:", weatherData.error);
        updateWeatherDisplay("Weather data unavailable");
      } else {
        const weatherText = `Max Temp: ${weatherData.tmax} °C, Min Temp: ${weatherData.tmin} °C`;
        updateWeatherDisplay(weatherText);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      updateWeatherDisplay("Failed to fetch weather data");
    }
  } else {
    console.error("Venue not found");
    updateWeatherDisplay("Venue data not found");
  }
}
function updateWeatherDisplay(text) {
  const weatherDiv = document.getElementById("weatherDisplay");
  if (weatherDiv) {
    weatherDiv.innerHTML = `<strong>Weather Forecast:</strong> ${text}`;
    weatherDiv.style.display = "block"; // Make sure to display the block if it was initially hidden.
  } else {
    console.error("Failed to find the 'weatherDisplay' div.");
  }
}
async function fetchTemperature(year, month, latitude, longitude) {
  const response = await fetch(
    `http://127.0.0.1:5000/predict?year=${year}&month=${month}&latitude=${latitude}&longitude=${longitude}`
  );
  const data = await response.json();

  if (data.error) {
    console.error("Error:", data.error);
  } else {
    console.log("Max Temp:", data.tmax, "Min Temp:", data.tmin);
    alert(`Max Temp: ${data.tmax} °C, Min Temp: ${data.tmin} °C`);
  }
}
function showPerformances(encodedPerformances, formattedDate, venueName) {
  const performances = JSON.parse(atob(encodedPerformances));
  let headerContent = `Performances on the ${formattedDate} at '${venueName}'`;
  let content = `<h1 id="performances-on">${headerContent}</h1>`;
  content += `<div id="weatherResult" style="display: none"></div>`;
  content += `<ul class='performance-list'>`;
  performances.forEach((perf) => {
    const encodedTitle = encodeURIComponent(perf.title);
    content += `<li class="performance-item">
                      <a href="javascript:void(0);" 
                         onclick="fetchTemperatureDetails('${formattedDate}', '${venueName}');"
                         class="performance-title-link">
                          <span class="performance-title">${perf.title}</span>
                      </a> 
                      <span class="composer-name">by ${perf.composer}</span>
                  </li>`;
  });
  content += "</ul>";

  const detailsDiv = document.getElementById("details-area");
  detailsDiv.innerHTML = content;
  detailsDiv.style.display = "block";
  setTimeout(() => (detailsDiv.style.opacity = 1), 10);
}

function formatDate(date) {
  const options = { year: "numeric", month: "long" };
  let day = date.getDate();
  let suffix = ["th", "st", "nd", "rd"][
    day % 10 > 3 ? 0 : day - (day % 10) !== 10 ? day % 10 : 0
  ];
  return `${day}${suffix} of ${date.toLocaleDateString("en-GB", options)}`;
}

function showPerformances(encodedPerformances, formattedDate, venueName) {
  const performances = JSON.parse(atob(encodedPerformances));
  const detailsDiv = document.getElementById("details-area");

  // Header content including a placeholder for the weather data.
  let headerContent = `<h1 id="performances-on">Performances on the ${formattedDate} at '${venueName}'</h1>`;
  let weatherPlaceholder = `<div id="weatherDisplay" style="display: none;"></div>`; // Initial style set to 'none'.

  // Building the list of performances.
  let performancesContent = "<ul class='performance-list'>";
  performances.forEach((perf) => {
    const encodedTitle = encodeURIComponent(perf.title);
    performancesContent += `<li class="performance-item">
          <a href="javascript:void(0);" onclick="fetchTemperatureDetails('${formattedDate}', '${venueName}');" class="performance-title-link">
              <span class="performance-title">${perf.title}</span>
          </a> 
          <span class="composer-name">by ${perf.composer}</span>
      </li>`;
  });
  performancesContent += "</ul>";

  // Combine all parts and update the inner HTML of the details area.
  detailsDiv.innerHTML =
    headerContent + weatherPlaceholder + performancesContent;
  detailsDiv.style.display = "block"; // Ensure the details area is visible.
  setTimeout(() => (detailsDiv.style.opacity = 1), 10); // Optional: Fade in effect.
}
const map2 = L.map("map2").setView([51.505, -0.09], 6); // Widen the initial zoom to see more areas
L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
  attribution: "© OpenStreetMap contributors, © CARTO",
  maxZoom: 19,
}).addTo(map2);

fetch("venues.geojson")
  .then((response) => response.json())
  .then((data) => {
    L.geoJson(data, {
      pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, {
          radius: getRadius(feature.properties.concert_count),
          fillColor: getColor(feature.properties.concert_count),
          color: "#000",
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8,
        });
      },
      onEachFeature: function (feature, layer) {
        if (feature.properties) {
          layer.bindPopup(
            "<b>Venue:</b> " +
              feature.properties.venue_name +
              "<br/><b>Town:</b> " +
              feature.properties.venue_town +
              "<br/><b>Concerts:</b> " +
              feature.properties.concert_count
          );
        }
      },
    }).addTo(map2);
  });

function getColor(concertCount) {
  return concertCount > 1000
    ? "#006d77" // Dark Cyan for major events
    : concertCount > 200
    ? "#83c5be" // Medium Aquamarine for highly popular events
    : concertCount > 50
    ? "#edf6f9" // Light Cyan for popular events
    : concertCount > 10
    ? "#ffddd2" // Light Coral for moderate events
    : "#e29578"; // Sandy Brown for small events
}

function getRadius(concertCount) {
  return concertCount > 1000
    ? 20
    : concertCount > 200
    ? 15
    : concertCount > 50
    ? 12
    : concertCount > 10
    ? 8
    : 6; // Smaller radius for the least popular events
}

var legend = L.control({ position: "bottomright" });

legend.onAdd = function (map) {
  var div = L.DomUtil.create("div", "info legend");
  var grades = [0, 10, 50, 200, 1000, 3221]; // Define the breakpoints
  var labels = ["<strong>Number of Concerts</strong>"]; // Start with the title

  // Generate HTML for each range
  grades.forEach((grade, index) => {
    var from = grade;
    var to = grades[index + 1];
    labels.push(
      '<div class="legend-item"><i style="background:' +
        getColor(from + 1) +
        '"></i> ' +
        from +
        (to ? "&ndash;" + to : "+") +
        "</div>"
    );
  });

  div.innerHTML = labels.join(""); // Join all parts together without additional breaks
  return div;
};

legend.addTo(map2);
