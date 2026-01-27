/**
 * Analytics Page - Historical data and trends
 */

async function renderAnalytics() {
    const container = document.getElementById('page-container');

    container.innerHTML = `
        <div class="page-header">
            <h1>Analytics & Trends</h1>
            <p>Historical data analysis and insights</p>
        </div>

        <div class="analytics-controls">
            <div class="time-range-selector">
                <button class="time-btn active" data-range="7">7 Days</button>
                <button class="time-btn" data-range="30">30 Days</button>
                <button class="time-btn" data-range="90">90 Days</button>
            </div>
            <button class="export-btn">
                <i class="ph ph-download-simple"></i> Export CSV
            </button>
        </div>

        <div class="analytics-grid">
            <!-- Temperature Trend -->
            <div class="card analytics-card">
                <div class="card-header">
                    <h2>Temperature Analysis</h2>
                    <span class="stat-badge">Avg: <span id="avg-temp">--</span>°C</span>
                </div>
                <div class="chart-container">
                    <canvas id="tempTrendChart"></canvas>
                </div>
            </div>

            <!-- Humidity Trend -->
            <div class="card analytics-card">
                <div class="card-header">
                    <h2>Humidity Levels</h2>
                    <span class="stat-badge">Avg: <span id="avg-humidity">--</span>%</span>
                </div>
                <div class="chart-container">
                    <canvas id="humidityTrendChart"></canvas>
                </div>
            </div>

            <!-- Wind Speed Trend -->
            <div class="card analytics-card">
                <div class="card-header">
                    <h2>Wind Speed</h2>
                    <span class="stat-badge">Max: <span id="max-wind">--</span> km/h</span>
                </div>
                <div class="chart-container">
                    <canvas id="windTrendChart"></canvas>
                </div>
            </div>

            <!-- Fire Risk Trend -->
            <div class="card analytics-card">
                <div class="card-header">
                    <h2>Fire Risk Score</h2>
                    <span class="stat-badge">Peak: <span id="peak-risk">--</span>%</span>
                </div>
                <div class="chart-container">
                    <canvas id="riskTrendChart"></canvas>
                </div>
            </div>

            <!-- Summary Stats -->
            <div class="card stats-summary">
                <div class="card-header">
                    <h2>Summary Statistics</h2>
                </div>
                <div class="stats-grid">
                    <div class="stat-item">
                        <i class="ph ph-warning"></i>
                        <div class="stat-value" id="total-alerts">0</div>
                        <div class="stat-label">Total Alerts</div>
                    </div>
                    <div class="stat-item">
                        <i class="ph ph-fire"></i>
                        <div class="stat-value" id="critical-alerts">0</div>
                        <div class="stat-label">Critical</div>
                    </div>
                    <div class="stat-item">
                        <i class="ph ph-trend-up"></i>
                        <div class="stat-value" id="avg-risk">0%</div>
                        <div class="stat-label">Avg Risk</div>
                    </div>
                    <div class="stat-item">
                        <i class="ph ph-clock"></i>
                        <div class="stat-value" id="uptime">99.9%</div>
                        <div class="stat-label">Uptime</div>
                    </div>
                </div>
            </div>
        </div>
    `;

    initializeAnalytics();
}

function initializeAnalytics() {
    const days = 7;
    const historicalData = generateHistoricalData(days);

    // Temperature Chart
    createTrendChart('tempTrendChart', 'Temperature (°C)', historicalData.map(d => d.temp), '#ef4444');

    // Humidity Chart
    createTrendChart('humidityTrendChart', 'Humidity (%)', historicalData.map(d => d.humidity), '#3b82f6');

    // Wind Speed Chart
    createTrendChart('windTrendChart', 'Wind Speed (km/h)', historicalData.map(d => d.wind), '#10b981');

    // Risk Chart
    createTrendChart('riskTrendChart', 'Risk Score (%)', historicalData.map(d => d.risk), '#f59e0b');

    // Calculate stats
    const avgTemp = (historicalData.reduce((sum, d) => sum + d.temp, 0) / historicalData.length).toFixed(1);
    const avgHumidity = Math.round(historicalData.reduce((sum, d) => sum + d.humidity, 0) / historicalData.length);
    const maxWind = Math.max(...historicalData.map(d => d.wind)).toFixed(1);
    const peakRisk = Math.max(...historicalData.map(d => d.risk));

    document.getElementById('avg-temp').innerText = avgTemp;
    document.getElementById('avg-humidity').innerText = avgHumidity;
    document.getElementById('max-wind').innerText = maxWind;
    document.getElementById('peak-risk').innerText = peakRisk;

    // Summary stats
    document.getElementById('total-alerts').innerText = Math.floor(Math.random() * 50 + 10);
    document.getElementById('critical-alerts').innerText = Math.floor(Math.random() * 5);
    document.getElementById('avg-risk').innerText = Math.round(historicalData.reduce((sum, d) => sum + d.risk, 0) / historicalData.length) + '%';

    // Time range selector
    document.querySelectorAll('.time-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            const range = parseInt(e.target.dataset.range);
            // Reload charts with new range
            const newData = generateHistoricalData(range);
            updateAllCharts(newData);
        });
    });

    // Export functionality
    document.querySelector('.export-btn').addEventListener('click', () => {
        exportToCSV(historicalData);
    });
}

function generateHistoricalData(days) {
    const data = [];
    for (let i = days; i >= 0; i--) {
        data.push({
            date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
            temp: 20 + Math.random() * 10,
            humidity: 40 + Math.random() * 20,
            wind: 10 + Math.random() * 15,
            risk: Math.random() * 100
        });
    }
    return data;
}

function createTrendChart(canvasId, label, data, color) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, color + '80');
    gradient.addColorStop(1, color + '00');

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map((_, i) => `Day ${i + 1}`),
            datasets: [{
                label: label,
                data: data,
                borderColor: color,
                backgroundColor: gradient,
                borderWidth: 2,
                tension: 0.4,
                fill: true,
                pointRadius: 3,
                pointHoverRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { display: true, grid: { color: 'rgba(255,255,255,0.05)' } },
                y: { display: true, grid: { color: 'rgba(255,255,255,0.05)' } }
            }
        }
    });
}

function exportToCSV(data) {
    const csv = [
        ['Date', 'Temperature', 'Humidity', 'Wind Speed', 'Risk Score'],
        ...data.map(d => [
            d.date.toLocaleDateString(),
            d.temp.toFixed(1),
            d.humidity.toFixed(0),
            d.wind.toFixed(1),
            d.risk.toFixed(0)
        ])
    ].map(row => row.join(',')).join('\\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `forestguard-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
}

function updateAllCharts(newData) {
    // Implementation for updating charts with new data range
    console.log('Updating charts with', newData.length, 'days of data');
}
