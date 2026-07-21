package com.skycrew.backend.repository;

import com.skycrew.backend.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Notification> findByUserUsernameOrderByCreatedAtDesc(String username);
}
