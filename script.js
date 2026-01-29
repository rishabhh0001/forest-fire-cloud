/**
 * ForestGuard - Main Controller
 * Handles data fetching (Mock/Live), UI updates, and Chart rendering.
 */

// Configuration
const CONFIG = {
    useLiveData: false,             // Set to true to fetch from APIEndpoint
    apiEndpoint: 'http://192.168.4.1/readings', // ESP8266 standalone server endpoint
    refreshRate: 3000,              // Update every 3s
    riskThresholds: {
        moderate: 40,
        high: 70,
        extreme: 90
    },
    enableNotifications: false,
    enableEmailNotifications: false,
    emailAddress: null
};

/**
 * AudioController generates procedural sounds (Siren, Storm)
 * using Web Audio API to avoid external assets.
 */
class AudioController {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.activeOscillators = [];
        this.isMuted = false;
        this.masterGain = this.ctx.createGain();
        this.masterGain.connect(this.ctx.destination);
    }

    // Resume context (browser policy requires user interaction)
    async ensureContext() {
        if (this.ctx.state === 'suspended') {
            await this.ctx.resume();
        }
    }

    playSiren() {
        this.stopAll();
        this.ensureContext();

        // Dual-tone Air Raid Siren
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        osc1.type = 'sawtooth';
        osc2.type = 'sawtooth';

        // Detune slightly for realistic dissonance
        osc1.frequency.setValueAtTime(400, this.ctx.currentTime);
        osc2.frequency.setValueAtTime(405, this.ctx.currentTime);

        // Slow rise and fall (Air Raid style)
        const now = this.ctx.currentTime;
        osc1.frequency.exponentialRampToValueAtTime(800, now + 2);
        osc2.frequency.exponentialRampToValueAtTime(810, now + 2);
        osc1.frequency.exponentialRampToValueAtTime(400, now + 4);
        osc2.frequency.exponentialRampToValueAtTime(405, now + 4);

        // LFO for continuous loop
        const lfo = this.ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.25; // 4 second cycle

        const lfoGain = this.ctx.createGain();
        lfoGain.gain.value = 200; // Pitch variance

        lfo.connect(lfoGain);
        lfoGain.connect(osc1.frequency);
        lfoGain.connect(osc2.frequency);

        gainNode.gain.setValueAtTime(0.1, now);

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(this.masterGain);

        osc1.start();
        osc2.start();
        lfo.start();

        this.activeOscillators.push(osc1, osc2, lfo);
    }

    playStorm() {
        this.stopAll();
        this.ensureContext();

        // 1. Wind (Pink Noise background)
        const bufferSize = 2 * this.ctx.sampleRate;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            output[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = output[i];
            output[i] *= 3.5;
        }
        let lastOut = 0;

        const wind = this.ctx.createBufferSource();
        wind.buffer = noiseBuffer;
        wind.loop = true;

        const windFilter = this.ctx.createBiquadFilter();
        windFilter.type = 'lowpass';
        windFilter.frequency.value = 400;

        const windGain = this.ctx.createGain();
        windGain.gain.value = 0.15; // Base wind volume

        wind.connect(windFilter);
        windFilter.connect(windGain);
        windGain.connect(this.masterGain);
        wind.start();
        this.activeOscillators.push(wind);

        // 2. Thunder Rumble (Random Lowfreq Noise Bursts)
        // We set an interval to trigger thunder occasionally
        // Note: For simplicity in this class, we'll just add a "rumble" loop
        const thunderOsc = this.ctx.createOscillator();
        thunderOsc.type = 'sawtooth';
        thunderOsc.frequency.value = 40; // Deep rumble

        const thunderFilter = this.ctx.createBiquadFilter();
        thunderFilter.type = 'lowpass';
        thunderFilter.frequency.value = 150;

        const thunderGain = this.ctx.createGain();
        thunderGain.gain.value = 0; // Start silent

        // Modulate volume randomly to simulate rolling thunder
        const thunderLFO = this.ctx.createOscillator();
        thunderLFO.type = 'triangle';
        thunderLFO.frequency.value = 0.1 + Math.random() * 0.2; // Slow roll

        // Connect LFO to gain through a shaper ideally, but simple direct connection works for rough rumble
        // We'll just update gain manually in a loop for better control in a real app, 
        // but here we use a simple constant rumble background for atmosphere
        thunderGain.gain.setValueAtTime(0.05, this.ctx.currentTime);

        thunderOsc.connect(thunderFilter);
        thunderFilter.connect(thunderGain);
        thunderGain.connect(this.masterGain);
        thunderOsc.start();

        this.activeOscillators.push(thunderOsc);
    }

    stopAll() {
        this.activeOscillators.forEach(osc => {
            try { osc.stop(); } catch (e) { }
        });
        this.activeOscillators = [];
    }
}

