const rpcUrl = 'https://mainnet.helius-rpc.com/?api-key=6fbed4b2-ce46-4c7d-b827-2c1d5a539ff2';
const coingeckoUrl = 'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd';
const coingeckoTokenUrl = 'https://api.coingecko.com/api/v3/simple/token_price/solana?contract_addresses={ADDRESSES}&vs_currencies=usd';
const coingeckoMarketsUrl = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=solana-ecosystem&order=volume_desc&per_page=10&page=1&sparkline=false';

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

    if (!walletAddress) {
        alert('Please enter a valid wallet address.');
        return;
    }

    walletInfoDiv.innerHTML = '<p>Loading wallet data...</p>';
    transactionListDiv.innerHTML = '<p>Loading transactions...</p>';

    try {
        const priceResponse = await fetch(coingeckoUrl);
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
            const tokenPriceResponse = await fetch(coingeckoTokenUrl.replace('{ADDRESSES}', tokenAddresses));
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
    } catch (error) {
        console.error('Error:', error);
        walletInfoDiv.innerHTML = '<p>Error connecting to the API. Please try again later.</p>';
        transactionListDiv.innerHTML = '';
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

// 🎡 Lista estática de 5 memecoins
async function updateMemecoinList() {
    try {
        const response = await fetch(coingeckoMarketsUrl);
        const topMemecoins = await response.json();
        const memecoinList = document.getElementById('memecoinList');
        memecoinList.innerHTML = '';

        const memecoinsToShow = topMemecoins.slice(0, 5); // Solo 5 memecoins
        memecoinsToShow.forEach((coin) => {
            const item = document.createElement('div');
            item.className = 'memecoin-item';
            item.innerHTML = `
                <img src="${coin.image || 'https://via.placeholder.com/20?text=' + coin.symbol}" alt="${coin.symbol}">
                <span>${coin.symbol.toUpperCase()}</span>
            `;
            item.addEventListener('click', () => {
                const detailsDiv = document.getElementById('memecoinDetails');
                detailsDiv.style.display = 'block';
                detailsDiv.innerHTML = `
                    <h3>${coin.name} (${coin.symbol.toUpperCase()})</h3>
                    <img src="${coin.image}" alt="${coin.symbol}" style="width: 50px; height: 50px;">
                    <p>Price: $${coin.current_price.toFixed(6)}</p>
                    <p>Market Cap: $${coin.market_cap.toLocaleString()}</p>
                    <p>24H Volume: $${coin.total_volume.toLocaleString()}</p>
                    <p>24H Change: ${coin.price_change_percentage_24h.toFixed(2)}%</p>
                    <button onclick="window.location.href='https://www.coingecko.com/en/coins/${coin.id}'">Go to CoinGecko</button>
                `;
                detailsDiv.scrollIntoView({ behavior: 'smooth' });
            });
            memecoinList.appendChild(item);
        });
    } catch (error) {
        console.error('Error fetching memecoins:', error);
        document.getElementById('memecoinList').innerHTML = '<span>Error loading memecoins</span>';
    }
}

updateMemecoinList();
setInterval(updateMemecoinList, 300000); // 5 minutos

// 📜 Abrir/Cerrar menú lateral
document.getElementById("menu-toggle").addEventListener("click", function() {
    document.querySelector(".sidebar").classList.toggle("active");
});
