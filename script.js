// script.js - Implementando llamadas API directas con Helius Key

document.addEventListener('DOMContentLoaded', () => {

    // --- Clave API y Endpoints (¡¡ADVERTENCIA DE SEGURIDAD!!) ---
    // !! NO USAR ESTO EN PRODUCCIÓN REAL. La clave será visible para todos. !!
    // !! USAR SOLO PARA PRUEBAS LOCALES O TEMPORALES. !!
    const HELIUS_API_KEY = '6fbed4b2-ce46-4c7d-b827-2c1d5a539ff2';
    // ------------------------------------------------------------------
    const HELIUS_RPC_URL = `https://rpc.helius.xyz/?api-key=${HELIUS_API_KEY}`;
    const HELIUS_API_BASE = `https://api.helius.xyz/v0`; // Base para llamadas REST

    // Conexión Solana usando el RPC de Helius
    const connection = new solanaWeb3.Connection(HELIUS_RPC_URL);
    const LAMPORTS_PER_SOL = solanaWeb3.LAMPORTS_PER_SOL;

    // --- Selección de Elementos DOM Generales ---
    const menuLinks = document.querySelectorAll('.sidebar .menu-item a');
    const sections = document.querySelectorAll('.main-content > section'); // Solo secciones principales
    const searchIcon = document.getElementById('search-icon');
    const walletIcon = document.getElementById('wallet-icon');
    const userIcon = document.getElementById('user-icon');
    const searchModal = document.getElementById('search-modal');
    const walletModal = document.getElementById('wallet-modal');
    const userModal = document.getElementById('user-modal');
    const closeButtons = document.querySelectorAll('.modal .close-button');
    const languageSwitcher = document.getElementById('language-switcher');
    const languageOptions = languageSwitcher?.querySelectorAll('.language-dropdown span');

    // --- Selección de Elementos DOM para Wallet Tracker ---
    const walletTrackerSection = document.getElementById('wallet-tracker');
    const trackerWalletInput = document.getElementById('solana-wallet-address-input'); // Input específico del tracker
    const trackWalletButton = document.getElementById('track-wallet-button'); // Botón específico del tracker
    const trackerLoading = document.getElementById('tracker-loading');
    const trackerError = document.getElementById('tracker-error');
    const displayWalletAddress = document.getElementById('display-wallet-address');
    const copyAddressButton = walletTrackerSection?.querySelector('.account-info .copy-button');
    const qrCodeButton = walletTrackerSection?.querySelector('.qr-button');
    const transactionSearchInput = document.getElementById('transaction-search-input');
    const transactionSearchButton = document.getElementById('transaction-search-button');
    const solBalanceValue = document.getElementById('sol-balance-value');
    const solBalanceUsd = document.getElementById('sol-balance-usd');
    const tokenCount = document.getElementById('token-count');
    const tokenDropdownDetails = walletTrackerSection?.querySelector('.token-dropdown');
    const tokenListDetailed = document.getElementById('token-list-detailed');
    const walletDetailsButton = walletTrackerSection?.querySelector('.wallet-details-link button');
    const ownerAddress = document.getElementById('owner-address');
    const copyOwnerAddressButton = walletTrackerSection?.querySelector('.more-info-box .copy-button-small');
    const onCurveStatus = document.getElementById('on-curve-status');
    const stakeAmount = document.getElementById('stake-amount');
    const tagsDisplay = document.getElementById('tags-display');
    const tokenCreatorTag = document.getElementById('token-creator-tag'); // Podría no existir si se carga dinámicamente
    const addNoteLink = document.getElementById('add-note-link');
    const addNoteForm = document.getElementById('add-note-form');
    const privateNoteInput = document.getElementById('private-note-input');
    const saveNoteButton = document.getElementById('save-note-button');
    const cancelNoteButton = document.getElementById('cancel-note-button');
    const privateNoteDisplay = document.getElementById('private-note-display');
    const transactionsTableBody = document.getElementById('transaction-list-body');
    const itemsPerPageSelector = document.getElementById('items-per-page');

    // --- Lógica Navegación y Modales (Sin cambios relevantes) ---
    menuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSectionId = link.getAttribute('data-section');
            const targetSection = document.getElementById(targetSectionId);
            if (targetSection) {
                sections.forEach(s => s.classList.remove('active'));
                targetSection.classList.add('active');
                menuLinks.forEach(l => l.classList.remove('active-menu'));
                link.classList.add('active-menu');
                if(targetSectionId === 'wallet-tracker') {
                    resetWalletTrackerVisuals();
                }
            }
        });
    });

    const openModal = (modal) => { if (modal) modal.style.display = 'block'; };
    const closeModal = (modal) => { if (modal) modal.style.display = 'none'; };

    searchIcon?.addEventListener('click', () => openModal(searchModal));
    walletIcon?.addEventListener('click', () => openModal(walletModal));
    userIcon?.addEventListener('click', () => openModal(userModal));

    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            if (modal) closeModal(modal);
        });
    });

    window.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal')) {
            closeModal(event.target);
        }
    });

    // --- Lógica Idioma (Placeholder) ---
    const applyLanguage = (lang) => {
        console.log(`Idioma cambiado a: ${lang}`);
        document.documentElement.lang = lang;
        // TODO: Añadir lógica de traducción real aquí si es necesario
    };
    languageOptions?.forEach(option => {
        option.addEventListener('click', () => {
            applyLanguage(option.getAttribute('data-lang'));
        });
    });

    // ======================================================
    // ========= INICIO LÓGICA WALLET TRACKER REAL ==========
    // ======================================================

    // --- Funciones Auxiliares ---
    const showElement = (el) => { if(el) el.classList.remove('hidden'); };
    const hideElement = (el) => { if(el) el.classList.add('hidden'); };

    const showCopyFeedback = (buttonElement) => {
        // Eliminar feedback anterior si existe
        const existingFeedback = buttonElement.parentNode.querySelector('.copied-feedback');
        if(existingFeedback) existingFeedback.remove();

        const feedback = document.createElement('span');
        feedback.textContent = 'Copiado!';
        feedback.className = 'copied-feedback';
        // Insertar relativo al botón
        buttonElement.parentNode.insertBefore(feedback, buttonElement.nextSibling);
        // Forzar reflow para reiniciar animación si es necesario
        void feedback.offsetWidth;
        feedback.classList.add('show');
        setTimeout(() => {
            feedback.style.opacity = '0'; // Usar estilo para desvanecer
            setTimeout(() => feedback.remove(), 500);
        }, 1500);
    };

    const copyToClipboard = (text, buttonElement) => {
        if (!text) return;
        navigator.clipboard.writeText(text).then(() => {
            showCopyFeedback(buttonElement);
        }).catch(err => {
            console.error('Error al copiar: ', err);
            alert("Error al copiar.");
        });
    };

    // Resetea la interfaz visual del tracker a su estado inicial
    const resetWalletTrackerVisuals = () => {
        if (!walletTrackerSection) return;

        displayWalletAddress.textContent = 'Introduce una dirección...';
        displayWalletAddress.title = 'Dirección Completa';
        solBalanceValue.textContent = '-';
        solBalanceUsd.textContent = '$ -.--';
        tokenCount.textContent = '- Tokens';
        ownerAddress.textContent = '-';
        ownerAddress.title = 'Dirección Dueño';
        onCurveStatus.textContent = '-';
        stakeAmount.textContent = '-';
        tokenListDetailed.innerHTML = '<li>Introduce una dirección y rastrea.</li>';
        transactionsTableBody.innerHTML = '<tr><td colspan="9" style="text-align:center;">Introduce una dirección y haz clic en Rastrear.</td></tr>';
        privateNoteDisplay.innerHTML = '';
        privateNoteInput.value = '';
        addNoteForm?.classList.add('hidden');
        addNoteLink?.classList.remove('hidden');
        tokenDropdownDetails?.removeAttribute('open');
        tagsDisplay.innerHTML = '<small>(No implementado)</small>'; // Limpiar tags

        hideElement(trackerLoading);
        hideElement(trackerError);
    };

    // --- Event Listeners para Wallet Tracker ---

    // Input y Botón específicos del Tracker
    trackWalletButton?.addEventListener('click', () => {
        const address = trackerWalletInput?.value.trim();
        if (address) {
            trackWallet(address); // Llama a la función principal de rastreo
        } else {
            alert("Por favor, introduce una dirección de billetera de Solana.");
        }
    });
    trackerWalletInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            trackWalletButton.click(); // Simula clic en el botón
        }
    });


    // Botones Copiar
    copyAddressButton?.addEventListener('click', () => {
        const address = displayWalletAddress.dataset.fullAddress || displayWalletAddress.textContent; // Usa dirección completa si la guardamos
        if (address && address !== 'Introduce una dirección...') {
            copyToClipboard(address, copyAddressButton);
        }
    });

    copyOwnerAddressButton?.addEventListener('click', () => {
        const address = ownerAddress.dataset.fullAddress || ownerAddress.textContent;
        if (address && address !== '-') {
            copyToClipboard(address, copyOwnerAddressButton);
        }
    });

    // Botón Código QR (funcionalidad pendiente)
    qrCodeButton?.addEventListener('click', () => {
        const address = displayWalletAddress.dataset.fullAddress || displayWalletAddress.textContent;
        if (address && address !== 'Introduce una dirección...') {
             alert(`Mostrar código QR para: ${address} (funcionalidad pendiente)`);
             // TODO: Implementar librería QR y modal
        }
    });

    // Búsqueda en Transacciones (funcionalidad pendiente)
    transactionSearchButton?.addEventListener('click', () => {
        const searchTerm = transactionSearchInput?.value.toLowerCase();
        alert(`Buscar "${searchTerm}" en tabla (funcionalidad pendiente)`);
        // TODO: Implementar filtrado de filas de la tabla
        const rows = transactionsTableBody.querySelectorAll('tr');
        rows.forEach(row => {
            const rowText = row.textContent.toLowerCase();
            if (rowText.includes(searchTerm)) {
                row.style.display = ''; // Mostrar fila
            } else {
                row.style.display = 'none'; // Ocultar fila
            }
        });
    });
    transactionSearchInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') transactionSearchButton.click();
    });

    // Notas Privadas
    addNoteLink?.addEventListener('click', (e) => {
        e.preventDefault();
        addNoteForm?.classList.remove('hidden');
        addNoteLink.classList.add('hidden');
        privateNoteInput?.focus();
    });
    cancelNoteButton?.addEventListener('click', () => {
        addNoteForm?.classList.add('hidden');
        addNoteLink?.classList.remove('hidden');
        privateNoteInput.value = '';
    });
    saveNoteButton?.addEventListener('click', () => {
        const noteText = privateNoteInput?.value.trim();
        if (noteText) {
            // TODO: Implementar guardado persistente (LocalStorage o backend)
            const noteElement = document.createElement('a');
            noteElement.href = '#';
            noteElement.textContent = noteText.substring(0, 30) + (noteText.length > 30 ? '...' : '');
            noteElement.title = noteText;
            noteElement.classList.add('private-note-link');
            noteElement.addEventListener('click', (e) => {e.preventDefault(); alert(`Nota guardada:\n\n${noteText}`);});
            privateNoteDisplay?.appendChild(noteElement);
            privateNoteInput.value = '';
            addNoteForm?.classList.add('hidden');
            addNoteLink?.classList.remove('hidden');
        }
    });

    // Icono Ojo en Tabla (funcionalidad pendiente)
    transactionsTableBody?.addEventListener('click', (e) => {
        const targetButton = e.target.closest('.view-details-button');
        if (targetButton) {
            const row = targetButton.closest('tr');
            const txDataString = row?.dataset.txData;
            if (txDataString) {
                 const txData = JSON.parse(txDataString); // Recuperar datos completos
                 alert(`Mostrar detalles para firma: ${txData.signature} (funcionalidad pendiente)\nDatos:\n${JSON.stringify(txData, null, 2)}`);
                 // TODO: Mostrar estos datos en un modal
            }
        }
    });

    // Selector de Items por Página (funcionalidad pendiente)
    itemsPerPageSelector?.addEventListener('change', (e) => {
        const selectedValue = e.target.value;
        console.log(`Mostrar ${selectedValue} transacciones (funcionalidad pendiente)`);
        // TODO: Volver a llamar a trackWallet o a una función específica de transacciones
        const currentAddress = trackerWalletInput?.value.trim();
        if (currentAddress) {
             // trackWallet(currentAddress); // O una función más específica
        }
    });

     // Link Creador de Tokens Tag (funcionalidad pendiente)
     // Necesita delegación si se carga dinámicamente
     document.body.addEventListener('click', (e) => {
        if (e.target.matches('#token-creator-tag')) {
            e.preventDefault();
            alert('Mostrar tokens creados por esta cuenta (funcionalidad pendiente)');
        }
     });


    // --- Función Principal de Rastreo con API Helius ---
    const trackWallet = async (walletAddress) => {
        if (!walletAddress) return;

        console.log(`Iniciando rastreo para: ${walletAddress}`);
        resetWalletTrackerVisuals(); // Limpia interfaz
        showElement(trackerLoading); // Muestra carga
        hideElement(trackerError); // Oculta errores previos

        // Validar dirección (ya se hizo antes de llamar, pero por si acaso)
        let publicKey;
        try {
            publicKey = new solanaWeb3.PublicKey(walletAddress);
        } catch (error) {
            console.error("Dirección inválida en trackWallet:", error);
            trackerError.textContent = "Dirección de billetera inválida.";
            showElement(trackerError);
            hideElement(trackerLoading);
            return;
        }

        // Mostrar dirección acortada
        const shortAddress = `${walletAddress.substring(0, 4)}...${walletAddress.substring(walletAddress.length - 4)}`;
        displayWalletAddress.textContent = shortAddress;
        displayWalletAddress.title = walletAddress; // Tooltip con dirección completa
        displayWalletAddress.dataset.fullAddress = walletAddress; // Guardar completa para copiar

        // URL base para llamadas REST de Helius
        const apiUrl = `${HELIUS_API_BASE}addresses/${walletAddress}`;

        try {
            // --- Llamadas API en Paralelo (más eficiente) ---
            const [balanceResponse, accountInfoResponse, transactionsResponse] = await Promise.all([
                fetch(`${apiUrl}/balances?api-key=${HELIUS_API_KEY}`), // Obtiene SOL, Tokens y USD
                connection.getAccountInfo(publicKey), // Obtiene info básica como dueño y si es ejecutable
                fetch(`${apiUrl}/transactions?api-key=${HELIUS_API_KEY}&limit=${itemsPerPageSelector?.value || 10}`) // Historial
            ]);

            // --- Procesar Respuesta de Balances (SOL y Tokens) ---
            if (balanceResponse.ok) {
                const balanceData = await balanceResponse.json();
                console.log("Balance Data:", balanceData);

                // Saldo SOL
                solBalanceValue.textContent = (balanceData.nativeBalance / LAMPORTS_PER_SOL).toFixed(4);
                // Valor USD (si Helius lo incluye en este endpoint, si no, será undefined)
                 solBalanceUsd.textContent = balanceData.usdValue ? `$ ${balanceData.usdValue.toFixed(2)}` : '$ -.--';


                // Tokens SPL
                tokenCount.textContent = `${balanceData.tokens.length} Tokens`;
                tokenListDetailed.innerHTML = ''; // Limpiar lista
                if (balanceData.tokens.length > 0) {
                    balanceData.tokens.forEach(token => {
                        if (token.amount > 0) { // Mostrar solo tokens con saldo
                             const li = document.createElement('li');
                             // Intentar obtener icono (Helius no lo da aquí, usar placeholder)
                             const iconSrc = `https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/${token.mint}/logo.png`; // Intento común, puede fallar
                             li.innerHTML = `
                                 <img src="${iconSrc}" alt="${token.symbol || 'TKN'}" class="token-icon" onerror="this.src='https://via.placeholder.com/20/333/ccc?text=?'"> <span class="token-name" title="${token.mint}">${token.symbol || token.mint.substring(0,6)} (${token.name || 'Nombre Desc.'})</span>
                                 <span class="token-amount">${(token.amount / Math.pow(10, token.decimals)).toLocaleString(undefined, {maximumFractionDigits: token.decimals})}</span>
                             `;
                             tokenListDetailed.appendChild(li);
                        }
                    });
                     // Si después de filtrar, no quedaron tokens con saldo
                    if (tokenListDetailed.children.length === 0) {
                         tokenListDetailed.innerHTML = '<li>No se encontraron tokens con saldo.</li>';
                    }
                } else {
                    tokenListDetailed.innerHTML = '<li>No se encontraron tokens SPL.</li>';
                }
            } else {
                console.error("Error fetching balances:", balanceResponse.status, await balanceResponse.text());
                solBalanceValue.textContent = 'Error';
                solBalanceUsd.textContent = 'Error';
                tokenCount.textContent = 'Error Tokens';
                tokenListDetailed.innerHTML = '<li>Error al cargar tokens.</li>';
            }

            // --- Procesar Respuesta de Información de Cuenta ---
            if (accountInfoResponse) {
                console.log("Account Info:", accountInfoResponse);
                ownerAddress.textContent = `${accountInfoResponse.owner.toBase58().substring(0, 5)}...${accountInfoResponse.owner.toBase58().substring(accountInfoResponse.owner.toBase58().length - 5)}`;
                ownerAddress.title = accountInfoResponse.owner.toBase58(); // Dirección completa en tooltip
                ownerAddress.dataset.fullAddress = accountInfoResponse.owner.toBase58(); // Guardar para copiar
                // Una cuenta 'en la curva' generalmente no es ejecutable (no es un programa)
                onCurveStatus.textContent = !accountInfoResponse.executable ? 'Verdadero' : 'Falso (Programa)';
            } else {
                // Podría ser una cuenta no inicializada
                 console.warn("Account info not found (possibly uninitialized).");
                 ownerAddress.textContent = 'No encontrado';
                 onCurveStatus.textContent = 'No encontrado';
            }
            // Stake y Tags (No implementados desde API básica)
            stakeAmount.textContent = '-';
            tagsDisplay.innerHTML = '<small>(No implementado)</small>';


            // --- Procesar Respuesta de Transacciones ---
            if (transactionsResponse.ok) {
                const transactionsData = await transactionsResponse.json();
                console.log("Transactions Data:", transactionsData);
                transactionsTableBody.innerHTML = ''; // Limpiar tabla

                if (Array.isArray(transactionsData) && transactionsData.length > 0) {
                    transactionsData.forEach(tx => {
                        const tr = document.createElement('tr');
                         const date = tx.timestamp ? new Date(tx.timestamp * 1000).toLocaleString('sv-SE') : '-';
                         const signatureShort = `${tx.signature.substring(0, 4)}...${tx.signature.substring(tx.signature.length - 4)}`;
                         const fee = tx.fee ? (tx.fee / LAMPORTS_PER_SOL).toFixed(9) : '0'; // Helius a veces no da fee=0

                         // Simplificar descripción de 'Por' y 'Programa' (Helius da mucha info)
                        let source = tx.source || 'Desconocido';
                        let program = tx.type || 'Desconocido'; // Usar tipo como programa principal
                        if(tx.events && tx.events.nft && tx.events.nft.source) source = tx.events.nft.source; // Mejor fuente para NFTs
                         if (tx.instructions && tx.instructions.length > 0) {
                              // Intenta obtener el programa de la primera instrucción si no hay tipo claro
                              if (program === 'UNKNOWN' || program === 'SOLANA_PROGRAM') {
                                  program = tx.instructions[0].programId?.substring(0, 10) + '...' || program;
                              }
                         }

                         // Determinar valor principal (heurística simple)
                        let mainValue = '---';
                        if (tx.type === 'TRANSFER' && tx.nativeTransfers?.length > 0) {
                             const nativeTransfer = tx.nativeTransfers.find(t => t.fromUserAccount === walletAddress || t.toUserAccount === walletAddress);
                              if(nativeTransfer) {
                                    const amount = (nativeTransfer.amount / LAMPORTS_PER_SOL).toFixed(4);
                                    const prefix = nativeTransfer.fromUserAccount === walletAddress ? '-' : '+';
                                    mainValue = `<i class="fab fa-solana sol-icon-small"></i> ${prefix} ${amount} SOL`;
                              }
                        } else if (tx.tokenTransfers?.length > 0) {
                            const tokenTransfer = tx.tokenTransfers.find(t => t.fromUserAccount === walletAddress || t.toUserAccount === walletAddress);
                             if(tokenTransfer) {
                                    const amount = tokenTransfer.tokenAmount;
                                    const symbol = tokenTransfer.tokenSymbol || tokenTransfer.mint?.substring(0,4) || '?';
                                    const prefix = tokenTransfer.fromUserAccount === walletAddress ? '-' : '+';
                                     mainValue = `${prefix} ${amount} ${symbol}`;
                             }
                        }
                         // Añadir lógica para otros tipos si es necesario (NFT, SWAP, etc.)

                        tr.innerHTML = `
                            <td><button class="icon-button view-details-button" title="Ver detalles"><i class="fas fa-eye"></i></button></td>
                            <td><span class="tx-signature" title="${tx.signature}">${signatureShort}</span></td>
                            <td>${tx.slot || '-'}</td>
                            <td>${date}</td>
                            <td>${tx.instructions?.length || '-'}</td>
                            <td>${source}</td>
                            <td class="${tx.tokenTransfers?.find(t=>t.fromUserAccount===walletAddress)?'tx-sent':(tx.tokenTransfers?.find(t=>t.toUserAccount===walletAddress)?'tx-received':'')} ${tx.nativeTransfers?.find(t=>t.fromUserAccount===walletAddress)?'tx-sent':(tx.nativeTransfers?.find(t=>t.toUserAccount===walletAddress)?'tx-received':'')}">${mainValue}</td>
                            <td><i class="fab fa-solana sol-icon-small"></i> ${fee} SOL</td>
                            <td title="${tx.type}">${program}</td>
                        `;
                         // Guardar datos completos en el elemento TR
                         tr.dataset.txData = JSON.stringify(tx);
                        transactionsTableBody.appendChild(tr);
                    });
                } else {
                    transactionsTableBody.innerHTML = '<tr><td colspan="9" style="text-align:center;">No se encontraron transacciones recientes.</td></tr>';
                }
            } else {
                console.error("Error fetching transactions:", transactionsResponse.status, await transactionsResponse.text());
                transactionsTableBody.innerHTML = '<tr><td colspan="9" style="text-align:center;">Error al cargar transacciones.</td></tr>';
            }

            // Ocultar indicador de carga al finalizar
            hideElement(trackerLoading);

        } catch (error) {
            console.error("Error general al rastrear la billetera:", error);
            trackerError.textContent = `Error inesperado: ${error.message}. Intenta de nuevo.`;
            showElement(trackerError);
            hideElement(trackerLoading);
            resetWalletTrackerVisuals(); // Limpia si falla gravemente
        }
    };


    // --- Inicialización ---
     const homeSection = document.getElementById('home');
     const homeMenuItemLink = document.querySelector('.sidebar .menu-item a[data-section="home"]');
     sections.forEach(s => s.classList.remove('active'));
     menuLinks.forEach(l => l.classList.remove('active-menu'));
     if (homeSection) homeSection.classList.add('active');
     if (homeMenuItemLink) homeMenuItemLink.classList.add('active-menu');
     applyLanguage(document.documentElement.lang || 'es');

}); // Fin de DOMContentLoaded
