// app.js - Lógica interactiva para el MVP del SIPES

// Estado de la aplicación
let participants = [];
let editingId = null;
let expectedPlayers = 25;
let unitPrice = 50.00;
let deliveryDate = '2026-10-15';

// --- Order Configuration (from diseno.html) ---
let orderConfig = {
    producto: 'conjunto',
    tela: 'winfresh',
    corte: 'estandar_varon',
    cuello: 'redondo',
    manga: 'corta',
    colorPrincipal: '#1E3A8A',
    colorSecundario: '#FBBF24',
    confArquero: '',
    notasTecnicas: '',
    opciones: {
        banderola: false,
        bandaCapitan: false,
        escudo: false,
        medias: false,
        personalizacionEspecial: ''
    },
    mockups: {
        principal: {
            delantera: null,
            espalda: null
        },
        arquero: {
            delantera: null,
            espalda: null
        }
    }
};

// Sincronización con LocalStorage
function loadParticipants() {
    const data = localStorage.getItem('sipes_participants');
    if (data) {
        participants = JSON.parse(data);
    } else {
        // Datos por defecto si está vacío
        participants = [
            { id: 1, playerName: "Juan Pérez", shirtName: "JUAN P.", shirtNumber: 10, size: "M", genderCut: "Hombre", productType: "conjunto", paymentStatus: "Pagado", exceptions: "" },
            { id: 2, playerName: "Carlos López", shirtName: "CARLOS", shirtNumber: 7, size: "L", genderCut: "Mujer", productType: "conjunto", paymentStatus: "Abonado", exceptions: "Mangas cortas" },
            { id: 3, playerName: "Andrés Silva", shirtName: "A. SILVA", shirtNumber: 9, size: "M", genderCut: "Hombre", productType: "camiseta", paymentStatus: "Pendiente", exceptions: "" },
        ];
        saveParticipantsToStore();
    }
    
    const expData = localStorage.getItem('sipes_expected');
    if (expData) {
        expectedPlayers = parseInt(expData);
    }

    const priceData = localStorage.getItem('sipes_unit_price');
    if (priceData) {
        unitPrice = parseFloat(priceData);
    }

    const dateData = localStorage.getItem('sipes_delivery_date');
    if (dateData) {
        deliveryDate = dateData;
    }
}

function saveParticipantsToStore() {
    localStorage.setItem('sipes_participants', JSON.stringify(participants));
    localStorage.setItem('sipes_expected', expectedPlayers.toString());
    localStorage.setItem('sipes_unit_price', unitPrice.toString());
    localStorage.setItem('sipes_delivery_date', deliveryDate);
}

function formatDateDisplay(isoDate) {
    if (!isoDate) return '-';
    try {
        const parts = isoDate.split('-');
        if (parts.length === 3) {
            const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic'];
            const day = parseInt(parts[2], 10);
            const monthIdx = parseInt(parts[1], 10) - 1;
            const year = parts[0];
            return `${day} ${months[monthIdx] || ''} ${year}`;
        }
    } catch(e) {}
    return isoDate;
}

// --- Order Config Functions ---
function loadOrderConfig() {
    const saved = localStorage.getItem('sipes_order_config');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            orderConfig = Object.assign(orderConfig, parsed);
            if (parsed.producto) orderConfig.producto = parsed.producto;
            if (parsed.opciones) orderConfig.opciones = Object.assign(orderConfig.opciones, parsed.opciones);
            if (parsed.mockups) {
                const mockups = parsed.mockups;
                if (mockups.principal) orderConfig.mockups.principal = Object.assign({ delantera: null, espalda: null }, mockups.principal);
                if (mockups.arquero) orderConfig.mockups.arquero = Object.assign({ delantera: null, espalda: null }, mockups.arquero);
            }
        } catch(e) { /* ignore corrupted data */ }
    }
    renderOrderSummary();
}

