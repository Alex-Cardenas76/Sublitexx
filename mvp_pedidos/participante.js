// participante.js - Lógica para la vista móvil del participante
const form = document.getElementById('playerForm');
const alertsContainer = document.getElementById('alertsContainer');

// Cargar participantes de localStorage
function getParticipants() {
    const data = localStorage.getItem('sipes_participants');
    if (data) {
        return JSON.parse(data);
    }
    // Datos iniciales por defecto
    return [
        { id: 1, playerName: "Juan Pérez", shirtName: "JUAN P.", shirtNumber: 10, size: "M", productType: "conjunto", exceptions: "" },
        { id: 2, playerName: "Carlos López", shirtName: "CARLOS", shirtNumber: 7, size: "L", productType: "conjunto", exceptions: "Corte mujer" },
        { id: 3, playerName: "Andrés Silva", shirtName: "A. SILVA", shirtNumber: 9, size: "M", productType: "camiseta", exceptions: "" }
    ];
}

function saveParticipants(participants) {
    localStorage.setItem('sipes_participants', JSON.stringify(participants));
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    // Si la URL tiene un parámetro ?id=X, simulamos que el usuario está editando su registro.
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    
    if (id) {
        const participants = getParticipants();
        const p = participants.find(p => p.id == id);
        if (p) {
            document.getElementById('participantId').value = p.id;
            document.getElementById('playerName').value = p.playerName;
            document.getElementById('shirtName').value = p.shirtName;
            document.getElementById('shirtNumber').value = p.shirtNumber;
            document.getElementById('size').value = p.size;
            document.getElementById('productType').value = p.productType;
            if(p.genderCut) document.getElementById('genderCut').value = p.genderCut;
            if(p.shortSize) document.getElementById('shortSize').value = p.shortSize;
            if(p.isGoalkeeper) document.getElementById('isGoalkeeper').checked = p.isGoalkeeper;
        }
    }
    
    // Toggle Short Size visibility
    const prodSelect = document.getElementById('productType');
    const shortGroup = document.getElementById('shortSizeGroup');
    prodSelect.addEventListener('change', () => {
        shortGroup.style.display = prodSelect.value === 'conjunto' ? 'block' : 'none';
        if(prodSelect.value !== 'conjunto') {
            document.getElementById('shortSize').value = '';
        }
    });
    prodSelect.dispatchEvent(new Event('change'));
});

form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const idField = document.getElementById('participantId').value;
    const pName = document.getElementById('playerName').value.trim();
    const sName = document.getElementById('shirtName').value.toUpperCase().trim();
    const sNumber = parseInt(document.getElementById('shirtNumber').value);
    const size = document.getElementById('size').value;
    const pType = document.getElementById('productType').value;
    const gCut = document.getElementById('genderCut').value;
    const shortSize = document.getElementById('shortSize').value;
    const isGoalie = document.getElementById('isGoalkeeper').checked;
    
    if (sName === "") {
        alert("El nombre de la camiseta no puede estar vacío");
        return;
    }
    
    let participants = getParticipants();
    
    // Validar unicidad
    const isDuplicate = participants.some(p => p.shirtNumber === sNumber && p.id != idField);
    
    if (isDuplicate) {
        alertsContainer.innerHTML = `
            <div class="alert alert-danger" style="margin-bottom: 1rem;">
                <i class="fa-solid fa-triangle-exclamation mt-1"></i>
                <div>El número <strong>${sNumber}</strong> ya fue elegido por otro compañero. Por favor, elige otro.</div>
            </div>`;
        return;
    }
    
    if (idField) {
        const index = participants.findIndex(p => p.id == idField);
        if (index > -1) {
            participants[index] = {
                ...participants[index],
                playerName: pName,
                shirtName: sName,
                shirtNumber: sNumber,
                size: size,
                productType: pType,
                genderCut: gCut,
                shortSize: shortSize,
                isGoalkeeper: isGoalie
            };
        }
    } else {
        participants.push({
            id: Date.now(),
            playerName: pName,
            shirtName: sName,
            shirtNumber: sNumber,
            size: size,
            productType: pType,
            genderCut: gCut,
            shortSize: shortSize,
            isGoalkeeper: isGoalie,
            exceptions: "" 
        });
    }
    
    saveParticipants(participants);
    
    // Ocultar form y mostrar recibo
    form.style.display = 'none';
    let summaryText = `(Talla ${size}, Corte ${gCut})`;
    if (pType === 'conjunto' && shortSize) {
        summaryText = `(Camiseta ${size}, Short ${shortSize}, Corte ${gCut})`;
    }
    if (isGoalie) summaryText += ` - <strong>Arquero</strong>`;

    alertsContainer.innerHTML = `
        <div class="alert alert-success" style="margin-bottom: 1.5rem; background:#D1FAE5; color:#065F46; border:1px solid #10B981; padding: 1.5rem;">
            <div style="text-align: center; width: 100%;">
                <i class="fa-solid fa-check-circle" style="font-size: 2rem; margin-bottom: 0.5rem;"></i>
                <h3 style="margin-bottom: 0.5rem;">¡Pedido Confirmado!</h3>
                <p>Tu uniforme quedó registrado con el nombre <strong>${sName}</strong> y número <strong>${sNumber}</strong> <br>${summaryText}</p>
                <button class="btn btn-outline" style="margin-top: 1rem;" onclick="location.reload()">Editar mis datos</button>
            </div>
        </div>`;
});
