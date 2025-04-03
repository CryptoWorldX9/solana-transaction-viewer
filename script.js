// Solscan API Key
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjcmVhdGVkQXQiOjE3NDE0NzA4MjAwNjksImVtYWlsIjoiY3J5cHRvd29ybGR4OUBnbWFpbC5jb20iLCJhY3Rpb24iOiJ0b2tlbi1hcGkiLCJhcGlWZXJzaW9uIjoidjIiLCJpYXQiOjE3NDE0NzA4MjB9.rGwXpbL2WoMCDp6DplM0eoXXuTnEUANxQvFhKZQcv1c';

// Main function to fetch wallet data
async function fetchWalletData() {
    const walletAddress = document.getElementById('walletAddress').value.trim();
    const walletInfoDiv = document.getElementById('walletInfo');
    const transactionListDiv = document.getElementById('transactionList');
    
    if (!walletAddress) {
        alert('Please enter a valid wallet address.');
        return;
    }

    walletInfoDiv.innerHTML = '<div class="loader"></div>';
    transactionListDiv.innerHTML = '<div class="loader"></div>';

    try {
        // Get wallet information
        const walletResponse = await fetch(`https://api.solscan.io/account?address=${walletAddress}`, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`
            }
        });
        const walletData = await walletResponse.json();

        if (walletData.success) {
            displayWalletInfo(walletData.data, walletInfoDiv);
        } else {
            walletInfoDiv.innerHTML = '<p>Error getting wallet data. Please verify the address.</p>';
        }

        // Get wallet transactions
        const txResponse = await fetch(`https://api.solscan.io/account/transactions?address=${walletAddress}&limit=10`, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`
            }
        });
        const txData = await txResponse.json();

        if (txData.success) {
            displayTransactions(txData.data, transactionListDiv);
        } else {
            transactionListDiv.innerHTML = '<p>No transactions found or there was an error.</p>';
        }
    } catch (error) {
        console.error('Error:', error);
        walletInfoDiv.innerHTML = '<p>Error connecting to the API. Please try again later.</p>';
        transactionListDiv.innerHTML = '';
    }
}

// Function to display wallet information
function displayWalletInfo(data, container) {
    container.innerHTML = `
    <h3>Wallet Information</h3>
    <p><strong>Address:</strong> ${data.address}</p>
    <p><strong>SOL Balance:</strong> ${(data.lamports / 1e9).toFixed(4)} SOL</p>
    <p><strong>Tokens:</strong> ${data.tokenAmount ? data.tokenAmount.length : 0}</p>
    `;
}

// Function to display transaction list
function displayTransactions(transactions, container) {
    if (transactions.length === 0) {
        container.innerHTML = '<p>No recent transactions.</p>';
        return;
    }

    let html = '<h3>Recent Transactions</h3><ul>';
    transactions.forEach(tx => {
        html += `
        <li>
            <p><strong>Hash:</strong> ${tx.txHash}</p>
            <p><strong>Date:</strong> ${new Date(tx.blockTime * 1000).toLocaleString()}</p>
            <p><strong>Status:</strong> ${tx.status}</p>
            <p><strong>SOL Amount:</strong> ${(tx.lamport / 1e9).toFixed(4)} SOL</p>
        </li>
        `;
    });
    html += '</ul>';
    container.innerHTML = html;
}
