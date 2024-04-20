async function loadData() {
  const response = await fetch("./venue_data.json");
  const data = await response.json();

  for (const venue of data) {
    // Note: Use 'of' instead of 'in' if data is an array
    console.log(venue);
  }
}

loadData();
