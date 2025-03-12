body {
    font-family: 'Arial', sans-serif;
    margin: 0;
    padding: 0;
    background-color: #0A0A0A;
    color: #FFFFFF;
}

.sidebar {
    width: 250px;
    height: calc(100vh - 80px);
    background: #1A1A1A;
    position: fixed;
    top: 80px;
    left: 0;
    padding: 20px;
    box-shadow: 2px 0 5px rgba(0, 0, 0, 0.5);
    z-index: 15;
    transition: width 0.3s ease, left 0.3s ease;
}

.sidebar.active {
    width: 250px;
    left: 0;
}

@media (min-width: 769px) {
    .sidebar:not(.active) {
        width: 50px;
        left: 0;
        padding: 20px 10px;
    }
    .sidebar:not(.active) .menu li a {
        display: none;
    }
    .sidebar:not(.active) .menu li i {
        margin-right: 0;
        cursor: pointer;
    }
    .sidebar:not(.active) .menu li i:hover {
        color: #00D4FF;
    }
}

@media (max-width: 768px) {
    .sidebar {
        width: 200px;
        height: calc(100vh - 80px);
        top: 80px;
    }
    .sidebar:not(.active) {
        left: -200px;
    }
}

.menu {
    list-style: none;
    padding: 0;
    margin: 0;
}

.menu li {
    margin: 20px 0;
    display: flex;
    align-items: center;
}

.menu li i {
    margin-right: 10px;
    color: #FFFFFF;
}

.menu li a {
    color: #FFFFFF;
    text-decoration: none;
    font-size: 16px;
}

.menu li.active a {
    color: #00D4FF;
    font-weight: bold;
}

.menu li a.disabled {
    color: #A0A0A0;
    pointer-events: none;
}

.main-content {
    padding-left: 250px;
    background-color: #0A0A0A;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    transition: padding-left 0.3s ease;
}

.main-content.menu-closed {
    padding-left: 50px;
}

@media (max-width: 768px) {
    .main-content {
        padding-left: 0;
    }
    .main-content.menu-closed {
        padding-left: 0;
    }
}

.top-bar {
    display: flex;
    align-items: center;
    padding: 10px 20px;
    background: #1A1A1A;
    border-bottom: 1px solid #00D4FF;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 20;
    box-sizing: border-box;
    width: 100%;
    height: 80px;
}

.logo {
    flex-shrink: 0;
    margin-right: 10px;
}

.logo img {
    max-height: 70px;
    max-width: 260px;
    width: auto;
    height: auto;
    display: block;
}

.menu-toggle {
    background: #00D4FF;
    border: none;
    padding: 8px;
    cursor: pointer;
    border-radius: 5px;
    margin-right: 10px;
    flex-shrink: 0;
}

.menu-toggle:hover {
    background: #007ACC;
}

.menu-toggle i {
    font-size: 18px;
    color: #FFFFFF;
}

.memecoin-list {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-grow: 1;
    gap: 15px;
}

.memecoin-item {
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 5px 10px;
    background: #2A2A2A;
    border-radius: 5px;
    transition: background 0.3s;
}

.memecoin-item:hover {
    background: #00D4FF;
}

.memecoin-item img {
    width: 20px;
    height: 20px;
    margin-right: 5px;
}

.memecoin-item span {
    color: #FFFFFF;
    font-size: 12px;
    font-weight: bold;
}

.top-icons {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    padding-right: 10px;
    position: relative;
}

.top-icons i {
    font-size: 20px;
    margin: 0 10px;
    color: #FFFFFF;
    cursor: pointer;
}

.top-icons i:hover {
    color: #00D4FF;
}

.search-bar {
    position: absolute;
    top: 50px;
    right: 10px;
    width: 300px;
    background: #1A1A1A;
    border: 1px solid #00D4FF;
    border-radius: 8px;
    padding: 10px;
    display: none;
    flex-direction: column;
    z-index: 25;
    transition: opacity 0.3s ease;
    opacity: 0;
}

.search-bar.active {
    display: flex;
    opacity: 1;
}

#search-input {
    width: 100%;
    padding: 8px;
    border: 1px solid #00D4FF;
    border-radius: 5px;
    background: #2A2A2A;
    color: #FFFFFF;
    margin-bottom: 10px;
}

.search-results {
    max-height: 200px;
    overflow-y: auto;
}

.search-result-item {
    padding: 8px;
    background: #2A2A2A;
    border-radius: 5px;
    margin-bottom: 5px;
    cursor: pointer;
    transition: background 0.3s;
}

.search-result-item:hover {
    background: #00D4FF;
}

.content {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 1200px;
    padding-top: 100px;
    padding-bottom: 100px;
    min-height: calc(100vh - 80px);
}

.home-section, .viewer-section, .detox-section, .support-section, .sentiment-section {
    text-align: center;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
}

.sentiment-container {
    display: flex;
    flex-direction: column;
    width: 100%;
}

.top-row {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    width: 100%;
}

