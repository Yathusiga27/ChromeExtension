# AI Article Summarizer Chrome Extension

A Chrome extension that uses Google's Gemini AI to summarize articles and web pages.

## 🚀 Features

- **Three summary types**: Brief, Detailed, and Bullet Points
- **One-click summarization**: Summarize any article with a single click
- **Copy to clipboard**: Easily copy summaries for sharing
- **Secure API storage**: Your API key is stored locally in Chrome
- **Works on most websites**: Extracts content from articles, blogs, news sites

## 📦 Installation

### Method 1: Load as Unpacked Extension (Development)

1. **Download or clone** this repository to your computer
2. **Open Chrome** and go to `chrome://extensions/`
3. **Enable Developer Mode** (toggle in top right corner)
4. **Click "Load unpacked"** button
5. **Select the folder** containing the extension files
6. The extension will appear in your Chrome toolbar

### Method 2: Manual File Setup

If you're creating from scratch:

1. Create a new folder named `ai-summarizer`
2. Add these 7 files to the folder:
   - `manifest.json`
   - `popup.html`
   - `popup.js`
   - `options.html`
   - `options.js`
   - `background.js`
   - `icon.png` (optional: any 128x128 image)
3. Follow Method 1 steps above

## 🔑 API Key Setup

**Before using the extension, you need a Gemini API key:**

1. **Get a free API key** from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. **Sign in** with your Google account
3. **Click "Create API Key"** → "Create API key in new project"
4. **Copy** the generated API key (starts with `AIza`)
5. **Configure the extension**:
   - Click the extension icon in Chrome toolbar
   - Click "Settings"
   - Paste your API key
   - Click "Save Settings"

## 🎯 How to Use

1. **Navigate** to any article or webpage you want to summarize
2. **Click** the AI Summarizer icon in Chrome toolbar
3. **Select** your preferred summary type:
   - **Brief**: 2-3 sentence summary
   - **Detailed**: Comprehensive summary
   - **Bullet Points**: Key points as bullets
4. **Click "Summarize"** and wait 10-20 seconds
5. **Copy** the summary using the "Copy" button

## 📁 File Structure
ai-summarizer/
├── manifest.json # Extension configuration
├── popup.html # Main popup interface
├── popup.js # Popup functionality
├── options.html # Settings page
├── options.js # Settings functionality
├── background.js # Background script
├── icon.png # Extension icon (128x128)
└── README.md # This file                      


## ⚙️ Technical Requirements

- **Chrome 88+** or **Edge 88+** (Chromium-based browsers)
- **Active internet connection** (for API calls)
- **Google account** (for API key)
- **"Scripting" permission** (automatically granted)

## 🔧 Troubleshooting

### Common Issues:

1. **"API key not found" error**
   - Go to Settings and save your API key again
   - Make sure you're using a valid Gemini API key

2. **"Could not extract text" error**
   - Refresh the page and try again
   - Try a different article or website
   - Some sites may block content extraction

3. **"Model not found" error**
   - The extension will automatically try different models
   - Wait a moment and try again
   - Ensure your API key has access to Gemini API

4. **Extension not appearing**
   - Restart Chrome
   - Re-load the extension from `chrome://extensions/`
   - Check for errors in Chrome's extension console

### Debugging:
- Press `F12` to open Developer Tools while the popup is open
- Check the Console tab for error messages
- Verify your API key is correctly saved in Settings

## 🔒 Privacy & Security

- **Your API key** is stored locally in Chrome's sync storage
- **No data is sent** to any servers except Google's Gemini API
- **Only the webpage text** you're summarizing is sent to Google
- **No tracking** or analytics are included

## 📝 Notes

- **Free tier**: Google AI Studio offers free API credits for new users
- **Rate limits**: Free tier has usage limits; check Google AI Studio for details
- **Best results**: Works best with articles, news, blogs, and content-heavy pages
- **Not supported**: PDFs, videos, or paywalled content may not work well

## 🤝 Contributing

Found a bug or have a feature request?
1. Check existing issues
2. Create a new issue with details
3. Or submit a pull request

## 📄 License

This project is provided as-is for educational and personal use.

## 🙏 Credits

- Uses Google's [Gemini API](https://ai.google.dev/)
- Icons from [Material Design](https://material.io/resources/icons/)
- Built for Chrome Extensions Manifest V3

---

**Need help?** Create an issue or check the [Google AI Studio documentation](https://ai.google.dev/docs)
