// Configuración del chatbot
const OPENAI_API_KEY = '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'; // Tu API key de OpenAI
const API_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

// Elementos del DOM
const chatToggle = document.getElementById('chatToggle');
const chatbotContainer = document.getElementById('chatbotContainer');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendMessage = document.getElementById('sendMessage');
const minimizeChat = document.querySelector('.minimize-chat');

// Estado del chat
let chatHistory = [
  { role: "system", content: "Eres un asistente virtual especializado en criptomonedas, blockchain y Solana. Proporciona respuestas concisas y útiles. Responde en español." }
];
let isChatOpen = false;

// Inicializar el chatbot
function initChatbot() {
  // Evento para abrir/cerrar el chat
  chatToggle.addEventListener('click', toggleChat);
  
  // Evento para minimizar el chat
  minimizeChat.addEventListener('click', toggleChat);
  
  // Evento para enviar mensaje
  sendMessage.addEventListener('click', handleSendMessage);
  
  // Enviar mensaje con Enter
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  });
}

// Abrir/cerrar el chat
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

// Manejar el envío de mensajes
async function handleSendMessage() {
  const userMessage = chatInput.value.trim();
  if (!userMessage) return;
  
  // Limpiar input
  chatInput.value = '';
  
  // Mostrar mensaje del usuario
  addMessageToChat('user', userMessage);
  
  // Mostrar indicador de carga
  const loadingId = showLoading();
  
  try {
    // Obtener respuesta de la IA
    const response = await getAIResponse(userMessage);
    
    // Ocultar indicador de carga
    hideLoading(loadingId);
    
    // Mostrar respuesta de la IA
    addMessageToChat('bot', response);
  } catch (error) {
    // Ocultar indicador de carga
    hideLoading(loadingId);
    
    // Mostrar mensaje de error
    addMessageToChat('bot', 'Lo siento, ha ocurrido un error al conectar con la IA. Por favor, intenta de nuevo más tarde.');
    console.error('Error al obtener respuesta:', error);
  }
}

// Agregar mensaje al chat
function addMessageToChat(type, content) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type}`;
  
  const contentDiv = document.createElement('div');
  contentDiv.className = 'message-content';
  contentDiv.textContent = content;
  
  messageDiv.appendChild(contentDiv);
  chatMessages.appendChild(messageDiv);
  
  // Scroll al último mensaje
  chatMessages.scrollTop = chatMessages.scrollHeight;
  
  // Actualizar historial del chat
  if (type === 'user') {
    chatHistory.push({ role: "user", content });
  } else if (type === 'bot') {
    chatHistory.push({ role: "assistant", content });
  }
  
  // Limitar el historial a las últimas 10 interacciones
  if (chatHistory.length > 21) { // 1 system + 10 user + 10 assistant
    chatHistory = [
      chatHistory[0], // Mantener el mensaje del sistema
      ...chatHistory.slice(chatHistory.length - 20)
    ];
  }
}

// Mostrar indicador de carga
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
  
  // Scroll al indicador de carga
  chatMessages.scrollTop = chatMessages.scrollHeight;
  
  return loadingDiv.id;
}

// Ocultar indicador de carga
function hideLoading(id) {
  const loadingDiv = document.getElementById(id);
  if (loadingDiv) {
    loadingDiv.remove();
  }
}

// Obtener respuesta de la IA usando OpenAI API
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
      console.error('Error de API OpenAI:', errorData);
      throw new Error(`Error de API: ${response.status}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error al llamar a la API de OpenAI:', error);
    // Si hay un error con la API, usamos respuestas locales como fallback
    return getLocalResponse(userMessage);
  }
}

// Respuestas locales predefinidas (fallback)
function getLocalResponse(userMessage) {
  // Convertir mensaje a minúsculas para facilitar la comparación
  const message = userMessage.toLowerCase();
  
  // Respuestas predefinidas basadas en palabras clave
  if (message.includes('hola') || message.includes('saludos') || message.includes('buenos días')) {
    return '¡Hola! ¿En qué puedo ayudarte hoy con tus consultas sobre criptomonedas o Solana?';
  } else if (message.includes('solana') && (message.includes('qué es') || message.includes('que es'))) {
    return 'Solana es una blockchain de alto rendimiento diseñada para aplicaciones descentralizadas y criptomonedas, conocida por su alta velocidad y bajas tarifas de transacción.';
  } else if (message.includes('wallet') || message.includes('billetera')) {
    return 'Una wallet o billetera es una aplicación que te permite almacenar, enviar y recibir criptomonedas. Para Solana, algunas wallets populares son Phantom, Solflare y Slope.';
  } else if (message.includes('nft')) {
    return 'Los NFTs (Tokens No Fungibles) son activos digitales únicos que representan la propiedad de un artículo digital específico, como arte, música o coleccionables.';
  } else if (message.includes('gas') || message.includes('tarifas')) {
    return 'En Solana, las tarifas de transacción (a veces llamadas "gas") son muy bajas comparadas con otras blockchains, generalmente menos de $0.01 por transacción.';
  } else if (message.includes('staking')) {
    return 'El staking en Solana implica bloquear tus tokens SOL para ayudar a asegurar la red y ganar recompensas. Puedes hacer staking a través de wallets como Phantom o Solflare.';
  } else if (message.includes('defi') || message.includes('finanzas descentralizadas')) {
    return 'DeFi (Finanzas Descentralizadas) se refiere a aplicaciones financieras construidas sobre blockchain que permiten préstamos, intercambios y otros servicios financieros sin intermediarios.';
  } else if (message.includes('gracias')) {
    return '¡De nada! Estoy aquí para ayudarte con cualquier otra pregunta que tengas.';
  } else {
    return 'Entiendo tu pregunta sobre ' + userMessage.substring(0, 30) + '... Estamos experimentando problemas con la conexión a la IA. Por favor, intenta con una pregunta más específica o inténtalo de nuevo más tarde.';
  }
}

// Inicializar el chatbot cuando se cargue la página
document.addEventListener('DOMContentLoaded', initChatbot);
