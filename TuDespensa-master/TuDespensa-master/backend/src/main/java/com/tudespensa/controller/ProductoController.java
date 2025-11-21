package com.tudespensa.controller;

import com.tudespensa.model.Notificacion;
import com.tudespensa.model.Producto;
import com.tudespensa.repository.NotificacionRepository;
import com.tudespensa.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = "*")
public class ProductoController {

    @Autowired
    private ProductoRepository productoRepositorio;

    @Autowired
    private NotificacionRepository notificacionRepositorio; // <-- ¡Nuevo!

    @PostMapping
    public Producto guardar(@RequestBody Producto producto) {
        Producto guardado = productoRepositorio.save(producto);

        // --- LÓGICA REAL DE ALERTA DE STOCK ---
        if (guardado.getCantidad() != null && guardado.getCantidad() < 5) {
            Notificacion alerta = new Notificacion();
            alerta.setFecha(LocalDate.now());
            alerta.setTipo("Alerta"); // Tipo diferente para que se vea la urgencia
            alerta.setMensaje("Stock bajo: Solo quedan " + guardado.getCantidad() + " unidades de " + guardado.getNombre());
            notificacionRepositorio.save(alerta);
        }
        // --------------------------------------

        return guardado;
    }

    @GetMapping
    public List<Producto> listar() {
        return productoRepositorio.findAll();
    }

    // Método para borrar (si lo necesitas)
    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        productoRepositorio.deleteById(id);
    }
}