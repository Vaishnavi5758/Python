console.log("Initializing Dashboard...");

let allData = [];
let swotData = {};  
let filteredData = []; 
let barChart, pieChart, lineChart, swotChart;

// Fetch Data from API
async function fetchData() {
    try {
        const response = await fetch('/fetch_data');
        if (!response.ok) throw new Error("Network response was not ok");

        const result = await response.json();
        console.log("Fetched Data:", result);

        if (Array.isArray(result?.data)) {
            allData = result.data;  
            swotData = result?.swot || {};  
            filteredData = allData;  

            console.log("Processed Data:", allData);
            console.log("Initial SWOT Data:", swotData);  // Debugging  

            populateFilters(allData);
            initializeCharts();
            filterData();
        } else {
            console.error("Unexpected API response format:", result);
        }
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

// Populate Filters
function populateFilters(data) {
    console.log("Populating filters with data:", data);

    const filters = {
        yearFilter: [...new Set(data.map(d => d.end_year).filter(Boolean))].sort(),
        countryFilter: [...new Set(data.map(d => d.country).filter(Boolean))].sort(),
        sectorFilter: [...new Set(data.map(d => d.sector).filter(Boolean))].sort(),
        topicsFilter: [...new Set(data.map(d => d.topic).filter(Boolean))].sort(),
        regionFilter: [...new Set(data.map(d => d.region).filter(Boolean))].sort(),
        pestFilter: [...new Set(data.map(d => d.pestle).filter(Boolean))].sort(),
        sourceFilter: [...new Set(data.map(d => d.source).filter(Boolean))].sort(),
        cityFilter: [...new Set(data.map(d => d.city).filter(Boolean))].sort(),
        likelihoodFilter: [...new Set(data.map(d => d.likelihood).filter(Boolean))].sort(),
        swotFilter: ["Opportunities", "Strengths", "Threats", "Weaknesses"]
    };

    for (const [id, values] of Object.entries(filters)) {
        console.log(`Populating ${id} with values:`, values);
        populateDropdown(document.getElementById(id), values, id.replace("Filter", ""));
    }
}

// Helper to Populate Dropdowns
function populateDropdown(dropdown, items, defaultText) {
    if (!dropdown) return;

    dropdown.innerHTML = `<option value="">All ${defaultText}s</option>`;
    items.forEach(item => {
        dropdown.innerHTML += `<option value="${item}">${item}</option>`;
    });

    dropdown.addEventListener("change", filterData);
}

// Filter Data Based on Selections
function filterData() {
    if (!Array.isArray(filteredData)) {
        console.error("filteredData is not an array", filteredData);
        return;
    }

    let selectedSector = document.getElementById("sectorFilter").value;
    let selectedCountry = document.getElementById("countryFilter").value;
    let selectedYear = document.getElementById("yearFilter").value;
    let selectedLikelihood = document.getElementById("likelihoodFilter").value;

    // Filter dataset based on selected filters
    let filteredResults = allData.filter(item => 
        (selectedSector === "" || item.sector === selectedSector) &&
        (selectedCountry === "" || item.country === selectedCountry) &&
        (selectedYear === "" || item.end_year === selectedYear) &&
        (selectedLikelihood === "" || item.likelihood === Number(selectedLikelihood))
    );

    console.log("Filtered Results:", filteredResults);

    // Extract SWOT data correctly
// Manually sum SWOT values from the filtered dataset
let updatedSWOTData = {
    Strengths: filteredResults.reduce((sum, d) => sum + (d.relevance >= 4 && d.impact > 0 ? 1 : 0), 0),
    Weaknesses: filteredResults.reduce((sum, d) => sum + (d.relevance <= 2 && d.impact < 0 ? 1 : 0), 0),
    Opportunities: filteredResults.reduce((sum, d) => sum + (d.likelihood >= 3 ? 1 : 0), 0),
    Threats: filteredResults.reduce((sum, d) => sum + (d.intensity >= 4 ? 1 : 0), 0)
  };
  
  console.log("Updated SWOT Data:", updatedSWOTData);
    // Update Charts with filtered data & updated SWOT data
    updateCharts(filteredResults, updatedSWOTData);
}

// Update Charts
function updateCharts(filteredData = allData, updatedSWOTData = swotData) {
    if (!Array.isArray(filteredData)) {
        console.error("filteredData is not an array:", filteredData);
        return;
    }

    console.log("Updating Charts with:", filteredData);
    
    // Bar Chart - Intensity vs Sector
    const sectorLabels = [...new Set(filteredData.map(d => d.sector))];
    const intensityData = sectorLabels.map(sector => filteredData.filter(d => d.sector === sector).reduce((sum, item) => sum + (item.intensity || 0), 0));

    barChart.data.labels = sectorLabels;
    barChart.data.datasets[0].data = intensityData;
    barChart.update();

    // Pie Chart - Sector Distribution by Count
    const sectorCounts = sectorLabels.map(sector => filteredData.filter(d => d.sector === sector).length);
    pieChart.data.labels = sectorLabels;
    pieChart.data.datasets[0].data = sectorCounts;
    pieChart.update();

    // Line Chart - Yearly Trends
    const yearLabels = [...new Set(filteredData.map(d => d.end_year).filter(Boolean))].sort();
    const yearCounts = yearLabels.map(year => filteredData.filter(d => d.end_year === year).length);

    lineChart.data.labels = yearLabels;
    lineChart.data.datasets[0].data = yearCounts;
    lineChart.update();

    console.log("Updating SWOT Chart with:", updatedSWOTData);

    // SWOT Chart - Update with new SWOT Data
    swotChart.data.datasets[0].data = [
        updatedSWOTData["Strengths"] || 0,
        updatedSWOTData["Weaknesses"] || 0,
        updatedSWOTData["Opportunities"] || 0,
        updatedSWOTData["Threats"] || 0
    ];
    console.log("swot chart data before update",swotChart.data.datasets[0].data)
    swotChart.update();
}

// Initialize Charts
function initializeCharts() {
    const barCtx = document.getElementById('barChart').getContext('2d');
    const pieCtx = document.getElementById('pieChart').getContext('2d');
    const lineCtx = document.getElementById('lineChart').getContext('2d');
    const swotCtx = document.getElementById('swotChart').getContext('2d');

    barChart = new Chart(barCtx, { type: 'bar', data: { labels: [], datasets: [{ label: 'Intensity per Sector', data: [], backgroundColor: '#4CAF50' }] }, options: { responsive: true } });
    pieChart = new Chart(pieCtx, { type: 'pie', data: { labels: [], datasets: [{ label: 'Sector Distribution', data: [], backgroundColor: ['#FF5733', '#FFC107', '#4CAF50', '#C70039'] }] }, options: { responsive: true } });
    lineChart = new Chart(lineCtx, { type: 'line', data: { labels: [], datasets: [{ label: 'Yearly Trends', data: [], borderColor: '#4CAF50', fill: false }] }, options: { responsive: true } });
    swotChart = new Chart(swotCtx, { type: 'polarArea', data: { labels: ['Strengths', 'Weaknesses', 'Opportunities', 'Threats'], datasets: [{ label: 'SWOT Analysis', data: [0, 0, 0, 0], backgroundColor: ['#4CAF50', '#FF5733', '#FFC107', '#C70039'] }] }, options: { responsive: true } });

    updateCharts();
}

// Fetch Data on Page Load
window.onload = function(){
fetchData();
}