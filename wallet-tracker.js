// Variables globales para el wallet tracker
let trackedWallet = null;
let trackedTokens = [];
let trackedNFTs = [];
let trackedTransactions = [];
let timeFrame = '24h';
let activeTab = 'tokens';

// Inicialización cuando el DOM está cargado
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar elementos de la interfaz específicos del tracker
    initTrackerUI();
});

// Inicializar elementos de la interfaz del tracker
function initTrackerUI() {
    // Configurar selectores de tiempo
    const timeButtons = document.querySelectorAll('.time-btn');
    if (timeButtons) {
        timeButtons.forEach(button => {
            button.addEventListener('click', function() {
                timeButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                timeFrame = this.dataset.time;
                if (trackedWallet) {
                    updateDashboard();
                }
            });
        });
    }
    
    // Configurar tabs
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    if (tabButtons) {
        tabButtons.forEach(button => {
            button.addEventListener('click', function() {
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabPanes.forEach(pane => pane.classList.remove('active'));
                
                this.classList.add('active');
                activeTab = this.dataset.tab;
                document.getElementById(`${activeTab}-tab`).classList.add('active');
            });
        });
    }
    
    // Configurar botón de actualización
    const refreshBtn = document.querySelector('.refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            if (trackedWallet) {
                this.classList.add('rotating');
                trackWallet(trackedWallet);
                setTimeout(() => {
                    this.classList.remove('rotating');
                }, 1000);
            }
        });
    }
    
    // Configurar filtros de transacciones
    const txTypeFilter = document.getElementById('tx-type-filter');
    const txSearch = document.getElementById('tx-search');
    
    if (txTypeFilter) {
        txTypeFilter.addEventListener('change', filterTransactions);
    }
    
    if (txSearch) {
        txSearch.addEventListener('input', filterTransactions);
    }
}

// Función principal para rastrear una wallet
async function trackWallet(address = null) {
    const walletAddress = address || document.getElementById('walletAddress').value.trim();
    
    if (!walletAddress) {
        alert('Por favor, ingresa una dirección de wallet válida.');
        return;
    }
    
    trackedWallet = walletAddress;
    document.getElementById('walletAddress').value = walletAddress;
    
    // Mostrar indicadores de carga
    document.getElementById('total-balance').innerHTML = '<div class="loader"></div>';
    document.getElementById('token-count').innerHTML = '<div class="loader"></div>';
    document.getElementById('nft-count').innerHTML = '<div class="loader"></div>';
    document.getElementById('tx-count').innerHTML = '<div class="loader"></div>';
    
    document.getElementById('token-list').innerHTML = '<div class="loader"></div>';
    document.getElementById('nft-grid').innerHTML = '<div class="loader"></div>';
    document.getElementById('transaction-list').innerHTML = '<div class="loader"></div>';
    
    try {
        // Obtener datos de la wallet en paralelo
        const [accountData, tokensData, nftsData, txData] = await Promise.all([
            fetchAccountData(walletAddress),
            fetchTokensData(walletAddress),
            fetchNFTsData(walletAddress),
            fetchTransactionsData(walletAddress)
        ]);
        
        // Actualizar datos globales
        trackedTokens = tokensData;
        trackedNFTs = nftsData;
        trackedTransactions = txData;
        
        // Actualizar dashboard
        updateDashboard(accountData);
        
    } catch (error) {
        console.error('Error al rastrear wallet:', error);
        alert('Error al obtener datos de la wallet. Intenta de nuevo más tarde.');
    }
}

// Obtener datos de la cuenta
async function fetchAccountData(address) {
    const response = await fetch(`https://api.solscan.io/account?address=${address}`, {
        headers: {
            'Authorization': `Bearer ${API_KEY}`
        }
    });
    
    const data = await response.json();
    
    if (!data.success) {
        throw new Error('Error al obtener datos de la cuenta');
    }
    
    return data.data;
}

