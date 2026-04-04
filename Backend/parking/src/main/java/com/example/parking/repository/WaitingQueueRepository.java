package com.example.parking.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.parking.model.WaitingQueue;

public interface WaitingQueueRepository extends JpaRepository<WaitingQueue, Long> {

    // FIFO — get first in queue by earliest requestTime
    Optional<WaitingQueue> findFirstByOrderByRequestTimeAsc();

    // Check if user is already in queue
    boolean existsByUserEmail(String userEmail);

    // Get all queue entries ordered by time
    List<WaitingQueue> findAllByOrderByRequestTimeAsc();

    // Remove user from queue
    void deleteByUserEmail(String userEmail);
}
