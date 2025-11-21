package com.tudespensa.model;

import javax.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "productos")
public class Producto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private String categoria;
    private Integer cantidad;
    private Double precio;
    private String fechaVencimiento;
}