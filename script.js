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
             detox: 'Detox', // Nuevo texto para menú
             reclaim: 'Reclaim', // Nuevo texto para menú
             knowledgeBase: 'Base de Conocimiento',
             chatbot: 'ChatBot',
             // ... agregar más traducciones para el pie de página, modales, etc.
             searchTitle: 'Buscar en QuantyX',
             walletConnectTitle: 'Conectar Wallet',
             userProfileTitle: 'Perfil de Usuario / Acceso',
             newsletterTitle: 'Suscríbete a nuestro Boletín', // Este ya no se usa pero se mantiene en el dict
             newsletterPlaceholder: 'Tu email', // Este ya no se usa
             newsletterButton: 'Suscribirse', // Este ya no se usa
             newsletterSuccess: '¡Gracias por suscribirte!', // Este ya no se usa
             socialTitle: 'Síguenos',
             footerBottom: '© 2025 QuantyX. Todos los derechos reservados.'
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
             detox: 'Detox', // Nuevo texto para menú
             reclaim: 'Reclaim', // Nuevo texto para menú
             knowledgeBase: 'Knowledge Base',
             chatbot: 'ChatBot',
             // ...
             searchTitle: 'Search QuantyX',
             walletConnectTitle: 'Connect Wallet',
             userProfileTitle: 'User Profile / Access',
             newsletterTitle: 'Subscribe to our Newsletter',
             newsletterPlaceholder: 'Your email',
             newsletterButton: 'Subscribe',
             newsletterSuccess: 'Thank you for subscribing!',
             socialTitle: 'Follow Us',
             footerBottom: '© 2025 QuantyX. All rights reserved.'
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
             detox: 'Detox', // Nuevo texto para menú
             reclaim: 'Réclamer', // Nuevo texto para menú
             knowledgeBase: 'Base de Connaissances',
             chatbot: 'ChatBot',
             // ...
              searchTitle: 'Rechercher dans QuantyX',
              walletConnectTitle: 'Connecter le Portefeuille',
              userProfileTitle: 'Profil Utilisateur / Accès',
              newsletterTitle: 'Abonnez-vous à notre Newsletter',
              newsletterPlaceholder: 'Votre email',
              newsletterButton: "S'abonner",
              newsletterSuccess: 'Merci de vous être abonné !',
              socialTitle: 'Suivez-nous',
              footerBottom: '© 2025 QuantyX. Tous droits réservés.'
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
                 case 'detox': textSpan.textContent = texts.detox; break; // Aplicar texto de Detox
                 case 'reclaim': textSpan.textContent = texts.reclaim; break; // Aplicar texto de Reclaim
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
             To do this in your environment, you would typically:

1.  **Install the OpenAI Python Library:** If you haven't already, install it using pip:
    ```bash
    pip install openai
    ```

2.  **Get an OpenAI API Key:** You need an API key from OpenAI. If you don't have one, sign up on the [OpenAI website](https://platform.openai.com/) and generate an API key.

3.  **Set up the API Key:** Store your API key securely. The recommended way is to set it as an environment variable (`OPENAI_API_KEY`). You can do this in your shell or in your script before making API calls.

    * **Shell (Linux/macOS):**
        ```bash
        export OPENAI_API_KEY='your-api-key-here'
        ```
        (Replace `'your-api-key-here'` with your actual key). You might want to add this line to your shell's startup file (like `.bashrc`, `.zshrc`, or `.profile`) to make it permanent.

    * **Shell (Windows Command Prompt):**
        ```cmd
        set OPENAI_API_KEY=your-api-key-here
        ```

    * **Shell (Windows PowerShell):**
        ```powershell
        $env:OPENAI_API_KEY='your-api-key-here'
        ```

    * **Directly in script (less secure, not recommended for production):**
        ```python
        import os
        os.environ["OPENAI_API_KEY"] = "your-api-key-here"
        # Or using the openai library's built-in setting (deprecated in favor of environment variables)
        # import openai
        # openai.api_key = "your-api-key-here"
        ```

4.  **Use the OpenAI API in Python:** Once the key is set, you can use the Python library to interact with the models.

Here's a simple example using the `openai` library (version 1.0+):

```python
import os
from openai import OpenAI

# Initialize the client.
# It automatically reads the OPENAI_API_KEY environment variable.
# If not using environment variable, you can pass api_key='your-api-key' here.
client = OpenAI()

# Make an API call to create a completion (text generation)
try:
    response = client.chat.completions.create(
      model="gpt-4o-mini", # Or "gpt-3.5-turbo", "gpt-4", etc.
      messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "What is the capital of France?"}
      ]
    )

    # Print the generated response
    print(response.choices[0].message.content)

except Exception as e:
    print(f"An error occurred: {e}")
