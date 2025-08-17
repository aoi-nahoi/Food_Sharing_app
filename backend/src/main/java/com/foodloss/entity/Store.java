package com.foodloss.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.OneToOne;
import lombok.Data;

@Entity
@Data
public class Store extends BaseEntity {
    private String name;

    @OneToOne
    private User user;
}
