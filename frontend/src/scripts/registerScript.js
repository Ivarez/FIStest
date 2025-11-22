(() => {
  // 👇 Tu backend en Cloudflare
  const BASE_URL = "https://tudespensa-back.juanmarp121.workers.dev";

  const form = document.querySelector("form.logIn");
  if (!form) return;

  // Utilidad: crea/obtiene un contenedor de estado
  function ensureStatus() {
    let s = document.getElementById("status");
    if (!s) {
      s = document.createElement("div");
      s.id = "status";
      s.style.marginTop = "12px";
      s.style.fontWeight = "600";
      form.appendChild(s);
    }
    return s;
  }

  function show(msg, ok) {
    const s = ensureStatus();
    s.textContent = msg;
    s.style.color = ok ? "green" : "crimson";
  }

  // -------- PASO 1 (register.html) --------
  const nextBtn   = document.getElementById("logIn__buttons-next");
  const cancelBtn = document.getElementById("logIn__buttons-cancel");

  if (nextBtn) {
    // Cancelar → vuelve al landing (ajusta si quieres otra ruta)
    if (cancelBtn) {
      cancelBtn.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = "landing.html";
      });
    }

    // Siguiente → guarda datos y navega a paso 2
    nextBtn.addEventListener("click", (e) => {
      e.preventDefault();

      const nombre    = (document.getElementById("logIn__inputs-name") || {}).value?.trim();
      const apellido  = (document.getElementById("logIn__inputs-LastName") || {}).value?.trim();
      const direccion = (document.getElementById("logIn__inputs-direction") || {}).value?.trim();

      if (!nombre || !apellido || !direccion) {
        show("Completa nombre, apellido y dirección.", false);
        return;
      }

      sessionStorage.setItem("signup_name", nombre);
      sessionStorage.setItem("signup_lastname", apellido);
      sessionStorage.setItem("signup_address", direccion);

      window.location.href = "register2.html";
    });

    return; // 👈 detenemos aquí si estamos en el paso 1
  }

  // -------- PASO 2 (register2.html) --------
  // Estructura: un único botón .logIn__buttons dentro del contenedor
  const createBtn = document.querySelector(".logIn__buttons-container .logIn__buttons");
  if (!createBtn) return;

  createBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    // OJO: en tu HTML el input de email conserva id="logIn__inputs-name"
    const emailInput = document.getElementById("logIn__inputs-name");
    // y la contraseña conserva id="logIn__inputs-LastName"
    const passInput  = document.getElementById("logIn__inputs-LastName");

    const correo = (emailInput?.value || "").trim().toLowerCase();
    const password = (passInput?.value || "").trim();

    if (!correo || !password) {
      show("Ingresa email y contraseña.", false);
      return;
    }

    const nombre = sessionStorage.getItem("signup_name") || "Usuario";

    try {
      const resp = await fetch(`${BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, correo, password })
      });

      const data = await resp.json();

      if (data && data.ok) {
        show("Cuenta creada 🎉 Redirigiendo a Iniciar sesión…", true);

        // Limpia datos temporales
        sessionStorage.removeItem("signup_name");
        sessionStorage.removeItem("signup_lastname");
        sessionStorage.removeItem("signup_address");

        // Redirige automáticamente a login
        setTimeout(() => {
          window.location.href = "logIn.html";
        }, 1200);
      } else {
        show(data?.message || "No se pudo crear la cuenta.", false);
      }
    } catch (err) {
      show("No se pudo conectar con el backend.", false);
    }
  });
})();