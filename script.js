// API Key de Solscan
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjcmVhdGVkQXQiOjE3NDE0NzA4MjAwNjksImVtYWlsIjoiY3J5cHRvd29ybGR4OUBnbWFpbC5jb20iLCJhY3Rpb24iOiJ0b2tlbi1hcGkiLCJhcGlWZXJzaW9uIjoidjIiLCJpYXQiOjE3NDE0NzA4MjB9.rGwXpbL2WoMCDp6DplM0eoXXuTnEUANxQvFhKZQcv1c';

// Variables globales
let currentNetwork = 'mainnet';
let connectedWallet = null;

// Inicialización cuando el DOM está cargado
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar elementos de la interfaz
    initUI();
    
    // Configurar listeners para los botones de red
    setupNetworkButtons();
    
    // Configurar modales
    setupModals();
    
    // Configurar conexión de wallet
    setupWalletConnection();
});

// Inicializar elementos de la interfaz
function initUI() {
    // Toggle del sidebar en móvil
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }
    
    // Cerrar sidebar al hacer clic fuera en móvil
    document.addEventListener('click', function(event) {
        if (window.innerWidth <= 992 && 
            !event.target.closest('.sidebar') && 
            !event.target.closest('#sidebar-toggle') && 
            sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
        }
    });
    
    // Añadir botón de tema
    const themeToggle = document.createElement('button');
    themeToggle.className = 'theme-toggle';
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    themeToggle.title = 'Cambiar tema';
    document.body.appendChild(themeToggle);
    
    themeToggle.addEventListener('click', toggleTheme);
}

// Configurar botones de red
function setupNetworkButtons() {
    const networkButtons = document.querySelectorAll('.network-btn');
    
    networkButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Quitar clase active de todos los botones
            networkButtons.forEach(btn => btn.classList.remove('active'));
            
            // Añadir clase active al botón seleccionado
            this.classList.add('active');
            
            // Actualizar red actual
            currentNetwork = this.dataset.network;
            console.log(`Red cambiada a: ${currentNetwork}`);
        });
    });
}

// Configurar modales
function setupModals() {
    // Modal de búsqueda
    const searchBtn = document.getElementById('search-btn');
    const searchModal = document.getElementById('search-modal');
    const searchInput = document.getElementById('search-input');
    const searchSubmit = document.getElementById('search-submit');
    
    if (searchBtn && searchModal) {
        searchBtn.addEventListener('click', function() {
            searchModal.style.display = 'block';
            searchInput.focus();
        });
    }
    
    if (searchSubmit) {
        searchSubmit.addEventListener('click', function() {
            performSearch(searchInput.value);
        });
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch(this.value);
            }
        });
    }
    
    // Modal de wallet
    const walletBtn = document.getElementById('wallet-connect-btn');
    const walletModal = document.getElementById('wallet-modal');
    const walletOptions = document.querySelectorAll('.wallet-option');
    
    if (walletBtn && walletModal) {
        walletBtn.addEventListener('click', function() {
            if (connectedWallet) {
                disconnectWallet();
            } else {
                walletModal.style.display = 'block';
            }
        });
    }
    
    if (walletOptions) {
        walletOptions.forEach(option => {
            option.addEventListener('click', function() {
                const walletType = this.dataset.wallet;
                connectWallet(walletType);
                walletModal.style.display = 'none';
            });
        });
    }
    
    // Cerrar modales
    const closeButtons = document.querySelectorAll('.close-modal');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
}

// Realizar búsqueda
function performSearch(query) {
    if (!query.trim()) {
        alert('Por favor, ingresa un término de búsqueda');
        return;
    }
    
    const searchResults = document.getElementById('search-results');
    searchResults.innerHTML = '<div class="loader"></div>';
    
    // Determinar si es una dirección de wallet o un hash de transacción
    if (query.length === 44 || query.length === 43) {
        // Probablemente una dirección de wallet
        fetchWalletData(query);
        document.getElementById('search-modal').style.display = 'none';
        document.getElementById('walletAddress').value = query;
    } else if (query.length === 88 || query.length === 87) {
        // Probablemente un hash de transacción
        fetchTransactionData(query);
        document.getElementById('search-modal').style.display = 'none';
    } else {
        // Búsqueda general
        searchResults.innerHTML = '<p>Búsqueda no válida. Ingresa una dirección de wallet o hash de transacción.</p>';
    }
}

