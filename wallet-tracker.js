// API Key de Solscan
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjcmVhdGVkQXQiOjE3NDE0NzA4MjAwNjksImVtYWlsIjoiY3J5cHRvd29ybGR4OUBnbWFpbC5jb20iLCJhY3Rpb24iOiJ0b2tlbi1hcGkiLCJhcGlWZXJzaW9uIjoidjIiLCJpYXQiOjE3NDE0NzA4MjB9.rGwXpbL2WoMCDp6DplM0eoXXuTnEUANxQvFhKZQcv1c';

// Configuración
let currentNetwork = 'mainnet';
let currentPage = 1;
const txPerPage = 10;
let trackedWalletAddress = '';

document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const walletSearchInput = document.getElementById('walletSearchInput');
    const walletSearchBtn = document.getElementById('walletSearchBtn');
    const networkOptions = document.querySelectorAll('.option-btn[data-network]');
    const walletDetails = document.getElementById('walletDetails');
    const trackedWalletAddressEl = document.getElementById('trackedWalletAddress');
    const copyTrackedAddressBtn = document.getElementById('copyTrackedAddressBtn');
    const refreshWalletBtn = document.getElementById('refreshWalletBtn');
    const viewOnSolscan = document.getElementById('viewOnSolscan');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    const prevTxPage = document.getElementById('prevTxPage');
    const nextTxPage = document.getElementById('nextTxPage');
    const txPageInfo = document.getElementById('txPageInfo');
    
    // Inicializar eventos
    if (walletSearchBtn && walletSearchInput) {
        walletSearchBtn.addEventListener('click', searchWallet);
        walletSearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchWallet();
            }
        });
    }
    
    // Cambiar red
    if (networkOptions) {
        networkOptions.forEach(option => {
            option.addEventListener('click', function() {
                networkOptions.forEach(opt => opt.classList.remove('active'));
                this.classList.add('active');
                currentNetwork = this.getAttribute('data-network');
                console.log('Network changed to:', currentNetwork);
            });
        });
    }
    
    // Copiar dirección
    if (copyTrackedAddressBtn) {
        copyTrackedAddressBtn.addEventListener('click', function() {
            if (trackedWalletAddress) {
                navigator.clipboard.writeText(trackedWalletAddress)
                    .then(() => {
                        const originalText = copyTrackedAddressBtn.innerHTML;
                        copyTrackedAddressBtn.innerHTML = '<i class="fas fa-check"></i>';
                        setTimeout(() => {
                            copyTrackedAddressBtn.innerHTML = originalText;
                        }, 2000);
                    })
                    .catch(err => {
                        console.error('Error copying address:', err);
                    });
            }
        });
    }
    
    // Refrescar datos
    if (refreshWalletBtn) {
        refreshWalletBtn.addEventListener('click', function() {
            if (trackedWalletAddress) {
                fetchWalletData(trackedWalletAddress);
            }
        });
    }
    
    // Cambiar tabs
    if (tabButtons && tabPanes) {
        tabButtons.forEach(button => {
            button.addEventListener('click', function() {
                const tabName = this.getAttribute('data-tab');
                
                // Activar botón
                tabButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                // Mostrar contenido
                tabPanes.forEach(pane => {
                    pane.classList.remove('active');
                    if (pane.id === `${tabName}Tab`) {
                        pane.classList.add('active');
                    }
                });
            });
        });
    }
    
    // Paginación de transacciones
    if (prevTxPage) {
        prevTxPage.addEventListener('click', function() {
            if (currentPage > 1) {
                currentPage--;
                fetchTransactions(trackedWalletAddress);
                updatePaginationUI();
            }
        });
    }
    
    if (nextTxPage) {
        nextTxPage.addEventListener('click', function() {
            currentPage++;
            fetchTransactions(trackedWalletAddress);
            updatePaginationUI();
        });
    }
    
    // Función para buscar wallet
    function searchWallet() {
        const address = walletSearchInput.value.trim();
        if (!address) {
            alert('Please enter a valid wallet address');
            return;
        }
        
        fetchWalletData(address);
    }
    
    // Función para obtener datos de la wallet
    async function fetchWalletData(address) {
        trackedWalletAddress = address;
        
        if (walletDetails) walletDetails.style.display = 'flex';
        if (trackedWalletAddressEl) trackedWalletAddressEl.textContent = address;
        if (viewOnSolscan) viewOnSolscan.href = `https://solscan.io/account/${address}`;
        
        // Obtener balance
        try {
            const publicKey = new solanaWeb3.PublicKey(address);
            const connection = new solanaWeb3.Connection(getNetworkUrl(currentNetwork));
            
            // Obtener balance
            const balance = await connection.getBalance(publicKey);
            document.getElementById('solBalance').textContent = (balance / solanaWeb3.LAMPORTS_PER_SOL).toFixed(4);
            
            // Obtener tokens (simulado)
            document.getElementById('trackedTokenCount').textContent = Math.floor(Math.random() * 20);
            document.getElementById('trackedNftCount').textContent = Math.floor(Math.random() * 10);
            document.getElementById('trackedTxCount').textContent = Math.floor(Math.random() * 200);
            
            // Obtener transacciones
            fetchTransactions(address);
            
            // Obtener tokens
            fetchTokens(address);
            
            // Obtener NFTs
            fetchNFTs(address);
            
            // Generar gráficos
            generateCharts();
            
        } catch (err) {
            console.error('Error fetching wallet data:', err);
            alert('Error fetching wallet data. Please check the address and try again.');
        }
    }
    
    // Función para obtener transacciones
    async function fetchTransactions(address) {
        const transactionsTableBody = document.getElementById('transactionsTableBody');
        if (!transactionsTableBody) return;
        
        transactionsTableBody.innerHTML = '<tr class="loading-row"><td colspan="5">Loading transaction data...</td></tr>';
        
        try {
            // Usar Solscan API para obtener transacciones
            const response = await fetch(`https://api.solscan.io/account/transactions?address=${address}&limit=${txPerPage}&offset=${(currentPage - 1) * txPerPage}`, {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`
                }
            });
            
            const data = await response.json();
            
            if (data && data.data && Array.isArray(data.data)) {
                let html = '';
                
                if (data.data.length === 0) {
                    html = '<tr><td colspan="5">No transactions found</td></tr>';
                } else {
                    data.data.forEach(tx => {
                        const date = new Date(tx.blockTime * 1000).toLocaleString();
                        const signature = tx.txHash;
                        const shortSignature = `${signature.substring(0, 8)}...${signature.substring(signature.length - 8)}`;
                        const status = tx.status === 'Success' ? 
                            '<span class="status-badge success">Success</span>' : 
                            '<span class="status-badge error">Failed</span>';
                        
                        // Determinar tipo de transacción (simplificado)
                        let type = 'Unknown';
                        let typeClass = '';
                        
                        if (tx.tokenTransfers && tx.tokenTransfers.length > 0) {
                            type = 'Token Transfer';
                            typeClass = 'token-transfer';
                        } else if (tx.instructions && tx.instructions.some(i => i.name && i.name.includes('Swap'))) {
                            type = 'Swap';
                            typeClass = 'swap';
                        } else if (tx.instructions && tx.instructions.some(i => i.name && i.name.includes('Transfer'))) {
                            type = 'SOL Transfer';
                            typeClass = 'sol-transfer';
                        } else if (tx.instructions && tx.instructions.some(i => i.name && i.name.includes('Mint'))) {
                            type = 'Mint';
                            typeClass = 'mint';
                        } else if (tx.instructions && tx.instructions.some(i => i.name && i.name.includes('Burn'))) {
                            type = 'Burn';
                            typeClass = 'burn';
                        }
                        
                        // Determinar monto (simplificado)
                        let amount = '-';
                        if (tx.tokenTransfers && tx.tokenTransfers.length > 0) {
                            amount = `${tx.tokenTransfers[0].amount} ${tx.tokenTransfers[0].symbol || 'tokens'}`;
                        } else if (tx.lamport) {
                            amount = `${(tx.lamport / solanaWeb3.LAMPORTS_PER_SOL).toFixed(4)} SOL`;
                        }
                        
                        html += `
                            <tr>
                                <td>
                                    <a href="https://solscan.io/tx/${signature}" target="_blank" class="tx-signature">
                                        ${shortSignature}
                                    </a>
                                </td>
                                <td><span class="tx-type ${typeClass}">${type}</span></td>
                                <td>${amount}</td>
                                <td>${date}</td>
                                <td>${status}</td>
                            </tr>
                        `;
                    });
                }
                
                transactionsTableBody.innerHTML = html;
                updatePaginationUI();
            } else {
                transactionsTableBody.innerHTML = '<tr><td colspan="5">Error loading transactions</td></tr>';
            }
        } catch (err) {
            console.error('Error fetching transactions:', err);
            transactionsTableBody.innerHTML = '<tr><td colspan="5">Error loading transactions</td></tr>';
        }
    }
    
    // Función para obtener tokens
    async function fetchTokens(address) {
        const tokensTableBody = document.getElementById('tokensTableBody');
        if (!tokensTableBody) return;
        
        tokensTableBody.innerHTML = '<tr class="loading-row"><td colspan="5">Loading token data...</td></tr>';
        
        try {
            // Usar Solscan API para obtener tokens
            const response = await fetch(`https://api.solscan.io/account/tokens?address=${address}`, {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`
                }
            });
            
            const data = await response.json();
            
            if (data && data.data && Array.isArray(data.data)) {
                let html = '';
                
                if (data.data.length === 0) {
                    html = '<tr><td colspan="5">No tokens found</td></tr>';
                } else {
                    data.data.forEach(token => {
                        const tokenName = token.tokenName || 'Unknown Token';
                        const tokenSymbol = token.tokenSymbol || '???';
                        const tokenIcon = token.tokenIcon || 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png';
                        const balance = token.tokenAmount?.uiAmount || 0;
                        
                        // Datos simulados para precio y cambio
                        const price = (Math.random() * 100).toFixed(token.tokenSymbol === 'SOL' ? 2 : 4);
                        const value = (balance * price).toFixed(2);
                        const change = (Math.random() * 20 - 10).toFixed(2);
                        const changeClass = parseFloat(change) >= 0 ? 'positive' : 'negative';
                        const changeIcon = parseFloat(change) >= 0 ? 'fa-caret-up' : 'fa-caret-down';
                        
                        html += `
                            <tr>
                                <td>
                                    <div class="token-info">
                                        <img src="${tokenIcon}" alt="${tokenSymbol}" class="token-icon">
                                        <div>
                                            <div class="token-name">${tokenName}</div>
                                            <div class="token-symbol">${tokenSymbol}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>${balance.toLocaleString()}</td>
                                <td>$${value}</td>
                                <td>$${price}</td>
                                <td class="${changeClass}">
                                    <i class="fas ${changeIcon}"></i> ${Math.abs(change)}%
                                </td>
                            </tr>
                        `;
                    });
                }
                
                tokensTableBody.innerHTML = html;
            } else {
                tokensTableBody.innerHTML = '<tr><td colspan="5">Error loading tokens</td></tr>';
            }
        } catch (err) {
            console.error('Error fetching tokens:', err);
            tokensTableBody.innerHTML = '<tr><td colspan="5">Error loading tokens</td></tr>';
        }
    }
    
    // Función para obtener NFTs
    async function fetchNFTs(address) {
        const nftsGrid = document.getElementById('nftsGrid');
        if (!nftsGrid) return;
        
        nftsGrid.innerHTML = '<div class="loading-message">Loading NFT data...</div>';
        
        try {
            // Usar Solscan API para obtener NFTs
            const response = await fetch(`https://api.solscan.io/account/nfts?address=${address}`, {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`
                }
            });
            
            const data = await response.json();
            
            if (data && data.data && Array.isArray(data.data)) {
                let html = '';
                
                if (data.data.length === 0) {
                    html = '<div class="no-data-message">No NFTs found</div>';
                } else {
                    data.data.forEach(nft => {
                        const nftName = nft.name || 'Unknown NFT';
                        const nftImage = nft.image || 'https://via.placeholder.com/150?text=No+Image';
                        const nftCollection = nft.collection?.name || 'Unknown Collection';
                        
                        html += `
                            <div class="nft-card">
                                <div class="nft-image">
                                    <img src="${nftImage}" alt="${nftName}">
                                </div>
                                <div class="nft-info">
                                    <h4>${nftName}</h4>
                                    <p>${nftCollection}</p>
                                </div>
                            </div>
                        `;
                    });
                }
                
                nftsGrid.innerHTML = html;
            } else {
                nftsGrid.innerHTML = '<div class="no-data-message">Error loading NFTs</div>';
            }
        } catch (err) {
            console.error('Error fetching NFTs:', err);
            nftsGrid.innerHTML = '<div class="no-data-message">Error loading NFTs</div>';
        }
    }
    
    // Función para generar gráficos
    function generateCharts() {
        // Simulación de datos para los gráficos
        
        // Balance History Chart
        const balanceCtx = document.getElementById('balanceChart');
        if (balanceCtx) {
            const dates = [];
            const balances = [];
            
            // Generar datos de los últimos 30 días
            const today = new Date();
            let balance = Math.random() * 10 + 1; // Balance inicial entre 1 y 11 SOL
            
            for (let i = 30; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(today.getDate() - i);
                dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
                
                // Simular cambios en el balance
                balance += (Math.random() - 0.45) * 0.5;
                balance = Math.max(0.1, balance); // Asegurar que no sea negativo
                balances.push(balance.toFixed(2));
            }
            
            new Chart(balanceCtx, {
                type: 'line',
                data: {
                    labels: dates,
                    datasets: [{
                        label: 'SOL Balance',
                        data: balances,
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                                color: '#94a3b8'
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            },
                            ticks: {
                                color: '#94a3b8',
                                maxRotation: 45,
                                minRotation: 45
                            }
                        }
                    }
                }
            });
        }
        
        // Transaction Activity Chart
        const activityCtx = document.getElementById('activityChart');
        if (activityCtx) {
            const dates = [];
            const activities = [];
            
            // Generar datos de los últimos 30 días
            const today = new Date();
            
            for (let i = 30; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(today.getDate() - i);
                dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
                
                // Simular actividad de transacciones
                activities.push(Math.floor(Math.random() * 10));
            }
            
            new Chart(activityCtx, {
                type: 'bar',
                data: {
                    labels: dates,
                    datasets: [{
                        label: 'Transactions',
                        data: activities,
                        backgroundColor: '#3b82f6',
                        borderRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                                color: '#94a3b8',
                                stepSize: 1
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            },
                            ticks: {
                                color: '#94a3b8',
                                maxRotation: 45,
                                minRotation: 45
                            }
                        }
                    }
                }
            });
        }
        
        // Token Distribution Chart
        const distributionCtx = document.getElementById('distributionChart');
        if (distributionCtx) {
            // Simular distribución de tokens
            const tokens = ['SOL', 'USDC', 'RAY', 'SRM', 'Other'];
            const values = [45, 25, 15, 10, 5];
            const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
            
            new Chart(distributionCtx, {
                type: 'doughnut',
                data: {
                    labels: tokens,
                    datasets: [{
                        data: values,
                        backgroundColor: colors,
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: {
                                color: '#94a3b8',
                                padding: 10,
                                usePointStyle: true,
                                pointStyle: 'circle'
                            }
                        }
                    },
                    cutout: '70%'
                }
            });
        }
        
        // Transaction Types Chart
        const txTypesCtx = document.getElementById('txTypesChart');
        if (txTypesCtx) {
            // Simular tipos de transacciones
            const types = ['Transfers', 'Swaps', 'Mints', 'Burns', 'Other'];
            const counts = [40, 30, 15, 10, 5];
            const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
            
            new Chart(txTypesCtx, {
                type: 'pie',
                data: {
                    labels: types,
                    datasets: [{
                        data: counts,
                        backgroundColor: colors,
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: {
                                color: '#94a3b8',
                                padding: 10,
                                usePointStyle: true,
                                pointStyle: 'circle'
                            }
                        }
                    }
                }
            });
        }
    }
    
    // Función para actualizar UI de paginación
    function updatePaginationUI() {
        if (prevTxPage) prevTxPage.disabled = currentPage <= 1;
        if (txPageInfo) txPageInfo.textContent = `Page ${currentPage}`;
    }
    
    // Función para obtener URL de la red
    function getNetworkUrl(network) {
        switch (network) {
            case 'mainnet':
                return 'https://api.mainnet-beta.solana.com';
            case 'devnet':
                return 'https://api.devnet.solana.com';
            case 'testnet':
                return 'https://api.testnet.solana.com';
            default:
                return 'https://api.mainnet-beta.solana.com';
        }
    }
    
    // Verificar si hay una dirección en la URL
    const urlParams = new URLSearchParams(window.location.search);
    const addressParam = urlParams.get('address');
    
    if (addressParam) {
        if (walletSearchInput) walletSearchInput.value = addressParam;
        fetchWalletData(addressParam);
    }
});
