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
        const marker = L.marker([venue.latitude, venue.longitude]).addTo(map);
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
    content += `<li><a href="javascript:void(0);" onclick="showPerformances('${btoa(
      JSON.stringify(concert.performances)
    )}', '${formattedDate}', '${venueName.replace(
      /'/g,
      "\\'"
    )}');">${formattedDate}</a></li>`;
  });
  content += "</ul>";
  return content;
}

function showMoreConcerts(venueName, displayedCount) {
  fetch("venue_data.json")
    .then((response) => response.json())
    .then((data) => {
      const venue = data.find((v) => v.venue_name === venueName);
      if (!venue) return;

      const concertListElement = document.getElementById(
        `concert-list-${venueName}`
      );
      const totalConcerts = venue.concerts.length;
      const nextLimit = Math.min(displayedCount + 5, totalConcerts);

      let additionalConcertsContent = "";
      const additionalConcerts = venue.concerts.slice(
        displayedCount,
        nextLimit
      );
      additionalConcerts.forEach((concert) => {
        let formattedDate = formatDate(new Date(concert.date));
        additionalConcertsContent += `<li><a href="javascript:void(0);" onclick="showPerformances('${btoa(
          JSON.stringify(concert.performances)
        )}', ${concert});">${formattedDate}</a></li>`;
      });

      concertListElement.insertAdjacentHTML(
        "beforeend",
        additionalConcertsContent
      );

      if (nextLimit < totalConcerts) {
        concertListElement.nextElementSibling.setAttribute(
          "onclick",
          `showMoreConcerts('${venueName}', ${nextLimit});`
        );
      } else {
        concertListElement.nextElementSibling.remove(); // Remove the "See More" button if there are no more concerts
      }
    });
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
  let headerContent = `Performances on the ${formattedDate} at '${venueName}'`; // Header shows date and venue name
  let content = `<h1 id="performances-on">${headerContent}</h1>`;
  content += "<ul class='performance-list'>";
  performances.forEach((perf) => {
    const encodedTitle = encodeURIComponent(perf.title);
    content += `<li class="performance-item"><a href="https://www.youtube.com/results?search_query=${encodedTitle}" target="_blank" class="performance-title-link"><span class="performance-title">${perf.title}</span></a> <span class="composer-name">by ${perf.composer}</span></li>`;
  });
  content += "</ul>";

  const detailsDiv = document.getElementById("details-area");
  detailsDiv.innerHTML = content;
  detailsDiv.style.display = "block"; // Make sure it's visible
  setTimeout(() => (detailsDiv.style.opacity = 1), 10); // Fade in
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
