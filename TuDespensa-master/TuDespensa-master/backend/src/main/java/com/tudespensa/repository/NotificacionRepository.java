package com.tudespensa.repository;
import com.tudespensa.model.Notificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Repository
public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {}