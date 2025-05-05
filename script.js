// script.js - FINAL CORRECTION attempt for TypeError in getParsedTokenAccountsByOwner

document.addEventListener('DOMContentLoaded', () => {
    // --- Lógica para mostrar secciones al hacer clic en el menú ---
    const menuLinks = document.querySelectorAll('.sidebar .menu-item a');
    const sections = document.querySelectorAll('.main-content section');

    menuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); // Evita la recarga de la página

            const targetSectionId = link.getAttribute('data-section');
            const targetSection = document.getElementById(targetSectionId);

            if (targetSection) {
                // Oculta todas las secciones
                sections.forEach(section => {
                    section.classList.remove('active');
                });

                // Muestra la sección objetivo
                targetSection.classList.add('active');

                // Remover la clase 'active' de otros enlaces del menú y añadirla al clicado
                 menuLinks.forEach(item => item.classList.remove('active-menu'));
                 link.classList.add('active-menu');

                // Si la sección Wallet Tracker se activa, limpiar y resetear su estado
                if(targetSectionId === 'wallet-tracker') {
                    resetWalletTracker();
                }
                 // Opcional: Para otras secciones, limpiar mensajes de error o carga si existen
                 // if(targetSectionId !== 'wallet-tracker') {
                 //     hideElement(loadingIndicator);
                 //     hideElement(errorMessage);
                 // }
            }
        });
    });

     // --- Lógica para el cambio de idioma ---
     const languageSwitcher = document.getElementById('language-switcher');
     const languageDropdown = languageSwitcher.querySelector('.language-dropdown');
     const langSpans = languageDropdown.querySelectorAll('span');
     const menuTexts = document.querySelectorAll('.sidebar .menu-item .menu-text');
     const mainHeading = document.querySelector('#home h1'); // Título de la sección Home

     // Elementos del footer y modales para traducción
     const searchModalTitle = document.querySelector('#search-modal h2');
     const walletModalTitle = document.querySelector('#wallet-modal h2');
     const userModalTitle = document.querySelector('#user-modal h2');
     const socialTitle = document.querySelector('.social-media h3');
     const footerBottomText = document.querySelector('.footer-bottom');
     const searchInputPlaceholder = document.getElementById('search-input'); // Input de búsqueda en modal
     const walletInputPlaceholder = document.getElementById('solana-wallet-address'); // Input en Wallet Tracker
     const trackWalletButton = document.getElementById('track-wallet-btn'); // Botón en Wallet Tracker

     // Elementos de Wallet Tracker para traducción de mensajes/títulos
     const walletTrackerSectionTitle = document.querySelector('#wallet-tracker h2'); // Título principal de la sección
     const initialMessage = document.getElementById('initial-message'); // Mensaje inicial
     const loadingIndicator = document.getElementById('loading-indicator'); // Indicador de carga
     const errorMessage = document.getElementById('error-message'); // Mensaje de error
     const solBalanceCardTitle = document.querySelector('#sol-balance-card h3'); // Título tarjeta SOL
     const tokenBalancesCardTitle = document.querySelector('#token-balances-card h3'); // Título tarjeta Tokens
     const nftsCardTitle = document.querySelector('#nfts-card h3'); // Título tarjeta NFTs
     const transactionsCardTitle = document.querySelector('#transactions-card h3'); // Título tarjeta Transacciones


     // Diccionario de traducciones básicas (expandir según necesites)
     const translations = {
         'es': {
             homeTitle: 'Bienvenido a QuantyX',
             homeMenuItem: 'Inicio',
             sentimentAnalyzer: 'Analizador de Sentimientos',
             walletTracker: 'Wallet Tracker',
             botTrading: 'Bot Trading',
             sniper: 'Sniper',
             tokenCreator: 'Creador de Token',
             staking: 'Staking',
             gaming: 'Gaming',
             nftCollection: 'Colección NFTs',
             detoxReclaim: 'Detox & Reclaim',
             knowledgeBase: 'Base de Conocimiento',
             chatbot: 'ChatBot',
             searchTitle: 'Buscar en QuantyX',
             walletConnectTitle: 'Conectar Wallet',
             userProfileTitle: 'Perfil de Usuario / Acceso',
             socialTitle: 'Síguenos',
             footerBottom: '© 2025 QuantyX. Todos los derechos reservados.',
             noSearchResults: 'No se encontraron resultados.',
             // Traducciones para Wallet Tracker
             walletTrackerTitle: 'Wallet Tracker', // Título principal de la sección WT
             walletInputPlaceholder: 'Introduce la dirección de la billetera de Solana', // Placeholder input WT
             trackButtonText: 'Rastrear', // Texto del botón Rastrear
             walletInitialMessage: 'Introduce una dirección de billetera de Solana para ver sus detalles.', // Mensaje inicial WT
             walletLoadingMessage: 'Cargando datos de la billetera...', // Mensaje de carga WT
             walletErrorInvalidAddress: 'Dirección de billetera de Solana inválida.', // Mensaje de error dirección inválida
             walletErrorFetching: 'Error al obtener los datos de la billetera. Código: ', // Mensaje error general fetching + código de error
             solBalanceTitle: 'Saldo SOL', // Título tarjeta SOL
             tokenBalancesTitle: 'Tokens (SPL)', // Título tarjeta Tokens
             nftsTitle: 'NFTs', // Título tarjeta NFTs
             transactionsTitle: 'Transacciones Recientes', // Título tarjeta Transacciones
             noTokensFound: 'No se encontraron tokens.', // Mensaje no tokens
             noNftsFound: 'No se encontraron NFTs.', // Mensaje no NFTs
             noTransactionsFound: 'No se encontraron transacciones recientes.', // Mensaje no transacciones
             transactionTypeTransfer: 'Transferencia',
             transactionTypeUnknown: 'Desconocido',
             transactionDirectionSent: 'Enviado a',
             transactionDirectionReceived: 'Recibido de',
             transactionDirectionSelf: 'Propio',
             transactionSolAmount: 'Cantidad SOL',
             transactionTokenAmount: 'Cantidad',
             transactionFee: 'Tarifa'
         },
         'en': {
             homeTitle: 'Welcome to QuantyX',
             homeMenuItem: 'Home',
             sentimentAnalyzer: 'Sentiment Analyzer',
             walletTracker: 'Wallet Tracker',
             botTrading: 'Trading Bot',
             sniper: 'Sniper',
             tokenCreator: 'Token Creator',
             staking: 'Staking',
             gaming: 'Gaming',
             nftCollection: 'NFT Collection',
             detoxReclaim: 'Detox & Reclaim',
             knowledgeBase: 'Knowledge Base',
             chatbot: 'ChatBot',
             searchTitle: 'Search QuantyX',
             walletConnectTitle: 'Connect Wallet',
             userProfileTitle: 'User Profile / Access',
             socialTitle: 'Follow Us',
             footerBottom: '© 2025 QuantyX. All rights reserved.',
             noSearchResults: 'No results found.',
             // Traducciones para Wallet Tracker
             walletTrackerTitle: 'Wallet Tracker',
             walletInputPlaceholder: 'Enter Solana wallet address',
             trackButtonText: 'Track',
             walletInitialMessage: 'Enter a Solana wallet address to see its details.',
             walletLoadingMessage: 'Loading wallet data...',
             walletErrorInvalidAddress: 'Invalid Solana wallet address.',
             walletErrorFetching: 'Error fetching wallet data. Code: ',
             solBalanceTitle: 'SOL Balance',
             tokenBalancesTitle: 'Tokens (SPL)',
             nftsTitle: 'NFTs',
             transactionsTitle: 'Recent Transactions',
             noTokensFound: 'No tokens found.',
             noNftsFound: 'No NFTs found.',
             noTransactionsFound: 'No recent transactions found.'
         },
         'fr': {
             homeTitle: 'Bienvenue chez QuantyX',
             homeMenuItem: 'Accueil',
             sentimentAnalyzer: 'Analyseur de Sentiments',
             walletTracker: 'Suivi de Portefeuille',
             botTrading: 'Bot de Trading',
             sniper: 'Sniper',
             tokenCreator: 'Créateur de Token',
             staking: 'Staking',
             gaming: 'Gaming',
             nftCollection: 'Collection NFTs',
             detoxReclaim: 'Détox & Réclamation',
             knowledgeBase: 'Base de Connaissances',
             chatbot: 'ChatBot',
             searchTitle: 'Rechercher dans QuantyX',
             walletConnectTitle: 'Connecter le Portefeuille',
             userProfileTitle: 'Profil Utilisateur / Accès',
             socialTitle: 'Suivez-nous',
             footerBottom: '© 2025 QuantyX. Tous droits réservés.',
             noSearchResults: 'Aucun résultat trouvé.',
             // Traducciones para Wallet Tracker
             walletTrackerTitle: 'Suivi de Portefeuille',
             walletInputPlaceholder: 'Entrez l\'adresse du portefeuille Solana',
             trackButtonText: 'Suivre',
             walletInitialMessage: 'Entrez une adresse de portefeuille Solana para ver sus detalles.',
             walletLoadingMessage: 'Chargement des données du portefeuille...',
             walletErrorInvalidAddress: 'Adresse de portefeuille Solana invalide.',
             walletErrorFetching: 'Erreur lors de la récupération des données du portefeuille. Code : ',
             solBalanceTitle: 'Solde SOL',
             tokenBalancesTitle: 'Jetons (SPL)',
             nftsTitle: 'NFTs',
             transactionsTitle: 'Transactions Récentes',
             noTokensFound: 'Aucun jeton trouvé.',
             noNftsFound: 'Aucun NFT trouvé.',
             noTransactionsFound: 'Aucune transaction récente trouvée.',
             transactionTypeTransfer: 'Transfert',
             transactionTypeUnknown: 'Inconnu',
             transactionDirectionSent: 'Envoyé à',
             transactionDirectionReceived: 'Reçu de',
             transactionDirectionSelf: 'Propre',
             transactionSolAmount: 'Montant SOL',
             transactionTokenAmount: 'Montant',
             transactionFee: 'Frais'
         }
     };

     let currentLang = document.documentElement.lang || 'es';


     const applyLanguage = (lang) => {
         const texts = translations[lang];
         if (!texts) return;

         currentLang = lang;

         // Aplica traducciones al menú lateral
         menuTexts.forEach(textSpan => {
             const dataSection = textSpan.parentElement.getAttribute('data-section');
             switch(dataSection) {
                 case 'home': textSpan.textContent = texts.homeMenuItem; break;
                 case 'sentiment-analyzer': textSpan.textContent = texts.sentimentAnalyzer; break;
                 case 'wallet-tracker': textSpan.textContent = texts.walletTracker; break;
                 case 'bot-trading': textSpan.textContent = texts.botTrading; break;
                 case 'sniper': textSpan.textContent = texts.sniper; break;
                 case 'token-creator': textSpan.textContent = texts.tokenCreator; break;
                 case 'staking': textSpan.textContent = texts.staking; break;
                 case 'gaming': textSpan.textContent = texts.gaming; break;
                 case 'nft-collection': textSpan.textContent = texts.nftCollection; break;
                 case 'detox-reclaim': textSpan.textContent = texts.detoxReclaim; break;
                 case 'knowledge-base': textSpan.textContent = texts.knowledgeBase; break;
                 case 'chatbot': textSpan.textContent = texts.chatbot; break;
             }
         });

         if (mainHeading && texts.homeTitle) { mainHeading.textContent = texts.homeTitle; }
         if (searchModalTitle && texts.searchTitle) searchModalTitle.textContent = texts.searchTitle;
         if (walletModalTitle && texts.walletConnectTitle) walletModalTitle.textContent = texts.walletConnectTitle;
         if (userModalTitle && texts.userProfileTitle) userModalTitle.textContent = texts.userProfileTitle;
         if (socialTitle && texts.socialTitle) socialTitle.textContent = texts.socialTitle;
         if (footerBottomText && texts.footerBottom) footerBottomText.textContent = texts.footerBottom;
         if (searchInputPlaceholder && texts.searchTitle) searchInputPlaceholder.placeholder = texts.searchTitle;
         if (walletInputPlaceholder && texts.walletInputPlaceholder) walletInputPlaceholder.placeholder = texts.walletInputPlaceholder;

         // Actualizar texto del botón Rastrear (manteniendo el icono)
         if (trackWalletButton && texts.trackButtonText) {
             const icon = trackWalletButton.querySelector('i');
             trackWalletButton.textContent = texts.trackButtonText;
             if(icon) trackWalletButton.prepend(icon);
         }

         // Actualizar textos específicos de Wallet Tracker
         if (walletTrackerSectionTitle && texts.walletTrackerTitle) walletTrackerSectionTitle.textContent = texts.walletTrackerTitle;
         if (initialMessage && texts.walletInitialMessage) initialMessage.textContent = texts.walletInitialMessage;
         // Mensaje de carga no necesita traducción directa aquí, ya tiene el texto
         // Mensaje de error se actualiza en trackWallet
         if (solBalanceCardTitle && texts.solBalanceTitle) {
              const icon = solBalanceCardTitle.querySelector('i');
              solBalanceCardTitle.textContent = texts.solBalanceTitle;
               if(icon) solBalanceCardTitle.prepend(icon);
         }
         if (tokenBalancesCardTitle && texts.tokenBalancesTitle) {
              const icon = tokenBalancesCardTitle.querySelector('i');
              tokenBalancesCardTitle.textContent = texts.tokenBalancesTitle;
               if(icon) tokenBalancesCardTitle.prepend(icon);
         }
         if (nftsCardTitle && texts.nftsTitle) {
              const icon = nftsCardTitle.querySelector('i');
              nftsCardTitle.textContent = texts.nftsTitle;
               if(icon) nftsCardTitle.prepend(icon);
         }
         if (transactionsCardTitle && texts.transactionsTitle) {
              const icon = transactionsCardTitle.querySelector('i');
              transactionsCardTitle.textContent = texts.transactionsTitle;
               if(icon) transactionsCardTitle.prepend(icon);
         }

         // Re-ejecutar búsqueda si el modal está abierto y tiene texto (para actualizar resultados)
         const searchModal = document.getElementById('search-modal');
         const searchInput = document.getElementById('search-input');
         if(searchModal.classList.contains('show') && searchInput.value.trim() !== '') {
              performSearch();
         }
     };

     // Event listeners para el cambio de idioma
     langSpans.forEach(span => {
         span.addEventListener('click', (e) => {
             const selectedLang = e.target.getAttribute('data-lang');
             applyLanguage(selectedLang);
             languageDropdown.style.display = 'none';
         });
     });

     document.addEventListener('click', (e) => {
         const isClickInsideDropdown = languageDropdown.contains(e.target);
         const isClickOnSwitcher = languageSwitcher.contains(e.target);
         if (!isClickInsideDropdown && !isClickOnSwitcher) {
             languageDropdown.style.display = 'none';
         }
     });

      languageSwitcher.addEventListener('click', (e) => {
           e.stopPropagation();
           const isHidden = languageDropdown.style.display === 'none' || languageDropdown.style.display === '';
           languageDropdown.style.display = isHidden ? 'flex' : 'none';
       });


     // --- Lógica para mostrar/ocultar Modales ---
     const searchIcon = document.getElementById('search-icon');
     const walletConnectIcon = document.getElementById('wallet-icon');
     const userIcon = document.getElementById('user-icon');
     const searchModal = document.getElementById('search-modal');
     const walletModal = document.getElementById('wallet-modal');
     const userModal = document.getElementById('user-modal');
     const closeButtons = document.querySelectorAll('.modal .close-button');

     const showModal = (modalElement) => {
         modalElement.classList.add('show');
         languageDropdown.style.display = 'none';
     };

     const hideModal = (modalElement) => {
         modalElement.classList.remove('show');
     };

     searchIcon.addEventListener('click', () => {
         showModal(searchModal);
         document.getElementById('search-input').focus();
     });
     walletConnectIcon.addEventListener('click', () => showModal(walletModal));
     userIcon.addEventListener('click', () => showModal(userModal));

     closeButtons.forEach(button => {
         button.addEventListener('click', (e) => {
             const modalToClose = e.target.closest('.modal');
             if (modalToClose) {
                 if(modalToClose.id === 'search-modal') {
                      document.getElementById('search-input').value = '';
                      document.getElementById('search-results').innerHTML = '';
                 }
                 hideModal(modalToClose);
             }
         });
     });

     window.addEventListener('click', (e) => {
         if (e.target.classList.contains('modal')) {
              if(e.target.id === 'search-modal') {
                   document.getElementById('search-input').value = '';
                   document.getElementById('search-results').innerHTML = '';
              }
              hideModal(e.target);
         }
     });


     // --- Lógica de Búsqueda Básica (dentro de secciones) ---
     const searchInput = document.getElementById('search-input');
     const searchResultsContainer = document.getElementById('search-results');
     const contentSections = document.querySelectorAll('.main-content section');


     const performSearch = () => {
         const query = searchInput.value.trim().toLowerCase();
         searchResultsContainer.innerHTML = '';

         if (query.length < 2) {
              return;
         }

         let resultsFound = false;

         contentSections.forEach(section => {
             if (section.id === 'home') return;

             const sectionText = section.textContent ? section.textContent.toLowerCase() : '';
             const sectionId = section.id;
             const sectionTitleElement = section.querySelector('h2') || section.querySelector('h1');
             let sectionTitle = sectionTitleElement ? sectionTitleElement.textContent : sectionId;

              if (section.id === 'home' && translations[currentLang] && translations[currentLang].homeMenuItem) {
                   sectionTitle = translations[currentLang].homeMenuItem;
              } else if (translations[currentLang]) {
                   const menuLinkForSection = document.querySelector(`.sidebar .menu-item a[data-section="${sectionId}"]`);
                   if(menuLinkForSection) {
                        const menuTextSpan = menuLinkForSection.querySelector('.menu-text');
                        if(menuTextSpan) {
                             sectionTitle = menuTextSpan.textContent;
                        }
                   }
              }


             if (sectionText.includes(query)) {
                 resultsFound = true;
                 const resultLink = document.createElement('a');
                 resultLink.href = `#${sectionId}`;
                 resultLink.textContent = `Encontrado en: ${sectionTitle}`;

                 resultLink.addEventListener('click', () => {
                     hideModal(searchModal);
                 });

                 searchResultsContainer.appendChild(resultLink);
             }
         });

         if (!resultsFound) {
             const noResultsMessage = document.createElement('p');
             noResultsMessage.textContent = translations[currentLang].noSearchResults;
             searchResultsContainer.appendChild(noResultsMessage);
         }
     };

     searchInput.addEventListener('input', performSearch);


     // --- Lógica para la sección Wallet Tracker (Usando Helius API) ---

     // ¡ADVERTENCIA DE SEGURIDAD! Esta clave API NO debe estar aquí en producción.
     // Debería manejarse en el backend.
     const HELIUS_API_KEY = '6fbed4b2-ce46-4c7d-b827-2c1d5a539ff2'; // <<--- Tu clave API de Helius
     const HELIUS_RPC_URL = `https://rpc.helius.xyz/?api-key=${HELIUS_API_KEY}`; // RPC URL usando la clave
     const HELIUS_API_URL = `https://api.helius.xyz/v0/`; // Base URL para otras APIs de Helius

     // Usamos @solana/web3.js para la conexión principal y algunas llamadas estándar
     // Asegúrate de que la librería web3.js esté cargada en tu HTML antes de este script
     const connection = new solanaWeb3.Connection(HELIUS_RPC_URL);

     const walletInput = document.getElementById('solana-wallet-address');
     const trackButton = document.getElementById('track-wallet-btn');
     const walletDataDisplay = document.getElementById('wallet-data-display');
     const solBalanceSpan = document.getElementById('sol-balance');
     const tokenListUl = document.getElementById('token-list');
     const nftGalleryDiv = document.getElementById('nft-gallery');
     const transactionListUl = document.getElementById('transaction-list');

     const solBalanceCard = document.getElementById('sol-balance-card');
     const tokenBalancesCard = document.getElementById('token-balances-card');
     const nftsCard = document.getElementById('nfts-card');
     const transactionsCard = document.getElementById('transactions-card');

     // Helper para ocultar/mostrar usando la clase 'hidden'
     const hideElement = (el) => { if(el) el.classList.add('hidden'); };
     const showElement = (el) => { if(el) el.classList.remove('hidden'); };


     const resetWalletTracker = () => {
          walletInput.value = '';
          showElement(walletDataDisplay); // Asegurarse de que el contenedor principal esté visible
          showElement(initialMessage);
          hideElement(loadingIndicator);
          hideElement(errorMessage);

          hideElement(solBalanceCard);
          hideElement(tokenBalancesCard);
          hideElement(nftsCard);
          hideElement(transactionsCard);

          solBalanceSpan.textContent = '-';
          tokenListUl.innerHTML = '';
          nftGalleryDiv.innerHTML = '';
          transactionListUl.innerHTML = '';

          // Restablecer el texto del botón "Rastrear" (si se cambió durante la carga)
          if (translations[currentLang] && translations[currentLang].trackButtonText) {
               const icon = trackButton.querySelector('i');
               trackButton.textContent = translations[currentLang].trackButtonText;
                if(icon) trackButton.prepend(icon);
           }
     };


     const trackWallet = async () => {
         const address = walletInput.value.trim();

         // Resetear y mostrar estado de carga
         showElement(walletDataDisplay);
         hideElement(initialMessage);
         hideElement(errorMessage);
         showElement(loadingIndicator);

         hideElement(solBalanceCard);
         hideElement(tokenBalancesCard);
         hideElement(nftsCard);
         hideElement(transactionsCard);
         solBalanceSpan.textContent = '-';
         tokenListUl.innerHTML = '';
         nftGalleryDiv.innerHTML = '';
         transactionListUl.innerHTML = '';


         if (address === '') {
             errorMessage.textContent = translations[currentLang].walletErrorInvalidAddress;
             showElement(errorMessage);
             hideElement(loadingIndicator);
             return;
         }

         let publicKey;
         try {
             // Validar formato de la dirección usando la librería de Solana
             publicKey = new solanaWeb3.PublicKey(address);
             console.log("Wallet address validated:", address);
         } catch (error) {
             errorMessage.textContent = translations[currentLang].walletErrorInvalidAddress;
             showElement(errorMessage);
             hideElement(loadingIndicator);
             console.error("Invalid address format:", error);
             return;
         }

         // Use a general try...catch for overall errors,
         // but also specific catches for known problematic API calls if needed.
         // El error TypeError: Cannot read properties of undefined (reading 'toBase58')
         // en connection.getParsedTokenAccountsByOwner indica un problema DENTRO de esa llamada
         // al procesar la respuesta del RPC para cierta data de billetera.
         // Lo aislamos con un try/catch específico para que no falle toda la función.
         try {
             // --- Obtener Datos de la Blockchain usando Helius y web3.js ---

             // 1. Obtener Saldo SOL (usando web3.js con el RPC de Helius)
             console.log("Attempting to fetch SOL balance...");
             try {
                 const solBalanceLamports = await connection.getBalance(publicKey);
                 const solBalance = solBalanceLamports / solanaWeb3.LAMPORTS_PER_SOL;
                 solBalanceSpan.textContent = solBalance.toFixed(4);
                 showElement(solBalanceCard);
                 console.log("SOL balance fetched:", solBalance);
             } catch (error) {
                  console.error("Error fetching SOL balance:", error);
                  // Opcional: Mostrar un mensaje de error solo para el saldo SOL si falla
                  // solBalanceSpan.textContent = 'Error';
             }


             // 2. Obtener Cuentas de Token (SPL) (usando web3.js con el RPC de Helius)
             console.log("Attempting to fetch token accounts...");
             let tokenAccounts = { value: [] }; // Initialize in case of error
             let tokenFetchError = false;
             try {
                 // THIS IS THE CALL THAT HAS BEEN CAUSING THE TypeError
                 tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
                     programId: solanaWeb3.TOKEN_PROGRAM_ID,
                 });
                 console.log("Raw token accounts response:", tokenAccounts); // Log raw response for debugging
                 console.log("Token accounts fetched:", tokenAccounts.value ? tokenAccounts.value.length : 0, "accounts");


                 // Process token accounts ONLY if fetching was successful and returned a valid structure
                 if (tokenAccounts && Array.isArray(tokenAccounts.value) && tokenAccounts.value.length > 0) {
                      let tokensFoundWithBalance = 0;
                      tokenAccounts.value.forEach(account => {
                          // Asegurarse de que la cuenta sea un token y esté parseada
                          if (account.account && account.account.data && account.account.data.parsed && account.account.data.parsed.info) {
                               const accountInfo = account.account.data.parsed.info;
                               const mintAddress = accountInfo.mint;
                               const tokenBalance = accountInfo.tokenAmount.uiAmount;

                               if (tokenBalance > 0) {
                                     tokensFoundWithBalance++;
                                    const listItem = document.createElement('li');
                                    const tokenName = accountInfo.tokenAmount.uiAmountString.includes(mintAddress.substring(0,4)) ? mintAddress.substring(0, 6) + '...' + mintAddress.substring(mintAddress.length - 6) : accountInfo.tokenAmount.uiAmountString.split(' ')[1] || mintAddress.substring(0, 6) + '...';
                                     listItem.innerHTML = `
                                          <span class="item-info">
                                               <i class="fas fa-dot-circle"></i> <span>${tokenName}</span> </span>
                                          <span class="item-value">${tokenBalance}</span>
                                     `;
                                     tokenListUl.appendChild(listItem);
                                }
                          } else {
                              console.warn("Skipping unparsed or invalid token account:", account);
                          }
                      });
                       if (tokensFoundWithBalance > 0) {
                           showElement(tokenBalancesCard);
                       } else {
                            const noTokensLi = document.createElement('li');
                            noTokensLi.textContent = translations[currentLang].noTokensFound;
                            noTokensLi.style.justifyContent = 'center';
                            noTokensLi.style.color = '#a0a0a0';
                            noTokensLi.style.fontStyle = 'italic';
                            tokenListUl.appendChild(noTokensLi);
                            showElement(tokenBalancesCard);
                       }
                  } else { // tokenAccounts.value is null, undefined, or an empty array
                       const noTokensLi = document.createElement('li');
                       noTokensLi.textContent = translations[currentLang].noTokensFound;
                       noTokensLi.style.justifyContent = 'center';
                       noTokensLi.style.color = '#a0a0a0';
                       noTokensLi.style.fontStyle = 'italic';
                       tokenListUl.appendChild(noTokensLi);
                       showElement(tokenBalancesCard);
                  }

             } catch (error) {
                 // Catching the specific error from getParsedTokenAccountsByOwner
                 tokenFetchError = true; // Mark that this specific fetch failed
                 console.error("Error fetching or parsing token accounts:", error);
                 const errorTokenLi = document.createElement('li');
                 // Display the error message from the catch
                 errorTokenLi.textContent = `Error al cargar tokens: ${error.message || 'Desconocido'}`;
                 errorTokenLi.style.justifyContent = 'center';
                 errorTokenLi.style.color = '#ff6b6b'; // Color rojo para errores
                 errorTokenLi.style.fontStyle = 'normal'; // No itálica para errores
                 tokenListUl.appendChild(errorTokenLi);
                 showElement(tokenBalancesCard); // Show the card with the error message

                 // Crucial: If this fetch failed, ensure tokenAccounts.value is an empty array
                 // so the subsequent processing doesn't try to loop over undefined/null
                 tokenAccounts = { value: [] };
             }


             // 3. Obtener NFTs (Usando Helius Digital Assets API)
             console.log("Attempting to fetch NFTs from Helius...");
             // Use a specific try/catch for Helius API calls as well
             try {
                 const nftsResponse = await fetch(`${HELIUS_API_URL}addresses/${address}/nfts?api-key=${HELIUS_API_KEY}`);
                 const nftsData = await nftsResponse.json();
                 console.log("NFTs response received:", nftsResponse.status, nftsData);

                 const existingNoNftsMsg = nftGalleryDiv.querySelector('p');
                 if(existingNoNftsMsg) hideElement(existingNoNftsMsg);

                 if (nftsResponse.ok && Array.isArray(nftsData) && nftsData.length > 0) {
                     nftsData.forEach(nft => {
                         const imageUrl = nft.content && nft.content.files && nft.content.files.length > 0 ?
                                          (nft.content.links ? nft.content.links.cdn : nft.content.files[0].cdn_uri || nft.content.files[0].uri)
                                          : null;
                         const nftName = nft.content && nft.content.metadata ? nft.content.metadata.name : 'Sin Nombre';
                         const mint = nft.mint;

                         if (imageUrl) {
                              const nftItem = document.createElement('div');
                              nftItem.classList.add('nft-item');
                               // Enlace al explorador
                              const explorerLink = `https://solscan.io/token/${mint}`;
                               nftItem.innerHTML = `
                                    <a href="${explorerLink}" target="_blank" style="text-decoration: none; color: inherit;">
                                         <img src="${imageUrl}" alt="${nftName}">
                                         <p title="${nftName}">${nftName}</p>
                                    </a>
                               `;
                               nftGalleryDiv.appendChild(nftItem);
                         }
                     });
                      if (nftGalleryDiv.children.length > 0) {
                           showElement(nftsCard);
                      } else {
                           const noNftsP = document.createElement('p');
                           noNftsP.textContent = translations[currentLang].noNftsFound;
                           noNftsP.style.textAlign = 'center';
                           noNftsP.style.color = '#a0a0a0';
                           noNftsP.style.fontStyle = 'italic';
                           noNftsP.style.paddingTop = '10px';
                           nftGalleryDiv.appendChild(noNftsP);
                           showElement(nftsCard);
                      }
                 } else if (nftsResponse.ok && Array.isArray(nftsData) && nftsData.length === 0) {
                      const noNftsP = document.createElement('p');
                      noNftsP.textContent = translations[currentLang].noNftsFound;
                      noNftsP.style.textAlign = 'center';
                      noNftsP.style.color = '#a0a0a0';
                      noNftsP.style.fontStyle = 'italic';
                      noNftsP.style.paddingTop = '10px';
                      nftGalleryDiv.appendChild(noNftsP);
                      showElement(nftsCard);
                 }
                 else {
                     // Handle API error response (e.g., status is not ok)
                      const errorDetails = await nftsResponse.text();
                     console.error("Error fetching NFTs from Helius:", nftsResponse.status, errorDetails);
                     const errorNftsP = document.createElement('p');
                     errorNftsP.textContent = `Error al cargar NFTs: ${nftsResponse.status}`;
                     errorNftsP.style.textAlign = 'center';
                     errorNftsP.style.color = '#ff6b6b';
                     nftGalleryDiv.appendChild(errorNftsP);
                     showElement(nftsCard);
                 }
             } catch (error) {
                  // Catch errors during the fetch itself (network issues, CORS, etc.)
                 console.error("Fetch error for NFTs from Helius:", error);
                 const errorNftsP = document.createElement('p');
                 errorNftsP.textContent = `Error de conexión al cargar NFTs.`;
                 errorNftsP.style.textAlign = 'center';
                 errorNftsP.style.color = '#ff6b6b';
                 nftGalleryDiv.appendChild(errorNftsP);
                 showElement(nftsCard);
             }


             // 4. Obtener Transacciones Recientes (Usando Helius Transaction History API)
             console.log("Attempting to fetch Transactions from Helius...");
             // Use a specific try/catch for Helius API calls as well
             try {
                 const txsResponse = await fetch(`${HELIUS_API_URL}addresses/${address}/transactions?api-key=${HELIUS_API_KEY}&limit=15`);
                 const txsData = await txsResponse.json();
                 console.log("Transactions response received:", txsResponse.status, txsData);


                 if (txsResponse.ok && Array.isArray(txsData) && txsData.length > 0) {
                     txsData.forEach(tx => {
                         const listItem = document.createElement('li');
                         const explorerLink = `https://solscan.io/tx/${tx.signature}`;

                         let type = tx.type || translations[currentLang].transactionTypeUnknown;
                         let description = '';
                         let value = '';
                         let directionClass = '';

                         const primaryAction = tx.nativeTransfers.find(t => t.fromUserAccount === address || t.toUserAccount === address) ||
                                               tx.tokenTransfers.find(t => t.fromUserAccount === address || t.toUserAccount === address) ||
                                               tx.nftTransfers.find(t => t.fromUserAccount === address || t.toUserAccount === address);

                         if (primaryAction) {
                             if (primaryAction.fromUserAccount === address) {
                                 description = `${translations[currentLang].transactionDirectionSent} ${primaryAction.toUserAccount.substring(0, 6)}...${primaryAction.toUserAccount.length > 10 ? primaryAction.toUserAccount.substring(primaryAction.toUserAccount.length - 4) : ''}`;
                                 directionClass = 'tx-sent';
                                 if (primaryAction.tokenAmount) value = `- ${primaryAction.tokenAmount} ${primaryAction.tokenSymbol || (primaryAction.mint ? primaryAction.mint.substring(0, 4) : '')}`; // Add check for primaryAction.mint
                                 else if (primaryAction.amount) value = `- ${(primaryAction.amount / solanaWeb3.LAMPORTS_PER_SOL).toFixed(4)} SOL`;
                                 else if (primaryAction.nftMint) value = `- 1 NFT${primaryAction.nftTokenStandard ? ' (' + primaryAction.nftTokenStandard + ')' : ''}`;
                             } else {
                                  description = `${translations[currentLang].transactionDirectionReceived} ${primaryAction.fromUserAccount.substring(0, 6)}...${primaryAction.fromUserAccount.length > 10 ? primaryAction.fromUserAccount.substring(primaryAction.fromUserAccount.length - 4) : ''}`;
                                 directionClass = 'tx-received';
                                 if (primaryAction.tokenAmount) value = `+ ${primaryAction.tokenAmount} ${primaryAction.tokenSymbol || (primaryAction.mint ? primaryAction.mint.substring(0, 4) : '')}`; // Add check for primaryAction.mint
                                 else if (primaryAction.amount) value = `+ ${(primaryAction.amount / solanaWeb3.LAMPORTS_PER_SOL).toFixed(4)} SOL`;
                                 else if (primaryAction.nftMint) value = `+ 1 NFT${primaryAction.nftTokenStandard ? ' (' + primaryAction.nftTokenStandard + ')' : ''}`;
                             }
                         } else {
                               description = tx.signature.substring(0, 10) + '...' + tx.signature.substring(tx.signature.length - 10);
                               value = '';
                               directionClass = 'tx-unknown';
                         }

                           const formattedType = type.replace(/([A-Z])/g, ' $1').trim().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');


                           listItem.innerHTML = `
                                <span class="item-info" style="flex-direction: column; align-items: flex-start;">
                                     <i class="fas fa-file-code"></i>
                                     <span style="font-weight: 600;">${formattedType}</span>
                                     <span style="font-size: 0.8em; color: var(--soft-text-color);">${description}</span>
                                      <a href="${explorerLink}" target="_blank" style="font-size: 0.7em; color: var(--soft-text-color); text-decoration: underline; margin-top: 4px;">Ver en Explorer</a>
                                </span>
                                <span class="item-value ${directionClass}" style="text-align: right;">
                                    ${value || '---'}<br>
                                    <span style="font-size: 0.8em; color: var(--soft-text-color);">Tarifa: ${(tx.fee / solanaWeb3.LAMPORTS_PER_SOL).toFixed(6)} SOL</span>
                                </span>
                           `;
                           transactionListUl.appendChild(listItem);
                      });
                       showElement(transactionsCard);

                 } else if (txsResponse.ok && Array.isArray(txsData) && txsData.length === 0) {
                      const noTxsLi = document.createElement('li');
                      noTxsLi.textContent = translations[currentLang].noTransactionsFound;
                      noTxsLi.style.justifyContent = 'center';
                      noTxsLi.style.color = '#a0a0a0';
                      noTxsLi.style.fontStyle = 'italic';
                      transactionListUl.appendChild(noTxsLi);
                      showElement(transactionsCard);
                 }
                 else {
                      const errorDetails = await txsResponse.text();
                     console.error("Error fetching Transactions from Helius:", txsResponse.status, errorDetails);
                     const errorTxsLi = document.createElement('li');
                     errorTxsLi.textContent = `Error al cargar transacciones: ${txsResponse.status}`;
                     errorTxsLi.style.justifyContent = 'center';
                     errorTxsLi.style.color = '#ff6b6b';
                     transactionListUl.appendChild(errorTxsLi);
                     showElement(transactionsCard);
                 }
             } catch (error) {
                 console.error("Fetch error for Transactions from Helius:", error);
                 const errorTxsLi = document.createElement('li');
                 errorTxsLi.textContent = `Error de conexión al cargar transacciones.`;
                 errorTxsLi.style.justifyContent = 'center';
                 errorTxsLi.style.color = '#ff6b6b';
                 transactionListUl.appendChild(errorTxsLi);
                 showElement(transactionsCard);
             }


             // --- Ocultar estado de carga ---
             hideElement(loadingIndicator);

         } catch (error) {
             // This catch should now only be for errors *not* caught by specific blocks above
             // or errors happening *after* all fetches but before the function ends.
             // Given the console output, it seems the error from getParsedTokenAccountsByOwner
             // is STILL falling into this general catch, indicating the specific catch is not active.
             console.error("Error tracing wallet (General Catch - Specific catch likely failed or was not hit):", error);
             hideElement(loadingIndicator);
             // Fallback error message
             errorMessage.textContent = `${translations[currentLang].walletErrorFetching} ${error.message || 'Desconocido'}. Consulta la consola para más detalles.`;
             showElement(errorMessage);

             // Ensure data cards are hidden if a general unexpected error occurs
             hideElement(solBalanceCard);
             hideElement(tokenBalancesCard);
             hideElement(nftsCard);
             hideElement(transactionsCard);
             hideElement(initialMessage); // Hide initial message on error
         }
     };

     // Añadir evento click al botón Rastrear
     trackButton.addEventListener('click', trackWallet);

     // Permitir rastrear presionando Enter en el input
     walletInput.addEventListener('keypress', (e) => {
         if (e.key === 'Enter') {
             e.preventDefault();
             trackWallet();
         }
     });


     // --- Inicialización ---
      // Aseguramos que la sección 'home' sea la que se muestre al cargar
      const homeSection = document.getElementById('home');
      if (homeSection) {
           homeSection.classList.add('active');
      }

      // Activa el enlace de la sección 'home' en el menú al cargar
      const homeMenuItemLink = document.querySelector('.sidebar .menu-item a[data-section="home"]');
      if (homeMenuItemLink) {
          homeMenuItemLink.classList.add('active-menu');
      }

      // Establecer idioma por defecto y aplicarlo
      document.documentElement.lang = 'es';
      applyLanguage('es');


}); // End of DOMContentLoaded listener
