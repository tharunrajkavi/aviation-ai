package com.skycrew.backend.controller;

import com.skycrew.backend.model.Notification;
import com.skycrew.backend.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    @Autowired
    NotificationRepository notificationRepository;

    @GetMapping("/user/{username}")
    public List<Notification> getNotificationsForUser(@PathVariable String username) {
        return notificationRepository.findByUserUsernameOrderByCreatedAtDesc(username);
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        return notificationRepository.findById(id).map(notif -> {
            notif.setStatus("READ");
            notificationRepository.save(notif);
            return ResponseEntity.ok(Map.of("message", "Notification marked as read"));
        }).orElse(ResponseEntity.notFound().build());
    }
}
