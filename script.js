// API Key de Solscan
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjcmVhdGVkQXQiOjE3NDE0NzA4MjAwNjksImVtYWlsIjoiY3J5cHRvd29ybGR4OUBnbWFpbC5jb20iLCJhY3Rpb24iOiJ0b2tlbi1hcGkiLCJhcGlWZXJzaW9uIjoidjIiLCJpYXQiOjE3NDE0NzA4MjB9.rGwXpbL2WoMCDp6DplM0eoXXuTnEUANxQvFhKZQcv1c';

// Elementos del DOM
const walletAddressInput = document.getElementById('walletAddress');
const searchButton = document.getElementById('searchButton');
const walletInfoDiv = document.getElementById('walletInfo');
const transactionListDiv = document.getElementById('transactionList');

// Event listeners
searchButton.addEventListener('click', fetchWalletData);
walletAddressInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        fetchWalletData();
    }
});

// Función principal para obtener datos de la wallet
async function fetchWalletData() {
    const walletAddress = walletAddressInput.value.trim();
    
    if (!walletAddress) {
        alert('Por favor, ingresa una dirección de wallet válida.');
        return;
    }

    // Mostrar loaders
    walletInfoDiv.innerHTML = '<div class="loader"></div>';
    transactionListDiv.innerHTML = '<div class="loader"></div>';

    try {
        // Obtener información de la wallet
        const walletResponse = await fetch(`https://api.solscan.io/account?address=${walletAddress}`, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`
            }
        });
        
        const walletData = await walletResponse.json();

        // Verificar si la respuesta es exitosa
        if (walletData && !walletData.error) {
            displayWalletInfo(walletData, walletInfoDiv);
        } else {
            walletInfoDiv.innerHTML = '<p>Error al obtener datos de la wallet. Verifica la dirección.</p>';
        }

        // Obtener transacciones de la wallet
        const txResponse = await fetch(`https://api.solscan.io/account/transactions?address=${walletAddress}&limit=10`, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`
            }
        });
        
        const txData = await txResponse.json();

        // Verificar si la respuesta es exitosa
        if (txData && txData.data && Array.isArray(txData.data)) {
            displayTransactions(txData.data, transactionListDiv);
        } else {
            transactionListDiv.innerHTML = '<p>No se encontraron transacciones o hubo un error.</p>';
        }
    } catch (error) {
        console.error('Error:', error);
        walletInfoDiv.innerHTML = '<p>Error al conectar con la API. Intenta de nuevo más tarde.</p>';
        transactionListDiv.innerHTML = '';
    }
}

// Función para mostrar información de la wallet
function displayWalletInfo(data, container) {
    // Verificar si los datos tienen la estructura esperada
    if (!data || !data.lamports) {
        container.innerHTML = '<p>No se pudo obtener información de la wallet.</p>';
        return;
    }

    const solBalance = (data.lamports / 1e9).toFixed(4);
    const tokenCount = data.tokenAmount ? data.tokenAmount.length : 0;

    container.innerHTML = `
        <h3>Información de la Wallet</h3>
        <p><strong>Dirección:</strong> ${data.address || 'No disponible'}</p>
        <p><strong>Saldo SOL:</strong> ${solBalance} SOL</p>
        <p><strong>Tokens:</strong> ${tokenCount}</p>
    `;
}

// Función para mostrar lista de transacciones
function displayTransactions(transactions, container) {
    if (!transactions || transactions.length === 0) {
        container.innerHTML = '<p>No hay transacciones recientes.</p>';
        return;
    }

    let html = '<h3>Últimas Transacciones</h3><ul>';
    
    transactions.forEach(tx => {
        // Verificar que los datos existen antes de usarlos
        const txHash = tx.txHash || 'No disponible';
        const blockTime = tx.blockTime ? new Date(tx.blockTime * 1000).toLocaleString() : 'No disponible';
        const status = tx.status || 'Desconocido';
        const amount = tx.lamport ? (tx.lamport / 1e9).toFixed(4) : '0.0000';

        html += `
            <li>
                <p><strong>Hash:</strong> ${txHash}</p>
                <p><strong>Fecha:</strong> ${blockTime}</p>
                <p><strong>Estado:</strong> ${status}</p>
                <p><strong>Monto SOL:</strong> ${amount} SOL</p>
            </li>
        `;
    });
    
    html += '</ul>';
    container.innerHTML = html;
}
