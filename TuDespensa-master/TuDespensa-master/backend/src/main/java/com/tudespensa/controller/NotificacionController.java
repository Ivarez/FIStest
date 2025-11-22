package com.tudespensa.controller;

import com.tudespensa.model.Notificacion;
import com.tudespensa.repository.NotificacionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notificaciones")
@CrossOrigin(origins = "*")
public class NotificacionController {

    @Autowired
    private NotificacionRepository repo;

    // Endpoint para que el frontend obtenga las alertas
    @GetMapping
    public List<Notificacion> listar() {
        // Podrías ordenarlas por fecha descendente si quisieras, pero findAll está bien
        return repo.findAll();
    }

    // Endpoint para borrar notificaciones (útil para limpiar la demo)
    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        repo.deleteById(id);
    }
}