// Configurar conexión de wallet
function setupWalletConnection() {
    // Comprobar si Phantom está instalado
    const isPhantomInstalled = window.solana && window.solana.isPhantom;
    
    if (isPhantomInstalled) {
        console.log('Phantom está instalado');
    } else {
        console.log('Phantom no está instalado');
    }
}

// Conectar wallet
async function connectWallet(walletType) {
    try {
        let wallet;
        
        switch (walletType) {
            case 'phantom':
                if (window.solana && window.solana.isPhantom) {
                    wallet = window.solana;
                } else {
                    alert('Phantom no está instalado. Por favor, instala la extensión Phantom.');
                    return;
                }
                break;
            case 'solflare':
                if (window.solflare) {
                    wallet = window.solflare;
                } else {
                    alert('Solflare no está instalado. Por favor, instala la extensión Solflare.');
                    return;
                }
                break;
            default:
                alert('Wallet no soportada o no instalada.');
                return;
        }
        
        const response = await wallet.connect();
        connectedWallet = {
            publicKey: response.publicKey.toString(),
            type: walletType
        };
        
        updateWalletButton();
        
        // Cargar datos de la wallet conectada
        document.getElementById('walletAddress').value = connectedWallet.publicKey;
        fetchWalletData(connectedWallet.publicKey);
        
        console.log('Wallet conectada:', connectedWallet);
    } catch (error) {
        console.error('Error al conectar wallet:', error);
        alert('Error al conectar wallet: ' + error.message);
    }
}

// Desconectar wallet
function disconnectWallet() {
    try {
        if (connectedWallet.type === 'phantom' && window.solana) {
            window.solana.disconnect();
        } else if (connectedWallet.type === 'solflare' && window.solflare) {
            window.solflare.disconnect();
        }
        
        connectedWallet = null;
        updateWalletButton();
        console.log('Wallet desconectada');
    } catch (error) {
        console.error('Error al desconectar wallet:', error);
    }
}

// Actualizar botón de wallet
function updateWalletButton() {
    const walletBtn = document.getElementById('wallet-connect-btn');
    
    if (connectedWallet) {
        walletBtn.innerHTML = `<i class="fas fa-wallet"></i> <span>${connectedWallet.publicKey.slice(0, 4)}...${connectedWallet.publicKey.slice(-4)}</span>`;
        walletBtn.classList.add('connected');
    } else {
        walletBtn.innerHTML = `<i class="fas fa-wallet"></i> <span>Conectar Wallet</span>`;
        walletBtn.classList.remove('connected');
    }
}

// Cambiar tema
function toggleTheme() {
    document.body.classList.toggle('light-theme');
    
    const themeIcon = document.querySelector('.theme-toggle i');
    if (document.body.classList.contains('light-theme')) {
        themeIcon.className = 'fas fa-sun';
    } else {
        themeIcon.className = 'fas fa-moon';
    }
}

