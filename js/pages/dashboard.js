/**
 * Dashboard Page - Main monitoring view
 */

async function renderDashboard() {
    const container = document.getElementById('page-container');

    container.innerHTML = `
        <div class="dashboard-grid">
            <!-- Fire Status Card -->
            <div class="card fire-status-card">
                <div class="card-header">
                    <h2>Fire Risk</h2>
                    <span id="risk-badge" class="status-badge">Normal</span>
                </div>
                <div class="risk-gauge">
                    <div id="risk-score" class="gauge-value">0%</div>
                    <div class="gauge-label">Current Risk Level</div>
                </div>
                <div class="gauge-bar-container">
                    <div id="risk-bar" class="gauge-bar"></div>
                </div>
                <p class="card-footer-text">Last updated: <span id="last-update">--:--</span></p>
            </div>

            <!-- Weather Card -->
            <div class="card weather-card">
                <div class="card-header">
                    <h2>Environmental Conditions</h2>
                </div>
                <div class="weather-grid">
                    <div class="weather-item">
                        <div class="label">Temperature</div>
                        <div class="value"><span id="temp-display">--</span><span class="unit">°C</span></div>
                    </div>
                    <div class="weather-item">
                        <div class="label">Humidity</div>
                        <div class="value"><span id="humid-display">--</span><span class="unit">%</span></div>
                    </div>
                    <div class="weather-item">
                        <div class="label">Wind Speed</div>
                        <div class="value"><span id="wind-display">--</span><span class="unit">km/h</span></div>
                    </div>
                    <div class="weather-item">
                        <div class="label">Air Quality</div>
                        <div class="value"><span id="gas-display">--</span><span class="unit">ppm</span></div>
                    </div>
                </div>
            </div>

            <!-- Map Card -->
            <div class="card map-card">
                <div class="card-header">
                    <h2>Sensor Location</h2>
                </div>
                <div class="map-visual">
                    <div class="map-grid-lines"></div>
                    <div class="pulse-point"></div>
                </div>
            </div>

            <!-- Chart Card -->
            <div class="card chart-card">
                <div class="card-header">
                    <h2>Temperature Trend</h2>
                </div>
                <div class="chart-container">
                    <canvas id="tempChart"></canvas>
                </div>
            </div>

            <!-- Alerts Card -->
            <div class="card alerts-card">
                <div class="card-header">
                    <h2>Recent Alerts</h2>
                </div>
                <div id="alerts-list" class="alerts-list">
                    <!-- Alerts populated by JS -->
                </div>
            </div>
        </div>
    `;

    // Initialize dashboard functionality
    UI.initChart();
    const data = await dataService.getSensorData();
    UI.updateDashboard(data);
}
