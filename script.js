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
        // Obtener precio de SOL en USD
        const priceResponse = await fetch(coingeckoUrl);
        const priceData = await priceResponse.json();
        const solPriceUSD = priceData.solana.usd;

        // Obtener información de la wallet
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

        // Obtener tokens SPL
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

        // Obtener transacciones
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

        // Mostrar datos
        if (walletData.result) {
            displayWalletInfo(walletData.result.value, tokenData.result, solPriceUSD, walletInfoDiv);
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

function displayWalletInfo(accountData, tokenAccounts, solPriceUSD, container) {
    const solBalance = accountData.lamports ? (accountData.lamports / 1e9).toFixed(4) : '0';
    const usdBalance = (solBalance * solPriceUSD).toFixed(2);
    const lastTx = tokenAccounts.length > 0 ? tokenAccounts[0].account.data.parsed.info.tokenAmount.uiAmount : 'N/A';

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
                    <td>${solBalance} SOL</td>
                </tr>
                <tr>
                    <td>Valor en USD</td>
                    <td>$${usdBalance}</td>
                </tr>
                <tr>
                    <td>Tokens SPL</td>
                    <td>${tokenAccounts.length > 0 ? tokenAccounts.map(t => `${t.account.data.parsed.info.tokenAmount.uiAmount} ${t.account.data.parsed.info.mint.slice(0, 8)}...`).join(', ') : 'Ninguno'}</td>
                </tr>
                <tr>
                    <td>Tamaño de la cuenta</td>
                    <td>${accountData.space || 'N/A'} bytes</td>
                </tr>
            </tbody>
        </table>
    `;
    container.innerHTML = html;
}

function displayTransactions(transactions, container) {
    if (transactions.length === 0) {
        container.innerHTML = '<p>No hay transacciones recientes.</p>';
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
    html += '</tbody></table>';
    container.innerHTML = html;
}