/**
 * DataService handles logic for retrieving sensor data.
 */
class DataService {
    constructor() {
        this.history = []; // Keep small history for charts
        this.overrideMode = null; // 'fire', 'storm', or null

        // Initial simulation state for Random Walk
        this.lastState = {
            temperature: 24.5,
            humidity: 45,
            windSpeed: 15.0,
            gasLevel: 400
        };
    }

    async getSensorData() {
        // Check for manual overrides first
        if (this.overrideMode) {
            return this.getOverrideData();
        }

        if (CONFIG.useLiveData) {
            try {
                console.log(`Fetching live data from: ${CONFIG.apiEndpoint}`);
                const response = await fetch(CONFIG.apiEndpoint);
                const data = await response.json();
                console.log('ESP8266 data received:', data);
                return this.processData(data);
            } catch (e) {
                console.error("Connection failed, falling back to simulation", e);
                return this.simulateDataWithPersistence();
            }
        } else {
            console.log('Using simulated data (Live mode is OFF)');
            return this.simulateDataWithPersistence();
        }
    }

    getOverrideData() {
        const now = new Date().toISOString();
        if (this.overrideMode === 'fire') {
            return {
                timestamp: now,
                temperature: 42.5, // High temp
                humidity: 12,      // Bone dry
                windSpeed: 25.0,   // Driving wind
                gasLevel: 850,     // High CO2/Smoke
                smokeDetected: true
            };
        } else if (this.overrideMode === 'storm') {
            return {
                timestamp: now,
                temperature: 18.0,
                humidity: 95,
                windSpeed: 85.0,   // Gale force
                gasLevel: 400,
                smokeDetected: false
            };
        }
        return this.simulateData();
    }

    // Expose control methods
    triggerFire() { this.overrideMode = 'fire'; }
    triggerStorm() { this.overrideMode = 'storm'; }
    reset() { this.overrideMode = null; }

    // Generate realistic fluctuating data (Random Walk)
    simulateData() {
        const now = new Date();

        // Random walk logic: New value = Old Value + (Random Step) + (Pull to Mean)
        // This prevents values from drifting infinitely and keeps them realistic

        // Temperature (Mean: 25, Step: 0.2)
        let tempChange = (Math.random() - 0.5) * 0.4;
        let tempPull = (25 - this.lastState.temperature) * 0.05; // Pull back to 25
        this.lastState.temperature += tempChange + tempPull;

        // Humidity (Mean: 45, Step: 1)
        let humidChange = (Math.random() - 0.5) * 2;
        let humidPull = (45 - this.lastState.humidity) * 0.05;
        this.lastState.humidity += humidChange + humidPull;

        // Wind (Mean: 12, Step: 1.5)
        let windChange = (Math.random() - 0.5) * 3;
        let windPull = (12 - this.lastState.windSpeed) * 0.1;
        this.lastState.windSpeed = Math.max(0, this.lastState.windSpeed + windChange + windPull);

        // Gas (Mean: 400, Step: 10)
        let gasChange = (Math.random() - 0.5) * 20;
        let gasPull = (400 - this.lastState.gasLevel) * 0.05;
        this.lastState.gasLevel = Math.max(0, this.lastState.gasLevel + gasChange + gasPull);

        return {
            timestamp: now.toISOString(),
            temperature: parseFloat(this.lastState.temperature.toFixed(1)),
            humidity: Math.floor(this.lastState.humidity),
            windSpeed: parseFloat(this.lastState.windSpeed.toFixed(1)),
            gasLevel: Math.floor(this.lastState.gasLevel),
            // Fire sensors (digital)
            smokeDetected: Math.random() > 0.995, // Very rare random smoke event
        };
    }

    async processData(data) {
        // Validate and fix timestamp if needed
        if (!data.timestamp || isNaN(new Date(data.timestamp).getTime())) {
            console.warn('Invalid or missing timestamp, using current time');
            data.timestamp = new Date().toISOString();
        }

        // Save to DB
        if (window.db) {
            await window.db.addReading(data);
        }
        return data;
    }

