// Buscar en el HTML el id open-profile-options y guardarlo en una variable para usarlo en el codigo

const profileButton = document.getElementById("open-profile-options");

// Buscar lo que quiero ocultar
const userMenu = document.querySelector(".header__user-menu");

// Cuando alguien haga click, se ejecutará lo que está dentro de la función
profileButton.addEventListener("click", () =>{
    userMenu.classList.toggle("show"); // Agrega la clase show o la quita si ya la tiene
})


// Redireccionamiento a la página de registro
const btnRegistro = document.getElementById("header__start-button");
btnRegistro.addEventListener("click", () => {
    window.location.href = "register.html";
})

const btnRegistro2 = document.getElementById("benefits__start-button");
btnRegistro2.addEventListener("click", () => {
    window.location.href = "register.html";
})