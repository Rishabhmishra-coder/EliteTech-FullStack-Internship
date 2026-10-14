# Task 4 — Chrome Extension for Time Tracking & Productivity Analytics

## Requirement

Develop a Chrome extension that tracks time spent on websites, stores user data through a backend, provides an analytics dashboard, classifies websites as productive/unproductive, and provides weekly productivity reporting.

## Architecture

- **Extension:** Manifest V3 service worker.
- **Tracking:** active tab + tab activation + alarms + extension storage.
- **Backend:** Node.js + Express.
- **Database:** MongoDB through Mongoose.
- **Dashboard:** responsive HTML/CSS/JS dashboard.

The extension records the hostname rather than full page URLs to reduce unnecessary data collection.

## Run backend

```bash
cd server
npm install
npm start
```

Dashboard: `http://localhost:3004`

## Configure extension

If your backend runs somewhere other than `http://localhost:3004`, edit `extension/config.js`.

Then in Chrome:

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Choose **Load unpacked**.
4. Select the `extension` folder.
5. Browse normally. The extension will aggregate active-host time and send it to the backend.

## Classification

The included classifier uses a small editable hostname list. Add or remove domains in `extension/classifier.js` for the user's context.

## Privacy note

The implementation stores hostname + duration + classification. It does not store page contents.
