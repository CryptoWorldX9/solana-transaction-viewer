const rpcUrl = 'https://mainnet.helius-rpc.com/?api-key=6fbed4b2-ce46-4c7d-b827-2c1d5a539ff2';
const coingeckoPriceUrl = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin,solana,ripple,usd-coin,tether,dogecoin&vs_currencies=usd';
const coingeckoTokenUrl = 'https://api.coingecko.com/api/v3/simple/token_price/';

const tokenNames = {
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 'USDC',
    'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': 'USDT',
    'So11111111111111111111111111111111111111112': 'SOL',
    '7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj': 'stSOL',
    '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr': 'Popcat'
};

// 🌐 Conectar/Desconectar wallet (Phantom)
let isWalletConnected = false;

async function toggleWallet() {
    const walletIcon = document.getElementById("wallet-icon");
    if (!isWalletConnected) {
        if (window.solana && window.solana.isPhantom) {
            try {
                const response = await window.solana.connect();
                alert(`Phantom Wallet connected: ${response.publicKey.toString()}`);
                document.getElementById("walletAddress").value = response.publicKey.toString();
                walletIcon.classList.remove("fas", "fa-wallet");
                walletIcon.classList.add("fas", "fa-sign-out-alt");
                walletIcon.title = "Disconnect Wallet";
                isWalletConnected = true;
            } catch (err) {
                alert("Could not connect wallet.");
            }
        } else {
            alert("Please install Phantom Wallet.");
        }
    } else {
        try {
            await window.solana.disconnect();
            alert("Wallet disconnected.");
            document.getElementById("walletAddress").value = "";
            walletIcon.classList.remove("fas", "fa-sign-out-alt");
            walletIcon.classList.add("fas", "fa-wallet");
            walletIcon.title = "Connect Wallet";
            isWalletConnected = false;
        } catch (err) {
            alert("Error disconnecting wallet.");
        }
    }
}

document.getElementById("wallet-icon").addEventListener("click", toggleWallet);

// Sentiment Tracker
let currentPosts = [];

async function fetchTokenSentiment() {
    const tokenContract = document.getElementById('tokenContract').value.trim();
    const tokenInfoDiv = document.getElementById('tokenInfo');
    const socialSentimentDiv = document.getElementById('socialSentiment');
    const sentimentScoreDiv = document.getElementById('sentimentScore');
    const priceInfoDiv = document.getElementById('priceInfo');
    const dexscreenerIframe = document.getElementById('dexscreenerIframe');
    const loadingBar = document.getElementById('sentimentLoadingBar');

    if (!tokenContract) {
        alert('Please enter a valid token contract.');
        return;
    }

    loadingBar.style.display = 'block';
    tokenInfoDiv.innerHTML = '';
    socialSentimentDiv.innerHTML = '';
    sentimentScoreDiv.innerHTML = '';
    priceInfoDiv.innerHTML = '';
    dexscreenerIframe.src = '';

    try {
        // Fetch token data from CoinGecko
        const tokenPriceUrl = `${coingeckoTokenUrl}solana?contract_addresses=${tokenContract}&vs_currencies=usd`;
        const tokenResponse = await fetch(tokenPriceUrl);
        const tokenData = tokenResponse.ok ? await tokenResponse.json() : {};

        // Fetch price changes from CoinGecko
        const priceChangeUrl = `https://api.coingecko.com/api/v3/coins/solana/contract/${tokenContract}/market_chart?vs_currency=usd&days=1`;
        const priceChangeResponse = await fetch(priceChangeUrl);
        const priceChangeData = priceChangeResponse.ok ? await priceChangeResponse.json() : {};

        // Fetch token metadata from Solana
        const metadataResponse = await fetch(rpcUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'getAccountInfo',
                params: [tokenContract, { encoding: 'jsonParsed' }]
            })
        });
        const metadata = await metadataResponse.json();

        // Fetch X posts
        currentPosts = await fetchXPosts(tokenContract);
        const sentimentAnalysis = analyzeSentiment(currentPosts, tokenData, priceChangeData, tokenContract);

        // Display results
        displayTokenInfo(tokenData, metadata, tokenContract, tokenInfoDiv);
        displaySocialSentiment(currentPosts, socialSentimentDiv);
        displaySentimentScore(sentimentAnalysis, sentimentScoreDiv);
        displayPriceInfo(tokenData, priceChangeData, tokenContract, priceInfoDiv);
        displayDexscreenerChart(tokenContract, dexscreenerIframe);
    } catch (error) {
        console.error('Error in fetchTokenSentiment:', error);
        tokenInfoDiv.innerHTML = '<p>Error fetching token data. Please try again.</p>';
        socialSentimentDiv.innerHTML = '';
        sentimentScoreDiv.innerHTML = '';
        priceInfoDiv.innerHTML = '';
    } finally {
        loadingBar.style.display = 'none';
    }
}