function renderOrderSummary() {
    const container = document.getElementById('configSummaryContainer');
    if (!container) return;

    const productoLabels = { conjunto: 'Conjunto Completo', camiseta: 'Solo Camiseta' };
    const telaLabels = { winfresh: 'Win Fresh', microfibra: 'Microfibra', algodon: 'Algodón Pima' };
    const corteLabels = { estandar_varon: 'Estándar Varón', estandar_mujer: 'Estándar Mujer', infantil: 'Infantil', unisex: 'Unisex' };
    const mangaLabels = { corta: 'Manga Corta', larga: 'Manga Larga', tres_cuartos: 'Manga 3/4' };
    const cuelloLabels = { v: 'Cuello en V', redondo: 'Cuello Redondo', camisero: 'Cuello Camisero', neru: 'Cuello Neru' };

    const opciones = orderConfig.opciones;
    const activeOpciones = [];
    if (opciones.banderola) activeOpciones.push('Banderola');
    if (opciones.bandaCapitan) activeOpciones.push('Banda de Capitán');
    if (opciones.escudo) activeOpciones.push('Escudo');
    if (opciones.medias) activeOpciones.push('Medias');
    if (opciones.personalizacionEspecial) activeOpciones.push(opciones.personalizacionEspecial);

    let html = '';
    html += '<div class="config-summary-grid">';
    html += '<div class="config-item"><span class="config-label">Producto</span><span class="config-value">' + (productoLabels[orderConfig.producto] || 'Conjunto Completo') + '</span></div>';
    html += '<div class="config-item"><span class="config-label">Tela</span><span class="config-value">' + (telaLabels[orderConfig.tela] || orderConfig.tela) + '</span></div>';
    html += '<div class="config-item"><span class="config-label">Corte</span><span class="config-value">' + (corteLabels[orderConfig.corte] || orderConfig.corte) + '</span></div>';
    html += '<div class="config-item"><span class="config-label">Manga</span><span class="config-value">' + (mangaLabels[orderConfig.manga] || orderConfig.manga) + '</span></div>';
    html += '<div class="config-item"><span class="config-label">Cuello</span><span class="config-value">' + (cuelloLabels[orderConfig.cuello] || orderConfig.cuello) + '</span></div>';
    if (orderConfig.confArquero) {
        html += '<div class="config-item config-item-full"><span class="config-label">Arquero</span><span class="config-value">' + orderConfig.confArquero + '</span></div>';
    }
    html += '</div>';

    if (activeOpciones.length > 0) {
        html += '<div class="config-opciones">';
        html += '<span class="config-label" style="margin-bottom:0.5rem;display:block;">Productos Opcionales</span>';
        html += '<div class="option-chips">';
        activeOpciones.forEach(function(opt) {
            html += '<span class="option-chip">' + opt + '</span>';
        });
        html += '</div></div>';
    }

    container.innerHTML = html;
}

function removeMockup(group, slot) {
    if (orderConfig.mockups && orderConfig.mockups[group]) {
        orderConfig.mockups[group][slot] = null;
        localStorage.setItem('sipes_order_config', JSON.stringify(orderConfig));
        renderOrderSummary();
    }
}

// Referencias DOM
const tbody = document.getElementById('participantsList');
const btnAdd = document.getElementById('btnAddParticipant');
const modalOverlay = document.getElementById('participantModal');
const btnCloseModal = document.getElementById('closeModal');
const btnCancel = document.getElementById('cancelBtn');
const form = document.getElementById('participantForm');
const modalTitle = document.getElementById('modalTitle');

// Referencias DOM para Resumen y Configuración
const totalPrendasEl = document.getElementById('totalPrendas');
const totalConjuntosEl = document.getElementById('totalConjuntos');
const totalCamisetasEl = document.getElementById('totalCamisetas');
const sizesGridEl = document.getElementById('sizesGrid');
const alertsContainerEl = document.getElementById('alertsContainer');
const btnExport = document.getElementById('btnExport');
const btnCloseList = document.getElementById('btnCloseList');
const expectedPlayersInput = document.getElementById('expectedPlayersInput');
const btnSaveExpected = document.getElementById('btnSaveExpected');

