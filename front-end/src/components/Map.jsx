import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import venueData from "../../venue_data.json"; // Ensure this path is correct

const MapComponent = () => {
  const createPopupContent = (venue) => {
    return (
      `<strong>${venue.venue_name}, ${venue.venue_town}</strong><ul>` +
      venue.concerts
        .map(
          (concert) =>
            `<li>${concert.date}<ul>` +
            concert.performances
              .map((perf) => `<li>${perf.title}: ${perf.composer}</li>`)
              .join("") +
            `</ul></li>`
        )
        .join("") +
      `</ul>`
    );
  };

  return (
    <MapContainer
      center={[53.4808, -2.2426]}
      zoom={13}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="© OpenStreetMap contributors"
      />
      {venueData.map(
        (venue, index) =>
          venue.latitude &&
          venue.longitude && (
            <Marker
              key={`${venue.venue_name}-${venue.venue_town}-${index}`} // Enhanced key to ensure uniqueness
              position={[venue.latitude, venue.longitude]}
            >
              <Popup
                dangerouslySetInnerHTML={{ __html: createPopupContent(venue) }}
              ></Popup>
            </Marker>
          )
      )}
    </MapContainer>
  );
};

export default MapComponent;