async function fetchXPosts(query) {
    const bearerToken = 'AAAAAAAAAAAAAAAAAAAAAFOQzwEAAAAAtsPkCNQYZJS0%2B2MstthckE%2BMIPE%3DjKgQFSE7rBuqRkAXGBopwhrf3j2B6ycvgwgDLp9N9ff7KQvodQ';
    const url = `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(query)}&max_results=20&tweet.fields=created_at,public_metrics,author_id&expansions=author_id&user.fields=username,created_at`;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${bearerToken}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error('Error fetching X posts: ' + response.status);
    }

    const data = await response.json();
    const users = data.includes?.users || [];
    const userMap = users.reduce((map, user) => {
        map[user.id] = { username: user.username, created_at: user.created_at };
        return map;
    }, {});

    return data.data ? data.data.map(post => ({
        text: post.text,
        sentiment: classifySentiment(post.text),
        username: userMap[post.author_id]?.username || 'Unknown',
        user_created_at: userMap[post.author_id]?.created_at || 'N/A',
        created_at: post.created_at,
        likes: post.public_metrics.like_count,
        retweets: post.public_metrics.retweet_count,
        replies: post.public_metrics.reply_count,
        quotes: post.public_metrics.quote_count
    })) : [];
}

function classifySentiment(text) {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('great') || lowerText.includes('awesome') || lowerText.includes('love') || lowerText.includes('bullish')) {
        return 'positive';
    } else if (lowerText.includes('scam') || lowerText.includes('rugpull') || lowerText.includes('bad') || lowerText.includes('dump')) {
        return 'negative';
    } else {
        return 'neutral';
    }
}

async function searchXPosts() {
    const query = document.getElementById('xSearch').value.trim();
    const socialSentimentDiv = document.getElementById('socialSentiment');
    if (!query) {
        displaySocialSentiment(currentPosts, socialSentimentDiv);
        return;
    }

    try {
        const posts = await fetchXPosts(query);
        displaySocialSentiment(posts, socialSentimentDiv);
    } catch (error) {
        console.error('Error searching X posts:', error);
        socialSentimentDiv.innerHTML = '<p>Error searching X posts. Please try again.</p>';
    }
}

function analyzeSentiment(posts, tokenData, priceChangeData, tokenContract) {
    let positive = 0, negative = 0, neutral = 0, totalEngagement = 0;
    posts.forEach(post => {
        const engagement = post.likes + post.retweets + post.replies + post.quotes;
        totalEngagement += engagement;
        if (post.sentiment === 'positive') positive += engagement + 1;
        else if (post.sentiment === 'negative') negative += engagement + 1;
        else neutral += engagement + 1;
    });
    const totalSocial = positive + negative + neutral;
    const socialScore = totalSocial ? ((positive * 1 + neutral * 0.5 - negative) / totalSocial) * 100 : 50;

    const price = tokenData[tokenContract.toLowerCase()]?.usd || 0;
    const prices = priceChangeData.prices || [];
    const priceScore = prices.length ? ((prices[prices.length - 1][1] - prices[0][1]) / prices[0][1]) * 100 : 0;

    const generalScore = (socialScore * 0.6 + (priceScore > 0 ? priceScore : 0) * 0.4);

    return { generalScore, socialScore, priceScore };
}

