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
     // const headerLogo = document.querySelector('.logo'); // No lo usamos para traducir el texto del logo
     const mainHeading = document.querySelector('#home h1'); // Selecciona el h1 DENTRO de la sección #home


     // Diccionario de traducciones básicas (expandir según necesites)
     const translations = {
         'es': {
             // Logo text is fixed as QUANTYX in HTML
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
             footerBottom: '© 2025 QuantyX. Todos los derechos reservados.',
             noSearchResults: 'No se encontraron resultados.' // Texto para cuando no hay resultados
         },
         'en': {
             // Logo text is fixed as QUANTYX in HTML
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
             footerBottom: '© 2025 QuantyX. All rights reserved.',
             noSearchResults: 'No results found.' // Texto para cuando no hay resultados
         },
         'fr': {
             // Logo text is fixed as QUANTYX in HTML
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
              footerBottom: '© 2025 QuantyX. Tous droits réservés.',
              noSearchResults: 'Aucun résultat trouvé.' // Texto para cuando no hay resultados
         }
     };

     let currentLang = document.documentElement.lang || 'es'; // Obtener idioma actual o usar 'es' por defecto


     const applyLanguage = (lang) => {
         const texts = translations[lang];
         if (!texts) return; // Si el idioma no existe en el diccionario

         currentLang = lang; // Actualizar el idioma actual

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

         // Opcional: Volver a realizar la búsqueda con el nuevo idioma si el modal está abierto y tiene texto
         const searchModal = document.getElementById('search-modal');
         const searchInput = document.getElementById('search-input');
         if(searchModal.classList.contains('show') && searchInput.value.trim() !== '') {
              performSearch(); // Re-ejecutar búsqueda con el texto actual pero nuevo idioma
         }

     };

     // Event listeners para el cambio de idioma
     langSpans.forEach(span => {
         span.addEventListener('click', (e) => {
             const selectedLang = e.target.getAttribute('data-lang');
             applyLanguage(selectedLang);
             // Opcional: Ocultar dropdown después de seleccionar
             // languageDropdown.style.display = 'none'; // Descomentar si quieres que se oculte
         });
     });


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
     searchIcon.addEventListener('click', () => {
         showModal(searchModal);
         document.getElementById('search-input').focus(); // Poner el foco en el input al abrir
     });
     walletIcon.addEventListener('click', () => showModal(walletModal));
     userIcon.addEventListener('click', () => showModal(userModal));

     // Cerrar modales al hacer clic en el botón de cerrar
     closeButtons.forEach(button => {
         button.addEventListener('click', (e) => {
             const modalToClose = e.target.closest('.modal');
             if (modalToClose) {
                 hideModal(modalToClose);
                 // Limpiar resultados y input al cerrar modal de búsqueda
                 if(modalToClose.id === 'search-modal') {
                      document.getElementById('search-input').value = '';
                      document.getElementById('search-results').innerHTML = '';
                 }
             }
         });
     });

     // Cerrar modales al hacer clic fuera del contenido del modal
     window.addEventListener('click', (e) => {
         // Asegúrate de que el clic ocurrió *directamente* en el fondo del modal
         if (e.target.classList.contains('modal')) {
              // Limpiar resultados y input solo si se cierra el modal de búsqueda haciendo clic fuera
              if(e.target.id === 'search-modal') {
                   document.getElementById('search-input').value = '';
                   document.getElementById('search-results').innerHTML = '';
              }
              hideModal(e.target);
         }
     });


     // --- Lógica de Búsqueda Básica ---
     const searchInput = document.getElementById('search-input');
     const searchResultsContainer = document.getElementById('search-results');
     const contentSections = document.querySelectorAll('.main-content section'); // Todas las secciones para buscar en ellas


     const performSearch = () => {
         const query = searchInput.value.trim().toLowerCase(); // Obtener texto, limpiar espacios y convertir a minúsculas
         searchResultsContainer.innerHTML = ''; // Limpiar resultados anteriores

         if (query.length < 2) { // Opcional: No buscar si el texto es muy corto
              return;
         }

         let resultsFound = false;

         contentSections.forEach(section => {
             // Obtener todo el texto de la sección (título y párrafo)
             const sectionText = section.textContent ? section.textContent.toLowerCase() : '';
             const sectionId = section.id; // Obtener el ID para el enlace
             // Obtener el título de la sección para mostrar en el resultado
             const sectionTitleElement = section.querySelector('h2');
             const sectionTitle = sectionTitleElement ? sectionTitleElement.textContent : sectionId; // Usar H2 o ID si no hay H2


             // Comprobar si la consulta está en el texto de la sección
             if (sectionText.includes(query)) {
                 resultsFound = true;
                 // Crear un enlace para el resultado
                 const resultLink = document.createElement('a');
                 resultLink.href = `#${sectionId}`; // Enlaza a la sección por su ID
                 resultLink.textContent = `Encontrado en: ${sectionTitle}`; // Muestra dónde se encontró

                 // Añadir evento click al enlace para cerrar el modal e ir a la sección
                 resultLink.addEventListener('click', () => {
                     hideModal(searchModal); // Cierra el modal
                     // La navegación a la sección con el # en la URL ya la maneja el navegador
                 });

                 searchResultsContainer.appendChild(resultLink); // Añadir el resultado al contenedor
             }
         });

         // Mostrar mensaje si no se encontraron resultados
         if (!resultsFound) {
             const noResultsMessage = document.createElement('p');
             noResultsMessage.textContent = translations[currentLang].noSearchResults; // Usar traducción
             noResultsMessage.style.color = '#888'; // Color tenue
             noResultsMessage.style.textAlign = 'center';
             searchResultsContainer.appendChild(noResultsMessage);
         }
     };

     // Añadir evento para buscar mientras se escribe en el input
     searchInput.addEventListener('input', performSearch);
     // También podrías añadir un evento 'keyup' o 'change' si prefieres

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
