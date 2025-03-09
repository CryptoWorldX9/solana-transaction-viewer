const rpcUrl = 'https://mainnet.helius-rpc.com/?api-key=6fbed4b2-ce46-4c7d-b827-2c1d5a539ff2';
const coingeckoUrl = 'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd';

async function fetchWalletData() {
    const walletAddress = document.getElementById('walletAddress').value.trim();
    const walletInfoDiv = document.getElementById('walletInfo');
    const transactionListDiv = document.getElementById('transactionList');

    if (!walletAddress) {
        alert('Por favor, ingresa una dirección de wallet válida.');
        return;
    }

    walletInfoDiv.innerHTML = '<p>Cargando datos de la wallet...</p>';
    transactionListDiv.innerHTML = '<p>Cargando transacciones...</p>';

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
            displayWalletInfo(walletData.result.value, tokenData.result.value || [], solPriceUSD, tpsData.result, walletInfoDiv);
        } else {
            walletInfoDiv.innerHTML = '<p>Error al obtener datos de la wallet. Verifica la dirección.</p>';
        }

        if (txData.result) {
            displayTransactions(txData.result, transactionListDiv);
        } else {
            transactionListDiv.innerHTML = '<p>No se encontraron transacciones o hubo un error.</p>';
        }
    } catch (error) {
        console.error('Error:', error);
        walletInfoDiv.innerHTML = '<p>Error al conectar con la API. Intenta de nuevo más tarde.</p>';
        transactionListDiv.innerHTML = '';
    }
}

function displayWalletInfo(accountData, tokenAccounts, solPriceUSD, tpsData, container) {
    const solBalance = accountData.lamports ? (accountData.lamports / 1e9) : 0;
    const usdBalance = (solBalance * solPriceUSD).toFixed(2);
    const tokenBalances = Array.isArray(tokenAccounts) && tokenAccounts.length > 0 ? tokenAccounts.map(t => t.account.data.parsed.info.tokenAmount.uiAmount).reduce((a, b) => a + b, 0) : 0;
    const tps = tpsData && tpsData[0] ? (tpsData[0].numTransactions / tpsData[0].samplePeriodSecs).toFixed(2) : 'N/A';

    let html = `
        <h3>Información de la Wallet</h3>
        <table>
            <thead>
                <tr>
                    <th>Dato</th>
                    <th>Valor</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Dirección</td>
                    <td>${accountData.owner || 'N/A'}</td>
                </tr>
                <tr>
                    <td>Saldo SOL</td>
                    <td>${solBalance.toFixed(4)} SOL</td>
                </tr>
                <tr>
                    <td>Valor en USD</td>
                    <td>$${usdBalance}</td>
                </tr>
                <tr>
                    <td>Tokens SPL</td>
                    <td>${Array.isArray(tokenAccounts) && tokenAccounts.length > 0 ? tokenAccounts.map(t => `<span class="token-${t.account.data.parsed.info.mint.slice(0, 8)}">${t.account.data.parsed.info.tokenAmount.uiAmount} ${t.account.data.parsed.info.mint.slice(0, 8)}...</span>`).join(', ') : 'Ninguno'}</td>
                </tr>
                <tr>
                    <td>Tamaño de la cuenta</td>
                    <td>${accountData.space || 'N/A'} bytes</td>
                </tr>
                <tr>
                    <td>TPS de la red</td>
                    <td>${tps} transacciones/seg</td>
                </tr>
            </tbody>
        </table>
        <h3>Distribución del Saldo</h3>
        <canvas id="balanceChart" width="300" height="150"></canvas>
    `;

    container.innerHTML = html;

    const ctx = document.getElementById('balanceChart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['SOL', 'Tokens SPL'],
            datasets: [{
                data: [solBalance, tokenBalances],
                backgroundColor: ['#4CAF50', '#FF6384'],
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'top' },
                title: { display: true, text: 'Proporción de Activos' }
            }
        }
    });
}

function displayTransactions(transactions, container) {
    if (transactions.length === 0) {
        container.innerHTML = '<p>No hay transacciones recientes.</p><button id="exportCSV" disabled>Exportar a CSV</button>';
        return;
    }

    let html = `
        <h3>Últimas Transacciones</h3>
        <table>
            <thead>
                <tr>
                    <th>Hash</th>
                    <th>Fecha</th>
                    <th>Confirmaciones</th>
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
        <button id="exportCSV">Exportar a CSV</button>
    `;
    container.innerHTML = html;

    document.getElementById('exportCSV').addEventListener('click', () => {
        let csv = 'Hash,Fecha,Confirmaciones\n';
        transactions.forEach(tx => {
            csv += `"${tx.signature}","${new Date(tx.blockTime * 1000).toLocaleString()}","${tx.confirmationStatus || 'N/A'}"\n`;
        });
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'transacciones.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    });
}