function displayTokenInfo(tokenData, metadata, tokenContract, container) {
    const price = tokenData[tokenContract.toLowerCase()]?.usd || 'N/A';
    const name = tokenNames[tokenContract] || 'Unknown Token';
    const image = tokenContract === '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr' ? 'https://example.com/popcat.png' : 'https://via.placeholder.com/50'; // Reemplaza con URL real si tienes

    let html = `
        <h3>Token Info</h3>
        <img src="${image}" alt="${name}">
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Contract:</strong> ${tokenContract} <button class="copy-btn" onclick="navigator.clipboard.writeText('${tokenContract}')">Copy</button></p>
        <p><strong>Socials:</strong>
            <button class="social-btn" onclick="window.open('https://x.com/search?q=${tokenContract}', '_blank')"><i class="fab fa-twitter"></i></button>
            <button class="social-btn" onclick="window.open('https://dexscreener.com/solana/${tokenContract}', '_blank')"><i class="fas fa-globe"></i></button>
        </p>
    `;
    container.innerHTML = html;
}

function displaySocialSentiment(posts, container) {
    let html = '<h3>X Posts</h3>';
    if (posts.length === 0) {
        html += '<p>No recent posts found.</p>';
    } else {
        html += '<ul>';
        posts.forEach(post => {
            const color = post.sentiment === 'positive' ? '#00FF00' : post.sentiment === 'negative' ? '#FF0000' : '#FFFF00';
            const date = new Date(post.created_at).toLocaleString();
            html += `
                <li style="color: ${color}; margin-bottom: 10px;">
                    <strong>@${post.username}</strong> (${date}):<br>${post.text}<br>
                    <small>Likes: ${post.likes} | Retweets: ${post.retweets}</small>
                </li>
            `;
        });
        html += '</ul>';
    }
    container.innerHTML = html;
}

function displaySentimentScore(analysis, container) {
    const { generalScore, socialScore, priceScore } = analysis;
    let sentimentLabel, color;
    if (generalScore < 20) {
        sentimentLabel = 'Extreme Fear';
        color = '#FF0000';
    } else if (generalScore < 40) {
        sentimentLabel = 'Fear';
        color = '#FF5555';
    } else if (generalScore < 60) {
        sentimentLabel = 'Neutral';
        color = '#FFA500';
    } else {
        sentimentLabel = 'Euphoria';
        color = '#00FF00';
    }

    let html = `
        <h3>Analysis</h3>
        <p><strong>General Score:</strong> ${generalScore.toFixed(2)}%</p>
        <p><strong>Social Score:</strong> ${socialScore.toFixed(2)}%</p>
        <p><strong>Price Score:</strong> ${priceScore.toFixed(2)}%</p>
        <div class="sentiment-bar">
            <div class="sentiment-fill" style="width: ${generalScore}%; background-color: ${color};"></div>
        </div>
        <p style="color: ${color}">${sentimentLabel} (${generalScore.toFixed(0)}%)</p>
    `;
    container.innerHTML = html;
}

function displayPriceInfo(tokenData, priceChangeData, tokenContract, container) {
    const currentPrice = tokenData[tokenContract.toLowerCase()]?.usd || 'N/A';
    const prices = priceChangeData.prices || [];
    const price1h = prices.length > 4 ? ((prices[prices.length - 1][1] - prices[prices.length - 5][1]) / prices[prices.length - 5][1] * 100).toFixed(2) : 'N/A';
    const price6h = prices.length > 24 ? ((prices[prices.length - 1][1] - prices[prices.length - 25][1]) / prices[prices.length - 25][1] * 100).toFixed(2) : 'N/A';
    const price12h = prices.length > 48 ? ((prices[prices.length - 1][1] - prices[prices.length - 49][1]) / prices[prices.length - 49][1] * 100).toFixed(2) : 'N/A';
    const price24h = prices.length ? ((prices[prices.length - 1][1] - prices[0][1]) / prices[0][1] * 100).toFixed(2) : 'N/A';

    let html = `
        <h3>Prices</h3>
        <p><strong>Current:</strong> $${currentPrice} (${price24h}% 24h)</p>
        <p><strong>1h Change:</strong> ${price1h}%</p>
        <p><strong>6h Change:</strong> ${price6h}%</p>
        <p><strong>12h Change:</strong> ${price12h}%</p>
        <p><strong>24h Change:</strong> ${price24h}%</p>
    `;
    container.innerHTML = html;
}

