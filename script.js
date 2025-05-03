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
             noTransactionsFound: 'No recent transactions found.',
             transactionTypeTransfer: 'Transfer',
             transactionTypeUnknown: 'Unknown',
             transactionDirectionSent: 'Sent to',
             transactionDirectionReceived: 'Received from',
             transactionDirectionSelf: 'Self',
             transactionSolAmount: 'SOL Amount',
             transactionTokenAmount: 'Amount',
             transactionFee: 'Fee'
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
             walletInitialMessage: 'Entrez une adresse de portefeuille Solana pour voir ses détails.',
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
         if (searchInputPlaceholder && texts.searchTitle) searchInputPlaceholder.placeholder = texts.searchTitle; // Usar el título del modal como placeholder
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
     const HELIUS_API_KEY = '6fbed4b2-ce46-4c7d-b827-2c1d5a539ff2';
     const HELIUS_RPC_URL = `https://rpc.helius.xyz/?api-key=${HELIUS_API_KEY}`;
     const HELIUS_API_URL = `https://api.helius.xyz/v0/`; // Base URL para otras APIs de Helius

     // Usamos @solana/web3.js para la conexión principal y algunas llamadas estándar
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

     // Helper para ocultar un elemento añadiendo la clase 'hidden'
     const hideElement = (el) => el.classList.add('hidden');
     // Helper para mostrar un elemento quitando la clase 'hidden'
     const showElement = (el) => el.classList.remove('hidden');


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
         } catch (error) {
             errorMessage.textContent = translations[currentLang].walletErrorInvalidAddress;
             showElement(errorMessage);
             hideElement(loadingIndicator);
             console.error("Invalid address format:", error);
             return;
         }

         try {
             // --- Obtener Datos de la Blockchain usando Helius y web3.js ---

             // 1. Obtener Saldo SOL (usando web3.js)
             const solBalanceLamports = await connection.getBalance(publicKey);
             const solBalance = solBalanceLamports / solanaWeb3.LAMPORTS_PER_SOL;
             solBalanceSpan.textContent = solBalance.toFixed(4);
             showElement(solBalanceCard);

             // 2. Obtener Cuentas de Token (SPL) (usando web3.js)
             const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
                 programId: solanaWeb3.TOKEN_PROGRAM_ID,
             });

             if (tokenAccounts.value.length > 0) {
                 tokenAccounts.value.forEach(account => {
                     const accountInfo = account.account.data.parsed.info;
                     const mintAddress = accountInfo.mint;
                     const tokenBalance = accountInfo.tokenAmount.uiAmount;

                     // Omitir tokens con balance 0 (o muy pequeño)
                     if (tokenBalance > 0) {
                          const listItem = document.createElement('li');
                          listItem.innerHTML = `
                               <span class="item-info">
                                    <i class="fas fa-dot-circle"></i> <span>${mintAddress.substring(0, 6)}...${mintAddress.substring(mintAddress.length - 6)}</span> </span>
                               <span class="item-value">${tokenBalance}</span>
                          `;
                          tokenListUl.appendChild(listItem);
                     }
                 });
                  // Mostrar tarjeta de tokens si hubo alguna cuenta con balance > 0
                  if (tokenListUl.children.length > 0) {
                      showElement(tokenBalancesCard);
                  } else {
                       // Si todas las cuentas tenían balance 0, mostrar mensaje de no tokens
                       const noTokensLi = document.createElement('li');
                       noTokensLi.textContent = translations[currentLang].noTokensFound;
                       noTokensLi.style.justifyContent = 'center';
                       noTokensLi.style.color = 'var(--soft-text-color)';
                       noTokensLi.style.fontStyle = 'italic';
                       tokenListUl.appendChild(noTokensLi);
                       showElement(tokenBalancesCard); // Mostrar tarjeta aunque esté vacía
                  }
             } else {
                  // Mostrar mensaje si no hay cuentas de token
                   const noTokensLi = document.createElement('li');
                   noTokensLi.textContent = translations[currentLang].noTokensFound;
                   noTokensLi.style.justifyContent = 'center';
                   noTokensLi.style.color = 'var(--soft-text-color)';
                   noTokensLi.style.fontStyle = 'italic';
                   tokenListUl.appendChild(noTokensLi);
                   showElement(tokenBalancesCard); // Mostrar tarjeta aunque esté vacía
             }


             // 3. Obtener NFTs (Usando Helius Digital Assets API)
             const nftsResponse = await fetch(`${HELIUS_API_URL}addresses/${address}/nfts?api-key=${HELIUS_API_KEY}`);
             const nftsData = await nftsResponse.json();

             if (nftsResponse.ok && nftsData.length > 0) {
                 nftsData.forEach(nft => {
                     // Verificar que el NFT tenga una imagen
                     if (nft.content && nft.content.files && nft.content.files.length > 0 && nft.content.files[0].cdn_uri) {
                          const nftItem = document.createElement('div');
                          nftItem.classList.add('nft-item');
                          // Opcional: Añadir enlace al explorador o modal de detalles
                          // nftItem.dataset.mint = nft.mint; // Guardar mint para posible modal
                           nftItem.innerHTML = `
                                <img src="${nft.content.files[0].cdn_uri}" alt="${nft.content.metadata.name || 'NFT'}">
                                <p>${nft.content.metadata.name || 'Sin Nombre'}</p>
                           `;
                           nftGalleryDiv.appendChild(nftItem);
                     }
                 });
                  // Mostrar tarjeta de NFTs solo si se encontraron NFTs con imagen
                  if (nftGalleryDiv.children.length > 0) {
                       hideElement(nftGalleryDiv.querySelector('p')); // Ocultar mensaje de no NFTs si se agregaron items
                       showElement(nftsCard);
                  } else {
                       // Mostrar mensaje de no NFTs si la API no devolvió ninguno con imagen
                       const noNftsP = document.createElement('p');
                       noNftsP.textContent = translations[currentLang].noNftsFound;
                       noNftsP.style.textAlign = 'center';
                       noNftsP.style.color = 'var(--soft-text-color)';
                       noNftsP.style.fontStyle = 'italic';
                       noNftsP.style.paddingTop = '10px';
                       nftGalleryDiv.appendChild(noNftsP); // Asegurarse de que el mensaje esté en el div
                        showElement(nftsCard); // Mostrar la tarjeta aunque esté vacía
                  }
             } else if (nftsResponse.ok && nftsData.length === 0) {
                 // Mostrar mensaje de no NFTs si la API devolvió una lista vacía
                  const noNftsP = document.createElement('p');
                  noNftsP.textContent = translations[currentLang].noNftsFound;
                  noNftsP.style.textAlign = 'center';
                  noNftsP.style.color = 'var(--soft-text-color)';
                  noNftsP.style.fontStyle = 'italic';
                  noNftsP.style.paddingTop = '10px';
                  nftGalleryDiv.appendChild(noNftsP);
                  showElement(nftsCard); // Mostrar la tarjeta aunque esté vacía
             }
             else {
                 // Manejar error en la llamada a la API de NFTs
                 console.error("Error fetching NFTs from Helius:", nftsResponse.status, nftsData);
                 const errorNftsP = document.createElement('p');
                 errorNftsP.textContent = `Error al cargar NFTs: ${nftsResponse.status}`;
                 errorNftsP.style.textAlign = 'center';
                 errorNftsP.style.color = '#ff6b6b';
                 nftGalleryDiv.appendChild(errorNftsP);
                 showElement(nftsCard); // Mostrar la tarjeta aunque tenga un mensaje de error
             }


             // 4. Obtener Transacciones Recientes (Usando Helius Transaction History API)
             // Limitamos a 10 transacciones para empezar
             const txsResponse = await fetch(`${HELIUS_API_URL}addresses/${address}/transactions?api-key=${HELIUS_API_KEY}&limit=10`);
             const txsData = await txsResponse.json();

             if (txsResponse.ok && txsData.length > 0) {
                 txsData.forEach(tx => {
                     const listItem = document.createElement('li');
                     const explorerLink = `https://solscan.io/tx/${tx.signature}`; // O https://explorer.solana.com/tx/${tx.signature}

                     // Simplificar la información de la transacción
                     let type = translations[currentLang].transactionTypeUnknown;
                     let primaryInfo = '';
                     let valueInfo = '';
                     let feeInfo = `${tx.fee / solanaWeb3.LAMPORTS_PER_SOL} SOL`; // Mostrar tarifa en SOL

                      // Buscar si hay algún NativeTransfer o TokenTransfer
                      const nativeTransfer = tx.nativeTransfers ? tx.nativeTransfers.find(t => t.fromUserAccount === address || t.toUserAccount === address) : null;
                      const tokenTransfer = tx.tokenTransfers ? tx.tokenTransfers.find(t => t.fromUserAccount === address || t.toUserAccount === address) : null;


                      if (nativeTransfer) {
                          type = translations[currentLang].transactionTypeTransfer + ' (SOL)';
                          const amountSOL = nativeTransfer.amount / solanaWeb3.LAMPORTS_PER_SOL;
                          if (nativeTransfer.fromUserAccount === address) {
                              primaryInfo = `${translations[currentLang].transactionDirectionSent} ${nativeTransfer.toUserAccount.substring(0, 6)}...`;
                              valueInfo = `- ${amountSOL.toFixed(4)} SOL`; // Negativo para envíos
                              listItem.style.color = '#ff6b6b'; // Color para envíos
                          } else { // toUserAccount === address
                              primaryInfo = `${translations[currentLang].transactionDirectionReceived} ${nativeTransfer.fromUserAccount.substring(0, 6)}...`;
                              valueInfo = `+ ${amountSOL.toFixed(4)} SOL`; // Positivo para recepciones
                              listItem.style.color = var(--corp-green); // Color para recepciones
                          }
                      } else if (tokenTransfer) {
                           type = translations[currentLang].transactionTypeTransfer + ' (' + (tokenTransfer.tokenStandard || 'Token') + ')'; // Mostrar estándar si existe
                           const amountToken = tokenTransfer.tokenAmount; // Cantidad ya legible
                           if (tokenTransfer.fromUserAccount === address) {
                               primaryInfo = `${translations[currentLang].transactionDirectionSent} ${tokenTransfer.toUserAccount.substring(0, 6)}...`;
                               valueInfo = `- ${amountToken} ${tokenTransfer.tokenSymbol || tokenTransfer.mint.substring(0, 4)}`; // Símbolo si existe, si no, parte del mint
                               listItem.style.color = '#ff6b6b'; // Color para envíos
                           } else { // toUserAccount === address
                               primaryInfo = `${translations[currentLang].transactionDirectionReceived} ${tokenTransfer.fromUserAccount.substring(0, 6)}...`;
                               valueInfo = `+ ${amountToken} ${tokenTransfer.tokenSymbol || tokenTransfer.mint.substring(0, 4)}`;
                               listItem.style.color = var(--corp-green); // Color para recepciones
                           }
                       }
                       // Puedes añadir más tipos de transacciones si Helius los parsea (ej. swaps, NFT activity)


                       listItem.innerHTML = `
                            <span class="item-info" style="flex-direction: column; align-items: flex-start;">
                                 <i class="fas fa-file-code"></i> <span style="font-weight: 600;">${type}</span>
                                 <span style="font-size: 0.8em; color: var(--soft-text-color);">${primaryInfo || tx.signature.substring(0, 10) + '...'}</span> <a href="${explorerLink}" target="_blank" style="font-size: 0.7em; color: var(--soft-text-color); text-decoration: underline;">Ver en Explorer</a>
                            </span>
                            <span class="item-value" style="text-align: right;">
                                ${valueInfo}<br>
                                <span style="font-size: 0.8em; color: var(--soft-text-color);">Tarifa: ${feeInfo}</span>
                            </span>
                       `; // Opcional: Mostrar fecha o slot


                       transactionListUl.appendChild(listItem);
                  });
                   showElement(transactionsCard); // Mostrar tarjeta de transacciones si hay firmas

             } else if (txsResponse.ok && txsData.length === 0) {
                  const noTxsLi = document.createElement('li');
                  noTxsLi.textContent = translations[currentLang].noTransactionsFound;
                  noTxsLi.style.justifyContent = 'center';
                  noTxsLi.style.color = 'var(--soft-text-color)';
                  noTxsLi.style.fontStyle = 'italic';
                  transactionListUl.appendChild(noTxsLi);
                  showElement(transactionsCard);
             }
             else {
                 // Manejar error en la llamada a la API de Transacciones
                 console.error("Error fetching Transactions from Helius:", txsResponse.status, txsData);
                 const errorTxsLi = document.createElement('li');
                 errorTxsLi.textContent = `Error al cargar transacciones: ${txsResponse.status}`;
                 errorTxsLi.style.justifyContent = 'center';
                 errorTxsLi.style.color = '#ff6b6b';
                 transactionListUl.appendChild(errorTxsLi);
                 showElement(transactionsCard);
             }


             // --- Ocultar estado de carga ---
             hideElement(loadingIndicator);


         } catch (error) {
             // --- Manejo de Errores Generales de Fetch/RPC ---
             console.error("Error tracing wallet (General Catch):", error);
             hideElement(loadingIndicator);
             errorMessage.textContent = `${translations[currentLang].walletErrorFetching} ${error.message || error}`; // Mostrar mensaje de error general + detalle
             showElement(errorMessage);

             // Ocultar todas las tarjetas de datos si hubo un error grave
             hideElement(solBalanceCard);
             hideElement(tokenBalancesCard);
             hideElement(nftsCard);
             hideElement(transactionsCard);
             hideElement(initialMessage);
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
      const homeSection = document.getElementById('home');
      if (homeSection) {
           homeSection.classList.add('active');
      }

      const homeMenuItemLink = document.querySelector('.sidebar .menu-item a[data-section="home"]');
      if (homeMenuItemLink) {
          homeMenuItemLink.classList.add('active-menu');
      }

      document.documentElement.lang = 'es';
      applyLanguage('es');


});
