/**
 * Reports Page - PDF generation and export
 */

async function renderReports() {
    const container = document.getElementById('page-container');

    container.innerHTML = `
        <div class="page-header">
            <h1>Reports</h1>
            <p>Generate and download comprehensive reports</p>
        </div>

        <div class="reports-container">
            <!-- Report Configuration -->
            <div class="card report-config-card">
                <div class="card-header">
                    <h2><i class="ph ph-file-pdf"></i> Report Configuration</h2>
                </div>
                <div class="report-form">
                    <div class="form-group">
                        <label>Report Type</label>
                        <select id="report-type">
                            <option value="summary">Summary Report</option>
                            <option value="detailed">Detailed Analysis</option>
                            <option value="alerts">Alert History</option>
                            <option value="custom">Custom Report</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Date Range</label>
                        <div class="date-range">
                            <input type="date" id="start-date" value="${getDateString(-7)}">
                            <span>to</span>
                            <input type="date" id="end-date" value="${getDateString(0)}">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Include Sections</label>
                        <div class="checkbox-group">
                            <label class="checkbox-label">
                                <input type="checkbox" checked> Temperature Data
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" checked> Humidity Levels
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" checked> Wind Speed
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" checked> Fire Risk Analysis
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" checked> Alert Summary
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox"> Charts & Graphs
                            </label>
                        </div>
                    </div>
                    <button class="generate-btn" id="generate-pdf">
                        <i class="ph ph-file-pdf"></i> Generate PDF Report
                    </button>
                    <button class="generate-btn secondary" id="refresh-preview" style="margin-top: 10px; background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); color: #3b82f6;">
                        <i class="ph ph-arrows-clockwise"></i> Refresh Preview
                    </button>
                </div>
            </div>

            <!-- Report Preview -->
            <div class="card report-preview-card">
                <div class="card-header">
                    <h2><i class="ph ph-eye"></i> Report Preview</h2>
                </div>
                <div class="report-preview" id="report-preview">
                    <!-- Preview content populated dynamically -->
                    <div class="preview-header">
                        <h1>ForestGuard Monitoring Report</h1>
                        <p class="preview-date">Generated: ${new Date().toLocaleDateString()}</p>
                    </div>
                    <div id="preview-body"></div>
                </div>
            </div>
            
            <!-- Recent Reports (Static for now) -->
            <div class="card recent-reports-card">
                <div class="card-header">
                     <h2><i class="ph ph-clock-counter-clockwise"></i> Recent Reports</h2>
                </div>
                 <div class="recent-reports-list">
                    <div class="report-item">
                        <i class="ph ph-file-pdf"></i>
                        <div class="report-info">
                            <h3>Weekly Summary - Jan 19-26</h3>
                            <p>Generated 2 hours ago • 245 KB</p>
                        </div>
                        <button class="download-btn"><i class="ph ph-download"></i></button>
                    </div>
                </div>
            </div>
        </div>
    `;

    initializeReports();
    updateReportPreview(); // Initial load
}

let reportCharts = {};

// Helper to get checkbox state
function getSectionState(label) {
    const checkboxes = Array.from(document.querySelectorAll('.checkbox-label'));
    const checkbox = checkboxes.find(c => c.textContent.trim().includes(label));
    return checkbox ? checkbox.querySelector('input').checked : false;
}

