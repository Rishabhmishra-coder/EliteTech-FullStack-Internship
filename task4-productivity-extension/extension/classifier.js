// Small, transparent classification list. Extend this for your own workflow.
const PRODUCTIVE_HOSTS = new Set([
  'github.com','gitlab.com','stackoverflow.com','developer.mozilla.org','developer.chrome.com',
  'leetcode.com','codeforces.com','colab.research.google.com','docs.google.com','notion.so'
]);
const UNPRODUCTIVE_HOSTS = new Set([
  'facebook.com','instagram.com','x.com','twitter.com','tiktok.com','reddit.com','netflix.com'
]);
function classifyHostname(hostname) {
  const host = hostname.replace(/^www\./,'').toLowerCase();
  if (PRODUCTIVE_HOSTS.has(host)) return 'productive';
  if (UNPRODUCTIVE_HOSTS.has(host)) return 'unproductive';
  return 'neutral';
}
