// API Key de Solscan
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjcmVhdGVkQXQiOjE3NDE0NzA4MjAwNjksImVtYWlsIjoiY3J5cHRvd29ybGR4OUBnbWFpbC5jb20iLCJhY3Rpb24iOiJ0b2tlbi1hcGkiLCJhcGlWZXJzaW9uIjoidjIiLCJpYXQiOjE3NDE0NzA4MjB9.rGwXpbL2WoMCDp6DplM0eoXXuTnEUANxQvFhKZQcv1c';

// Función principal para obtener datos de la wallet
async function fetchWalletData() {
    const walletAddress = document.getElementById('walletAddress').value.trim();
    const walletInfoDiv = document.getElementById('walletInfo');
    const transactionListDiv = document.getElementById('transactionList');
    
    if (!walletAddress) {
        alert('Por favor, ingresa una dirección de wallet válida.');
        return;
    }
    
    walletInfoDiv.innerHTML = '<div class="loader"></div>';
    transactionListDiv.innerHTML = '<div class="loader"></div>';

    try {
        // Usar un proxy CORS para evitar problemas de CORS
        const corsProxy = 'https://corsproxy.io/?';
        
        // Obtener información de la wallet
        const walletResponse = await fetch(`${corsProxy}https://api.solscan.io/account?address=${walletAddress}`, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`
            }
        });
        
        const walletData = await walletResponse.json();

        if (walletData.success) {
            displayWalletInfo(walletData.data, walletInfoDiv);
        } else {
            walletInfoDiv.innerHTML = '<p>Error al obtener datos de la wallet. Verifica la dirección.</p>';
        }

        // Obtener transacciones de la wallet
        const txResponse = await fetch(`${corsProxy}https://api.solscan.io/account/transactions?address=${walletAddress}&limit=10`, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`
            }
        });
        
        const txData = await txResponse.json();

        if (txData.success) {
            displayTransactions(txData.data, transactionListDiv);
        } else {
            transactionListDiv.innerHTML = '<p>No se encontraron transacciones o hubo un error.</p>';
        }
    } catch (error) {
        console.error('Error:', error);
        walletInfoDiv.innerHTML = '<p>Error al conectar con la API. Intenta de nuevo más tarde.</p>';
        transactionListDiv.innerHTML = '';
    }
}

// Función para mostrar información de la wallet
function displayWalletInfo(data, container) {
    container.innerHTML = `
        <h3>Información de la Wallet</h3>
        <p><strong>Dirección:</strong> ${data.address}</p>
        <p><strong>Saldo SOL:</strong> ${(data.lamports / 1e9).toFixed(4)} SOL</p>
        <p><strong>Tokens:</strong> ${data.tokenAmount ? data.tokenAmount.length : 0}</p>
    `;
}

// Función para mostrar lista de transacciones
function displayTransactions(transactions, container) {
    if (transactions.length === 0) {
        container.innerHTML = '<p>No hay transacciones recientes.</p>';
        return;
    }

    let html = '<h3>Últimas Transacciones</h3><ul>';
    transactions.forEach(tx => {
        html += `
            <li>
                <p><strong>Hash:</strong> ${tx.txHash}</p>
                <p><strong>Fecha:</strong> ${new Date(tx.blockTime * 1000).toLocaleString()}</p>
                <p><strong>Estado:</strong> ${tx.status}</p>
                <p><strong>Monto SOL:</strong> ${(tx.lamport / 1e9).toFixed(4)} SOL</p>
            </li>
        `;
    });
    html += '</ul>';
    container.innerHTML = html;
}