// Inicialización
function init() {
    loadParticipants();
    loadOrderConfig();
    if(expectedPlayersInput) expectedPlayersInput.value = expectedPlayers;
    const unitPriceInput = document.getElementById('unitPriceInput');
    if(unitPriceInput) unitPriceInput.value = unitPrice.toFixed(2);
    const coordUnitPriceText = document.getElementById('coordUnitPriceText');
    if(coordUnitPriceText) coordUnitPriceText.textContent = `S/ ${unitPrice.toFixed(2)}`;
    const deliveryDateInput = document.getElementById('deliveryDateInput');
    if(deliveryDateInput) deliveryDateInput.value = deliveryDate;
    const coordDeliveryDateText = document.getElementById('coordDeliveryDateText');
    if(coordDeliveryDateText) coordDeliveryDateText.textContent = formatDateDisplay(deliveryDate);
    renderTable();
    updateSummary();
    setupEventListeners();
}

// Renderizar Tabla
function renderTable() {
    if (participants.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="empty-state">No hay participantes registrados. Agrega uno para empezar.</td></tr>`;
        return;
    }

    tbody.innerHTML = participants.map(p => {
        let paymentBadge = '';
        if(p.paymentStatus === 'Pagado') paymentBadge = '<span class="status-badge" style="background:#D1FAE5; color:#065F46;">Pagado</span>';
        else if(p.paymentStatus === 'Abonado') paymentBadge = '<span class="status-badge" style="background:#DBEAFE; color:#1E40AF;">Abonado</span>';
        else paymentBadge = '<span class="status-badge" style="background:#FEE2E2; color:#991B1B;">Pendiente</span>';
        
        let tallasText = `<span style="font-weight:700">${p.size || '-'}</span>`;
        if((p.productType || orderConfig.producto || 'conjunto') === 'conjunto' && p.shortSize && p.shortSize !== 'same' && p.shortSize !== p.size) {
            tallasText = `<div><span style="font-weight:700">${p.size}</span><span style="font-size:0.75rem; color:#6B7280; display:block;">Short: ${p.shortSize}</span></div>`;
        }

        let jugadorText = p.playerName || '-';
        if(p.isGoalkeeper) {
            jugadorText += '<br><span style="color:#DC2626; font-weight:700; font-size:0.68rem; letter-spacing:0.04em;">ARQUERO</span>';
        }
        if(p.exceptions && p.exceptions.trim() !== '') {
            jugadorText += '<span class="exception-badge" title="' + p.exceptions.replace(/"/g, '&quot;') + '"><i class="fa-solid fa-sliders"></i></span>';
        }


        return `
        <tr>
            <td>${jugadorText}</td>
            <td><strong>${p.shirtName}</strong></td>
            <td>${p.shirtNumber}</td>
            <td>${tallasText}</td>
            <td>${paymentBadge}</td>
            <td class="action-cell">
                <button class="btn btn-edit-ghost" onclick="editParticipant(${p.id})"><i class="fa-solid fa-pen"></i></button>
                <button class="btn btn-danger-ghost" onclick="deleteParticipant(${p.id})"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>
        `;
    }).join('');
}

// Actualizar Resumen (La "Magia")
function updateSummary() {
    let totalConjuntos = 0;
    let totalCamisetas = 0;
    let totalPaid = 0;
    let totalPending = 0;
    const sizeCounts = {};
    const numbersUsed = {};
    const alerts = [];

    // Calcular totales e identificar problemas
    participants.forEach(p => {
        // Conteo de productos
        if (p.productType === 'conjunto') totalConjuntos++;
        if (p.productType === 'camiseta') totalCamisetas++;
        
        // Pagos
        if (p.paymentStatus === 'Pagado' || p.paymentStatus === 'Abonado') totalPaid++;
        else totalPending++;

        // Conteo de tallas (Camiseta)
        let sizeKey = p.size;
        if (p.isGoalkeeper) sizeKey += ' (Arquero)';
        
        sizeCounts[sizeKey] = (sizeCounts[sizeKey] || 0) + 1;

        // Conteo de tallas de Short
        if (p.productType === 'conjunto') {
            const sSize = p.shortSize || p.size;
            const shortKey = `Short ${sSize}`;
            sizeCounts[shortKey] = (sizeCounts[shortKey] || 0) + 1;
        }

        // Validar unicidad de números
        if (!numbersUsed[p.shirtNumber]) {
            numbersUsed[p.shirtNumber] = [];
        }
        numbersUsed[p.shirtNumber].push(p.shirtName);
    });

    // Actualizar DOM Totales
    totalConjuntosEl.textContent = totalConjuntos;
    totalCamisetasEl.textContent = totalCamisetas;
    totalPrendasEl.textContent = totalConjuntos + totalCamisetas;
    
    const paidEl = document.getElementById('totalPaid');
    const pendingEl = document.getElementById('totalPending');
    if (paidEl) paidEl.textContent = totalPaid;
    if (pendingEl) pendingEl.textContent = totalPending;

    // Renderizar Curva de Tallas
    sizesGridEl.innerHTML = Object.keys(sizeCounts).sort().map(sizeKey => {
        const count = sizeCounts[sizeKey];
        return `
            <div class="size-box">
                <span class="sz">${sizeKey}</span>
                <span class="ct">${count} und</span>
            </div>
        `;
    }).join('');

    // Generar Alertas
    Object.keys(numbersUsed).forEach(num => {
        if (numbersUsed[num].length > 1) {
            alerts.push({
                type: 'danger',
                icon: 'fa-triangle-exclamation',
                msg: `El número <strong>${num}</strong> está repetido (${numbersUsed[num].join(', ')}). Esto causará errores en producción.`
            });
        }
    });

    // Alerta de conciliación (quiénes faltan)
    if (participants.length < expectedPlayers) {
        const diff = expectedPlayers - participants.length;
        alerts.push({
            type: 'warning',
            icon: 'fa-user-clock',
            msg: `Faltan <strong>${diff}</strong> jugador(es) por registrarse para alcanzar la meta de ${expectedPlayers}.`
        });
    }

    if (alerts.length === 0) {
        alerts.push({
            type: 'success',
            icon: 'fa-check-circle',
            msg: `Lista sin errores y completa. Lista para producción.`
        });
    }

    // Renderizar Alertas
    alertsContainerEl.innerHTML = alerts.map(a => `
        <div class="alert alert-${a.type === 'danger' ? 'danger' : 'warning'}" style="${a.type==='success' ? 'background:#D1FAE5; color:#065F46; border:1px solid #10B981;' : ''}">
            <i class="fa-solid ${a.icon} mt-1"></i>
            <div>${a.msg}</div>
        </div>
    `).join('');
}

// Event Listeners
function setupEventListeners() {
    btnAdd.addEventListener('click', openModal);
    btnCloseModal.addEventListener('click', closeModal);
    btnCancel.addEventListener('click', (e) => { e.preventDefault(); closeModal(); });
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        saveParticipant();
    });

    if (btnExport) btnExport.addEventListener('click', exportCSV);
    if (btnCloseList) btnCloseList.addEventListener('click', closeList);
    if (btnSaveExpected) {
        btnSaveExpected.addEventListener('click', () => {
            const val = parseInt(expectedPlayersInput.value);
            if (val > 0) {
                expectedPlayers = val;
                saveParticipantsToStore();
                updateSummary();
                alert(`Meta de jugadores actualizada a ${val}`);
            }
        });
    }

    const btnSaveUnitPrice = document.getElementById('btnSaveUnitPrice');
    const unitPriceInput = document.getElementById('unitPriceInput');
    if (btnSaveUnitPrice && unitPriceInput) {
        btnSaveUnitPrice.addEventListener('click', () => {
            const val = parseFloat(unitPriceInput.value);
            if (!isNaN(val) && val >= 0) {
                unitPrice = val;
                saveParticipantsToStore();
                updateSummary();
                const coordUnitPriceText = document.getElementById('coordUnitPriceText');
                if (coordUnitPriceText) coordUnitPriceText.textContent = `S/ ${unitPrice.toFixed(2)}`;
                alert(`Precio unitario acordado guardado: S/ ${val.toFixed(2)}`);
            }
        });
    }

    const btnSaveDeliveryDate = document.getElementById('btnSaveDeliveryDate');
    const deliveryDateInput = document.getElementById('deliveryDateInput');
    if (btnSaveDeliveryDate && deliveryDateInput) {
        btnSaveDeliveryDate.addEventListener('click', () => {
            if (deliveryDateInput.value) {
                deliveryDate = deliveryDateInput.value;
                saveParticipantsToStore();
                const coordDeliveryDateText = document.getElementById('coordDeliveryDateText');
                if (coordDeliveryDateText) coordDeliveryDateText.textContent = formatDateDisplay(deliveryDate);
                alert(`Fecha de entrega actualizada a: ${formatDateDisplay(deliveryDate)}`);
            }
        });
    }

    // Copiar Link del Coordinador (Para el Admin)
    const btnCopyCoordLink = document.getElementById('btnCopyCoordLink');
    if (btnCopyCoordLink) {
        btnCopyCoordLink.addEventListener('click', () => {
            const coordUrl = new URL('vista_coordinador.html?pedido=SUB-00842', window.location.href).href;
            navigator.clipboard.writeText(coordUrl).catch(() => {});
            window.open(coordUrl, '_blank');
        });
    }

    // Copiar Link para Jugadores (Para el Coordinador)
    const btnShareJugadores = document.getElementById('btnShareJugadores');
    if (btnShareJugadores) {
        btnShareJugadores.addEventListener('click', () => {
            const playerUrl = new URL('participante.html?pedido=SUB-00842&tipo=conjunto', window.location.href).href;
            navigator.clipboard.writeText(playerUrl).catch(() => {});
            window.open(playerUrl, '_blank');
        });
    }
}

function exportCSV() {
    if (participants.length === 0) {
        alert("No hay datos para exportar.");
        return;
    }
    const headers = ["ID", "Jugador", "Nombre Camiseta", "Numero", "Talla Arriba", "Talla Abajo", "Arquero", "Producto", "Pago"];
    const rows = participants.map(p => {
        const tallaArriba = p.size;
        const tallaAbajo = (p.productType === 'conjunto' && p.shortSize) ? p.shortSize : p.size;
        const isArquero = p.isGoalkeeper ? 'SI' : 'NO';
        
        return [p.id, p.playerName, p.shirtName, p.shirtNumber, tallaArriba, tallaAbajo, isArquero, p.productType, p.paymentStatus].map(col => {
            const val = col === null || col === undefined ? "" : String(col);
            return `"${val.replace(/"/g, '""')}"`;
        }).join(",");
    });
    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "pedido_SUB-00842.csv";
    link.click();
}

