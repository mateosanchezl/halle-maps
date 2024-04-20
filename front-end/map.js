const map = L.map("map").setView([53.4808, -2.2426], 13); // Center on Manchester

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
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
  content += generateConcertListHTML(venue.concerts);
  content += "</div>"; // Closing concert-list div
  return content;
}
function generateConcertListHTML(concerts) {
  let content = "<ul>";
  concerts.forEach((concert) => {
    let formattedDate = formatDate(new Date(concert.date));
    // Pass the concert date as part of the onclick handler
    content += `<li><a href="javascript:void(0);" onclick="showPerformances('${btoa(
      JSON.stringify(concert.performances)
    )}', '${formattedDate}');">${formattedDate}</a></li>`;
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

function showPerformances(encodedPerformances, formattedDate) {
  const performances = JSON.parse(atob(encodedPerformances));
  let content = `<h1 id="performances-on">Performances on the ${formattedDate}</h1>`; // Use the date in the heading
  content += "<ul>";
  performances.forEach((perf) => {
    content += `<li id="performance-info">${perf.title} by ${perf.composer}</li>`;
  });
  content += "</ul>";

  const detailsDiv = document.getElementById("details-area");
  detailsDiv.innerHTML = content;
  detailsDiv.style.display = "block"; // Make sure it's visible
}