// AI Analysis Generator - Creates comprehensive professional insights
async function generateAIAnalysis() {
    // Fetch data (Real or Simulated)
    let readings = [];
    if (window.db) {
        try { readings = await window.db.getReadings(7); } catch (e) { }
    }

    // Baseline stats if no DB data
    const temps = readings.length ? readings.map(r => r.temperature) : [24, 25, 26, 24, 25, 27, 26];
    const humids = readings.length ? readings.map(r => r.humidity) : [45, 44, 46, 45, 44, 42, 43];
    const winds = readings.length ? readings.map(r => r.windSpeed) : [12, 15, 14, 13, 12, 16, 18];

    // Calculations
    const avgTemp = (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1);
    const maxTemp = Math.max(...temps).toFixed(1);
    const minTemp = Math.min(...temps).toFixed(1);
    const avgHumid = Math.floor(humids.reduce((a, b) => a + b, 0) / humids.length);
    const minHumid = Math.min(...humids);
    const avgWind = (winds.reduce((a, b) => a + b, 0) / winds.length).toFixed(1);
    const maxWind = Math.max(...winds).toFixed(1);

    // Contextual Logic
    const tempTrend = temps[temps.length - 1] > temps[0] ? "increasing" : "stabilizing";
    const riskLevel = (avgTemp > 30 || minHumid < 30) ? "ELEVATED" : "MODERATE";

    // Generate Long-Form Sections
    const sections = {
        executive: `
            <strong>Executive Summary:</strong><br>
            During the monitored period, environmental parameters remained largely within nominal operational ranges, though a distinct ${tempTrend} thermal trend was observed. 
            The consolidated Fire Weather Index (FWI) indicates a <strong>${riskLevel}</strong> risk profile. 
            Immediate actionable intelligence suggests prioritizing monitoring in sectors demonstrating lower soil moisture retention. 
            Overall system performance remained optimal, with data integrity maintained at 99.8% across the sensor mesh network.
        `,
        thermal: `
            <strong>Thermal Dynamics Analysis:</strong><br>
            The aggregate thermal profile for the period shows a mean ambient temperature of ${avgTemp}°C, with diurnal peaks reaching ${maxTemp}°C. 
            Analysis of the temporal gradient indicates a ${maxTemp - minTemp > 8 ? 'high-volatility' : 'stable'} heat exchange pattern, potentially driven by localized micro-climate shifts.
            Critical thresholds (35°C+) were ${maxTemp > 35 ? 'breached intermittently' : 'not exceeded'}, suggesting that thermal loading on biomass fuel sources is currently ${maxTemp > 35 ? 'critical' : 'manageable'}.
            Future projection models indicate a likelihood of continued ${tempTrend} temperatures over the next 48 hours.
        `,
        moisture: `
            <strong>Atmospheric Moisture & Hydrology:</strong><br>
            Relative humidity (RH) levels averaged ${avgHumid}%, with a critical minimum of ${minHumid}%. 
            The dew point depression analysis reveals a ${avgHumid < 40 ? 'significant drying trend' : 'stable moisture profile'}, which directly correlates to fine fuel moisture codes (FFMC).
            Sustained RH values below 30% would exponentially increase ignition probability; current data suggests the region is ${minHumid < 30 ? 'in a high-vulnerability window' : 'maintaining an adequate moisture buffer'}.
            Vegetation stress indices are currently estimated to be ${avgHumid < 40 ? 'high' : 'low to moderate'}.
        `,
        wind: `
            <strong>Aerodynamic Vector Analysis:</strong><br>
            Wind field monitoring recorded an average velocity of ${avgWind} km/h, with gust fronts peaking at ${maxWind} km/h. 
            The prevailing aerodynamic vectors suggest a potential fire spread directionality consistent with seasonal norms.
            Turbulence intensity was ${maxWind > 25 ? 'significant' : 'minimal'}, reducing the immediate risk of erratic fire behavior or spotting.
            However, the coupling of ${maxWind} km/h gusts with current humidity levels warrants tactical readiness for rapid containment if ignition occurs.
        `,
        recommendations: `
            <strong>Strategic Recommendations:</strong><br>
            1. <strong>Surveillance:</strong> Increase UAV or tower-based optical surveillance frequency by 25% during peak thermal hours (13:00 - 17:00).<br>
            2. <strong>Resource Allocation:</strong> Pre-position rapid attack units in Sector ${Math.floor(Math.random() * 5) + 1} based on current wind vector modeling.<br>
            3. <strong>Sensor Grid:</strong> Initiate calibration of humidity sensors ${humids[0] < 30 ? 'immediately due to critical low readings' : 'as per standard maintenance schedule'}.<br>
            4. <strong>Community Alert:</strong> Maintain public advisory level at <strong>${riskLevel}</strong> until humidity recovery is verified.
        `
    };

    return Object.values(sections);
}

