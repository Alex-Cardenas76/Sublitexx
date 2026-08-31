// app.js - Lógica interactiva para el MVP del SIPES

// Estado de la aplicación
let participants = [];
let editingId = null;
let expectedPlayers = 25;

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
}

function saveParticipantsToStore() {
    localStorage.setItem('sipes_participants', JSON.stringify(participants));
    localStorage.setItem('sipes_expected', expectedPlayers.toString());
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
    if(expectedPlayersInput) expectedPlayersInput.value = expectedPlayers;
    renderTable();
    updateSummary();
    setupEventListeners();
}

// Renderizar Tabla
function renderTable() {
    if (participants.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" class="empty-state">No hay participantes registrados. Agrega uno para empezar.</td></tr>`;
        return;
    }

    tbody.innerHTML = participants.map(p => {
        let paymentBadge = '';
        if(p.paymentStatus === 'Pagado') paymentBadge = '<span class="status-badge" style="background:#D1FAE5; color:#065F46;">Pagado</span>';
        else if(p.paymentStatus === 'Abonado') paymentBadge = '<span class="status-badge" style="background:#DBEAFE; color:#1E40AF;">Abonado</span>';
        else paymentBadge = '<span class="status-badge" style="background:#FEE2E2; color:#991B1B;">Pendiente</span>';
        
        let tallasText = `<span style="font-weight:700">${p.size || '-'}</span>`;
        if(p.productType === 'conjunto' && p.shortSize && p.shortSize !== 'same' && p.shortSize !== p.size) {
            tallasText = `<div><span style="font-weight:700">${p.size}</span><span style="font-size:0.75rem; color:#6B7280; display:block;">Short: ${p.shortSize}</span></div>`;
        }

        let rolText = `<span>${p.genderCut || 'Hombre'}</span>`;
        if(p.collarType) rolText += `<br><span style="font-size:0.75rem; color:#475569; font-weight:600;">${p.collarType}</span>`;
        if(p.isGoalkeeper) rolText += '<br><span style="color:#DC2626; font-weight:700; font-size:0.68rem; letter-spacing:0.04em;">ARQUERO</span>';



        return `
        <tr>
            <td>${p.playerName || '-'}</td>
            <td><strong>${p.shirtName}</strong></td>
            <td>${p.shirtNumber}</td>
            <td>${tallasText}</td>
            <td>${rolText}</td>
            <td>
                <span class="pill ${p.productType === 'conjunto' ? 'pill-conjunto' : 'pill-camiseta'}">
                    ${p.productType === 'conjunto' ? 'Conjunto Completo' : 'Solo Camiseta'}
                </span>
            </td>
            <td>${paymentBadge}</td>
            <td><small class="text-muted">${p.exceptions || '-'}</small></td>
            <td>
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

        // Conteo de tallas por corte (Camiseta)
        let cut = p.genderCut || 'Hombre';
        if (p.isGoalkeeper) cut = 'ARQUERO';
        
        const sizeKey = `${p.size} (${cut.charAt(0)})`;
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
}

function exportCSV() {
    if (participants.length === 0) {
        alert("No hay datos para exportar.");
        return;
    }
    const headers = ["ID", "Jugador", "Nombre Camiseta", "Numero", "Talla Arriba", "Talla Abajo", "Corte", "Arquero", "Producto", "Excepciones", "Pago"];
    const rows = participants.map(p => {
        const tallaArriba = p.size;
        const tallaAbajo = (p.productType === 'conjunto' && p.shortSize) ? p.shortSize : p.size;
        const isArquero = p.isGoalkeeper ? 'SI' : 'NO';
        
        return [p.id, p.playerName, p.shirtName, p.shirtNumber, tallaArriba, tallaAbajo, (p.genderCut||'Hombre'), isArquero, p.productType, p.exceptions, p.paymentStatus].map(col => {
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
    const pType = document.getElementById('productType').value;
    const gCut = document.getElementById('genderCut').value;
    const shortSize = document.getElementById('shortSize') ? document.getElementById('shortSize').value : '';
    const isGoalie = document.getElementById('isGoalkeeper') ? document.getElementById('isGoalkeeper').checked : false;
    const exceptions = document.getElementById('exceptions').value.trim();
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
    if(p.genderCut) document.getElementById('genderCut').value = p.genderCut;
    
    document.getElementById('productType').value = p.productType;
    document.getElementById('productType').dispatchEvent(new Event('change'));

    if(document.getElementById('shortSize')) document.getElementById('shortSize').value = p.shortSize || '';
    if(document.getElementById('isGoalkeeper')) document.getElementById('isGoalkeeper').checked = p.isGoalkeeper || false;
    
    if(document.getElementById('paymentStatus')) document.getElementById('paymentStatus').value = p.paymentStatus || 'Pendiente';
    document.getElementById('exceptions').value = p.exceptions;
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
