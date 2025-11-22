// URL real de tu worker
const API_BASE = "https://tudespensa-back.juanmarp121.workers.dev";

document.addEventListener("DOMContentLoaded", () => {
  const historyList = document.getElementById("history-list");
  const summaryContainer = document.getElementById("order-summary");
  const summaryBody = document.getElementById("order-summary-body");
  const supplierName = document.getElementById("supplier-name");
  const orderTotal = document.getElementById("order-total");
  const darkLayer = document.querySelector(".dark__layer");
  const returnBtn = document.getElementById("return-btn");
  const closeBtn = document.getElementById("order-summary-close");

  // ============= 1. Volver al panel =============
  if (returnBtn) {
    returnBtn.addEventListener("click", () => {
      window.location.href = "optionsPerUser.html";
    });
  }

  // ============= 2. Obtener usuario actual =============
  let usuarioId = null;
  let nombreUsuario = "";
  try {
    const raw =
      localStorage.getItem("user") || localStorage.getItem("usuarioActual");
    if (raw) {
      const u = JSON.parse(raw);
      usuarioId = u.id || u.id_usuario;
      nombreUsuario = u.nombre || u.name || "";
    }
  } catch (e) {
    console.error("Error leyendo usuario de localStorage:", e);
  }

  if (!usuarioId) {
    alert("Debes iniciar sesión para ver tu historial de compras.");
    window.location.href = "logIn.html";
    return;
  }

  // ============= 3. Cargar historial de compras =============
  cargarHistorial(usuarioId);

  async function cargarHistorial(idUsuario) {
    historyList.innerHTML = "<li>Cargando historial...</li>";

    try {
      const resp = await fetch(
        `${API_BASE}/api/historial-compras?usuarioId=${encodeURIComponent(
          idUsuario
        )}`
      );
      const data = await resp.json();

      if (!data.ok) {
        console.error("Error en historial:", data);
        historyList.innerHTML = `<li>No se pudo cargar el historial: ${
          data.message || "Error"
        }</li>`;
        return;
      }

      const compras = data.compras || [];
      if (!compras.length) {
        historyList.innerHTML =
          "<li>Aún no tienes compras registradas.</li>";
        return;
      }

      historyList.innerHTML = compras
        .map((c) => itemHistorialHTML(c))
        .join("");

      // listeners para abrir el modal
      historyList
        .querySelectorAll(".history__item")
        .forEach((item) =>
          item.addEventListener("click", () => {
            const idFactura = item.dataset.idFactura;
            cargarDetalle(idFactura);
          })
        );
    } catch (e) {
      console.error("Error fetch historial:", e);
      historyList.innerHTML =
        "<li>Ocurrió un error al cargar el historial.</li>";
    }
  }

  function itemHistorialHTML(c) {
    const fecha = c.fecha_emision || c.fecha_pedido || "";
    const fechaFmt = formatearFecha(fecha);
    const totalFmt = formatearMoneda(c.total);
    const superNombre = c.nombre_supermercado || "Supermercado";

    return `
      <li class="history__item" data-id-factura="${c.id_factura}">
        <p class="date">${fechaFmt}</p>
        <p><strong>Supermercado:</strong> ${superNombre}</p>
        <p><strong>Pedido:</strong> #${c.id_pedido}</p>
        <p><strong>Factura:</strong> #${c.id_factura}</p>
        <p><strong>Total:</strong> ${totalFmt}</p>
        <p><strong>Estado:</strong> ${c.estado_pedido || "—"}</p>
      </li>
    `;
  }

  // ============= 4. Cargar detalle en el modal =============
  async function cargarDetalle(idFactura) {
    if (!idFactura) return;

    summaryBody.innerHTML = "<div>Cargando detalle...</div>";
    supplierName.textContent = "";
    orderTotal.textContent = "$0";

    abrirModal();

    try {
      const resp = await fetch(`${API_BASE}/api/facturas/${idFactura}`);
      const data = await resp.json();

      if (!data.ok) {
        summaryBody.innerHTML = `<div>No se pudo cargar el detalle: ${
          data.message || "Error"
        }</div>`;
        return;
      }

      const f = data.factura;
      const detalles = data.detalles || [];

      supplierName.textContent =
        f.nombre_supermercado || "Supermercado no especificado";
      orderTotal.textContent = formatearMoneda(f.total);

      if (!detalles.length) {
        summaryBody.innerHTML =
          "<div>No hay detalle registrado para esta factura.</div>";
      } else {
        summaryBody.innerHTML = detalles
          .map(
            (d) => `
          <div class="order__summary-row">
            <span>${d.descripcion_producto}</span>
            <span>${d.cantidad}</span>
            <span>ud</span>
            <span>${formatearMoneda(d.precio_unitario)}</span>
          </div>
        `
          )
          .join("");
      }
    } catch (e) {
      console.error("Error cargando detalle:", e);
      summaryBody.innerHTML =
        "<div>Ocurrió un error al cargar el detalle.</div>";
    }
  }

  // ============= 5. Abrir / cerrar modal =============
  function abrirModal() {
    summaryContainer.classList.add("open");
    darkLayer.classList.add("active");
  }

  function cerrarModal() {
    summaryContainer.classList.remove("open");
    darkLayer.classList.remove("active");
  }

  if (darkLayer) {
    darkLayer.addEventListener("click", cerrarModal);
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", cerrarModal);
  }
});

// ============= 6. Utilidades de formato =============
function formatearFecha(fechaStr) {
  if (!fechaStr) return "";
  const limpio = fechaStr.replace(" ", "T");
  const d = new Date(limpio);
  if (isNaN(d.getTime())) return fechaStr;
  return d.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function formatearMoneda(valor) {
  const num = Number(valor || 0);
  return num.toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });
}