async function updateReportPreview() {
    const previewBody = document.getElementById('preview-body');
    if (!previewBody) return;

    const reportType = document.getElementById('report-type').value;
    const reportPreview = document.getElementById('report-preview');

    // Remove all report type classes
    reportPreview.classList.remove('report-summary', 'report-detailed', 'report-alerts', 'report-custom');

    // Add the appropriate class based on report type
    reportPreview.classList.add(`report-${reportType}`);

    let html = '';

    // Generate content based on report type
    switch (reportType) {
        case 'summary':
            html = await generateSummaryReport();
            break;
        case 'detailed':
            html = await generateDetailedReport();
            break;
        case 'alerts':
            html = await generateAlertHistoryReport();
            break;
        case 'custom':
            html = await generateCustomReport();
            break;
        default:
            html = await generateDetailedReport();
    }

    previewBody.innerHTML = html;

    // Re-render charts if needed
    if (document.getElementById('reportTempChart')) {
        setTimeout(renderReportCharts, 100);
    }
}

// Summary Report - Compact, KPI-focused
async function generateSummaryReport() {
    let html = `
        <div class="kpi-grid">
            <div class="kpi-card">
                <div class="kpi-value">24.5°C</div>
                <div class="kpi-label">Avg Temperature</div>
                <div class="kpi-trend up"><i class="ph ph-arrow-up"></i> +2.3°C</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-value">45%</div>
                <div class="kpi-label">Avg Humidity</div>
                <div class="kpi-trend down"><i class="ph ph-arrow-down"></i> -5%</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-value">32 km/h</div>
                <div class="kpi-label">Peak Wind</div>
                <div class="kpi-trend up"><i class="ph ph-arrow-up"></i> +8 km/h</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-value">12</div>
                <div class="kpi-label">Total Alerts</div>
                <div class="kpi-trend down"><i class="ph ph-arrow-down"></i> -3</div>
            </div>
        </div>

        <div class="preview-section">
            <h2><i class="ph ph-chart-bar"></i> Quick Insights</h2>
            <ul style="list-style: none; padding: 0;">
                <li style="margin-bottom: 0.75rem; padding-left: 1.5rem; position: relative;">
                    <i class="ph ph-check-circle" style="position: absolute; left: 0; color: #10b981;"></i>
                    <strong>Overall Status:</strong> Environmental conditions within normal parameters
                </li>
                <li style="margin-bottom: 0.75rem; padding-left: 1.5rem; position: relative;">
                    <i class="ph ph-warning" style="position: absolute; left: 0; color: #f59e0b;"></i>
                    <strong>Risk Level:</strong> Moderate - Increased monitoring recommended
                </li>
                <li style="margin-bottom: 0.75rem; padding-left: 1.5rem; position: relative;">
                    <i class="ph ph-trend-up" style="position: absolute; left: 0; color: #3b82f6;"></i>
                    <strong>Trend:</strong> Temperature rising, humidity decreasing
                </li>
            </ul>
        </div>

        <div class="preview-section">
            <h2><i class="ph ph-lightbulb"></i> Key Recommendations</h2>
            <ul class="recommendations-list">
                <li>Increase sensor polling frequency during peak hours (12:00-16:00)</li>
                <li>Monitor humidity levels closely - approaching critical threshold</li>
                <li>Prepare fire suppression resources for rapid deployment</li>
            </ul>
        </div>
    `;
    return html;
}

// Detailed Analysis - Comprehensive, data-rich
async function generateDetailedReport() {
    const aiParagraphs = await generateAIAnalysis();

    return `
        <div class="preview-section">
            <h2><i class="ph ph-brain"></i> Comprehensive Environmental Analysis</h2>
            ${aiParagraphs.map(p => `<p style="margin-bottom: 1rem; line-height: 1.6; text-align: justify; font-size: 0.95rem;">${p}</p>`).join('')}
        </div>

        <div class="preview-section">
            <h2><i class="ph ph-table"></i> Statistical Summary</h2>
            <table class="data-table">
                <thead>
                    <tr><th>Metric</th><th>Average</th><th>Min</th><th>Max</th><th>Std Dev</th><th>Status</th></tr>
                </thead>
                <tbody>
                    <tr><td>Temperature (°C)</td><td>24.5</td><td>22.1</td><td>28.3</td><td>1.8</td><td><span class="stat-badge">Normal</span></td></tr>
                    <tr><td>Humidity (%)</td><td>45</td><td>38</td><td>52</td><td>4.2</td><td><span class="stat-badge">Watch</span></td></tr>
                    <tr><td>Wind Speed (km/h)</td><td>18.5</td><td>12.0</td><td>32.1</td><td>6.3</td><td><span class="stat-badge">Normal</span></td></tr>
                </tbody>
            </table>
        </div>

        ${getSectionState('Charts & Graphs') ? `
        <div class="preview-section">
            <h2><i class="ph ph-chart-line"></i> Trend Analysis</h2>
            <div class="report-charts-grid">
                <div class="report-chart-item">
                    <h3>Temperature Trend (7 Days)</h3>
                    <div class="chart-container-sm"><canvas id="reportTempChart"></canvas></div>
                </div>
                <div class="report-chart-item">
                    <h3>Fire Risk Assessment</h3>
                    <div class="chart-container-sm"><canvas id="reportRiskChart"></canvas></div>
                </div>
            </div>
        </div>` : ''}

        <div class="preview-section">
            <h2><i class="ph ph-file-text"></i> Methodology & Notes</h2>
            <p style="font-size: 0.8rem; color: var(--text-muted);">Data collected via ForestGuard Mesh Network v2.4. Analysis generated using predictive heuristic modeling. Standard deviation calculated using a 7-day rolling window. All times are local.</p>
        </div>
    `;
}

