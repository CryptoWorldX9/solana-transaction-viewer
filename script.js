// API Key de Solscan
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjcmVhdGVkQXQiOjE3NDE0NzA4MjAwNjksImVtYWlsIjoiY3J5cHRvd29ybGR4OUBnbWFpbC5jb20iLCJhY3Rpb24iOiJ0b2tlbi1hcGkiLCJhcGlWZXJzaW9uIjoidjIiLCJpYXQiOjE3NDE0NzA4MjB9.rGwXpbL2WoMCDp6DplM0eoXXuTnEUANxQvFhKZQcv1c';

// Función principal para obtener datos de la wallet
async function fetchWalletData() {
    async function fetchWalletData() {
        const walletAddress = document.getElementById('walletAddress').value.trim();
        const walletInfoDiv = document.getElementById('walletInfo');
        const transactionListDiv = document.getElementById('transactionList');
    
        if (!walletAddress) {
            alert('Por favor, ingresa una dirección de wallet válida.');
            return;
        }
    
        walletInfoDiv.innerHTML = '<div class="loader"></div>';
        transactionListDiv.innerHTML = '<div class="loader"></div>';
    
        // Resto del código...
    }

    if (!walletAddress) {
        alert('Por favor, ingresa una dirección de wallet válida.');
        return;
    }

    walletInfoDiv.innerHTML = '<div class="loader"></div>';
    transactionListDiv.innerHTML = '<div class="loader"></div>';

    // Resto del código...
}

    if (!walletAddress) {
        alert('Por favor, ingresa una dirección de wallet válida.');
        return;
    }

    walletInfoDiv.innerHTML = '<p>Cargando datos de la wallet...</p>';
    transactionListDiv.innerHTML = '<p>Cargando transacciones...</p>';

    try {
        // Obtener información de la wallet
        const walletResponse = await fetch(`https://api.solscan.io/account?address=${walletAddress}`, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`
            }
        });
        const walletData = await walletResponse.json();

        if (walletData.success) {
            displayWalletInfo(walletData.data, walletInfoDiv);
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

        if (txData.success) {
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
    container.innerHTML = `
        <h3>Información de la Wallet</h3>
        <p><strong>Dirección:</strong> ${data.address}</p>
        <p><strong>Saldo SOL:</strong> ${(data.lamports / 1e9).toFixed(4)} SOL</p>
        <p><strong>Tokens:</strong> ${data.tokenAmount ? data.tokenAmount.length : 0}</p>
    `;
}

// Función para mostrar lista de transacciones
function displayTransactions(transactions, container) {
    if (transactions.length === 0) {
        container.innerHTML = '<p>No hay transacciones recientes.</p>';
        return;
    }

    let html = '<h3>Últimas Transacciones</h3><ul>';
    transactions.forEach(tx => {
        html += `
            <li>
                <p><strong>Hash:</strong> ${tx.txHash}</p>
                <p><strong>Fecha:</strong> ${new Date(tx.blockTime * 1000).toLocaleString()}</p>
                <p><strong>Estado:</strong> ${tx.status}</p>
                <p><strong>Monto SOL:</strong> ${(tx.lamport / 1e9).toFixed(4)} SOL</p>
            </li>
        `;
    });
    html += '</ul>';
    container.innerHTML = html;
}
