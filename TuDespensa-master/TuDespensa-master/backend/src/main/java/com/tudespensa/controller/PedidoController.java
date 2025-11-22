package com.tudespensa.controller;

import com.tudespensa.model.Notificacion;
import com.tudespensa.model.Pedido;
import com.tudespensa.repository.NotificacionRepository;
import com.tudespensa.repository.PedidoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/pedidos")
@CrossOrigin(origins = "*")
public class PedidoController {

    @Autowired
    private PedidoRepository pedidoRepositorio;

    @Autowired
    private NotificacionRepository notificacionRepositorio;

    @PostMapping
    public Pedido generar(@RequestBody Pedido pedido) {
        pedido.setFecha(LocalDate.now());

        // Estado por defecto si viene nulo
        if(pedido.getEstado() == null) {
            pedido.setEstado("Pendiente");
        }

        Pedido guardado = pedidoRepositorio.save(pedido);

        // --- LÓGICA DE NOTIFICACIÓN ---
        // Crea una notificación automática al confirmar pedido
        try {
            Notificacion notif = new Notificacion();
            notif.setFecha(LocalDate.now());
            notif.setTipo("Info");
            notif.setMensaje("Pedido #" + guardado.getId() + " confirmado. Total: $" + guardado.getTotal());
            notificacionRepositorio.save(notif);
        } catch (Exception e) {
            // Ignoramos error de notificación para no fallar el pedido
            System.err.println("Error creando notificación: " + e.getMessage());
        }
        // -----------------------------------

        return guardado;
    }

    @GetMapping
    public List<Pedido> historial() {
        return pedidoRepositorio.findAll();
    }
}