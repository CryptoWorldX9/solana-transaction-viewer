const rpcUrl = 'https://mainnet.helius-rpc.com/?api-key=6fbed4b2-ce46-4c7d-b827-2c1d5a539ff2';
const coingeckoTokenUrl = 'https://api.coingecko.com/api/v3/simple/token_price/';
const proxyUrl = 'https://cors-anywhere.herokuapp.com/'; // Proxy temporal para CORS

const tokenNames = {
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 'USDC',
    'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': 'USDT',
    'So11111111111111111111111111111111111111112': 'SOL',
    '7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj': 'stSOL',
    '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr': 'Popcat'
};

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
        // Fetch token data from CoinGecko with proxy
        const tokenPriceUrl = `${proxyUrl}${coingeckoTokenUrl}solana?contract_addresses=${tokenContract}&vs_currencies=usd`;
        const tokenResponse = await fetch(tokenPriceUrl);
        const tokenData = tokenResponse.ok ? await tokenResponse.json() : {};

        // Fetch price changes from CoinGecko with proxy
        const priceChangeUrl = `${proxyUrl}https://api.coingecko.com/api/v3/coins/solana/contract/${tokenContract}/market_chart?vs_currency=usd&days=1`;
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
        if (error.message.includes('429')) {
            alert('Too many requests to CoinGecko. Please wait a minute and try again.');
        }
        // Datos simulados como fallback
        const mockTokenData = { [tokenContract.toLowerCase()]: { usd: 0.20 } };
        const mockPriceChangeData = { prices: [[Date.now() - 24*60*60*1000, 0.18], [Date.now(), 0.20]] };
        const mockMetadata = { result: { value: { lamports: Date.now() * 1e9 } } };
        const mockPosts = [{ text: 'Test tweet', sentiment: 'neutral', username: 'testuser', created_at: new Date().toISOString(), likes: 5, retweets: 2 }];
        const mockAnalysis = { generalScore: 50, socialScore: 50, priceScore: 10 };

        displayTokenInfo(mockTokenData, mockMetadata, tokenContract, tokenInfoDiv);
        displaySocialSentiment(mockPosts, socialSentimentDiv);
        displaySentimentScore(mockAnalysis, sentimentScoreDiv);
        displayPriceInfo(mockTokenData, mockPriceChangeData, tokenContract, priceInfoDiv);
        displayDexscreenerChart(tokenContract, dexscreenerIframe);
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
    const image = tokenContract === '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr' ? 'https://example.com/popcat.png' : 'https://via.placeholder.com/50';

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