// Función principal para obtener datos de la wallet
async function fetchWalletData(address = null) {
    const walletAddress = address || document.getElementById('walletAddress').value.trim();
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

        if (walletData.success) {
            displayWalletInfo(walletData.data, walletInfoDiv);
        } else {
            walletInfoDiv.innerHTML = '<p>Error al obtener datos de la wallet. Verifica la dirección.</p>';
        }

        // Obtener transacciones de la wallet
        const txResponse = await fetch(`https://api.solscan.io/account/transactions?address=${walletAddress}&limit=10`, {
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

// Función para obtener datos de una transacción
async function fetchTransactionData(txHash) {
    const walletInfoDiv = document.getElementById('walletInfo');
    const transactionListDiv = document.getElementById('transactionList');
    
    walletInfoDiv.innerHTML = '<p>Buscando transacción...</p>';
    transactionListDiv.innerHTML = '<div class="loader"></div>';
    
    try {
        const txResponse = await fetch(`https://api.solscan.io/transaction?tx=${txHash}`, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`
            }
        });
        const txData = await txResponse.json();
        
        if (txData.success) {
            walletInfoDiv.innerHTML = `<h3>Detalles de la Transacción</h3>
                <p><strong>Hash:</strong> ${txData.data.txHash}</p>
                <p><strong>Estado:</strong> ${txData.data.status}</p>
                <p><strong>Bloque:</strong> ${txData.data.slot}</p>
                <p><strong>Fecha:</strong> ${new Date(txData.data.blockTime * 1000).toLocaleString()}</p>`;
            
            displayTransactionDetails(txData.data, transactionListDiv);
        } else {
            walletInfoDiv.innerHTML = '<p>Error al obtener datos de la transacción. Verifica el hash.</p>';
            transactionListDiv.innerHTML = '';
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
    
    // Si hay tokens, mostrarlos
    if (data.tokenAmount && data.tokenAmount.length > 0) {
        let tokensHtml = '<h3>Tokens</h3><ul class="token-list">';
        data.tokenAmount.forEach(token => {
            tokensHtml += `
            <li>
                <p><strong>${token.tokenName || 'Token desconocido'}</strong></p>
                <p>Cantidad: ${token.tokenAmount.uiAmount}</p>
            </li>
            `;
        });
        tokensHtml += '</ul>';
        container.innerHTML += tokensHtml;
    }
}

// Función para mostrar lista de transacciones
function displayTransactions(transactions, container) {
    if (!transactions || transactions.length === 0) {
        container.innerHTML = '<p>No hay transacciones recientes.</p>';
        return;
    }

    let html = '<h3>Últimas Transacciones</h3><ul class="transaction-list">';
    transactions.forEach(tx => {
        html += `
        <li>
            <p><strong>Hash:</strong> <a href="#" onclick="fetchTransactionData('${tx.txHash}'); return false;">${tx.txHash.substring(0, 10)}...${tx.txHash.substring(tx.txHash.length - 10)}</a></p>
            <p><strong>Fecha:</strong> ${new Date(tx.blockTime * 1000).toLocaleString()}</p>
            <p><strong>Estado:</strong> <span class="status ${tx.status === 'Success' ? 'success' : 'error'}">${tx.status}</span></p>
            <p><strong>Monto SOL:</strong> ${(tx.lamport / 1e9).toFixed(4)} SOL</p>
        </li>
        `;
    });
    html += '</ul>';
    container.innerHTML = html;
}

// Función para mostrar detalles de una transacción
function displayTransactionDetails(transaction, container) {
    let html = '<h3>Detalles de la Transacción</h3>';
    
    // Información básica
    html += `
    <div class="transaction-detail">
        <p><strong>Tipo:</strong> ${transaction.type || 'Transferencia'}</p>
        <p><strong>Fee:</strong> ${transaction.fee / 1e9} SOL</p>
    </div>
    `;
    
    // Remitente y destinatario
    if (transaction.signer && transaction.signer.length > 0) {
        html += `<p><strong>Remitente:</strong> ${transaction.signer[0]}</p>`;
    }
    
    if (transaction.tokenTransfers && transaction.tokenTransfers.length > 0) {
        html += '<h4>Transferencias de Tokens</h4><ul>';
        transaction.tokenTransfers.forEach(transfer => {
            html += `
            <li>
                <p><strong>Token:</strong> ${transfer.tokenName || 'Desconocido'}</p>
                <p><strong>De:</strong> ${transfer.source}</p>
                <p><strong>A:</strong> ${transfer.destination}</p>
                <p><strong>Cantidad:</strong> ${transfer.amount}</p>
            </li>
            `;
        });
        html += '</ul>';
    }
    
    container.innerHTML = html;
}
