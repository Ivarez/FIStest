const API_BASE = "https://tudespensa-back.juanmarp121.workers.dev/api";

document.addEventListener("DOMContentLoaded", () => {
    cargarMiLista();
});

// 1. Obtener ID del usuario logueado (Del localStorage)
function getUsuarioId() {
    try {
        const userStr = localStorage.getItem("user") || localStorage.getItem("usuarioActual");
        if (!userStr) return null;
        return JSON.parse(userStr).id; // Asegúrate que el objeto tenga 'id'
    } catch (e) {
        return null;
    }
}

// 2. Cargar productos (Requisito: "Que la lista sea personal")
async function cargarMiLista() {
    const container = document.getElementById('lista-container');
    const usuarioId = getUsuarioId();

    if (!usuarioId) {
        alert("Debes iniciar sesión primero.");
        window.location.href = "logIn.html";
        return;
    }

    try {
        // Enviamos el ID para que el backend filtre
        const res = await fetch(`${API_BASE}/productos?usuario_id=${usuarioId}`);

        if (!res.ok) throw new Error("Error al cargar");

        const data = await res.json();
        // Cloudflare a veces devuelve { results: [...] } o directo el array
        const productos = Array.isArray(data) ? data : (data.results || []);

        if (productos.length === 0) {
            container.innerHTML = '<p style="text-align:center">Tu lista está vacía.</p>';
            return;
        }

        container.innerHTML = '';
        let totalCalculado = 0;

        productos.forEach(p => {
            // Sumar al total (Precio * Cantidad)
            const subtotal = (p.precio || 0) * (p.cantidad || 1);
            totalCalculado += subtotal;

            container.innerHTML += `
                <div class="product-item">
                    <div>
                        <h3>${p.nombre}</h3>
                        <small>${p.categoria || 'Varios'} (Cant: ${p.cantidad || 1})</small>
                    </div>
                    <div style="font-weight:bold">$${subtotal.toLocaleString()}</div>
                </div>
            `;
        });

        // Actualizar el total en pantalla
        document.getElementById('total-precio').innerText = '$' + totalCalculado.toLocaleString();
        // Guardamos el total para usarlo al pedir
        sessionStorage.setItem('totalPedido', totalCalculado);

    } catch (e) {
        console.error(e);
        container.innerHTML = '<p style="color:red; text-align:center">Error conectando con Cloudflare.</p>';
    }
}

// 3. Confirmar Pedido (Requisito: "Se genere, se dé como entregado")
async function confirmarPedido() {
    const usuarioId = getUsuarioId();
    const total = parseFloat(sessionStorage.getItem('totalPedido') || 0);

    if (total === 0) {
        alert("No tienes productos para pedir.");
        return;
    }

    const pedido = {
        usuario_id: usuarioId,
        total: total,
        estado: "Entregado", // Como dijo tu compañero: "automáticamente se entrega"
        fecha: new Date().toISOString().split('T')[0] // Fecha hoy YYYY-MM-DD
    };

    try {
        const res = await fetch(`${API_BASE}/pedidos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pedido)
        });

        if (res.ok) {
            alert("✅ ¡Pedido confirmado y entregado!");
            // Opcional: Limpiar la lista después de pedir si el backend lo soporta
            window.location.href = "orderHistory.html"; // Ir al historial para verlo
        } else {
            const errorData = await res.json();
            alert("Error del servidor: " + (errorData.message || "No se pudo crear"));
        }
    } catch (e) {
        console.error(e);
        alert("Error de conexión con el Worker.");
    }
}