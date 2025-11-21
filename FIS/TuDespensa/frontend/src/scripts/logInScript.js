(() => {
  const BASE_URL = "https://tudespensa-back.juanmarp121.workers.dev";

  const form = document.querySelector("form.logIn");
  if (!form) return;

  // contenedor de mensajes
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

  const btn = document.querySelector(".logIn__buttons-container .logIn__buttons");
  if (!btn) return;

  btn.addEventListener("click", async (e) => {
    e.preventDefault();

    const correo   = (document.getElementById("logIn__inputs-name")?.value || "").trim().toLowerCase();
    const password = (document.getElementById("logIn__inputs-LastName")?.value || "").trim();

    if (!correo || !password) {
      show("Ingresa email y contraseña.", false);
      return;
    }

    // UX: deshabilitar mientras se envía
    btn.disabled = true;
    btn.textContent = "Ingresando…";

    try {
      const resp = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, password })
      });
      const data = await resp.json();

      if (data && data.ok) {
        show("Inicio de sesión exitoso ✅", true);

        // Guarda sesión mínima
        try { localStorage.setItem("user", JSON.stringify(data.user || { correo })); } catch {}

        // 👉 Redirigir a opciones del usuario (MISMA carpeta /pages)
        setTimeout(() => {
          window.location.href = "optionsPerUser.html";
        }, 800);
      } else {
        show(data?.message || "Error de autenticación.", false);
      }
    } catch {
      show("No se pudo conectar con el backend.", false);
    } finally {
      btn.disabled = false;
      btn.textContent = "Iniciar Sesión";
    }
  });
})();