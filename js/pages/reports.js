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

// AI Analysis Generator - Creates 2-3 paragraphs based on data
async function generateAIAnalysis() {
    // Fetch real data from database
    let readings = [];
    if (window.db) {
        try {
            readings = await window.db.getReadings(7);
        } catch (e) {
            console.log('DB not available, using simulated analysis');
        }
    }

    // Calculate statistics
    const temps = readings.length ? readings.map(r => r.temperature) : [24, 25, 26, 24, 25];
    const humids = readings.length ? readings.map(r => r.humidity) : [45, 44, 46, 45, 44];
    const winds = readings.length ? readings.map(r => r.windSpeed) : [12, 15, 14, 13, 12];

    const avgTemp = (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1);
    const maxTemp = Math.max(...temps).toFixed(1);
    const minTemp = Math.min(...temps).toFixed(1);
    const avgHumid = Math.floor(humids.reduce((a, b) => a + b, 0) / humids.length);
    const avgWind = (winds.reduce((a, b) => a + b, 0) / winds.length).toFixed(1);

    // Trend analysis
    const firstHalf = temps.slice(0, Math.floor(temps.length / 2));
    const secondHalf = temps.slice(Math.floor(temps.length / 2));
    const avg1 = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const avg2 = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    const trend = avg2 > avg1 + 0.5 ? "upward" : (avg2 < avg1 - 0.5 ? "downward" : "stable");

    // Risk calculation
    const highRiskCount = temps.filter((t, i) => t > 30 || humids[i] < 30).length;
    const riskLevel = highRiskCount > temps.length / 3 ? "elevated" : "nominal";

    // Generate paragraphs
    let paragraphs = [];

    // Paragraph 1: Overview & Thermal Analysis
    paragraphs.push(
        `Environmental monitoring data collected over the reporting period indicates a ${trend} thermal trend with an average temperature of ${avgTemp}°C. ` +
        `Temperature readings ranged from a minimum of ${minTemp}°C to a maximum of ${maxTemp}°C, demonstrating ${maxTemp - minTemp > 5 ? 'significant' : 'moderate'} diurnal variation. ` +
        `Humidity levels averaged ${avgHumid}%, while wind patterns maintained a mean velocity of ${avgWind} km/h. ` +
        `Data consistency remained high throughout the monitoring window, with ${readings.length || 'multiple'} sensor readings captured, enabling reliable trend analysis and risk assessment.`
    );

    // Paragraph 2: Risk Assessment & Correlation Analysis
    paragraphs.push(
        `Fire risk indicators suggest a ${riskLevel} threat level based on the correlation between thermal conditions and atmospheric moisture content. ` +
        `${highRiskCount > 0 ? `Analysis identified ${highRiskCount} instances where environmental parameters exceeded baseline thresholds, warranting increased monitoring protocols. ` : ''}` +
        `The interplay between temperature spikes and humidity variations showed ${avgHumid < 40 ? 'concerning' : 'expected'} patterns, ` +
        `with wind dynamics contributing ${avgWind > 20 ? 'significantly' : 'minimally'} to the overall volatility of the fire danger index. ` +
        `Predictive modeling suggests ${trend === 'upward' ? 'continued vigilance is recommended as thermal conditions may escalate' : 'conditions are likely to stabilize over the next 48-72 hours'}.`
    );

    // Paragraph 3: Recommendations
    paragraphs.push(
        `Based on comprehensive data analysis, it is recommended to ${riskLevel === 'elevated' ? 'increase patrol frequency and enhance sensor polling intervals during peak thermal hours (12:00-16:00)' : 'maintain current scheduled monitoring protocols while remaining alert to sudden meteorological shifts'}. ` +
        `${avgHumid < 35 ? 'Special attention should be directed toward humidity recovery patterns, as prolonged dry conditions significantly amplify ignition susceptibility. ' : ''}` +
        `Sensor calibration verification is advised within the next monitoring cycle to ensure continued data integrity. ` +
        `Long-term trend analysis indicates ${trend === 'stable' ? 'seasonal normalization' : trend === 'upward' ? 'potential escalation requiring proactive resource allocation' : 'favorable conditions with reduced immediate risk factors'}.`
    );

    return paragraphs;
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

    let html = `
        <div class="preview-section">
            <h2><i class="ph ph-brain"></i> AI Environmental Analysis</h2>
            ${aiParagraphs.map(p => `<p style="margin-bottom: 1rem; line-height: 1.6; text-align: justify;">${p}</p>`).join('')}
        </div>

        <div class="preview-section">
            <h2><i class="ph ph-table"></i> Statistical Summary</h2>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Metric</th>
                        <th>Average</th>
                        <th>Min</th>
                        <th>Max</th>
                        <th>Std Dev</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Temperature (°C)</td>
                        <td>24.5</td>
                        <td>22.1</td>
                        <td>28.3</td>
                        <td>1.8</td>
                        <td><span class="stat-badge">Normal</span></td>
                    </tr>
                    <tr>
                        <td>Humidity (%)</td>
                        <td>45</td>
                        <td>38</td>
                        <td>52</td>
                        <td>4.2</td>
                        <td><span class="stat-badge">Watch</span></td>
                    </tr>
                    <tr>
                        <td>Wind Speed (km/h)</td>
                        <td>18.5</td>
                        <td>12.0</td>
                        <td>32.1</td>
                        <td>6.3</td>
                        <td><span class="stat-badge">Normal</span></td>
                    </tr>
                    <tr>
                        <td>Gas Levels (ppm)</td>
                        <td>42</td>
                        <td>38</td>
                        <td>48</td>
                        <td>3.1</td>
                        <td><span class="stat-badge">Normal</span></td>
                    </tr>
                </tbody>
            </table>
        </div>

        ${getSectionState('Charts & Graphs') ? `
        <div class="preview-section">
            <h2><i class="ph ph-chart-line"></i> Trend Analysis</h2>
            <div class="report-charts-grid">
                <div class="report-chart-item">
                    <h3>Temperature Trend (7 Days)</h3>
                    <div class="chart-container-sm">
                        <canvas id="reportTempChart"></canvas>
                    </div>
                </div>
                <div class="report-chart-item">
                    <h3>Fire Risk Assessment</h3>
                    <div class="chart-container-sm">
                        <canvas id="reportRiskChart"></canvas>
                    </div>
                </div>
            </div>
        </div>` : ''}

        <div class="preview-section">
            <h2><i class="ph ph-warning-circle"></i> Risk Assessment</h2>
            <p>During the reporting period, the fire risk remained predominantly in the <strong>Low to Moderate</strong> range. Peak risk occurred on <strong>${getDateString(-2)}</strong> reaching 78%, triggered by high temperatures and low humidity conditions.</p>
            <p style="margin-top: 1rem;">Correlation analysis indicates a strong inverse relationship between humidity levels and fire risk scores (r = -0.87), suggesting that moisture content is the primary mitigating factor in the current environmental context.</p>
        </div>

        <div class="preview-section">
            <h2><i class="ph ph-list-checks"></i> Recommendations</h2>
            <ul class="recommendations-list">
                <li>Continue monitoring humidity levels during dry periods</li>
                <li>Increase sensor polling frequency during high-risk conditions</li>
                <li>Conduct equipment calibration verification within next 48 hours</li>
                <li>Review and update emergency response protocols</li>
            </ul>
        </div>
    `;
    return html;
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

// Custom Report - Modular, user-selected sections
async function generateCustomReport() {
    let html = '';

    // Only include sections that are checked
    if (getSectionState('Temperature Data')) {
        html += `
            <div class="preview-section">
                <h2><i class="ph ph-thermometer"></i> Temperature Analysis</h2>
                <div class="metric-grid">
                    <div class="metric-box">
                        <div class="metric-value">24.5°C</div>
                        <div class="metric-label">Average</div>
                    </div>
                    <div class="metric-box">
                        <div class="metric-value">28.3°C</div>
                        <div class="metric-label">Maximum</div>
                    </div>
                    <div class="metric-box">
                        <div class="metric-value">22.1°C</div>
                        <div class="metric-label">Minimum</div>
                    </div>
                    <div class="metric-box">
                        <div class="metric-value">+2.3°C</div>
                        <div class="metric-label">Trend</div>
                    </div>
                </div>
                <p style="margin-top: 1rem;">Temperature readings show an upward trend with peak values occurring during midday hours. Diurnal variation remains within expected seasonal parameters.</p>
            </div>
        `;
    }

    if (getSectionState('Humidity Levels')) {
        html += `
            <div class="preview-section">
                <h2><i class="ph ph-drop"></i> Humidity Monitoring</h2>
                <div class="metric-grid">
                    <div class="metric-box">
                        <div class="metric-value">45%</div>
                        <div class="metric-label">Average</div>
                    </div>
                    <div class="metric-box">
                        <div class="metric-value">52%</div>
                        <div class="metric-label">Maximum</div>
                    </div>
                    <div class="metric-box">
                        <div class="metric-value">38%</div>
                        <div class="metric-label">Minimum</div>
                    </div>
                    <div class="metric-box">
                        <div class="metric-value">-5%</div>
                        <div class="metric-label">Trend</div>
                    </div>
                </div>
                <p style="margin-top: 1rem;">Humidity levels are declining, approaching the lower threshold for increased fire risk. Continued monitoring is essential.</p>
            </div>
        `;
    }

    if (getSectionState('Wind Speed')) {
        html += `
            <div class="preview-section">
                <h2><i class="ph ph-wind"></i> Wind Conditions</h2>
                <div class="metric-grid">
                    <div class="metric-box">
                        <div class="metric-value">18.5 km/h</div>
                        <div class="metric-label">Average</div>
                    </div>
                    <div class="metric-box">
                        <div class="metric-value">32.1 km/h</div>
                        <div class="metric-label">Peak Gust</div>
                    </div>
                    <div class="metric-box">
                        <div class="metric-value">12.0 km/h</div>
                        <div class="metric-label">Minimum</div>
                    </div>
                    <div class="metric-box">
                        <div class="metric-value">NE</div>
                        <div class="metric-label">Direction</div>
                    </div>
                </div>
                <p style="margin-top: 1rem;">Wind patterns show moderate variability with gusts reaching 32 km/h. Prevailing northeast winds may accelerate fire spread if ignition occurs.</p>
            </div>
        `;
    }

    if (getSectionState('Fire Risk Analysis')) {
        html += `
            <div class="preview-section">
                <h2><i class="ph ph-fire"></i> Fire Risk Assessment</h2>
                <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; padding: 1.5rem; margin-bottom: 1rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 0.5rem;">Current Risk Level</div>
                            <div style="font-size: 2rem; font-weight: 700; color: #f59e0b;">MODERATE</div>
                        </div>
                        <div style="font-size: 4rem; color: rgba(245, 158, 11, 0.3);">
                            <i class="ph ph-warning"></i>
                        </div>
                    </div>
                </div>
                <p>Fire risk assessment indicates moderate threat levels based on environmental conditions. Key contributing factors include declining humidity and elevated temperatures during peak hours.</p>
            </div>
        `;
    }

    if (getSectionState('Alert Summary')) {
        html += `
            <div class="preview-section">
                <h2><i class="ph ph-bell"></i> Alert Overview</h2>
                <ul class="alert-summary-list">
                    <li><strong>3</strong> Critical Alerts - Immediate attention required</li>
                    <li><strong>4</strong> Warning Alerts - Monitor closely</li>
                    <li><strong>3</strong> Informational Alerts - System updates and maintenance</li>
                </ul>
                <p style="margin-top: 1rem;">Alert frequency has increased compared to baseline, primarily due to environmental condition changes.</p>
            </div>
        `;
    }

    if (getSectionState('Charts & Graphs')) {
        html += `
            <div class="preview-section">
                <h2><i class="ph ph-chart-line"></i> Visual Analytics</h2>
                <div class="report-charts-grid">
                    <div class="report-chart-item">
                        <h3>Temperature Trend</h3>
                        <div class="chart-container-sm">
                            <canvas id="reportTempChart"></canvas>
                        </div>
                    </div>
                    <div class="report-chart-item">
                        <h3>Fire Risk Score</h3>
                        <div class="chart-container-sm">
                            <canvas id="reportRiskChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    if (!html) {
        html = `
            <div class="preview-section">
                <p style="text-align: center; color: var(--text-muted); padding: 2rem;">
                    <i class="ph ph-info" style="font-size: 3rem; display: block; margin-bottom: 1rem; opacity: 0.3;"></i>
                    Select sections to include in your custom report
                </p>
            </div>
        `;
    }

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
    btn.disabled = true;
    btn.innerHTML = '<i class="ph ph-spinner"></i> Generating...';

    // Generate AI Analysis
    const aiParagraphs = await generateAIAnalysis();

    // Simulate PDF generation delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Using jsPDF 
    const { jsPDF } = window.jspdf || window;

    if (jsPDF) {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        const activeWidth = pageWidth - (margin * 2);

        // Header
        doc.setFontSize(22);
        doc.setTextColor(40, 40, 40);
        doc.text('ForestGuard Monitoring Report', margin, 20);

        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated: ${new Date().toLocaleString()}`, margin, 30);
        doc.line(margin, 35, pageWidth - margin, 35);

        let currentY = 50;

        // AI Environmental Analysis Section
        doc.setFontSize(16);
        doc.setTextColor(59, 130, 246);
        doc.text('AI Environmental Analysis', margin, currentY);
        currentY += 10;

        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);

        aiParagraphs.forEach((para) => {
            const splitText = doc.splitTextToSize(para, activeWidth);
            const estimatedHeight = splitText.length * 5;

            if (currentY + estimatedHeight > pageHeight - 40) {
                doc.addPage();
                currentY = 20;
            }

            doc.text(splitText, margin, currentY);
            currentY += estimatedHeight + 5;
        });

        currentY += 10;

        // Summary Stats
        if (getSectionState('Alert Summary') || getSectionState('Temperature Data')) {
            if (currentY + 40 > pageHeight - 40) {
                doc.addPage();
                currentY = 20;
            }

            doc.setFontSize(14);
            doc.setTextColor(0, 0, 0);
            doc.text('Executive Summary', margin, currentY);
            currentY += 10;

            doc.setFontSize(10);
            doc.setTextColor(60, 60, 60);

            if (getSectionState('Temperature Data')) doc.text('Average Temperature: 24.5°C', margin, currentY);
            if (getSectionState('Humidity Levels')) doc.text('Average Humidity: 45%', margin + 60, currentY);

            currentY += 8;
            if (getSectionState('Wind Speed')) doc.text('Peak Wind Speed: 32.1 km/h', margin, currentY);
            if (getSectionState('Alert Summary')) doc.text('Total Alerts: 12', margin + 60, currentY);

            currentY += 15;
        }

        // Risk Assessment Text
        if (getSectionState('Fire Risk Analysis')) {
            doc.setFontSize(14);
            doc.setTextColor(0, 0, 0);
            doc.text('Risk Assessment', margin, currentY);
            currentY += 10;

            doc.setFontSize(10);
            doc.setTextColor(60, 60, 60);
            const riskText = 'During the reporting period, the fire risk remained predominantly in the Low to Moderate range. Peak risk occurred recently reaching 45%.';
            const splitText = doc.splitTextToSize(riskText, activeWidth);
            doc.text(splitText, margin, currentY);
            currentY += 20;
        }

        // Embed Charts
        if (getSectionState('Charts & Graphs') && reportCharts.temp) {
            if (currentY + 140 > pageHeight - 40) {
                doc.addPage();
                currentY = 20;
            }

            doc.setFontSize(14);
            doc.setTextColor(0, 0, 0);
            doc.text('Visual Analysis', margin, currentY);
            currentY += 10;

            // Add Temperature Chart
            const tempImg = reportCharts.temp.toBase64Image();
            doc.addImage(tempImg, 'PNG', margin, currentY, activeWidth, 60);
            currentY += 65;

            if (currentY + 65 > pageHeight - 40) {
                doc.addPage();
                currentY = 20;
            }

            // Add Risk Chart
            if (reportCharts.risk) {
                const riskImg = reportCharts.risk.toBase64Image();
                doc.addImage(riskImg, 'PNG', margin, currentY, activeWidth, 60);
                currentY += 70;
            }
        }

        // Footer credits (on last page)
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('Report Generated by ForestGuard System', margin, pageHeight - 15);
        doc.setTextColor(59, 130, 246);
        doc.textWithLink('forestguard.rishabhj.in', margin, pageHeight - 10, { url: 'https://forestguard.rishabhj.in' });
        doc.setTextColor(150, 150, 150);
        doc.text('Designed & Programmed by Rishabh Joshi', pageWidth - margin - 50, pageHeight - 10);

        // Save
        doc.save(`forestguard-report-${new Date().toISOString().split('T')[0]}.pdf`);

        showToast('Report generated successfully!', 'success');
    } else {
        // Fallback: Create a simple text report
        const reportText = document.getElementById('report-preview').innerText;
        const blob = new Blob([reportText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `forestguard-report-${new Date().toISOString().split('T')[0]}.txt`;
        a.click();

        showToast('Report downloaded as text file', 'info');
    }

    btn.disabled = false;
    btn.innerHTML = '<i class="ph ph-file-arrow-down"></i> Generate PDF Report';
}