function closeList() {
    const alerts = document.querySelectorAll('#alertsContainer .alert-danger');
    if (alerts.length > 0) {
        alert("No se puede cerrar la lista. Hay inconsistencias críticas (ej. números duplicados sin resolver).");
    } else {
        alert("Lista cerrada con éxito. El pedido avanza a la siguiente fase.");
        const badge = document.querySelector('.status-badge');
        if (badge) {
            badge.textContent = 'Lista Cerrada';
            badge.className = 'status-badge status-cerrado';
            badge.style.backgroundColor = '#FCD34D';
            badge.style.color = '#92400E';
        }
    }
}

function openModal() {
    modalOverlay.classList.add('active');
    const shortGroup = document.getElementById('shortSizeGroup');
    if (shortGroup) {
        shortGroup.style.display = (orderConfig.producto || 'conjunto') === 'conjunto' ? 'block' : 'none';
    }
    document.getElementById('playerName').focus();
}

function closeModal() {
    modalOverlay.classList.remove('active');
    form.reset();
    document.getElementById('allowDuplicateNum').checked = false;
    editingId = null;
    modalTitle.textContent = "Agregar Participante";
}

// Lógica CRUD
function saveParticipant() {
    const pName = document.getElementById('playerName').value.trim();
    const sName = document.getElementById('shirtName').value.toUpperCase().trim();
    const sNumber = parseInt(document.getElementById('shirtNumber').value);
    const size = document.getElementById('size').value;
    const pType = document.getElementById('productType') ? document.getElementById('productType').value : (orderConfig.producto || 'conjunto');
    const gCut = document.getElementById('genderCut') ? document.getElementById('genderCut').value : 'Hombre';
    const shortSize = document.getElementById('shortSize') ? document.getElementById('shortSize').value : '';
    const isGoalie = document.getElementById('isGoalkeeper') ? document.getElementById('isGoalkeeper').checked : false;
    const exceptions = document.getElementById('exceptions') ? document.getElementById('exceptions').value.trim() : '';
    const allowDuplicate = document.getElementById('allowDuplicateNum').checked;
    const pStatus = document.getElementById('paymentStatus') ? document.getElementById('paymentStatus').value : 'Pendiente';

    if (sName === "") {
        alert("El nombre de la camiseta no puede estar vacío");
        return;
    }

    // Validación de unicidad
    if (!allowDuplicate) {
        const isDuplicate = participants.some(p => p.shirtNumber === sNumber && p.id !== editingId);
        if (isDuplicate) {
            alert(`El número ${sNumber} ya está en uso. Si es una excepción autorizada, marque la casilla "Autorizar número duplicado".`);
            return;
        }
    }

    if (editingId) {
        const index = participants.findIndex(p => p.id === editingId);
        if (index > -1) {
            participants[index] = {
                id: editingId,
                playerName: pName,
                shirtName: sName,
                shirtNumber: sNumber,
                size: size,
                genderCut: gCut,
                shortSize: shortSize,
                isGoalkeeper: isGoalie,
                productType: pType,
                paymentStatus: pStatus,
                exceptions: exceptions
            };
        }
    } else {
        participants.push({
            id: Date.now(),
            playerName: pName,
            shirtName: sName,
            shirtNumber: sNumber,
            size: size,
            genderCut: gCut,
            shortSize: shortSize,
            isGoalkeeper: isGoalie,
            productType: pType,
            paymentStatus: pStatus,
            exceptions: exceptions
        });
    }

    saveParticipantsToStore();
    closeModal();
    renderTable();
    updateSummary();
}

