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

                // Opcional: Remover la clase 'active' de otros enlaces del menú si solo uno debe estar activo a la vez
                 menuLinks.forEach(item => item.classList.remove('active-menu'));
                 link.classList.add('active-menu');
            }
        });
    });

     // --- Lógica para el cambio de idioma (SIMPLE - solo cambia el texto del menú) ---
     // NOTA: Un sistema multi-idioma real es MUCHO más complejo.
     // Esto es solo una demostración básica.
     const languageSwitcher = document.getElementById('language-switcher');
     const languageDropdown = languageSwitcher.querySelector('.language-dropdown');
     const langSpans = languageDropdown.querySelectorAll('span');
     const menuTexts = document.querySelectorAll('.sidebar .menu-item .menu-text');
     const headerLogo = document.querySelector('.logo');
     const mainHeading = document.querySelector('#home h1'); // Selecciona el h1 DENTRO de la sección #home


     // Diccionario de traducciones básicas (expandir según necesites)
     const translations = {
         'es': {
             logo: 'QuantyX',
             homeTitle: 'Bienvenido a QuantyX',
             homeMenuItem: 'Inicio', // Texto para el menú Home
             sentimentAnalyzer: 'Analizador de Sentimientos',
             walletTracker: 'Wallet Tracker',
             botTrading: 'Bot Trading',
             sniper: 'Sniper',
             tokenCreator: 'Creador de Token',
             staking: 'Staking',
             gaming: 'Gaming',
             nftCollection: 'Colección NFTs', // Nuevo texto para menú
             detoxReclaim: 'Detox & Reclaim', // Texto unificado para el menú
             knowledgeBase: 'Base de Conocimiento',
             chatbot: 'ChatBot',
             // ... agregar más traducciones para el pie de página, modales, etc.
             searchTitle: 'Buscar en QuantyX',
             walletConnectTitle: 'Conectar Wallet',
             userProfileTitle: 'Perfil de Usuario / Acceso',
             socialTitle: 'Síguenos',
             footerBottom: '© 2025 QuantyX. Todos los derechos reservados.'
             // Eliminados: detox, reclaim, newsletter...
         },
         'en': {
             logo: 'QuantyX',
             homeTitle: 'Welcome to QuantyX',
             homeMenuItem: 'Home', // Texto para el menú Home
             sentimentAnalyzer: 'Sentiment Analyzer',
             walletTracker: 'Wallet Tracker',
             botTrading: 'Trading Bot',
             sniper: 'Sniper',
             tokenCreator: 'Token Creator',
             staking: 'Staking',
             gaming: 'Gaming',
             nftCollection: 'NFT Collection', // Nuevo texto para menú
             detoxReclaim: 'Detox & Reclaim', // Texto unificado para el menú
             knowledgeBase: 'Knowledge Base',
             chatbot: 'ChatBot',
             // ...
             searchTitle: 'Search QuantyX',
             walletConnectTitle: 'Connect Wallet',
             userProfileTitle: 'User Profile / Access',
             socialTitle: 'Follow Us',
             footerBottom: '© 2025 QuantyX. All rights reserved.'
             // Eliminados: detox, reclaim, newsletter...
         },
         'fr': {
             logo: 'QuantyX',
             homeTitle: 'Bienvenue chez QuantyX',
             homeMenuItem: 'Accueil', // Texto para el menú Home
             sentimentAnalyzer: 'Analyseur de Sentiments',
             walletTracker: 'Suivi de Wallet',
             botTrading: 'Bot de Trading',
             sniper: 'Sniper',
             tokenCreator: 'Créateur de Token',
             staking: 'Staking',
             gaming: 'Gaming',
             nftCollection: 'Collection NFTs', // Nuevo texto para menú
             detoxReclaim: 'Détox & Réclamation', // Texto unificado para el menú (traducción aproximada)
             knowledgeBase: 'Base de Connaissances',
             chatbot: 'ChatBot',
             // ...
              searchTitle: 'Rechercher dans QuantyX',
              walletConnectTitle: 'Connecter le Portefeuille',
              userProfileTitle: 'Profil Utilisateur / Accès',
              socialTitle: 'Suivez-nous',
              footerBottom: '© 2025 QuantyX. Tous droits réservés.'
              // Eliminados: detox, reclaim, newsletter...
         }
     };

     const applyLanguage = (lang) => {
         const texts = translations[lang];
         if (!texts) return; // Si el idioma no existe en el diccionario

         // Aplica traducciones al menú lateral
         menuTexts.forEach(textSpan => {
             const dataSection = textSpan.parentElement.getAttribute('data-section');
             // Usar un switch para aplicar el texto traducido según el data-section
             switch(dataSection) {
                 case 'home': textSpan.textContent = texts.homeMenuItem; break; // Aplicar texto de Home
                 case 'sentiment-analyzer': textSpan.textContent = texts.sentimentAnalyzer; break;
                 case 'wallet-tracker': textSpan.textContent = texts.walletTracker; break;
                 case 'bot-trading': textSpan.textContent = texts.botTrading; break;
                 case 'sniper': textSpan.textContent = texts.sniper; break;
                 case 'token-creator': textSpan.textContent = texts.tokenCreator; break;
                 case 'staking': textSpan.textContent = texts.staking; break;
                 case 'gaming': textSpan.textContent = texts.gaming; break;
                 case 'nft-collection': textSpan.textContent = texts.nftCollection; break; // Aplicar texto de NFT
                 case 'detox-reclaim': textSpan.textContent = texts.detoxReclaim; break; // Aplicar texto unificado
                 case 'knowledge-base': textSpan.textContent = texts.knowledgeBase; break;
                 case 'chatbot': textSpan.textContent = texts.chatbot; break;
             }
         });

         // Aplica traducción al logo
         // El texto del logo principal "QuantyX" se maneja en el HTML,
         // pero la traducción del diccionario es útil si el logo fuera solo texto traducible.
         // En este caso, el texto "QuantyX" es parte del div.logo
         // if (headerLogo && texts.logo) { headerLogo.textContent = texts.logo; } // No lo hacemos para mantener la estructura del icono

         // Aplica traducción al título principal de la sección home
         const homeSectionHeading = document.querySelector('#home h1');
         if (homeSectionHeading && texts.homeTitle) { homeSectionHeading.textContent = texts.homeTitle; }


         // Aplica traducciones a modales (ejemplo)
         const searchModalTitle = document.querySelector('#search-modal h2');
         if (searchModalTitle && texts.searchTitle) searchModalTitle.textContent = texts.searchTitle;

         const walletModalTitle = document.querySelector('#wallet-modal h2');
         if (walletModalTitle && texts.walletConnectTitle) walletModalTitle.textContent = texts.walletConnectTitle;

         const userModalTitle = document.querySelector('#user-modal h2');
         if (userModalTitle && texts.userProfileTitle) userModalTitle.textContent = texts.userProfileTitle;

         // Aplica traducciones a pie de página (solo redes sociales y copyright ahora)
         const socialTitle = document.querySelector('.social-media h3');
         if (socialTitle && texts.socialTitle) socialTitle.textContent = texts.socialTitle;

         const footerBottomText = document.querySelector('.footer-bottom');
         if (footerBottomText && texts.footerBottom) footerBottomText.textContent = texts.footerBottom;

          // El código de la Newsletter Eliminado
     };

     langSpans.forEach(span => {
         span.addEventListener('click', (e) => {
             const selectedLang = e.target.getAttribute('data-lang');
             applyLanguage(selectedLang);
             // Opcional: Ocultar dropdown después de seleccionar
             // languageDropdown.style.display = 'none'; // Descomentar si quieres que se oculte
         });
     });

     // Opcional: Ocultar dropdown si se hace click fuera de él (descomentar si se oculta al seleccionar)
     // document.addEventListener('click', (e) => {
     //     if (!languageSwitcher.contains(e.target)) {
     //         languageDropdown.style.display = 'none';
     //     }
     // });


     // --- Lógica para mostrar/ocultar Modales ---
     const searchIcon = document.getElementById('search-icon');
     const walletIcon = document.getElementById('wallet-icon');
     const userIcon = document.getElementById('user-icon');
     const searchModal = document.getElementById('search-modal');
     const walletModal = document.getElementById('wallet-modal');
     const userModal = document.getElementById('user-modal');
     const closeButtons = document.querySelectorAll('.modal .close-button');

     // Función para mostrar un modal
     const showModal = (modalElement) => {
         modalElement.classList.add('show');
     };

     // Función para ocultar un modal
     const hideModal = (modalElement) => {
         modalElement.classList.remove('show');
     };

     // Abrir modales al hacer clic en los iconos
     searchIcon.addEventListener('click', () => showModal(searchModal));
     walletIcon.addEventListener('click', () => showModal(walletModal));
     userIcon.addEventListener('click', () => showModal(userModal));

     // Cerrar modales al hacer clic en el botón de cerrar
     closeButtons.forEach(button => {
         button.addEventListener('click', (e) => {
             const modalToClose = e.target.closest('.modal');
             if (modalToClose) {
                 hideModal(modalToClose);
             }
         });
     });

     // Cerrar modales al hacer clic fuera del contenido del modal
     window.addEventListener('click', (e) => {
         // Asegúrate de que el clic ocurrió *directamente* en el fondo del modal
         if (e.target.classList.contains('modal')) {
             hideModal(e.target);
         }
     });

     // --- Código de la Newsletter Eliminado
     // ... (newsletter code was here) ...


     // --- Inicialización: Muestra la sección 'home' al cargar la página ---
      // Aseguramos que la sección 'home' sea la que se muestre al cargar
      const homeSection = document.getElementById('home');
      if (homeSection) { // Verificamos que la sección Home exista
           homeSection.classList.add('active');
      }


      // Opcional: Activa el primer enlace del menú por defecto (ahora es 'Home')
      const firstMenuItemLink = document.querySelector('.sidebar .menu-item a[data-section="home"]'); // Seleccionamos específicamente el enlace de Home
      if (firstMenuItemLink) {
          firstMenuItemLink.classList.add('active-menu');
      }

      // --- Inicialización: Aplica el idioma por defecto (Español) ---
      // Asegúrate de que el atributo lang en el HTML también esté en "es"
      document.documentElement.lang = 'es';
      applyLanguage('es');


});
