# ForestGuard 🔥🌲

**A state-of-the-art fire and weather monitoring system with real-time alerts, analytics, and ESP8266 IoT integration.**

![ForestGuard Dashboard](./public/dashboard.png)


## ✨ Features


### 🎯 Core Functionality
- **Real-time Monitoring**: Live temperature, humidity, wind speed, and air quality tracking
- **Fire Risk Analysis**: Intelligent risk calculation based on environmental conditions
- **Alert System**: Automated warnings with visual and audio notifications
- **Historical Analytics**: Trend analysis with 7/30/90-day views and CSV export
- **Interactive Maps**: Leaflet.js powered sensor location tracking
- **PDF Reports**: Generate comprehensive reports with custom date ranges
- **ESP8266 Ready**: Seamless integration with IoT sensors

### 🎨 Design & UX
- **Glassmorphic UI**: Modern dark theme with blur effects
- **Expert Animations**: Staggered entry, radar scan, smooth transitions
- **Mobile-First**: Fully responsive with touch-optimized controls
- **Procedural Audio**: Web Audio API generated sirens and storm sounds
- **Accessibility**: WCAG compliant with keyboard navigation

### 📱 Pages
1. **Dashboard** - Real-time monitoring overview
2. **Analytics** - Historical data trends and insights
3. **Map View** - Interactive sensor locations
4. **Alerts** - Filterable alert history timeline
5. **Settings** - Configuration and ESP8266 setup
6. **Reports** - PDF generation and export


## 🔌 ESP8266 Integration


### Hardware Setup
1. Connect DHT22 (temperature/humidity) to GPIO4
2. Connect MQ-2 (smoke/gas) to A0
3. Connect anemometer to GPIO5

### Firmware Configuration
```cpp
// ESP8266 should send JSON to /data endpoint:
{
  "temperature": 24.5,
  "humidity": 45,
  "windSpeed": 12.3,
  "gasLevel": 350,
  "smokeDetected": false
}
```

### Web App Configuration
1. Navigate to **Settings** page
2. Switch to "Live ESP8266" mode
3. Enter your ESP8266 IP address (e.g., `http://192.168.1.100/data`)
4. Set polling rate (default: 3 seconds)
5. Click "Save Connection Settings"

## 📖 Usage

### Simulated Mode (Default)
The app runs in simulation mode by default, generating realistic sensor data for testing and demonstration.

### Debug Controls
Use the floating debug panel to test emergency scenarios:
- 🔥 **Trigger Fire**: Simulates critical fire conditions
- 🌪️ **Trigger Storm**: Simulates severe weather
- 🔄 **Reset System**: Returns to normal simulation

### Exporting Data
- **Analytics Page**: Click "Export CSV" to download historical data
- **Reports Page**: Generate PDF reports with custom date ranges

## 🛠️ Technology Stack

### Core Technologies
- **HTML5** - Semantic structure
- **CSS3** - Glassmorphic design with animations
- **Vanilla JavaScript** - No framework dependencies

### Libraries (Open Source)
- [Chart.js](https://www.chartjs.org/) (MIT) - Data visualization
- [Leaflet.js](https://leafletjs.com/) (BSD-2-Clause) - Interactive maps
- [jsPDF](https://github.com/parallax/jsPDF) (MIT) - PDF generation
- [Phosphor Icons](https://phosphoricons.com/) (MIT) - Icon library

## 📁 Project Structure

```
forestguard/
├── index.html              # Main HTML file
├── style.css               # Core styles
├── script.js               # Main application logic
├── css/
│   ├── shared.css          # Shared utilities
│   └── pages.css           # Page-specific styles
├── js/
│   ├── router.js           # SPA routing
│   └── pages/
│       ├── dashboard.js    # Dashboard page
│       ├── analytics.js    # Analytics page
│       ├── map-view.js     # Map view page
│       ├── alerts.js       # Alerts page
│       ├── settings.js     # Settings page
│       └── reports.js      # Reports page
├── README.md
├── LICENSE
└── CONTRIBUTING.md
```

## 🎨 Customization

### Changing Thresholds
Edit `script.js`:
```javascript
const CONFIG = {
    riskThresholds: {
        moderate: 40,  // Moderate risk starts at 40%
        high: 75,      // High risk starts at 70%
        extreme: 90    // Extreme risk starts at 90%
    }
};
```

### Color Scheme
Edit `style.css`:
```css
:root {
    --primary-accent: #3b82f6;  /* Blue */
    --danger-accent: #ff3131ff;   /* Red */
    --warning-accent: #f59e0b;  /* Amber */
    --success-accent: #0ac156ff;  /* Green */
}
```

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenStreetMap contributors for map tiles
- Chart.js team for visualization library
- Leaflet.js team for mapping library
- Phosphor Icons for the beautiful icon set

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/forestguard/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/forestguard/discussions)
- **Email**: support@forestguard.example.com

## 🗺️ Roadmap

- [ ] WebSocket support for real-time updates
- [ ] Multi-sensor network support
- [ ] Machine learning fire prediction
- [ ] Mobile app (React Native)
- [ ] Cloud data storage integration
- [ ] Email/SMS alert notifications

---

**Made with ❤️ for forest conservation and safety**
