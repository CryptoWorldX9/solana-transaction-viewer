// Chatbot configuration
const OPENAI_API_KEY = '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'; // Your OpenAI API key
const API_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

// DOM Elements
let chatToggle;
let chatbotContainer;
let chatMessages;
let chatInput;
let sendMessage;
let minimizeChat;

// Chat state
let chatHistory = [
  { role: "system", content: "You are a virtual assistant specialized in cryptocurrencies, blockchain, and Solana. Provide concise and helpful answers in English." }
];
let isChatOpen = false;

// Initialize the chatbot
function initChatbot() {
  // Create chatbot HTML structure
  createChatbotHTML();
  
  // Get DOM elements
  chatToggle = document.getElementById('chatToggle');
  chatbotContainer = document.getElementById('chatbotContainer');
  chatMessages = document.getElementById('chatMessages');
  chatInput = document.getElementById('chatInput');
  sendMessage = document.getElementById('sendMessage');
  minimizeChat = document.querySelector('.minimize-chat');
  
  // Event for opening/closing the chat
  chatToggle.addEventListener('click', toggleChat);
  
  // Event for minimizing the chat
  minimizeChat.addEventListener('click', toggleChat);
  
  // Event for sending message
  sendMessage.addEventListener('click', handleSendMessage);
  
  // Send message with Enter
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  });
}

// Create chatbot HTML structure
function createChatbotHTML() {
  // Create chatbot container
  const chatbotHTML = `
    <div class="chatbot-container" id="chatbotContainer">
      <div class="chatbot-header">
        <h3>AI Assistant</h3>
        <button class="minimize-chat"><i class="fas fa-minus"></i></button>
      </div>
      <div class="chat-messages" id="chatMessages">
        <div class="message bot">
          <div class="message-content">
            Hello, I'm your virtual assistant. How can I help you today?
          </div>
        </div>
      </div>
      <div class="chat-input">
        <input type="text" id="chatInput" placeholder="Type your question here...">
        <button id="sendMessage">Send</button>
      </div>
    </div>

    <button class="chat-toggle" id="chatToggle">
      <span>Chat</span>
    </button>
  `;
  
  // Add chatbot HTML to the body
  document.body.insertAdjacentHTML('beforeend', chatbotHTML);
  
  // Add Font Awesome for icons
  if (!document.querySelector('link[href*="font-awesome"]')) {
    const fontAwesome = document.createElement('link');
    fontAwesome.rel = 'stylesheet';
    fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
    document.head.appendChild(fontAwesome);
  }
  
  // Add chatbot styles
  addChatbotStyles();
}