.left-section, .center-section, .right-section {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.left-section {
    width: 25%;
}

.center-section {
    width: 45%;
}

.right-section {
    width: 30%;
}

.token-info-section, .sentiment-score-section, .price-info-section, .social-sentiment-section {
    background: #1A1A1A;
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.5);
    text-align: left;
}

.token-info-section img {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    margin-bottom: 10px;
}

.sentiment-bar {
    width: 100%;
    height: 20px;
    background: #333;
    border-radius: 10px;
    overflow: hidden;
    margin-top: 10px;
}

.sentiment-fill {
    height: 100%;
    transition: width 0.5s ease;
}

.dexscreener-chart {
    background: #1A1A1A;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.5);
    height: 400px;
}

#dexscreenerIframe {
    width: 100%;
    height: 100%;
}

.social-sentiment-section {
    max-height: 400px;
    overflow-y: auto;
}

#xSearch {
    width: 100%;
    padding: 8px;
    border: 1px solid #00D4FF;
    border-radius: 5px;
    background: #2A2A2A;
    color: #FFFFFF;
    margin-bottom: 10px;
}

h1 {
    color: #00D4FF;
    font-size: 36px;
    margin-bottom: 20px;
}

h3 {
    color: #00D4FF;
    margin-bottom: 10px;
}

.input-section, .detox-input {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    width: 100%;
    max-width: 600px;
    margin: 0 auto 20px;
}

input[type="text"], input[type="email"], textarea {
    padding: 12px;
    width: 100%;
    max-width: 400px;
    border: 1px solid #00D4FF;
    border-radius: 8px;
    background: #1A1A1A;
    color: #FFFFFF;
}

textarea {
    max-width: 100%;
    resize: vertical;
}

button {
    padding: 12px 30px;
    background: linear-gradient(135deg, #00D4FF, #007ACC);
    color: #FFFFFF;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.5);
}

button:hover {
    background: linear-gradient(135deg, #007ACC, #00D4FF);
}

button:disabled {
    background: #A0A0A0;
    cursor: not-allowed;
}

.copy-btn, .social-btn {
    padding: 5px 10px;
    font-size: 12px;
    background: #00D4FF;
    margin-left: 5px;
}

.copy-btn:hover, .social-btn:hover {
    background: #007ACC;
}

.clear-btn {
    background: #FF5555;
}

.clear-btn:hover {
    background: #CC4444;
}

.loading-bar {
    width: 50%;
    max-width: 500px;
    height: 5px;
    background: #333;
    margin: 10px auto;
    border-radius: 5px;
    overflow: hidden;
    display: none;
}

.loading-bar::after {
    content: '';
    display: block;
    width: 30%;
    height: 100%;
    background: #00D4FF;
    animation: loading 1.5s infinite ease-in-out;
}

@keyframes loading {
    0% { transform: translateX(-100%); }
    50% { transform: translateX(300%); }
    100% { transform: translateX(300%); }
}

#walletInfo, #transactionList, .asset-list {
    background: #1A1A1A;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.5);
    margin: 20px auto;
    width: 100%;
}

table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
}

th, td {
    padding: 8px;
    text-align: left;
    border-bottom: 1px solid #2A2A2A;
}

th {
    background: linear-gradient(135deg, #00D4FF, #007ACC);
    color: #FFFFFF;
}

tr:nth-child(even) {
    background-color: #2A2A2A;
}

tr:hover {
    background-color: #3A3A3A;
}

.footer {
    position: fixed;
    bottom: 0;
    left: 250px;
    right: 0;
    background: #1A1A1A;
    padding: 15px;
    border-top: 2px solid #00D4FF;
    box-shadow: 0 -2px 10px rgba(0, 212, 255, 0.2);
    z-index: 10;
    transition: left 0.3s ease;
}

.footer.menu-closed {
    left: 50px;
}

@media (max-width: 768px) {
    .footer {
        left: 0;
    }
    .footer.menu-closed {
        left: 0;
    }
}

.carousel-container {
    width: 100%;
    overflow: hidden;
    white-space: nowrap;
    background: #1A1A1A;
    border-radius: 8px;
}

.carousel-tape {
    display: inline-flex;
    animation: slide 20s linear infinite;
}

.carousel-tape:hover {
    animation-play-state: paused;
}

@keyframes slide {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
}

.crypto-item {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: linear-gradient(135deg, #2A2A2A, #3A3A3A);
    padding: 8px 12px;
    border-radius: 8px;
    margin-right: 15px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    transition: transform 0.2s ease, background 0.3s ease;
}

.crypto-item:hover {
    transform: scale(1.05);
    background: linear-gradient(135deg, #00D4FF, #007ACC);
}

.crypto-item img {
    width: 20px;
    height: 20px;
}

.crypto-item span {
    font-size: 14px;
    font-weight: 500;
    color: #FFFFFF;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

@media (max-width: 768px) {
    .top-row {
        flex-direction: column;
    }
    .left-section, .center-section, .right-section {
        width: 100%;
    }
    .dexscreener-chart {
        height: 300px;
    }
}
