/**
 * Background script for FlowAutomate Extension
 */

chrome.runtime.onInstalled.addListener(() => {
  console.log("FlowAutomate Extension Installed.");
});

// Listener for connection and messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "ping") {
    sendResponse({ status: "alive" });
  }
  return true;
});
