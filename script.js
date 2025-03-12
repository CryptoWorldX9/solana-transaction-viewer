console.log("Script.js loaded");

// Constantes
const rpcUrl = 'https://mainnet.helius-rpc.com/?api-key=6fbed4b2-ce46-4c7d-b827-2c1d5a539ff2';
const coingeckoApiKey = 'CG-55C5t38w8kL5EhLmaHNJmAY3';
const coingeckoPriceUrl = `https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&include_market_cap=false&include_24hr_vol=false&include_24hr_change=true&include_last_updated_at=false&precision=4&x_cg_demo_api_key=${coingeckoApiKey}`;
const coingeckoTokenUrl = `https://api.coingecko.com/api/v3/simple/token_price/solana?vs_currencies=usd&include_market_cap=false&include_24hr_vol=false&include_24hr_change=true&include_last_updated_at=false&precision=4&x_cg_demo_api_key=${coingeckoApiKey}`;
const coingeckoCoinInfoUrl = `https://api.coingecko.com/api/v3/coins/solana/contract/`;

// Token Names (Fallback)
const tokenNames = {
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 'USDC',
    'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': 'USDT',
    'So11111111111111111111111111111111111111112': 'SOL',
    '7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj': 'stSOL',
    '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr': 'Popcat'
};

// Wallet
let isWalletConnected = false;

async function toggleWallet() {
    console.log("Toggle wallet clicked");
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
                alert("Could not connect wallet: " + err.message);
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
            alert("Error disconnecting wallet: " + err.message);
        }
    }
}

// Sentiment Tracker
let currentPosts = [];

async function fetchTokenSentiment() {
    console.log("Fetching token sentiment");
    const tokenContract = document.getElementById('tokenContract').value.trim();
    const tokenInfoDiv = document.getElementById('tokenInfo');
    const socialSentimentDiv = document.getElementById('socialSentiment');
    const sentimentScoreDiv = document.getElementById('sentimentScore');
    const priceInfoDiv = document.getElementById('priceInfo');
    const dexscreenerIframe = document.getElementById('dexscreenerIframe');
    const loadingBar = document.getElementById('sentimentLoadingBar');
    const sentimentSection = document.querySelector('.sentiment-section');
    const inputSection = document.getElementById('input-section');

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

    // Activar modo pantalla completa al copiar contrato
    inputSection.style.display = 'none';
    sentimentSection.classList.add('full-screen');

    try {
        const tokenInfoUrl = `${coingeckoCoinInfoUrl}${tokenContract}?x_cg_demo_api_key=${coingeckoApiKey}`;
        const tokenInfoResponse = await fetch(tokenInfoUrl);
        const tokenInfo = tokenInfoResponse.ok ? await tokenInfoResponse.json() : {};

        const tokenPriceUrl = `${coingeckoTokenUrl}&contract_addresses=${tokenContract}`;
        const tokenPriceResponse = await fetch(tokenPriceUrl);
        const tokenData = tokenPriceResponse.ok ? await tokenPriceResponse.json() : {};

        const priceChangeUrl = `https://api.coingecko.com/api/v3/coins/solana/contract/${tokenContract}/market_chart?vs_currency=usd&days=1&x_cg_demo_api_key=${coingeckoApiKey}`;
        const priceChangeResponse = await fetch(priceChangeUrl);
        const priceChangeData = priceChangeResponse.ok ? await priceChangeResponse.json() : {};

        currentPosts = await fetchXPosts(tokenContract);
        const sentimentAnalysis = analyzeSentiment(currentPosts, tokenData, priceChangeData, tokenContract);

        displayTokenInfo(tokenInfo, tokenData, tokenContract, tokenInfoDiv);
        displaySocialSentiment(currentPosts, socialSentimentDiv);
        displaySentimentScore(sentimentAnalysis, sentimentScoreDiv);
        displayPriceInfo(tokenData, priceChangeData, tokenContract, priceInfoDiv);
        displayDexscreenerChart(tokenContract, dexscreenerIframe);
    } catch (error) {
        console.error('Error in fetchTokenSentiment:', error);
        if (error.message.includes('429')) {
            alert('Too many requests to CoinGecko. Please wait a minute and try again.');
        }
        const mockTokenInfo = { name: 'Unknown Token', image: { small: 'https://via.placeholder.com/50' } };
        const mockTokenData = { [tokenContract.toLowerCase()]: { usd: 0.20 } };
        const mockPriceChangeData = { prices: [[Date.now() - 24*60*60*1000, 0.18], [Date.now(), 0.20]] };
        const mockPosts = [{ text: 'Test tweet', sentiment: { type: 'neutral', score: 50 }, username: 'testuser', profile_image_url: 'https://via.placeholder.com/48', created_at: new Date().toISOString(), likes: 5, retweets: 2 }];
        const mockAnalysis = { generalScore: 50, socialScore: 50, priceScore: 10 };

        displayTokenInfo(mockTokenInfo, mockTokenData, tokenContract, tokenInfoDiv);
        displaySocialSentiment(mockPosts, socialSentimentDiv);
        displaySentimentScore(mockAnalysis, sentimentScoreDiv);
        displayPriceInfo(mockTokenData, mockPriceChangeData, tokenContract, priceInfoDiv);
        displayDexscreenerChart(tokenContract, dexscreenerIframe);
    } finally {
        loadingBar.style.display = 'none';
    }
}

