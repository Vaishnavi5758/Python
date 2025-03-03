console.log("<<<<<<<<<<<<<<<<<<<hii")
let allData = [];  // Store all data globally
let barChart, pieChart;  // References to Chart.js instances

// Fetch Data from API
async function fetchData() {
    try {
        const response = await fetch('/data');  
        const result = await response.json();  
        console.log("Fetched Data:", result);

        if (Array.isArray(result.data)) {  
            allData = result.data;  // Extract the array from result
            populateFilters(allData);  
            initializeCharts();  
        } else {
            console.error("API response is not an array:", result);
        }
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

// Populate Filters with Unique Values
function populateFilters(data) {
    const yearFilter = document.getElementById("yearFilter");
    const countryFilter = document.getElementById("countryFilter");
    const sectorFilter = document.getElementById("sectorFilter");

    const years = [...new Set(data.map(d => d.end_year).filter(Boolean))].sort();
    const countries = [...new Set(data.map(d => d.country).filter(Boolean))].sort();
    const sectors = [...new Set(data.map(d => d.sector).filter(Boolean))].sort();

    populateDropdown(yearFilter, years, "Year");
    populateDropdown(countryFilter, countries, "Country");
    populateDropdown(sectorFilter, sectors, "Sector");
}

// Helper Function to Populate Dropdowns
function populateDropdown(dropdown, items, defaultText) {
    dropdown.innerHTML = `<option value="">All ${defaultText}s</option>`; 
    items.forEach(item => {
        dropdown.innerHTML += `<option value="${item}">${item}</option>`;
    });
}

// Initialize Bar and Pie Charts
function initializeCharts() {
    const barCtx = document.getElementById('barChart').getContext('2d');
    const pieCtx = document.getElementById('pieChart').getContext('2d');

    barChart = new Chart(barCtx, {
        type: 'bar',
        data: { labels: [], datasets: [{ label: 'Intensity', data: [], backgroundColor: 'rgba(54, 162, 235, 0.5)', borderColor: 'rgba(54, 162, 235, 1)', borderWidth: 1 }] },
        options: { responsive: true, scales: { y: { beginAtZero: true } } }
    });

    pieChart = new Chart(pieCtx, {
        type: 'pie',
        data: { labels: [], datasets: [{ label: 'Sector Distribution', data: [], backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4CAF50', '#9C27B0'] }] },
        options: { responsive: true }
    });

    updateCharts(allData);
}

// Filter Data Based on Dropdowns
function filterData() {
    const selectedYear = document.getElementById("yearFilter").value;
    const selectedCountry = document.getElementById("countryFilter").value;
    const selectedSector = document.getElementById("sectorFilter").value;

    let filteredData = allData;

    if (selectedYear) {
        filteredData = filteredData.filter(d => d.end_year == selectedYear);
    }
    if (selectedCountry) {
        filteredData = filteredData.filter(d => d.country == selectedCountry);
    }
    if (selectedSector) {
        filteredData = filteredData.filter(d => d.sector == selectedSector);
    }

    updateCharts(filteredData);
}

// Update Charts with Filtered Data
function updateCharts(filteredData) {
    const labels = filteredData.map(d => d.country);
    const values = filteredData.map(d => d.intensity);

    barChart.data.labels = labels;
    barChart.data.datasets[0].data = values;
    barChart.update();

    // Pie Chart: Group by Sector
    const sectorCounts = {};
    filteredData.forEach(d => {
        if (d.sector) {
            sectorCounts[d.sector] = (sectorCounts[d.sector] || 0) + 1;
        }
    });

    pieChart.data.labels = Object.keys(sectorCounts);
    pieChart.data.datasets[0].data = Object.values(sectorCounts);
    pieChart.update();
}

// Fetch Data when Page Loads
fetchData();