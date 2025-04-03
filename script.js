// Configuración de conexión a Solana
const connection = new solanaWeb3.Connection('https://api.mainnet-beta.solana.com');
let wallet = null;
let publicKey = null;

document.addEventListener('DOMContentLoaded', function() {
    // Variables para el menú móvil
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    
    // Variables para el tema
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    
    // Variables para el buscador
    const searchBtn = document.getElementById('searchBtn');
    const searchModal = document.getElementById('searchModal');
    const closeSearchBtn = document.getElementById('closeSearchBtn');
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    
    // Variables para wallet
    const walletBtn = document.getElementById('walletBtn');
    const walletModal = document.getElementById('walletModal');
    const closeWalletBtn = document.getElementById('closeWalletBtn');
    const connectPhantomBtn = document.getElementById('connectPhantomBtn');
    const connectSolflareBtn = document.getElementById('connectSolflareBtn');
    const disconnectWalletBtn = document.getElementById('disconnectWalletBtn');
    const sidebarWalletBtn = document.getElementById('sidebarWalletBtn');
    const walletConnected = document.getElementById('walletConnected');
    const walletDisconnected = document.getElementById('walletDisconnected');
    const walletAddress = document.getElementById('walletAddress');
    const walletBalance = document.getElementById('walletBalance');
    const copyAddressBtn = document.getElementById('copyAddressBtn');
    
    // Variables para usuario
    const userBtn = document.getElementById('userBtn');
    const userModal = document.getElementById('userModal');
    const closeUserBtn = document.getElementById('closeUserBtn');
    const userConnected = document.getElementById('userConnected');
    const userDisconnected = document.getElementById('userDisconnected');
    const userConnectWalletBtn = document.getElementById('userConnectWalletBtn');
    const userWalletAddress = document.getElementById('userWalletAddress');
    const userName = document.getElementById('userName');
    const tokenCount = document.getElementById('tokenCount');
    const nftCount = document.getElementById('nftCount');
    const txCount = document.getElementById('txCount');
    
    // Función para el menú móvil
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
            
            // Cambiar el icono del botón
            const icon = menuToggle.querySelector('i');
            if (sidebar.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }
    
    // Cerrar el menú al hacer clic en un enlace (en móviles)
    const navLinks = document.querySelectorAll('.nav-item a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('active');
                const icon = menuToggle.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });
    });
    
    // Cerrar el menú al hacer clic fuera de él (en móviles)
    document.addEventListener('click', function(event) {
        if (window.innerWidth <= 768 && 
            sidebar && 
            menuToggle && 
            !sidebar.contains(event.target) && 
            !menuToggle.contains(event.target) &&
            sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
            const icon = menuToggle.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        }
    });
    
    // Cambiar tema (modo claro/oscuro)
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            body.classList.toggle('light-mode');
            body.classList.toggle('dark-mode');
            
            // Cambiar el icono según el tema
            const themeIcon = themeToggle.querySelector('i');
            if (body.classList.contains('light-mode')) {
                themeIcon.classList.remove('fa-moon');
                themeIcon.classList.add('fa-sun');
            } else {
                themeIcon.classList.remove('fa-sun');
                themeIcon.classList.add('fa-moon');
            }
            
            // Guardar preferencia en localStorage
            localStorage.setItem('theme', body.classList.contains('light-mode') ? 'light' : 'dark');
        });
    }
    
    // Cargar tema guardado
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        if (savedTheme === 'light') {
            body.classList.add('light-mode');
            body.classList.remove('dark-mode');
            if (themeToggle) {
                const themeIcon = themeToggle.querySelector('i');
                themeIcon.classList.remove('fa-moon');
                themeIcon.classList.add('fa-sun');
            }
        } else {
            body.classList.add('dark-mode');
            body.classList.remove('light-mode');
        }
    }
    
    // Abrir modal de búsqueda
    if (searchBtn && searchModal) {
        searchBtn.addEventListener('click', function() {
            searchModal.classList.add('active');
            if (searchInput) searchInput.focus();
        });
    }
    
    // Cerrar modal de búsqueda
    if (closeSearchBtn && searchModal) {
        closeSearchBtn.addEventListener('click', function() {
            searchModal.classList.remove('active');
        });
    }
    
    // Cerrar modal al hacer clic fuera
    if (searchModal) {
        searchModal.addEventListener('click', function(event) {
            if (event.target === searchModal) {
                searchModal.classList.remove('active');
            }
        });
    }
    
    // Escape para cerrar modal
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            if (searchModal && searchModal.classList.contains('active')) {
                searchModal.classList.remove('active');
            }
            if (walletModal && walletModal.classList.contains('active')) {
                walletModal.classList.remove('active');
            }
            if (userModal && userModal.classList.contains('active')) {
                userModal.classList.remove('active');
            }
        }
    });
    
    // Funcionalidad de búsqueda
    if (searchInput && searchResults) {
        searchInput.addEventListener('input', function() {
            const query = this.value.toLowerCase().trim();
            
            if (query.length < 2) {
                searchResults.innerHTML = '<p class="search-message">Type at least 2 characters to search</p>';
                return;
            }
            
            // Lista de herramientas para buscar
            const tools = [
                { name: 'Token Creator', icon: 'fas fa-coins', description: 'Create your own tokens easily' },
                { name: 'Sentiment Tracker', icon: 'fas fa-heart', description: 'Monitor market sentiment for tokens' },
                { name: 'Token Tracker', icon: 'fas fa-search-dollar', description: 'Track token performance and metrics' },
                { name: 'Detox & Reclaim', icon: 'fas fa-broom', description: 'Clean up your wallet and reclaim assets' },
                { name: 'Wallet Tracker', icon: 'fas fa-user-shield', description: 'Monitor wallet activities and balances' },
                { name: 'Positioning', icon: 'fas fa-map-marker-alt', description: 'Optimize your market positioning' },
                { name: 'Token Burner', icon: 'fas fa-fire', description: 'Burn tokens to reduce supply' },
                { name: 'Knowledge Base', icon: 'fas fa-graduation-cap', description: 'Learn about blockchain and crypto' },
                { name: 'Guide', icon: 'fas fa-book', description: 'Get started with our platform' },
                { name: 'Support', icon: 'fas fa-headset', description: 'Get help with our tools' }
            ];
            
            // Filtrar herramientas según la búsqueda
            const filteredTools = tools.filter(tool => 
                tool.name.toLowerCase().includes(query) || 
                tool.description.toLowerCase().includes(query)
            );
            
            // Mostrar resultados
            if (filteredTools.length > 0) {
                let resultsHTML = '';
                filteredTools.forEach(tool => {
                    resultsHTML += `
                        <div class="search-result-item">
                            <div class="result-icon">
                                <i class="${tool.icon}"></i>
                            </div>
                            <div class="result-info">
                                <h4>${tool.name}</h4>
                                <p>${tool.description}</p>
                            </div>
                        </div>
                    `;
                });
                searchResults.innerHTML = resultsHTML;
            } else {
                searchResults.innerHTML = '<p class="search-message">No results found</p>';
            }
        });
    }
    
    // Funciones para wallet
    
    // Verificar si Phantom está instalado
    const isPhantomInstalled = window.solana && window.solana.isPhantom;
    
    // Verificar si Solflare está instalado
    const isSolflareInstalled = window.solflare && window.solflare.isSolflare;
    
    // Abrir modal de wallet
    if (walletBtn && walletModal) {
        walletBtn.addEventListener('click', function() {
            walletModal.classList.add('active');
        });
    }
    
    // Cerrar modal de wallet
    if (closeWalletBtn && walletModal) {
        closeWalletBtn.addEventListener('click', function() {
            walletModal.classList.remove('active');
        });
    }
    
    // Cerrar modal al hacer clic fuera
    if (walletModal) {
        walletModal.addEventListener('click', function(event) {
            if (event.target === walletModal) {
                walletModal.classList.remove('active');
            }
        });
    }
    
    // Conectar con Phantom
    if (connectPhantomBtn) {
        connectPhantomBtn.addEventListener('click', async function() {
            if (!isPhantomInstalled) {
                window.open('https://phantom.app/', '_blank');
                return;
            }
            
            try {
                const resp = await window.solana.connect();
                publicKey = resp.publicKey;
                wallet = 'phantom';
                handleWalletConnection();
            } catch (err) {
                console.error('Error connecting to Phantom:', err);
                alert('Error connecting to Phantom wallet');
            }
        });
    }
    
    // Conectar con Solflare
    if (connectSolflareBtn) {
        connectSolflareBtn.addEventListener('click', async function() {
            if (!isSolflareInstalled) {
                window.open('https://solflare.com/', '_blank');
                return;
            }
            
            try {
                const resp = await window.solflare.connect();
                publicKey = resp.publicKey;
                wallet = 'solflare';
                handleWalletConnection();
            } catch (err) {
                console.error('Error connecting to Solflare:', err);
                alert('Error connecting to Solflare wallet');
            }
        });
    }
    
    // Desconectar wallet
    if (disconnectWalletBtn) {
        disconnectWalletBtn.addEventListener('click', async function() {
            try {
                if (wallet === 'phantom' && window.solana) {
                    await window.solana.disconnect();
                } else if (wallet === 'solflare' && window.solflare) {
                    await window.solflare.disconnect();
                }
                
                publicKey = null;
                wallet = null;
                
                // Actualizar UI
                if (walletConnected) walletConnected.style.display = 'none';
                if (walletDisconnected) walletDisconnected.style.display = 'block';
                if (userConnected) userConnected.style.display = 'none';
                if (userDisconnected) userDisconnected.style.display = 'block';
                if (sidebarWalletBtn) {
                    sidebarWalletBtn.innerHTML = '<i class="fas fa-wallet"></i><span>Connect Wallet</span>';
                }
                
                // Limpiar localStorage
                localStorage.removeItem('walletConnected');
                localStorage.removeItem('walletType');
                
                console.log('Wallet disconnected');
            } catch (err) {
                console.error('Error disconnecting wallet:', err);
            }
        });
    }
    
    // Copiar dirección
    if (copyAddressBtn) {
        copyAddressBtn.addEventListener('click', function() {
            if (publicKey) {
                navigator.clipboard.writeText(publicKey.toString())
                    .then(() => {
                        const originalText = copyAddressBtn.innerHTML;
                        copyAddressBtn.innerHTML = '<i class="fas fa-check"></i>';
                        setTimeout(() => {
                            copyAddressBtn.innerHTML = originalText;
                        }, 2000);
                    })
                    .catch(err => {
                        console.error('Error copying address:', err);
                    });
            }
        });
    }
    
    // Botón de wallet en sidebar
    if (sidebarWalletBtn) {
        sidebarWalletBtn.addEventListener('click', function() {
            if (publicKey) {
                // Si ya está conectado, mostrar modal de wallet
                if (walletModal) walletModal.classList.add('active');
            } else {
                // Si no está conectado, mostrar modal de wallet para conectar
                if (walletModal) walletModal.classList.add('active');
            }
        });
    }
    
    // Funciones para usuario
    
    // Abrir modal de usuario
    if (userBtn && userModal) {
        userBtn.addEventListener('click', function() {
            userModal.classList.add('active');
        });
    }
    
    // Cerrar modal de usuario
    if (closeUserBtn && userModal) {
        closeUserBtn.addEventListener('click', function() {
            userModal.classList.remove('active');
        });
    }
    
    // Cerrar modal al hacer clic fuera
    if (userModal) {
        userModal.addEventListener('click', function(event) {
            if (event.target === userModal) {
                userModal.classList.remove('active');
            }
        });
    }
    
    // Conectar wallet desde modal de usuario
    if (userConnectWalletBtn) {
        userConnectWalletBtn.addEventListener('click', function() {
            if (userModal) userModal.classList.remove('active');
            if (walletModal) walletModal.classList.add('active');
        });
    }
    
    // Función para manejar la conexión de wallet
    async function handleWalletConnection() {
        if (!publicKey) return;
        
        // Guardar en localStorage
        localStorage.setItem('walletConnected', 'true');
        localStorage.setItem('walletType', wallet);
        
        // Actualizar UI de wallet
        if (walletConnected) walletConnected.style.display = 'block';
        if (walletDisconnected) walletDisconnected.style.display = 'none';
        if (walletAddress) walletAddress.textContent = formatAddress(publicKey.toString());
        
        // Actualizar UI de usuario
        if (userConnected) userConnected.style.display = 'block';
        if (userDisconnected) userDisconnected.style.display = 'none';
        if (userWalletAddress) userWalletAddress.textContent = formatAddress(publicKey.toString());
        if (userName) userName.textContent = `User ${publicKey.toString().substring(0, 4)}`;
        
        // Actualizar botón de wallet en sidebar
        if (sidebarWalletBtn) {
            sidebarWalletBtn.innerHTML = '<i class="fas fa-wallet"></i><span>Disconnect</span>';
        }
        
        // Obtener balance
        try {
            const balance = await connection.getBalance(publicKey);
            if (walletBalance) walletBalance.textContent = `${(balance / solanaWeb3.LAMPORTS_PER_SOL).toFixed(4)} SOL`;
            
            // Obtener tokens y NFTs (simulado por ahora)
            if (tokenCount) tokenCount.textContent = Math.floor(Math.random() * 10);
            if (nftCount) nftCount.textContent = Math.floor(Math.random() * 5);
            if (txCount) txCount.textContent = Math.floor(Math.random() * 100);
            
            console.log('Wallet connected:', publicKey.toString());
        } catch (err) {
            console.error('Error getting balance:', err);
            if (walletBalance) walletBalance.textContent = 'Error';
        }
    }
    
    // Formatear dirección para mostrar
    function formatAddress(address) {
        if (!address) return '';
        return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
    }
    
    // Verificar si hay una wallet conectada al cargar la página
    const isWalletConnected = localStorage.getItem('walletConnected') === 'true';
    const savedWalletType = localStorage.getItem('walletType');
    
    if (isWalletConnected && savedWalletType) {
        // Intentar reconectar automáticamente
        (async function() {
            try {
                if (savedWalletType === 'phantom' && window.solana && window.solana.isPhantom) {
                    // Verificar si ya está conectado
                    if (window.solana.isConnected) {
                        publicKey = window.solana.publicKey;
                        wallet = 'phantom';
                        handleWalletConnection();
                    }
                } else if (savedWalletType === 'solflare' && window.solflare && window.solflare.isSolflare) {
                    // Verificar si ya está conectado
                    if (window.solflare.isConnected) {
                        publicKey = window.solflare.publicKey;
                        wallet = 'solflare';
                        handleWalletConnection();
                    }
                }
            } catch (err) {
                console.error('Error reconnecting wallet:', err);
                localStorage.removeItem('walletConnected');
                localStorage.removeItem('walletType');
            }
        })();
    }
});
