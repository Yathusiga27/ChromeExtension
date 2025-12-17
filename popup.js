// Cache for available models
let availableModels = null;

// Main summarize function
document.getElementById('summarize').addEventListener('click', async () => {
  const resultDiv = document.getElementById('result');
  const loadingDiv = document.getElementById('loading');
  const summaryType = document.getElementById('summary-type').value;
  
  // Show loading
  resultDiv.innerHTML = '<div class="loading">Initializing AI service...</div>';
  loadingDiv.style.display = 'block';
  
  try {
    // Get API key
    const data = await chrome.storage.sync.get(['geminiApiKey']);
    
    if (!data.geminiApiKey) {
      throw new Error('API key not found. Please go to Settings and add your Gemini API key.');
    }
    
    // Get current tab and extract text
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Extract text from page
    const pageText = await extractPageText(tab.id);
    
    if (!pageText || pageText.length < 100) {
      throw new Error('Could not extract enough text from this page. Please make sure you are on an article or content page.');
    }
    
    console.log('Text extracted, length:', pageText.length);
    
    // Discover available models if not already cached
    if (!availableModels) {
      resultDiv.innerHTML = '<div class="loading">Discovering available AI models...</div>';
      availableModels = await discoverAvailableModels(data.geminiApiKey);
      
      if (availableModels.length === 0) {
        throw new Error('No AI models available. Please check your API key and try again.');
      }
      
      console.log('Available models:', availableModels);
    }
    
    // Generate summary using available models
    resultDiv.innerHTML = '<div class="loading">Generating summary... This may take 10-20 seconds.</div>';
    const summary = await generateSummaryWithAvailableModels(pageText, summaryType, data.geminiApiKey, availableModels);
    
    // Display result
    resultDiv.textContent = summary;
    resultDiv.className = 'success';
    
  } catch (error) {
    console.error('Error:', error);
    resultDiv.innerHTML = `
      <div class="error">
        <strong>Error:</strong> ${error.message}<br><br>
        <small>Please ensure your API key is valid and has access to Gemini API.</small>
      </div>
    `;
  } finally {
    loadingDiv.style.display = 'none';
  }
});

// Function to extract text from page
async function extractPageText(tabId) {
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: () => {
        // Try to find main content
        const contentSelectors = [
          'article',
          'main',
          '[role="main"]',
          '.post-content',
          '.article-content',
          '.entry-content',
          '.story-content',
          '.content',
          '#content',
          '.post',
          '.article',
          '.blog-post'
        ];
        
        for (const selector of contentSelectors) {
          const element = document.querySelector(selector);
          if (element && element.innerText.trim().length > 300) {
            return element.innerText.trim();
          }
        }
        
        // Fallback: Get text from paragraphs
        const paragraphs = Array.from(document.querySelectorAll('p'));
        const text = paragraphs
          .map(p => p.innerText.trim())
          .filter(text => text.length > 50)
          .join('\n\n');
        
        return text || document.body.innerText;
      }
    });
    
    return results[0].result || '';
  } catch (error) {
    console.error('Error extracting text:', error);
    return '';
  }
}

// Function to discover available models
async function discoverAvailableModels(apiKey) {
  try {
    // Try to list available models
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
    if (!response.ok) {
      // If listing fails, try common model names
      console.log('Model listing failed, trying common models...');
      return tryCommonModels(apiKey);
    }
    
    const data = await response.json();
    const models = data.models || [];
    
    // Filter models that support generateContent
    const availableModels = models
      .filter(model => model.supportedGenerationMethods && 
                      model.supportedGenerationMethods.includes('generateContent'))
      .map(model => model.name.split('/').pop()); // Extract just the model name
    
    console.log('Discovered models:', availableModels);
    
    // If no models found, try common ones
    if (availableModels.length === 0) {
      return tryCommonModels(apiKey);
    }
    
    return availableModels;
    
  } catch (error) {
    console.error('Error discovering models:', error);
    return tryCommonModels(apiKey);
  }
}

