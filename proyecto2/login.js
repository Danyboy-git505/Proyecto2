console.log('Datos.js cargado correctamente');

// Función para manejar el envío del formulario de login
const formulario = document.querySelector(".atm-form");
const inputTarjeta = document.getElementById("cardNumber");
const inputPin = document.getElementById("pin");
const textmensaje = document.getElementById("mensajeError");

// escuchar el evento submit del boton de iniciar sesión

formulario.addEventListener("submit", function(event){
    // envitar que se recargue la pagina
    event.preventDefault();

    //obtener los valores que el usuario escibio
    const numeroTarjeta = inputTarjeta.value
    const pinIngresado = inputPin.value 
    
    // logica de validacion de la tarjeta y el pin
    console.log("Intentando ingresar con:", numeroTarjeta, pinIngresado);

    const numeroTarjetaValido = "1234567890123456"; // numero de tarjeta valido para prueba
    const pinIngresadoValido = "1234"; // pin valido para prueba

   // usar la variable textmensaje para mostrar un mensaje de error al usuario si el numero de tarjeta o el pin son incorrectos
    if (pinIngresado.length !== 4){ // validar que el pin tenga 4 digitos
        textmensaje.textContent = "El Pin debe tener 4 digitos";
        textmensaje.style.color = "red";
        inputPin.value = ""; // limpiar el campo del pin
    }else if (numeroTarjeta == numeroTarjetaValido && pinIngresado == pinIngresadoValido){
        textmensaje.textContent = "Accediendo a la cuenta...";
        textmensaje.style.color = "green";
        window.location.href = "menu.html"; // redirigir a la pagina del proyecto 1
    } else {
        textmensaje.textContent = "Numero de tarjeta o pin Incorrectos, por favor intente de nuevo.";
        textmensaje.style.color = "red";
        inputTarjeta.value = ""; 
        inputPin.value = "";
    }
});

