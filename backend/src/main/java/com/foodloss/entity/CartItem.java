package com.foodloss.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;
import lombok.Data;

@Entity
@Data
public class CartItem extends BaseEntity {
    private String itemName;
    private int quantity;

    @ManyToOne
    private User user;
}
