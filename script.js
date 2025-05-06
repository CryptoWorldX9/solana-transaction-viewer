// script.js - Incluye placeholders y listener para Analizador de Sentimientos

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
    const contentWrapper = document.getElementById('content-wrapper');
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

    // --- Selección de Elementos DOM para Analizador de Sentimientos ---
    const sentimentTokenInput = document.getElementById('sentiment-token-input');
    const sentimentSearchButton = document.getElementById('sentiment-search-button');
    const sentimentTokenCa = document.getElementById('sentiment-token-ca');
    const sentimentTokenValue = document.getElementById('sentiment-token-value');
    const sentimentPriceCurrent = document.getElementById('sentiment-price-current');
    const sentimentVol6h = document.getElementById('sentiment-vol-6h');
    const sentimentVol12h = document.getElementById('sentiment-vol-12h');
    const sentimentVol24h = document.getElementById('sentiment-vol-24h');
    const sentimentPercentageValue = document.getElementById('sentiment-percentage-value');
    const sentimentLevel = document.getElementById('sentiment-level');
    const sentimentGaugeArrow = document.getElementById('sentiment-gauge-arrow');
    const dexscreenerChart = document.getElementById('dexscreener-chart');
    const twitterFeed = document.getElementById('twitter-feed');

    // --- Lógica Sidebar Colapsable (Sin Cambios) ---
    const collapseSidebar = () => { if (window.innerWidth > 768 && !body.classList.contains('sidebar-collapsed')) body.classList.add('sidebar-collapsed'); };
    const expandSidebar = () => { if (body.classList.contains('sidebar-collapsed')) body.classList.remove('sidebar-collapsed'); };
    menuLinks.forEach(link => { link.addEventListener('click', (e) => { e.preventDefault(); const targetId=link.dataset.section; const targetEl=document.getElementById(targetId); if(targetEl){ sections.forEach(s=>s.classList.remove('active')); targetEl.classList.add('active'); menuLinks.forEach(l=>l.classList.remove('active-menu')); link.classList.add('active-menu'); collapseSidebar(); if(targetId==='wallet-tracker')resetWalletTrackerVisuals(); if(targetId === 'sentiment-analyzer') resetSentimentAnalyzerVisuals();} }); });
    sidebar?.addEventListener('click', () => { if (body.classList.contains('sidebar-collapsed')) expandSidebar(); });

    // --- Lógica Modales (Sin Cambios) ---
    const openModal = (modal) => { if (modal) modal.style.display = 'block'; };
    const closeModal = (modal) => { if (modal) modal.style.display = 'none'; };
    searchIcon?.addEventListener('click', () => openModal(searchModal));
    walletIcon?.addEventListener('click', () => openModal(walletModal));
    userIcon?.addEventListener('click', () => openModal(userModal));
    closeButtons.forEach(button => { button.addEventListener('click', () => { const modal = button.closest('.modal'); if (modal) closeModal(modal); }); });
    window.addEventListener('click', (event) => { if (event.target.classList.contains('modal')) closeModal(event.target); });

    // --- Lógica Idioma (Placeholder) ---
    const applyLanguage = (lang) => { console.log(`Idioma cambiado a: ${lang}`); document.documentElement.lang = lang; /* TODO */ };
    languageOptions?.forEach(option => { option.addEventListener('click', () => applyLanguage(option.getAttribute('data-lang'))); });

    // --- Funciones Auxiliares Comunes ---
    const showElement = (el) => { if(el) el.classList.remove('hidden'); };
    const hideElement = (el) => { if(el) el.classList.add('hidden'); };
    const showCopyFeedback = (buttonElement) => { /* ... (igual que antes) ... */
        const existingFeedback = buttonElement.parentNode.querySelector('.copied-feedback'); if(existingFeedback) existingFeedback.remove();
        const feedback = document.createElement('span'); feedback.textContent = 'Copiado!'; feedback.className = 'copied-feedback';
        buttonElement.parentNode.insertBefore(feedback, buttonElement.nextSibling); void feedback.offsetWidth;
        setTimeout(() => { feedback.classList.add('show'); }, 10);
        setTimeout(() => { feedback.style.opacity = '0'; setTimeout(() => feedback.remove(), 500); }, 1500);
    };
    const copyToClipboard = (text, buttonElement) => { /* ... (igual que antes) ... */
        if (!text || text === '-' || text.includes('...') || text.includes('Introduce una dirección')) return; // Añadido chequeo extra
        navigator.clipboard.writeText(text).then(() => showCopyFeedback(buttonElement))
        .catch(err => { console.error('Error al copiar: ', err); alert("Error al copiar."); });
    };

    // ======================================================
    // ========= LÓGICA ANALIZADOR DE SENTIMIENTOS ==========
    // ======================================================
    const resetSentimentAnalyzerVisuals = () => {
        if (!sentimentTokenInput) return;
        sentimentTokenInput.value = '';
        sentimentTokenCa.textContent = 'Introduce CA...';
        sentimentTokenCa.title = 'Dirección Completa del Token';
        sentimentTokenValue.textContent = '- USD';
        sentimentPriceCurrent.textContent = '-';
        sentimentVol6h.textContent = '-';
        sentimentVol12h.textContent = '-';
        sentimentVol24h.textContent = '-';
        sentimentPercentageValue.textContent = '-';
        sentimentLevel.textContent = 'Neutral';
        if (sentimentGaugeArrow) sentimentGaugeArrow.style.setProperty('--rotation', '90deg'); // Neutral
        if (dexscreenerChart) dexscreenerChart.innerHTML = '<p>Introduce una dirección de token para ver el gráfico.</p>';
        if (twitterFeed) twitterFeed.innerHTML = '<p>Introduce una dirección de token para ver comentarios.</p>';
        // Ocultar mensajes si los hubiera
        // hideElement(sentimentLoading);
        // hideElement(sentimentError);
    };

    const searchTokenSentiment = async () => {
        const tokenAddress = sentimentTokenInput?.value.trim();
        if (!tokenAddress) {
            alert("Introduce la dirección del contrato (CA) del token.");
            return;
        }
        console.log(`Buscando sentimiento para: ${tokenAddress}`);
        resetSentimentAnalyzerVisuals(); // Limpiar antes de buscar
        // TODO: showElement(sentimentLoading); // Mostrar carga si existe
        // TODO: hideElement(sentimentError);

        // --- Placeholder para llamadas API ---
        try {
            // Simulación - Reemplazar con llamadas API reales
            await new Promise(resolve => setTimeout(resolve, 500)); // Simular carga

            // 1. Info Token
            const tokenInfo = { ca: tokenAddress, value: (Math.random() * 0.01).toFixed(6) }; // Simulado
            sentimentTokenCa.textContent = `${tokenInfo.ca.substring(0, 6)}...${tokenInfo.ca.substring(tokenInfo.ca.length - 6)}`;
            sentimentTokenCa.title = tokenInfo.ca;
            sentimentTokenValue.textContent = `${tokenInfo.value} USD`;

            // 2. Precio y Volumen
            const priceData = { current: parseFloat(tokenInfo.value), vol6h: Math.floor(Math.random() * 2000000) + 500000, vol12h: Math.floor(Math.random() * 4000000) + 1000000, vol24h: Math.floor(Math.random() * 8000000) + 2000000 };
            sentimentPriceCurrent.textContent = `$${priceData.current.toFixed(6)}`;
            sentimentVol6h.textContent = `$${priceData.vol6h.toLocaleString()}`;
            sentimentVol12h.textContent = `$${priceData.vol12h.toLocaleString()}`;
            sentimentVol24h.textContent = `$${priceData.vol24h.toLocaleString()}`;

            // 3. Sentimiento y Tweets
            const sentimentData = { percentage: Math.floor(Math.random() * 101), tweets: [ /* ... (datos simulados como antes) ... */
                { user: '@criptoFan', text: `Creo que ${tokenAddress.substring(0,4)} tiene futuro! HOLD! 💎`, sentiment: 'positive', time: '1min'},
                { user: '@miedoMax', text: `Uff, ${tokenAddress.substring(0,4)} está cayendo mucho... no sé qué hacer.`, sentiment: 'negative', time: '8min'},
            ]};
            sentimentPercentageValue.textContent = sentimentData.percentage;
            let level = 'Moderado'; let rotation = 90;
            if (sentimentData.percentage <= 25) { level = 'Miedo Extremo'; rotation = (sentimentData.percentage / 25) * 45; }
            else if (sentimentData.percentage <= 50) { level = 'Miedo'; rotation = 45 + ((sentimentData.percentage - 25) / 25) * 45; }
            else if (sentimentData.percentage <= 75) { level = 'Codicia'; rotation = 90 + ((sentimentData.percentage - 50) / 25) * 45; }
            else { level = 'Euforia'; rotation = 135 + ((sentimentData.percentage - 75) / 25) * 45; }
            sentimentLevel.textContent = level;
            if (sentimentGaugeArrow) sentimentGaugeArrow.style.setProperty('--rotation', `${rotation}deg`);

            // Poblar Tweets
            if (twitterFeed) {
                twitterFeed.innerHTML = '';
                if (sentimentData.tweets.length > 0) {
                    sentimentData.tweets.forEach(tweet => {
                        const tweetDiv = document.createElement('div');
                        tweetDiv.classList.add('tweet-item', tweet.sentiment);
                        tweetDiv.innerHTML = `<p><strong>${tweet.user}:</strong> ${tweet.text}</p><small>hace ${tweet.time}</small>`;
                        twitterFeed.appendChild(tweetDiv);
                    });
                } else { twitterFeed.innerHTML = '<p>No se encontraron comentarios recientes.</p>'; }
            }

            // 4. Cargar gráfico Dexscreener
            if (dexscreenerChart) {
                // TODO: Obtener la dirección del PAR (pair address) si es posible, si no, usar la del token puede funcionar a veces.
                const dexscreenerUrl = `https://dexscreener.com/solana/${tokenAddress}?embed=1&theme=dark&info=0`;
                dexscreenerChart.innerHTML = `<iframe src="${dexscreenerUrl}" loading="lazy"></iframe>`;
            }

            // hideElement(sentimentLoading); // Ocultar carga

        } catch (error) {
            console.error("Error buscando sentimiento:", error);
            // showElement(sentimentError); // Mostrar error si existe
            // hideElement(sentimentLoading);
            alert("Error al buscar datos del token.");
            resetSentimentAnalyzerVisuals(); // Resetear en caso de error
        }
    };

    // Listener para el botón de búsqueda de sentimiento
    sentimentSearchButton?.addEventListener('click', searchTokenSentiment);
    sentimentTokenInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); sentimentSearchButton.click(); }
    });


    // ======================================================
    // ========= LÓGICA WALLET TRACKER (EXISTENTE) ==========
    // ======================================================
    const resetWalletTrackerVisuals = () => { /* ... (igual que antes) ... */
        if (!walletTrackerSection) return; displayWalletAddress.textContent = 'Introduce una dirección...'; displayWalletAddress.title = 'Dirección Completa';
        displayWalletAddress.removeAttribute('data-full-address'); solBalanceValue.textContent = '-'; solBalanceUsd.textContent = '$ -.--'; tokenCount.textContent = '- Tokens'; ownerAddress.textContent = '-';
        ownerAddress.title = 'Dirección Dueño'; ownerAddress.removeAttribute('data-full-address'); onCurveStatus.textContent = '-'; stakeAmount.textContent = '-'; tagsDisplay.innerHTML = '<small>(No implementado)</small>';
        tokenListDetailed.innerHTML = '<li>Introduce una dirección y rastrea.</li>'; transactionsTableBody.innerHTML = '<tr><td colspan="9" style="text-align:center;">Introduce una dirección y haz clic en Rastrear.</td></tr>';
        privateNoteDisplay.innerHTML = ''; privateNoteInput.value = ''; addNoteForm?.classList.add('hidden'); addNoteLink?.classList.remove('hidden'); tokenDropdownDetails?.removeAttribute('open');
        hideElement(trackerLoading); hideElement(trackerError);
    };
    trackWalletButton?.addEventListener('click', () => { const address = trackerWalletInput?.value.trim(); if (address) trackWallet(address); else { alert("Dir. Solana?"); trackerWalletInput?.focus();} });
    trackerWalletInput?.addEventListener('keypress', (e) => { if (e.key === 'Enter') { e.preventDefault(); trackWalletButton.click(); }});
    copyAddressButton?.addEventListener('click', (e) => { e.stopPropagation(); const address = displayWalletAddress.dataset.fullAddress; if (address) copyToClipboard(address, copyAddressButton); });
    copyOwnerAddressButton?.addEventListener('click', (e) => { e.stopPropagation(); const address = ownerAddress.dataset.fullAddress; if (address) copyToClipboard(address, copyOwnerAddressButton); });
    qrCodeButton?.addEventListener('click', (e) => { e.stopPropagation(); const address = displayWalletAddress.dataset.fullAddress; if (address) alert(`QR para: ${address} (pendiente)`);});
    addNoteLink?.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); addNoteForm?.classList.remove('hidden'); addNoteLink.classList.add('hidden'); privateNoteInput?.focus(); });
    cancelNoteButton?.addEventListener('click', (e) => { e.stopPropagation(); addNoteForm?.classList.add('hidden'); addNoteLink?.classList.remove('hidden'); privateNoteInput.value = ''; });
    saveNoteButton?.addEventListener('click', (e) => { e.stopPropagation(); const noteText = privateNoteInput?.value.trim(); if (noteText) { const noteElement = document.createElement('a'); noteElement.href = '#'; noteElement.textContent = noteText.substring(0, 30) + (noteText.length > 30 ? '...' : ''); noteElement.title = noteText; noteElement.classList.add('private-note-link'); noteElement.addEventListener('click', (ev) => {ev.preventDefault();ev.stopPropagation(); alert(`Nota:\n\n${noteText}`);}); privateNoteDisplay?.appendChild(noteElement); privateNoteInput.value = ''; addNoteForm?.classList.add('hidden'); addNoteLink?.classList.remove('hidden'); }});
    transactionsTableBody?.addEventListener('click', (e) => { const btn = e.target.closest('.view-details-button'); if (btn) { e.stopPropagation(); const row = btn.closest('tr'); const data = row?.dataset.txData; if(data) { try { const tx = JSON.parse(data); alert(`Detalles TX: ${tx.signature}\n(pendiente)\n${JSON.stringify(tx, null, 2)}`); } catch(err){ alert('Error datos TX');}} }});
    itemsPerPageSelector?.addEventListener('change', () => { const addr = trackerWalletInput?.value.trim(); if (addr) trackWallet(addr); });
     document.body.addEventListener('click', (e) => { if (e.target.matches('#token-creator-tag')) { e.preventDefault(); e.stopPropagation(); alert('Mostrar tokens creados (pendiente)'); } });

    const trackWallet = async (walletAddress) => { /* ... (Función API Wallet Tracker igual que antes) ... */
        if (!walletAddress) return; console.log(`Rastreando: ${walletAddress}`);
        resetWalletTrackerVisuals(); showElement(trackerLoading); hideElement(trackerError);
        let publicKey; try { publicKey = new solanaWeb3.PublicKey(walletAddress); } catch (error) { trackerError.textContent = "Dirección inválida."; showElement(trackerError); hideElement(trackerLoading); displayWalletAddress.textContent = 'Inválida'; return; }
        const shortAddress = `${walletAddress.substring(0, 4)}...${walletAddress.substring(walletAddress.length - 4)}`;
        displayWalletAddress.textContent = shortAddress; displayWalletAddress.title = walletAddress; displayWalletAddress.dataset.fullAddress = walletAddress;
        const apiUrl = `${HELIUS_API_BASE}addresses/${walletAddress}`; const itemsPerPage = parseInt(itemsPerPageSelector?.value || '10', 10);
        await new Promise(resolve => setTimeout(resolve, 300)); // Delay

        try {
            const [balanceResult, accountInfoResult, transactionsResult] = await Promise.allSettled([ /* ... */
                fetch(`${apiUrl}/balances?api-key=${HELIUS_API_KEY}`),
                connection.getAccountInfo(publicKey),
                fetch(`${apiUrl}/transactions?api-key=${HELIUS_API_KEY}&limit=${itemsPerPage}`)
            ]);

            // Procesar Balances
            if (balanceResult.status === 'fulfilled' && balanceResult.value.ok) { const d=await balanceResult.value.json(); solBalanceValue.textContent=(d.nativeBalance/LAMPORTS_PER_SOL).toFixed(4); solBalanceUsd.textContent=d.usdValue?`$ ${d.usdValue.toFixed(2)}`:'$ -.--'; tokenCount.textContent=`${d.tokens.length} Tokens`; tokenListDetailed.innerHTML=''; let n=0; if(d.tokens.length>0){ d.tokens.forEach(t=>{ if(t.amount>0){ n++; const li=document.createElement('li'); const i=`https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/${t.mint}/logo.png`; li.innerHTML=`<img src="${i}" alt="${t.symbol||'TKN'}" class="token-icon" onerror="this.src='https://via.placeholder.com/20/333/ccc?text=?'; this.onerror=null;"><span class="token-name" title="${t.mint}">${t.symbol||t.mint.substring(0,6)} (${t.name||'Desc.'})</span><span class="token-amount">${(t.amount/Math.pow(10,t.decimals)).toLocaleString(undefined,{maximumFractionDigits:t.decimals})}</span>`; tokenListDetailed.appendChild(li); }}); } if(n===0) tokenListDetailed.innerHTML='<li>No tokens con saldo.</li>'; }
            else { console.error("Error balances:", balanceResult.reason||balanceResult.value?.status); solBalanceValue.textContent='Err'; solBalanceUsd.textContent='Err'; tokenCount.textContent='Err'; tokenListDetailed.innerHTML='<li>Error tokens.</li>'; }

            // Procesar Info Cuenta
            if (accountInfoResult.status === 'fulfilled' && accountInfoResult.value) { const d=accountInfoResult.value; const o=d.owner.toBase58(); ownerAddress.textContent=`${o.substring(0,5)}...${o.substring(o.length-5)}`; ownerAddress.title=o; ownerAddress.dataset.fullAddress=o; onCurveStatus.textContent=!d.executable?'Verdadero':'Falso (Prog)'; }
            else { console.warn("Error info cuenta:", accountInfoResult.reason||"No encontrada"); ownerAddress.textContent='Err/No Enc.'; onCurveStatus.textContent='Err/No Enc.'; }
            stakeAmount.textContent='-'; tagsDisplay.innerHTML='<small>(No imp.)</small>';

            // Procesar Transacciones
            if (transactionsResult.status === 'fulfilled' && transactionsResult.value.ok) { const d=await transactionsResult.value.json(); transactionsTableBody.innerHTML=''; if(Array.isArray(d) && d.length>0){ d.forEach(tx=>{ const tr=document.createElement('tr'); const date=tx.timestamp?new Date(tx.timestamp*1000).toLocaleString('sv-SE'):'-'; const sigS=`${tx.signature.substring(0,4)}...${tx.signature.substring(tx.signature.length-4)}`; const fee=tx.fee?(tx.fee/LAMPORTS_PER_SOL).toFixed(9):'0'; let src=tx.source||'Desc.'; let prog=tx.type||'Desc.'; if(tx.events?.nft?.source) src=tx.events.nft.source; if(tx.type==='UNKNOWN'&&tx.instructions?.length>0) prog=tx.instructions[0].programId?.substring(0,10)+'...'; let val='---'; let vCls=''; const nt=tx.nativeTransfers?.find(t=>t.fromUserAccount===walletAddress||t.toUserAccount===walletAddress); const tt=tx.tokenTransfers?.find(t=>t.fromUserAccount===walletAddress||t.toUserAccount===walletAddress); if(nt){ const a=(nt.amount/LAMPORTS_PER_SOL).toFixed(4); const p=nt.fromUserAccount===walletAddress?'-':'+'; val=`<i class="fab fa-solana sol-icon-small"></i> ${p} ${a} SOL`; vCls=nt.fromUserAccount===walletAddress?'tx-sent':'tx-received'; } else if(tt){ const a=tt.tokenAmount.toLocaleString(undefined,{maximumFractionDigits:tt.tokenDecimals||2}); const s=tt.tokenSymbol||tt.mint?.substring(0,4)||'?'; const p=tt.fromUserAccount===walletAddress?'-':'+'; val=`${p} ${a} ${s}`; vCls=tt.fromUserAccount===walletAddress?'tx-sent':'tx-received'; } const fType=prog.replace(/([A-Z])/g,' $1').trim().split(/[\s_]+/).map(w=>w.charAt(0).toUpperCase()+w.slice(1).toLowerCase()).join(' '); tr.innerHTML=`<td><button class="icon-button view-details-button" title="Ver detalles"><i class="fas fa-eye"></i></button></td><td><span class="tx-signature" title="${tx.signature}">${sigS}</span></td><td>${tx.slot||'-'}</td><td>${date}</td><td>${tx.instructions?.length||'-'}</td><td>${src}</td><td class="${vCls}">${val}</td><td><i class="fab fa-solana sol-icon-small"></i> ${fee} SOL</td><td title="${tx.type}">${fType}</td>`; tr.dataset.txData=JSON.stringify(tx); transactionsTableBody.appendChild(tr); }); } else { transactionsTableBody.innerHTML='<tr><td colspan="9" style="text-align:center;">No Txs recientes.</td></tr>'; } }
            else { console.error("Error Txs:", transactionsResult.reason||transactionsResult.value?.status); transactionsTableBody.innerHTML='<tr><td colspan="9" style="text-align:center;">Error Txs.</td></tr>'; }

            hideElement(trackerLoading);
        } catch (error) { /* ... (Manejo error general) ... */
             console.error("Error Gral Wallet:", error); trackerError.textContent=`Error: ${error.message}.`; showElement(trackerError); hideElement(trackerLoading); resetWalletTrackerVisuals(); displayWalletAddress.textContent='Error'; }
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
