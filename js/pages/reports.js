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
                        <i class="ph ph-file-arrow-down"></i> Generate PDF Report
                    </button>
                </div>
            </div>

            <!-- Report Preview -->
            <div class="card report-preview-card">
                <div class="card-header">
                    <h2><i class="ph ph-eye"></i> Report Preview</h2>
                </div>
                <div class="report-preview" id="report-preview">
                    <div class="preview-header">
                        <h1>ForestGuard Monitoring Report</h1>
                        <p class="preview-date">Generated: ${new Date().toLocaleDateString()}</p>
                    </div>
                    
                    <div class="preview-section">
                        <h2>Executive Summary</h2>
                        <div class="summary-stats">
                            <div class="summary-item">
                                <div class="summary-label">Average Temperature</div>
                                <div class="summary-value">24.5°C</div>
                            </div>
                            <div class="summary-item">
                                <div class="summary-label">Average Humidity</div>
                                <div class="summary-value">45%</div>
                            </div>
                            <div class="summary-item">
                                <div class="summary-label">Peak Wind Speed</div>
                                <div class="summary-value">32.1 km/h</div>
                            </div>
                            <div class="summary-item">
                                <div class="summary-label">Total Alerts</div>
                                <div class="summary-value">12</div>
                            </div>
                        </div>
                    </div>

                    <div class="preview-section">
                        <h2>Risk Assessment</h2>
                        <p>During the reporting period, the fire risk remained predominantly in the <strong>Low to Moderate</strong> range. Peak risk occurred on <strong>${getDateString(-2)}</strong> reaching 78%, triggered by high temperatures and low humidity conditions.</p>
                    </div>

                    <div class="preview-section">
                        <h2>Alert Summary</h2>
                        <ul class="alert-summary-list">
                            <li><strong>3</strong> Critical Alerts</li>
                            <li><strong>6</strong> Warning Alerts</li>
                            <li><strong>3</strong> Informational Alerts</li>
                        </ul>
                    </div>

                    <div class="preview-section">
                        <h2>Recommendations</h2>
                        <ul class="recommendations-list">
                            <li>Continue monitoring humidity levels during dry periods</li>
                            <li>Increase sensor polling frequency during high-risk conditions</li>
                            <li>Review and update fire risk thresholds based on seasonal patterns</li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- Recent Reports -->
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
                    <div class="report-item">
                        <i class="ph ph-file-pdf"></i>
                        <div class="report-info">
                            <h3>Monthly Analysis - January 2026</h3>
                            <p>Generated yesterday • 512 KB</p>
                        </div>
                        <button class="download-btn"><i class="ph ph-download"></i></button>
                    </div>
                    <div class="report-item">
                        <i class="ph ph-file-pdf"></i>
                        <div class="report-info">
                            <h3>Alert History - Q4 2025</h3>
                            <p>Generated 3 days ago • 189 KB</p>
                        </div>
                        <button class="download-btn"><i class="ph ph-download"></i></button>
                    </div>
                </div>
            </div>
        </div>
    `;

    initializeReports();
}

function getDateString(daysOffset) {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    return date.toISOString().split('T')[0];
}

function initializeReports() {
    document.getElementById('generate-pdf').addEventListener('click', generatePDFReport);

    // Download buttons for recent reports
    document.querySelectorAll('.download-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            showToast('Downloading report...', 'info');
        });
    });
}

async function generatePDFReport() {
    const btn = document.getElementById('generate-pdf');
    btn.disabled = true;
    btn.innerHTML = '<i class="ph ph-spinner"></i> Generating...';

    // Simulate PDF generation delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Using jsPDF 
    // Check for global or namespaced jsPDF (UMD pattern)
    const { jsPDF } = window.jspdf || window;

    if (jsPDF) {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(20);
        doc.text('ForestGuard Monitoring Report', 20, 20);

        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 30);

        // Summary
        doc.setFontSize(14);
        doc.text('Executive Summary', 20, 45);
        doc.setFontSize(10);
        doc.text('Average Temperature: 24.5°C', 20, 55);
        doc.text('Average Humidity: 45%', 20, 62);
        doc.text('Peak Wind Speed: 32.1 km/h', 20, 69);
        doc.text('Total Alerts: 12', 20, 76);

        // Risk Assessment
        doc.setFontSize(14);
        doc.text('Risk Assessment', 20, 91);
        doc.setFontSize(10);
        const riskText = 'During the reporting period, the fire risk remained predominantly in the Low to Moderate range.';
        doc.text(doc.splitTextToSize(riskText, 170), 20, 101);

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
