// BASE DE DATOS INICIAL
let DB = JSON.parse(localStorage.getItem('espuela_db')) || {
    usuarios: [{ user: "admin", pass: "8888", nombre: "Dueño", saldo: 0, rol: "admin" }],
    cuota: 1.80,
    apuestasAbiertas: false,
    tiempoRestante: 0,
    apuestasActuales: [],
    numeroPelea: 1
};

let usuarioActivo = null;
let relojIntervalo;

// ESCUCHAR CAMBIOS EN TIEMPO REAL
window.addEventListener('storage', () => {
    DB = JSON.parse(localStorage.getItem('espuela_db'));
    if (usuarioActivo && usuarioActivo.rol === 'cliente') actualizarUICliente();
});

function ejecutarLogin() {
    const u = document.getElementById('user-input').value;
    const p = document.getElementById('pass-input').value;
    const encontrado = DB.usuarios.find(x => x.user === u && x.pass === p);

    if (!encontrado) return alert("Usuario o clave incorrecta");

    usuarioActivo = encontrado;
    document.getElementById('login-section').classList.add('hidden');
    document.getElementById('main-dashboard').classList.remove('hidden');

    if (usuarioActivo.rol === "admin") {
        document.getElementById('admin-view').classList.remove('hidden');
        renderListaAdmin();
    } else {
        document.getElementById('client-view').classList.remove('hidden');
        actualizarUICliente();
        conectarRelojVisual();
    }
}

// --- FUNCIONES ADMINISTRADOR ---

function registrarNuevoCliente() {
    const n = document.getElementById('reg-nombre').value;
    const u = document.getElementById('reg-user').value;
    const p = document.getElementById('reg-pass').value;
    if(!n || !u || !p) return alert("Faltan datos");

    DB.usuarios.push({ user: u, pass: p, nombre: n, saldo: 0, rol: "cliente" });
    guardarYActualizar();
    renderListaAdmin();
    alert("Usuario creado");
}

function gestionarSaldo(index, operacion) {
    const cantidad = parseFloat(prompt("Cantidad:"));
    if (isNaN(cantidad)) return;
    if (operacion === 'sumar') DB.usuarios[index].saldo += cantidad;
    if (operacion === 'restar') DB.usuarios[index].saldo -= cantidad;
    guardarYActualizar();
    renderListaAdmin();
}

function actualizarPeleaAdmin() {
    DB.numeroPelea = document.getElementById('input-num-pelea').value;
    guardarYActualizar();
    alert("Cambiado a Pelea " + DB.numeroPelea);
}

function fijarCuota() {
    DB.cuota = parseFloat(document.getElementById('input-cuota').value);
    guardarYActualizar();
    alert("Cuota actualizada");
}

function controlarApuestas(abrir) {
    DB.apuestasAbiertas = abrir;
    if (abrir) {
        DB.tiempoRestante = parseInt(document.getElementById('input-segundos').value);
        DB.apuestasActuales = []; // Limpiar apuestas de pelea anterior
        iniciarCronometroMaster();
    } else {
        clearInterval(relojIntervalo);
        DB.tiempoRestante = 0;
    }
    guardarYActualizar();
}

function iniciarCronometroMaster() {
    clearInterval(relojIntervalo);
    relojIntervalo = setInterval(() => {
        if (DB.tiempoRestante > 0) {
            DB.tiempoRestante--;
            localStorage.setItem('espuela_db', JSON.stringify(DB));
        } else {
            DB.apuestasAbiertas = false;
            clearInterval(relojIntervalo);
            guardarYActualizar();
        }
    }, 1000);
}

function pagarGanadores(ganador) {
    DB.apuestasActuales.forEach(ap => {
        if (ap.opcion === ganador) {
            const u = DB.usuarios.find(user => user.user === ap.user);
            if (u) u.saldo += (ap.monto * DB.cuota);
        }
    });
    DB.apuestasActuales = [];
    DB.apuestasAbiertas = false;
    guardarYActualizar();
    renderListaAdmin();
    alert("Premios pagados para " + ganador);
}

// --- FUNCIONES CLIENTE ---

function clienteAposta(opcion) {
    DB = JSON.parse(localStorage.getItem('espuela_db')); // Sincronizar antes de apostar
    if (!DB.apuestasAbiertas || DB.tiempoRestante <= 0) return alert("APUESTAS CERRADAS");

    const monto = parseFloat(document.getElementById('monto-apuesta-cliente').value);
    const yoEnDB = DB.usuarios.find(u => u.user === usuarioActivo.user);

    if (monto > yoEnDB.saldo || monto <= 0) return alert("No tienes saldo suficiente");

    yoEnDB.saldo -= monto;
    DB.apuestasActuales.push({ user: usuarioActivo.user, opcion, monto });
    
    guardarYActualizar();
    actualizarUICliente();
    alert("¡Apuesta al " + opcion + " recibida!");
}

// --- UTILIDADES ---

function guardarYActualizar() {
    localStorage.setItem('espuela_db', JSON.stringify(DB));
}

function renderListaAdmin() {
    const div = document.getElementById('lista-usuarios-admin');
    div.innerHTML = "";
    DB.usuarios.forEach((u, i) => {
        if (u.rol === 'cliente') {
            div.innerHTML += `
                <div style="background:#222; margin:5px; padding:10px; border-radius:5px;">
                    ${u.nombre} - <b>$${u.saldo.toFixed(2)}</b><br>
                    <button onclick="gestionarSaldo(${i},'sumar')">+</button>
                    <button onclick="gestionarSaldo(${i},'restar')">-</button>
                </div>`;
        }
    });
}

function actualizarUICliente() {
    const yoEnDB = DB.usuarios.find(u => u.user === usuarioActivo.user);
    document.getElementById('span-cliente-saldo').innerText = `$${yoEnDB.saldo.toFixed(2)}`;
    document.getElementById('span-cliente-nombre').innerText = yoEnDB.nombre;
    document.getElementById('num-pelea-display').innerText = DB.numeroPelea;
    document.getElementById('cuota-rojo-display').innerText = DB.cuota + "x";
    document.getElementById('cuota-azul-display').innerText = DB.cuota + "x";

    if (!DB.apuestasAbiertas || DB.tiempoRestante <= 0) {
        document.getElementById('overlay-cerrado').classList.remove('hidden');
    } else {
        document.getElementById('overlay-cerrado').classList.add('hidden');
    }
}

function conectarRelojVisual() {
    setInterval(() => {
        const dbTemp = JSON.parse(localStorage.getItem('espuela_db'));
        const seg = dbTemp.tiempoRestante;
        document.getElementById('reloj-display').innerText = seg < 10 ? '0'+seg : seg;
        if (seg <= 0 || !dbTemp.apuestasAbiertas) {
            document.getElementById('status-tag').innerText = "● CERRADO";
            document.getElementById('status-tag').className = "status-closed";
        } else {
            document.getElementById('status-tag').innerText = "● ABIERTO";
            document.getElementById('status-tag').className = "status-open";
        }
    }, 1000);
}