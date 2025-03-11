const rpcUrl = 'https://mainnet.helius-rpc.com/?api-key=6fbed4b2-ce46-4c7d-b827-2c1d5a539ff2';
const coingeckoPriceUrl = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin,solana,ripple,usd-coin,tether,dogecoin&vs_currencies=usd';
const coingeckoTokenUrl = 'https://api.coingecko.com/api/v3/simple/token_price/';

const tokenNames = {
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 'USDC',
    'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': 'USDT',
    'So11111111111111111111111111111111111111112': 'SOL',
    '7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj': 'stSOL'
};

// 🌐 Conectar/Desconectar wallet (Phantom)
let isWalletConnected = false;

async function toggleWallet() {
    const walletIcon = document.getElementById("wallet-icon");
    if (!isWalletConnected) {
        if (window.solana && window.solana.isPhantom) {
            try {
                const response = await window.solana.connect();
                alert(`Phantom Wallet connected: ${response.publicKey.toString()}`);
                document.getElementById("walletAddress").value = response.publicKey.toString();
                walletIcon.classList.remove("fas", "fa-wallet");
                walletIcon.classList.add("fas", "fa-sign-out-alt");
                walletIcon.title = "Disconnect Wallet";
                isWalletConnected = true;
            } catch (err) {
                alert("Could not connect wallet.");
            }
        } else {
            alert("Please install Phantom Wallet.");
        }
    } else {
        try {
            await window.solana.disconnect();
            alert("Wallet disconnected.");
            document.getElementById("walletAddress").value = "";
            walletIcon.classList.remove("fas", "fa-sign-out-alt");
            walletIcon.classList.add("fas", "fa-wallet");
            walletIcon.title = "Connect Wallet";
            isWalletConnected = false;
        } catch (err) {
            alert("Error disconnecting wallet.");
        }
    }
}

document.getElementById("wallet-icon").addEventListener("click", toggleWallet);

async function fetchWalletData() {
    const walletAddress = document.getElementById('walletAddress').value.trim();
    const walletInfoDiv = document.getElementById('walletInfo');
    const transactionListDiv = document.getElementById('transactionList');
    const loadingBar = document.getElementById('loadingBar');

    if (!walletAddress) {
        alert('Please enter a valid wallet address.');
        return;
    }

    loadingBar.style.display = 'block';
    walletInfoDiv.innerHTML = '';
    transactionListDiv.innerHTML = '';

    try {
        const priceResponse = await fetch(coingeckoPriceUrl);
        const priceData = await priceResponse.json();
        const solPriceUSD = priceData.solana.usd;

        const walletResponse = await fetch(rpcUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'getAccountInfo',
                params: [walletAddress, { encoding: 'jsonParsed' }]
            })
        });
        const walletData = await walletResponse.json();

        const tokenResponse = await fetch(rpcUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'getTokenAccountsByOwner',
                params: [walletAddress, { programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' }, { encoding: 'jsonParsed' }]
            })
        });
        const tokenData = await tokenResponse.json();

        let tokenPrices = {};
        if (tokenData.result?.value?.length > 0) {
            const tokenAddresses = tokenData.result.value.map(t => t.account.data.parsed?.info?.mint).filter(Boolean).join(',');
            const tokenPriceResponse = await fetch(coingeckoTokenUrl + 'solana?contract_addresses=' + tokenAddresses + '&vs_currencies=usd');
            if (tokenPriceResponse.ok) {
                tokenPrices = await tokenPriceResponse.json();
            } else {
                console.warn('Error fetching token prices:', tokenPriceResponse.status);
            }
        }

        const txResponse = await fetch(rpcUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'getSignaturesForAddress',
                params: [walletAddress, { limit: 10 }]
            })
        });
        const txData = await txResponse.json();

        const totalTxResponse = await fetch(rpcUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'getConfirmedSignaturesForAddress2',
                params: [walletAddress, { limit: 1000 }]
            })
        });
        const totalTxData = await totalTxResponse.json();

        const tpsResponse = await fetch(rpcUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'getRecentPerformanceSamples',
                params: [1]
            })
        });
        const tpsData = await tpsResponse.json();

        if (walletData.result) {
            displayWalletInfo(walletData.result.value, tokenData.result?.value || [], solPriceUSD, tpsData.result, totalTxData.result || [], tokenPrices, walletAddress, walletInfoDiv);
        } else {
            walletInfoDiv.innerHTML = '<p>Error fetching wallet data. Please verify the address.</p>';
        }

        if (txData.result) {
            displayTransactions(txData.result, transactionListDiv);
        } else {
            transactionListDiv.innerHTML = '<p>No recent transactions found or an error occurred.</p>';
        }

        document.getElementById("walletAddress").value = "";
    } catch (error) {
        console.error('Error in fetchWalletData:', error);
        walletInfoDiv.innerHTML = '<p>Error connecting to the API. Please try again later.</p>';
        transactionListDiv.innerHTML = '';
        document.getElementById("walletAddress").value = "";
    } finally {
        loadingBar.style.display = 'none';
    }
}

