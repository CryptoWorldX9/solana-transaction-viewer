const rpcUrl = 'https://mainnet.helius-rpc.com/?api-key=6fbed4b2-ce46-4c7d-b827-2c1d5a539ff2';
const coingeckoUrl = 'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd';
const coingeckoMarketsUrl = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=solana-ecosystem&order=volume_desc&per_page=10&page=1&sparkline=false';

const tokenNames = {
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 'USDC',
    'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': 'USDT',
    'So11111111111111111111111111111111111111112': 'SOL',
    '7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj': 'stSOL'
};

// 🌐 Conectar la wallet Solana
async function connectWallet() {
    if (window.solana && window.solana.isPhantom) {
        try {
            const response = await window.solana.connect();
            alert(`Wallet conectada: ${response.publicKey.toString()}`);
            document.getElementById("walletAddress").value = response.publicKey.toString();
        } catch (err) {
            console.error("Error al conectar la wallet", err);
            alert("No se pudo conectar la wallet.");
        }
    } else {
        alert("Por favor, instala Phantom Wallet.");
    }
}

// 🔍 Obtener datos de una wallet Solana
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
        // Obtener el precio de SOL
        const priceResponse = await fetch(coingeckoUrl);
        const priceData = await priceResponse.json();
        const solPriceUSD = priceData?.solana?.usd || 0;

        // Obtener balance de SOL
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

        if (!walletData.result) {
            walletInfoDiv.innerHTML = '<p>Error fetching wallet data. Please verify the address.</p>';
            return;
        }

        // Obtener transacciones recientes
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

        // Mostrar datos en la interfaz
        displayWalletInfo(walletData.result.value, solPriceUSD, walletAddress, walletInfoDiv);
        displayTransactions(txData.result || [], transactionListDiv);
    } catch (error) {
        console.error('Error:', error);
        walletInfoDiv.innerHTML = '<p>Error connecting to the API. Please try again later.</p>';
        transactionListDiv.innerHTML = '';
    }
}

// 📊 Mostrar información de la wallet
function displayWalletInfo(accountData, solPriceUSD, walletAddress, container) {
    const solBalance = accountData.lamports ? (accountData.lamports / 1e9) : 0;
    const usdBalance = (solBalance * solPriceUSD).toFixed(2);

    let html = `
        <h3>Wallet Information</h3>
        <table>
            <tr><td>Address</td><td>${walletAddress}</td></tr>
            <tr><td>SOL Balance</td><td>${solBalance.toFixed(4)} SOL</td></tr>
            <tr><td>Value in USD</td><td>$${usdBalance}</td></tr>
        </table>
    `;
    container.innerHTML = html;
}

// 🔄 Mostrar transacciones recientes
function displayTransactions(transactions, container) {
    if (transactions.length === 0) {
        container.innerHTML = '<p>No recent transactions found.</p>';
        return;
    }

    let html = `<h3>Recent Transactions</h3><ul>`;
    transactions.forEach(tx => {
        html += `<li>Hash: ${tx.signature.slice(0, 8)}... | Date: ${new Date(tx.blockTime * 1000).toLocaleString()}</li>`;
    });
    html += `</ul>`;

    container.innerHTML = html;
}

// 🔥 Actualizar el carrusel de Memecoins
async function updateMemecoinCarousel() {
    try {
        const response = await fetch(coingeckoMarketsUrl);
        const topMemecoins = await response.json();
        const carousel = document.getElementById('memecoinCarousel');
        carousel.innerHTML = '';

        topMemecoins.slice(0, 10).forEach(coin => {
            const item = document.createElement('div');
            item.className = 'carousel-item';
            item.innerHTML = `<img src="${coin.image}" alt="${coin.symbol}"> <span>${coin.symbol.toUpperCase()}</span>`;
            carousel.appendChild(item);
        });

    } catch (error) {
        console.error('Error fetching memecoins from CoinGecko:', error);
        document.getElementById('memecoinCarousel').innerHTML = '<span>Error loading memecoins</span>';
    }
}

// 🎯 Agregar eventos y actualizar la página
document.getElementById("connect-wallet").addEventListener("click", connectWallet);
updateMemecoinCarousel();
setInterval(updateMemecoinCarousel, 300000);
