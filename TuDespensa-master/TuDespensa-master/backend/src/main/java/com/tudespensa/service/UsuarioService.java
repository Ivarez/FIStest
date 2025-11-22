package com.tudespensa.service;

import com.tudespensa.model.Usuario;
import com.tudespensa.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository repo;

    public Usuario registrarUsuario(Usuario u) {
        // Validaciones básicas
        if (u.getCorreo() == null || u.getContrasena() == null) {
            throw new IllegalArgumentException("Correo y contraseña obligatorios");
        }
        // Verificar si ya existe
        if (repo.existsByCorreo(u.getCorreo())) {
            throw new IllegalArgumentException("El correo ya está registrado");
        }

        u.setFechaRegistro(LocalDateTime.now());
        // Guardado directo (sin cifrado para evitar problemas en la demo)
        return repo.save(u);
    }

    public Usuario autenticar(String correo, String contrasena) {
        Usuario u = repo.findByCorreo(correo);
        if (u != null && u.getContrasena().equals(contrasena)) {
            return u;
        }
        return null; // Retorna null si no encuentra o pass incorrecta
    }
}