// Obtener datos de tokens
async function fetchTokensData(address) {
    const response = await fetch(`https://api.solscan.io/account/tokens?address=${address}`, {
        headers: {
            'Authorization': `Bearer ${API_KEY}`
        }
    });
    
    const data = await response.json();
    
    if (!data.success) {
        return [];
    }
    
    // Obtener precios de tokens en paralelo
    const tokens = data.data || [];
    const tokenAddresses = tokens.map(token => token.tokenAddress).filter(Boolean);
    
    if (tokenAddresses.length > 0) {
        try {
            const pricesResponse = await fetch(`https://api.solscan.io/market/token/prices?tokens=${tokenAddresses.join(',')}`, {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`
                }
            });
            
            const pricesData = await pricesResponse.json();
            
            if (pricesData.success && pricesData.data) {
                // Añadir información de precios a los tokens
                tokens.forEach(token => {
                    const priceInfo = pricesData.data[token.tokenAddress];
                    if (priceInfo) {
                        token.price = priceInfo.price;
                        token.priceChange24h = priceInfo.priceChange24h;
                    }
                });
            }
        } catch (error) {
            console.error('Error al obtener precios de tokens:', error);
        }
    }
    
    return tokens;
}

// Obtener datos de NFTs
async function fetchNFTsData(address) {
    const response = await fetch(`https://api.solscan.io/account/nfts?address=${address}`, {
        headers: {
            'Authorization': `Bearer ${API_KEY}`
        }
    });
    
    const data = await response.json();
    
    if (!data.success) {
        return [];
    }
    
    return data.data || [];
}

// Obtener datos de transacciones
async function fetchTransactionsData(address) {
    const response = await fetch(`https://api.solscan.io/account/transactions?address=${address}&limit=50`, {
        headers: {
            'Authorization': `Bearer ${API_KEY}`
        }
    });
    
    const data = await response.json();
    
    if (!data.success) {
        return [];
    }
    
    return data.data || [];
}

// Actualizar dashboard
function updateDashboard(accountData = null) {
    // Actualizar contadores
    document.getElementById('token-count').textContent = trackedTokens.length;
    document.getElementById('nft-count').textContent = trackedNFTs.length;
    document.getElementById('tx-count').textContent = trackedTransactions.length;
    
    // Calcular saldo total
    let totalBalance = 0;
    
    if (accountData) {
        // Añadir saldo SOL
        totalBalance += accountData.lamports / 1e9;
    }
    
    // Añadir valor de tokens
    trackedTokens.forEach(token => {
        if (token.price && token.tokenAmount && token.tokenAmount.uiAmount) {
            totalBalance += token.price * token.tokenAmount.uiAmount;
        }
    });
    
    document.getElementById('total-balance').textContent = `$${totalBalance.toFixed(2)}`;
    
    // Actualizar listas según la pestaña activa
    switch (activeTab) {
        case 'tokens':
            displayTokens();
            break;
        case 'nfts':
            displayNFTs();
            break;
        case 'transactions':
            displayTransactions();
            break;
        case 'analytics':
            displayAnalytics();
            break;
    }
}

// Mostrar tokens
function displayTokens() {
    const tokenListElement = document.getElementById('token-list');
    
    if (trackedTokens.length === 0) {
        tokenListElement.innerHTML = '<p class="empty-message">No se encontraron tokens para esta wallet.</p>';
        return;
    }
    
    let html = '';
    
    // Ordenar tokens por valor (de mayor a menor)
    const sortedTokens = [...trackedTokens].sort((a, b) => {
        const valueA = (a.price || 0) * (a.tokenAmount?.uiAmount || 0);
        const valueB = (b.price || 0) * (b.tokenAmount?.uiAmount || 0);
        return valueB - valueA;
    });
    
    sortedTokens.forEach(token => {
        const tokenAmount = token.tokenAmount?.uiAmount || 0;
        const tokenPrice = token.price || 0;
        const tokenValue = tokenAmount * tokenPrice;
        const priceChange = token.priceChange24h || 0;
        const changeClass = priceChange >= 0 ? 'positive' : 'negative';
        
        html += `
        <div class="token-item">
            <div class="token-info">
                <img src="${token.logoURI || 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'}" alt
