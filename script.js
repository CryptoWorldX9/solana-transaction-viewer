// script.js - Implementando API Helius y Sidebar Colapsable (Corregido v3)

document.addEventListener('DOMContentLoaded', () => {

    // --- Clave API y Endpoints (¡¡ADVERTENCIA DE SEGURIDAD!!) ---
    const HELIUS_API_KEY = '6fbed4b2-ce46-4c7d-b827-2c1d5a539ff2';
    // ------------------------------------------------------------------
    const HELIUS_RPC_URL = `https://rpc.helius.xyz/?api-key=${HELIUS_API_KEY}`;
    const HELIUS_API_BASE = `https://api.helius.xyz/v0`;

    const connection = new solanaWeb3.Connection(HELIUS_RPC_URL);
    const LAMPORTS_PER_SOL = solanaWeb3.LAMPORTS_PER_SOL;

    // --- Selección de Elementos DOM Generales ---
    const body = document.body;
    const sidebar = document.getElementById('sidebar');
    const contentWrapper = document.getElementById('content-wrapper'); // Wrapper
    const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
    const menuLinks = document.querySelectorAll('.sidebar .menu-item a');
    const sections = document.querySelectorAll('.main-content > section');
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
    const trackerWalletInput = document.getElementById('solana-wallet-address-input');
    const trackWalletButton = document.getElementById('track-wallet-button');
    const trackerLoading = document.getElementById('tracker-loading');
    const trackerError = document.getElementById('tracker-error');
    const displayWalletAddress = document.getElementById('display-wallet-address');
    const copyAddressButton = walletTrackerSection?.querySelector('.account-info .copy-button');
    const qrCodeButton = walletTrackerSection?.querySelector('.qr-button');
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
    const addNoteLink = document.getElementById('add-note-link');
    const addNoteForm = document.getElementById('add-note-form');
    const privateNoteInput = document.getElementById('private-note-input');
    const saveNoteButton = document.getElementById('save-note-button');
    const cancelNoteButton = document.getElementById('cancel-note-button');
    const privateNoteDisplay = document.getElementById('private-note-display');
    const transactionsTableBody = document.getElementById('transaction-list-body');
    const itemsPerPageSelector = document.getElementById('items-per-page');

    // --- Lógica Sidebar Colapsable (CORREGIDA v3) ---
    const collapseSidebar = () => {
        // Solo colapsar si no estamos en móvil y si no está ya colapsado
        if (window.innerWidth > 768 && !body.classList.contains('sidebar-collapsed')) {
            body.classList.add('sidebar-collapsed');
            console.log("Sidebar collapsed");
        }
    };

    const expandSidebar = () => {
        // Solo expandir si está colapsado
        if (body.classList.contains('sidebar-collapsed')) {
            body.classList.remove('sidebar-collapsed');
            console.log("Sidebar expanded");
        }
    };

    const toggleSidebar = () => {
         // Solo permitir toggle en pantallas grandes
         if (window.innerWidth > 768) {
            body.classList.toggle('sidebar-collapsed');
            console.log("Sidebar toggled via button");
         }
    };

    // Colapsar al hacer clic en un item del menú
    menuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); // Prevenir navegación default del link

            const targetSectionId = link.getAttribute('data-section');
            const targetSection = document.getElementById(targetSectionId);

            if (targetSection) {
                // Mostrar sección correcta y actualizar menú activo
                sections.forEach(s => s.classList.remove('active'));
                targetSection.classList.add('active');
                menuLinks.forEach(l => l.classList.remove('active-menu'));
                link.classList.add('active-menu');

                // Colapsar sidebar (solo en escritorio)
                collapseSidebar();

                // Resetear tracker si se navega a él
                if(targetSectionId === 'wallet-tracker') {
                    resetWalletTrackerVisuals();
                }
            }
        });
    });

    // Expandir al hacer clic en el sidebar (cuando está colapsado)
    sidebar?.addEventListener('click', () => {
        // Verificar si está colapsado ANTES de expandir
        if (body.classList.contains('sidebar-collapsed')) {
            expandSidebar();
        }
    });

    // Botón de toggle explícito (opcional)
    sidebarToggleBtn?.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevenir que el listener del sidebar interfiera
        toggleSidebar();
    });


    // --- Lógica Modales (Sin cambios) ---
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
        if (event.target.classList.contains('modal')) closeModal(event.target);
    });

    // --- Lógica Idioma (Placeholder) ---
    const applyLanguage = (lang) => {
        console.log(`Idioma cambiado a: ${lang}`);
        document.documentElement.lang = lang;
        // TODO: Lógica de traducción real
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
        const existingFeedback = buttonElement.parentNode.querySelector('.copied-feedback');
        if(existingFeedback) existingFeedback.remove();
        const feedback = document.createElement('span');
        feedback.textContent = 'Copiado!';
        feedback.className = 'copied-feedback';
        buttonElement.parentNode.insertBefore(feedback, buttonElement.nextSibling);
        void feedback.offsetWidth; // Force reflow
        setTimeout(() => { feedback.classList.add('show'); }, 10);
        setTimeout(() => {
            feedback.style.opacity = '0';
            setTimeout(() => feedback.remove(), 500);
        }, 1500);
    };

    const copyToClipboard = (text, buttonElement) => {
        if (!text || text === '-' || text.includes('...')) return;
        navigator.clipboard.writeText(text).then(() => {
            showCopyFeedback(buttonElement);
        }).catch(err => {
            console.error('Error al copiar: ', err); alert("Error al copiar.");
        });
    };

    // Resetea la interfaz visual del tracker
    const resetWalletTrackerVisuals = () => {
        if (!walletTrackerSection) return;
        displayWalletAddress.textContent = 'Introduce una dirección...';
        displayWalletAddress.title = 'Dirección Completa';
        displayWalletAddress.removeAttribute('data-full-address');
        solBalanceValue.textContent = '-';
        solBalanceUsd.textContent = '$ -.--';
        tokenCount.textContent = '- Tokens';
        ownerAddress.textContent = '-';
        ownerAddress.title = 'Dirección Dueño';
        ownerAddress.removeAttribute('data-full-address');
        onCurveStatus.textContent = '-';
        stakeAmount.textContent = '-';
        tagsDisplay.innerHTML = '<small>(No implementado)</small>';
        tokenListDetailed.innerHTML = '<li>Introduce una dirección y rastrea.</li>';
        transactionsTableBody.innerHTML = '<tr><td colspan="9" style="text-align:center;">Introduce una dirección y haz clic en Rastrear.</td></tr>';
        privateNoteDisplay.innerHTML = '';
        privateNoteInput.value = '';
        addNoteForm?.classList.add('hidden');
        addNoteLink?.classList.remove('hidden');
        tokenDropdownDetails?.removeAttribute('open');
        hideElement(trackerLoading);
        hideElement(trackerError);
    };

    // --- Event Listeners para Wallet Tracker ---

    // Input y Botón específicos del Tracker
    trackWalletButton?.addEventListener('click', () => {
        const address = trackerWalletInput?.value.trim();
        if (address) {
            trackWallet(address);
        } else {
            alert("Por favor, introduce una dirección de billetera de Solana.");
            trackerWalletInput?.focus();
        }
    });
    trackerWalletInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); trackWalletButton.click(); }
    });

    // Botones Copiar
    copyAddressButton?.addEventListener('click', (e) => {
         e.stopPropagation();
        const address = displayWalletAddress.dataset.fullAddress;
        if (address) copyToClipboard(address, copyAddressButton);
    });
    copyOwnerAddressButton?.addEventListener('click', (e) => {
         e.stopPropagation();
        const address = ownerAddress.dataset.fullAddress;
        if (address) copyToClipboard(address, copyOwnerAddressButton);
    });

    // Botón Código QR (funcionalidad pendiente)
    qrCodeButton?.addEventListener('click', (e) => {
         e.stopPropagation();
        const address = displayWalletAddress.dataset.fullAddress;
        if (address) alert(`Mostrar código QR para: ${address} (funcionalidad pendiente)`);
    });

    // Notas Privadas
    addNoteLink?.addEventListener('click', (e) => {
        e.preventDefault(); e.stopPropagation();
        addNoteForm?.classList.remove('hidden');
        addNoteLink.classList.add('hidden');
        privateNoteInput?.focus();
    });
    cancelNoteButton?.addEventListener('click', (e) => {
        e.stopPropagation();
        addNoteForm?.classList.add('hidden');
        addNoteLink?.classList.remove('hidden');
        privateNoteInput.value = '';
    });
    saveNoteButton?.addEventListener('click', (e) => {
         e.stopPropagation();
        const noteText = privateNoteInput?.value.trim();
        if (noteText) {
            // TODO: Guardado persistente
            const noteElement = document.createElement('a');
            noteElement.href = '#';
            noteElement.textContent = noteText.substring(0, 30) + (noteText.length > 30 ? '...' : '');
            noteElement.title = noteText;
            noteElement.classList.add('private-note-link');
            noteElement.addEventListener('click', (ev) => {ev.preventDefault();ev.stopPropagation(); alert(`Nota guardada:\n\n${noteText}`);});
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
            e.stopPropagation();
            const row = targetButton.closest('tr');
            const txDataString = row?.dataset.txData;
            if (txDataString) {
                 try {
                     const txData = JSON.parse(txDataString);
                     alert(`Mostrar detalles para firma: ${txData.signature} (funcionalidad pendiente)\nDatos:\n${JSON.stringify(txData, null, 2)}`);
                     // TODO: Mostrar en modal
                 } catch (jsonError) { console.error("Error parsing transaction data:", jsonError); alert("Error al leer los datos."); }
            }
        }
    });

    // Selector de Items por Página
    itemsPerPageSelector?.addEventListener('change', () => {
        const currentAddress = trackerWalletInput?.value.trim();
        if (currentAddress) trackWallet(currentAddress); // Recargar con nuevo límite
    });

     // Link Creador de Tokens Tag (funcionalidad pendiente)
     document.body.addEventListener('click', (e) => {
        if (e.target.matches('#token-creator-tag')) {
            e.preventDefault(); e.stopPropagation();
            alert('Mostrar tokens creados (funcionalidad pendiente)');
        }
     });


    // --- Función Principal de Rastreo con API Helius ---
    const trackWallet = async (walletAddress) => {
        if (!walletAddress) return;
        console.log(`Iniciando rastreo para: ${walletAddress}`);
        resetWalletTrackerVisuals();
        showElement(trackerLoading); hideElement(trackerError);

        let publicKey;
        try { publicKey = new solanaWeb3.PublicKey(walletAddress); }
        catch (error) {
            trackerError.textContent = "Dirección de billetera inválida.";
            showElement(trackerError); hideElement(trackerLoading);
            displayWalletAddress.textContent = 'Dirección Inválida';
            return;
        }

        const shortAddress = `${walletAddress.substring(0, 4)}...${walletAddress.substring(walletAddress.length - 4)}`;
        displayWalletAddress.textContent = shortAddress;
        displayWalletAddress.title = walletAddress;
        displayWalletAddress.dataset.fullAddress = walletAddress;

        const apiUrl = `${HELIUS_API_BASE}addresses/${walletAddress}`;
        const itemsPerPage = parseInt(itemsPerPageSelector?.value || '10', 10);

        await new Promise(resolve => setTimeout(resolve, 300)); // Delay visual

        try {
            const [balanceResult, accountInfoResult, transactionsResult] = await Promise.allSettled([
                fetch(`${apiUrl}/balances?api-key=${HELIUS_API_KEY}`),
                connection.getAccountInfo(publicKey),
                fetch(`${apiUrl}/transactions?api-key=${HELIUS_API_KEY}&limit=${itemsPerPage}`)
            ]);

            // Procesar Balances
            if (balanceResult.status === 'fulfilled' && balanceResult.value.ok) {
                const balanceData = await balanceResult.value.json();
                solBalanceValue.textContent = (balanceData.nativeBalance / LAMPORTS_PER_SOL).toFixed(4);
                solBalanceUsd.textContent = balanceData.usdValue ? `$ ${balanceData.usdValue.toFixed(2)}` : '$ -.--';
                tokenCount.textContent = `${balanceData.tokens.length} Tokens`;
                tokenListDetailed.innerHTML = '';
                let tokensDisplayed = 0;
                if (balanceData.tokens.length > 0) {
                    balanceData.tokens.forEach(token => {
                        if (token.amount > 0) {
                            tokensDisplayed++;
                            const li = document.createElement('li');
                            const iconSrc = `https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/${token.mint}/logo.png`;
                            li.innerHTML = `
                                <img src="${iconSrc}" alt="${token.symbol || 'TKN'}" class="token-icon" onerror="this.src='https://via.placeholder.com/20/333/ccc?text=?'; this.onerror=null;">
                                <span class="token-name" title="${token.mint}">${token.symbol || token.mint.substring(0,6)} (${token.name || 'Nombre Desc.'})</span>
                                <span class="token-amount">${(token.amount / Math.pow(10, token.decimals)).toLocaleString(undefined, {maximumFractionDigits: token.decimals})}</span>
                            `;
                            tokenListDetailed.appendChild(li);
                        }
                    });
                }
                if (tokensDisplayed === 0) tokenListDetailed.innerHTML = '<li>No se encontraron tokens con saldo.</li>';
            } else { /* Manejar error balance */
                 console.error("Error fetching balances:", balanceResult.reason || balanceResult.value?.status);
                 solBalanceValue.textContent = 'Error'; solBalanceUsd.textContent = 'Error';
                 tokenCount.textContent = 'Error'; tokenListDetailed.innerHTML = '<li>Error al cargar tokens.</li>';
            }

            // Procesar Info Cuenta
            if (accountInfoResult.status === 'fulfilled' && accountInfoResult.value) {
                 const accountInfoData = accountInfoResult.value;
                 const ownerPk = accountInfoData.owner.toBase58();
                 ownerAddress.textContent = `${ownerPk.substring(0, 5)}...${ownerPk.substring(ownerPk.length - 5)}`;
                 ownerAddress.title = ownerPk; ownerAddress.dataset.fullAddress = ownerPk;
                 onCurveStatus.textContent = !accountInfoData.executable ? 'Verdadero' : 'Falso (Programa)';
            } else { /* Manejar error info cuenta */
                  console.warn("Error fetching account info:", accountInfoResult.reason || "Account not found");
                  ownerAddress.textContent = 'Error/No encontrado'; onCurveStatus.textContent = 'Error/No encontrado';
            }
            // Stake y Tags no implementados
            stakeAmount.textContent = '-'; tagsDisplay.innerHTML = '<small>(No implementado)</small>';

            // Procesar Transacciones
            if (transactionsResult.status === 'fulfilled' && transactionsResult.value.ok) {
                const transactionsData = await transactionsResult.value.json();
                transactionsTableBody.innerHTML = '';
                if (Array.isArray(transactionsData) && transactionsData.length > 0) {
                    transactionsData.forEach(tx => {
                         const tr = document.createElement('tr');
                         const date = tx.timestamp ? new Date(tx.timestamp * 1000).toLocaleString('sv-SE') : '-';
                         const signatureShort = `${tx.signature.substring(0, 4)}...${tx.signature.substring(tx.signature.length - 4)}`;
                         const fee = tx.fee ? (tx.fee / LAMPORTS_PER_SOL).toFixed(9) : '0';
                         let source = tx.source || 'Desconocido';
                         let program = tx.type || 'Desconocido';
                         if(tx.events?.nft?.source) source = tx.events.nft.source;
                         if (tx.type === 'UNKNOWN' && tx.instructions?.length > 0) program = tx.instructions[0].programId?.substring(0, 10) + '...' || program;
                        let mainValue = '---'; let valueClass = '';
                        const nativeTransfer = tx.nativeTransfers?.find(t => t.fromUserAccount === walletAddress || t.toUserAccount === walletAddress);
                        const tokenTransfer = tx.tokenTransfers?.find(t => t.fromUserAccount === walletAddress || t.toUserAccount === walletAddress);
                         if (nativeTransfer) {
                             const amount = (nativeTransfer.amount / LAMPORTS_PER_SOL).toFixed(4);
                             const prefix = nativeTransfer.fromUserAccount === walletAddress ? '-' : '+';
                             mainValue = `<i class="fab fa-solana sol-icon-small"></i> ${prefix} ${amount} SOL`;
                             valueClass = nativeTransfer.fromUserAccount === walletAddress ? 'tx-sent' : 'tx-received';
                         } else if (tokenTransfer) {
                             const amount = tokenTransfer.tokenAmount.toLocaleString(undefined, { maximumFractionDigits: tokenTransfer.tokenDecimals || 2 });
                             const symbol = tokenTransfer.tokenSymbol || tokenTransfer.mint?.substring(0,4) || '?';
                             const prefix = tokenTransfer.fromUserAccount === walletAddress ? '-' : '+';
                             mainValue = `${prefix} ${amount} ${symbol}`;
                              valueClass = tokenTransfer.fromUserAccount === walletAddress ? 'tx-sent' : 'tx-received';
                         }
                          const formattedType = program.replace(/([A-Z])/g, ' $1').trim().split(/[\s_]+/).map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
                        tr.innerHTML = `
                            <td><button class="icon-button view-details-button" title="Ver detalles"><i class="fas fa-eye"></i></button></td>
                            <td><span class="tx-signature" title="${tx.signature}">${signatureShort}</span></td>
                            <td>${tx.slot || '-'}</td>
                            <td>${date}</td>
                            <td>${tx.instructions?.length || '-'}</td>
                            <td>${source}</td>
                            <td class="${valueClass}">${mainValue}</td>
                            <td><i class="fab fa-solana sol-icon-small"></i> ${fee} SOL</td>
                            <td title="${tx.type}">${formattedType}</td>
                        `;
                        tr.dataset.txData = JSON.stringify(tx);
                        transactionsTableBody.appendChild(tr);
                    });
                } else {
                    transactionsTableBody.innerHTML = '<tr><td colspan="9" style="text-align:center;">No se encontraron transacciones recientes.</td></tr>';
                }
            } else { /* Manejar error transacciones */
                 console.error("Error fetching transactions:", transactionsResult.reason || transactionsResult.value.status);
                 transactionsTableBody.innerHTML = '<tr><td colspan="9" style="text-align:center;">Error al cargar transacciones.</td></tr>';
            }

            hideElement(trackerLoading);

        } catch (error) { // Catch errores inesperados
            console.error("Error general al procesar datos de la billetera:", error);
            trackerError.textContent = `Error inesperado: ${error.message}. Intenta de nuevo.`;
            showElement(trackerError);
            hideElement(trackerLoading);
            resetWalletTrackerVisuals();
            displayWalletAddress.textContent = 'Error';
        }
    };


    // --- Inicialización General ---
     const homeSection = document.getElementById('home');
     const homeMenuItemLink = document.querySelector('.sidebar .menu-item a[data-section="home"]');
     sections.forEach(s => s.classList.remove('active'));
     menuLinks.forEach(l => l.classList.remove('active-menu'));
     if (homeSection) homeSection.classList.add('active');
     if (homeMenuItemLink) homeMenuItemLink.classList.add('active-menu');
     applyLanguage(document.documentElement.lang || 'es');
     body.classList.remove('sidebar-collapsed'); // Estado inicial: expandido

}); // Fin de DOMContentLoaded
