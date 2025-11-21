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
    private NotificacionRepository repositorio;

    // Solo listar las que se han creado realmente
    @GetMapping
    public List<Notificacion> listar() {
        // Ordenar por ID descendente para ver las nuevas primero (opcional)
        return repositorio.findAll();
    }
}