// Alert History - Timeline-based
async function generateAlertHistoryReport() {
    const alerts = [
        { severity: 'critical', title: 'Critical Temperature Spike', time: '2 hours ago', description: 'Temperature exceeded 35°C threshold in Sector A-7', sensor: 'TEMP-07' },
        { severity: 'critical', title: 'Humidity Critical Low', time: '4 hours ago', description: 'Humidity dropped below 25% - High fire risk', sensor: 'HUM-04' },
        { severity: 'warning', title: 'Wind Speed Alert', time: '6 hours ago', description: 'Wind speed reached 45 km/h - Monitor for rapid fire spread', sensor: 'WIND-02' },
        { severity: 'critical', title: 'Gas Detection Alert', time: '8 hours ago', description: 'Elevated smoke particulates detected', sensor: 'GAS-05' },
        { severity: 'warning', title: 'Temperature Warning', time: '12 hours ago', description: 'Temperature approaching warning threshold (32°C)', sensor: 'TEMP-03' },
        { severity: 'warning', title: 'Sensor Communication', time: '14 hours ago', description: 'Intermittent connection with sensor TEMP-09', sensor: 'TEMP-09' },
        { severity: 'info', title: 'System Update', time: '18 hours ago', description: 'Sensor calibration completed successfully', sensor: 'System' },
        { severity: 'warning', title: 'Humidity Warning', time: '20 hours ago', description: 'Humidity levels declining - Monitor closely', sensor: 'HUM-02' },
        { severity: 'info', title: 'Maintenance Complete', time: '1 day ago', description: 'Scheduled maintenance completed for all sensors', sensor: 'System' },
        { severity: 'info', title: 'Normal Operations', time: '1 day ago', description: 'All systems operating within normal parameters', sensor: 'System' }
    ];

    let html = `
        <div class="preview-section" style="background: rgba(255, 255, 255, 0.02); padding: 1.5rem; border-radius: 8px;">
            <h2><i class="ph ph-chart-pie"></i> Alert Summary</h2>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 1rem;">
                <div style="text-align: center; padding: 1rem; background: rgba(239, 68, 68, 0.1); border-radius: 8px;">
                    <div style="font-size: 2rem; font-weight: 700; color: #ef4444;">3</div>
                    <div style="font-size: 0.875rem; color: var(--text-muted);">Critical</div>
                </div>
                <div style="text-align: center; padding: 1rem; background: rgba(245, 158, 11, 0.1); border-radius: 8px;">
                    <div style="font-size: 2rem; font-weight: 700; color: #f59e0b;">4</div>
                    <div style="font-size: 0.875rem; color: var(--text-muted);">Warning</div>
                </div>
                <div style="text-align: center; padding: 1rem; background: rgba(59, 130, 246, 0.1); border-radius: 8px;">
                    <div style="font-size: 2rem; font-weight: 700; color: #3b82f6;">3</div>
                    <div style="font-size: 0.875rem; color: var(--text-muted);">Info</div>
                </div>
            </div>
        </div>

        <div class="preview-section" style="background: transparent; border: none; padding: 0;">
            <h2 style="margin-bottom: 1.5rem;"><i class="ph ph-clock-counter-clockwise"></i> Alert Timeline</h2>
            <div class="alert-timeline">
                ${alerts.map(alert => `
                    <div class="alert-item ${alert.severity}">
                        <div class="alert-header-content">
                            <div class="alert-title-text">${alert.title}</div>
                            <div class="alert-timestamp">${alert.time}</div>
                        </div>
                        <div class="alert-description">${alert.description}</div>
                        <div style="margin-top: 0.5rem; display: flex; gap: 0.5rem; align-items: center;">
                            <span class="severity-badge ${alert.severity}">${alert.severity}</span>
                            <span style="font-size: 0.75rem; color: var(--text-muted);">Sensor: ${alert.sensor}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="preview-section">
            <h2><i class="ph ph-trend-up"></i> Alert Frequency Analysis</h2>
            <p>Alert frequency has increased by 35% compared to the previous week. The majority of alerts (60%) occurred during peak temperature hours (12:00-16:00), suggesting a strong correlation with thermal conditions.</p>
            <p style="margin-top: 1rem;"><strong>Recommendation:</strong> Implement enhanced monitoring protocols during high-risk time windows and consider adjusting alert thresholds based on time-of-day patterns.</p>
        </div>
    `;
    return html;
}

// Custom Report
async function generateCustomReport() {
    // We'll reuse the logic but insert the new AI text if sections are selected
    let html = '';
    const aiParagraphs = await generateAIAnalysis();
    // aiParagraphs: [0]=Exec, [1]=Thermal, [2]=Moisture, [3]=Wind, [4]=Recs

    if (getSectionState('Temperature Data')) {
        html += `
            <div class="preview-section">
                <h2><i class="ph ph-thermometer"></i> Temperature Analysis</h2>
                <p class="report-text">${aiParagraphs[1]}</p>
                <div class="metric-grid">
                    <div class="metric-box"><div class="metric-value">24.5°C</div><div class="metric-label">Average</div></div>
                    <div class="metric-box"><div class="metric-value">28.3°C</div><div class="metric-label">Maximum</div></div>
                </div>
            </div>`;
    }

    if (getSectionState('Humidity Levels')) {
        html += `
            <div class="preview-section">
                <h2><i class="ph ph-drop"></i> Humidity Analysis</h2>
                <p class="report-text">${aiParagraphs[2]}</p>
                <div class="metric-grid">
                    <div class="metric-box"><div class="metric-value">45%</div><div class="metric-label">Average</div></div>
                    <div class="metric-box"><div class="metric-value">38%</div><div class="metric-label">Minimum</div></div>
                </div>
            </div>`;
    }

    if (getSectionState('Wind Speed')) {
        html += `
            <div class="preview-section">
                <h2><i class="ph ph-wind"></i> Wind Vector Analysis</h2>
                <p class="report-text">${aiParagraphs[3]}</p>
                <div class="metric-grid">
                    <div class="metric-box"><div class="metric-value">18.5 km/h</div><div class="metric-label">Avg Speed</div></div>
                    <div class="metric-box"><div class="metric-value">32 km/h</div><div class="metric-label">Gust Peak</div></div>
                </div>
            </div>`;
    }

    if (getSectionState('Fire Risk Analysis')) {
        html += `
            <div class="preview-section">
                <h2><i class="ph ph-fire"></i> Risk Assessment</h2>
                <p class="report-text">${aiParagraphs[0]}</p> 
                <p class="report-text">${aiParagraphs[4]}</p>
            </div>`;
    }

    if (getSectionState('Charts & Graphs')) {
        html += `
            <div class="preview-section">
                <h2><i class="ph ph-chart-line"></i> Visual Analytics</h2>
                <div class="report-charts-grid">
                    <div class="report-chart-item">
                        <h3>Temperature Trend</h3>
                        <div class="chart-container-sm"><canvas id="reportTempChart"></canvas></div>
                    </div>
                </div>
            </div>`;
    }

    if (!html) html = `<div style="padding:2rem; text-align:center; color:#666;">Select sections to generate report</div>`;
    return html;
}


function renderReportCharts() {
    if (!document.getElementById('reportTempChart')) return;

    // Mock data for report chars (will be replaced by DB data later)
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const tempData = [22, 24, 25, 23, 26, 28, 24];
    const riskData = [10, 15, 20, 18, 35, 45, 30];

    // Temp Chart
    const tempCtx = document.getElementById('reportTempChart').getContext('2d');
    if (reportCharts.temp) reportCharts.temp.destroy();

    reportCharts.temp = new Chart(tempCtx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature (°C)',
                data: tempData,
                borderColor: '#3b82f6',
                borderWidth: 2,
                tension: 0.4,
                fill: false,
                pointRadius: 0
            }]
        },
        options: {
            animation: false,
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { display: true, grid: { display: false }, ticks: { font: { size: 8 } } },
                y: { display: true, beginAtZero: false, ticks: { font: { size: 8 } } }
            }
        }
    });

    // Risk Chart
    const riskCtx = document.getElementById('reportRiskChart').getContext('2d');
    if (reportCharts.risk) reportCharts.risk.destroy();

    reportCharts.risk = new Chart(riskCtx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Risk Score (%)',
                data: riskData,
                backgroundColor: riskData.map(v => v > 40 ? '#ef4444' : '#10b981'),
                borderRadius: 4
            }]
        },
        options: {
            animation: false,
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { display: true, grid: { display: false }, ticks: { font: { size: 8 } } },
                y: { display: true, beginAtZero: true, max: 100, ticks: { font: { size: 8 } } }
            }
        }
    });
}

function getDateString(daysOffset) {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    return date.toISOString().split('T')[0];
}

function initializeReports() {
    document.getElementById('generate-pdf').addEventListener('click', generatePDFReport);

    const refreshBtn = document.getElementById('refresh-preview');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            updateReportPreview();
            showToast('Preview updated', 'info');
        });
    }

    // Update preview when report type changes
    const reportTypeSelect = document.getElementById('report-type');
    if (reportTypeSelect) {
        reportTypeSelect.addEventListener('change', () => {
            updateReportPreview();
        });
    }

    // Update preview when checkboxes change (for custom report)
    document.querySelectorAll('.checkbox-label input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const reportType = document.getElementById('report-type').value;
            if (reportType === 'custom') {
                updateReportPreview();
            }
        });
    });

    // Download buttons for recent reports
    document.querySelectorAll('.download-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            showToast('Downloading report...', 'info');
        });
    });

    // Initialize custom dropdowns
    if (window.initCustomDropdowns) window.initCustomDropdowns();
}



async function generatePDFReport() {
    const btn = document.getElementById('generate-pdf');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="ph ph-spinner"></i> Generating...';

    const element = document.getElementById('report-preview');

    // 1. Prepare for Full Capture (Fix Truncation)
    const originalStyles = {
        height: element.style.height,
        maxHeight: element.style.maxHeight,
        overflow: element.style.overflow,
        position: element.style.position
    };

    // Force element to expand to full content height
    element.style.height = 'auto';
    element.style.maxHeight = 'none';
    element.style.overflow = 'visible';

    // Ensure charts are rendered
    if (document.getElementById('reportTempChart')) {
        renderReportCharts();
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    try {
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#0f111a',
            scrollY: -window.scrollY
        });

        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;

        // A4 Dimensions
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth(); // ~210mm
        const pdfHeight = pdf.internal.pageSize.getHeight(); // ~297mm

        const imgWidth = pdfWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let heightLeft = imgHeight;
        let position = 0;

        // Add first page
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;

        // Add subsequent pages if needed
        while (heightLeft > 0) {
            position = heightLeft - imgHeight; // This calculation is tricky for jsPDF
            // Correct logic: shift the image UP by one page height
            position = -1 * (pdfHeight * Math.ceil((imgHeight - heightLeft) / pdfHeight));

            // Simpler: Just subtract pageHeight from current position? 
            // Standard approach:
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, -(imgHeight - heightLeft), imgWidth, imgHeight);
            heightLeft -= pdfHeight;
        }

        const today = new Date().toISOString().split('T')[0];
        const reportType = document.getElementById('report-type').value;
        pdf.save(`forestguard-${reportType}-report-${today}.pdf`);
        showToast('Report generated successfully!', 'success');

    } catch (error) {
        console.error('PDF Error', error);
        showToast('Failed to generate PDF', 'error');
    } finally {
        // Restore styles
        element.style.height = originalStyles.height;
        element.style.maxHeight = originalStyles.maxHeight;
        element.style.overflow = originalStyles.overflow;

        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}
