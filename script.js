const rpcUrl = 'https://mainnet.helius-rpc.com/?api-key=6fbed4b2-ce46-4c7d-b827-2c1d5a539ff2';
const coingeckoUrl = 'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd';
const coingeckoMarketsUrl = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=solana-ecosystem&order=volume_desc&per_page=10&page=1&sparkline=false';

// 🌐 Conectar wallet (Phantom, Solflare, MetaMask)
async function connectWallet() {
    if (window.solana && window.solana.isPhantom) {
        try {
            const response = await window.solana.connect();
            alert(`Phantom Wallet conectada: ${response.publicKey.toString()}`);
            document.getElementById("walletAddress").value = response.publicKey.toString();
        } catch (err) {
            alert("No se pudo conectar la wallet.");
        }
    } else if (window.solflare) {
        try {
            const solflare = new window.Solflare();
            await solflare.connect();
            alert(`Solflare Wallet conectada: ${solflare.publicKey.toString()}`);
            document.getElementById("walletAddress").value = solflare.publicKey.toString();
        } catch (err) {
            alert("No se pudo conectar la wallet Solflare.");
        }
    } else if (window.ethereum) {
        try {
            await window.ethereum.request({ method: "eth_requestAccounts" });
            const accounts = await window.ethereum.request({ method: "eth_accounts" });
            alert(`MetaMask conectada: ${accounts[0]}`);
            document.getElementById("walletAddress").value = accounts[0];
        } catch (err) {
            alert("No se pudo conectar la wallet MetaMask.");
        }
    } else {
        alert("No se encontró ninguna wallet compatible.");
    }
}

document.getElementById("connect-wallet").addEventListener("click", connectWallet);

// 🎡 Carrusel de Memecoins (Ahora muestra información al hacer clic)
async function updateMemecoinCarousel() {
    try {
        const response = await fetch(coingeckoMarketsUrl);
        const topMemecoins = await response.json();
        const carousel = document.getElementById('memecoinCarousel');
        carousel.innerHTML = '';

        topMemecoins.slice(0, 10).forEach((coin) => {
            const item = document.createElement('div');
            item.className = 'carousel-item';
            item.innerHTML = `<img src="${coin.image}" alt="${coin.symbol}"> <span>${coin.symbol.toUpperCase()}</span>`;
            item.addEventListener("click", () => {
                alert(`Memecoin: ${coin.name}\nPrecio: $${coin.current_price}\nMarket Cap: $${coin.market_cap}`);
            });
            carousel.appendChild(item);
        });
    } catch (error) {
        console.error('Error al obtener memecoins:', error);
    }
}

updateMemecoinCarousel();

// 🔍 Buscar transacciones de Solana
async function fetchWalletData() {
    const address = document.getElementById("walletAddress").value;
    if (!address) {
        alert("Por favor, escribe una dirección de Solana");
        return;
    }

    try {
        const response = await fetch(`${rpcUrl}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                jsonrpc: "2.0",
                id: 1,
                method: "getSignaturesForAddress",
                params: [address, { limit: 5 }]
            })
        });
        const data = await response.json();
        
        if (data.result) {
            const transactionList = document.getElementById("transactionList");
            transactionList.innerHTML = "<h2>Últimas 5 transacciones:</h2>";
            data.result.forEach(tx => {
                transactionList.innerHTML += `<p>Transacción: ${tx.signature}</p>`;
            });
        } else {
            document.getElementById("transactionList").innerHTML = "<p>No se encontraron transacciones.</p>";
        }
    } catch (error) {
        alert("Error al buscar transacciones: " + error.message);
    }
}

// 📜 Abrir/Cerrar el menú lateral
document.getElementById("menu-toggle").addEventListener("click", function() {
    document.querySelector(".sidebar").classList.toggle("active");
});
