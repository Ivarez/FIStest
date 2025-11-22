package com.tudespensa.model;

import javax.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Data
@Table(name = "pedidos")
public class Pedido {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String usuario; // Guardaremos "Usuario Demo" por ahora
    private Double total;
    private LocalDate fecha;
    private String estado;
}