function displayDexscreenerChart(tokenContract, iframe) {
    iframe.src = `https://dexscreener.com/solana/${tokenContract}?embed=1&theme=dark`;
}

function clearSentimentData() {
    document.getElementById('tokenInfo').innerHTML = '';
    document.getElementById('socialSentiment').innerHTML = '';
    document.getElementById('sentimentScore').innerHTML = '';
    document.getElementById('priceInfo').innerHTML = '';
    document.getElementById('dexscreenerIframe').src = '';
    document.getElementById('tokenContract').value = '';
    document.getElementById('xSearch').value = '';
    currentPosts = [];
}

// Existing Wallet Viewer Functions (unchanged for brevity)
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
        { name: 'Popcat', contract: '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr', chain: 'solana', dex: 'https://dexscreener.com/solana/7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr' },
        { name: 'Brett', contract: '0x532f27101965dd16442E59d40670FaF5eBB142E4', chain: 'base', dex: 'https://dexscreener.com/base/0x532f27101965dd16442E59d40670FaF5eBB142E4' },
        { name: 'SPX', contract: '0xE0f63A424a4439cBE457D80E4f4b51aD25b2c56C', chain: 'ethereum', dex: 'https://dexscreener.com/ethereum/0xE0f63A424a4439cBE457D80E4f4b51aD25b2c56C' }
    ];

    try {
        const prices = {};
        for (const coin of memecoins) {
            const url = `${coingeckoTokenUrl}${coin.chain}?contract_addresses=${coin.contract}&vs_currencies=usd`;
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                prices[coin.name] = data[coin.contract.toLowerCase()]?.usd || 'N/A';
            } else {
                prices[coin.name] = 'N/A';
            }
        }

        memecoins.forEach(coin => {
            const item = document.createElement('div');
            item.className = 'memecoin-item';
            item.innerHTML = `<span>${coin.name}: $${prices[coin.name] === 'N/A' ? 'N/A' : prices[coin.name].toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</span>`;
            item.addEventListener('click', () => window.open(coin.dex, '_blank'));
            memecoinList.appendChild(item);
        });
    } catch (error) {
        console.error('Error fetching memecoin prices:', error);
        memecoins.forEach(coin => {
            const item = document.createElement('div');
            item.className = 'memecoin-item';
            item.innerHTML = `<span>${coin.name}: $${coin.name === 'Popcat' ? '0.20' : coin.name === 'Brett' ? '0.10' : '0.02'}</span>`;
            item.addEventListener('click', () => window.open(coin.dex, '_blank'));
            memecoinList.appendChild(item);
        });
    }
}

// 📈 Precios en el footer como carrusel
async function updateCryptoPrices() {
    const carouselTape = document.querySelector('.carousel-tape');
    if (!carouselTape) return;
    carouselTape.innerHTML = '<span>Loading prices...</span>';

    try {
        const response = await fetch(coingeckoPriceUrl);
        if (!response.ok) throw new Error('API request failed');
        const priceData = await response.json();

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
        carouselTape.innerHTML = html + html;

        const itemCount = coins.length;
        carouselTape.style.width = `${itemCount * 150 * 2}px`;
        carouselTape.style.animationDuration = `${itemCount * 2}s`;
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
        carouselTape.style.width = '2400px';
        carouselTape.style.animationDuration = '16s';
    }
}

// 🔍 Funcionalidad del buscador
const searchToggle = document.getElementById('search-toggle');
const searchBar = document.getElementById('search-bar');

searchToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    searchBar.classList.toggle('active');
    if (searchBar.classList.contains('active')) {
        document.getElementById('search-input').focus();
    }
});

document.addEventListener('click', (e) => {
    if (searchBar.classList.contains('active') && !searchBar.contains(e.target) && e.target !== searchToggle) {
        searchBar.classList.remove('active');
    }
});

