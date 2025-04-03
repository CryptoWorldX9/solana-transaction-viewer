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
    
    // Base de conocimiento para el ChatBot
    const knowledgeBase = {
        // Información general sobre criptomonedas
        "crypto": [
            "Las criptomonedas son activos digitales diseñados para funcionar como medio de intercambio utilizando criptografía para asegurar las transacciones.",
            "Bitcoin fue la primera criptomoneda, creada en 2009 por una persona o grupo bajo el seudónimo de Satoshi Nakamoto.",
            "Las criptomonedas operan en redes descentralizadas basadas en tecnología blockchain, un libro mayor distribuido reforzado por una red de computadoras."
        ],
        "blockchain": [
            "Blockchain es una tecnología de registro distribuido que permite el registro seguro y verificable de transacciones.",
            "Cada 'bloque' contiene un conjunto de transacciones, y una vez completado, se añade a la 'cadena' en orden cronológico.",
            "La naturaleza descentralizada de blockchain la hace resistente a la modificación de datos y proporciona transparencia y seguridad."
        ],
        "bitcoin": [
            "Bitcoin (BTC) es la primera y más valiosa criptomoneda, creada en 2009.",
            "Bitcoin utiliza un sistema peer-to-peer sin intermediarios centrales para procesar transacciones.",
            "La oferta total de Bitcoin está limitada a 21 millones de monedas, lo que lo convierte en un activo escaso."
        ],
        "ethereum": [
            "Ethereum (ETH) es una plataforma blockchain que permite la creación de contratos inteligentes y aplicaciones descentralizadas (dApps).",
            "Ether es la criptomoneda nativa de la red Ethereum, utilizada para pagar las tarifas de transacción y los servicios computacionales.",
            "Ethereum 2.0 está migrando de un mecanismo de consenso de Prueba de Trabajo (PoW) a Prueba de Participación (PoS) para mejorar la escalabilidad y reducir el consumo de energía."
        ],
        "solana": [
            "Solana (SOL) es una blockchain de alto rendimiento que ofrece transacciones rápidas y de bajo costo.",
            "Utiliza un mecanismo de consenso de Prueba de Historia (PoH) junto con Prueba de Participación (PoS).",
            "Solana puede procesar miles de transacciones por segundo, lo que la hace adecuada para aplicaciones DeFi y NFTs."
        ],
        
        // Trading y análisis
        "trading": [
            "El trading de criptomonedas implica comprar y vender activos digitales con el objetivo de obtener beneficios de las fluctuaciones de precios.",
            "Existen diferentes estrategias de trading, como day trading, swing trading, scalping y posición a largo plazo (HODL).",
            "Es importante gestionar el riesgo y no invertir más de lo que puedes permitirte perder."
        ],
        "análisis técnico": [
            "El análisis técnico estudia los patrones de precios históricos para predecir movimientos futuros.",
            "Utiliza indicadores como medias móviles, RSI, MACD y patrones de velas para tomar decisiones de trading.",
            "No garantiza resultados, pero proporciona una estructura para la toma de decisiones basada en datos."
        ],
        "análisis fundamental": [
            "El análisis fundamental evalúa el valor intrínseco de un activo basándose en factores económicos y financieros.",
            "Para criptomonedas, incluye el estudio de la tecnología subyacente, el equipo de desarrollo, casos de uso, adopción y tokenomics.",
            "Ayuda a identificar proyectos con potencial a largo plazo más allá de las fluctuaciones de precios a corto plazo."
        ],
        
        // DeFi y NFTs
        "defi": [
            "DeFi (Finanzas Descentralizadas) se refiere a servicios financieros construidos sobre blockchain que operan sin intermediarios centralizados.",
            "Incluye préstamos, intercambios descentralizados (DEX), staking, yield farming y seguros.",
            "Ofrece mayor accesibilidad, transparencia y control sobre los activos financieros."
        ],
        "nft": [
            "Los NFTs (Tokens No Fungibles) son activos digitales únicos verificados mediante tecnología blockchain.",
            "Representan la propiedad de elementos digitales como arte, música, videos, coleccionables y elementos de juegos.",
            "A diferencia de las criptomonedas, cada NFT tiene un valor único y no puede ser intercambiado de manera equivalente."
        ],
        "staking": [
            "El staking implica bloquear criptomonedas para apoyar las operaciones de una red blockchain y ganar recompensas.",
            "Funciona principalmente en blockchains que utilizan el mecanismo de consenso de Prueba de Participación (PoS).",
            "Las recompensas de staking suelen expresarse como un porcentaje de rendimiento anual (APY)."
        ],
        
        // Wallets y seguridad
        "wallet": [
            "Las wallets de criptomonedas almacenan las claves privadas que permiten acceder y gestionar activos digitales.",
            "Existen wallets calientes (conectadas a internet) y frías (sin conexión) para diferentes necesidades de seguridad.",
            "Nunca compartas tus frases semilla o claves privadas con nadie."
        ],
        "seguridad": [
            "Utiliza autenticación de dos factores (2FA) en todos los intercambios y servicios de criptomonedas.",
            "Considera usar hardware wallets como Ledger o Trezor para almacenamiento a largo plazo de grandes cantidades.",
            "Verifica siempre las direcciones antes de enviar criptomonedas y desconfía de ofertas que parezcan demasiado buenas para ser verdad."
        ],
        "phishing": [
            "El phishing es un tipo común de estafa donde los atacantes se hacen pasar por servicios legítimos para robar credenciales o fondos.",
            "Verifica siempre las URL de los sitios web y no hagas clic en enlaces sospechosos en correos electrónicos o mensajes.",
            "Los intercambios y servicios legítimos nunca pedirán tu frase semilla o clave privada."
        ]
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
        }, 500);
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
        
        // Buscar en la base de conocimiento
        for (const keyword in knowledgeBase) {
            if (lowerMessage.includes(keyword)) {
                // Seleccionar una respuesta aleatoria de la lista de respuestas para ese tema
                const responses = knowledgeBase[keyword];
                return responses[Math.floor(Math.random() * responses.length)];
            }
        }
        
        // Respuestas generales si no se encuentra una coincidencia específica
        if (lowerMessage.includes('hola') || lowerMessage.includes('hi') || lowerMessage.includes('hello')) {
            return "¡Hola! Soy tu asistente de trading de criptomonedas. ¿En qué puedo ayudarte hoy?";
        } else if (lowerMessage.includes('gracias') || lowerMessage.includes('thank')) {
            return "¡De nada! Estoy aquí para ayudarte con cualquier duda sobre criptomonedas y trading.";
        } else if (lowerMessage.includes('ayuda') || lowerMessage.includes('help')) {
            return "Puedo ayudarte con información sobre criptomonedas, blockchain, estrategias de trading, análisis técnico, DeFi, NFTs, seguridad y más. ¿Sobre qué tema te gustaría saber?";
        } else if (lowerMessage.includes('precio') || lowerMessage.includes('price') || lowerMessage.includes('valor') || lowerMessage.includes('value')) {
            return "Los precios de las criptomonedas son volátiles y cambian constantemente. Te recomiendo consultar sitios como CoinMarketCap o CoinGecko para obtener información actualizada sobre precios.";
        } else if (lowerMessage.includes('invertir') || lowerMessage.includes('invest')) {
            return "La inversión en criptomonedas conlleva riesgos. Es importante hacer tu propia investigación, diversificar tu cartera y nunca invertir más de lo que puedes permitirte perder.";
        } else if (lowerMessage.includes('tendencia') || lowerMessage.includes('trend')) {
            return "Las tendencias del mercado pueden analizarse mediante indicadores técnicos y análisis fundamental. Recuerda que las tendencias pasadas no garantizan resultados futuros.";
        } else if (lowerMessage.includes('recomienda') || lowerMessage.includes('recommend') || lowerMessage.includes('mejor') || lowerMessage.includes('best')) {
            return "No puedo recomendar inversiones específicas, ya que cada persona tiene diferentes objetivos y tolerancia al riesgo. Te sugiero investigar proyectos con tecnología sólida, equipos competentes y casos de uso reales.";
        }
        
        // Respuesta por defecto
        return "Interesante pregunta. Puedo proporcionarte información sobre criptomonedas, blockchain, trading, DeFi, NFTs, seguridad y más. ¿Podrías ser más específico sobre lo que te gustaría saber?";
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
    
    // Tabs
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const parentTabs = this.closest('.section-tabs');
            if (parentTabs) {
                const siblings = parentTabs.querySelectorAll('.tab-btn');
                siblings.forEach(btn => {
                    btn.classList.remove('active');
                });
                this.classList.add('active');
            }
        });
    });
});
