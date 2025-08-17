package com.foodloss.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;
import lombok.Data;

@Entity
@Data
public class Order extends BaseEntity {
    private String status;

    @ManyToOne
    private User user;
}
