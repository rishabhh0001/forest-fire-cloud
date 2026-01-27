/**
 * Settings Page - Configuration and preferences
 */

async function renderSettings() {
    const container = document.getElementById('page-container');

    container.innerHTML = `
        <div class="page-header">
            <h1>Settings</h1>
            <p>Configure system preferences and thresholds</p>
        </div>

        <div class="settings-container">
            <!-- ESP8266 Connection -->
            <div class="card settings-card">
                <div class="card-header">
                    <h2><i class="ph ph-plugs-connected"></i> ESP8266 Connection</h2>
                </div>
                <div class="settings-form">
                    <div class="form-group">
                        <label>Connection Mode</label>
                        <div class="radio-group">
                            <label class="radio-label">
                                <input type="radio" name="mode" value="simulated" checked>
                                <span>Simulated Data</span>
                            </label>
                            <label class="radio-label">
                                <input type="radio" name="mode" value="live">
                                <span>Live ESP8266</span>
                            </label>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>API Endpoint</label>
                        <input type="text" id="api-endpoint" placeholder="http://192.168.1.100/data" value="http://192.168.1.100/data">
                    </div>
                    <div class="form-group">
                        <label>Polling Rate (seconds)</label>
                        <input type="number" id="polling-rate" min="1" max="60" value="3">
                    </div>
                    <button class="save-btn">
                        <i class="ph ph-floppy-disk"></i> Save Connection Settings
                    </button>
                </div>
            </div>

            <!-- Risk Thresholds -->
            <div class="card settings-card">
                <div class="card-header">
                    <h2><i class="ph ph-sliders"></i> Risk Thresholds</h2>
                </div>
                <div class="settings-form">
                    <div class="form-group">
                        <label>Moderate Risk (%)</label>
                        <input type="range" id="moderate-threshold" min="0" max="100" value="40">
                        <span class="range-value">40%</span>
                    </div>
                    <div class="form-group">
                        <label>High Risk (%)</label>
                        <input type="range" id="high-threshold" min="0" max="100" value="70">
                        <span class="range-value">70%</span>
                    </div>
                    <div class="form-group">
                        <label>Critical Risk (%)</label>
                        <input type="range" id="critical-threshold" min="0" max="100" value="90">
                        <span class="range-value">90%</span>
                    </div>
                    <button class="save-btn">
                        <i class="ph ph-floppy-disk"></i> Save Thresholds
                    </button>
                </div>
            </div>

            <!-- Notifications -->
            <div class="card settings-card">
                <div class="card-header">
                    <h2><i class="ph ph-bell"></i> Notifications</h2>
                </div>
                <div class="settings-form">
                    <div class="form-group toggle-group">
                        <label>Sound Alerts</label>
                        <label class="toggle">
                            <input type="checkbox" id="sound-alerts" checked>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <div class="form-group toggle-group">
                        <label>Browser Notifications</label>
                        <label class="toggle">
                            <input type="checkbox" id="browser-notifications">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <div class="form-group">
                        <label>Email Notifications</label>
                        <input type="email" id="notification-email" placeholder="your@email.com">
                    </div>
                    <button class="save-btn">
                        <i class="ph ph-floppy-disk"></i> Save Notification Settings
                    </button>
                </div>
            </div>

            <!-- Appearance -->
            <div class="card settings-card">
                <div class="card-header">
                    <h2><i class="ph ph-palette"></i> Appearance</h2>
                </div>
                <div class="settings-form">
                    <div class="form-group toggle-group">
                        <label>Dark Mode</label>
                        <label class="toggle">
                            <input type="checkbox" id="dark-mode" checked>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <div class="form-group toggle-group">
                        <label>Animations</label>
                        <label class="toggle">
                            <input type="checkbox" id="animations" checked>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
            </div>

            <!-- Data Management -->
            <div class="card settings-card">
                <div class="card-header">
                    <h2><i class="ph ph-database"></i> Data Management</h2>
                </div>
                <div class="settings-form">
                    <div class="form-group">
                        <label>Data Retention (days)</label>
                        <select id="data-retention">
                            <option value="7">7 Days</option>
                            <option value="30" selected>30 Days</option>
                            <option value="90">90 Days</option>
                            <option value="365">1 Year</option>
                        </select>
                    </div>
                    <button class="danger-btn">
                        <i class="ph ph-trash"></i> Clear All Data
                    </button>
                </div>
            </div>
        </div>
    `;

    initializeSettings();
}

function initializeSettings() {
    // Range sliders
    document.querySelectorAll('input[type="range"]').forEach(slider => {
        const valueDisplay = slider.nextElementSibling;
        slider.addEventListener('input', (e) => {
            valueDisplay.textContent = e.target.value + '%';
        });
    });

    // Save buttons
    document.querySelectorAll('.save-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Show success message
            showToast('Settings saved successfully!', 'success');
        });
    });

    // Connection mode
    document.querySelectorAll('input[name="mode"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            CONFIG.useLiveData = e.target.value === 'live';
            showToast(`Switched to ${e.target.value} mode`, 'info');
        });
    });

    // Dark mode toggle
    document.getElementById('dark-mode').addEventListener('change', (e) => {
        document.body.classList.toggle('light-mode', !e.target.checked);
    });

    // Danger button
    document.querySelector('.danger-btn').addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
            showToast('All data cleared', 'warning');
        }
    });

    // Browser Notification Toggle
    const notifyToggle = document.getElementById('browser-notifications');
    notifyToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
            if (!('Notification' in window)) {
                showToast('This browser does not support notifications', 'error');
                e.target.checked = false;
            } else if (Notification.permission !== 'granted') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        showToast('Notifications enabled', 'success');
                        CONFIG.enableNotifications = true;
                    } else {
                        e.target.checked = false;
                        showToast('Permission denied', 'error');
                    }
                });
            } else {
                CONFIG.enableNotifications = true;
                showToast('Notifications enabled', 'success');
            }
        } else {
            CONFIG.enableNotifications = false;
        }
    });
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('show');
    }, 100);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
