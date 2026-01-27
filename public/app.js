let usuarioActivo = null;

async function ejecutarLogin() {
    const user = document.getElementById('user-input').value;
    const pass = document.getElementById('pass-input').value;

    const res = await fetch('/api/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ user, pass })
    });

    if (res.ok) {
        usuarioActivo = await res.json();
        document.getElementById('login-section').classList.add('hidden');
        document.getElementById('main-dashboard').classList.remove('hidden');
        if (usuarioActivo.rol === 'admin') {
            document.getElementById('admin-view').classList.remove('hidden');
        } else {
            document.getElementById('client-view').classList.remove('hidden');
            iniciarEscuchaServidor();
        }
    } else { alert("Datos incorrectos"); }
}

function iniciarEscuchaServidor() {
    setInterval(async () => {
        const res = await fetch('/api/estado');
        const db = await res.json();
        document.getElementById('reloj-display').innerText = db.tiempoRestante;
    }, 1000);
}