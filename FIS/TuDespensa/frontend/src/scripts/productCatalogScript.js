const BACKEND_URL = "https://tudespensa-back.juanmarp121.workers.dev";

document.addEventListener("DOMContentLoaded", () => {
  const selectCatalog = document.getElementById("product-catalog");
  const hiddenName = document.getElementById("product-name"); // el que tu JS ya usa

  // campos opcionales para auto-llenar
  const brandInput = document.getElementById("product-brand");
  const unitSelect = document.getElementById("product-unit");
  const priceInput = document.getElementById("product-price");
  const supermarketSelect = document.getElementById("supermarket");

  if (!selectCatalog || !hiddenName) return;

  // Campo visible cuando se elige "Otro"
  let manualNameInput = document.getElementById("product-name-manual");
  if (!manualNameInput) {
    // si no existe, reutilizamos el mismo hidden como visible
    manualNameInput = hiddenName;
  }

  async function cargarProductos() {
    try {
      const res = await fetch(`${BACKEND_URL}/api/productos`);
      const data = await res.json();

      if (!data.ok || !Array.isArray(data.productos)) {
        console.warn("Respuesta inesperada al cargar productos", data);
        return;
      }

      // Agregamos las opciones después de las existentes (Selecciona / Otro)
      data.productos.forEach((p) => {
        const opt = document.createElement("option");
        opt.value = String(p.id_producto_supermercado);
        opt.textContent = `${p.nombre_producto} (${p.marca})`;

        opt.dataset.nombre = p.nombre_producto;
        opt.dataset.marca = p.marca || "";
        opt.dataset.unidad = p.unidad_medida || "";
        opt.dataset.precio = p.precio != null ? String(p.precio) : "";
        opt.dataset.supermercado = p.id_supermercado != null ? String(p.id_supermercado) : "";

        selectCatalog.appendChild(opt);
      });
    } catch (err) {
      console.error("No se pudieron cargar los productos", err);
    }
  }

  // Sincroniza el input oculto con lo que elija/escriba el usuario
  function actualizarHiddenDesdeManual() {
    hiddenName.value = manualNameInput.value;
  }

  selectCatalog.addEventListener("change", () => {
    const value = selectCatalog.value;

    if (!value) {
      manualNameInput.style.display = "none";
      hiddenName.value = "";
      return;
    }

    if (value === "otro") {
      // El usuario va a escribir su propio producto
      manualNameInput.style.display = "block";
      manualNameInput.value = "";
      hiddenName.value = "";

      if (brandInput) brandInput.value = "";
      if (unitSelect) unitSelect.value = "";
      if (priceInput) priceInput.value = "";

      manualNameInput.focus();
      return;
    }

    // Producto del catálogo
    const opt = selectCatalog.selectedOptions[0];
    if (!opt) return;

    manualNameInput.style.display = "none";

    const nombre = opt.dataset.nombre || opt.textContent;
    const marca = opt.dataset.marca || "";
    const unidad = opt.dataset.unidad || "";
    const precio = opt.dataset.precio || "";
    const superId = opt.dataset.supermercado || "";

    hiddenName.value = nombre;

    if (brandInput) brandInput.value = marca;
    if (priceInput && precio) priceInput.value = precio;
    if (unitSelect && unidad) unitSelect.value = unidad;
    if (supermarketSelect && superId) supermarketSelect.value = superId;
  });

  manualNameInput.addEventListener("input", actualizarHiddenDesdeManual);

  // Cargar catálogo desde la base
  cargarProductos();
});
