const rpcUrl = 'https://mainnet.helius-rpc.com/?api-key=6fbed4b2-ce46-4c7d-b827-2c1d5a539ff2';
const coingeckoUrl = 'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd';
const coingeckoTokenUrl = 'https://api.coingecko.com/api/v3/simple/token_price/solana?contract_addresses={ADDRESSES}&vs_currencies=usd';

const tokenNames = {
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 'USDC',
    'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': 'USDT',
    'So11111111111111111111111111111111111111112': 'SOL',
    '7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj': 'stSOL'
};

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
                backgroundColor: ['#00C4B4', '#1E88E5'],
                borderWidth: 2,
                borderColor: '#fff',
                shadowOffsetX: 5,
                shadowOffsetY: 5,
                shadowBlur: 15,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
            }]
        },
        options: {
            responsive: true,
            cutout: '60%',
            rotation: -45,
            plugins: {
                legend: { position: 'top' },
                title: { display: true, text: 'Balance Distribution' }
            },
            animation: {
                animateRotate: true,
                animateScale: true
            },
            elements: {
                arc: {
                    borderWidth: 2,
                    borderColor: '#fff',
                    shadowOffsetX: 5,
                    shadowOffsetY: 5,
                    shadowBlur: 15,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
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
                backgroundColor: '#00C4B4',
            }, {
                label: 'Related Wallets',
                data: totalTxData.slice(0, 5).map((_, i) => ({ x: Math.random() * 10 - 5, y: Math.random() * 10 - 5, r: 10 })),
                backgroundColor: '#1E88E5',
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'top' },
                title: { display: true, text: 'Relationship Map (Simulation)' }
            },
            scales: {
                x: { display: false },
                y: { display: false }
            }
        }
    });

    // Ticker functionality
    document.querySelectorAll('.ticker-items a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tokenId = link.getAttribute('data-token');
            window.open(`https://www.coingecko.com/en/coins/${tokenId}`, '_blank');
        });
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
