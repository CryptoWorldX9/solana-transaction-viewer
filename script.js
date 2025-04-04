// Function to load the initial page when the site loads
document.addEventListener('DOMContentLoaded', function() {
    // Show home page by default
    showPage('home');
    
    // Initialize theme
    initTheme();
    
    // Add event listeners for menu links
    document.querySelectorAll('.sidebar-menu a').forEach(link => {
    link.addEventListener('click', function(e) {
    e.preventDefault();
    const page = this.getAttribute('data-page');
    showPage(page);
    
    // Mark active link
    document.querySelectorAll('.sidebar-menu li').forEach(item => {
    item.classList.remove('active');
    });
    this.parentElement.classList.add('active');
    
    // On mobile, close menu after clicking
    if (window.innerWidth < 992) {
    document.querySelector('.sidebar').classList.remove('active');
    document.querySelector('.sidebar-overlay').classList.remove('active');
    }
    });
    });
    
    // Mobile menu toggle
    document.querySelector('.sidebar-toggle').addEventListener('click', function() {
    document.querySelector('.sidebar').classList.toggle('active');
    document.querySelector('.sidebar-overlay').classList.toggle('active');
    });
    
    // Close menu when clicking on overlay
    document.querySelector('.sidebar-overlay').addEventListener('click', function() {
    document.querySelector('.sidebar').classList.remove('active');
    this.classList.remove('active');
    });
    
    // Theme toggle
    document.querySelector('.theme-toggle').addEventListener('click', function() {
    document.body.classList.toggle('light-theme');
    localStorage.setItem('theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
    
    // Change icon
    const icon = this.querySelector('i');
    if (document.body.classList.contains('light-theme')) {
    icon.className = 'fas fa-sun';
    } else {
    icon.className = 'fas fa-moon';
    }
    });
    
    // Initialize modals
    initModals();
    
    // Handle window resize
    window.addEventListener('resize', function() {
    if (window.innerWidth >= 992) {
    document.querySelector('.sidebar').classList.remove('active');
    document.querySelector('.sidebar-overlay').classList.remove('active');
    }
    });
    
    // Initialize network buttons
    document.querySelectorAll('.network-btn').forEach(btn => {
    btn.addEventListener('click', function() {
    document.querySelectorAll('.network-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    });
    });
});

// Function to initialize theme
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
    document.querySelector('.theme-toggle i').className = 'fas fa-sun';
    }
}

// Function to show a specific page
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
    });
    
    const page = document.getElementById(pageId);
    if (page) {
    page.classList.add('active');
    }
}

// Function to initialize modals
function initModals() {
    // Close modals when clicking the close button
    document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', function() {
    this.closest('.modal').style.display = 'none';
    });
    });
    
    // Close modals when clicking outside the content
    document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', function(e) {
    if (e.target === this) {
    this.style.display = 'none';
    }
    });
    });
    
    // Open search modal
    document.querySelector('.search-btn').addEventListener('click', function() {
    document.getElementById('searchModal').style.display = 'block';
    setTimeout(() => {
    document.querySelector('#searchModal input').focus();
    }, 100);
    });
    
    // Open wallet modal
    document.querySelector('.wallet-btn').addEventListener('click', function() {
    document.getElementById('walletModal').style.display = 'block';
    });
    
    // Wallet options click event
    document.querySelectorAll('.wallet-option').forEach(option => {
    option.addEventListener('click', function() {
    // Here you would normally connect to the wallet
    alert('Conectando a la wallet...');
    document.getElementById('walletModal').style.display = 'none';
    });
    });
    
    // Search functionality
    const searchInput = document.querySelector('#searchModal input');
    searchInput.addEventListener('keyup', function(e) {
    if (e.key === 'Enter') {
    const searchTerm = this.value.trim();
    if (searchTerm) {
    document.getElementById('searchResults').innerHTML = `<p>Buscando "${searchTerm}"...</p>`;
    // Here you would normally perform a search
    }
    }
    });
}

