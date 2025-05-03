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
     const mainHeading = document.querySelector('.main-content h1'); // Título principal

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
         }
     };

     const applyLanguage = (lang) => {
         // Aplica traducciones al menú lateral
         menuTexts.forEach(textSpan => {
             const dataSection = textSpan.parentElement.getAttribute('data-section');
             const key = Object.keys(translations[lang]).find(k => {
                 // Buscar la clave de traducción que coincide con el data-section
                 // Esto es un poco manual, mejor si data-section = clave_traduccion
                 switch(dataSection) {
                     case 'sentiment-analyzer': return k === 'sentimentAnalyzer';
                     case 'wallet-tracker': return k === 'walletTracker';
                     case 'bot-trading': return k === 'botTrading';
                     case 'sniper': return k === 'sniper';
                     case 'token-creator': return k === 'tokenCreator';
                     case 'staking': return k === 'staking';
                     case 'gaming': return k === 'gaming';
                     case 'knowledge-base': return k === 'knowledgeBase';
                     case 'chatbot': return k === 'chatbot';
                     default: return false;
                 }
             });
             if (key) {
                 textSpan.textContent = translations[lang][key];
             }
         });

         // Aplica traducción al logo (si cambia)
         if (translations[lang].logo) {
             headerLogo.textContent = translations[lang].logo;
         }

          // Aplica traducción al título principal (si cambia)
         if (translations[lang].homeTitle && mainHeading) {
             mainHeading.textContent = translations[lang].homeTitle;
         }

         // TODO: Aplicar traducciones a otras partes de la página (footer, modales, contenido principal)
     };

     langSpans.forEach(span => {
         span.addEventListener('click', (e) => {
             const selectedLang = e.target.getAttribute('data-lang');
             applyLanguage(selectedLang);
             // Opcional: Ocultar dropdown después de seleccionar
             // languageDropdown.style.display = 'none';
         });
     });

     // Opcional: Ocultar dropdown si se hace click fuera de él
     document.addEventListener('click', (e) => {
         if (!languageSwitcher.contains(e.target)) {
            // languageDropdown.style.display = 'none'; // Descomentar si se oculta al hacer click en un idioma
         }
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
         if (e.target.classList.contains('modal')) {
             hideModal(e.target);
         }
     });

     // --- Lógica básica para el formulario de boletín (solo demostración frontend) ---
     const newsletterForm = document.getElementById('newsletter-form');
     const subscriptionMessage = document.querySelector('.subscription-message');

     newsletterForm.addEventListener('submit', (e) => {
         e.preventDefault(); // Evita que el formulario se envíe realmente

         // En un caso real, aquí enviarías los datos a tu servidor
         console.log('Email submitted:', newsletterForm.querySelector('input').value);

         subscriptionMessage.textContent = '¡Gracias por suscribirte!';
         subscriptionMessage.style.color = var(--neon-green); // Color de éxito
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
       applyLanguage('es');


});
