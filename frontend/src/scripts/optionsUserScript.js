// frontend/src/scripts/optionsUserScript.js

(() => {
  // ---- Utilidades ----
  function getUser() {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function escapeHtml(text) {
    return String(text || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  const user = getUser();

  // Si no hay usuario logueado, mándalo al login
  if (!user) {
    window.location.href = "logIn.html";
    return;
  }

  // ---- 1) Saludo principal "Hola [usuario]" ----
  const helloEl = document.getElementById("hello-user");
  if (helloEl) {
    const nombre =
      user.nombre ||
      user.name ||
      (user.correo ? user.correo.split("@")[0] : "Usuario");
    helloEl.innerHTML = `👋 Hola <strong>${escapeHtml(nombre)}</strong>`;
  }

  // ---- 2) Personalizar el menú del circulito (header__user-menu) ----
  const userMenu = document.querySelector(".header__user-menu");
  if (userMenu) {
    const nombre = user.nombre || user.name || "Usuario";
    const correo = user.correo || user.email || "";

    userMenu.innerHTML = `
      <ul class="header__user-list">
        <li class="header__user-option">
          <div style="display:flex; flex-direction:column;">
            <span style="font-weight:600; font-size:0.95rem;">
              ${escapeHtml(nombre)}
            </span>
            <span style="font-size:0.8rem; opacity:0.85;">
              ${escapeHtml(correo)}
            </span>
          </div>
        </li>
        <li class="header__user-option">
          <a href="optionsPerUser.html">Ir a mi panel</a>
        </li>
        <li class="header__user-option">
          <button
            type="button"
            id="logout-button"
            style="
              background:none;
              border:none;
              padding:0;
              margin:0;
              font:inherit;
              color:var(--darkblueText);
              cursor:pointer;
              text-align:left;
              width:100%;
            "
          >
            Cerrar sesión
          </button>
        </li>
      </ul>
    `;

    const logoutBtn = userMenu.querySelector("#logout-button");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("user");
        window.location.href = "logIn.html";
      });
    }
  }

  // ---- 3) Botones grandes de la pantalla "¿Qué quieres hacer hoy?" ----
  const buttons = document.querySelectorAll(".options__button");

  if (buttons[0]) {
    // Ver mi lista / registrar productos
    buttons[0].addEventListener("click", () => {
      window.location.href = "registerProducts.html";
    });
  }

  if (buttons[1]) {
    // Historial de compras
    buttons[1].addEventListener("click", () => {
      window.location.href = "orderHistory.html";
    });
  }

  if (buttons[2]) {
    // Cambiar método de pago
    buttons[2].addEventListener("click", () => {
      window.location.href = "addPaymetMet.html";
    });
  }

  document.getElementById("payment-btn").addEventListener("click", () => {
    window.location.href = "addPaymetMet.html";
  });

})();
