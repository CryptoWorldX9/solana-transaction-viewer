// Archivo chatbot.js
document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const chatMessages = document.getElementById('chatMessages');
    const userMessageInput = document.getElementById('userMessage');
    const sendButton = document.getElementById('sendMessage');
    
    // Historial de mensajes para mantener el contexto
    let messageHistory = [
        {
            role: "system",
            content: "Eres un asistente especializado en criptomonedas y blockchain. Proporciona respuestas concisas y útiles sobre estos temas."
        }
    ];
    
    // Función para enviar mensaje
    function sendMessage() {
        const userMessage = userMessageInput.value.trim();
        
        if (userMessage === '') return;
        
        // Añadir mensaje del usuario al chat
        addMessageToChat('user', userMessage);
        
        // Añadir mensaje al historial
        messageHistory.push({
            role: "user",
            content: userMessage
        });
        
        // Limpiar input
        userMessageInput.value = '';
        
        // Mostrar indicador de escritura
        showTypingIndicator();
        
        // Simular respuesta del bot (para evitar problemas de CORS)
        simulateBotResponse(userMessage);
    }
    
    // Función para añadir mensaje al chat
    function addMessageToChat(sender, message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', sender);
        
        const messageContent = document.createElement('div');
        messageContent.classList.add('message-content');
        
        const paragraph = document.createElement('p');
        paragraph.textContent = message;
        
        messageContent.appendChild(paragraph);
        messageElement.appendChild(messageContent);
        
        chatMessages.appendChild(messageElement);
        
        // Scroll al final del chat
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Función para mostrar indicador de escritura
    function showTypingIndicator() {
        const typingIndicator = document.createElement('div');
        typingIndicator.classList.add('message', 'bot');
        typingIndicator.id = 'typingIndicator';
        
        const indicatorContent = document.createElement('div');
        indicatorContent.classList.add('message-content');
        
        const dots = document.createElement('div');
        dots.classList.add('typing-indicator');
        dots.innerHTML = '<span></span><span></span><span></span>';
        
        indicatorContent.appendChild(dots);
        typingIndicator.appendChild(indicatorContent);
        
        chatMessages.appendChild(typingIndicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Función para ocultar indicador de escritura
    function hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    // Función para simular respuesta del bot (evitando problemas de CORS)
    function simulateBotResponse(userMessage) {
        // Simular tiempo de respuesta
        setTimeout(() => {
            hideTypingIndicator();
            
            let botResponse = '';
            
            // Respuestas predefinidas basadas en palabras clave
            if (userMessage.toLowerCase().includes('bitcoin') || userMessage.toLowerCase().includes('btc')) {
                botResponse = "Bitcoin (BTC) es la primera criptomoneda descentralizada, creada en 2009 por una persona o grupo bajo el seudónimo de Satoshi Nakamoto. Funciona en una red blockchain que permite transacciones seguras sin intermediarios.";
            } 
            else if (userMessage.toLowerCase().includes('ethereum') || userMessage.toLowerCase().includes('eth')) {
                botResponse = "Ethereum (ETH) es una plataforma blockchain que permite la creación de contratos inteligentes y aplicaciones descentralizadas (dApps). Fue propuesta por Vitalik Buterin en 2013 y lanzada en 2015.";
            }
            else if (userMessage.toLowerCase().includes('solana') || userMessage.toLowerCase().includes('sol')) {
                botResponse = "Solana (SOL) es una blockchain de alto rendimiento que ofrece transacciones rápidas y de bajo costo. Utiliza un mecanismo de consenso llamado Proof of History (PoH) combinado con Proof of Stake (PoS).";
            }
            else if (userMessage.toLowerCase().includes('blockchain')) {
                botResponse = "Blockchain es una tecnología de registro distribuido que almacena información en bloques enlazados criptográficamente. Es inmutable, transparente y segura, lo que la hace ideal para criptomonedas y aplicaciones descentralizadas.";
            }
            else if (userMessage.toLowerCase().includes('nft')) {
                botResponse = "Los NFTs (Non-Fungible Tokens) son activos digitales únicos que representan la propiedad de elementos como arte digital, música, videos y otros coleccionables. A diferencia de las criptomonedas, cada NFT tiene un valor único y no es intercambiable por otro.";
            }
            else if (userMessage.toLowerCase().includes('defi')) {
                botResponse = "DeFi (Finanzas Descentralizadas) se refiere a aplicaciones financieras construidas sobre redes blockchain que buscan recrear servicios financieros tradicionales sin intermediarios, ofreciendo préstamos, intercambios y generación de rendimientos.";
            }
            else if (userMessage.toLowerCase().includes('wallet') || userMessage.toLowerCase().includes('billetera')) {
                botResponse = "Una wallet o billetera de criptomonedas es una aplicación o dispositivo que almacena las claves privadas necesarias para acceder y gestionar tus activos digitales. Existen wallets calientes (conectadas a internet) y frías (sin conexión) para mayor seguridad.";
            }
            else if (userMessage.toLowerCase().includes('mining') || userMessage.toLowerCase().includes('minería')) {
                botResponse = "La minería de criptomonedas es el proceso por el cual se verifican transacciones y se añaden nuevos bloques a la blockchain. Los mineros resuelven complejos problemas matemáticos y son recompensados con nuevas monedas.";
            }
            else if (userMessage.toLowerCase().includes('staking')) {
                botResponse = "El staking es un proceso donde los poseedores de criptomonedas bloquean sus activos para participar en la operación de una red blockchain de Proof of Stake. A cambio, reciben recompensas por ayudar a mantener la seguridad y operatividad de la red.";
            }
            else if (userMessage.toLowerCase().includes('hola') || userMessage.toLowerCase().includes('saludos') || userMessage.toLowerCase().includes('buenos días') || userMessage.toLowerCase().includes('buenas')) {
                botResponse = "¡Hola! Soy tu asistente especializado en criptomonedas y blockchain. ¿En qué puedo ayudarte hoy?";
            }
            else if (userMessage.toLowerCase().includes('gracias')) {
                botResponse = "¡De nada! Estoy aquí para ayudarte con cualquier duda sobre criptomonedas y blockchain. ¿Hay algo más en lo que pueda asistirte?";
            }
            else {
                botResponse = "Gracias por tu pregunta. Como asistente especializado en criptomonedas, puedo ayudarte con información sobre Bitcoin, Ethereum, Solana, blockchain, NFTs, DeFi, wallets, minería y staking. ¿Podrías reformular tu pregunta o especificar más sobre qué tema te gustaría saber?";
            }
            
            // Añadir respuesta al chat
            addMessageToChat('bot', botResponse);
            
            // Añadir respuesta al historial
            messageHistory.push({
                role: "assistant",
                content: botResponse
            });
            
            // Mantener el historial en un tamaño manejable
            if (messageHistory.length > 10) {
                // Mantener el mensaje del sistema y los últimos 9 mensajes
                messageHistory = [
                    messageHistory[0],
                    ...messageHistory.slice(messageHistory.length - 9)
                ];
            }
        }, 1500); // Simular tiempo de respuesta de 1.5 segundos
    }
    
    // Event listeners
    sendButton.addEventListener('click', sendMessage);
    
    userMessageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
});
