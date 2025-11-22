package com.tudespensa.controller;

import com.tudespensa.model.Notificacion;
import com.tudespensa.model.Producto;
import com.tudespensa.repository.NotificacionRepository;
import com.tudespensa.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = "*")
public class ProductoController {

    @Autowired
    private ProductoRepository productoRepositorio;

    @Autowired
    private NotificacionRepository notificacionRepositorio;

    @PostMapping
    public Producto guardar(@RequestBody Producto producto) {
        // HU-003: Registrar fecha de creación automáticamente
        if (producto.getFechaRegistro() == null) {
            producto.setFechaRegistro(LocalDateTime.now());
        }

        Producto guardado = productoRepositorio.save(producto);

        // --- HU-004: Lógica de alerta de stock ---
        if (guardado.getCantidad() != null && guardado.getCantidad() < 5) {
            Notificacion alerta = new Notificacion();
            alerta.setFecha(LocalDate.now());
            alerta.setTipo("Alerta");
            alerta.setMensaje("Stock bajo: Solo quedan " + guardado.getCantidad() + " unidades de " + guardado.getNombre());
            // Aseguramos que no falle si el repositorio de notificaciones no está disponible en pruebas unitarias
            if(notificacionRepositorio != null) {
                notificacionRepositorio.save(alerta);
            }
        }
        // --------------------------------------

        return guardado;
    }

    @GetMapping
    public List<Producto> listar() {
        return productoRepositorio.findAll();
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        productoRepositorio.deleteById(id);
    }
}