/**
 * Alerts Page - Alert history and timeline
 */

async function renderAlerts() {
    const container = document.getElementById('page-container');

    container.innerHTML = `
        <div class="page-header">
            <h1>Alert History</h1>
            <p>View and manage system alerts</p>
        </div>

        <div class="alerts-filters">
            <div class="filter-group">
                <label>Severity</label>
                <select id="severity-filter">
                    <option value="all">All Alerts</option>
                    <option value="critical">Critical</option>
                    <option value="warning">Warning</option>
                    <option value="info">Info</option>
                </select>
            </div>
            <div class="filter-group">
                <label>Date Range</label>
                <select id="date-filter">
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="all">All Time</option>
                </select>
            </div>
            <button class="clear-btn">
                <i class="ph ph-trash"></i> Clear History
            </button>
        </div>

        <div class="alerts-timeline">
            <!-- Alerts will be populated here -->
        </div>
    `;

    loadAlertHistory();
}

function loadAlertHistory() {
    const timeline = document.querySelector('.alerts-timeline');
    const alerts = generateAlertHistory();

    timeline.innerHTML = alerts.map(alert => `
        <div class="timeline-item ${alert.severity}" data-alert-id="${alert.id}">
            <div class="timeline-marker"></div>
            <div class="timeline-content">
                <div class="alert-header">
                    <div class="alert-title">
                        <i class="ph ${alert.icon}"></i>
                        <h3>${alert.title}</h3>
                    </div>
                    <span class="alert-time">${formatTimeAgo(alert.timestamp)}</span>
                </div>
                <p class="alert-description">${alert.description}</p>
                <div class="alert-meta">
                    <span class="alert-source">${alert.source}</span>
                    <span class="alert-severity-badge ${alert.severity}">${alert.severity.toUpperCase()}</span>
                </div>
            </div>
        </div>
    `).join('');

    // Add click handlers
    document.querySelectorAll('.timeline-item').forEach(item => {
        item.addEventListener('click', () => {
            const alertId = item.dataset.alertId;
            showAlertDetails(alertId);
        });
    });

    // Filter handlers
    document.getElementById('severity-filter').addEventListener('change', filterAlerts);
    document.getElementById('date-filter').addEventListener('change', filterAlerts);

    document.querySelector('.clear-btn').addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all alert history?')) {
            timeline.innerHTML = '<div class="empty-state"><i class="ph ph-check-circle"></i><h3>No Alerts</h3><p>All clear! No alerts to display.</p></div>';
        }
    });
}

function generateAlertHistory() {
    const types = [
        { title: 'High Temperature Detected', description: 'Temperature exceeded 35°C threshold', severity: 'warning', icon: 'ph-thermometer-hot', source: 'Sensor Array 1' },
        { title: 'Smoke Detected', description: 'Smoke sensor triggered in Zone A', severity: 'critical', icon: 'ph-warning-octagon', source: 'Sensor Array 2' },
        { title: 'Low Humidity Alert', description: 'Humidity dropped below 20%', severity: 'warning', icon: 'ph-drop', source: 'Weather Station' },
        { title: 'High Wind Speed', description: 'Wind speed exceeded 50 km/h', severity: 'warning', icon: 'ph-wind', source: 'Sensor Array 3' },
        { title: 'System Online', description: 'All sensors connected successfully', severity: 'info', icon: 'ph-check-circle', source: 'System' }
    ];

    const alerts = [];
    for (let i = 0; i < 20; i++) {
        const type = types[Math.floor(Math.random() * types.length)];
        alerts.push({
            id: i + 1,
            ...type,
            timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
        });
    }

    return alerts.sort((a, b) => b.timestamp - a.timestamp);
}

function formatTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
            return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
        }
    }
    return 'Just now';
}

function filterAlerts() {
    const severity = document.getElementById('severity-filter').value;
    const dateRange = document.getElementById('date-filter').value;

    document.querySelectorAll('.timeline-item').forEach(item => {
        let show = true;

        if (severity !== 'all' && !item.classList.contains(severity)) {
            show = false;
        }

        item.style.display = show ? 'flex' : 'none';
    });
}

function showAlertDetails(alertId) {
    // Show modal with detailed alert information
    alert(`Alert Details for ID: ${alertId}\\n\\nThis would show a detailed modal with sensor data, location, and recommended actions.`);
}
