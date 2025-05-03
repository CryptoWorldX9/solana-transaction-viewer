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
             logo: 'QuantyX', // Nombre cambiado aquí
             homeTitle: 'Bienvenido a QuantyX', // Nombre cambiado aquí
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
             searchTitle: 'Buscar en QuantyX', // Nombre cambiado aquí
             walletConnectTitle: 'Conectar Wallet',
             userProfileTitle: 'Perfil de Usuario / Acceso',
             newsletterTitle: 'Suscríbete a nuestro Boletín', // Este ya no se usa pero se mantiene en el dict
             newsletterPlaceholder: 'Tu email', // Este ya no se usa
             newsletterButton: 'Suscribirse', // Este ya no se usa
             newsletterSuccess: '¡Gracias por suscribirte!', // Este ya no se usa
             socialTitle: 'Síguenos',
             footerBottom: '© 2025 QuantyX. Todos los derechos reservados.' // Nombre cambiado aquí
         },
         'en': {
             logo: 'QuantyX', // Nombre cambiado aquí
             homeTitle: 'Welcome to QuantyX', // Nombre cambiado aquí
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
             searchTitle: 'Search QuantyX', // Nombre cambiado aquí
             walletConnectTitle: 'Connect Wallet',
             userProfileTitle: 'User Profile / Access',
             newsletterTitle: 'Subscribe to our Newsletter',
             newsletterPlaceholder: 'Your email',
             newsletterButton: 'Subscribe',
             newsletterSuccess: 'Thank you for subscribing!',
             socialTitle: 'Follow Us',
             footerBottom: '© 2025 QuantyX. All rights reserved.' // Nombre cambiado aquí
         },
         'fr': {
             logo: 'QuantyX', // Nombre cambiado aquí
             homeTitle: 'Bienvenue chez QuantyX', // Nombre cambiado aquí
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
              searchTitle: 'Rechercher dans QuantyX', // Nombre cambiado aquí
              walletConnectTitle: 'Connecter le Portefeuille',
              userProfileTitle: 'Profil Utilisateur / Accès',
              newsletterTitle: 'Abonnez-vous à notre Newsletter',
              newsletterPlaceholder: 'Votre email',
              newsletterButton: "S'abonner",
              newsletterSuccess: 'Merci de vous être abonné !',
              socialTitle: 'Suivez-nous',
              footerBottom: '© 2025 QuantyX. Tous droits réservés.' // Nombre cambiado aquí
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

         // Aplica traducciones a pie de página (solo redes sociales y copyright ahora)
         const socialTitle = document.querySelector('.social-media h3');
         if (socialTitle && texts.socialTitle) socialTitle.textContent = texts.socialTitle;

         const footerBottomText = document.querySelector('.footer-bottom');
         if (footerBottomText && texts.footerBottom) footerBottomText.textContent = texts.footerBottom;

          // El código de la Newsletter Eliminado - Las siguientes líneas *DEBEN* estar comentadas o eliminadas
     };

     // --- Código de la Newsletter Eliminado ---
     // const newsletterForm = document.getElementById('newsletter-form'); // <-- Esta línea debe estar comentada o eliminada
     // const subscriptionMessage = document.querySelector('.subscription-message'); // <-- Esta línea debe estar comentada o eliminada
     //  // Usar el valor hexadecimal del color verde corporativo
     //  const successColor = '#39da8a'; // <-- Esta línea debe estar comentada o eliminada

     // // newsletterForm.addEventListener('submit', (e) => { // <-- Y MUY IMPORTANTE: Esta línea debe estar comentada o eliminada
     // //     e.preventDefault(); // Evita que el formulario se envíe realmente
     // //     console.log('Email submitted:', newsletterForm.querySelector('input').value);
     // //     const currentLang = document.documentElement.lang || 'es';
     // //     const messageText = translations[currentLang]?.newsletterSuccess || '¡Gracias por suscribirte!';
     // //     subscriptionMessage.textContent = messageText;
     // //     subscriptionMessage.style.color = successColor; // Usar el color verde
     // //     subscriptionMessage.style.marginTop = '10px';
     // //     newsletterForm.reset(); // Limpia el formulario
     // // });


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