window.editParticipant = function(id) {
    const p = participants.find(p => p.id === id);
    if (!p) return;

    editingId = p.id;
    document.getElementById('participantId').value = p.id;
    document.getElementById('playerName').value = p.playerName;
    document.getElementById('shirtName').value = p.shirtName;
    document.getElementById('shirtNumber').value = p.shirtNumber;
    document.getElementById('size').value = p.size;
    if(p.genderCut && document.getElementById('genderCut')) document.getElementById('genderCut').value = p.genderCut;
    
    if(document.getElementById('productType')) {
        document.getElementById('productType').value = p.productType || orderConfig.producto || 'conjunto';
        document.getElementById('productType').dispatchEvent(new Event('change'));
    }

    const shortGroup = document.getElementById('shortSizeGroup');
    if (shortGroup) {
        shortGroup.style.display = (orderConfig.producto || 'conjunto') === 'conjunto' ? 'block' : 'none';
    }

    if(document.getElementById('shortSize')) document.getElementById('shortSize').value = p.shortSize || '';
    if(document.getElementById('isGoalkeeper')) document.getElementById('isGoalkeeper').checked = p.isGoalkeeper || false;
    
    if(document.getElementById('paymentStatus')) document.getElementById('paymentStatus').value = p.paymentStatus || 'Pendiente';
    if(document.getElementById('exceptions')) document.getElementById('exceptions').value = p.exceptions || '';
    document.getElementById('allowDuplicateNum').checked = false;

    modalTitle.textContent = "Editar Participante";
    openModal();
};

window.deleteParticipant = function(id) {
    if (confirm("¿Eliminar este participante?")) {
        participants = participants.filter(p => p.id !== id);
        saveParticipantsToStore();
        renderTable();
        updateSummary();
    }
};

// Arrancar app
document.addEventListener('DOMContentLoaded', init);
