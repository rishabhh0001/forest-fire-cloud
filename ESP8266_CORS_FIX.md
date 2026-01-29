# ESP8266 CORS Configuration Guide

## Problem
Your HTTPS website (`https://forestguard.rishabhj.in`) cannot access the ESP8266 HTTP endpoint (`http://192.168.4.1/readings`) due to:
1. **CORS Policy** - Cross-Origin Resource Sharing is blocked
2. **Mixed Content** - HTTPS pages cannot fetch HTTP resources

## Solution: Add CORS Headers to ESP8266

### Arduino/ESP8266 Code Fix

Add these CORS headers to your ESP8266 web server code:

```cpp
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>

ESP8266WebServer server(80);

void setup() {
  Serial.begin(115200);
  
  // Your WiFi setup code here...
  
  // Configure the /readings endpoint with CORS
  server.on("/readings", HTTP_GET, handleReadings);
  server.on("/readings", HTTP_OPTIONS, handleCORS);  // Handle preflight
  
  server.begin();
}

void handleCORS() {
  // Send CORS headers for preflight request
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
  server.send(204);  // No content
}

void handleReadings() {
  // Add CORS headers to allow cross-origin requests
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
  
  // Read your sensor data
  float temperature = readTemperature();  // Your function
  float humidity = readHumidity();        // Your function
  float windSpeed = readWindSpeed();      // Your function
  int gasLevel = readGasLevel();          // Your function
  bool smokeDetected = readSmoke();       // Your function
  
  // Create JSON response
  String json = "{";
  json += "\"temperature\":" + String(temperature, 1) + ",";
  json += "\"humidity\":" + String(humidity, 0) + ",";
  json += "\"windSpeed\":" + String(windSpeed, 1) + ",";
  json += "\"gasLevel\":" + String(gasLevel) + ",";
  json += "\"smokeDetected\":" + String(smokeDetected ? "true" : "false") + ",";
  json += "\"timestamp\":\"" + getTimestamp() + "\"";  // Your timestamp function
  json += "}";
  
  // Send JSON response
  server.send(200, "application/json", json);
}

void loop() {
  server.handleClient();
}
```

## Alternative: Test Locally First

If you want to test without CORS issues:

### Option 1: Open Local File
Simply open the file directly in your browser:
```
file:///c:/Users/risha/forest-fire-cloud/index.html
```

### Option 2: Run Local HTTP Server
```bash
# In your project directory
python -m http.server 8000
```
Then access: `http://localhost:8000`

This avoids HTTPS→HTTP mixed content issues.

## Expected JSON Format

Make sure your ESP8266 returns data in this format:

```json
{
  "temperature": 25.5,
  "humidity": 45,
  "windSpeed": 12.3,
  "gasLevel": 420,
  "smokeDetected": false,
  "timestamp": "2026-01-29T10:30:00Z"
}
```

## Testing the Fix

1. Upload the updated code to your ESP8266
2. Connect to the ESP8266 WiFi network
3. Open your ForestGuard app (HTTPS or local)
4. Go to Settings → Click "Test Connection"
5. You should see a green "Connected" status

## Troubleshooting

- **Still getting CORS errors?** Make sure the CORS headers are sent with EVERY response
- **404 errors?** Verify the endpoint is `/readings` not `/data`
- **Can't connect?** Ensure you're connected to the ESP8266 WiFi network (192.168.4.1)
