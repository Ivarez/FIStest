const API_BASE = "https://tudespensa-back.juanmarp121.workers.dev/api";

document.addEventListener("DOMContentLoaded", () => {
  // Elementos del DOM
  const grid = document.getElementById("rp-products-grid");
  const totalLabel = document.getElementById("rp-summary-total");
  const confirmBtn = document.getElementById("rp-confirm-btn");

  // Validar que estamos en la pantalla correcta
  if (!grid) return;

  // 1. Obtener ID del Usuario (del Login)
  let usuarioId = null;
  try {
    const userStr = localStorage.getItem("user") || localStorage.getItem("usuarioActual");
    if (userStr) usuarioId = JSON.parse(userStr).id;
  } catch (e) { console.error(e); }

  if (!usuarioId) {
    alert("Debes iniciar sesión para ver tu lista.");
    window.location.href = "logIn.html";
    return;
  }

  // 2. Cargar la Lista Personalizada
  cargarProductos();

  async function cargarProductos() {
    grid.innerHTML = "<p style='text-align:center; width:100%'>Cargando tu lista...</p>";

    try {
      // Petición filtrada por usuario (Requisito cumplido)
      const res = await fetch(`${API_BASE}/productos?usuario_id=${usuarioId}`);

      if (!res.ok) throw new Error("Error API");
      const data = await res.json();

      // Manejo de respuesta de Cloudflare (Array o { results: [] })
      const productos = Array.isArray(data) ? data : (data.results || []);

      renderizarGrid(productos);
    } catch (e) {
      console.error(e);
      grid.innerHTML = "<p style='text-align:center; color:red'>Error conectando con el servidor.</p>";
    }
  }

  function renderizarGrid(productos) {
    grid.innerHTML = "";
    let total = 0;

    if (productos.length === 0) {
      grid.innerHTML = "<p style='text-align:center; width:100%'>Tu lista está vacía.</p>";
      if(totalLabel) totalLabel.innerText = "$0";
      return;
    }

    productos.forEach(p => {
      // Asegurar números
      const precio = parseFloat(p.precio) || 0;
      const cant = parseInt(p.cantidad) || 1;
      const subtotal = precio * cant;
      total += subtotal;

      // Crear Tarjeta
      const card = document.createElement("div");
      card.className = "rp-card";
      card.innerHTML = `
                <div class="rp-card-header">
                    <h3 class="rp-card-title">${p.nombre || "Producto"}</h3>
                </div>
                <div class="rp-card-body">
                    <p>Categoría: ${p.categoria || "Varios"}</p>
                    <p>Cant: <strong>${cant}</strong></p>
                    <p class="rp-card-price">$${subtotal.toLocaleString('es-CO')}</p>
                </div>
            `;
      grid.appendChild(card);
    });

    // Actualizar Total
    if(totalLabel) totalLabel.innerText = "$" + total.toLocaleString('es-CO');
    // Guardar total para el pedido
    sessionStorage.setItem('totalPedido', total);
  }

  // 3. Confirmar Pedido (Requisito cumplido)
  if (confirmBtn) {
    confirmBtn.addEventListener("click", async () => {
      const total = parseFloat(sessionStorage.getItem('totalPedido') || 0);

      if (total <= 0) {
        alert("Agrega productos antes de confirmar.");
        return;
      }

      if(!confirm("¿Confirmar pedido por $" + total.toLocaleString('es-CO') + "?")) return;

      confirmBtn.innerText = "Procesando...";
      confirmBtn.disabled = true;

      const pedido = {
        usuario_id: usuarioId,
        total: total,
        estado: "Entregado", // Requisito: "Automáticamente se entrega"
        fecha: new Date().toISOString().split('T')[0]
      };

      try {
        const res = await fetch(`${API_BASE}/pedidos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pedido)
        });

        if (res.ok) {
          // --- MAGIA: Guardar Notificación Local ---
          guardarNotificacionLocal(`Tu pedido por $${total.toLocaleString('es-CO')} ha sido confirmado y entregado.`, 'EXITO');

          alert("✅ ¡Pedido generado y entregado con éxito!");
          window.location.href = "orderHistory.html"; // Ir al historial
        } else {
          alert("Error al guardar el pedido.");
        }
      } catch (e) {
        console.error(e);
        alert("Error de conexión.");
      } finally {
        confirmBtn.innerText = "Confirmar mi lista";
        confirmBtn.disabled = false;
      }
    });
  }

  // Función para guardar notificación en localStorage (Simulación Backend)
  function guardarNotificacionLocal(mensaje, tipo) {
    const notifs = JSON.parse(localStorage.getItem("mis_notificaciones") || "[]");
    notifs.unshift({
      id: Date.now(),
      mensaje: mensaje,
      tipo: tipo,
      fecha: new Date().toLocaleString()
    });
    localStorage.setItem("mis_notificaciones", JSON.stringify(notifs));
  }
});