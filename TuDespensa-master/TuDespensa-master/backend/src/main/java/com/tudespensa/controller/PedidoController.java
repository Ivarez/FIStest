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
    private NotificacionRepository notificacionRepositorio; // <-- ¡Nuevo!

    @PostMapping
    public Pedido generar(@RequestBody Pedido pedido) {
        pedido.setFecha(LocalDate.now());
        pedido.setEstado("Recibido");
        Pedido guardado = pedidoRepositorio.save(pedido);

        // --- LÓGICA REAL DE NOTIFICACIÓN ---
        Notificacion notif = new Notificacion();
        notif.setFecha(LocalDate.now());
        notif.setTipo("Info");
        notif.setMensaje("Tu pedido #" + guardado.getId() + " por $" + guardado.getTotal() + " ha sido recibido.");
        notificacionRepositorio.save(notif);
        // -----------------------------------

        return guardado;
    }

    @GetMapping
    public List<Pedido> historial() {
        return pedidoRepositorio.findAll();
    }
}