async function fetchXPosts(query) {
    console.log("Fetching X posts for:", query);
    const bearerToken = 'AAAAAAAAAAAAAAAAAAAAAFOQzwEAAAAAtsPkCNQYZJS0%2B2MstthckE%2BMIPE%3DjKgQFSE7rBuqRkAXGBopwhrf3j2B6ycvgwgDLp9N9ff7KQvodQ'; // Reemplaza con tu token si tienes uno nuevo
    const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
    const apiUrl = `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(query)}&max_results=20&tweet.fields=created_at,public_metrics,author_id&expansions=author_id&user.fields=username,profile_image_url`;
    const url = proxyUrl + apiUrl;

    try {
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
            map[user.id] = { username: user.username, profile_image_url: user.profile_image_url };
            return map;
        }, {});

        return data.data ? data.data.map(post => ({
            text: post.text,
            sentiment: classifySentiment(post.text),
            username: userMap[post.author_id]?.username || 'Unknown',
            profile_image_url: userMap[post.author_id]?.profile_image_url || 'https://via.placeholder.com/48',
            created_at: post.created_at,
            likes: post.public_metrics.like_count,
            retweets: post.public_metrics.retweet_count
        })) : [];
    } catch (error) {
        console.error('X API Error:', error);
        return [];
    }
}

function classifySentiment(text) {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('great') || lowerText.includes('awesome') || lowerText.includes('love') || lowerText.includes('bullish')) {
        return { type: 'positive', score: 75 };
    } else if (lowerText.includes('scam') || lowerText.includes('rugpull') || lowerText.includes('bad') || lowerText.includes('dump')) {
        return { type: 'negative', score: 25 };
    } else {
        return { type: 'neutral', score: 50 };
    }
}