// Funcionalidad del ChatBot
function initChatBot() {
    const sendButton = document.getElementById('sendMessage');
    const userInput = document.getElementById('userMessage');
    const chatMessages = document.getElementById('chatMessages');
    
    // Respuestas predefinidas para el ChatBot
    const botResponses = {
        'hello': 'Hello! How can I help you with your trading today?',
        'hi': 'Hi there! What would you like to know about crypto trading?',
        'help': 'I can help you with market analysis, trading strategies, risk management, and more. What specific area are you interested in?',
        'market': 'The crypto market is highly volatile. It\'s important to stay updated with news and trends. Would you like some tips on market analysis?',
        'strategy': 'There are many trading strategies like day trading, swing trading, and HODLing. Your strategy should match your risk tolerance and time commitment.',
        'risk': 'Risk management is crucial in trading. Never invest more than you can afford to lose, and consider using stop-loss orders to protect your capital.',
        'beginner': 'For beginners, I recommend starting with small investments, learning the basics of technical analysis, and practicing with paper trading before using real funds.',
        'solana': 'Solana is a high-performance blockchain supporting smart contracts and decentralized applications. It offers fast transactions and low fees.',
        'nft': 'NFTs (Non-Fungible Tokens) are unique digital assets verified using blockchain technology. They represent ownership of digital items like art, music, or collectibles.',
        'defi': 'DeFi (Decentralized Finance) refers to financial services built on blockchain that operate without centralized authorities. It includes lending, borrowing, and trading.',
        'wallet': 'Crypto wallets store your private keys, allowing you to access and manage your digital assets. There are hot wallets (online) and cold wallets (offline) for storage.'
    };
    
    // Función para enviar mensaje
    function sendMessage() {
        const message = userInput.value.trim();
        if (message === '') return;
        
        // Agregar mensaje del usuario al chat
        addMessage(message, 'user');
        userInput.value = '';
        
        // Simular respuesta del bot después de un breve retraso
        setTimeout(() => {
            const response = getBotResponse(message);
            addMessage(response, 'bot');
            
            // Scroll al final del chat
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 1000);
    }
    
    // Función para agregar mensaje al chat
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender);
        
        const contentDiv = document.createElement('div');
        contentDiv.classList.add('message-content');
        
        const paragraph = document.createElement('p');
        paragraph.textContent = text;
        
        contentDiv.appendChild(paragraph);
        messageDiv.appendChild(contentDiv);
        chatMessages.appendChild(messageDiv);
        
        // Scroll al final del chat
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Función para obtener respuesta del bot
    function getBotResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        // Buscar palabras clave en el mensaje
        for (const keyword in botResponses) {
            if (lowerMessage.includes(keyword)) {
                return botResponses[keyword];
            }
        }
        
        // Respuesta por defecto si no se encuentra ninguna palabra clave
        return "I'm not sure I understand. Could you rephrase your question? I can help with trading strategies, market analysis, risk management, and more.";
    }
    
    // Event listeners
    if (sendButton && userInput) {
        sendButton.addEventListener('click', sendMessage);
        
        userInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
}

// Navegación entre páginas
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar ChatBot
    initChatBot();
    
    // Navegación del sidebar
    const menuLinks = document.querySelectorAll('.sidebar-menu a');
    const pages = document.querySelectorAll('.page');
    
    menuLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remover clase active de todos los links
            menuLinks.forEach(item => {
                item.parentElement.classList.remove('active');
            });
            
            // Agregar clase active al link actual
            this.parentElement.classList.add('active');
            
            // Mostrar la página correspondiente
            const targetPage = this.getAttribute('data-page');
            pages.forEach(page => {
                page.classList.remove('active');
                if (page.id === targetPage) {
                    page.classList.add('active');
                }
            });
            
            // Cerrar sidebar en móvil
            if (window.innerWidth <= 768) {
                document.querySelector('.sidebar').classList.remove('active');
                document.querySelector('.sidebar-overlay').classList.remove('active');
            }
        });
    });
    
    // Toggle sidebar en móvil
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    sidebarToggle.addEventListener('click', function() {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
    });
    
    overlay.addEventListener('click', function() {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
    });
    
    // Modales
    const searchBtn = document.querySelector('.search-btn');
    const walletBtn = document.querySelector('.wallet-btn');
    const searchModal = document.getElementById('searchModal');
    const walletModal = document.getElementById('walletModal');
    const closeButtons = document.querySelectorAll('.close-modal');
    
    searchBtn.addEventListener('click', function() {
        searchModal.style.display = 'block';
    });
    
    walletBtn.addEventListener('click', function() {
        walletModal.style.display = 'block';
    });
    
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            searchModal.style.display = 'none';
            walletModal.style.display = 'none';
        });
    });
    
    window.addEventListener('click', function(e) {
        if (e.target === searchModal) {
            searchModal.style.display = 'none';
        }
        if (e.target === walletModal) {
            walletModal.style.display = 'none';
        }
    });
    
    // Toggle tema oscuro/claro
    const themeToggle = document.querySelector('.theme-toggle');
    
    themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('light-theme');
        const icon = this.querySelector('i');
        if (icon.classList.contains('fa-moon')) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    });
    
    // Opciones de wallet
    const walletOptions = document.querySelectorAll('.wallet-option');
    
    walletOptions.forEach(option => {
        option.addEventListener('click', function() {
            alert('Conectando con ' + this.querySelector('span').textContent + '...');
            walletModal.style.display = 'none';
        });
    });
    
    // Botones de red
    const networkButtons = document.querySelectorAll('.network-btn');
    
    networkButtons.forEach(button => {
        button.addEventListener('click', function() {
            networkButtons.forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
        });
    });
});
