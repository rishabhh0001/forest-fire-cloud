/**
 * Map View Page - Interactive sensor map
 */

async function renderMapView() {
    const container = document.getElementById('page-container');

    container.innerHTML = `
        <div class="page-header">
            <h1>Sensor Map</h1>
            <p>Real-time sensor locations and status</p>
        </div>

        <div class="map-view-container">
            <div class="map-controls">
                <button class="map-control-btn" id="zoom-in">
                    <i class="ph ph-plus"></i>
                </button>
                <button class="map-control-btn" id="zoom-out">
                    <i class="ph ph-minus"></i>
                </button>
                <button class="map-control-btn" id="reset-view">
                    <i class="ph ph-arrows-out"></i>
                </button>
            </div>
            
            <div id="leaflet-map" class="fullscreen-map"></div>
            
            <div class="map-legend">
                <div class="legend-item">
                    <span class="legend-dot" style="background: #10b981;"></span>
                    <span>Normal</span>
                </div>
                <div class="legend-item">
                    <span class="legend-dot" style="background: #f59e0b;"></span>
                    <span>Warning</span>
                </div>
                <div class="legend-item">
                    <span class="legend-dot" style="background: #ef4444;"></span>
                    <span>Critical</span>
                </div>
            </div>
        </div>

        <div class="sensor-list-card card">
            <div class="card-header">
                <h2>Active Sensors</h2>
                <span class="sensor-count">3 Online</span>
            </div>
            <div class="sensor-list">
                <div class="sensor-item" data-sensor="1">
                    <div class="sensor-status status-normal"></div>
                    <div class="sensor-info">
                        <h3>Sensor Array 1</h3>
                        <p>Forest Zone A • 24.5°C • 45% Humidity</p>
                    </div>
                    <i class="ph ph-caret-right"></i>
                </div>
                <div class="sensor-item" data-sensor="2">
                    <div class="sensor-status status-warning"></div>
                    <div class="sensor-info">
                        <h3>Sensor Array 2</h3>
                        <p>Forest Zone B • 32.1°C • 28% Humidity</p>
                    </div>
                    <i class="ph ph-caret-right"></i>
                </div>
                <div class="sensor-item" data-sensor="3">
                    <div class="sensor-status status-critical"></div>
                    <div class="sensor-info">
                        <h3>Sensor Array 3</h3>
                        <p>Forest Zone C • 34.8°C • 52% Humidity</p>
                    </div>
                    <i class="ph ph-caret-right"></i>
                </div>
            </div>
        </div>
    `;

    initializeMap();
}

function initializeMap() {
    // Initialize Leaflet map
    const map = L.map('leaflet-map').setView([28.526455, 77.574276], 16);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19
    }).addTo(map);

    // Add sensor markers
    const sensors = [
        { id: 1, lat: 28.527577, lng: 77.575765, status: 'normal', name: 'Sensor Array 1' },
        { id: 2, lat: 28.526361, lng: 77.575937, status: 'warning', name: 'Sensor Array 2' },
        { id: 3, lat: 28.525871, lng: 77.572525, status: 'critical', name: 'Sensor Array 3' }
    ];

    sensors.forEach(sensor => {
        const color = sensor.status === 'normal' ? '#10b981' : sensor.status === 'warning' ? '#f59e0b' :  '#ef4444';

        const marker = L.circleMarker([sensor.lat, sensor.lng], {
            radius: 10,
            fillColor: color,
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
        }).addTo(map);

        marker.bindPopup(`
            <div class="map-popup">
                <h3>${sensor.name}</h3>
                <p>Status: ${sensor.status.toUpperCase()}</p>
                <p>Last Update: Just now</p>
            </div>
        `);

        // Pulse animation
        setInterval(() => {
            marker.setRadius(marker.getRadius() === 8 ? 12 : 8);
        }, 1000);
    });

    // Map controls
    document.getElementById('zoom-in').addEventListener('click', () => map.zoomIn());
    document.getElementById('zoom-out').addEventListener('click', () => map.zoomOut());
    document.getElementById('reset-view').addEventListener('click', () => map.setView([28.526455, 77.574276], 16));

    // Sensor list interactions
    document.querySelectorAll('.sensor-item').forEach(item => {
        item.addEventListener('click', () => {
            const sensorId = parseInt(item.dataset.sensor);
            const sensor = sensors.find(s => s.id === sensorId);
            if (sensor) {
                map.setView([sensor.lat, sensor.lng], 15);
            }
        });
    });
    // Heatmap Layer (Simulated Fire Risk)
    // Points: [lat, lng, intensity]
    const heatPoints = [
        [28.527577, 77.575765, 0.5], // Sensor 1
        [28.526361, 77.575937, 0.8], // Sensor 2 (Warning)
        [28.525871, 77.572525, 0.2], // Sensor 3
        // Random Hotspots
        [28.526591, 77.574875, 1.0],
        [28.526001, 77.573685, 1.4]
    ];

    if (L.heatLayer) {
        const heat = L.heatLayer(heatPoints, {
            radius: 25,
            blur: 15,
            maxZoom: 17,
            gradient: { 0.3: 'blue', 0.6: 'lime', 1: 'red' }
        }).addTo(map);
    }
}
