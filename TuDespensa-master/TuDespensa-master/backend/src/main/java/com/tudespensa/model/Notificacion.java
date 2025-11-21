package com.tudespensa.model;
import javax.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Data
public class Notificacion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String mensaje;
    private String tipo; // "Alerta", "Info"
    private LocalDate fecha;
}