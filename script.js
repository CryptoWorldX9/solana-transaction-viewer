// Function to load the initial page when the site loads
document.addEventListener('DOMContentLoaded', function() {
    // Show home page by default
    showPage('home');
    
    // Add event listeners for menu links
    document.querySelectorAll('.sidebar-menu a, .tool-card a[data-page]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            showPage(page);
            
            // Mark active link in sidebar
            document.querySelectorAll('.sidebar-menu li').forEach(item => {
                item.classList.remove('active');
            });
            
            // Find and activate the corresponding sidebar link
            const sidebarLink = document.querySelector(`.sidebar-menu a[data-page="${page}"]`);
            if (sidebarLink) {
                sidebarLink.parentElement.classList.add('active');
            }
            
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
    document.querySelectorAll('.network-buttons .btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.network-buttons .btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
});

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
            <p><strong>Saldo SOL:</strong> ${balance / 1000000000} SOL</p>
            <p><strong>Red:</strong> Mainnet</p>
        `;
        
        // Obtener transacciones recientes
        const transactions = await connection.getSignaturesForAddress(publicKey, {limit: 10});
        
        if (transactions && transactions.length > 0) {
            let html = '<h3>Últimas Transacciones</h3><ul class="transaction-list">';
            transactions.forEach(tx => {
                html += `
                    <li class="transaction-item">
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
        
        // Si hay un error con la API de Solana, mostrar mensaje de error
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
