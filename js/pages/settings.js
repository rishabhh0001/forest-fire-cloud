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
                    <div class="form-group toggle-group">
                        <label>Email Alerts</label>
                        <label class="toggle">
                            <input type="checkbox" id="email-notifications">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <div class="form-group">
                        <label>Recipient Email</label>
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

            <!-- Credits & About -->
            <div class="card settings-card">
                <div class="card-header">
                    <h2><i class="ph ph-info"></i> About ForestGuard</h2>
                </div>
                <div class="settings-form">
                    <div class="about-content">
                        <p>ForestGuard is an advanced environmental monitoring system designed to detect early signs of wildfires and hazardous weather conditions.</p>
                        <br>
                        <p><strong>Version:</strong> 2.4.0</p>
                        <p><strong>Website:</strong> <a href="https://forestguard.rishabhj.in" target="_blank" style="color: var(--primary-accent); text-decoration: none;">forestguard.rishabhj.in</a></p>
                        <p><strong>Designed & Programmed by:</strong> <span class="highlight-name">Rishabh Joshi</span></p>
                    </div>
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

    // Save buttons logic
    const saveButtons = document.querySelectorAll('.save-btn');

    // 1. Connection Settings Save
    if (saveButtons[0]) {
        saveButtons[0].addEventListener('click', () => {
            const endpoint = document.getElementById('api-endpoint').value;
            const rate = document.getElementById('polling-rate').value;

            CONFIG.apiEndpoint = endpoint;
            CONFIG.pollingRate = parseInt(rate) * 1000;

            // Persist
            localStorage.setItem('forestGuard_apiEndpoint', endpoint);
            localStorage.setItem('forestGuard_pollingRate', CONFIG.pollingRate);

            showToast('Connection settings saved', 'success');
        });
    }

    // 2. Thresholds Save
    if (saveButtons[1]) {
        saveButtons[1].addEventListener('click', () => {
            const mod = document.getElementById('moderate-threshold').value;
            const high = document.getElementById('high-threshold').value;
            const crit = document.getElementById('critical-threshold').value;

            CONFIG.thresholds = {
                moderate: parseInt(mod),
                high: parseInt(high),
                critical: parseInt(crit)
            };

            localStorage.setItem('forestGuard_thresholds', JSON.stringify(CONFIG.thresholds));
            showToast('Risk thresholds updated', 'success');
        });
    }

    // 3. Notification Settings Save
    if (saveButtons[2]) {
        saveButtons[2].addEventListener('click', () => {
            const emailInput = document.getElementById('notification-email');
            if (emailInput && emailInput.value) {
                localStorage.setItem('forestGuard_email', emailInput.value);
                CONFIG.emailAddress = emailInput.value;
            }

            // Save Notification Preferences
            const emailToggle = document.getElementById('email-notifications');
            if (emailToggle) {
                localStorage.setItem('forestGuard_emailEnabled', emailToggle.checked);
                CONFIG.enableEmailNotifications = emailToggle.checked;
            }

            showToast('Notification settings saved', 'success');
        });
    }

    // Data Retention Change (Auto-save or add button? User asked for save buttons)
    // We'll add a specific listener for the dropdown to save immediately for UX, 
    // or we could add a button. Given the UI pattern, let's add a button above or rely on change.
    // The user said "retention drop-down is broken", likely meaning it doesn't select or save.
    const retentionSelect = document.getElementById('data-retention');
    if (retentionSelect) {
        // Load saved
        const savedRetention = localStorage.getItem('forestGuard_retention');
        if (savedRetention) retentionSelect.value = savedRetention;

        retentionSelect.addEventListener('change', (e) => {
            localStorage.setItem('forestGuard_retention', e.target.value);
            showToast(`Retention set to ${e.target.options[e.target.selectedIndex].text}`, 'info');
        });
    }

    // Load saved settings
    const savedEmail = localStorage.getItem('forestGuard_email');
    if (savedEmail) {
        const emailInput = document.getElementById('notification-email');
        if (emailInput) emailInput.value = savedEmail;
        CONFIG.emailAddress = savedEmail;
    }

    // Email Notification Toggle Listener
    const emailToggle = document.getElementById('email-notifications');
    if (emailToggle) {
        // Load saved state
        const savedState = localStorage.getItem('forestGuard_emailEnabled') === 'true';
        emailToggle.checked = savedState;
        CONFIG.enableEmailNotifications = savedState;

        emailToggle.addEventListener('change', (e) => {
            CONFIG.enableEmailNotifications = e.target.checked;
            localStorage.setItem('forestGuard_emailEnabled', e.target.checked);
            if (e.target.checked && !CONFIG.emailAddress) {
                showToast('Please enter an email address', 'warning');
            }
        });
    }

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

    // Initialize custom dropdowns
    if (window.initCustomDropdowns) window.initCustomDropdowns();
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
