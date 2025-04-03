// Elementos del DOM
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const searchBtn = document.getElementById('searchBtn');
const walletBtn = document.getElementById('walletBtn');
const searchModal = document.getElementById('searchModal');
const walletModal = document.getElementById('walletModal');
const closeSearchModal = document.getElementById('closeSearchModal');
const closeWalletModal = document.getElementById('closeWalletModal');
const nightModeBtn = document.getElementById('nightModeBtn');
const walletOptions = document.querySelectorAll('.wallet-option');
const menuLinks = document.querySelectorAll('.sidebar-menu a');
const pages = document.querySelectorAll('.page');
const trackWalletBtn = document.getElementById('trackWallet');
const walletAddressInput = document.getElementById('walletAddress');
const waitingMessage = document.getElementById('waitingMessage');
const walletInfo = document.getElementById('walletInfo');
const transactionList = document.getElementById('transactionList');
const networkButtons = document.querySelectorAll('.network-btn');
const tabButtons = document.querySelectorAll('.tab-btn');

// Estado de la aplicación
let currentNetwork = 'mainnet';
let isDarkMode = true; // Comenzamos en modo oscuro
let connectedWallet = null;

// Inicializar la aplicación
function initApp() {
    // Configurar eventos para la navegación
    setupNavigation();
    
    // Configurar eventos para los modales
    setupModals();
    
    // Configurar eventos para el wallet tracker
    setupWalletTracker();
    
    // Configurar eventos para el modo oscuro/claro
    setupNightMode();
    
    // Configurar eventos para las pestañas
    setupTabs();
    
    // Cargar la página inicial
    loadPage(window.location.hash || '#home');
}

// Configurar eventos para la navegación
function setupNavigation() {
    // Evento para el botón de toggle del sidebar
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
        sidebarOverlay.classList.toggle('active');
    });
    
    // Evento para el overlay del sidebar
    sidebarOverlay.addEventListener('click', () => {
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
    });
    
    // Eventos para los enlaces del menú
    menuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('href');
            
            // Actualizar enlaces activos
            menuLinks.forEach(item => item.parentElement.classList.remove('active'));
            link.parentElement.classList.add('active');
            
            // Cargar la página
            loadPage(target);
            
            // Cerrar el sidebar en móvil
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('active');
                sidebarOverlay.classList.remove('active');
            }
            
            // Actualizar la URL
            window.location.hash = target;
        });
    });
    
    // Evento para cambios en el hash de la URL
    window.addEventListener('hashchange', () => {
        loadPage(window.location.hash);
    });
}

// Cargar una página
function loadPage(pageId) {
    // Ocultar todas las páginas
    pages.forEach(page => page.classList.remove('active'));
    
    // Mostrar la página seleccionada
    const targetPage = document.querySelector(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
        
        // Actualizar enlaces activos
        menuLinks.forEach(link => {
            if (link.getAttribute('href') === pageId) {
                link.parentElement.classList.add('active');
            } else {
                link.parentElement.classList.remove('active');
            }
        });
    }
}

// Configurar eventos para los modales
function setupModals() {
    // Evento para abrir el modal de búsqueda
    searchBtn.addEventListener('click', () => {
        searchModal.style.display = 'block';
    });
    
    // Evento para cerrar el modal de búsqueda
    closeSearchModal.addEventListener('click', () => {
        searchModal.style.display = 'none';
    });
    
    // Evento para abrir el modal de wallet
    walletBtn.addEventListener('click', () => {
        walletModal.style.display = 'block';
    });
    
    // Evento para cerrar el modal de wallet
    closeWalletModal.addEventListener('click', () => {
        walletModal.style.display = 'none';
    });
    
    // Evento para cerrar modales al hacer clic fuera
    window.addEventListener('click', (e) => {
        if (e.target === searchModal) {
            searchModal.style.display = 'none';
        }
        if (e.target === walletModal) {
            walletModal.style.display = 'none';
        }
    });
    
    // Eventos para las opciones de wallet
    walletOptions.forEach(option => {
        option.addEventListener('click', () => {
            const walletType = option.getAttribute('data-wallet');
            connectWallet(walletType);
        });
    });
}

// Conectar wallet
function connectWallet(walletType) {
    // Simulación de conexión de wallet
    console.log(`Conectando a wallet: ${walletType}`);
    
    // Mostrar loader
    const walletModalContent = walletModal.querySelector('.modal-content');
    const loader = document.createElement('div');
    loader.className = 'loader';
    walletModalContent.appendChild(loader);
    
    // Simular tiempo de conexión
    setTimeout(() => {
        // Eliminar loader
        loader.remove();
        
        // Simular conexión exitosa
        connectedWallet = {
            type: walletType,
            address: 'GqzF1SyaHM8DqpRJR7tFeqSqdAu4NEJ8c9x8Jn6UrE9a', // Dirección de ejemplo
            balance: 12.45
        };
        
        // Actualizar UI
        walletBtn.innerHTML = '<i class="fas fa-check-circle"></i>';
        
        // Cerrar modal
        walletModal.style.display = 'none';
        
        // Mostrar mensaje de éxito
        alert(`Wallet ${walletType} conectada correctamente`);
    }, 2000);
}