function displayWalletInfo(accountData, tokenAccounts, solPriceUSD, tpsData, totalTxData, tokenPrices, walletAddress, container) {
    const solBalance = accountData.lamports ? (accountData.lamports / 1e9) : 0;
    const usdBalance = (solBalance * solPriceUSD).toFixed(2);
    const tokenBalances = Array.isArray(tokenAccounts) && tokenAccounts.length > 0 ? tokenAccounts.map(t => t.account.data.parsed?.info?.tokenAmount?.uiAmount || 0).reduce((a, b) => a + b, 0) : 0;
    const tps = tpsData && tpsData[0] ? (tpsData[0].numTransactions / tpsData[0].samplePeriodSecs).toFixed(2) : 'N/A';
    const lastActivity = totalTxData && totalTxData[0] ? new Date(totalTxData[0].blockTime * 1000).toLocaleString() : 'N/A';
    const totalTransactions = totalTxData ? totalTxData.length : 'N/A';
    const rentExempt = accountData.rentExempt ? 'Yes' : 'No';

    let tokenHtml = '';
    if (Array.isArray(tokenAccounts) && tokenAccounts.length > 0) {
        tokenHtml = `
            <table class="token-table">
                <thead>
                    <tr>
                        <th>Token</th>
                        <th>Amount</th>
                        <th>Value USD</th>
                        <th>% of Supply</th>
                    </tr>
                </thead>
                <tbody>
        `;
        tokenAccounts.forEach(t => {
            const parsedInfo = t.account.data.parsed?.info;
            const mint = parsedInfo?.mint || 'Unknown';
            const tokenName = tokenNames[mint] || mint.slice(0, 8) + '...';
            const amount = parsedInfo?.tokenAmount?.uiAmount || 0;
            const priceUSD = tokenPrices[mint]?.usd || 'N/A';
            const totalUSD = priceUSD !== 'N/A' ? (amount * priceUSD).toFixed(2) : 'N/A';
            const supplyPercent = amount / 1e9 * 100;
            tokenHtml += `
                <tr>
                    <td>${tokenName}</td>
                    <td>${amount.toFixed(4)}</td>
                    <td>$${totalUSD}</td>
                    <td>${supplyPercent.toFixed(2)}%</td>
                </tr>
            `;
        });
        tokenHtml += '</tbody></table>';
    } else {
        tokenHtml = 'None';
    }

    let html = `
        <h3>Wallet Information</h3>
        <table>
            <thead>
                <tr>
                    <th>Data</th>
                    <th>Value</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Address</td>
                    <td>${walletAddress} <button class="copy-btn" onclick="navigator.clipboard.writeText('${walletAddress}')">Copy</button></td>
                </tr>
                <tr>
                    <td>SOL Balance</td>
                    <td>${solBalance.toFixed(4)} SOL</td>
                </tr>
                <tr>
                    <td>Value in USD</td>
                    <td>$${usdBalance}</td>
                </tr>
                <tr>
                    <td>SPL Tokens</td>
                    <td>${tokenHtml}</td>
                </tr>
                <tr>
                    <td>Account Size</td>
                    <td>${accountData.space || 'N/A'} bytes</td>
                </tr>
                <tr>
                    <td>Network TPS</td>
                    <td>${tps} transactions/sec</td>
                </tr>
                <tr>
                    <td>Last Activity</td>
                    <td>${lastActivity}</td>
                </tr>
                <tr>
                    <td>Total Transactions</td>
                    <td>${totalTransactions} (last 1000)</td>
                </tr>
                <tr>
                    <td>Rent Exempt</td>
                    <td>${rentExempt}</td>
                </tr>
            </tbody>
        </table>
        <h3>Balance Distribution</h3>
        <canvas id="balanceChart" width="500" height="300"></canvas>
        <h3>Relationship Map (Simulation)</h3>
        <canvas id="bubbleMap" width="300" height="150"></canvas>
    `;

    container.innerHTML = html;

    const ctx = document.getElementById('balanceChart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['SOL', 'SPL Tokens'],
            datasets: [{
                data: [solBalance, tokenBalances],
                backgroundColor: ['#00D4FF', '#007ACC'],
                borderWidth: 2,
                borderColor: '#FFFFFF'
            }]
        },
        options: {
            responsive: true,
            cutout: '60%',
            rotation: -45,
            plugins: {
                legend: { position: 'top', labels: { color: '#FFFFFF' } },
                title: { display: true, text: 'Balance Distribution', color: '#FFFFFF' }
            }
        }
    });

    const bubbleCtx = document.getElementById('bubbleMap').getContext('2d');
    new Chart(bubbleCtx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Current Wallet',
                data: [{ x: 0, y: 0, r: 20 }],
                backgroundColor: '#00D4FF',
            }, {
                label: 'Related Wallets',
                data: totalTxData.slice(0, 5).map((_, i) => ({ x: Math.random() * 10 - 5, y: Math.random() * 10 - 5, r: 10 })),
                backgroundColor: '#007ACC',
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'top', labels: { color: '#FFFFFF' } },
                title: { display: true, text: 'Relationship Map (Simulation)', color: '#FFFFFF' }
            },
            scales: {
                x: { display: false },
                y: { display: false }
            }
        }
    });
}

