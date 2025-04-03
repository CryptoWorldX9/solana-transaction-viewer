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

// Función para obtener datos de la wallet (versión de demostración)
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

    // Simular un retraso para la carga
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
        // Verificar si la dirección tiene un formato válido (simplificado)
        if (!isValidSolanaAddress(walletAddress)) {
            walletInfoDiv.innerHTML = '<p>Dirección de wallet inválida. Por favor, verifica e intenta de nuevo.</p>';
            transactionListDiv.innerHTML = '';
            return;
        }
        
        // Generar datos de demostración basados en la dirección
        const balance = generateRandomBalance(walletAddress);
        
        // Mostrar información de la wallet
        walletInfoDiv.innerHTML = `
            <h3>Información de la Wallet</h3>
            <p><strong>Dirección:</strong> ${walletAddress}</p>
            <p><strong>Saldo SOL:</strong> ${balance.toFixed(4)} SOL</p>
            <p><strong>Red:</strong> ${getSelectedNetwork()}</p>
            <p><strong>Tokens:</strong> ${Math.floor(Math.random() * 10)}</p>
        `;
        
        // Generar transacciones de demostración
        const transactions = generateDemoTransactions(walletAddress, 5);
        
        if (transactions.length > 0) {
            let html = '<h3>Últimas Transacciones</h3><ul>';
            transactions.forEach(tx => {
                html += `
                    <li>
                        <p><strong>Signature:</strong> ${tx.signature}</p>
                        <p><strong>Slot:</strong> ${tx.slot}</p>
                        <p><strong>Fecha:</strong> ${tx.date}</p>
                        <p><strong>Estado:</strong> ${tx.status}</p>
                        <p><strong>Monto:</strong> ${tx.amount} SOL</p>
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

// Función para verificar si una dirección tiene formato válido de Solana
function isValidSolanaAddress(address) {
    // Verificación básica: longitud y caracteres válidos
    return address.length >= 32 && address.length <= 44 && /^[A-Za-z0-9]+$/.test(address);
}

// Función para obtener la red seleccionada
function getSelectedNetwork() {
    const activeNetwork = document.querySelector('.network-btn.active');
    return activeNetwork ? activeNetwork.textContent : 'Mainnet';
}

// Función para generar un balance aleatorio pero consistente para una dirección
function generateRandomBalance(address) {
    // Usar la suma de códigos de caracteres para generar un número "aleatorio" pero consistente
    let sum = 0;
    for (let i = 0; i < address.length; i++) {
        sum += address.charCodeAt(i);
    }
    // Generar un balance entre 0.1 y 50 SOL
    return (sum % 500) / 10 + 0.1;
}

// Función para generar transacciones de demostración
function generateDemoTransactions(address, count) {
    const transactions = [];
    const now = new Date();
    
    for (let i = 0; i < count; i++) {
        // Restar días aleatorios para las fechas
        const txDate = new Date(now);
        txDate.setDate(txDate.getDate() - i - Math.floor(Math.random() * 3));
        
        // Generar un hash único basado en la dirección y el índice
        const signature = generateDemoSignature(address, i);
        
        // Generar un monto aleatorio entre 0.001 y 5 SOL
        const amount = (Math.random() * 5 + 0.001).toFixed(4);
        
        transactions.push({
            signature: signature,
            slot: 150000000 - i * 1000 - Math.floor(Math.random() * 1000),
            date: txDate.toLocaleString(),
            status: Math.random() > 0.1 ? 'Confirmada' : 'Pendiente',
            amount: amount
        });
    }
    
    return transactions;
}

// Función para generar una firma de demostración
function generateDemoSignature(address, index) {
    // Tomar los primeros 8 caracteres de la dirección
    const prefix = address.substring(0, 8);
    // Generar una cadena aleatoria
    const randomPart = Math.random().toString(36).substring(2, 10);
    // Combinar para crear una firma única
    return `${prefix}${randomPart}${index}...`;
}