document.getElementById('search-input').addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const resultsDiv = document.getElementById('search-results');
    resultsDiv.innerHTML = '';

    const searchItems = [
        { name: 'Popcat', action: () => window.open('https://dexscreener.com/solana/7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr', '_blank') },
        { name: 'Brett', action: () => window.open('https://dexscreener.com/base/0x532f27101965dd16442E59d40670FaF5eBB142E4', '_blank') },
        { name: 'SPX', action: () => window.open('https://dexscreener.com/ethereum/0xE0f63A424a4439cBE457D80E4f4b51aD25b2c56C', '_blank') },
        { name: 'Solana', action: () => document.getElementById('walletAddress').focus() },
        { name: 'Wallet', action: () => document.getElementById('wallet-icon').click() },
        { name: 'Transaction', action: () => document.getElementById('walletAddress').focus() },
        { name: 'Sentiment', action: () => document.getElementById('tokenContract').focus() }
    ];

    const filteredItems = searchItems.filter(item => item.name.toLowerCase().includes(query));
    
    if (filteredItems.length > 0 && query) {
        filteredItems.forEach(item => {
            const result = document.createElement('div');
            result.className = 'search-result-item';
            result.textContent = item.name;
            result.addEventListener('click', item.action);
            resultsDiv.appendChild(result);
        });
    } else if (query) {
        resultsDiv.innerHTML = '<div class="search-result-item">No results found</div>';
    }
});

// 🧹 Detox & Reclaim
let detoxWalletConnected = false;
let publicKey = null;
const connection = new solanaWeb3.Connection(rpcUrl, 'confirmed');

async function connectWalletForDetox() {
    if (window.solana && window.solana.isPhantom) {
        try {
            const response = await window.solana.connect();
            detoxWalletConnected = true;
            publicKey = response.publicKey;
            document.getElementById('wallet-status').textContent = `Connected: ${publicKey.toString().slice(0, 8)}...`;
            await scanWalletAssets(publicKey);
        } catch (err) {
            alert("Could not connect wallet for Detox: " + err.message);
        }
    } else {
        alert("Please install Phantom Wallet.");
    }
}