// Add chatbot styles
function addChatbotStyles() {
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    /* Chatbot Styles */
    .chatbot-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 350px;
      height: 450px;
      background-color: white;
      border-radius: 10px;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
      display: flex;
      flex-direction: column;
      z-index: 1000;
      transform: translateY(calc(100% + 20px));
      transition: transform 0.3s ease;
      border: 1px solid #ddd;
    }

    .chatbot-container.open {
      transform: translateY(0);
    }

    .chatbot-header {
      padding: 15px;
      background: linear-gradient(90deg, #4b6cb7, #182848);
      color: white;
      border-radius: 10px 10px 0 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .chatbot-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }

    .minimize-chat {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      font-size: 16px;
    }

    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 15px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      background-color: #f5f7fa;
    }

    .message {
      display: flex;
      max-width: 80%;
    }

    .message.user {
      align-self: flex-end;
    }

    .message.bot {
      align-self: flex-start;
    }

    .message-content {
      padding: 10px 12px;
      border-radius: 16px;
      font-size: 14px;
      line-height: 1.4;
    }

    .message.user .message-content {
      background-color: #4b6cb7;
      color: white;
    }

    .message.bot .message-content {
      background-color: #e9ecef;
      color: #333;
    }

    .chat-input {
      display: flex;
      padding: 10px;
      background-color: white;
      border-top: 1px solid #ddd;
    }

    .chat-input input {
      flex: 1;
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 5px 0 0 5px;
      font-size: 14px;
    }

    .chat-input button {
      padding: 10px 15px;
      background-color: #4b6cb7;
      color: white;
      border: none;
      border-radius: 0 5px 5px 0;
      cursor: pointer;
    }

    .chat-input button:hover {
      background-color: #182848;
    }

    .chat-toggle {
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 10px 20px;
      border-radius: 30px;
      background: linear-gradient(90deg, #4b6cb7, #182848);
      color: white;
      border: none;
      font-size: 16px;
      cursor: pointer;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
      z-index: 999;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    }

    .chat-toggle:hover {
      transform: scale(1.05);
    }

    .chat-toggle.hidden {
      display: none;
    }

    .chat-loader {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 3px solid rgba(75, 108, 183, 0.3);
      border-radius: 50%;
      border-top-color: #4b6cb7;
      animation: spin 1s ease-in-out infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @media (max-width: 480px) {
      .chatbot-container {
        width: 90%;
        right: 5%;
        left: 5%;
      }
      
      .chat-toggle {
        right: 10px;
        padding: 8px 16px;
        font-size: 14px;
      }
    }
  `;
  
  document.head.appendChild(styleElement);
}

// Open/close the chat
function toggleChat() {
  isChatOpen = !isChatOpen;
  if (isChatOpen) {
    chatbotContainer.classList.add('open');
    chatToggle.classList.add('hidden');
  } else {
    chatbotContainer.classList.remove('open');
    chatToggle.classList.remove('hidden');
  }
}

// Handle sending messages
async function handleSendMessage() {
  const userMessage = chatInput.value.trim();
  if (!userMessage) return;
  
  // Clear input
  chatInput.value = '';
  
  // Show user message
  addMessageToChat('user', userMessage);
  
  // Show loading indicator
  const loadingId = showLoading();
  
  try {
    // Get AI response
    const response = await getAIResponse(userMessage);
    
    // Hide loading indicator
    hideLoading(loadingId);
    
    // Show AI response
    addMessageToChat('bot', response);
  } catch (error) {
    // Hide loading indicator
    hideLoading(loadingId);
    
    // Show error message
    addMessageToChat('bot', 'Sorry, there was an error connecting to the AI. Please try again later.');
    console.error('Error getting response:', error);
  }
}

// Add message to chat
function addMessageToChat(type, content) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type}`;
  
  const contentDiv = document.createElement('div');
  contentDiv.className = 'message-content';
  contentDiv.textContent = content;
  
  messageDiv.appendChild(contentDiv);
  chatMessages.appendChild(messageDiv);
  
  // Scroll to the last message
  chatMessages.scrollTop = chatMessages.scrollHeight;
  
  // Update chat history
  if (type === 'user') {
    chatHistory.push({ role: "user", content });
  } else if (type === 'bot') {
    chatHistory.push({ role: "assistant", content });
  }
  
  // Limit history to the last 10 interactions
  if (chatHistory.length > 21) { // 1 system + 10 user + 10 assistant
    chatHistory = [
      chatHistory[0], // Keep the system message
      ...chatHistory.slice(chatHistory.length - 20)
    ];
  }
}

// Show loading indicator
function showLoading() {
  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'message bot loading';
  loadingDiv.id = 'loading-' + Date.now();
  
  const contentDiv = document.createElement('div');
  contentDiv.className = 'message-content';
  
  const loaderDiv = document.createElement('div');
  loaderDiv.className = 'chat-loader';
  
  contentDiv.appendChild(loaderDiv);
  loadingDiv.appendChild(contentDiv);
  chatMessages.appendChild(loadingDiv);
  
  // Scroll to loading indicator
  chatMessages.scrollTop = chatMessages.scrollHeight;
  
  return loadingDiv.id;
}

// Hide loading indicator
function hideLoading(id) {
  const loadingDiv = document.getElementById(id);
  if (loadingDiv) {
    loadingDiv.remove();
  }
}

// Get AI response using OpenAI API
async function getAIResponse(userMessage) {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: chatHistory,
        max_tokens: 250,
        temperature: 0.7
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API Error:', errorData);
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    // If there's an error with the API, use local responses as fallback
    return getLocalResponse(userMessage);
  }
}

// Local predefined responses (fallback)
function getLocalResponse(userMessage) {
  // Convert message to lowercase for easier comparison
  const message = userMessage.toLowerCase();
  
  // Predefined responses based on keywords
  if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
    return 'Hello! How can I help you today with your cryptocurrency or Solana questions?';
  } else if (message.includes('solana') && (message.includes('what is') || message.includes('explain'))) {
    return 'Solana is a high-performance blockchain designed for decentralized applications and cryptocurrencies, known for its high speed and low transaction fees.';
  } else if (message.includes('wallet')) {
    return 'A wallet is an application that allows you to store, send, and receive cryptocurrencies. For Solana, some popular wallets are Phantom, Solflare, and Slope.';
  } else if (message.includes('nft')) {
    return 'NFTs (Non-Fungible Tokens) are unique digital assets that represent ownership of a specific digital item, such as art, music, or collectibles.';
  } else if (message.includes('gas') || message.includes('fees')) {
    return 'In Solana, transaction fees (sometimes called "gas") are very low compared to other blockchains, typically less than $0.01 per transaction.';
  } else if (message.includes('staking')) {
    return 'Staking in Solana involves locking your SOL tokens to help secure the network and earn rewards. You can stake through wallets like Phantom or Solflare.';
  } else if (message.includes('defi') || message.includes('decentralized finance')) {
    return 'DeFi (Decentralized Finance) refers to financial applications built on blockchain that enable lending, trading, and other financial services without intermediaries.';
  } else if (message.includes('thank')) {
    return 'You\'re welcome! I\'m here to help with any other questions you might have.';
  } else {
    return 'I understand your question about ' + userMessage.substring(0, 30) + '... We\'re experiencing issues with the AI connection. Please try with a more specific question or try again later.';
  }
}

// Initialize the chatbot when the page loads
document.addEventListener('DOMContentLoaded', initChatbot);
