package com.tudespensa.repository;

import com.tudespensa.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {
    // ¡Listo! No necesitas escribir nada más aquí.
    // Spring Boot ya sabe cómo guardar, buscar y borrar por ti.
}