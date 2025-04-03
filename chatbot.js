// Archivo chatbot.js
document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const chatMessages = document.getElementById('chatMessages');
    const userMessageInput = document.getElementById('userMessage');
    const sendButton = document.getElementById('sendMessage');
    
    // API Key de OpenAI (nota: normalmente esto debería estar en el servidor por seguridad)
    const apiKey = "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";
    
    // Función para enviar mensaje
    function sendMessage() {
        const userMessage = userMessageInput.value.trim();
        
        if (userMessage === '') return;
        
        // Añadir mensaje del usuario al chat
        addMessageToChat('user', userMessage);
        
        // Limpiar input
        userMessageInput.value = '';
        
        // Mostrar indicador de escritura
        showTypingIndicator();
        
        // Enviar mensaje a la API de OpenAI
        fetchBotResponse(userMessage);
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
        typingIndicator.classList.add('message', 'bot', 'typing-indicator');
        typingIndicator.id = 'typingIndicator';
        
        const indicatorContent = document.createElement('div');
        indicatorContent.classList.add('message-content');
        
        const dots = document.createElement('div');
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
    
    // Función para obtener respuesta del bot
    async function fetchBotResponse(userMessage) {
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [
                        {
                            role: "system",
                            content: "Eres un asistente especializado en criptomonedas y blockchain. Proporciona respuestas concisas y útiles sobre estos temas."
                        },
                        {
                            role: "user",
                            content: userMessage
                        }
                    ],
                    max_tokens: 150
                })
            });
            
            const data = await response.json();
            
            // Ocultar indicador de escritura
            hideTypingIndicator();
            
            // Añadir respuesta del bot
            if (data.choices && data.choices.length > 0) {
                const botMessage = data.choices[0].message.content;
                addMessageToChat('bot', botMessage);
            } else {
                addMessageToChat('bot', 'Lo siento, no pude procesar tu solicitud en este momento.');
            }
            
        } catch (error) {
            console.error('Error:', error);
            hideTypingIndicator();
            addMessageToChat('bot', 'Lo siento, ocurrió un error al procesar tu solicitud.');
        }
    }
    
    // Event listeners
    sendButton.addEventListener('click', sendMessage);
    
    userMessageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
});