    // Mock data wrapper to save to DB too
    async simulateDataWithPersistence() {
        const data = this.simulateData();
        if (window.db) {
            await window.db.addReading(data);
        }
        return data;
    }
}

/**
 * UI Controller handles DOM manipulation
 */
const UI = {
    elements: {
        temp: document.getElementById('temp-display'),
        humid: document.getElementById('humid-display'),
        wind: document.getElementById('wind-display'),
        gas: document.getElementById('gas-display'),
        riskScore: document.getElementById('risk-score'),
        riskBar: document.getElementById('risk-bar'),
        riskBadge: document.getElementById('risk-badge'),
        lastUpdate: document.getElementById('last-update'),
        alertsList: document.getElementById('alerts-list')
    },

    chart: null,
    currentMode: null,

    initChart() {
        const canvas = document.getElementById('tempChart');
        if (!canvas) return; // Exit if chart canvas doesn't exist (e.g. not on Dashboard)

        const ctx = canvas.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.5)');
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0.0)');

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array(10).fill(''),
                datasets: [{
                    label: 'Temperature (°C)',
                    data: Array(10).fill(24),
                    borderColor: '#3b82f6',
                    backgroundColor: gradient,
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { display: false },
                    y: { display: true, grid: { color: 'rgba(255,255,255,0.05)' } }
                }
            }
        });
    },

    updateDashboard(data) {
        // Re-query elements as they might have been re-created by router
        const tempEl = document.getElementById('temp-display');

        // If critical element is missing, we are likely not on the dashboard
        if (!tempEl) {
            // Still check for alerts even if not on dashboard
            // But we need to be careful with alert UI elements too
            // For now, if we are not on dashboard, we just skip UI updates
            // Background notifications (browser/email) can be handled separately if needed
            this.checkAlerts(data, 0); // Pass 0 risk if we can't calc it easily, or recalc it
            return;
        }

        // Update basic metrics with interpolation
        this.animateValue(document.getElementById('temp-display'), parseFloat(document.getElementById('temp-display').innerText) || 0, data.temperature, 1000);
        this.animateValue(document.getElementById('humid-display'), parseInt(document.getElementById('humid-display').innerText) || 0, data.humidity, 1000);
        this.animateValue(document.getElementById('wind-display'), parseFloat(document.getElementById('wind-display').innerText) || 0, data.windSpeed, 1000);
        this.animateValue(document.getElementById('gas-display'), parseInt(document.getElementById('gas-display').innerText) || 0, data.gasLevel, 1000);

        const lastUpdateEl = document.getElementById('last-update');
        if (lastUpdateEl) lastUpdateEl.innerText = new Date().toLocaleTimeString();

        // Calculate Risk
        let riskScore = 0;
        riskScore += Math.max(0, (data.temperature - 20) * 2);
        riskScore += data.windSpeed * 1.5;
        riskScore += Math.max(0, (60 - data.humidity));
        if (data.smokeDetected) riskScore = 100;
        riskScore = Math.min(100, Math.max(0, Math.round(riskScore)));

        // Update Risk UI
        const riskScoreEl = document.getElementById('risk-score');
        const riskBarEl = document.getElementById('risk-bar');
        if (riskScoreEl) riskScoreEl.innerText = `${riskScore}%`;
        if (riskBarEl) riskBarEl.style.width = `${riskScore}%`;

        // Determine Status Color
        let status = 'Normal';
        let colorClass = '#10b981'; // Green

        if (riskScore > CONFIG.riskThresholds.high || data.smokeDetected) {
            status = 'CRITICAL FIRE';
            colorClass = '#ef4444'; // Red
            this.setAlertMode('fire');
        } else if (data.windSpeed > 60) {
            status = 'STORM SURGE';
            colorClass = '#3b82f6'; // Blue
            this.setAlertMode('storm');
        } else {
            if (riskScore > CONFIG.riskThresholds.moderate) {
                status = 'Caution';
                colorClass = '#f59e0b';
            }
            this.setAlertMode(null);
        }

        const riskBadge = document.getElementById('risk-badge');
        if (riskBadge) {
            riskBadge.innerText = status;
            riskBadge.style.backgroundColor = `${colorClass}22`;
            riskBadge.style.color = colorClass;
        }

        // Update Chart
        this.updateChart(data.temperature);

        // Check for alerts
        this.checkAlerts(data, riskScore);
    },

    setAlertMode(mode) {
        if (this.currentMode === mode) return;
        this.currentMode = mode;

        const overlay = document.getElementById('warning-overlay');
        const overlayText = document.getElementById('warning-text');
        const body = document.body;

        body.classList.remove('red-alert', 'storm-alert');
        overlay.classList.remove('active');

        // Clear any existing dismiss timeout
        if (this.overlayTimeout) {
            clearTimeout(this.overlayTimeout);
            this.overlayTimeout = null;
        }

        if (mode === 'fire') {
            body.classList.add('red-alert');
            overlay.classList.add('active');
            overlayText.innerText = 'CRITICAL FIRE WARNING';
            overlayText.style.color = '#ef4444';
            overlayText.style.textShadow = '0 0 20px #ef4444';

            this.triggerWarningText();
            audio.playSiren();
            this.startWeatherEffects('fire');

            // Auto-dismiss overlay but keep alert state
            this.overlayTimeout = setTimeout(() => {
                overlay.classList.remove('active');
            }, 4000);

        } else if (mode === 'storm') {
            body.classList.add('storm-alert');
            overlay.classList.add('active');
            overlayText.innerText = 'STORM SURGE WARNING';
            overlayText.style.color = '#3b82f6';
            overlayText.style.textShadow = '0 0 20px #3b82f6';

            this.triggerWarningText();
            audio.playStorm();
            this.startWeatherEffects('storm');

            // Auto-dismiss overlay but keep alert state
            this.overlayTimeout = setTimeout(() => {
                overlay.classList.remove('active');
            }, 4000);

        } else {
            audio.stopAll();
            this.stopWeatherEffects();
        }
    },

    // Weather Effects System
    weatherInterval: null,

    startWeatherEffects(mode) {
        this.stopWeatherEffects(); // Clear existing

        const container = document.createElement('div');
        container.id = 'weather-effects';
        document.body.appendChild(container);

        if (mode === 'fire') {
            // Hazard Tape
            const tapeTop = document.createElement('div');
            tapeTop.className = 'hazard-tape hazard-tape-top fire-tape';
            container.appendChild(tapeTop);

            const tapeBottom = document.createElement('div');
            tapeBottom.className = 'hazard-tape hazard-tape-bottom fire-tape';
            container.appendChild(tapeBottom);

            // Spawn embers periodically
            this.weatherInterval = setInterval(() => {
                const ember = document.createElement('div');
                ember.className = 'ember';
                ember.style.left = Math.random() * 100 + 'vw';
                ember.style.animationDuration = (2 + Math.random() * 3) + 's';
                ember.style.opacity = Math.random();
                container.appendChild(ember);

                // Cleanup ember after animation
                setTimeout(() => ember.remove(), 5000);
            }, 100);

            // Initial burst
            for (let i = 0; i < 20; i++) {
                const ember = document.createElement('div');
                ember.className = 'ember';
                ember.style.left = Math.random() * 100 + 'vw';
                ember.style.animationDuration = (2 + Math.random() * 3) + 's';
                ember.style.bottom = Math.random() * 50 + 'vh'; // Start higher up
                container.appendChild(ember);
                setTimeout(() => ember.remove(), 4000);
            }

        } else if (mode === 'storm') {
            // Hazard Tape
            const tapeTop = document.createElement('div');
            tapeTop.className = 'hazard-tape hazard-tape-top storm-tape';
            container.appendChild(tapeTop);

            const tapeBottom = document.createElement('div');
            tapeBottom.className = 'hazard-tape hazard-tape-bottom storm-tape';
            container.appendChild(tapeBottom);

            // Add rain layers
            const layer1 = document.createElement('div');
            layer1.className = 'rain-layer';
            container.appendChild(layer1);

            const layer2 = document.createElement('div');
            layer2.className = 'rain-layer';
            container.appendChild(layer2);

            // Lightning overlay
            const lightning = document.createElement('div');
            lightning.className = 'lightning-flash';
            container.appendChild(lightning);

            // Random lightning strikes
            this.weatherInterval = setInterval(() => {
                if (Math.random() > 0.7) { // 30% chance per second approx
                    setTimeout(() => {
                        lightning.classList.add('lightning-active');
                        setTimeout(() => lightning.classList.remove('lightning-active'), 300);
                    }, Math.random() * 1000);
                }
            }, 1000);
        }
    },

    stopWeatherEffects() {
        const container = document.getElementById('weather-effects');
        if (container) container.remove();

        if (this.weatherInterval) {
            clearInterval(this.weatherInterval);
            this.weatherInterval = null;
        }
    },

    triggerWarningText() {
        const content = document.querySelector('.warning-content');
        if (!content) return;

        // Reset animation
        content.classList.remove('retract');

        // Clear existing timeout if any
        if (this.warningTimeout) clearTimeout(this.warningTimeout);

        // Retract text after 4 seconds
        this.warningTimeout = setTimeout(() => {
            content.classList.add('retract');
        }, 4000);
    },

    updateChart(newTemp) {
        if (!this.chart) return;
        const chartData = this.chart.data.datasets[0].data;
        chartData.shift();
        chartData.push(newTemp);
        this.chart.update();
    },

    checkAlerts(data, risk) {
        const alertsList = document.getElementById('alerts-list');

        // Only update UI if alert list exists (we are on dashboard or alerts page)
        if (alertsList) {
            if (alertsList.children.length > 5) {
                alertsList.lastElementChild.remove();
            }
        }

        if (data.smokeDetected) {
            // Always trigger notifications, but only update UI if list exists
            this.triggerGlobalAlert('CRITICAL: Smoke Detected', 'Sensor Array 1', 'danger', alertsList);
        } else if (risk > 85) {
            if (Math.random() > 0.8) {
                this.triggerGlobalAlert('Extreme Fire Risk', 'Weather Analysis', 'danger', alertsList);
            }
        } else if (data.temperature > 35) {
            if (Math.random() > 0.9) {
                this.triggerGlobalAlert('High Temperature Warning', 'Sensor 2', 'warning', alertsList);
            }
        }
    },

    triggerGlobalAlert(title, source, type, listElement) {
        // Check if we should add to UI
        if (listElement && !this.hasRecentAlert(title, listElement)) {
            this.addAlert(title, source, type, listElement);
        } else if (!listElement) {
            // Still send browser/email notifications if legitimate new alert logic allows
            // For simplicity, we limit this to avoid spam when UI isn't there to show checking
            // Ideally we'd have a notification service separate from UI
            if (Math.random() > 0.95) { // Very simple throttle for background
                this.sendBackgroundNotification(title, source, type);
            }
        }
    },

    hasRecentAlert(title, listElement) {
        if (!listElement) return false;
        const first = listElement.firstElementChild;
        return first && first.innerHTML.includes(title);
    },

    sendBackgroundNotification(title, source, type) {
        // Browser Notification
        if (CONFIG.enableNotifications && 'Notification' in window && Notification.permission === 'granted') {
            new Notification('ForestGuard Alert', {
                body: `${title} - ${source}`,
                icon: 'https://cdn-icons-png.flaticon.com/512/595/595067.png'
            });
        }

        // Email Notification
        if (CONFIG.enableEmailNotifications && CONFIG.emailAddress) {
            this.sendEmailAlert(title, source, type);
        }
    },

    // Notification Center Logic
    initNotifications() {
        const btn = document.getElementById('notification-btn');
        const dropdown = document.getElementById('notification-dropdown');
        const clearBtn = document.getElementById('clear-notifications');

        if (btn && dropdown) {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.classList.toggle('active');

                // Reset badge on open
                if (dropdown.classList.contains('active')) {
                    this.resetBadge();
                }
            });

            document.addEventListener('click', (e) => {
                if (!dropdown.contains(e.target) && !btn.contains(e.target)) {
                    dropdown.classList.remove('active');
                }
            });
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                const list = document.getElementById('notification-list');
                list.innerHTML = `
                    <div class="empty-state">
                        <i class="ph ph-bell-slash"></i>
                        <p>No new notifications</p>
                    </div>
                `;
                this.notificationCount = 0;
                this.updateBadge();
            });
        }
    },

    notificationCount: 0,

    addToNotificationCenter(title, source, type) {
        const list = document.getElementById('notification-list');
        const emptyState = list.querySelector('.empty-state');
        if (emptyState) emptyState.remove();

        const item = document.createElement('div');
        item.className = `notification-item ${type}`;
        item.innerHTML = `
            <i class="ph ${type === 'danger' ? 'ph-warning-octagon' : (type === 'warning' ? 'ph-warning' : 'ph-info')}"></i>
            <div class="notif-content">
                <h4>${title}</h4>
                <p>${source} · Just now</p>
            </div>
        `;

        list.prepend(item);

        // Increment badge if dropdown closed
        const dropdown = document.getElementById('notification-dropdown');
        if (!dropdown.classList.contains('active')) {
            this.notificationCount++;
            this.updateBadge();
        }
    },

    updateBadge() {
        const badge = document.getElementById('notification-badge');
        if (badge) {
            if (this.notificationCount > 0) {
                badge.style.display = 'flex';
                badge.innerText = this.notificationCount > 9 ? '9+' : this.notificationCount;
                badge.classList.add('pulse-badge'); // We can add animation if needed
            } else {
                badge.style.display = 'none';
            }
        }
    },

    resetBadge() {
        this.notificationCount = 0;
        this.updateBadge();
    },

    addAlert(title, source, type, listElement) {
        // UI Dashboard Alert List
        const item = document.createElement('div');
        item.className = `alert-item ${type}`;
        item.innerHTML = `
            <i class="ph ${type === 'danger' ? 'ph-warning-octagon' : 'ph-warning-circle'}"></i>
            <div class="alert-content">
                <h3>${title}</h3>
                <p>${source} · Just now</p>
            </div>
        `;
        listElement.prepend(item);

        // Add to Notification Center (Bell Icon)
        this.addToNotificationCenter(title, source, type);

        this.sendBackgroundNotification(title, source, type);
    },

    // Mock Email Service (Rate limited to avoid spamming toast)
    lastEmailTime: 0,

    sendEmailAlert(title, source, type) {
        const now = Date.now();
        if (now - this.lastEmailTime < 10000) return; // Limit to 1 email per 10s

        this.lastEmailTime = now;

        console.log(`[EmailService] Sending alert to ${CONFIG.emailAddress}: ${title}`);

        // Show a discrete toast to indicate "Email Sent" behavior
        const toast = document.createElement('div');
        toast.className = 'toast toast-success';
        toast.innerHTML = `<i class="ph ph-envelope-simple"></i> Email sent to ${CONFIG.emailAddress}`;
        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    animateValue(obj, start, end, duration) {
        if (start === end) return;
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);

            // Ease-out function
            const easeProgress = 1 - Math.pow(1 - progress, 3);

            const current = start + (end - start) * easeProgress;

            // Format: Int or Float based on string contents
            obj.innerText = Number.isInteger(end) ? Math.floor(current) : current.toFixed(1);

            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                obj.innerText = end;
            }
        };
        window.requestAnimationFrame(step);
    }
};

