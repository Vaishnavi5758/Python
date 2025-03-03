console.log("Initializing Dashboard...");
console.log("Initializing Dashboard..hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh.");
let allData = [];  
let barChart, pieChart, lineChart;  

// Fetch Data from API
async function fetchData() {
    try {
        const response = await fetch('/data');  
        const result = await response.json();  
        console.log("Fetched Data:", result);

        if (Array.isArray(result.data)) {  
            allData = result.data;  
            populateFilters(allData);  
            initializeCharts();  
        } else {
            console.error("API response is not an array:", result);
        }
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

// Populate Filters
function populateFilters(data) {
    const filters = {
        yearFilter: [...new Set(data.map(d => d.end_year).filter(Boolean))].sort(),
        countryFilter: [...new Set(data.map(d => d.country).filter(Boolean))].sort(),
        sectorFilter: [...new Set(data.map(d => d.sector).filter(Boolean))].sort(),
        topicsFilter: [...new Set(data.map(d => d.topic).filter(Boolean))].sort(),
        regionFilter: [...new Set(data.map(d => d.region).filter(Boolean))].sort(),
        pestFilter: [...new Set(data.map(d => d.pestle).filter(Boolean))].sort(),
        sourceFilter: [...new Set(data.map(d => d.source).filter(Boolean))].sort(),
        cityFilter: [...new Set(data.map(d => d.city).filter(Boolean))].sort()
    };

    for (const [id, values] of Object.entries(filters)) {
        populateDropdown(document.getElementById(id), values, id.replace("Filter", ""));
    }
}

// Helper to Populate Dropdowns
function populateDropdown(dropdown, items, defaultText) {
    dropdown.innerHTML = `<option value="">All ${defaultText}s</option>`; 
    items.forEach(item => {
        dropdown.innerHTML += `<option value="${item}">${item}</option>`;
    });
    dropdown.addEventListener("change", filterData);
}

// Initialize Charts
function initializeCharts() {
    const barCtx = document.getElementById('barChart').getContext('2d');
    const pieCtx = document.getElementById('pieChart').getContext('2d');
    const lineCtx = document.getElementById('lineChart').getContext('2d');

    barChart = new Chart(barCtx, {
        type: 'bar',
        data: { labels: [], datasets: [{ label: 'Intensity', data: [], backgroundColor: 'rgba(54, 162, 235, 0.5)', borderColor: 'rgba(54, 162, 235, 1)', borderWidth: 1 }] },
        options: { responsive: true,plugins: { title: { display: true, text: 'Average Intensity by Sector',font: { size:16, weight: 'bold'}}}, scales: { y: { beginAtZero: true } } }
    });

    pieChart = new Chart(pieCtx, {
        type: 'pie',
        data: { labels: [], datasets: [{ label: 'Sector Distribution', data: [], backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4CAF50', '#9C27B0'] }] },
        options: { responsive: true,plugins: { title: { display: true, text: 'Sector Distribution',font: { size:16, weight: 'bold'}}} }
    });

    lineChart = new Chart(lineCtx, {
        type: 'line',
        data: { labels: [], datasets: [{ label: 'Likelihood', data: [], borderColor: 'rgba(255, 99, 132, 1)', backgroundColor: 'rgba(41, 36, 37, 0.2)', borderWidth: 2, fill: true }] },
        options: { responsive: true,plugins: { title: { display: true, text: 'Likelihood Over Years',font: { size:16, weight: 'bold'}}}, scales: { y: { beginAtZero: true } } }
    });

    filterData();
}

// Filter Data Based on Selections
function filterData() {
    console.log("Filtering data...");
    const filters = {
        end_year: document.getElementById("yearFilter").value,
        country: document.getElementById("countryFilter").value,
        sector: document.getElementById("sectorFilter").value,
        topic: document.getElementById("topicsFilter").value,
        region: document.getElementById("regionFilter").value,
        pestle: document.getElementById("pestFilter").value,
        source: document.getElementById("sourceFilter").value,
        city: document.getElementById("cityFilter").value
    };

    const filteredData = allData.filter(d => {
        return Object.keys(filters).every(key => !filters[key] || d[key] == filters[key]);
    });

    updateCharts(filteredData);
}

// Update Charts
function updateCharts(filteredData) {
    console.log("Updating charts...");

    const intensityBySector = {};
    filteredData.forEach(d => {
        if (d.sector) {
            if (!intensityBySector[d.sector]) {
                intensityBySector[d.sector] = { total: 0, count: 0 };
            }
            intensityBySector[d.sector].total += d.intensity;
            intensityBySector[d.sector].count += 1;
        }
    });

    const sectors = Object.keys(intensityBySector);
    const intensityValues = sectors.map(sector => intensityBySector[sector].total / intensityBySector[sector].count);

    barChart.data.labels = sectors;
    barChart.data.datasets[0].data = intensityValues;
    barChart.update();

    const sectorCounts = {};
    filteredData.forEach(d => {
        if (d.sector) {
            sectorCounts[d.sector] = (sectorCounts[d.sector] || 0) + 1;
        }
    });

    pieChart.data.labels = Object.keys(sectorCounts);
    pieChart.data.datasets[0].data = Object.values(sectorCounts);
    pieChart.update();

    const likelihoodByYear = {};
    filteredData.forEach(d => {
        if (d.end_year) {
            if (!likelihoodByYear[d.end_year]) {
                likelihoodByYear[d.end_year] = { total: 0, count: 0 };
            }
            likelihoodByYear[d.end_year].total += d.likelihood;
            likelihoodByYear[d.end_year].count += 1;
        }
    });

    const years = Object.keys(likelihoodByYear).sort((a, b) => a - b);
    const likelihoodValues = years.map(year => likelihoodByYear[year].total / likelihoodByYear[year].count);

    lineChart.data.labels = years;
    lineChart.data.datasets[0].data = likelihoodValues;
    lineChart.update();
}

// Fetch Data on Page Load
fetchData();