// Configurar eventos para el wallet tracker
function setupWalletTracker() {
    // Evento para el botón de rastrear wallet
    if (trackWalletBtn) {
        trackWalletBtn.addEventListener('click', () => {
            const address = walletAddressInput.value.trim();
            if (address) {
                trackWallet(address);
            } else {
                alert('Por favor, ingresa una dirección de wallet válida');
            }
        });
    }
    
    // Eventos para los botones de red
    networkButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Actualizar botones activos
            networkButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Actualizar red actual
            currentNetwork = button.getAttribute('data-network');
            
            // Si hay una dirección, volver a rastrear con la nueva red
            const address = walletAddressInput.value.trim();
            if (address) {
                trackWallet(address);
            }
        });
    });
}

// Rastrear wallet
function trackWallet(address) {
    // Mostrar mensaje de espera
    waitingMessage.style.display = 'block';
    walletInfo.style.display = 'none';
    transactionList.style.display = 'none';
    
    // Crear loader
    const loader = document.createElement('div');
    loader.className = 'loader';
    waitingMessage.innerHTML = '';
    waitingMessage.appendChild(loader);
    
    // Simular tiempo de carga
    setTimeout(() => {
        // Ocultar mensaje de espera
        waitingMessage.style.display = 'none';
        
        // Mostrar información simulada
        walletInfo.style.display = 'block';
        walletInfo.innerHTML = `
            <h3>Información de la Wallet</h3>
            <p><strong>Dirección:</strong> ${address}</p>
            <p><strong>Red:</strong> ${currentNetwork}</p>
            <p><strong>Balance:</strong> 45.72 SOL</p>
            <p><strong>Valor USD:</strong> $1,234.56</p>
            <p><strong>Tokens:</strong> 12 SPL Tokens</p>
        `;
        
        // Mostrar transacciones simuladas
        transactionList.style.display = 'block';
        transactionList.innerHTML = `
            <h3>Últimas Transacciones</h3>
            <ul>
                <li>
                    <p><strong>Hash:</strong> 5UkMW9...7bPQ</p>
                    <p><strong>Tipo:</strong> Transferencia</p>
                    <p><strong>Cantidad:</strong> 2.5 SOL</p>
                    <p><strong>Fecha:</strong> ${new Date().toLocaleString()}</p>
                </li>
                <li>
                    <p><strong>Hash:</strong> 3Jk2L9...9cRZ</p>
                    <p><strong>Tipo:</strong> Swap</p>
                    <p><strong>Cantidad:</strong> 10 USDC</p>
                    <p><strong>Fecha:</strong> ${new Date(Date.now() - 3600000).toLocaleString()}</p>
                </li>
                <li>
                    <p><strong>Hash:</strong> 7Nm4P2...1dTX</p>
                    <p><strong>Tipo:</strong> Stake</p>
                    <p><strong>Cantidad:</strong> 5 SOL</p>
                    <p><strong>Fecha:</strong> ${new Date(Date.now() - 86400000).toLocaleString()}</p>
                </li>
            </ul>
        `;
    }, 2000);
}

// Configurar eventos para el modo oscuro/claro
function setupNightMode() {
    nightModeBtn.addEventListener('click', () => {
        isDarkMode = !isDarkMode;
        
        if (isDarkMode) {
            // Cambiar a modo oscuro
            document.documentElement.style.setProperty('--primary-color', '#0B0E17');
            document.documentElement.style.setProperty('--secondary-color', '#151A29');
            document.documentElement.style.setProperty('--text-color', '#FFFFFF');
            nightModeBtn.innerHTML = '<i class="fas fa-moon"></i>';
        } else {
            // Cambiar a modo claro
            document.documentElement.style.setProperty('--primary-color', '#F5F5F7');
            document.documentElement.style.setProperty('--secondary-color', '#FFFFFF');
            document.documentElement.style.setProperty('--text-color', '#333333');
            nightModeBtn.innerHTML = '<i class="fas fa-sun"></i>';
        }
    });
}

// Configurar eventos para las pestañas
function setupTabs() {
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Actualizar botones activos
            const tabContainer = button.closest('.section-tabs');
            const buttons = tabContainer.querySelectorAll('.tab-btn');
            buttons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Aquí se podría añadir lógica para mostrar el contenido de la pestaña
        });
    });
}

// Inicializar la aplicación cuando se cargue la página
document.addEventListener('DOMContentLoaded', initApp);
