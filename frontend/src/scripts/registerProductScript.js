const API_BASE = "https://tudespensa-back.juanmarp121.workers.dev/api";

document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("rp-products-grid");
  const totalLabel = document.getElementById("rp-summary-total");
  const confirmBtn = document.getElementById("rp-confirm-btn");
  const fabAdd = document.getElementById("rp-fab-add");

  if (!grid) return;

  // 1. Validar Usuario
  let usuarioId = null;
  try {
    const userStr = localStorage.getItem("user") || localStorage.getItem("usuarioActual");
    if (userStr) usuarioId = JSON.parse(userStr).id;
  } catch (e) { console.error(e); }

  if (!usuarioId) {
    alert("Inicia sesión para ver tu lista.");
    window.location.href = "logIn.html";
    return;
  }

  // 2. Cargar Lista (Desde Cloudflare)
  cargarProductos();

  async function cargarProductos() {
    grid.innerHTML = "<p style='text-align:center; width:100%'>Cargando...</p>";
    try {
      const res = await fetch(`${API_BASE}/productos?usuario_id=${usuarioId}`);
      if (!res.ok) throw new Error("Error API");
      const data = await res.json();
      const productos = Array.isArray(data) ? data : (data.results || []);
      renderizarGrid(productos);
    } catch (e) {
      grid.innerHTML = "<p style='text-align:center; color:red'>Error conectando con la nube.</p>";
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
      const precio = parseFloat(p.precio) || 0;
      const cant = parseInt(p.cantidad) || 1;
      const subtotal = precio * cant;
      total += subtotal;

      const card = document.createElement("div");
      card.className = "rp-card";
      card.innerHTML = `
                <div class="rp-card-header"><h3 class="rp-card-title">${p.nombre || "Producto"}</h3></div>
                <div class="rp-card-body">
                    <p>Cant: <strong>${cant}</strong></p>
                    <p class="rp-card-price">$${subtotal.toLocaleString('es-CO')}</p>
                </div>
            `;
      grid.appendChild(card);
    });

    if(totalLabel) totalLabel.innerText = "$" + total.toLocaleString('es-CO');
    sessionStorage.setItem('totalPedido', total);
  }

  // 3. CONFIRMAR PEDIDO + NOTIFICACIÓN
  if (confirmBtn) {
    confirmBtn.addEventListener("click", async () => {
      const total = parseFloat(sessionStorage.getItem('totalPedido') || 0);
      if (total <= 0) return alert("Lista vacía.");

      if(!confirm("¿Confirmar pedido por $" + total.toLocaleString('es-CO') + "?")) return;

      confirmBtn.innerText = "Procesando...";
      confirmBtn.disabled = true;

      const pedido = {
        usuario_id: usuarioId,
        total: total,
        estado: "Entregado",
        fecha: new Date().toISOString().split('T')[0]
      };

      try {
        // A. Enviar a Cloudflare
        const res = await fetch(`${API_BASE}/pedidos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pedido)
        });

        if (res.ok) {
          // B. ¡MAGIA! Guardar Notificación Local
          guardarNotificacion(`Tu pedido de $${total.toLocaleString('es-CO')} fue recibido exitosamente.`, "EXITO");

          alert("✅ ¡Pedido confirmado!");
          window.location.href = "orderHistory.html";
        } else {
          alert("Error al guardar pedido.");
        }
      } catch (e) {
        alert("Error de conexión.");
      } finally {
        confirmBtn.innerText = "Confirmar mi lista";
        confirmBtn.disabled = false;
      }
    });
  }

  // Función auxiliar para guardar en localStorage
  function guardarNotificacion(mensaje, tipo) {
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