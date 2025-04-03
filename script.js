// API Key de Solscan
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjcmVhdGVkQXQiOjE3NDE0NzA4MjAwNjksImVtYWlsIjoiY3J5cHRvd29ybGR4OUBnbWFpbC5jb20iLCJhY3Rpb24iOiJ0b2tlbi1hcGkiLCJhcGlWZXJzaW9uIjoidjIiLCJpYXQiOjE3NDE0NzA4MjB9.rGwXpbL2WoMCDp6DplM0eoXXuTnEUANxQvFhKZQcv1c';

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

// Main function to fetch wallet data
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
        // Obtener información de la wallet
        const walletResponse = await fetch(`https://api.solscan.io/account?address=${walletAddress}`, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`
            }
        });
        const walletData = await walletResponse.json();

        if (walletData.success === false) {
            walletInfoDiv.innerHTML = '<p>Error al obtener datos de la wallet. Verifica la dirección.</p>';
        } else {
            displayWalletInfo(walletData, walletInfoDiv);
        }

        // Obtener transacciones de la wallet
        const txResponse = await fetch(`https://api.solscan.io/account/transactions?address=${walletAddress}&limit=10`, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`
            }
        });
        const txData = await txResponse.json();

        if (txData.success === false) {
            transactionListDiv.innerHTML = '<p>No se encontraron transacciones o hubo un error.</p>';
        } else {
            displayTransactions(txData.data || txData, transactionListDiv);
        }
    } catch (error) {
        console.error('Error:', error);
        walletInfoDiv.innerHTML = '<p>Error al conectar con la API. Intenta de nuevo más tarde.</p>';
        transactionListDiv.innerHTML = '';
    }
}

// Function to display wallet information
function displayWalletInfo(data, container) {
    // Check if data has the data property (nested response structure)
    const walletData = data.data || data;
    
    container.innerHTML = `
        <h3>Información de la Wallet</h3>
        <p><strong>Dirección:</strong> ${walletData.address || 'No disponible'}</p>
        <p><strong>Saldo SOL:</strong> ${walletData.lamports ? (walletData.lamports / 1e9).toFixed(4) : '0'} SOL</p>
        <p><strong>Tokens:</strong> ${walletData.tokenAmount ? walletData.tokenAmount.length : 0}</p>
    `;
}

// Function to display transaction list
function displayTransactions(transactions, container) {
    if (!transactions || transactions.length === 0) {
        container.innerHTML = '<p>No hay transacciones recientes.</p>';
        return;
    }

    let html = '<h3>Últimas Transacciones</h3><ul>';
    transactions.forEach(tx => {
        html += `
            <li>
                <p><strong>Hash:</strong> ${tx.txHash || 'No disponible'}</p>
                <p><strong>Fecha:</strong> ${tx.blockTime ? new Date(tx.blockTime * 1000).toLocaleString() : 'No disponible'}</p>
                <p><strong>Estado:</strong> ${tx.status || 'No disponible'}</p>
                <p><strong>Monto SOL:</strong> ${tx.lamport ? (tx.lamport / 1e9).toFixed(4) : '0'} SOL</p>
            </li>
        `;
    });
    html += '</ul>';
    container.innerHTML = html;
}
