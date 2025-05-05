// script.js - Actualizado para la nueva estructura de Wallet Tracker

document.addEventListener('DOMContentLoaded', () => {
    // --- Lógica para mostrar secciones al hacer clic en el menú ---
    const menuLinks = document.querySelectorAll('.sidebar .menu-item a');
    const sections = document.querySelectorAll('.main-content > section'); // Seleccionar solo secciones hijas directas

    menuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); // Evita la recarga de la página

            const targetSectionId = link.getAttribute('data-section');
            const targetSection = document.getElementById(targetSectionId);

            if (targetSection) {
                // Oculta todas las secciones principales
                sections.forEach(section => {
                    section.classList.remove('active');
                });

                // Muestra la sección objetivo
                targetSection.classList.add('active');

                // Remover la clase 'active-menu' de otros enlaces y añadirla al clicado
                 menuLinks.forEach(item => item.classList.remove('active-menu'));
                 link.classList.add('active-menu');

                // Si la sección Wallet Tracker se activa, resetear su estado inicial visualmente
                // (No llama a la API aquí, solo limpia campos visuales)
                if(targetSectionId === 'wallet-tracker') {
                    resetWalletTrackerVisuals();
                }
            }
        });
    });

    // --- Lógica de Modales (Búsqueda, Wallet, Usuario) ---
    const searchIcon = document.getElementById('search-icon');
    const walletIcon = document.getElementById('wallet-icon');
    const userIcon = document.getElementById('user-icon');
    const searchModal = document.getElementById('search-modal');
    const walletModal = document.getElementById('wallet-modal');
    const userModal = document.getElementById('user-modal');
    const closeButtons = document.querySelectorAll('.modal .close-button');

    const openModal = (modal) => modal.style.display = 'block';
    const closeModal = (modal) => modal.style.display = 'none';

    searchIcon?.addEventListener('click', () => openModal(searchModal));
    walletIcon?.addEventListener('click', () => openModal(walletModal));
    userIcon?.addEventListener('click', () => openModal(userModal));

    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            if (modal) closeModal(modal);
        });
    });

    // Cerrar modal si se hace clic fuera del contenido
    window.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal')) {
            closeModal(event.target);
        }
    });

    // --- Lógica de Cambio de Idioma ---
    const languageSwitcher = document.getElementById('language-switcher');
    const languageOptions = languageSwitcher?.querySelectorAll('.language-dropdown span');

    // TODO: Implementar la lógica real de traducción con i18next o similar
    const applyLanguage = (lang) => {
        console.log(`Idioma cambiado a: ${lang}`);
        // Aquí iría la lógica para cargar y aplicar las traducciones
        document.documentElement.lang = lang; // Actualizar el atributo lang del HTML
    };

    languageOptions?.forEach(option => {
        option.addEventListener('click', () => {
            const selectedLang = option.getAttribute('data-lang');
            applyLanguage(selectedLang);
            // Opcional: cerrar el dropdown si es necesario
        });
    });


    // ======================================================
    // ========= INICIO LÓGICA WALLET TRACKER NUEVA =========
    // ======================================================

    const walletTrackerSection = document.getElementById('wallet-tracker');

    // --- Selección de Elementos DOM para Wallet Tracker ---
    const displayWalletAddress = document.getElementById('display-wallet-address');
    const copyAddressButton = walletTrackerSection?.querySelector('.account-info .copy-button');
    const qrCodeButton = walletTrackerSection?.querySelector('.qr-button');
    const transactionSearchInput = document.getElementById('transaction-search-input');
    const transactionSearchButton = document.getElementById('transaction-search-button');

    // Caja "Descripción General"
    const solBalanceValue = document.getElementById('sol-balance-value');
    const solBalanceUsd = document.getElementById('sol-balance-usd');
    const tokenCount = document.getElementById('token-count');
    const tokenDropdownDetails = walletTrackerSection?.querySelector('.token-dropdown');
    const tokenListDetailed = document.getElementById('token-list-detailed');
    const walletDetailsButton = walletTrackerSection?.querySelector('.wallet-details-link button'); // Asumiendo que es un botón

    // Caja "Más Información"
    const ownerAddress = document.getElementById('owner-address');
    const copyOwnerAddressButton = walletTrackerSection?.querySelector('.more-info-box .copy-button-small');
    const onCurveStatus = document.getElementById('on-curve-status');
    const stakeAmount = document.getElementById('stake-amount');
    const tokenCreatorTag = document.getElementById('token-creator-tag');
    // Podrías seleccionar más tags si tuvieran IDs específicos o clases

    // Caja "Varios" - Notas
    const addNoteLink = document.getElementById('add-note-link');
    const addNoteForm = document.getElementById('add-note-form');
    const privateNoteInput = document.getElementById('private-note-input');
    const saveNoteButton = document.getElementById('save-note-button');
    const cancelNoteButton = document.getElementById('cancel-note-button');
    const privateNoteDisplay = document.getElementById('private-note-display');

    // Tabla de Transacciones
    const transactionsTableBody = document.getElementById('transaction-list-body');
    const itemsPerPageSelector = document.getElementById('items-per-page');

    // --- Funciones Auxiliares ---

    // Función para mostrar feedback de copia
    const showCopyFeedback = (buttonElement) => {
        const feedback = document.createElement('span');
        feedback.textContent = 'Copiado!';
        feedback.className = 'copied-feedback';
        buttonElement.parentNode.appendChild(feedback);
        feedback.classList.add('show'); // Inicia la animación CSS
        setTimeout(() => {
            feedback.classList.remove('show');
            setTimeout(() => feedback.remove(), 500); // Elimina después de la transición
        }, 1500); // Muestra por 1.5 segundos
    };

    // Función para copiar texto al portapapeles
    const copyToClipboard = (text, buttonElement) => {
        if (!navigator.clipboard) {
            alert("La copia al portapapeles no es compatible con tu navegador.");
            return;
        }
        navigator.clipboard.writeText(text).then(() => {
            showCopyFeedback(buttonElement);
        }).catch(err => {
            console.error('Error al copiar: ', err);
            alert("Error al copiar la dirección.");
        });
    };

    // Función para limpiar los campos visuales del tracker
    const resetWalletTrackerVisuals = () => {
        if (!walletTrackerSection) return; // Si no estamos en la sección, salir

        displayWalletAddress.textContent = 'Introduce una dirección...';
        solBalanceValue.textContent = '-';
        solBalanceUsd.textContent = '$ -.--';
        tokenCount.textContent = '- Tokens';
        ownerAddress.textContent = '-';
        onCurveStatus.textContent = '-';
        stakeAmount.textContent = '-';
        tokenListDetailed.innerHTML = '<li>No hay tokens para mostrar.</li>'; // Limpiar lista
        transactionsTableBody.innerHTML = '<tr><td colspan="9" style="text-align:center;">No hay transacciones para mostrar.</td></tr>'; // Limpiar tabla
        privateNoteDisplay.innerHTML = ''; // Limpiar notas
        privateNoteInput.value = ''; // Limpiar input de nota
        addNoteForm?.classList.add('hidden');
        addNoteLink?.classList.remove('hidden');
        tokenDropdownDetails?.removeAttribute('open'); // Cerrar dropdown

        // Ocultar mensajes de error o carga si existieran (necesitarías IDs para ellos)
        // hideElement(loadingIndicator);
        // hideElement(errorMessage);
    };

    // --- Event Listeners para Wallet Tracker ---

    // Botón Copiar Dirección Principal
    copyAddressButton?.addEventListener('click', () => {
        const address = displayWalletAddress?.textContent;
        if (address && address !== 'Introduce una dirección...') {
            copyToClipboard(address, copyAddressButton);
        }
    });

    // Botón Copiar Dirección Dueño
    copyOwnerAddressButton?.addEventListener('click', () => {
        const address = ownerAddress?.textContent;
        if (address && address !== '-') {
            copyToClipboard(address, copyOwnerAddressButton);
        }
    });

    // Botón Código QR (funcionalidad pendiente)
    qrCodeButton?.addEventListener('click', () => {
        // TODO: Implementar generación y muestra de QR
        alert('Mostrar código QR (funcionalidad pendiente)');
        const address = displayWalletAddress?.textContent;
        console.log("Generar QR para:", address);
        // Aquí llamarías a una librería de QR (ej: qrcode.js) y mostrarías en un modal
    });

    // Botón Buscar Transacciones (dentro del tracker)
    transactionSearchButton?.addEventListener('click', () => {
        const searchTerm = transactionSearchInput?.value;
        // TODO: Implementar lógica de búsqueda en las transacciones YA CARGADAS o nueva llamada API
        alert(`Buscar "${searchTerm}" (funcionalidad pendiente)`);
        console.log("Buscar término:", searchTerm);
    });
    transactionSearchInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            transactionSearchButton.click();
        }
    });


    // Lógica para Notas Privadas
    addNoteLink?.addEventListener('click', (e) => {
        e.preventDefault();
        addNoteForm?.classList.remove('hidden');
        addNoteLink.classList.add('hidden');
        privateNoteInput?.focus();
    });

    cancelNoteButton?.addEventListener('click', () => {
        addNoteForm?.classList.add('hidden');
        addNoteLink?.classList.remove('hidden');
        privateNoteInput.value = ''; // Limpiar
    });

    saveNoteButton?.addEventListener('click', () => {
        const noteText = privateNoteInput?.value.trim();
        if (noteText) {
            // TODO: Implementar guardado persistente (LocalStorage o backend)
            // Por ahora, solo lo muestra
            const noteElement = document.createElement('a');
            noteElement.href = '#'; // Hacerlo parecer un link
            noteElement.textContent = noteText.substring(0, 30) + (noteText.length > 30 ? '...' : ''); // Acortar si es largo
            noteElement.title = noteText; // Mostrar completo en hover
            noteElement.classList.add('private-note-link');
            noteElement.addEventListener('click', (e) => {
                 e.preventDefault();
                 alert(`Nota guardada:\n\n${noteText}`); // Mostrar nota completa al clickear
            });
            privateNoteDisplay?.appendChild(noteElement);

            privateNoteInput.value = ''; // Limpiar
            addNoteForm?.classList.add('hidden');
            addNoteLink?.classList.remove('hidden');
            console.log("Nota guardada (temporalmente):", noteText);
        }
    });

    // Icono Ojo en Tabla (usando delegación de eventos)
    transactionsTableBody?.addEventListener('click', (e) => {
        const targetButton = e.target.closest('.view-details-button');
        if (targetButton) {
            const row = targetButton.closest('tr');
            const signatureElement = row?.querySelector('.tx-signature');
            const signature = signatureElement?.textContent || 'Firma desconocida';
            // TODO: Implementar muestra de detalles de la transacción
            alert(`Mostrar detalles para la firma: ${signature} (funcionalidad pendiente)`);
            console.log("Mostrar detalles TX:", signature, row);
            // Aquí podrías abrir un modal con más datos de 'row' o hacer otra llamada API
        }
    });

    // Selector de Items por Página
    itemsPerPageSelector?.addEventListener('change', (e) => {
        const selectedValue = e.target.value;
        // TODO: Implementar recarga/filtrado de transacciones
        console.log(`Mostrar ${selectedValue} transacciones por página (funcionalidad pendiente)`);
        // Necesitarías volver a llamar a la API o ajustar la visualización de los datos ya cargados
    });

     // Link Creador de Tokens Tag
     tokenCreatorTag?.addEventListener('click', (e) => {
         e.preventDefault();
         // TODO: Implementar lógica para mostrar tokens creados
         alert('Mostrar tokens creados por esta cuenta (funcionalidad pendiente)');
         console.log("Click en tag creador de tokens");
         // Podría hacer una llamada API o filtrar datos existentes
     });

     // Botón "Más detalles de la billetera" (si existe)
     walletDetailsButton?.addEventListener('click', () => {
          // TODO: Implementar acción deseada
          alert('Mostrar más detalles de la billetera (funcionalidad pendiente)');
          console.log("Click en botón detalles billetera");
     });


    // --- Función Principal para Rastrear Wallet (MODIFICADA ESTRUCTURALMENTE) ---
    // ESTA FUNCIÓN AHORA NECESITA SER CONECTADA A UNA API REAL
    const trackWallet = async () => {
        // !! IMPORTANTE: Necesitas obtener la dirección de algún input.
        // !! Ya no existe #solana-wallet-address. ¿Usamos el modal de búsqueda general
        // !! o añadimos un input específico en la sección de tracker de nuevo?
        // !! Por ahora, asumiré que obtienes la 'walletAddress' de alguna manera.
        // !! Ejemplo: const walletAddress = document.getElementById('input-para-direccion-tracker')?.value.trim();

        const walletAddress = prompt("Introduce la dirección de la billetera Solana:"); // Temporal: usar prompt

        if (!walletAddress) {
            alert("Por favor, introduce una dirección de billetera válida.");
            return;
        }

        console.log(`Iniciando rastreo para: ${walletAddress}`);
        resetWalletTrackerVisuals(); // Limpia la interfaz antes de empezar

        // Mostrar algún indicador de carga (necesitarías añadir un elemento HTML para esto)
        // const loadingIndicator = document.getElementById('tracker-loading');
        // showElement(loadingIndicator);
        // hideElement(errorMessage); // Ocultar errores previos

        displayWalletAddress.textContent = `${walletAddress.substring(0, 4)}...${walletAddress.substring(walletAddress.length - 4)}`; // Mostrar dirección acortada
        displayWalletAddress.title = walletAddress; // Mostrar completa en hover


        try {
            // ---------- SIMULACIÓN DE LLAMADAS API ----------
            // Aquí es donde harías las llamadas reales a la API de Solana (usando @solana/web3.js o una API de terceros)
            // para obtener los datos que necesitas para la nueva interfaz.

            // 1. Obtener Saldo SOL y su valor en USD
            // const { solBalance, usdValue } = await fetchSolBalance(walletAddress); // Función ficticia
            const solBalance = (Math.random() * 100).toFixed(2); // Dato simulado
            const usdValue = (solBalance * 145.50).toFixed(2); // Dato simulado ($145.50/SOL)
            solBalanceValue.textContent = solBalance;
            solBalanceUsd.textContent = `$ ${usdValue}`;

            // 2. Obtener Lista de Tokens (SPL) y Contarlos
            // const tokens = await fetchTokenBalances(walletAddress); // Función ficticia que devuelve array de tokens
             const tokens = [ // Datos simulados
                 { name: 'QuantyX Token', symbol: 'QTYX', amount: 1500.75, icon: 'qtyx_icon.png', mint: 'mintAddr1' },
                 { name: 'Bonk', symbol: 'BONK', amount: 1000000, icon: 'bonk_icon.png', mint: 'mintAddr2' },
                 { name: 'USD Coin', symbol: 'USDC', amount: 250.50, icon: 'usdc_icon.png', mint: 'mintAddr3' },
             ];
             tokenCount.textContent = `${tokens.length} Tokens`;
             tokenListDetailed.innerHTML = ''; // Limpiar lista antes de poblar
             if (tokens.length > 0) {
                 tokens.forEach(token => {
                     const li = document.createElement('li');
                     li.innerHTML = `
                         <img src="${token.icon}" alt="${token.symbol}" class="token-icon" onerror="this.src='placeholder_token_icon.png'"> <span class="token-name">${token.name} (${token.symbol})</span>
                         <span class="token-amount">${token.amount.toLocaleString()}</span>
                     `;
                     // Podrías añadir data-mint a 'li' para usarlo luego
                     li.dataset.mint = token.mint;
                     tokenListDetailed.appendChild(li);
                 });
             } else {
                 tokenListDetailed.innerHTML = '<li>No se encontraron tokens SPL.</li>';
             }


            // 3. Obtener "Más Información" (Dueño, Curva, Stake, Tags)
            // const details = await fetchWalletDetails(walletAddress); // Función ficticia
            ownerAddress.textContent = `${walletAddress.substring(0, 5)}...${walletAddress.substring(walletAddress.length - 5)}`; // Simulado: mismo dueño
            ownerAddress.title = walletAddress;
            onCurveStatus.textContent = Math.random() > 0.5 ? 'Verdadero' : 'Falso'; // Simulado
            stakeAmount.textContent = (Math.random() * 20).toFixed(2); // Simulado


            // 4. Obtener Transacciones Recientes
            const itemsPerPage = parseInt(itemsPerPageSelector?.value || '10', 10);
            // const transactions = await fetchTransactions(walletAddress, itemsPerPage); // Función ficticia
            const transactions = Array.from({ length: itemsPerPage }).map((_, i) => ({ // Datos simulados
                 signature: `Sig${i}_${Date.now()}${Math.random().toString(36).substring(2, 8)}`,
                 block: 123456789 - i * 10,
                 timestamp: Date.now() - i * 60000 * 5, // Cada 5 minutos
                 instructions: Math.floor(Math.random() * 5) + 1,
                 by: ['Raydium', 'Jupiter', 'System Program', 'Token Program'][Math.floor(Math.random() * 4)],
                 value: (Math.random() * 2).toFixed(3),
                 fee: (Math.random() * 0.0001).toFixed(6),
                 program: ['Tokenkeg...', 'ComputeBudget...', 'System...', 'SPLAssoc...'][Math.floor(Math.random() * 4)]
            }));

            transactionsTableBody.innerHTML = ''; // Limpiar tabla
            if (transactions.length > 0) {
                transactions.forEach(tx => {
                    const tr = document.createElement('tr');
                    const date = new Date(tx.timestamp).toLocaleString('sv-SE'); // Formato YYYY-MM-DD HH:MM:SS
                    tr.innerHTML = `
                        <td><button class="icon-button view-details-button" title="Ver detalles"><i class="fas fa-eye"></i></button></td>
                        <td><span class="tx-signature" title="${tx.signature}">${tx.signature.substring(0, 4)}...${tx.signature.substring(tx.signature.length - 4)}</span></td>
                        <td>${tx.block}</td>
                        <td>${date}</td>
                        <td>${tx.instructions}</td>
                        <td>${tx.by}</td>
                        <td><i class="fab fa-solana sol-icon-small"></i> ${tx.value} SOL</td>
                        <td><i class="fab fa-solana sol-icon-small"></i> ${tx.fee} SOL</td>
                        <td>${tx.program}</td>
                    `;
                     // Guardar datos completos en el elemento TR por si se necesitan al hacer click en el ojo
                     tr.dataset.txData = JSON.stringify(tx);
                    transactionsTableBody.appendChild(tr);
                });
            } else {
                transactionsTableBody.innerHTML = '<tr><td colspan="9" style="text-align:center;">No se encontraron transacciones recientes.</td></tr>';
            }

            // ---------- FIN SIMULACIÓN ----------

            // Ocultar indicador de carga
            // hideElement(loadingIndicator);

        } catch (error) {
            console.error("Error al rastrear la billetera:", error);
            // Mostrar mensaje de error (necesitarías un elemento HTML para esto)
            // const errorMessage = document.getElementById('tracker-error');
            // errorMessage.textContent = `Error: ${error.message || 'Error desconocido al obtener datos.'}`;
            // showElement(errorMessage);
            // hideElement(loadingIndicator); // Asegurarse de ocultar carga en caso de error
            alert(`Error al obtener datos: ${error.message}`); // Temporal
            resetWalletTrackerVisuals(); // Limpiar campos en caso de error
        }
    };

    // --- Event Listener para Iniciar Rastreo ---
    // !! Necesitas decidir CÓMO se introduce la dirección en la nueva interfaz
    // !! Ejemplo: si añades un botón específico en la sección tracker:
    // const startTrackButton = document.getElementById('start-tracker-button');
    // startTrackButton?.addEventListener('click', trackWallet);

    // Por ahora, dejo la llamada comentada. Deberás activarla desde donde corresponda.
    // trackWallet(); // Llamada de ejemplo (no la dejes así)


    // ======================================================
    // ========= FIN LÓGICA WALLET TRACKER NUEVA ============
    // ======================================================


    // --- Inicialización General ---
     // Activar sección 'home' y su enlace de menú al cargar
     const homeSection = document.getElementById('home');
     const homeMenuItemLink = document.querySelector('.sidebar .menu-item a[data-section="home"]');

     sections.forEach(s => s.classList.remove('active')); // Ocultar todas primero
     menuLinks.forEach(l => l.classList.remove('active-menu')); // Quitar activo de todos los links

     if (homeSection) {
         homeSection.classList.add('active'); // Mostrar home
     }
      if (homeMenuItemLink) {
          homeMenuItemLink.classList.add('active-menu'); // Marcar link home como activo
      }

      // Establecer idioma por defecto y aplicarlo (si se implementa traducción)
      // applyLanguage(document.documentElement.lang || 'es');

}); // Fin de DOMContentLoaded
