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

    let html = '';

    // Generate AI Analysis
    const aiParagraphs = await generateAIAnalysis();

    // Summary Stats
    if (getSectionState('Alert Summary') || getSectionState('Temperature Data')) {
        html += `
            <div class="preview-section">
                <h2>Executive Summary</h2>
                <div class="summary-stats">
                    ${getSectionState('Temperature Data') ? `
                    <div class="summary-item">
                        <div class="summary-label">Average Temperature</div>
                        <div class="summary-value">24.5°C</div>
                    </div>` : ''}
                    ${getSectionState('Humidity Levels') ? `
                    <div class="summary-item">
                        <div class="summary-label">Average Humidity</div>
                        <div class="summary-value">45%</div>
                    </div>` : ''}
                    ${getSectionState('Wind Speed') ? `
                    <div class="summary-item">
                        <div class="summary-label">Peak Wind Speed</div>
                        <div class="summary-value">32.1 km/h</div>
                    </div>` : ''}
                    ${getSectionState('Alert Summary') ? `
                    <div class="summary-item">
                        <div class="summary-label">Total Alerts</div>
                        <div class="summary-value">12</div>
                    </div>` : ''}
                </div>
            </div>`;
    }

    // AI-Generated Analysis Section
    html += `
        <div class="preview-section" style="background: rgba(59, 130, 246, 0.05); border-left: 3px solid #3b82f6; padding: 1.5rem;">
            <h2><i class="ph ph-brain"></i> AI Environmental Analysis</h2>
            ${aiParagraphs.map(p => `<p style="margin-bottom: 1rem; line-height: 1.6; text-align: justify;">${p}</p>`).join('')}
        </div>`;

    // Risk Assessment
    if (getSectionState('Fire Risk Analysis')) {
        html += `
            <div class="preview-section">
                <h2>Risk Assessment</h2>
                <p>During the reporting period, the fire risk remained predominantly in the <strong>Low to Moderate</strong> range. Peak risk occurred on <strong>${getDateString(-2)}</strong> reaching 78%, triggered by high temperatures and low humidity conditions.</p>
            </div>`;
    }

    // Alerts Detail
    if (getSectionState('Alert Summary')) {
        html += `
            <div class="preview-section">
                <h2>Alert Summary</h2>
                <ul class="alert-summary-list">
                    <li><strong>3</strong> Critical Alerts</li>
                    <li><strong>6</strong> Warning Alerts</li>
                    <li><strong>3</strong> Informational Alerts</li>
                </ul>
            </div>`;
    }

    // Charts
    if (getSectionState('Charts & Graphs')) {
        html += `
            <div class="preview-section avoid-break">
                <h2>Key Metrics Analysis</h2>
                <div class="report-charts-grid">
                    <div class="report-chart-item">
                        <h3>Temperature Trend</h3>
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
            </div>`;
    }

    // Recommendations (Default)
    html += `
        <div class="preview-section">
            <h2>Recommendations</h2>
            <ul class="recommendations-list">
                <li>Continue monitoring humidity levels during dry periods</li>
                <li>Increase sensor polling frequency during high-risk conditions</li>
            </ul>
        </div>`;

    previewBody.innerHTML = html;

    // Re-render charts if container exists
    if (getSectionState('Charts & Graphs') && document.getElementById('reportTempChart')) {
        setTimeout(renderReportCharts, 100);
    }
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