function displayTransactions(transactions, container) {
    if (transactions.length === 0) {
        container.innerHTML = '<p>No recent transactions found.</p><button id="exportCSV" disabled>Export to CSV</button>';
        return;
    }

    let html = `
        <h3>Recent Transactions</h3>
        <table>
            <thead>
                <tr>
                    <th>Hash</th>
                    <th>Date</th>
                    <th>Confirmations</th>
                </tr>
            </thead>
            <tbody>
    `;
    transactions.forEach(tx => {
        html += `
            <tr>
                <td>${tx.signature.slice(0, 8)}...</td>
                <td>${new Date(tx.blockTime * 1000).toLocaleString()}</td>
                <td>${tx.confirmationStatus || 'N/A'}</td>
            </tr>
        `;
    });
    html += `
            </tbody>
        </table>
        <button id="exportCSV">Export to CSV</button>
    `;
    container.innerHTML = html;

    document.getElementById('exportCSV').addEventListener('click', () => {
        let csv = 'Hash,Date,Confirmations\n';
        transactions.forEach(tx => {
            csv += `"${tx.signature}","${new Date(tx.blockTime * 1000).toLocaleString()}","${tx.confirmationStatus || 'N/A'}"\n`;
        });
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'transactions.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    });
}

function clearData() {
    const walletInfoDiv = document.getElementById('walletInfo');
    const transactionListDiv = document.getElementById('transactionList');
    walletInfoDiv.innerHTML = '';
    transactionListDiv.innerHTML = '';
    document.getElementById("walletAddress").value = "";
}

// 🎡 Lista de memecoins con nombre y valor
async function updateMemecoinList() {
    const memecoinList = document.getElementById('memecoinList');
    memecoinList.innerHTML = '';

    const memecoins = [
        { name: 'Popcat', contract: '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr', chain: 'solana', dex: 'https://dexscreener.com/solana/7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr' },
        { name: 'Brett', contract: '0x532f27101965dd16442E59d40670FaF5eBB142E4', chain: 'base', dex: 'https://dexscreener.com/base/0x532f27101965dd16442E59d40670FaF5eBB142E4' },
        { name: 'SPX', contract: '0xE0f63A424a4439cBE457D80E4f4b51aD25b2c56C', chain: 'ethereum', dex: 'https://dexscreener.com/ethereum/0xE0f63A424a4439cBE457D80E4f4b51aD25b2c56C' }
    ];

    try {
        const prices = {};
        for (const coin of memecoins) {
            const url = `${coingeckoTokenUrl}${coin.chain}?contract_addresses=${coin.contract}&vs_currencies=usd`;
            const response = await fetch(url, { mode: 'cors' });
            if (response.ok) {
                const data = await response.json();
                prices[coin.name] = data[coin.contract.toLowerCase()]?.usd || 'N/A';
            } else {
                throw new Error('API fetch failed');
            }
        }

        memecoins.forEach(coin => {
            const item = document.createElement('div');
            item.className = 'memecoin-item';
            item.innerHTML = `<span>${coin.name}: $${prices[coin.name] === 'N/A' ? 'N/A' : prices[coin.name].toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</span>`;
            item.addEventListener('click', () => window.open(coin.dex, '_blank'));
            memecoinList.appendChild(item);
        });
    } catch (error) {
        console.error('Error fetching memecoin prices:', error);
        memecoins.forEach(coin => {
            const item = document.createElement('div');
            item.className = 'memecoin-item';
            item.innerHTML = `<span>${coin.name}: $${coin.name === 'Popcat' ? '0.20' : coin.name === 'Brett' ? '0.10' : '0.02'}</span>`;
            item.addEventListener('click', () => window.open(coin.dex, '_blank'));
            memecoinList.appendChild(item);
        });
    }
}

// 📈 Precios en el footer como carrusel
async function updateCryptoPrices() {
    const carouselTape = document.querySelector('.carousel-tape');
    if (!carouselTape) {
        console.error('Carousel tape not found!');
        return;
    }
    carouselTape.innerHTML = '<span>Loading prices...</span>';

    try {
        const response = await fetch(coingeckoPriceUrl, { mode: 'cors' });
        if (!response.ok) throw new Error('API request failed');
        const priceData = await response.json();

        const coins = [
            { id: 'bitcoin', name: 'Bitcoin' },
            { id: 'ethereum', name: 'Ethereum' },
            { id: 'binancecoin', name: 'BNB' },
            { id: 'solana', name: 'Solana' },
            { id: 'ripple', name: 'XRP' },
            { id: 'usd-coin', name: 'USDC' },
            { id: 'tether', name: 'USDT' },
            { id: 'dogecoin', name: 'DOGE' }
        ];

        let html = '';
        coins.forEach(coin => {
            html += `<div class="crypto-item"><span>${coin.name}: $${priceData[coin.id].usd.toLocaleString()}</span></div>`;
        });
        carouselTape.innerHTML = html + html;

        const itemCount = coins.length;
        carouselTape.style.width = `${itemCount * 150 * 2}px`;
        carouselTape.style.animationDuration = `${itemCount * 2}s`;
    } catch (error) {
        console.error('Error fetching crypto prices:', error);
        carouselTape.innerHTML = `
            <div class="crypto-item"><span>Bitcoin: $60,000</span></div>
            <div class="crypto-item"><span>Ethereum: $2,500</span></div>
            <div class="crypto-item"><span>BNB: $550</span></div>
            <div class="crypto-item"><span>Solana: $150</span></div>
            <div class="crypto-item"><span>XRP: $0.60</span></div>
            <div class="crypto-item"><span>USDC: $1.00</span></div>
            <div class="crypto-item"><span>USDT: $1.00</span></div>
            <div class="crypto-item"><span>DOGE: $0.15</span></div>
            <div class="crypto-item"><span>Bitcoin: $60,000</span></div>
            <div class="crypto-item"><span>Ethereum: $2,500</span></div>
            <div class="crypto-item"><span>BNB: $550</span></div>
            <div class="crypto-item"><span>Solana: $150</span></div>
            <div class="crypto-item"><span>XRP: $0.60</span></div>
            <div class="crypto-item"><span>USDC: $1.00</span></div>
            <div class="crypto-item"><span>USDT: $1.00</span></div>
            <div class="crypto-item"><span>DOGE: $0.15</span></div>
        `;
        carouselTape.style.width = '2400px';
        carouselTape.style.animationDuration = '16s';
    }
}

// 🔍 Funcionalidad del buscador
document.getElementById('search-toggle').addEventListener('click', () => {
    const searchBar = document.getElementById('search-bar');
    searchBar.classList.toggle('active');
    if (searchBar.classList.contains('active')) {
        document.getElementById('search-input').focus();
    }
});

document.getElementById('search-input').addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const resultsDiv = document.getElementById('search-results');
    resultsDiv.innerHTML = '';

    const searchItems = [
        { name: 'Popcat', action: () => window.open('https://dexscreener.com/solana/7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr', '_blank') },
        { name: 'Brett', action: () => window.open('https://dexscreener.com/base/0x532f27101965dd16442E59d40670FaF5eBB142E4', '_blank') },
        { name: 'SPX', action: () => window.open('https://dexscreener.com/ethereum/0xE0f63A424a4439cBE457D80E4f4b51aD25b2c56C', '_blank') },
        { name: 'Solana', action: () => document.getElementById('walletAddress').focus() },
        { name: 'Wallet', action: () => document.getElementById('wallet-icon').click() },
        { name: 'Transaction', action: () => document.getElementById('walletAddress').focus() }
    ];

    const filteredItems = searchItems.filter(item => item.name.toLowerCase().includes(query));
    
    if (filteredItems.length > 0 && query) {
        filteredItems.forEach(item => {
            const result = document.createElement('div');
            result.className = 'search-result-item';
            result.textContent = item.name;
            result.addEventListener('click', item.action);
            resultsDiv.appendChild(result);
        });
    } else if (query) {
        resultsDiv.innerHTML = '<div class="search-result-item">No results found</div>';
    }
});

