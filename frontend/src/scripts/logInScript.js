document.addEventListener("DOMContentLoaded", () => {
  const btnLogin = document.getElementById("logIn-btn");

  if (!btnLogin) {
    console.error("Error: No encontré el botón de login");
    return;
  }

  btnLogin.addEventListener("click", async () => {
    // 1. Capturar valores (CORREGIDO: El ID del password es ...-LastName)
    const correoInput = document.getElementById("logIn__inputs-name");
    const passInput = document.getElementById("logIn__inputs-LastName"); // <--- CAMBIO AQUÍ

    const correo = correoInput.value;
    const contrasena = passInput.value;

    // 2. Validación
    if (!correo || !contrasena) {
      alert("⚠️ Por favor ingresa correo y contraseña.");
      return;
    }

    // 3. Datos para el Backend
    const datosLogin = {
      correo: correo,
      contrasena: contrasena
    };

    try {
      // 4. Petición al Backend local (Puerto 8080)
      const response = await fetch("http://localhost:8080/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosLogin)
      });

      // 5. Respuesta
      if (response.ok) {
        const usuario = await response.json();
        localStorage.setItem("user", JSON.stringify(usuario));
        alert("✅ ¡Bienvenido " + usuario.nombre + "!");
        window.location.href = "optionsPerUser.html";
      } else {
        alert("❌ Credenciales incorrectas.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("🔴 Error de conexión con el servidor.");
    }
  });
});