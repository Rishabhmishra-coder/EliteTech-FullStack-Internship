# Task 1 — API Integration

## Requirement

Build a webpage that fetches and displays data from a public API. This implementation uses Open-Meteo for city search and weather data.

## Features

- City search through the Open-Meteo geocoding API.
- Current temperature, apparent temperature, humidity, wind speed and weather condition.
- Five-day forecast cards.
- Responsive layout for desktop/mobile.
- Loading and error states.
- No API key required for the public non-commercial endpoint.

## Run

This task is a static webpage. Open `public/index.html` in a browser, or serve the folder with any static HTTP server.

Example:

```bash
npx serve public
```

## API endpoints

- Geocoding: `https://geocoding-api.open-meteo.com/v1/search`
- Forecast: `https://api.open-meteo.com/v1/forecast`