// 🧹 Detox & Reclaim
let detoxWalletConnected = false;
let publicKey = null;
let walletProvider = null;
const connection = new solanaWeb3.Connection(rpcUrl, 'confirmed');

async function connectWalletForDetox() {
    const availableWallets = [];
    
    if (window.solana && window.solana.isPhantom) {
        availableWallets.push('phantom');
    }
    
    if (window.solflare && window.solflare.isSolflare) {
        availableWallets.push('solflare');
    }
    
    if (window.ethereum && window.ethereum.isMetaMask) {
        availableWallets.push('metamask'); // Asumimos Snap, verificamos después
    }

    if (availableWallets.length === 0) {
        alert('No se detectaron billeteras compatibles. Instala Phantom, Solflare o MetaMask con el Solana Snap.');
        return;
    }

    let selectedWallet;
    if (availableWallets.length === 1) {
        selectedWallet = availableWallets[0];
    } else {
        const choice = prompt(
            'Se detectaron varias billeteras. Elige una:\n' +
            availableWallets.map((w, i) => `${i + 1}. ${w.charAt(0).toUpperCase() + w.slice(1)}`).join('\n') +
            '\nIngresa el número de la billetera:'
        );
        const index = parseInt(choice) - 1;
        if (index >= 0 && index < availableWallets.length) {
            selectedWallet = availableWallets[index];
        } else {
            alert('Selección inválida.');
            return;
        }
    }

    try {
        if (selectedWallet === 'phantom') {
            const response = await window.solana.connect();
            if (!response.publicKey) throw new Error('No se obtuvo la clave pública de Phantom');
            publicKey = response.publicKey;
            walletProvider = 'phantom';
        } else if (selectedWallet === 'solflare') {
            const response = await window.solflare.connect();
            if (!response.publicKey) throw new Error('No se obtuvo la clave pública de Solflare');
            publicKey = response.publicKey;
            walletProvider = 'solflare';
        } else if (selectedWallet === 'metamask') {
            try {
                const accounts = await window.ethereum.request({
                    method: 'wallet_invokeSnap',
                    params: {
                        snapId: 'npm:@solflare-wallet/solana-snap',
                        request: { method: 'solana_connect' }
                    }
                });
                if (!accounts || !accounts.publicKey) throw new Error('No se obtuvo la clave pública de MetaMask');
                publicKey = new solanaWeb3.PublicKey(accounts.publicKey);
                walletProvider = 'metamask';
            } catch (err) {
                throw new Error('MetaMask requiere el Solana Snap instalado. Instálalo desde snaps.metamask.io.');
            }
        }

        detoxWalletConnected = true;
        document.getElementById('wallet-status').textContent = `Connected (${selectedWallet}): ${publicKey.toString().slice(0, 8)}...`;
        await scanWalletAssets(publicKey);
    } catch (err) {
        console.error(`Error conectando ${selectedWallet}:`, err);
        alert(`Error conectando ${selectedWallet}: ${err.message}`);
    }
}

