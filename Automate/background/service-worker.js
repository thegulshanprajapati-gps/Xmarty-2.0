/**
 * Background Service Worker for FlowAutomate Extension (Manifest V3)
 */
chrome.runtime.onInstalled.addListener(() => {
  console.log("FlowAutomate background service worker active.");
});

// Simple heartbeat listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "ping") {
    sendResponse({ status: "alive" });
  }
  return true;
});
