/**
 * ForestGuard - Main Controller
 * Handles data fetching (Mock/Live), UI updates, and Chart rendering.
 */

// Configuration
const CONFIG = {
    useLiveData: false,             // Set to true to fetch from APIEndpoint
    apiEndpoint: 'http://192.168.1.100/data', // Example ESP8266 local IP or Cloud URL
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
        this.stopAll(); // Clear previous sounds
        this.ensureContext();

        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(400, this.ctx.currentTime);
        // Modulate pitch for siren effect (400Hz -> 800Hz -> 400Hz)
        osc.frequency.linearRampToValueAtTime(800, this.ctx.currentTime + 1);
        osc.frequency.linearRampToValueAtTime(400, this.ctx.currentTime + 2);

        // Loop the modulation using LFO
        const lfo = this.ctx.createOscillator();
        lfo.type = 'triangle';
        lfo.frequency.value = 0.5; // 0.5Hz = 2 seconds period
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.value = 200; // Modulate by +/- 200Hz

        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        osc.frequency.value = 600; // Center freq

        gainNode.gain.setValueAtTime(0.05, this.ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, this.ctx.currentTime + 0.5);

        osc.connect(gainNode);
        gainNode.connect(this.masterGain);

        osc.start();
        lfo.start();

        this.activeOscillators.push(osc, lfo);
    }

    playStorm() {
        this.stopAll();
        this.ensureContext();

        // Pink Noise for wind/storm
        const bufferSize = 2 * this.ctx.sampleRate;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let lastOut = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            output[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = output[i];
            output[i] *= 3.5;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        noise.loop = true;

        // Lowpass filter for deep wind sound
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 400;

        // Randomly modulate filter frequency for "gusts"
        const lfo = this.ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.2;
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.value = 300;

        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);

        const gainNode = this.ctx.createGain();
        gainNode.gain.value = 0.15;

        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.masterGain);

        noise.start();
        lfo.start();

        this.activeOscillators.push(noise, lfo);
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
    }

    async getSensorData() {
        // Check for manual overrides first
        if (this.overrideMode) {
            return this.getOverrideData();
        }

        if (CONFIG.useLiveData) {
            try {
                const response = await fetch(CONFIG.apiEndpoint);
                const data = await response.json();
                return this.processData(data);
            } catch (e) {
                console.error("Connection failed, falling back to simulation", e);
                return this.simulateDataWithPersistence();
            }
        } else {
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

    // Generate realistic fluctuating data
    simulateData() {
        const now = new Date();
        // Base values with random fluctuation
        const temp = 25 + Math.random() * 5 - 2.5; // 22.5 - 27.5 range
        const humidity = 45 + Math.random() * 10 - 5; // 40 - 50 range
        const wind = 12 + Math.random() * 8; // 12 - 20 km/h
        const gas = 350 + Math.random() * 50; // CO2 ppm

        return {
            timestamp: now.toISOString(),
            temperature: parseFloat(temp.toFixed(1)),
            humidity: Math.floor(humidity),
            windSpeed: parseFloat(wind.toFixed(1)),
            gasLevel: Math.floor(gas),
            // Fire sensors (digital)
            smokeDetected: Math.random() > 0.98, // Rare random smoke event
        };
    }

    async processData(data) {
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

            // Auto-dismiss overlay but keep alert state
            this.overlayTimeout = setTimeout(() => {
                overlay.classList.remove('active');
            }, 4000);

        } else {
            audio.stopAll();
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

    addAlert(title, source, type, listElement) {
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

document.addEventListener('DOMContentLoaded', () => {
    // Note: Audio context requires user interaction to start.
    // We bind it to any click for now, or the debug buttons will handle it.
    document.addEventListener('click', () => audio.ensureContext(), { once: true });



    dataService.getSensorData().then(data => UI.updateDashboard(data));

    setInterval(async () => {
        const data = await dataService.getSensorData();
        UI.updateDashboard(data);
    }, CONFIG.refreshRate);
});
