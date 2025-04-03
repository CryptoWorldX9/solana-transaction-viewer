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
    
    // Variables para el modal de wallet
    const walletBtn = document.getElementById('walletBtn');
    const walletModal = document.getElementById('walletModal');
    const closeWalletBtn = document.getElementById('closeWalletBtn');
    const connectWalletBtn = document.getElementById('connectWalletBtn');
    const disconnectWalletBtn = document.getElementById('disconnectWalletBtn');
    const sidebarWalletBtn = document.getElementById('sidebarWalletBtn');
    const walletNotConnected = document.getElementById('walletNotConnected');
    const walletConnected = document.getElementById('walletConnected');
    const walletAddress = document.getElementById('walletAddress');
    const solBalance = document.getElementById('solBalance');
    const copyAddressBtn = document.getElementById('copyAddressBtn');
    
    // Variables para el modal de usuario
    const userBtn = document.getElementById('userBtn');
    const userModal = document.getElementById('userModal');
    const closeUserBtn = document.getElementById('closeUserBtn');
    const userNotConnected = document.getElementById('userNotConnected');
    const userConnected = document.getElementById('userConnected');
    const userWalletShort = document.getElementById('userWalletShort');
    const userWalletTime = document.getElementById('userWalletTime');
    const userTokenCount = document.getElementById('userTokenCount');
    const userNftCount = document.getElementById('userNftCount');
    const userTxCount = document.getElementById('userTxCount');
    
    // Variables para Wallet Tracker
    const walletAddressInput = document.getElementById('walletAddressInput');
    const trackWalletBtn = document.getElementById('trackWalletBtn');
    const walletTrackerResults = document.getElementById('walletTrackerResults');
    const trackedWalletAddress = document.getElementById('trackedWalletAddress');
    const copyTrackedAddressBtn = document.getElementById('copyTrackedAddressBtn');
    const viewOnSolscanBtn = document.getElementById('viewOnSolscanBtn');
    const trackedWalletSolBalance = document.getElementById('trackedWalletSolBalance');
    const trackedWalletTxCount = document.getElementById('trackedWalletTxCount');
    const trackedWalletTokenCount = document.getElementById('trackedWalletTokenCount');
    const trackedWalletNftCount = document.getElementById('trackedWalletNftCount');
    const tokenTableBody = document.getElementById('tokenTableBody');
    const nftGrid = document.getElementById('nftGrid');
    const transactionTableBody = document.getElementById('transactionTableBody');
    const domainsContainer = document.getElementById('domainsContainer');
    
    // Variables para navegación
    const navLinks = document.querySelectorAll('.nav-item a');
    const toolCards = document.querySelectorAll('.tool-card');
    const pageTitle = document.getElementById('pageTitle');
    const pageContainers = document.querySelectorAll('.page-container');
    
    // Variables para tabs
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    // Variables para Solana
    let wallet = null;
    let connection = null;
    let publicKey = null;
    let walletConnectTime = null;
    
    // Inicializar conexión Solana
    function initSolanaConnection() {
        // Usar la red principal de Solana
        connection = new solanaWeb3.Connection(
            'https://api.mainnet-beta.solana.com',
            'confirmed'
        );
        console.log('Solana connection initialized');
    }
    
    // Función para el menú móvil
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
    
    // Cerrar el menú al hacer clic en un enlace (en móviles)
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('active');
                const icon = menuToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    });
    
    // Cerrar el menú al hacer clic fuera de él (en móviles)
    document.addEventListener('click', function(event) {
        if (window.innerWidth <= 768 && 
            !sidebar.contains(event.target) && 
            !menuToggle.contains(event.target) &&
            sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
            const icon = menuToggle.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });
    
    // Cambiar tema (modo claro/oscuro)
    themeToggle.addEventListener('click', function() {
        body.classList.toggle('dark-mode');
        body.classList.toggle('light-mode');
        
        // Cambiar el icono según el tema
        const themeIcon = themeToggle.querySelector('i');
        if (body.classList.contains('dark-mode')) {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        } else {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        }
    });
    
    // Abrir modal de búsqueda
    searchBtn.addEventListener('click', function() {
        searchModal.classList.add('active');
        searchInput.focus();
    });
    
    // Cerrar modal de búsqueda
    closeSearchBtn.addEventListener('click', function() {
        searchModal.classList.remove('active');
    });
    
    // Cerrar modal al hacer clic fuera
    searchModal.addEventListener('click', function(event) {
        if (event.target === searchModal) {
            searchModal.classList.remove('active');
        }
    });
    
    // Abrir modal de wallet
    walletBtn.addEventListener('click', function() {
        walletModal.classList.add('active');
    });
    
    // Cerrar modal de wallet
    closeWalletBtn.addEventListener('click', function() {
        walletModal.classList.remove('active');
    });
    
    // Cerrar modal al hacer clic fuera
    walletModal.addEventListener('click', function(event) {
        if (event.target === walletModal) {
            walletModal.classList.remove('active');
        }
    });
    
    // Abrir modal de usuario
    userBtn.addEventListener('click', function() {
        userModal.classList.add('active');
    });
    
    // Cerrar modal de usuario
    closeUserBtn.addEventListener('click', function() {
        userModal.classList.remove('active');
    });
    
    // Cerrar modal al hacer clic fuera
    userModal.addEventListener('click', function(event) {
        if (event.target === userModal) {
            userModal.classList.remove('active');
        }
    });
    
    // Escape para cerrar modales
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            searchModal.classList.remove('active');
            walletModal.classList.remove('active');
            userModal.classList.remove('active');
        }
    });
    
    // Funcionalidad de búsqueda
    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        
        if (query.length < 2) {
            searchResults.innerHTML = '<p class="search-message">Type at least 2 characters to search</p>';
            return;
        }
        
        // Lista de herramientas para buscar
        const tools = [
            { name: 'Token Creator', icon: 'fas fa-coins', description: 'Create your own tokens easily', page: 'token-creator' },
            { name: 'Sentiment Tracker', icon: 'fas fa-heart', description: 'Monitor market sentiment for tokens', page: 'sentiment-tracker' },
            { name: 'Token Tracker', icon: 'fas fa-search-dollar', description: 'Track token performance and metrics', page: 'token-tracker' },
            { name: 'Detox & Reclaim', icon: 'fas fa-broom', description: 'Clean up your wallet and reclaim assets', page: 'detox-reclaim' },
            { name: 'Wallet Tracker', icon: 'fas fa-user-shield', description: 'Monitor wallet activities and balances', page: 'wallet-tracker' },
            { name: 'Positioning',
