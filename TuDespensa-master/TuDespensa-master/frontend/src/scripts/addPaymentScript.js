// addPaymentScript.js
// Métodos de pago: UI + validaciones + editar (sin tocar el worker)

(() => {
  const API_BASE = "https://tudespensa-back.juanmarp121.workers.dev";

  // ==========================
  // 1. Usuario actual (sin redirigir al login)
  // ==========================
  let usuarioId = 1; // fallback demo
  let currentUser = null;

  try {
    const stored = localStorage.getItem("currentUser");
    if (stored && stored !== "undefined" && stored !== "null") {
      const parsed = JSON.parse(stored);
      currentUser = parsed;
      if (parsed && (parsed.id || parsed.id_usuario)) {
        usuarioId = parsed.id || parsed.id_usuario;
      }
    }
  } catch (e) {
    console.warn("No se pudo leer currentUser, usando usuario 1:", e);
  }

  // ==========================
  // 2. DOM
  // ==========================
  const existingMethodsContainer = document.getElementById("existing-methods");
  const existingMessageEl = document.getElementById("existing-message");

  const typeButtons = Array.from(
    document.querySelectorAll(".payment__type-btn")
  );

  const aliasInput = document.getElementById("new-alias");

  const cardFieldsGroup = document.querySelector(
    '.payment__fields-group[data-for="Tarjeta"]'
  );
  const nequiFieldsGroup = document.querySelector(
    '.payment__fields-group[data-for="Nequi"]'
  );
  const transferFieldsGroup = document.querySelector(
    '.payment__fields-group[data-for="Transferencia"]'
  );

  const cardHolderInput = document.getElementById("new-card-holder");
  const cardNumberInput = document.getElementById("new-card-number");
  const cardExpiryInput = document.getElementById("new-card-expiry");
  const cardCvvInput = document.getElementById("new-card-cvv");

  const nequiNumberInput = document.getElementById("new-transfer-number-nequi");
  const transferNumberInput = document.getElementById("new-transfer-number");

  const preferredCheckbox = document.getElementById("new-preferred");
  const saveButton = document.getElementById("save-method");
  const messageEl = document.getElementById("payment-message");
  const returnBtn = document.getElementById("return-btn");

  let currentType = "Efectivo";
  let editingMethod = null; // si no es null, estamos editando ese método

  // ==========================
  // 3. Helpers UI
  // ==========================
  function setMessage(msg, isError = false) {
    messageEl.textContent = msg || "";
    if (!msg) return;
    messageEl.style.color = isError ? "#ef4444" : "#16a34a";
  }

  function setExistingMessage(msg) {
    existingMessageEl.textContent = msg || "";
  }

  function clearForm() {
    aliasInput.value = "";
    cardHolderInput.value = "";
    cardNumberInput.value = "";
    cardExpiryInput.value = "";
    cardCvvInput.value = "";
    nequiNumberInput.value = "";
    transferNumberInput.value = "";
    preferredCheckbox.checked = false;
    editingMethod = null;
    saveButton.textContent = "Guardar método de pago";
    setMessage("");
    setType("Efectivo");
  }

  function setType(newType) {
    currentType = newType;

    typeButtons.forEach((btn) => {
      if (btn.dataset.type === newType) {
        btn.classList.add("selected");
      } else {
        btn.classList.remove("selected");
      }
    });

    cardFieldsGroup.style.display = newType === "Tarjeta" ? "block" : "none";
    nequiFieldsGroup.style.display = newType === "Nequi" ? "block" : "none";
    transferFieldsGroup.style.display =
      newType === "Transferencia" ? "block" : "none";

    if (newType === "Efectivo") {
      aliasInput.placeholder = "Ej: Efectivo casa, efectivo oficina";
    } else if (newType === "Tarjeta") {
      aliasInput.placeholder = "Ej: Visa principal, Mastercard repuestos";
    } else if (newType === "Nequi") {
      aliasInput.placeholder = "Ej: Nequi personal, Nequi trabajo";
    } else {
      aliasInput.placeholder = "Ej: Cuenta de ahorros, Daviplata compras";
    }

    setMessage("");
  }

  function getIconForType(tipo) {
    const t = (tipo || "").toLowerCase();
    if (t === "efectivo") return "💵";
    if (t === "tarjeta") return "💳";
    if (t === "nequi") return "📲";
    if (t === "transferencia") return "🏦";
    return "💰";
  }

  function getDetailForMethod(m) {
    const tipo = (m.tipo_pago || "").toLowerCase();
    if (tipo === "tarjeta") {
      return m.ultimos_digitos
        ? `Tarjeta terminada en ${m.ultimos_digitos}`
        : "Tarjeta registrada";
    }
    if (tipo === "nequi") {
      return `Nequi: ${m.numero_transferencia || "—"}`;
    }
    if (tipo === "transferencia") {
      return `Cuenta / Daviplata: ${m.numero_transferencia || "—"}`;
    }
    if (tipo === "efectivo") {
      return "Pagas en efectivo en el punto acordado.";
    }
    return m.tipo_pago || "";
  }

  function tipoBDaUI(tipo) {
    const t = (tipo || "").toLowerCase();
    if (t === "efectivo") return "Efectivo";
    if (t === "tarjeta") return "Tarjeta";
    if (t === "nequi") return "Nequi";
    if (t === "transferencia") return "Transferencia";
    return "Efectivo";
  }

  // ==========================
  // 4. Formateo & validaciones en inputs
  // ==========================

  // Número de tarjeta: solo dígitos, espacios cada 4
  if (cardNumberInput) {
    cardNumberInput.addEventListener("input", (e) => {
      let digits = e.target.value.replace(/\D/g, "");
      if (digits.length > 19) digits = digits.slice(0, 19);
      const groups = [];
      for (let i = 0; i < digits.length; i += 4) {
        groups.push(digits.slice(i, i + 4));
      }
      e.target.value = groups.join(" ");
    });
  }

  // Fecha MM/AA automática y válida (01-12)
  if (cardExpiryInput) {
    cardExpiryInput.addEventListener("input", (e) => {
      let v = e.target.value.replace(/\D/g, "");
      if (v.length > 4) v = v.slice(0, 4);

      if (v.length >= 2) {
        let mm = v.slice(0, 2);
        let n = parseInt(mm, 10);
        if (isNaN(n) || n <= 0) mm = "01";
        else if (n > 12) mm = "12";
        let rest = v.slice(2);
        e.target.value = rest ? `${mm}/${rest}` : mm;
      } else {
        e.target.value = v;
      }
    });
  }

  // CVV: solo dígitos 3-4
  if (cardCvvInput) {
    cardCvvInput.addEventListener("input", (e) => {
      let v = e.target.value.replace(/\D/g, "");
      if (v.length > 4) v = v.slice(0, 4);
      e.target.value = v;
    });
  }

  // Nequi: solo números, 10 dígitos (celular)
  if (nequiNumberInput) {
    nequiNumberInput.addEventListener("input", (e) => {
      let d = e.target.value.replace(/\D/g, "");
      if (d.length > 10) d = d.slice(0, 10);
      e.target.value = d;
    });
  }

  // Transferencia / Daviplata: solo números, 8–20 dígitos
  if (transferNumberInput) {
    transferNumberInput.addEventListener("input", (e) => {
      let d = e.target.value.replace(/\D/g, "");
      if (d.length > 20) d = d.slice(0, 20);
      e.target.value = d;
    });
  }

  // ==========================
  // 5. Backend: cargar métodos
  // ==========================
  async function loadExistingMethods() {
    try {
      const resp = await fetch(
        `${API_BASE}/api/metodos-pago?usuarioId=${encodeURIComponent(
          usuarioId
        )}`
      );
      const data = await resp.json();
      if (!data.ok) {
        console.error("Error backend metodos-pago:", data);
        setExistingMessage("No se pudieron cargar tus métodos de pago.");
        existingMethodsContainer.innerHTML = "";
        return;
      }
      renderExistingMethods(data.metodos || []);
    } catch (e) {
      console.error("Error fetch metodos-pago:", e);
      setExistingMessage("Error al cargar tus métodos de pago.");
      existingMethodsContainer.innerHTML = "";
    }
  }

  function renderExistingMethods(metodos) {
    existingMethodsContainer.innerHTML = "";

    if (!metodos.length) {
      setExistingMessage("Aún no has agregado métodos de pago.");
      return;
    }
    setExistingMessage("");

    metodos.forEach((m) => {
      const card = document.createElement("article");
      card.className = "payment__card";
      const tipoClass = (m.tipo_pago || "").toLowerCase();
      card.classList.add(`payment__card--${tipoClass}`);

      const iconDiv = document.createElement("div");
      iconDiv.className = "payment__card-icon";
      iconDiv.textContent = getIconForType(m.tipo_pago);

      const bodyDiv = document.createElement("div");
      bodyDiv.className = "payment__card-body";

      const title = document.createElement("p");
      title.className = "payment__card-title";
      title.textContent = (m.alias_tarjeta || m.tipo_pago || "").toLowerCase();

      const detail = document.createElement("p");
      detail.className = "payment__card-detail";
      detail.textContent = getDetailForMethod(m);

      bodyDiv.appendChild(title);
      bodyDiv.appendChild(detail);

      if (m.es_preferido) {
        const prefLabel = document.createElement("span");
        prefLabel.className = "payment__card-preferred-label";
        prefLabel.textContent = "Método preferido";
        bodyDiv.appendChild(prefLabel);
      }

      const actionsDiv = document.createElement("div");
      actionsDiv.className = "payment__existing-actions";

      const preferBtn = document.createElement("button");
      preferBtn.className =
        "payment__existing-btn payment__existing-btn--preferido";
      if (m.es_preferido) {
        preferBtn.classList.add("is-active");
        preferBtn.textContent = "Preferido";
      } else {
        preferBtn.textContent = "Preferir";
      }
      preferBtn.addEventListener("click", () =>
        marcarPreferido(m.id_metodo_pago)
      );

      const editBtn = document.createElement("button");
      editBtn.className =
        "payment__existing-btn payment__existing-btn--edit";
      editBtn.textContent = "Editar";
      editBtn.addEventListener("click", () =>
        cargarMetodoEnFormulario(m)
      );

      const deleteBtn = document.createElement("button");
      deleteBtn.className =
        "payment__existing-btn payment__existing-btn--delete";
      deleteBtn.textContent = "Eliminar";
      deleteBtn.addEventListener("click", () =>
        eliminarMetodo(m.id_metodo_pago)
      );

      actionsDiv.appendChild(preferBtn);
      actionsDiv.appendChild(editBtn);
      actionsDiv.appendChild(deleteBtn);

      card.appendChild(iconDiv);
      card.appendChild(bodyDiv);
      card.appendChild(actionsDiv);

      existingMethodsContainer.appendChild(card);
    });
  }

  async function marcarPreferido(idMetodo) {
    try {
      setExistingMessage("");
      const resp = await fetch(
        `${API_BASE}/api/metodo-pago/${idMetodo}/preferido`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ usuarioId }),
        }
      );
      const data = await resp.json();
      if (!data.ok) {
        console.error("Error marcar preferido:", data);
        setExistingMessage("No se pudo marcar como preferido.");
        return;
      }
      await loadExistingMethods();
    } catch (e) {
      console.error("Error marcar preferido:", e);
      setExistingMessage("Error al marcar como preferido.");
    }
  }

  async function eliminarMetodo(idMetodo) {
    const confirmar = window.confirm(
      "¿Seguro que deseas eliminar este método de pago?"
    );
    if (!confirmar) return;

    try {
      setExistingMessage("");
      const resp = await fetch(`${API_BASE}/api/metodo-pago/${idMetodo}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuarioId }),
      });
      const data = await resp.json();
      if (!data.ok) {
        console.error("Error eliminar método:", data);
        setExistingMessage("No se pudo eliminar el método.");
        return;
      }
      // Si estabas editando justo este, resetea el form
      if (editingMethod && editingMethod.id_metodo_pago === idMetodo) {
        clearForm();
      }
      await loadExistingMethods();
    } catch (e) {
      console.error("Error eliminar método:", e);
      setExistingMessage("Error al eliminar el método.");
    }
  }

  // ==========================
  // 6. Editar: cargar datos en el formulario
  // ==========================
  function cargarMetodoEnFormulario(m) {
    editingMethod = m;
    saveButton.textContent = "Actualizar método de pago";

    const tipoUI = tipoBDaUI(m.tipo_pago);
    setType(tipoUI);

    aliasInput.value = m.alias_tarjeta || "";
    preferredCheckbox.checked = !!m.es_preferido;

    // Limpia todos los campos específicos
    cardHolderInput.value = "";
    cardNumberInput.value = "";
    cardExpiryInput.value = "";
    cardCvvInput.value = "";
    nequiNumberInput.value = "";
    transferNumberInput.value = "";

    const tipo = (m.tipo_pago || "").toLowerCase();

    if (tipo === "tarjeta") {
      cardHolderInput.value = m.nombre_titular || "";
      cardExpiryInput.value = m.fecha_expiracion || "";
      // Por seguridad no rellenamos número ni CVV
    } else if (tipo === "nequi") {
      nequiNumberInput.value = m.numero_transferencia || "";
    } else if (tipo === "transferencia") {
      transferNumberInput.value = m.numero_transferencia || "";
    }

    setMessage(`Editando el método "${m.alias_tarjeta || m.tipo_pago}".`);
  }

  // ==========================
  // 7. Crear / actualizar (edición = DELETE + POST)
  // ==========================
  async function submitMetodoPago() {
    setMessage("");

    const tipoUI = currentType; // Efectivo / Tarjeta / Nequi / Transferencia
    const alias = (aliasInput.value || "").trim();
    const esPreferido = !!preferredCheckbox.checked;

    if (!alias) {
      setMessage("Debes ingresar el nombre del método.", true);
      return;
    }

    const payload = {
      usuarioId,
      tipo_pago: tipoUI.toLowerCase(),
      alias_tarjeta: alias,
      es_preferido: esPreferido,
    };

    // Validaciones por tipo
    if (tipoUI === "Tarjeta") {
      const nombreTitular = (cardHolderInput.value || "").trim();
      const numeroTarjeta = (cardNumberInput.value || "").replace(/\s+/g, "");
      const expiry = (cardExpiryInput.value || "").trim();
      const cvv = (cardCvvInput.value || "").trim();

      if (!nombreTitular) {
        setMessage("Debes ingresar el nombre del titular.", true);
        return;
      }

      if (!editingMethod) {
        // CREAR tarjeta: todos obligatorios
        if (!numeroTarjeta || !expiry || !cvv) {
          setMessage(
            "Para tarjeta debes completar número, vencimiento y CVV.",
            true
          );
          return;
        }
      }

      if (numeroTarjeta) {
        if (!/^\d{13,19}$/.test(numeroTarjeta)) {
          setMessage(
            "El número de tarjeta debe tener entre 13 y 19 dígitos.",
            true
          );
          return;
        }
        payload.numero_tarjeta = numeroTarjeta;
      }

      if (cvv) {
        if (!/^\d{3,4}$/.test(cvv)) {
          setMessage("El CVV debe tener 3 o 4 dígitos.", true);
          return;
        }
        payload.cvv = cvv;
      }

      if (expiry) {
        if (!/^\d{2}\/\d{2}$/.test(expiry)) {
          setMessage("La fecha debe tener formato MM/AA.", true);
          return;
        }
        payload.fecha_expiracion = expiry;
      }

      payload.nombre_titular = nombreTitular;
    } else if (tipoUI === "Nequi") {
      const num = (nequiNumberInput.value || "").trim();
      const digits = num.replace(/\D/g, "");
      if (!digits || digits.length !== 10) {
        setMessage("El número de Nequi debe tener 10 dígitos.", true);
        return;
      }
      payload.numero_transferencia = digits;
    } else if (tipoUI === "Transferencia") {
      const num = (transferNumberInput.value || "").trim();
      const digits = num.replace(/\D/g, "");
      if (!digits || digits.length < 8 || digits.length > 20) {
        setMessage(
          "El número de cuenta / Daviplata debe tener entre 8 y 20 dígitos.",
          true
        );
        return;
      }
      payload.numero_transferencia = digits;
    } else {
      // Efectivo
      // Nada extra, solo alias
    }

    try {
      saveButton.disabled = true;

      // Si estamos editando: primero borrar el método viejo (soft delete)
      if (editingMethod) {
        const deleteResp = await fetch(
          `${API_BASE}/api/metodo-pago/${editingMethod.id_metodo_pago}`,
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ usuarioId }),
          }
        );
        const deleteData = await deleteResp.json();
        if (!deleteData.ok) {
          console.error("Error al eliminar para actualizar:", deleteData);
          setMessage("No se pudo actualizar el método (error al borrar).", true);
          saveButton.disabled = false;
          return;
        }
      }

      // Crear uno nuevo (tanto para alta como para "edición")
      const resp = await fetch(`${API_BASE}/api/metodo-pago`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await resp.json();
      if (!data.ok) {
        console.error("Error crear/actualizar método:", data);
        setMessage(
          "Error al guardar el método de pago (" +
            (data.message || "Error") +
            ")",
          true
        );
        saveButton.disabled = false;
        return;
      }

      setMessage(
        editingMethod
          ? "Método de pago actualizado correctamente."
          : "Método de pago creado correctamente.",
        false
      );
      clearForm();
      await loadExistingMethods();
    } catch (e) {
      console.error("Error submit método:", e);
      setMessage("Error al guardar el método de pago.", true);
    } finally {
      saveButton.disabled = false;
    }
  }

  // ==========================
  // 8. Eventos
  // ==========================
  typeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const t = btn.dataset.type;
      if (t) setType(t);
    });
  });

  if (saveButton) {
    saveButton.addEventListener("click", (e) => {
      e.preventDefault();
      submitMetodoPago();
    });
  }

  if (returnBtn) {
    returnBtn.addEventListener("click", () => {
      window.location.href = "optionsPerUser.html";
    });
  }

  // ==========================
  // 9. Inicio
  // ==========================
  setType("Efectivo");
  loadExistingMethods();
})();
