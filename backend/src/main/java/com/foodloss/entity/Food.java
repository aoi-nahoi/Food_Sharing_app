package com.foodloss.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.Type;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "foods")
@Data
@EqualsAndHashCode(callSuper = true)
public class Food extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal originalPrice;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal currentPrice;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false)
    private LocalDateTime expiryDate;

    @Column(length = 500)
    private String imageUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FoodStatus status = FoodStatus.AVAILABLE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @ElementCollection
    @CollectionTable(name = "food_tags", joinColumns = @JoinColumn(name = "food_id"))
    @Column(name = "tag")
    private Set<String> tags;

    @Column(nullable = false)
    private LocalDateTime postedAt = LocalDateTime.now();

    @Column(nullable = false)
    private Boolean isActive = true;

    public enum FoodStatus {
        AVAILABLE,    // 利用可能
        RESERVED,     // 予約済み
        SOLD_OUT,     // 売り切れ
        EXPIRED       // 期限切れ
    }
}
