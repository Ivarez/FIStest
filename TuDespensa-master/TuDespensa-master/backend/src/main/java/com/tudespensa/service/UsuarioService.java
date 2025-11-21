
package com.tudespensa.service;

import com.tudespensa.model.Usuario;
import com.tudespensa.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/*
 Servicio sencillo que implementa:
 - registro de usuario (validando correo único)
 - inicio de sesión (comparando correo + contraseña)
*/
@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository repo;

    public Usuario registrarUsuario(Usuario u) {
        if (u.getCorreo() == null || u.getContrasena() == null) {
            throw new IllegalArgumentException("Correo y contraseña obligatorios");
        }
        if (repo.existsByCorreo(u.getCorreo())) {
            throw new IllegalArgumentException("Correo ya registrado");
        }
        u.setFechaRegistro(LocalDateTime.now());
        // NOTA: no se cifra la contraseña por simplicidad (petición del usuario).
        return repo.save(u);
    }

    public Usuario autenticar(String correo, String contrasena) {
        Usuario u = repo.findByCorreo(correo);
        if (u == null) return null;
        if (u.getContrasena().equals(contrasena)) {
            return u;
        }
        return null;
    }
}
