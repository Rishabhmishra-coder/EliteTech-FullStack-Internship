importScripts('config.js', 'classifier.js');

const ALARM = 'productivity-tick';
const USER_KEY = 'trackerUserId';
const STATE_KEY = 'activeTrackingState';

async function getState() {
  const result = await chrome.storage.local.get(STATE_KEY);
  return result[STATE_KEY] || null;
}
async function setState(state) { await chrome.storage.local.set({ [STATE_KEY]: state }); }
async function userId() {
  const result = await chrome.storage.local.get(USER_KEY);
  if (result[USER_KEY]) return result[USER_KEY];
  const id = crypto.randomUUID();
  await chrome.storage.local.set({ [USER_KEY]: id });
  return id;
}

async function activeTab() {
  const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  return tabs[0];
}

function hostnameFromUrl(url) {
  try { return new URL(url).hostname; } catch { return null; }
}

async function sendElapsed(state, endTime) {
  if (!state?.hostname || !state.startedAt) return;
  const seconds = Math.floor((endTime - state.startedAt) / 1000);
  if (seconds <= 0) return;
  await fetch(`${API_BASE}/api/time-sessions`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: await userId(), hostname: state.hostname, category: classifyHostname(state.hostname), seconds, startedAt: new Date(state.startedAt).toISOString() })
  }).catch(() => {}); // Keep tracking locally when the backend is temporarily unavailable.
}

async function switchTracking(tab) {
  const now = Date.now();
  const old = await getState();
  if (old) await sendElapsed(old, now);
  const hostname = tab ? hostnameFromUrl(tab.url || '') : null;
  if (!hostname || ['chrome:', 'edge:', 'about:'].some(p => (tab.url || '').startsWith(p))) {
    await setState(null);
    return;
  }
  await setState({ hostname, startedAt: now, title: tab.title || '' });
}

chrome.runtime.onInstalled.addListener(async () => {
  await chrome.alarms.create(ALARM, { periodInMinutes: 1 });
  await switchTracking(await activeTab());
});
chrome.runtime.onStartup.addListener(async () => {
  await chrome.alarms.create(ALARM, { periodInMinutes: 1 });
  await switchTracking(await activeTab());
});
chrome.tabs.onActivated.addListener(async ({ tabId }) => { try { await switchTracking(await chrome.tabs.get(tabId)); } catch {} });
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => { if (tab.active && changeInfo.url) await switchTracking(tab); });
chrome.windows.onFocusChanged.addListener(async () => { await switchTracking(await activeTab()); });
chrome.alarms.onAlarm.addListener(async alarm => { if (alarm.name !== ALARM) return; const state = await getState(); if (state) { await sendElapsed(state, Date.now()); state.startedAt = Date.now(); await setState(state); } });