// Función para obtener datos de la wallet usando una API pública
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
    // Usar la API pública de Solana
    const connection = new solanaWeb3.Connection('https://api.mainnet-beta.solana.com');
    
    // Obtener balance
    const publicKey = new solanaWeb3.PublicKey(walletAddress);
    const balance = await connection.getBalance(publicKey);
    
    // Mostrar información de la wallet
    walletInfoDiv.innerHTML = `
    <h3>Información de la Wallet</h3>
    <p><strong>Dirección:</strong> ${walletAddress}</p>
    <p><strong>Saldo SOL:</strong> ${balance / 10000} SOL</p>
    <p><strong>Red:</strong> Mainnet</p>
    `;
    
    // Obtener transacciones recientes
    const transactions = await connection.getSignaturesForAddress(publicKey, {limit: 10});
    
    if (transactions && transactions.length > 0) {
    let html = '<h3>Últimas Transacciones</h3><ul>';
    transactions.forEach(tx => {
    html += `
    <li>
    <p><strong>Signature:</strong> ${tx.signature}</p>
    <p><strong>Slot:</strong> ${tx.slot}</p>
    <p><strong>Fecha:</strong> ${new Date(tx.blockTime * 1000).toLocaleString()}</p>
    <p><strong>Estado:</strong> ${tx.confirmationStatus}</p>
    </li>
    `;
    });
    html += '</ul>';
    transactionListDiv.innerHTML = html;
    } else {
    transactionListDiv.innerHTML = '<p>No hay transacciones recientes.</p>';
    }
    
    } catch (error) {
    console.error('Error:', error);
    
    // Si hay un error con la API de Solana, intentar con una alternativa
    try {
    // Usar una API alternativa que no requiere Web3
    const response = await fetch(`https://public-api.solscan.io/account/${walletAddress}`);
    const data = await response.json();
    
    if (data) {
    walletInfoDiv.innerHTML = `
    <h3>Información de la Wallet</h3>
    <p><strong>Dirección:</strong> ${walletAddress}</p>
    <p><strong>Saldo SOL:</strong> ${data.lamports ? (data.lamports / 1e9).toFixed(4) : '0'} SOL</p>
    <p><strong>Red:</strong> Mainnet</p>
    `;
    
    // Obtener transacciones
    const txResponse = await fetch(`https://public-api.solscan.io/account/transactions?account=${walletAddress}&limit=10`);
    const txData = await txResponse.json();
    
    if (txData && txData.length > 0) {
    let html = '<h3>Últimas Transacciones</h3><ul>';
    txData.forEach(tx => {
    html += `
    <li>
    <p><strong>Signature:</strong> ${tx.txHash || tx.signature || 'No disponible'}</p>
    <p><strong>Slot:</strong> ${tx.slot || 'No disponible'}</p>
    <p><strong>Fecha:</strong> ${tx.blockTime ? new Date(tx.blockTime * 1000).toLocaleString() : 'No disponible'}</p>
    <p><strong>Estado:</strong> ${tx.status || tx.confirmationStatus || 'Confirmada'}</p>
    </li>
    `;
    });
    html += '</ul>';
    transactionListDiv.innerHTML = html;
    } else {
    transactionListDiv.innerHTML = '<p>No hay transacciones recientes.</p>';
    }
    } else {
    throw new Error('No se pudo obtener información de la wallet');
    }
    } catch (alternativeError) {
    console.error('Error alternativo:', alternativeError);
    
    // Si ambas APIs fallan, mostrar un mensaje de error genérico
    walletInfoDiv.innerHTML = `
    <h3>Información de la Wallet</h3>
    <p><strong>Dirección:</strong> ${walletAddress}</p>
    <p><strong>Estado:</strong> No se pudo obtener información detallada</p>
    <p>Puedes verificar esta dirección en <a href="https://solscan.io/account/${walletAddress}" target="_blank">Solscan</a> o <a href="https://explorer.solana.com/address/${walletAddress}" target="_blank">Solana Explorer</a></p>
    `;
    transactionListDiv.innerHTML = `
    <p>No se pudieron cargar las transacciones. Por favor, verifica la dirección o intenta más tarde.</p>
    <p>Puedes ver las transacciones en <a href="https://solscan.io/account/${walletAddress}" target="_blank">Solscan</a> o <a href="https://explorer.solana.com/address/${walletAddress}" target="_blank">Solana Explorer</a></p>
    `;
    }
    }
}