// Main Loop
const audio = new AudioController();
const dataService = new DataService();
window.sim = dataService;


// Load saved settings from localStorage on page load
function loadSavedSettings() {
    const savedMode = localStorage.getItem('forestGuard_connectionMode');
    if (savedMode) {
        CONFIG.useLiveData = savedMode === 'live';
        console.log(`Loaded connection mode: ${savedMode} (useLiveData: ${CONFIG.useLiveData})`);
    }

    const savedEndpoint = localStorage.getItem('forestGuard_apiEndpoint');
    if (savedEndpoint) {
        CONFIG.apiEndpoint = savedEndpoint;
        console.log(`Loaded API endpoint: ${savedEndpoint}`);
    }

    const savedPollingRate = localStorage.getItem('forestGuard_pollingRate');
    if (savedPollingRate) {
        CONFIG.refreshRate = parseInt(savedPollingRate);
        console.log(`Loaded polling rate: ${savedPollingRate}ms`);
    }
}

// Load settings immediately
loadSavedSettings();

document.addEventListener('DOMContentLoaded', () => {
    // Note: Audio context requires user interaction to start.
    // We bind it to any click for now, or the debug buttons will handle it.
    document.addEventListener('click', () => audio.ensureContext(), { once: true });

    UI.initNotifications();

    dataService.getSensorData().then(data => UI.updateDashboard(data));

    setInterval(async () => {
        const data = await dataService.getSensorData();
        UI.updateDashboard(data);
    }, CONFIG.refreshRate);
});

