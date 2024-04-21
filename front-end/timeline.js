function transformDataForTimeline(originalData) {
  const timelineData = {
    title: {
      media: {
        url: "", // Optional: URL to a logo or image
        caption: "The Hallé Orchestra",
        credit: "Image sourced from Hallé Orchestra archives",
      },
      text: {
        headline: "Timeline of Hallé Orchestra Concerts",
        text: "<p>This timeline showcases the rich history of performances by the Hallé Orchestra.</p>",
      },
    },
    events: [],
  };

  originalData.forEach((venue) => {
    venue.concerts.forEach((concert) => {
      const event = {
        start_date: {
          year: concert.date.substring(0, 4),
          month: concert.date.substring(5, 7),
          day: concert.date.substring(8, 10),
        },
        end_date: {
          year: concert.date.substring(0, 4),
          month: concert.date.substring(5, 7),
          day: concert.date.substring(8, 10),
        },
        text: {
          headline: `${venue.venue_name}, ${venue.venue_town}`,
          text:
            "<ul>" +
            concert.performances
              .map(
                (performance) =>
                  `<li>${performance.title} by ${performance.composer}</li>`
              )
              .join("") +
            "</ul>",
        },
        media: {
          url: "", // Optional: URL to an image or video related to the concert
          caption: "Performance Snapshot",
          credit: "Photo Credit: Hallé Orchestra",
        },
      };
      timelineData.events.push(event);
    });
  });

  return timelineData;
}

async function fetchData() {
  try {
    const response = await fetch("./venue_data.json"); // Path to your JSON file
    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
  }
}

async function setupTimeline() {
  const originalData = await fetchData();
  const formattedTimelineData = transformDataForTimeline(originalData);
  console.log(JSON.stringify(formattedTimelineData)); // Output formatted data for verification

  // Assuming you have already initialized TimelineJS in your HTML
  window.timeline = new TL.Timeline("timeline-embed", formattedTimelineData);
}

setupTimeline();