async function scanWalletAssets(walletPublicKey) {
    const assetList = document.getElementById('asset-list');
    assetList.innerHTML = '<p>Scanning wallet...</p>';

    try {
        const tokenAccounts = await connection.getTokenAccountsByOwner(
            walletPublicKey,
            { programId: new solanaWeb3.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') },
            'confirmed'
        );

        if (!tokenAccounts.value.length) {
            assetList.innerHTML = '<p>No tokens or NFTs found in this wallet.</p>';
            return;
        }

        let html = '<h3>Wallet Assets</h3>';
        tokenAccounts.value.forEach((account, index) => {
            const parsedAccountInfo = account.account.data.parsed.info;
            const mint = parsedAccountInfo.mint;
            const amount = parsedAccountInfo.tokenAmount.uiAmount;
            const reclaimableSOL = (account.account.lamports / solanaWeb3.LAMPORTS_PER_SOL).toFixed(6);

            const tokenName = tokenNames[mint] || mint.slice(0, 8) + '...';
            const type = amount > 0 ? 'Token' : 'Empty Token Account';

            html += `
                <div class="asset-item">
                    <input type="checkbox" id="asset-${index}" data-mint="${mint}" data-account="${account.pubkey.toBase58()}" data-amount="${amount}" data-sol="${reclaimableSOL}">
                    <label for="asset-${index}">${type}: ${tokenName} (${amount} units, ${reclaimableSOL} SOL reclaimable)</label>
                </div>
            `;
        });
        assetList.innerHTML = html;

        assetList.addEventListener('change', () => {
            const selected = assetList.querySelectorAll('input:checked').length > 0;
            document.getElementById('burn-selected').disabled = !selected;
        });
    } catch (error) {
        console.error('Error scanning wallet assets:', error);
        assetList.innerHTML = '<p>Error scanning wallet. Please try again.</p>';
    }
}

async function burnSelectedAssets() {
    const selectedAssets = document.querySelectorAll('#asset-list input:checked');
    if (selectedAssets.length === 0) {
        alert('No assets selected to burn.');
        return;
    }

    if (!detoxWalletConnected || !publicKey) {
        alert('Please connect your wallet first.');
        return;
    }

    const transaction = new solanaWeb3.Transaction();
    let totalSOL = 0;

    try {
        for (const asset of selectedAssets) {
            const mint = new solanaWeb3.PublicKey(asset.dataset.mint);
            const account = new solanaWeb3.PublicKey(asset.dataset.account);
            const amount = parseFloat(asset.dataset.amount);
            totalSOL += parseFloat(asset.dataset.sol);

            if (amount > 0) {
                const tokenAccount = await splToken.getAssociatedTokenAddress(mint, publicKey);
                const burnInstruction = splToken.createBurnInstruction(tokenAccount, mint, publicKey, Math.floor(amount * 10 ** 6), [], splToken.TOKEN_PROGRAM_ID);
                transaction.add(burnInstruction);
            } else {
                const closeInstruction = splToken.createCloseAccountInstruction(account, publicKey, publicKey, [], splToken.TOKEN_PROGRAM_ID);
                transaction.add(closeInstruction);
            }
        }

        const { blockhash } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = publicKey;

        const signedTransaction = await window.solana.signTransaction(transaction);
        const signature = await connection.sendRawTransaction(signedTransaction.serialize());

        await connection.confirmTransaction(signature, 'confirmed');
        alert(`Successfully processed ${selectedAssets.length} assets. Reclaimed ${totalSOL.toFixed(6)} SOL.`);

        await scanWalletAssets(publicKey);
    } catch (error) {
        console.error('Error burning assets:', error);
        alert('Error processing assets: ' + error.message);
    }
}

// Navegación del menú
function showSection(sectionId) {
    const sections = ['home-section', 'sentiment-section', 'viewer-section', 'detox-section', 'support-section'];
    sections.forEach(id => {
        document.getElementById(id).style.display = id === sectionId ? 'block' : 'none';
    });

    const menuItems = document.querySelectorAll('.menu li');
    menuItems.forEach(item => item.classList.remove('active'));
    const activeItem = document.querySelector(`#${sectionId.replace('-section', '-menu')} a`);
    if (activeItem) activeItem.parentElement.classList.add('active');
}

document.getElementById('home-link').addEventListener('click', (e) => {
    e.preventDefault();
    showSection('home-section');
});

document.getElementById('sentiment-link').addEventListener('click', (e) => {
    e.preventDefault();
    showSection('sentiment-section');
});

document.getElementById('viewer-link').addEventListener('click', (e) => {
    e.preventDefault();
    showSection('viewer-section');
});

document.getElementById('detox-reclaim').addEventListener('click', (e) => {
    e.preventDefault();
    showSection('detox-section');
});

document.getElementById('support-link').addEventListener('click', (e) => {
    e.preventDefault();
    showSection('support-section');
});

// Formulario de soporte con EmailJS
document.getElementById('support-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const issue = document.getElementById('issue').value;
    const ticketNumber = Math.floor(Math.random() * 1000000);

    const templateParams = {
        name: name,
        email: email,
        issue: issue,
        ticket: ticketNumber
    };

    emailjs.send('crypto-tools-service', 'template_muodszo', templateParams)
        .then(() => {
            document.getElementById('support-message').innerHTML = `<p>Your ticket is #${ticketNumber}. Thank you for contacting us! We will get back to you soon.</p>`;
            document.getElementById('support-form').reset();
        }, (error) => {
            alert('Error sending support request: ' + error.text);
        });
});

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

document.querySelectorAll('.menu li i').forEach(icon => {
    icon.addEventListener('click', (e) => {
        const link = icon.nextElementSibling;
        if (link && !link.classList.contains('disabled')) {
            const sectionId = link.id.replace('-link', '-section').replace('detox-reclaim', 'detox-section');
            showSection(sectionId);
        }
    });
});

showSection('home-section');
