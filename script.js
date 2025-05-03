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
             logo: 'QuantiX',
             homeTitle: 'Bienvenido a QuantiX',
             sentimentAnalyzer: 'Analizador de Sentimientos',
             walletTracker: 'Wallet Tracker',
             botTrading: 'Bot Trading',
             sniper: 'Sniper',
             tokenCreator: 'Creador de Token',
             staking: 'Staking',
             gaming: 'Gaming',
             knowledgeBase: 'Base de Conocimiento',
             chatbot: 'ChatBot',
             // ... agregar más traducciones para el pie de página, modales, etc.
             searchTitle: 'Buscar en QuantiX',
             walletConnectTitle: 'Conectar Wallet',
             userProfileTitle: 'Perfil de Usuario / Acceso',
             newsletterTitle: 'Suscríbete a nuestro Boletín',
             newsletterPlaceholder: 'Tu email',
             newsletterButton: 'Suscribirse',
             newsletterSuccess: '¡Gracias por suscribirte!',
             socialTitle: 'Síguenos',
             footerBottom: '© 2025 QuantiX. Todos los derechos reservados.'
         },
         'en': {
             logo: 'QuantiX',
             homeTitle: 'Welcome to QuantiX',
             sentimentAnalyzer: 'Sentiment Analyzer',
             walletTracker: 'Wallet Tracker',
             botTrading: 'Trading Bot',
             sniper: 'Sniper',
             tokenCreator: 'Token Creator',
             staking: 'Staking',
             gaming: 'Gaming',
             knowledgeBase: 'Knowledge Base',
             chatbot: 'ChatBot',
             // ...
             searchTitle: 'Search QuantiX',
             walletConnectTitle: 'Connect Wallet',
             userProfileTitle: 'User Profile / Access',
             newsletterTitle: 'Subscribe to our Newsletter',
             newsletterPlaceholder: 'Your email',
             newsletterButton: 'Subscribe',
             newsletterSuccess: 'Thank you for subscribing!',
             socialTitle: 'Follow Us',
             footerBottom: '© 2025 QuantiX. All rights reserved.'
         },
         'fr': {
             logo: 'QuantiX',
             homeTitle: 'Bienvenue chez QuantiX',
             sentimentAnalyzer: 'Analyseur de Sentiments',
             walletTracker: 'Suivi de Wallet',
             botTrading: 'Bot de Trading',
             sniper: 'Sniper',
             tokenCreator: 'Créateur de Token',
             staking: 'Staking',
             gaming: 'Gaming',
             knowledgeBase: 'Base de Connaissances',
             chatbot: 'ChatBot',
             // ...
              searchTitle: 'Rechercher dans QuantiX',
              walletConnectTitle: 'Connecter le Portefeuille',
              userProfileTitle: 'Profil Utilisateur / Accès',
              newsletterTitle: 'Abonnez-vous à notre Newsletter',
              newsletterPlaceholder: 'Votre email',
              newsletterButton: "S'abonner",
              newsletterSuccess: 'Merci de vous être abonné !',
              socialTitle: 'Suivez-nous',
              footerBottom: '© 2025 QuantiX. Tous droits réservés.'
         }
     };

     const applyLanguage = (lang) => {
         const texts = translations[lang];
         if (!texts) return; // Si el idioma no existe en el diccionario

         // Aplica traducciones al menú lateral
         menuTexts.forEach(textSpan => {
             const dataSection = textSpan.parentElement.getAttribute('data-section');
             // Usar un switch o mapa directo si las claves del diccionario coinciden con data-section
             switch(dataSection) {
                 case 'sentiment-analyzer': textSpan.textContent = texts.sentimentAnalyzer; break;
                 case 'wallet-tracker': textSpan.textContent = texts.walletTracker; break;
                 case 'bot-trading': textSpan.textContent = texts.botTrading; break;
                 case 'sniper': textSpan.textContent = texts.sniper; break;
                 case 'token-creator': textSpan.textContent = texts.tokenCreator; break;
                 case 'staking': textSpan.textContent = texts.staking; break;
                 case 'gaming': textSpan.textContent = texts.gaming; break;
                 case 'knowledge-base': textSpan.textContent = texts.knowledgeBase; break;
                 case 'chatbot': textSpan.textContent = texts.chatbot; break;
             }
         });

         // Aplica traducción al logo
         if (headerLogo && texts.logo) {
             headerLogo.textContent = texts.logo;
         }

         // Aplica traducción al título principal de la sección home
         if (mainHeading && texts.homeTitle) {
             mainHeading.textContent = texts.homeTitle;
         }

         // Aplica traducciones a modales (ejemplo)
         const searchModalTitle = document.querySelector('#search-modal h2');
         if (searchModalTitle && texts.searchTitle) searchModalTitle.textContent = texts.searchTitle;

         const walletModalTitle = document.querySelector('#wallet-modal h2');
         if (walletModalTitle && texts.walletConnectTitle) walletModalTitle.textContent = texts.walletConnectTitle;

         const userModalTitle = document.querySelector('#user-modal h2');
         if (userModalTitle && texts.userProfileTitle) userModalTitle.textContent = texts.userProfileTitle;

         // Aplica traducciones a pie de página (ejemplo)
         const newsletterTitle = document.querySelector('.newsletter h3');
         if (newsletterTitle && texts.newsletterTitle) newsletterTitle.textContent = texts.newsletterTitle;

         const newsletterInput = document.querySelector('.newsletter input[type="email"]');
         if (newsletterInput && texts.newsletterPlaceholder) newsletterInput.placeholder = texts.newsletterPlaceholder;

         const newsletterButton = document.querySelector('.newsletter button');
         if (newsletterButton && texts.newsletterButton) newsletterButton.textContent = texts.newsletterButton;

          const socialTitle = document.querySelector('.social-media h3');
         if (socialTitle && texts.socialTitle) socialTitle.textContent = texts.socialTitle;

         const footerBottomText = document.querySelector('.footer-bottom');
         if (footerBottomText && texts.footerBottom) footerBottomText.textContent = texts.footerBottom;

          // La traducción del mensaje de éxito del boletín se maneja dentro del listener del submit
          // pero podrías guardar el texto traducido en una variable si fuera necesario
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

     // --- Lógica básica para el formulario de boletín (solo demostración frontend) ---
     const newsletterForm = document.getElementById('newsletter-form');
     const subscriptionMessage = document.querySelector('.subscription-message');
      // Obtener el color de éxito traducido para mostrar el mensaje
      const successColor = '#39da8a'; // Usar el valor hexadecimal del nuevo color verde corporativo

     newsletterForm.addEventListener('submit', (e) => {
         e.preventDefault(); // Evita que el formulario se envíe realmente

         // En un caso real, aquí enviarías los datos a tu servidor
         console.log('Email submitted:', newsletterForm.querySelector('input').value);

         // Usar la traducción del mensaje de éxito
         const currentLang = document.documentElement.lang || 'es'; // Obtiene el idioma actual o usa es por defecto
         const messageText = translations[currentLang]?.newsletterSuccess || '¡Gracias por suscribirte!';

         subscriptionMessage.textContent = messageText;
         subscriptionMessage.style.color = successColor; // Usar el color correcto
         subscriptionMessage.style.marginTop = '10px';
         newsletterForm.reset(); // Limpia el formulario
     });

     // --- Inicialización: Muestra la sección 'home' al cargar la página ---
      document.getElementById('home').classList.add('active');
      // Opcional: Activa el primer enlace del menú por defecto
      const firstMenuItemLink = document.querySelector('.sidebar .menu-item a');
      if (firstMenuItemLink) {
          firstMenuItemLink.classList.add('active-menu');
      }

      // --- Inicialización: Aplica el idioma por defecto (Español) ---
      // Asegúrate de que el atributo lang en el HTML también esté en "es"
      document.documentElement.lang = 'es';
      applyLanguage('es');


});
