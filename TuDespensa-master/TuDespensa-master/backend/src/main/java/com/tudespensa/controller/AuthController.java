
package com.tudespensa.controller;

import com.tudespensa.model.Usuario;
import com.tudespensa.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/*
 Endpoints:
 POST /api/register  -> { nombre, correo, contrasena }
 POST /api/login     -> { correo, contrasena }
*/

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // permite llamadas desde el frontend local;
 
public class AuthController {

    @Autowired
    private UsuarioService usuarioService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Usuario payload) {
        try {
            Usuario saved = usuarioService.registrarUsuario(payload);
            // No devolver contraseña en la respuesta
            saved.setContrasena(null);
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("error", "Error interno"));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> payload) {
        String correo = payload.get("correo");
        String contrasena = payload.get("contrasena");
        Usuario u = usuarioService.autenticar(correo, contrasena);
        if (u == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Credenciales inválidas"));
        }
        u.setContrasena(null);
        return ResponseEntity.ok(u);
    }
}