async function scanWalletAssets(walletPublicKey) {
    const assetList = document.getElementById('asset-list');
    assetList.innerHTML = '<p>Scanning wallet...</p>';

    try {
        const tokenAccounts = await connection.getTokenAccountsByOwner(
            walletPublicKey,
            { programId: new solanaWeb3.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') },
            'confirmed'
        );

        if (!tokenAccounts.value.length) {
            assetList.innerHTML = '<p>No tokens or NFTs found in this wallet.</p>';
            return;
        }

        // Precios simulados como fallback para CORS y límites
        const tokenPrices = {
            'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': { usd: 1.00 }, // USDC
            'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': { usd: 1.00 }, // USDT
            'So11111111111111111111111111111111111111112': { usd: 150.00 } // SOL (valor aproximado)
        };
        const mintAddresses = tokenAccounts.value.map(account => account.account.data.parsed?.info?.mint).filter(Boolean).join(',');
        try {
            const response = await fetch(`${coingeckoTokenUrl}solana?contract_addresses=${mintAddresses}&vs_currencies=usd`, { mode: 'cors' });
            if (response.ok) {
                Object.assign(tokenPrices, await response.json());
            }
        } catch (error) {
            console.warn('No se pudieron obtener precios de tokens, usando fallbacks:', error);
        }

        let html = '<h3>Wallet Assets</h3><p><button id="enable-advanced" onclick="toggleAdvanced()">Habilitar edición avanzada</button></p>';
        tokenAccounts.value.forEach((account, index) => {
            const parsedInfo = account.account.data.parsed?.info;
            if (!parsedInfo) {
                console.warn('Cuenta no parseada:', account);
                html += `
                    <div class="asset-item">
                        <input type="checkbox" id="asset-${index}" 
                            data-mint="Unknown" 
                            data-account="${account.pubkey.toBase58()}" 
                            data-amount="0" 
                            data-sol="${(account.account.lamports / solanaWeb3.LAMPORTS_PER_SOL).toFixed(6)}" 
                            data-value-usd="0">
                        <label for="asset-${index}">Unknown Account (0 units, $0.00 USD, ${(account.account.lamports / solanaWeb3.LAMPORTS_PER_SOL).toFixed(6)} SOL reclaimable)</label>
                    </div>
                `;
                return;
            }
            const mint = parsedInfo.mint || 'Unknown';
            const amount = parsedInfo.tokenAmount?.uiAmount || 0;
            const reclaimableSOL = (account.account.lamports / solanaWeb3.LAMPORTS_PER_SOL).toFixed(6);
            const tokenName = tokenNames[mint] || mint.slice(0, 8) + '...';
            const type = amount > 0 ? 'Token' : 'Empty Token Account';
            const priceUSD = tokenPrices[mint]?.usd || 0;
            const totalValueUSD = amount * priceUSD;
            const isValuable = totalValueUSD > 1;

            html += `
                <div class="asset-item">
                    <input type="checkbox" id="asset-${index}" 
                        data-mint="${mint}" 
                        data-account="${account.pubkey.toBase58()}" 
                        data-amount="${amount}" 
                        data-sol="${reclaimableSOL}" 
                        data-value-usd="${totalValueUSD}" 
                        ${isValuable ? 'disabled' : ''}>
                    <label for="asset-${index}">${type}: ${tokenName} (${amount} units, $${totalValueUSD.toFixed(2)} USD, ${reclaimableSOL} SOL reclaimable)</label>
                </div>
            `;
        });
        assetList.innerHTML = html;

        assetList.addEventListener('change', () => {
            const selected = assetList.querySelectorAll('input:checked').length > 0;
            document.getElementById('burn-selected').disabled = !selected;
        });
    } catch (error) {
        console.error('Error scanning wallet assets:', error);
        assetList.innerHTML = '<p>Error scanning wallet. Please try again.</p>';
    }
}

function toggleAdvanced() {
    const checkboxes = document.querySelectorAll('#asset-list input:disabled');
    checkboxes.forEach(checkbox => checkbox.disabled = false);
    document.getElementById('enable-advanced').style.display = 'none';
}

async function burnSelectedAssets() {
    const selectedAssets = document.querySelectorAll('#asset-list input:checked');
    if (selectedAssets.length === 0) {
        alert('No assets selected to burn.');
        return;
    }

    if (!detoxWalletConnected || !publicKey || !walletProvider) {
        alert('Please connect your wallet first.');
        return;
    }

    let hasValuableTokens = false;
    selectedAssets.forEach(asset => {
        const valueUSD = parseFloat(asset.dataset.valueUsd);
        if (valueUSD > 1) hasValuableTokens = true;
    });

    if (hasValuableTokens) {
        const confirmation = confirm(
            'Estás a punto de quemar tokens con un valor mayor a $1. Esto no se puede deshacer y perderás esos activos permanentemente. ¿Estás seguro?'
        );
        if (!confirmation) return;
    }

    const transaction = new solanaWeb3.Transaction();
    let totalSOL = 0;

    try {
        for (const asset of selectedAssets) {
            const mint = new solanaWeb3.PublicKey(asset.dataset.mint === 'Unknown' ? solanaWeb3.PublicKey.default : asset.dataset.mint);
            const account = new solanaWeb3.PublicKey(asset.dataset.account);
            const amount = parseFloat(asset.dataset.amount);
            totalSOL += parseFloat(asset.dataset.sol);

            if (amount > 0) {
                const tokenAccount = await splToken.getAssociatedTokenAddress(mint, publicKey);
                const burnInstruction = splToken.createBurnInstruction(
                    tokenAccount,
                    mint,
                    publicKey,
                    Math.floor(amount * 10 ** 6), // Asumimos 6 decimales
                    [],
                    splToken.TOKEN_PROGRAM_ID
                );
                transaction.add(burnInstruction);
            } else {
                const closeInstruction = splToken.createCloseAccountInstruction(
                    account,
                    publicKey,
                    publicKey,
                    [],
                    splToken.TOKEN_PROGRAM_ID
                );
                transaction.add(closeInstruction);
            }
        }

        const { blockhash } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = publicKey;

        let signedTransaction;
        if (walletProvider === 'phantom') {
            signedTransaction = await window.solana.signTransaction(transaction);
        } else if (walletProvider === 'solflare') {
            signedTransaction = await window.solflare.signTransaction(transaction);
        } else if (walletProvider === 'metamask') {
            const serializedTx = transaction.serialize({ requireAllSignatures: false });
            const signed = await window.ethereum.request({
                method: 'wallet_invokeSnap',
                params: {
                    snapId: 'npm:@solflare-wallet/solana-snap',
                    request: { method: 'solana_signTransaction', params: { transaction: serializedTx.toString('base64') } }
                }
            });
            signedTransaction = solanaWeb3.Transaction.from(Buffer.from(signed.transaction, 'base64'));
        }

        const signature = await connection.sendRawTransaction(signedTransaction.serialize());
        await connection.confirmTransaction(signature, 'confirmed');
        alert(`Successfully processed ${selectedAssets.length} assets. Reclaimed ${totalSOL.toFixed(6)} SOL.`);

        await scanWalletAssets(publicKey);
    } catch (error) {
        console.error('Error burning assets:', error);
        alert('Error processing assets: ' + error.message);
    }
}

// Navegación del menú
function showSection(sectionId) {
    const sections = ['home-section', 'viewer-section', 'detox-section', 'support-section'];
    sections.forEach(id => document.getElementById(id).style.display = id === sectionId ? 'block' : 'none');

    const menuItems = document.querySelectorAll('.menu li');
    menuItems.forEach(item => item.classList.remove('active'));
    const activeItem = document.querySelector(`#${sectionId.replace('-section', '-menu')} a`);
    if (activeItem) activeItem.parentElement.classList.add('active');
}

document.getElementById('home-link').addEventListener('click', (e) => { e.preventDefault(); showSection('home-section'); });
document.getElementById('viewer-link').addEventListener('click', (e) => { e.preventDefault(); showSection('viewer-section'); });
document.getElementById('detox-reclaim').addEventListener('click', (e) => { e.preventDefault(); showSection('detox-section'); });
document.getElementById('support-link').addEventListener('click', (e) => { e.preventDefault(); showSection('support-section'); });

// Formulario de soporte con EmailJS
document.getElementById('support-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const issue = document.getElementById('issue').value;
    const ticketNumber = Math.floor(Math.random() * 1000000);

    const templateParams = { name, email, issue, ticket: ticketNumber };

    emailjs.send('crypto-tools-service', 'template_muodszo', templateParams)
        .then(() => {
            document.getElementById('support-message').innerHTML = `<p>Your ticket is #${ticketNumber}. Thank you for contacting us! We will get back to you soon.</p>`;
            document.getElementById('support-form').reset();
        }, (error) => {
            alert('Error sending support request: ' + error.text);
        });
});

// Inicializar las actualizaciones
updateMemecoinList();
setInterval(updateMemecoinList, 120000); // Cada 2 minutos para evitar 429
setTimeout(updateCryptoPrices, 1000);
setInterval(updateCryptoPrices, 120000);

document.getElementById("menu-toggle").addEventListener("click", function() {
    document.querySelector(".sidebar").classList.toggle("active");
    document.querySelector(".main-content").classList.toggle("menu-closed");
    document.querySelector(".footer").classList.toggle("menu-closed");
    document.querySelector(".menu-toggle").classList.toggle("menu-closed");
});

showSection('viewer-section');
