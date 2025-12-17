// Background script for extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('AI Summarizer extension installed');
  
  // Open options page on first install
  chrome.storage.sync.get(['geminiApiKey'], (data) => {
    if (!data.geminiApiKey) {
      setTimeout(() => {
        chrome.runtime.openOptionsPage();
      }, 1000);
    }
  });
});

// Optional: Add context menu for quick access
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'summarizePage',
    title: 'Summarize this page with AI',
    contexts: ['page']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'summarizePage') {
    chrome.action.openPopup();
  }
});