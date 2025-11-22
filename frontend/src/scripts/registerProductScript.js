// URL de tu backend
const API_BASE = "https://tudespensa-back.juanmarp121.workers.dev";

document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("rp-products-grid");
  const totalLabel = document.getElementById("rp-summary-total");
  const confirmBtn = document.getElementById("rp-confirm-btn");

  // Modal elements
  const fabAdd = document.getElementById("rp-fab-add");
  const modalBackdrop = document.getElementById("rp-modal-backdrop");
  const modalClose = document.getElementById("rp-modal-cancel");
  const modalCloseFooter = document.getElementById("rp-modal-cancel-footer");
  const modalAddBtn = document.getElementById("rp-modal-add");

  // Inputs del modal
  const inputName = document.getElementById("rp-custom-name");
  const inputQty = document.getElementById("rp-product-qty");
  const inputPrice = document.getElementById("rp-product-price");
  const selectProduct = document.getElementById("rp-product-select");
  const customNameWrapper = document.getElementById("rp-custom-name-wrapper");

  // 1. OBTENER USUARIO
  let usuarioId = null;
  try {
    const raw = localStorage.getItem("user") || localStorage.getItem("usuarioActual");
    if (raw) usuarioId = JSON.parse(raw).id;
  } catch (e) { console.error(e); }

  if (!usuarioId) {
    alert("Inicia sesión para ver tu lista.");
    window.location.href = "logIn.html";
    return;
  }

  // 2. CARGAR PRODUCTOS
  cargarProductos();

  async function cargarProductos() {
    grid.innerHTML = "<p>Cargando productos...</p>";
    try {
      // Ajusta el endpoint según tu backend. Asumo /api/productos
      const res = await fetch(`${API_BASE}/api/productos?usuario_id=${usuarioId}`);
      const data = await res.json();

      if (!data.ok) {
        grid.innerHTML = "<p>No hay productos en tu lista.</p>";
        totalLabel.textContent = "$0";
        return;
      }

      const productos = data.productos || []; // O data simplemente si es un array
      renderizarGrid(productos);
    } catch (e) {
      console.error(e);
      grid.innerHTML = "<p>Error cargando lista.</p>";
    }
  }

  function renderizarGrid(lista) {
    grid.innerHTML = "";
    let sumaTotal = 0;

    if(lista.length === 0) {
      grid.innerHTML = "<p style='text-align:center; width:100%'>Tu lista está vacía. ¡Agrega algo!</p>";
      totalLabel.textContent = "$0";
      return;
    }

    lista.forEach(prod => {
      const card = document.createElement("div");
      card.className = "rp-card";

      const subtotal = (prod.precio || 0) * (prod.cantidad || 1);
      sumaTotal += subtotal;

      card.innerHTML = `
        <div class="rp-card-header">
          <h3 class="rp-card-title">${prod.nombre_producto || prod.nombre}</h3>
          <button class="rp-card-delete" data-id="${prod.id}">×</button>
        </div>
        <div class="rp-card-body">
          <p>Cant: <strong>${prod.cantidad}</strong></p>
          <p>Precio: <strong>$${prod.precio}</strong></p>
          <p class="rp-card-price">Total: $${subtotal}</p>
        </div>
      `;

      // Botón eliminar
      card.querySelector(".rp-card-delete").addEventListener("click", () => eliminarProducto(prod.id));
      grid.appendChild(card);
    });

    totalLabel.textContent = `$${sumaTotal.toLocaleString()}`;
  }

  // 3. AGREGAR PRODUCTO (Lógica del Modal)
  fabAdd.addEventListener("click", () => modalBackdrop.classList.add("visible"));

  const cerrarModal = () => modalBackdrop.classList.remove("visible");
  modalClose.addEventListener("click", cerrarModal);
  modalCloseFooter.addEventListener("click", cerrarModal);

  // Mostrar input de nombre si elige "Otro"
  selectProduct.addEventListener("change", (e) => {
    if(e.target.value === "__otro__") {
      customNameWrapper.classList.remove("rp-field-hidden");
    } else {
      customNameWrapper.classList.add("rp-field-hidden");
    }
  });

  modalAddBtn.addEventListener("click", async () => {
    const nombre = inputName.value || selectProduct.options[selectProduct.selectedIndex].text;
    const cantidad = inputQty.value;
    const precio = inputPrice.value;

    if(!nombre || !cantidad || !precio) return alert("Llena todos los datos");

    const nuevoProducto = {
      id_usuario: usuarioId,
      nombre_producto: nombre,
      cantidad: parseInt(cantidad),
      precio: parseFloat(precio),
      categoria: "Varios" // Valor por defecto
    };

    try {
      const res = await fetch(`${API_BASE}/api/productos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevoProducto)
      });

      if(res.ok) {
        cerrarModal();
        cargarProductos(); // Recargar lista
      } else {
        alert("Error guardando producto");
      }
    } catch(e) {
      alert("Error de conexión");
    }
  });

  async function eliminarProducto(id) {
    if(!confirm("¿Borrar producto?")) return;
    try {
      await fetch(`${API_BASE}/api/productos/${id}`, { method: 'DELETE' });
      cargarProductos();
    } catch(e) { console.error(e); }
  }

  // 4. CONFIRMAR PEDIDO (Generar Factura)
  confirmBtn.addEventListener("click", async () => {
    // Aquí llamarías al endpoint de "Checkout" o generar factura
    if(grid.children.length === 0) return alert("La lista está vacía");

    try {
      // Suponiendo un endpoint para convertir carrito en pedido
      const res = await fetch(`${API_BASE}/api/pedidos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_usuario: usuarioId })
      });

      if(res.ok) {
        alert("✅ ¡Lista confirmada! Tu pedido ha sido generado.");
        window.location.href = "orderHistory.html";
      } else {
        alert("Error al confirmar la lista.");
      }
    } catch(e) { alert("Error de conexión"); }
  });
});