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
                alert(`Phantom Wallet conectada: ${response.publicKey.toString()}`);
                document.getElementById("walletAddress").value = response.publicKey.toString();
                walletIcon.classList.remove("fas", "fa-wallet");
                walletIcon.classList.add("fas", "fa-sign-out-alt");
                walletIcon.title = "Disconnect Wallet";
                isWalletConnected = true;
            } catch (err) {
                alert("No se pudo conectar la wallet.");
            }
        } else {
            alert("Por favor instala Phantom Wallet.");
        }
    } else {
        try {
            await window.solana.disconnect();
            alert("Wallet desconectada.");
            document.getElementById("walletAddress").value = "";
            walletIcon.classList.remove("fas", "fa-sign-out-alt");
            walletIcon.classList.add("fas", "fa-wallet");
            walletIcon.title = "Connect Wallet";
            isWalletConnected = false;
        } catch (err) {
            alert("Error al desconectar la wallet.");
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
            const tokenAddresses = tokenData.result.value.map(t => t.account.data.parsed.info.mint).join(',');
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
    const tokenBalances = Array.isArray(tokenAccounts) && tokenAccounts.length > 0 ? tokenAccounts.map(t => t.account.data.parsed.info.tokenAmount.uiAmount).reduce((a, b) => a + b, 0) : 0;
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
            const mint = t.account.data.parsed.info.mint || 'Unknown';
            const tokenName = tokenNames[mint] || mint.slice(0, 8) + '...';
            const amount = t.account.data.parsed.info.tokenAmount.uiAmount || 0;
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
        { 
            name: 'Popcat', 
            contract: '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr', 
            chain: 'solana', 
            dex: 'https://dexscreener.com/solana/7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr' 
        },
        { 
            name: 'Brett', 
            contract: '0x532f27101965dd16442E59d40670FaF5eBB142E4', 
            chain: 'base', 
            dex: 'https://dexscreener.com/base/0x532f27101965dd16442E59d40670FaF5eBB142E4' 
        },
        { 
            name: 'SPX', 
            contract: '0xE0f63A424a4439cBE457D80E4f4b51aD25b2c56C', 
            chain: 'ethereum', 
            dex: 'https://dexscreener.com/ethereum/0xE0f63A424a4439cBE457D80E4f4b51aD25b2c56C' 
        }
    ];

    try {
        const prices = {};
        for (const coin of memecoins) {
            const url = `${coingeckoTokenUrl}${coin.chain}?contract_addresses=${coin.contract}&vs_currencies=usd`;
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                console.log(`${coin.name} price data:`, data); // Depuración
                prices[coin.name] = data[coin.contract.toLowerCase()]?.usd || 'N/A';
            } else {
                console.warn(`Error fetching price for ${coin.name}: ${response.status}`);
                prices[coin.name] = 'N/A';
            }
        }

        memecoins.forEach(coin => {
            const item = document.createElement('div');
            item.className = 'memecoin-item';
            item.innerHTML = `
                <span>${coin.name}: $${prices[coin.name] === 'N/A' ? 'N/A' : prices[coin.name].toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</span>
            `;
            item.addEventListener('click', () => {
                window.location.href = coin.dex;
            });
            memecoinList.appendChild(item);
        });
    } catch (error) {
        console.error('Error fetching memecoin prices:', error);
        memecoins.forEach(coin => {
            const item = document.createElement('div');
            item.className = 'memecoin-item';
            item.innerHTML = `
                <span>${coin.name}: $${coin.name === 'Popcat' ? '0.20' : coin.name === 'Brett' ? '0.10' : '0.02'}</span>
            `;
            item.addEventListener('click', () => {
                window.location.href = coin.dex;
            });
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
        const response = await fetch(coingeckoPriceUrl);
        if (!response.ok) throw new Error('API request failed');
        const priceData = await response.json();
        console.log('Footer price data:', priceData); // Depuración

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
        carouselTape.innerHTML = html + html; // Duplicar para continuidad

        const itemCount = coins.length;
        carouselTape.style.width = `${itemCount * 150 * 2}px`; // 150px por ítem, x2 por duplicado
        carouselTape.style.animationDuration = `${itemCount * 2}s`; // 2 segundos por ítem
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
        carouselTape.style.width = '2400px'; // 8 ítems x 150px x 2
        carouselTape.style.animationDuration = '16s'; // 8 ítems x 2s
    }
}

// Inicializar las actualizaciones
updateMemecoinList();
setInterval(updateMemecoinList, 60000);
setTimeout(updateCryptoPrices, 1000);
setInterval(updateCryptoPrices, 60000);

document.getElementById("menu-toggle").addEventListener("click", function() {
    document.querySelector(".sidebar").classList.toggle("active");
    document.querySelector(".main-content").classList.toggle("menu-closed");
    document.querySelector(".footer").classList.toggle("menu-closed");
    document.querySelector(".menu-toggle").classList.toggle("menu-closed");
});
