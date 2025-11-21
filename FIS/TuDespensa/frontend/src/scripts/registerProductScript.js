// frontend/src/scripts/registerProductScript.js

document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ registerProductScript cargado");

  const API_BASE = "https://tudespensa-back.juanmarp121.workers.dev";

  // Elementos principales
  const grid = document.getElementById("rp-products-grid");
  const totalLabel = document.getElementById("rp-summary-total");
  const fabAdd = document.getElementById("rp-fab-add");
  const confirmBtn = document.getElementById("rp-confirm-btn");

  // Modal
  const modalBackdrop = document.getElementById("rp-modal-backdrop");
  const selectProduct = document.getElementById("rp-product-select");
  const inputPrice = document.getElementById("rp-product-price");
  const inputQty = document.getElementById("rp-product-qty");
  const btnModalCancel = document.getElementById("rp-modal-cancel");
  const btnModalCancelFooter = document.getElementById("rp-modal-cancel-footer");
  const btnModalAdd = document.getElementById("rp-modal-add");
  const modalTitle = document.getElementById("rp-modal-title");

  const customNameWrapper = document.getElementById("rp-custom-name-wrapper");
  const inputCustomName = document.getElementById("rp-custom-name");

  const STORAGE_KEY = "tudespensa_mi_lista_productos";

  /** Estructura de cada item:
   * {
   *   id: string,
   *   nombre: string,
   *   cantidad: number,
   *   precioUnitario: number,
   *   subtotal: number,
   *   origen: "catalogo" | "otro",
   *   productoIdCatalogo: number | null
   * }
   */
  let products = [];
  let editingIndex = null; // null = modo agregar, número = índice a editar

  // ======================
  // Helpers de storage
  // ======================
  function loadProducts() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      console.error("Error leyendo storage de productos:", e);
      return [];
    }
  }

  function saveProducts() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    } catch (e) {
      console.error("Error guardando storage de productos:", e);
    }
  }

  // ======================
  // Render
  // ======================
  function renderProducts() {
    grid.innerHTML = "";

    if (!products.length) {
      const empty = document.createElement("p");
      empty.textContent =
        "Aún no has agregado productos. Usa el botón (+) para comenzar.";
      empty.style.fontSize = "14px";
      empty.style.color = "#6b7280";
      grid.appendChild(empty);
      totalLabel.textContent = "$0";
      return;
    }

    let total = 0;

    products.forEach((item, index) => {
      const card = document.createElement("article");
      card.className = "rp-card";

      const header = document.createElement("div");
      header.className = "rp-card-header";

      const nameEl = document.createElement("p");
      nameEl.className = "rp-card-name";
      nameEl.textContent = item.nombre;

      const icon = document.createElement("div");
      icon.className = "rp-card-icon";
      icon.textContent = "🛒";

      header.appendChild(nameEl);
      header.appendChild(icon);

      const body = document.createElement("div");
      body.className = "rp-card-body";

      const row1 = document.createElement("div");
      row1.className = "rp-card-row";
      row1.innerHTML = `<span>Cantidad</span><strong>${item.cantidad}</strong>`;

      const row2 = document.createElement("div");
      row2.className = "rp-card-row";
      row2.innerHTML = `<span>Precio unitario</span><strong>$${item.precioUnitario.toLocaleString(
        "es-CO"
      )}</strong>`;

      const row3 = document.createElement("div");
      row3.className = "rp-card-row";
      row3.innerHTML = `<span>Subtotal</span><strong>$${item.subtotal.toLocaleString(
        "es-CO"
      )}</strong>`;

      body.appendChild(row1);
      body.appendChild(row2);
      body.appendChild(row3);

      const actions = document.createElement("div");
      actions.className = "rp-card-actions";

      // Botón EDITAR
      const btnEdit = document.createElement("button");
      btnEdit.className = "rp-btn-small rp-btn-edit";
      btnEdit.textContent = "Editar";
      btnEdit.addEventListener("click", () => {
        openModal("edit", index);
      });

      // Botón ELIMINAR
      const btnDelete = document.createElement("button");
      btnDelete.className = "rp-btn-small rp-btn-delete";
      btnDelete.textContent = "Eliminar";
      btnDelete.addEventListener("click", () => {
        products.splice(index, 1);
        saveProducts();
        renderProducts();
      });

      actions.appendChild(btnEdit);
      actions.appendChild(btnDelete);

      card.appendChild(header);
      card.appendChild(body);
      card.appendChild(actions);

      grid.appendChild(card);

      total += item.subtotal;
    });

    totalLabel.textContent = `$${total.toLocaleString("es-CO")}`;
  }

  // ======================
  // Modal: abrir / cerrar
  // ======================
  function resetModalToAddMode() {
    editingIndex = null;
    modalTitle.textContent = "Agregar producto";
    btnModalAdd.textContent = "Agregar";

    if (selectProduct) selectProduct.value = "";
    if (inputQty) inputQty.value = "1";
    if (inputPrice) {
      inputPrice.value = "";
      inputPrice.readOnly = false;
    }
    if (inputCustomName) inputCustomName.value = "";
    if (customNameWrapper) customNameWrapper.classList.add("rp-field-hidden");
  }

  function openModal(mode = "add", index = null) {
    if (!modalBackdrop) return;

    if (mode === "edit" && index !== null && products[index]) {
      // ----- MODO EDICIÓN -----
      editingIndex = index;
      const item = products[index];

      modalTitle.textContent = "Editar producto";
      btnModalAdd.textContent = "Guardar cambios";

      const origen = item.origen || (item.productoIdCatalogo ? "catalogo" : "otro");

      if (origen === "catalogo" && item.productoIdCatalogo) {
        // Intentamos seleccionar el producto del catálogo
        const valueStr = String(item.productoIdCatalogo);
        let foundOption = null;
        Array.from(selectProduct.options).forEach((opt) => {
          if (opt.value === valueStr) foundOption = opt;
        });

        if (foundOption) {
          selectProduct.value = valueStr;
          customNameWrapper.classList.add("rp-field-hidden");
          inputPrice.readOnly = true;
          inputPrice.value =
            foundOption.dataset.precio || String(item.precioUnitario || "");
        } else {
          // Si no encontramos el producto, lo tratamos como "otro"
          selectProduct.value = "__otro__";
          customNameWrapper.classList.remove("rp-field-hidden");
          inputCustomName.value = item.nombre;
          inputPrice.readOnly = false;
          inputPrice.value = String(item.precioUnitario || "");
        }
      } else {
        // Producto creado como "otro"
        selectProduct.value = "__otro__";
        customNameWrapper.classList.remove("rp-field-hidden");
        inputCustomName.value = item.nombre;
        inputPrice.readOnly = false;
        inputPrice.value = String(item.precioUnitario || "");
      }

      inputQty.value = String(item.cantidad || 1);
    } else {
      // ----- MODO AGREGAR -----
      resetModalToAddMode();
    }

    modalBackdrop.classList.add("active");
    modalBackdrop.setAttribute("aria-hidden", "false");
  }

  function closeModal() {
    if (!modalBackdrop) return;
    modalBackdrop.classList.remove("active");
    modalBackdrop.setAttribute("aria-hidden", "true");
    resetModalToAddMode();
  }

  // ======================
  // Llenar selector con productos desde la API
  // ======================
  async function loadCatalog() {
    try {
      const resp = await fetch(`${API_BASE}/api/productos`);
      const data = await resp.json();

      if (!Array.isArray(data)) {
        console.warn("Respuesta de /api/productos no es un array:", data);
        return;
      }

      // Limpiamos opciones
      while (selectProduct.options.length > 0) {
        selectProduct.remove(0);
      }

      const placeholder = document.createElement("option");
      placeholder.value = "";
      placeholder.textContent = "Selecciona un producto…";
      selectProduct.appendChild(placeholder);

      data.forEach((p) => {
        const opt = document.createElement("option");
        opt.value = String(p.id);
        opt.textContent = `${p.nombre} - $${p.precio.toLocaleString("es-CO")}`;
        opt.dataset.precio = p.precio;
        opt.dataset.nombre = p.nombre;
        selectProduct.appendChild(opt);
      });

      const optOtro = document.createElement("option");
      optOtro.value = "__otro__";
      optOtro.textContent = "➕ Otro producto…";
      selectProduct.appendChild(optOtro);
    } catch (e) {
      console.error("Error cargando catálogo de productos:", e);
    }
  }

  // ======================
  // Eventos del selector
  // ======================
  if (selectProduct) {
    selectProduct.addEventListener("change", () => {
      const val = selectProduct.value;

      if (val === "__otro__") {
        // Mostrar campo de nombre personalizado
        customNameWrapper.classList.remove("rp-field-hidden");
        inputCustomName.focus();
        inputPrice.value = "";
        inputPrice.readOnly = false; // solo en "otro" puede editar precio
      } else if (!val) {
        // Placeholder
        customNameWrapper.classList.add("rp-field-hidden");
        inputCustomName.value = "";
        inputPrice.value = "";
        inputPrice.readOnly = false;
      } else {
        // Producto del catálogo: fijamos precio y lo dejamos solo lectura
        customNameWrapper.classList.add("rp-field-hidden");
        const opt = selectProduct.selectedOptions[0];
        if (opt && opt.dataset.precio) {
          inputPrice.value = opt.dataset.precio;
        } else {
          inputPrice.value = "";
        }
        inputPrice.readOnly = true; // 🔒 no se puede editar precio
      }
    });
  }

  // ======================
  // Crear / actualizar producto desde el modal
  // ======================
  function addOrUpdateProductFromModal() {
    const selected = selectProduct.value;
    let nombre = "";
    let precio = 0;
    const cantidad = Number(inputQty.value || "1");

    if (!cantidad || cantidad <= 0) {
      alert("La cantidad debe ser un número mayor a 0.");
      return;
    }

    let origen = "otro";
    let productoIdCatalogo = null;

    if (selected === "__otro__") {
      nombre = inputCustomName.value.trim();
      if (!nombre) {
        alert("Por favor ingresa el nombre del producto.");
        return;
      }
      precio = Number(inputPrice.value || "0");
      if (!precio || precio <= 0) {
        alert("Por favor ingresa un precio válido para el producto.");
        return;
      }
      origen = "otro";
      productoIdCatalogo = null;
    } else {
      const opt = selectProduct.selectedOptions[0];
      if (!opt || !selected) {
        alert("Por favor selecciona un producto.");
        return;
      }
      nombre = opt.dataset.nombre || opt.textContent || "Producto sin nombre";
      precio = Number(opt.dataset.precio || "0");

      if (!precio || precio <= 0) {
        alert(
          "Este producto del catálogo no tiene precio válido. Revisa el catálogo."
        );
        return;
      }

      origen = "catalogo";
      productoIdCatalogo = Number(selected);
    }

    const subtotal = precio * cantidad;

    if (editingIndex !== null && products[editingIndex]) {
      // --------- Actualizar producto existente ---------
      const old = products[editingIndex];
      products[editingIndex] = {
        ...old,
        nombre,
        cantidad,
        precioUnitario: precio,
        subtotal,
        origen,
        productoIdCatalogo,
      };
    } else {
      // --------- Agregar nuevo producto ---------
      products.push({
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        nombre,
        cantidad,
        precioUnitario: precio,
        subtotal,
        origen,
        productoIdCatalogo,
      });
    }

    saveProducts();
    renderProducts();
    closeModal();
  }

  // ======================
  // Botones
  // ======================
  if (fabAdd) {
    fabAdd.addEventListener("click", () => {
      openModal("add");
    });
  }

  if (btnModalCancel) {
    btnModalCancel.addEventListener("click", () => {
      closeModal();
    });
  }

  if (btnModalCancelFooter) {
    btnModalCancelFooter.addEventListener("click", () => {
      closeModal();
    });
  }

  if (btnModalAdd) {
    btnModalAdd.addEventListener("click", () => {
      addOrUpdateProductFromModal();
    });
  }

  if (confirmBtn) {
    confirmBtn.addEventListener("click", () => {
      if (!products.length) {
        alert("Aún no has agregado productos a tu lista.");
        return;
      }
      alert("Tu lista de productos ha sido guardada localmente. (Demo)");
      // Aquí luego se podría enviar al backend / crear pedido, etc.
    });
  }

  // ======================
  // Inicio
  // ======================
  products = loadProducts();
  renderProducts();
  loadCatalog();

  console.log("🔚 Inicialización de Mi lista de productos completa.");
});
