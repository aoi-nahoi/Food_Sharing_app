package com.foodloss.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.locationtech.jts.geom.Point;

import java.time.LocalTime;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

@Entity
@Table(name = "stores")
@Data
@EqualsAndHashCode(callSuper = true)
public class Store extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(length = 1000)
    private String description;

    @Column(length = 500)
    private String address;

    @Column(length = 500)
    private String imageUrl;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(length = 500)
    private String website;

    @Column(name = "business_hours", columnDefinition = "jsonb")
    private Map<String, BusinessHours> businessHours;

    @Column(columnDefinition = "geometry(Point,4326)")
    private Point location;

    @Column(nullable = false)
    private Boolean isActive = true;

    @Column(name = "is_verified")
    private Boolean isVerified = false;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToMany(mappedBy = "store", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Food> foods = new HashSet<>();

    @ElementCollection
    @CollectionTable(name = "store_categories", joinColumns = @JoinColumn(name = "store_id"))
    @Column(name = "category")
    private Set<String> categories = new HashSet<>();

    public static class BusinessHours {
        private LocalTime openTime;
        private LocalTime closeTime;
        private Boolean isOpen;

        // Getters and Setters
        public LocalTime getOpenTime() { return openTime; }
        public void setOpenTime(LocalTime openTime) { this.openTime = openTime; }
        
        public LocalTime getCloseTime() { return closeTime; }
        public void setCloseTime(LocalTime closeTime) { this.closeTime = closeTime; }
        
        public Boolean getIsOpen() { return isOpen; }
        public void setIsOpen(Boolean isOpen) { this.isOpen = isOpen; }
    }
}
