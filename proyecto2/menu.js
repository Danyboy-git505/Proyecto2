console.log('menu.js cargado correctamente');

// 1. Inicialización de datos y conexión con el HTML 
let saldoActual = 5000;
const displaySaldo = document.getElementById('account-balance');
const listaMovimientos = document.getElementById('transactions-list');

// Botones de acción
const btnDepositar = document.getElementById('btn-deposit');
const btnTransferir = document.getElementById('btn-transfer');

// Mostramos el saldo inicial al cargar la página
displaySaldo.textContent = `$` + saldoActual;

// --- LÓGICA DE DEPÓSITO ---
btnDepositar.addEventListener("click", function() {
    let montoEscrito = prompt("Ingrese el monto a depositar:");
    let monto = Number(montoEscrito);

    if (isNaN(monto) || monto <= 0) {
        alert("Monto inválido. Por favor, ingrese un número positivo.");
    } else {
        // Actualizamos saldo
        saldoActual += monto;
        displaySaldo.textContent = `$` + saldoActual;

        // Registramos movimiento
        let nuevoItem = document.createElement('li');
        nuevoItem.textContent = `Depósito: +$${monto}`;
        listaMovimientos.appendChild(nuevoItem);

        alert(`Depósito exitoso. Nuevo saldo: $${saldoActual}`);
    }
});

// --- LÓGICA DE TRANSFERENCIA ---
btnTransferir.addEventListener("click", function() {
    let montoEscrito = prompt("Ingrese el monto a transferir:");
    let monto = Number(montoEscrito);

    if (isNaN(monto) || monto <= 0) {
        alert("Monto inválido. Por favor, ingrese un número positivo.");
    } else if (monto > saldoActual) {
        alert("Saldo insuficiente.");
    } else {
        // Actualizamos saldo
        saldoActual -= monto;
        displaySaldo.textContent = `$` + saldoActual;

        // Registramos movimiento
        let nuevoItem = document.createElement('li');
        nuevoItem.textContent = `Transferencia: -$${monto}`;
        listaMovimientos.appendChild(nuevoItem);

        alert(`Transferencia exitosa. Nuevo saldo: $${saldoActual}`);
    }
});

// --- CERRAR SESIÓN (desde el menú) ---
const btnLogoutMenu = document.getElementById('btn-logout-menu');
if(btnLogoutMenu){
    btnLogoutMenu.addEventListener('click', function(){
        console.log('Cerrar sesión (menu) clickeado — redirigiendo a proyecto2.html');
        try{ window.location.href = 'proyecto2.html'; }
        catch(e){ try{ window.location.replace('proyecto2.html'); }catch(err){ window.open('proyecto2.html', '_self'); } }
    });
}