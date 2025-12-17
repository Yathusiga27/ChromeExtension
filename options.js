document.addEventListener('DOMContentLoaded', async () => {
  // Load saved API key
  const data = await chrome.storage.sync.get(['geminiApiKey']);
  const apiKeyInput = document.getElementById('api-key');
  
  if (data.geminiApiKey) {
    apiKeyInput.value = data.geminiApiKey;
  }
  
  // Save button
  document.getElementById('save-btn').addEventListener('click', async () => {
    const apiKey = apiKeyInput.value.trim();
    const messageDiv = document.getElementById('message');
    
    if (!apiKey) {
      showMessage('Please enter an API key', 'error');
      return;
    }
    
    // Basic validation
    if (apiKey.length < 30) {
      showMessage('API key seems too short. Please check your key.', 'error');
      return;
    }
    
    try {
      // First, test the API key
      showMessage('Testing API key...', '');
      
      // Test with a simple request
      const testResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        }
      );
      
      if (!testResponse.ok) {
        const error = await testResponse.json().catch(() => ({}));
        throw new Error(error.error?.message || 'Invalid API key');
      }
      
      // Save the key
      await chrome.storage.sync.set({ geminiApiKey: apiKey });
      
      showMessage('✅ API key saved and verified! You can now use the summarizer.', 'success');
      
      // Auto-close after 2 seconds
      setTimeout(() => {
        window.close();
      }, 2000);
      
    } catch (error) {
      let errorMsg = error.message;
      
      // User-friendly error messages
      if (errorMsg.includes('API key not valid') || errorMsg.includes('invalid API key')) {
        errorMsg = 'Invalid API key. Please check and try again.';
      } else if (errorMsg.includes('quota')) {
        errorMsg = 'API quota exceeded or billing not set up. Please check your Google AI Studio account.';
      } else if (errorMsg.includes('permission')) {
        errorMsg = 'Permission denied. Please ensure the Gemini API is enabled in Google Cloud Console.';
      }
      
      showMessage(`❌ ${errorMsg}`, 'error');
    }
  });
  
  // Test API button
  document.getElementById('test-btn').addEventListener('click', async () => {
    const apiKey = apiKeyInput.value.trim();
    const testResult = document.getElementById('test-result');
    
    if (!apiKey) {
      showMessage(testResult, 'Please enter an API key first', 'error');
      return;
    }
    
    showMessage(testResult, '🔍 Testing connection to Gemini API...', '');
    
    try {
      // First, try to list models
      const listResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        }
      );
      
      if (!listResponse.ok) {
        const error = await listResponse.json();
        throw new Error(error.error?.message || 'Cannot list models');
      }
      
      const modelData = await listResponse.json();
      const models = modelData.models || [];
      
      // Try to find a model that supports generateContent
      const availableModels = models
        .filter(model => model.supportedGenerationMethods && 
                        model.supportedGenerationMethods.includes('generateContent'))
        .map(model => model.name.split('/').pop());
      
      if (availableModels.length === 0) {
        throw new Error('No models found that support text generation');
      }
      
      showMessage(testResult, `✅ Connection successful! Available models: ${availableModels.join(', ')}`, 'success');
      
    } catch (error) {
      let errorMsg = error.message;
      
      // User-friendly error messages
      if (errorMsg.includes('API key not valid')) {
        errorMsg = 'Invalid API key. Please check and try again.';
      } else if (errorMsg.includes('quota')) {
        errorMsg = 'API quota exceeded. Please check your Google AI Studio billing.';
      } else if (errorMsg.includes('permission')) {
        errorMsg = 'Permission denied. Please ensure the Gemini API is enabled.';
      }
      
      showMessage(testResult, `❌ Connection failed: ${errorMsg}`, 'error');
    }
  });
});

function showMessage(element, text, type) {
  if (typeof element === 'string') {
    element = document.getElementById(element);
  }
  
  element.textContent = text;
  element.className = `message ${type}`;
  element.style.display = 'block';
  
  // Auto-hide success messages after 5 seconds
  if (type === 'success') {
    setTimeout(() => {
      element.style.display = 'none';
    }, 5000);
  }
}