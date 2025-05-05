// script.js - Updated with Solana integration and UI logic

document.addEventListener('DOMContentLoaded', () => {
    // --- Global Variables & Constants ---
    const SOLANA_RPC_URL = 'https://api.mainnet-beta.solana.com'; // Consider using a more robust RPC provider like QuickNode or Helius for production
    const solanaConnection = new solanaWeb3.Connection(SOLANA_RPC_URL);
    const LAMPORTS_PER_SOL = solanaWeb3.LAMPORTS_PER_SOL;
    const MAX_RECENT_TRANSACTIONS = 10; // Max number of recent transactions to display

    const translations = {
        en: {
            menu_home: "Home",
            menu_dashboard: "Dashboard",
            menu_wallet_tracker: "Wallet Tracker",
            menu_token_analyzer: "Token Analyzer",
            menu_nft_gallery: "NFT Gallery",
            menu_settings: "Settings",
            menu_community: "Community",
            menu_learning: "Learn",
            connect_wallet: "Connect Wallet",
            tooltip_search: "Search",
            tooltip_user_profile: "User Profile",
            tooltip_notifications: "Notifications",
            tooltip_close: "Close",
            loading_prices: "Loading prices...",
            home_title: "Welcome to QuantyX",
            home_subtitle: "Your AI platform for crypto analysis.",
            dashboard_title: "Dashboard",
            dashboard_content: "General overview of your portfolio and the market.",
            wallet_tracker_title: "Solana Wallet Tracker",
            placeholder_wallet_address: "Enter Solana wallet address...",
            track_button: "Track",
            loading_data: "Loading data...",
            initial_wallet_message: "Enter a valid Solana wallet address to view SOL balance, tokens, NFTs, and recent transactions.",
            sol_balance_title: "SOL Balance",
            token_balances_title: "Tokens",
            no_tokens_found: "No tokens found.",
            nfts_title: "NFTs",
            no_nfts_found: "No NFTs found.",
            recent_transactions_title: "Recent Transactions",
            no_transactions_found: "No recent transactions found.",
            token_analyzer_title: "Token Analyzer",
            token_analyzer_content: "Analyze metrics and security of specific tokens.",
            nft_gallery_title: "NFT Gallery",
            nft_gallery_content: "Explore and manage your NFTs.",
            settings_title: "Settings",
            settings_content: "Adjust your account and platform preferences.",
            community_title: "Community",
            community_content: "Connect with other users, share insights, and join discussions.",
            learning_title: "Learning Center",
            learning_content: "Educational resources on crypto, blockchain, and AI.",
            search_modal_title: "Search QuantyX",
            placeholder_search: "Search features, tokens, help...",
            search_modal_initial: "Type something to search.",
            wallet_modal_title: "Connect Wallet",
            wallet_modal_content: "Wallet connection options will go here (e.g., Phantom, Solflare).",
            user_modal_title: "User Profile / Access",
            user_modal_content: "Login/registration form or user information will go here.",
            notifications_modal_title: "Notifications",
            no_new_notifications: "You have no new notifications.",
            follow_us: "Follow Us",
            rights_reserved: "All rights reserved.",
            error_invalid_address: "Invalid Solana address. Please check and try again.",
            error_fetching_balance: "Error fetching SOL balance",
            error_fetching_tokens: "Error fetching tokens",
            error_fetching_nfts: "Error fetching NFTs (may require specialized API)",
            error_fetching_transactions: "Error fetching transactions",
            error_unknown: "An unexpected error occurred",
            fetching_balance: "Fetching balance...",
            fetching_tokens: "Fetching tokens...",
            fetching_nfts: "Fetching NFTs...",
            fetching_transactions: "Fetching transactions...",
            transaction_signature: "Signature",
            transaction_details: "Details",
            view_on_explorer: "View on Solscan",
            ui_token_name: "Name",
            ui_token_balance: "Balance",
            ui_token_no_name: "Unknown Token",
            // Add other keys as needed
        },
        es: {
            menu_home: "Inicio",
            menu_dashboard: "Dashboard",
            menu_wallet_tracker: "Wallet Tracker",
            menu_token_analyzer: "Analizador Token",
            menu_nft_gallery: "Galería NFT",
            menu_settings: "Configuración",
            menu_community: "Comunidad",
            menu_learning: "Aprender",
            connect_wallet: "Conectar Wallet",
            tooltip_search: "Buscar",
            tooltip_user_profile: "Perfil de Usuario",
            tooltip_notifications: "Notificaciones",
            tooltip_close: "Cerrar",
            loading_prices: "Cargando precios...",
            home_title: "Bienvenido a QuantyX",
            home_subtitle: "Tu plataforma IA para el análisis crypto.",
            dashboard_title: "Dashboard",
            dashboard_content: "Resumen general de tu portafolio y el mercado.",
            wallet_tracker_title: "Rastreador de Wallet Solana",
            placeholder_wallet_address: "Introduce la dirección de la wallet Solana...",
            track_button: "Rastrear",
            loading_data: "Cargando datos...",
            initial_wallet_message: "Introduce una dirección de wallet Solana válida para ver el balance, tokens, NFTs y transacciones recientes.",
            sol_balance_title: "Balance SOL",
            token_balances_title: "Tokens",
            no_tokens_found: "No se encontraron tokens.",
            nfts_title: "NFTs",
            no_nfts_found: "No se encontraron NFTs.",
            recent_transactions_title: "Transacciones Recientes",
            no_transactions_found: "No se encontraron transacciones recientes.",
            token_analyzer_title: "Analizador de Tokens",
            token_analyzer_content: "Analiza métricas y seguridad de tokens específicos.",
            nft_gallery_title: "Galería NFT",
            nft_gallery_content: "Explora y gestiona tus NFTs.",
            settings_title: "Configuración",
            settings_content: "Ajusta las preferencias de tu cuenta y la plataforma.",
            community_title: "Comunidad",
            community_content: "Conéctate con otros usuarios, comparte ideas y participa en debates.",
            learning_title: "Centro de Aprendizaje",
            learning_content: "Recursos educativos sobre crypto, blockchain e IA.",
            search_modal_title: "Buscar en QuantyX",
            placeholder_search: "Buscar funciones, tokens, ayuda...",
            search_modal_initial: "Escribe algo para buscar.",
            wallet_modal_title: "Conectar Wallet",
            wallet_modal_content: "Aquí irán las opciones para conectar tu wallet (ej: Phantom, Solflare).",
            user_modal_title: "Perfil de Usuario / Acceso",
            user_modal_content: "Aquí irá el formulario de login/registro o la información del usuario.",
            notifications_modal_title: "Notificaciones",
            no_new_notifications: "No tienes notificaciones nuevas.",
            follow_us: "Síguenos",
            rights_reserved: "Todos los derechos reservados.",
            error_invalid_address: "Dirección Solana inválida. Por favor, revisa y vuelve a intentar.",
            error_fetching_balance: "Error al obtener el balance SOL",
            error_fetching_tokens: "Error al obtener los tokens",
            error_fetching_nfts: "Error al obtener los NFTs (puede requerir API especializada)",
            error_fetching_transactions: "Error al obtener las transacciones",
            error_unknown: "Ocurrió un error inesperado",
            fetching_balance: "Obteniendo balance...",
            fetching_tokens: "Obteniendo tokens...",
            fetching_nfts: "Obteniendo NFTs...",
            fetching_transactions: "Obteniendo transacciones...",
            transaction_signature: "Firma",
            transaction_details: "Detalles",
            view_on_explorer: "Ver en Solscan",
            ui_token_name: "Nombre",
            ui_token_balance: "Saldo",
            ui_token_no_name: "Token Desconocido",
            // Add other keys as needed
        }
    };
    let currentLanguage = 'es'; // Default language

    // --- DOM Element References ---
    const menuLinks = document.querySelectorAll('.sidebar .menu-item a');
    const sections = document.querySelectorAll('.main-content section');
    const searchButton = document.getElementById('search-button');
    const connectWalletButton = document.getElementById('connect-wallet-button');
    const userProfileButton = document.getElementById('user-profile-button');
    const notificationsButton = document.getElementById('notifications-button');
    const searchModal = document.getElementById('search-modal');
    const walletModal = document.getElementById('wallet-modal');
    const userModal = document.getElementById('user-modal');
    const notificationsModal = document.getElementById('notifications-modal');
    const closeButtons = document.querySelectorAll('.modal .close-button');
    const langEsButton = document.getElementById('lang-es');
    const langEnButton = document.getElementById('lang-en');
    const priceTickerContent = document.getElementById('price-ticker-content');
    const priceTickerClone = document.getElementById('price-ticker-content-clone'); // For animation
    const currentYearSpan = document.getElementById('current-year');

    // Wallet Tracker Elements
    const walletInput = document.getElementById('wallet-address-input');
    const trackButton = document.getElementById('track-wallet-button');
    const loadingIndicator = document.getElementById('loading-indicator');
    const errorMessage = document.getElementById('error-message');
    const initialMessage = document.getElementById('initial-wallet-message');
    const solBalanceCard = document.getElementById('sol-balance-card');
    const solBalanceEl = document.getElementById('sol-balance');
    const tokenBalancesCard = document.getElementById('token-balances-card');
    const tokenListEl = document.getElementById('token-list');
    const nftsCard = document.getElementById('nfts-card');
    const nftGalleryPreviewEl = document.getElementById('nft-gallery-preview');
    const transactionsCard = document.getElementById('transactions-card');
    const transactionListEl = document.getElementById('transaction-list');


    // --- Utility Functions ---

    // Helper to show an element
    const showElement = (el) => el && (el.style.display = 'block'); // or 'flex', 'grid' etc. depending on element
    // Overload for specific display types
    const showFlexElement = (el) => el && (el.style.display = 'flex');
    const showGridElement = (el) => el && (el.style.display = 'grid');
    const showInlineFlexElement = (el) => el && (el.style.display = 'inline-flex');

    // Helper to hide an element
    const hideElement = (el) => el && (el.style.display = 'none');

    // Function to apply translations
    const applyLanguage = (lang) => {
        currentLanguage = lang;
        document.documentElement.lang = lang; // Set HTML lang attribute
        document.querySelectorAll('[data-translate]').forEach(el => {
            const key = el.getAttribute('data-translate');
            if (translations[lang] && translations[lang][key]) {
                el.textContent = translations[lang][key];
            }
        });
         // Translate placeholders and titles specifically
        document.querySelectorAll('[data-translate-placeholder]').forEach(el => {
             const key = el.getAttribute('data-translate-placeholder');
             if (translations[lang] && translations[lang][key]) {
                 el.placeholder = translations[lang][key];
             }
         });
        document.querySelectorAll('[data-translate-title]').forEach(el => {
            const key = el.getAttribute('data-translate-title');
            if (translations[lang] && translations[lang][key]) {
                el.title = translations[lang][key];
            }
        });

        // Update active language button style
        langEsButton.classList.toggle('active', lang === 'es');
        langEnButton.classList.toggle('active', lang === 'en');

        // Retranslate dynamic content if needed (e.g., error messages, initial messages)
        retranslateDynamicContent();
    };

     // Function to re-apply translation to dynamic elements (like error messages)
    const retranslateDynamicContent = () => {
        // Example: Re-translate the initial wallet message if it's visible
        if (initialMessage && initialMessage.style.display !== 'none') {
            const key = initialMessage.getAttribute('data-translate');
            if (key && translations[currentLanguage] && translations[currentLanguage][key]) {
                initialMessage.textContent = translations[currentLanguage][key];
            }
        }
        // Add similar logic for other dynamic elements like error messages if they store their key
         if (errorMessage && errorMessage.style.display !== 'none' && errorMessage.dataset.translateKey) {
            const key = errorMessage.dataset.translateKey;
            const details = errorMessage.dataset.details || ""; // Get potential details stored
            let translatedText = translations[currentLanguage]?.[key] || "Unknown error";
            if (details) {
                translatedText += ` (${details})`; // Append details if they exist
            }
            errorMessage.textContent = translatedText;
        }

        // Re-translate wallet tracker UI elements if data exists
         if(solBalanceCard && solBalanceCard.style.display !== 'none') {
            const titleEl = solBalanceCard.querySelector('h2');
            if(titleEl) titleEl.textContent = translations[currentLanguage]?.sol_balance_title || "SOL Balance";
         }
         if(tokenBalancesCard && tokenBalancesCard.style.display !== 'none') {
            const titleEl = tokenBalancesCard.querySelector('h2');
            const noTokensEl = tokenListEl.querySelector('li span[data-translate="no_tokens_found"]');
            if(titleEl) titleEl.textContent = translations[currentLanguage]?.token_balances_title || "Tokens";
            if(noTokensEl && tokenListEl.children.length === 1) noTokensEl.textContent = translations[currentLanguage]?.no_tokens_found || "No tokens found.";
            // You might need to re-translate token list headers if you add them
         }
        // Similar logic for NFTs and Transactions cards...
        if(nftsCard && nftsCard.style.display !== 'none') {
            const titleEl = nftsCard.querySelector('h2');
             const noNftsEl = nftGalleryPreviewEl.querySelector('p[data-translate="no_nfts_found"]');
            if(titleEl) titleEl.textContent = translations[currentLanguage]?.nfts_title || "NFTs";
            if(noNftsEl && nftGalleryPreviewEl.children.length === 1) noNftsEl.textContent = translations[currentLanguage]?.no_nfts_found || "No NFTs found.";
        }
         if(transactionsCard && transactionsCard.style.display !== 'none') {
            const titleEl = transactionsCard.querySelector('h2');
            const noTxEl = transactionListEl.querySelector('li span[data-translate="no_transactions_found"]');
            if(titleEl) titleEl.textContent = translations[currentLanguage]?.recent_transactions_title || "Recent Transactions";
            if(noTxEl && transactionListEl.children.length === 1) noTxEl.textContent = translations[currentLanguage]?.no_transactions_found || "No recent transactions found.";
        }
    };

    // Function to format SOL balance
    const formatSolBalance = (lamports) => {
        if (typeof lamports !== 'number' || isNaN(lamports)) return '--';
        return (lamports / LAMPORTS_PER_SOL).toLocaleString(undefined, { maximumFractionDigits: 4 }) + ' SOL';
    };

     // Function to format token balance (handles decimals)
    const formatTokenBalance = (amount, decimals) => {
         if (typeof amount !== 'string' && typeof amount !== 'number' || typeof decimals !== 'number' || isNaN(decimals)) return '--';
         const divisor = Math.pow(10, decimals);
         const balance = parseFloat(amount) / divisor;
         return balance.toLocaleString(undefined, { maximumFractionDigits: decimals }); // Show appropriate decimals
     };

    // --- UI Interaction Logic ---

    // Sidebar Menu Navigation
    menuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSectionId = link.getAttribute('data-section');
            const targetSection = document.getElementById(targetSectionId);

            if (targetSection) {
                // Hide all sections
                sections.forEach(section => section.classList.remove('active'));
                // Show target section
                targetSection.classList.add('active');
                // Update active menu link
                menuLinks.forEach(item => item.classList.remove('active-menu'));
                link.classList.add('active-menu');

                // Reset Wallet Tracker if navigating to it
                if(targetSectionId === 'wallet-tracker') {
                    resetWalletTracker();
                }
            }
        });
    });

    // Modal Handling
    const openModal = (modal) => modal && (modal.style.display = 'block');
    const closeModal = (modal) => modal && (modal.style.display = 'none');

    searchButton.addEventListener('click', () => openModal(searchModal));
    connectWalletButton.addEventListener('click', () => openModal(walletModal));
    userProfileButton.addEventListener('click', () => openModal(userModal));
    notificationsButton.addEventListener('click', () => openModal(notificationsModal));

    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            closeModal(modal);
        });
    });

    // Close modal if clicking outside the content
    window.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal')) {
            closeModal(event.target);
        }
    });

     // Language Switching
    langEsButton.addEventListener('click', () => applyLanguage('es'));
    langEnButton.addEventListener('click', () => applyLanguage('en'));

    // --- Price Ticker Logic ---
    const fetchCryptoPrices = async () => {
        // Placeholder: Replace with a real API call (e.g., CoinGecko, CryptoCompare)
        // Example structure - adapt to your chosen API response
        const prices = {
            BTC: Math.random() * 5000 + 60000, // Random price for demo
            ETH: Math.random() * 300 + 3000,
            SOL: Math.random() * 20 + 130,
            BNB: Math.random() * 30 + 570,
            // Add more coins as needed
        };

         // Simple API Example (CoinGecko - free tier has rate limits)
         try {
             const coins = ['bitcoin', 'ethereum', 'solana', 'binancecoin']; // IDs for CoinGecko
             const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coins.join(',')}&vs_currencies=usd`);
             if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
             const data = await response.json();

             prices.BTC = data.bitcoin?.usd;
             prices.ETH = data.ethereum?.usd;
             prices.SOL = data.solana?.usd;
             prices.BNB = data.binancecoin?.usd;

         } catch (error) {
             console.error("Error fetching crypto prices:", error);
             priceTickerContent.innerHTML = `<span class="price-item error">Failed to load prices.</span>`;
              priceTickerClone.innerHTML = ''; // Clear clone on error
             return; // Stop if price fetching fails
         }


        // --- Update Ticker ---
        let tickerHTML = '';
        if (prices.BTC) tickerHTML += `<span class="price-item"><i class="fab fa-btc"></i> BTC: $${prices.BTC.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>`;
        if (prices.ETH) tickerHTML += `<span class="price-item"><i class="fab fa-ethereum"></i> ETH: $${prices.ETH.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>`;
        if (prices.SOL) tickerHTML += `<span class="price-item"><i class="fab fa-solana"></i> SOL: $${prices.SOL.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>`;
        if (prices.BNB) tickerHTML += `<span class="price-item"><i class="fab fa-bitcoin"></i> BNB: $${prices.BNB.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>`; // Assuming fab fa-bitcoin is okay for BNB icon

        priceTickerContent.innerHTML = tickerHTML;
        priceTickerClone.innerHTML = tickerHTML; // Update clone as well
    };


    // --- Solana Wallet Tracker Logic ---

    // Reset Wallet Tracker UI
    const resetWalletTracker = () => {
        hideElement(loadingIndicator);
        hideElement(errorMessage);
        showElement(initialMessage); // Show the initial prompt
        walletInput.value = ''; // Clear input field

        // Hide data cards and clear content
        hideElement(solBalanceCard);
        solBalanceEl.textContent = '-- SOL';
        hideElement(tokenBalancesCard);
        tokenListEl.innerHTML = `<li><span data-translate="no_tokens_found">${translations[currentLanguage]?.no_tokens_found || 'No tokens found.'}</span></li>`;
        hideElement(nftsCard);
        nftGalleryPreviewEl.innerHTML = `<p data-translate="no_nfts_found">${translations[currentLanguage]?.no_nfts_found || 'No NFTs found.'}</p>`;
        hideElement(transactionsCard);
        transactionListEl.innerHTML = `<li><span data-translate="no_transactions_found">${translations[currentLanguage]?.no_transactions_found || 'No recent transactions found.'}</span></li>`;
    };

    // Get SOL Balance
    const getSolBalance = async (publicKey) => {
        try {
            const balance = await solanaConnection.getBalance(publicKey);
            solBalanceEl.textContent = formatSolBalance(balance);
            showElement(solBalanceCard);
        } catch (error) {
            console.error("Error fetching SOL balance:", error);
            throw new Error(translations[currentLanguage]?.error_fetching_balance || 'Error fetching SOL balance');
        }
    };

   // Get Token Balances (Using getParsedTokenAccountsByOwner)
    const getTokenBalances = async (publicKey) => {
        try {
            const tokenAccounts = await solanaConnection.getParsedTokenAccountsByOwner(publicKey, {
                programId: splToken.TOKEN_PROGRAM_ID,
            });

            tokenListEl.innerHTML = ''; // Clear previous list
            let foundTokens = false;

            if (tokenAccounts.value && tokenAccounts.value.length > 0) {
                 // Optional: Fetch token metadata (names, symbols) using a metadata provider API (like Helius or SimpleHash) or a predefined list for popular tokens.
                 // This basic version only shows mint address and balance.

                 // Example: Fetching basic metadata (name, symbol) if available (limited without external API)
                 // Note: This is a simplified approach. Real metadata fetching is more complex.
                const tokenDetails = await Promise.all(tokenAccounts.value.map(async (accountInfo) => {
                    const parsedInfo = accountInfo.account.data.parsed.info;
                    const mintAddress = parsedInfo.mint;
                    const balance = formatTokenBalance(parsedInfo.tokenAmount.uiAmountString, parsedInfo.tokenAmount.decimals);

                     // Basic placeholder for name - REPLACE with real metadata fetching later
                     let tokenName = translations[currentLanguage]?.ui_token_no_name || 'Unknown Token';
                     let tokenSymbol = mintAddress.substring(0, 6) + '...'; // Use mint start as placeholder symbol

                     // Placeholder: Add logic here to fetch actual name/symbol based on mintAddress if you integrate an API

                    return { name: tokenName, symbol: tokenSymbol, balance: balance };
                }));


                tokenDetails.forEach(token => {
                     if (parseFloat(token.balance.replace(/,/g, '')) > 0) { // Only display tokens with balance > 0
                        foundTokens = true;
                        const li = document.createElement('li');
                         // Using symbol as the main identifier if name is unknown
                        li.innerHTML = `
                            <span>${token.name !== (translations[currentLanguage]?.ui_token_no_name || 'Unknown Token') ? token.name : token.symbol}</span>
                            <span>${token.balance}</span>
                        `;
                        tokenListEl.appendChild(li);
                    }
                });
            }

            if (!foundTokens) {
                tokenListEl.innerHTML = `<li><span data-translate="no_tokens_found">${translations[currentLanguage]?.no_tokens_found || 'No tokens found.'}</span></li>`;
            }
            showElement(tokenBalancesCard);

        } catch (error) {
             console.error("Error fetching token balances:", error);
             // Attempt to provide more specific error info if available
             let errorKey = 'error_fetching_tokens';
            // A TypeError might indicate issues with the RPC response structure or the library version
            if (error instanceof TypeError) {
                 console.error("TypeError likely due to RPC response or library issue.");
                 // You could set a more specific error message key here if needed
            }
             throw new Error(translations[currentLanguage]?.[errorKey] || 'Error fetching tokens');
        }
    };


    // Get NFTs (Requires Specialized API - Placeholder Implementation)
    const getNfts = async (publicKeyString) => {
         // IMPORTANT: Fetching NFTs reliably usually requires a specialized NFT API
         // (e.g., Helius, SimpleHash, QuickNode NFT API) as standard RPC calls don't easily provide NFT metadata (images, names).
         // This is a placeholder showing the structure.
        nftGalleryPreviewEl.innerHTML = ''; // Clear previous
        try {
             // --- Placeholder ---
             // Replace this section with actual API call to your chosen NFT provider
             console.warn("NFT fetching requires a specialized API (e.g., Helius, SimpleHash). This is a placeholder.");
             // Example using a hypothetical API:
             // const response = await fetch(`https://api.example-nft-provider.com/v1/nfts?owner=${publicKeyString}`);
             // const data = await response.json();
             // const nfts = data.items; // Adjust based on API response structure

             const nfts = []; // Assume empty array for now

             // --- End Placeholder ---


            if (nfts && nfts.length > 0) {
                nfts.forEach(nft => {
                    const nftDiv = document.createElement('div');
                    nftDiv.classList.add('nft-item');
                    // Use optional chaining and provide fallbacks
                    const imageUrl = nft.image?.url || nft.imageUrl || null; // Common property names for image URL
                    const name = nft.name || (translations[currentLanguage]?.ui_token_no_name || 'Unknown NFT');

                    if (imageUrl) {
                         nftDiv.innerHTML = `<img src="${imageUrl}" alt="${name}" title="${name}" loading="lazy">`;
                     } else {
                        // Placeholder if no image URL is found
                         nftDiv.innerHTML = `<span>${name.substring(0, 15)}${name.length > 15 ? '...' : ''}</span>`;
                    }
                    nftGalleryPreviewEl.appendChild(nftDiv);
                });
            } else {
                nftGalleryPreviewEl.innerHTML = `<p data-translate="no_nfts_found">${translations[currentLanguage]?.no_nfts_found || 'No NFTs found.'}</p>`;
            }
             showGridElement(nftsCard); // Use showGridElement if display: grid
        } catch (error) {
             console.error("Error fetching NFTs:", error);
             // Show a placeholder message even on error, indicating the issue
             nftGalleryPreviewEl.innerHTML = `<p class="error-message">${translations[currentLanguage]?.error_fetching_nfts || 'Error fetching NFTs (may require specialized API)'}</p>`;
            showGridElement(nftsCard); // Still show the card, but with the error message
             // Do not re-throw here if you want other parts (like balance) to potentially still load
             // throw new Error(translations[currentLanguage]?.error_fetching_nfts || 'Error fetching NFTs (may require specialized API)');
        }
    };


    // Get Recent Transactions
    const getRecentTransactions = async (publicKey) => {
        try {
            const signatures = await solanaConnection.getSignaturesForAddress(publicKey, {
                limit: MAX_RECENT_TRANSACTIONS,
            });

            transactionListEl.innerHTML = ''; // Clear previous list
            if (signatures && signatures.length > 0) {
                signatures.forEach(sigInfo => {
                    const li = document.createElement('li');
                    const signature = sigInfo.signature;
                    const date = new Date(sigInfo.blockTime * 1000).toLocaleString(); // Format timestamp

                    li.innerHTML = `
                        <span>
                            <strong data-translate="transaction_signature"> ${translations[currentLanguage]?.transaction_signature || 'Signature'}:</strong> ${signature.substring(0, 10)}...${signature.substring(signature.length - 5)} <br>
                            <small>${date}</small>
                         </span>
                         <a href="https://solscan.io/tx/${signature}" target="_blank" rel="noopener noreferrer" class="button primary-button small-button" data-translate="view_on_explorer">${translations[currentLanguage]?.view_on_explorer || 'View on Solscan'}</a>

                    `;
                     // You could potentially add another API call here to get transaction details based on the signature for more info.
                    transactionListEl.appendChild(li);
                });
            } else {
                transactionListEl.innerHTML = `<li><span data-translate="no_transactions_found">${translations[currentLanguage]?.no_transactions_found || 'No recent transactions found.'}</span></li>`;
            }
            showGridElement(transactionsCard); // Use showGridElement if display: grid

        } catch (error) {
            console.error("Error fetching transactions:", error);
            throw new Error(translations[currentLanguage]?.error_fetching_transactions || 'Error fetching transactions');
        }
    };

     // Main function to track wallet
     const trackWallet = async () => {
        const address = walletInput.value.trim();
         hideElement(initialMessage); // Hide initial message on track attempt
         hideElement(errorMessage);   // Hide previous errors
         showFlexElement(loadingIndicator); // Show loading indicator

        // Hide previous results immediately
        hideElement(solBalanceCard);
        hideElement(tokenBalancesCard);
        hideElement(nftsCard);
        hideElement(transactionsCard);

        // Clear previous content while loading
        solBalanceEl.textContent = '-- SOL';
        tokenListEl.innerHTML = `<li><i class="fas fa-spinner fa-spin"></i> <span data-translate="fetching_tokens">${translations[currentLanguage]?.fetching_tokens || 'Fetching tokens...'}</span></li>`;
         nftGalleryPreviewEl.innerHTML = `<p><i class="fas fa-spinner fa-spin"></i> <span data-translate="fetching_nfts">${translations[currentLanguage]?.fetching_nfts || 'Fetching NFTs...'}</span></p>`;
        transactionListEl.innerHTML = `<li><i class="fas fa-spinner fa-spin"></i> <span data-translate="fetching_transactions">${translations[currentLanguage]?.fetching_transactions || 'Fetching transactions...'}</span></li>`;


        let publicKey;
        try {
            // Validate Solana Address
            if (!address) {
                 throw new Error(translations[currentLanguage]?.error_invalid_address || "Invalid Solana address. Please check and try again.", { cause: 'validation' });
            }
            publicKey = new solanaWeb3.PublicKey(address);

            // Fetch data sequentially or in parallel
            // Using Promise.allSettled allows all requests to complete, even if some fail
            const results = await Promise.allSettled([
                 getSolBalance(publicKey),
                 getTokenBalances(publicKey),
                 getNfts(address), // Pass string address if needed by NFT API
                 getRecentTransactions(publicKey)
             ]);

             // Process results and handle individual errors
             results.forEach((result, index) => {
                if (result.status === 'rejected') {
                     console.error(`Error in operation ${index}:`, result.reason);
                     // Display a general error or specific error if needed, but don't overwrite a critical validation error
                     if (!errorMessage.textContent || errorMessage.dataset.errorType !== 'validation') {
                        errorMessage.textContent = result.reason.message || (translations[currentLanguage]?.error_unknown || 'An unexpected error occurred');
                        errorMessage.dataset.translateKey = 'error_unknown'; // Generic key for re-translation
                        errorMessage.dataset.details = `Operation ${index} failed`;
                         showElement(errorMessage);
                     }
                    // Depending on which promise failed, you might want to hide the corresponding card again or show an error within the card
                    if (index === 0) hideElement(solBalanceCard); // Failed fetching SOL
                    if (index === 1) { // Failed fetching tokens
                         tokenListEl.innerHTML = `<li class="error-message">${result.reason.message || (translations[currentLanguage]?.error_fetching_tokens || 'Error fetching tokens')}</li>`;
                        showElement(tokenBalancesCard); // Show card with error message
                    }
                    if (index === 2) { // Failed fetching NFTs - Already handled inside getNfts
                        // nftGalleryPreviewEl.innerHTML = `<p class="error-message">${result.reason.message || translations[currentLanguage]?.error_fetching_nfts}</p>`;
                        // showGridElement(nftsCard);
                    }
                    if (index === 3) { // Failed fetching transactions
                         transactionListEl.innerHTML = `<li class="error-message">${result.reason.message || (translations[currentLanguage]?.error_fetching_transactions || 'Error fetching transactions')}</li>`;
                        showGridElement(transactionsCard);
                    }
                 }
             });


        } catch (error) {
            console.error("Wallet tracking error:", error);
             // Handle validation error or other critical errors
            errorMessage.textContent = error.message || (translations[currentLanguage]?.error_unknown || 'An unexpected error occurred');
             // Store the key for re-translation if it's a known validation error
             if (error.cause === 'validation') {
                errorMessage.dataset.translateKey = 'error_invalid_address';
                errorMessage.dataset.errorType = 'validation'; // Mark as validation error
            } else {
                 errorMessage.dataset.translateKey = 'error_unknown'; // Generic key
                  errorMessage.dataset.errorType = 'general';
             }
             errorMessage.dataset.details = ""; // Clear details for general errors
             showElement(errorMessage);

            // Ensure all data cards are hidden on critical failure
             resetWalletTracker(); // Use reset to ensure clean state on critical error
             hideElement(initialMessage); // Keep initial message hidden
             showElement(errorMessage); // Re-show error message after reset potentially hides it


        } finally {
             hideElement(loadingIndicator); // Always hide loading indicator
        }
    };


    // --- Event Listeners ---

    // Wallet Tracker Event Listeners
    trackButton.addEventListener('click', trackWallet);
    walletInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent form submission if it were in a form
            trackWallet();
        }
    });

    // --- Initialization ---
    const initializeApp = () => {
        // Set current year in footer
        if (currentYearSpan) {
            currentYearSpan.textContent = new Date().getFullYear();
        }

        // Set initial language and apply translations
        applyLanguage(currentLanguage); // Apply default language ('es')

         // Fetch initial crypto prices for the ticker
         fetchCryptoPrices();
        // Optional: Set an interval to refresh prices periodically (e.g., every 60 seconds)
        // setInterval(fetchCryptoPrices, 60000);

        // Ensure 'home' section is active on load
        const homeSection = document.getElementById('home');
        const homeMenuItemLink = document.querySelector('.sidebar .menu-item a[data-section="home"]');
        if (homeSection) homeSection.classList.add('active');
        if (homeMenuItemLink) homeMenuItemLink.classList.add('active-menu');

         // Reset wallet tracker section on initial load just in case
         resetWalletTracker();

        console.log("QuantyX App Initialized");
    };

    initializeApp(); // Run initialization

}); // End DOMContentLoaded