// Try common model names
async function tryCommonModels(apiKey) {
  const commonModels = [
    'gemini-1.5-flash-001',
    'gemini-1.5-pro-001',
    'gemini-1.5-flash-latest',
    'gemini-1.5-pro-latest',
    'gemini-pro',
    'gemini-1.0-pro'
  ];
  
  const workingModels = [];
  
  // Test each model with a simple request
  for (const model of commonModels) {
    try {
      const testResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Hello' }] }],
            generationConfig: { maxOutputTokens: 5 }
          })
        }
      );
      
      if (testResponse.ok) {
        workingModels.push(model);
        console.log(`Model ${model} is available`);
      }
    } catch (error) {
      // Model not available, continue to next
    }
  }
  
  return workingModels;
}

// Generate summary using available models
async function generateSummaryWithAvailableModels(text, summaryType, apiKey, models) {
  // Truncate text if too long
  const maxLength = 15000;
  const cleanText = text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  
  // Create prompt based on summary type
  let prompt;
  switch (summaryType) {
    case 'brief':
      prompt = `Provide a brief summary (2-3 sentences) of the following text:\n\n${cleanText}`;
      break;
    case 'detailed':
      prompt = `Provide a detailed summary of the following text, covering all main points:\n\n${cleanText}`;
      break;
    case 'bullets':
      prompt = `Summarize the following text in 5-7 bullet points:\n\n${cleanText}`;
      break;
    default:
      prompt = `Summarize the following text:\n\n${cleanText}`;
  }
  
  let lastError = null;
  
  // Try each available model
  for (const model of models) {
    try {
      console.log(`Trying model: ${model}`);
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 1000,
            }
          })
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        lastError = errorData.error?.message || `HTTP ${response.status}`;
        console.log(`Model ${model} failed:`, lastError);
        continue; // Try next model
      }
      
      const data = await response.json();
      const summary = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (summary) {
        console.log(`Success with model: ${model}`);
        return summary.trim();
      }
      
    } catch (error) {
      lastError = error.message;
      console.error(`Error with model ${model}:`, error);
      continue; // Try next model
    }
  }
  
  // If we get here, all models failed
  throw new Error(`Unable to generate summary. Please check: 1) Your API key is valid, 2) You have enabled the Gemini API, 3) You have available quota.`);
}

// Copy button
document.getElementById('copy-btn').addEventListener('click', async () => {
  const text = document.getElementById('result').innerText;
  
  if (text && !text.includes('Error:') && !text.includes('Initializing')) {
    try {
      await navigator.clipboard.writeText(text);
      const btn = document.getElementById('copy-btn');
      const originalText = btn.innerHTML;
      btn.innerHTML = '✓ Copied!';
      
      setTimeout(() => {
        btn.innerHTML = originalText;
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }
});

// Settings link
document.getElementById('settings-link').addEventListener('click', (e) => {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
});

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  const data = await chrome.storage.sync.get(['geminiApiKey']);
  const statusEl = document.getElementById('api-status');
  const statusDot = document.querySelector('.status');
  
  if (data.geminiApiKey) {
    statusEl.textContent = 'Ready - click Summarize';
    statusDot.className = 'status online';
  } else {
    statusEl.textContent = 'API key not set';
    statusDot.className = 'status offline';
    
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `
      <div class="error" style="margin: 20px; padding: 15px; border-radius: 8px; background: #fee; border: 1px solid #fcc;">
        <strong style="color: #c00;">Setup Required</strong><br><br>
        1. Get a free API key from <a href="https://aistudio.google.com/app/apikey" target="_blank" style="color: #06c; font-weight: bold;">Google AI Studio</a><br>
        2. Click <a href="#" id="setup-link" style="color: #06c; font-weight: bold;">Settings</a> to save your key<br>
        3. Start summarizing articles!
      </div>
    `;
    
    document.getElementById('setup-link').addEventListener('click', (e) => {
      e.preventDefault();
      chrome.runtime.openOptionsPage();
    });
  }
  
  // Refresh link
  document.getElementById('refresh-link').addEventListener('click', (e) => {
    e.preventDefault();
    // Clear model cache
    availableModels = null;
    // Reload
    location.reload();
  });
});