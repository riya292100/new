package com.quickcart.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "delivery_assignments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    @JsonIgnore
    private Order order;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "partner_id", nullable = false)
    private DeliveryPartner partner;

    @Column(nullable = false, length = 50)
    private String status = "ASSIGNED"; // ASSIGNED, ACCEPTED, REJECTED, PICKED_UP, DELIVERED

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime assignedAt;

    private LocalDateTime acceptedAt;

    private LocalDateTime pickedUpAt;

    private LocalDateTime deliveredAt;

    public DeliveryAssignment(Order order, DeliveryPartner partner) {
        this.order = order;
        this.partner = partner;
        this.status = "ASSIGNED";
    }
}