async function searchXPosts() {
    console.log("Searching X posts");
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
        const engagement = post.likes + post.retweets;
        totalEngagement += engagement;
        if (post.sentiment.type === 'positive') positive += engagement + 1;
        else if (post.sentiment.type === 'negative') negative += engagement + 1;
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

function displayTokenInfo(tokenInfo, tokenData, tokenContract, container) {
    const name = tokenInfo.name || tokenNames[tokenContract] || 'Unknown Token';
    const image = tokenInfo.image?.small || 'https://via.placeholder.com/50';
    const price = tokenData[tokenContract.toLowerCase()]?.usd || 'N/A';

    let html = `
        <h3>Token Info</h3>
        <img src="${image}" alt="${name}">
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Contract:</strong> <span class="contract-text">${tokenContract}</span> <button class="copy-btn" onclick="navigator.clipboard.writeText('${tokenContract}')">Copy</button></p>
        <p><strong>Price:</strong> $${price === 'N/A' ? 'N/A' : price.toLocaleString()}</p>
        <p><strong>Socials:</strong>
            <button class="social-btn" onclick="window.open('https://x.com/search?q=${tokenContract}', '_blank')"><i class="fab fa-twitter"></i></button>
            <button class="social-btn" onclick="window.open('https://dexscreener.com/solana/${tokenContract}', '_blank')"><i class="fas fa-globe"></i></button>
        </p>
    `;
    container.innerHTML = html;
}

function displaySocialSentiment(posts, container) {
    let html = '<h3>Tweets Analyser</h3>';
    if (posts.length === 0) {
        html += '<p>No recent tweets found.</p>';
    } else {
        html += '<div>';
        posts.forEach(post => {
            const date = new Date(post.created_at).toLocaleString();
            html += `
                <div class="tweet-item">
                    <img src="${post.profile_image_url}" alt="${post.username}">
                    <div class="tweet-content">
                        <span class="username">${post.username}</span>
                        <span class="time">${date}</span><br>
                        <span class="text">${post.text}</span><br>
                        <span class="tweet-sentiment ${post.sentiment.type}">${post.sentiment.type.toUpperCase()} (Score: ${post.sentiment.score})</span>
                        <small>Likes: ${post.likes} | Retweets: ${post.retweets}</small>
                    </div>
                </div>
            `;
        });
        html += '</div>';
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
        <p><strong>General:</strong> ${generalScore.toFixed(2)}%</p>
        <p><strong>Social:</strong> ${socialScore.toFixed(2)}%</p>
        <p><strong>Price:</strong> ${priceScore.toFixed(2)}%</p>
        <div class="sentiment-bar">
            <div class="sentiment-fill" style="width: ${generalScore}%; background-color: ${color};"></div>
        </div>
        <p style="color: ${color}; font-size: 10px;">${sentimentLabel}</p>
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
        <p><strong>Current:</strong> $${currentPrice === 'N/A' ? 'N/A' : currentPrice.toLocaleString()}</p>
        <p><strong>1h:</strong> ${price1h}%</p>
        <p><strong>6h:</strong> ${price6h}%</p>
        <p><strong>12h:</strong> ${price12h}%</p>
        <p><strong>24h:</strong> ${price24h}%</p>
    `;
    container.innerHTML = html;
}

function displayDexscreenerChart(tokenContract, iframe) {
    iframe.src = `https://dexscreener.com/solana/${tokenContract}?embed=1&theme=dark&trades=0&info=0`;
}

// Otras funciones (sin cambios significativos)
async function fetchWalletData() {
    console.log("Fetching wallet data");
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
        const priceResponse = await fetch(`${coingeckoPriceUrl}&ids=solana`);
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

        if (walletData.result) {
            displayWalletInfo(walletData.result.value, tokenData.result?.value || [], solPriceUSD, walletAddress, walletInfoDiv);
        } else {
            walletInfoDiv.innerHTML = '<p>Error fetching wallet data. Please verify the address.</p>';
        }

        if (txData.result) {
            displayTransactions(txData.result, transactionListDiv);
        } else {
            transactionListDiv.innerHTML = '<p>No recent transactions found.</p>';
        }
    } catch (error) {
        console.error('Error in fetchWalletData:', error);
        walletInfoDiv.innerHTML = '<p>Error connecting to the API. Please try again later.</p>';
    } finally {
        loadingBar.style.display = 'none';
    }
}

function displayWalletInfo(accountData, tokenAccounts, solPriceUSD, walletAddress, container) {
    const solBalance = accountData.lamports ? (accountData.lamports / 1e9) : 0;
    const usdBalance = (solBalance * solPriceUSD).toFixed(2);

    let tokenHtml = '';
    if (tokenAccounts.length > 0) {
        tokenHtml = '<table><tr><th>Token</th><th>Amount</th></tr>';
        tokenAccounts.forEach(t => {
            const mint = t.account.data.parsed.info.mint;
            const tokenName = tokenNames[mint] || mint.slice(0, 8) + '...';
            const amount = t.account.data.parsed.info.tokenAmount.uiAmount;
            tokenHtml += `<tr><td>${tokenName}</td><td>${amount.toFixed(4)}</td></tr>`;
        });
        tokenHtml += '</table>';
    } else {
        tokenHtml = 'None';
    }

    let html = `
        <h3>Wallet Information</h3>
        <table>
            <tr><td>Address</td><td>${walletAddress} <button class="copy-btn" onclick="navigator.clipboard.writeText('${walletAddress}')">Copy</button></td></tr>
            <tr><td>SOL Balance</td><td>${solBalance.toFixed(4)} SOL</td></tr>
            <tr><td>Value in USD</td><td>$${usdBalance}</td></tr>
            <tr><td>SPL Tokens</td><td>${tokenHtml}</td></tr>
        </table>
    `;
    container.innerHTML = html;
}

function displayTransactions(transactions, container) {
    let html = '<h3>Recent Transactions</h3>';
    if (transactions.length === 0) {
        html += '<p>No recent transactions found.</p>';
    } else {
        html += '<table><tr><th>Hash</th><th>Date</th></tr>';
        transactions.forEach(tx => {
            html += `<tr><td>${tx.signature.slice(0, 8)}...</td><td>${new Date(tx.blockTime * 1000).toLocaleString()}</td></tr>`;
        });
        html += '</table>';
    }
    container.innerHTML = html;
}

function clearData() {
    document.getElementById('walletInfo').innerHTML = '';
    document.getElementById('transactionList').innerHTML = '';
    document.getElementById('walletAddress').value = '';
}

function clearSentimentData() {
    const sentimentSection = document.querySelector('.sentiment-section');
    const inputSection = document.getElementById('input-section');
    document.getElementById('tokenInfo').innerHTML = '';
    document.getElementById('socialSentiment').innerHTML = '';
    document.getElementById('sentimentScore').innerHTML = '';
    document.getElementById('priceInfo').innerHTML = '';
    document.getElementById('dexscreenerIframe').src = '';
    document.getElementById('tokenContract').value = '';
    document.getElementById('xSearch').value = '';
    inputSection.style.display = 'flex';
    sentimentSection.classList.remove('full-screen');
    currentPosts = [];
}

// Memecoin List (Encabezado)
async function updateMemecoinList() {
    console.log("Updating memecoin list");
    const memecoinList = document.getElementById('memecoinList');
    memecoinList.innerHTML = '';

    const memecoins = [
        { name: 'Popcat', contract: '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr', image: 'https://assets.coingecko.com/coins/images/33743/small/popcat.png', dex: 'https://dexscreener.com/solana/7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr' },
        { name: 'Brett', contract: '0x532f27101965dd16442E59d40670FaF5eBB142E4', image: 'https://assets.coingecko.com/coins/images/35729/small/brett.png', dex: 'https://dexscreener.com/base/0x532f27101965dd16442E59d40670FaF5eBB142E4' },
        { name: 'SPX', contract: '0xE0f63A424a4439cBE457D80E4f4b51aD25b2c56C', image: 'https://assets.coingecko.com/coins/images/38945/small/spx.png', dex: 'https://dexscreener.com/ethereum/0xE0f63A424a4439cBE457D80E4f4b51aD25b2c56C' }
    ];

    try {
        const contractIds = memecoins.map(coin => coin.contract).join(',');
        const response = await fetch(`${coingeckoTokenUrl}&contract_addresses=${contractIds}`);
        const prices = response.ok ? await response.json() : {};

        memecoins.forEach(coin => {
            const price = prices[coin.contract.toLowerCase()]?.usd || 'N/A';
            const item = document.createElement('div');
            item.className = 'memecoin-item';
            item.innerHTML = `<img src="${coin.image}" alt="${coin.name}"><span>${coin.name}: $${price === 'N/A' ? 'N/A' : price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</span>`;
            item.addEventListener('click', () => window.open(coin.dex, '_blank'));
            memecoinList.appendChild(item);
        });
    } catch (error) {
        console.error('Error fetching memecoin prices:', error);
        memecoins.forEach(coin => {
            const item = document.createElement('div');
            item.className = 'memecoin-item';
            item.innerHTML = `<img src="${coin.image}" alt="${coin.name}"><span>${coin.name}: $0.20</span>`;
            item.addEventListener('click', () => window.open(coin.dex, '_blank'));
            memecoinList.appendChild(item);
        });
    }
}

// Crypto Prices (Footer)
async function updateCryptoPrices() {
    console.log("Updating crypto prices");
    const carouselTape = document.querySelector('.carousel-tape');
    if (!carouselTape) return;
    carouselTape.innerHTML = '<span>Loading prices...</span>';

    const coins = [
        { id: 'bitcoin', name: 'Bitcoin', image: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png' },
        { id: 'ethereum', name: 'Ethereum', image: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png' },
        { id: 'binancecoin', name: 'BNB', image: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png' },
        { id: 'solana', name: 'Solana', image: 'https://assets.coingecko.com/coins/images/4128/small/solana.png' },
        { id: 'ripple', name: 'XRP', image: 'https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png' },
        { id: 'usd-coin', name: 'USDC', image: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png' },
        { id: 'tether', name: 'USDT', image: 'https://assets.coingecko.com/coins/images/325/small/Tether.png' },
        { id: 'dogecoin', name: 'DOGE', image: 'https://assets.coingecko.com/coins/images/5/small/dogecoin.png' }
    ];

    try {
        const ids = coins.map(coin => coin.id).join(',');
        const response = await fetch(`${coingeckoPriceUrl}&ids=${ids}`);
        const priceData = response.ok ? await response.json() : {};

        let html = '';
        coins.forEach(coin => {
            const price = priceData[coin.id]?.usd || 'N/A';
            html += `<div class="crypto-item"><img src="${coin.image}" alt="${coin.name}"><span>${coin.name}: $${price === 'N/A' ? 'N/A' : price.toLocaleString()}</span></div>`;
        });
        carouselTape.innerHTML = html + html;
    } catch (error) {
        console.error('Error fetching crypto prices:', error);
        let html = '';
        coins.forEach(coin => {
            html += `<div class="crypto-item"><img src="${coin.image}" alt="${coin.name}"><span>${coin.name}: $N/A</span></div>`;
        });
        carouselTape.innerHTML = html + html;
    }
}

// Buscador
function setupSearch() {
    console.log("Setting up search");
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
            { name: 'Popcat', action: () => document.getElementById('tokenContract').value = '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr' },
            { name: 'Solana', action: () => document.getElementById('walletAddress').focus() },
            { name: 'Wallet', action: () => toggleWallet() },
            { name: 'Support', action: () => showSection('support-section') }
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
}

// Navegación del menú
function showSection(sectionId) {
    console.log("Showing section:", sectionId);
    const sections = ['home-section', 'sentiment-section', 'viewer-section', 'detox-section', 'support-section'];
    sections.forEach(id => {
        document.getElementById(id).style.display = id === sectionId ? 'block' : 'none';
    });

    const menuItems = document.querySelectorAll('.menu li');
    menuItems.forEach(item => item.classList.remove('active'));
    const activeItem = document.querySelector(`#${sectionId.replace('-section', '-menu')} a`);
    if (activeItem) activeItem.parentElement.classList.add('active');
}

// Event Listeners
function setupEventListeners() {
    console.log("Setting up event listeners");
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

    document.getElementById("menu-toggle").addEventListener("click", () => {
        console.log("Menu toggle clicked");
        document.querySelector(".sidebar").classList.toggle("active");
        document.querySelector(".main-content").classList.toggle("menu-closed");
        document.querySelector(".footer").classList.toggle("menu-closed");
    });

    document.getElementById('wallet-icon').addEventListener('click', toggleWallet);

    document.getElementById('support-form').addEventListener('submit', (e) => {
        console.log("Support form submitted");
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
                document.getElementById('support-message').innerHTML = `<p>Your ticket is #${ticketNumber}. Thank you for contacting us!</p>`;
                document.getElementById('support-form').reset();
            }, (error) => {
                alert('Error sending support request: ' + error.text);
            });
    });
}

// Inicializar
function init() {
    console.log("Initializing page");
    setupEventListeners();
    setupSearch();
    updateMemecoinList();
    setInterval(updateMemecoinList, 3600000); // 1 hora
    updateCryptoPrices();
    setInterval(updateCryptoPrices, 3600000); // 1 hora
    showSection('home-section');
}

document.addEventListener('DOMContentLoaded', init);
