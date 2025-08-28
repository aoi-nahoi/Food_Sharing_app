package com.foodloss.repository;

import com.foodloss.entity.Food;
import com.foodloss.entity.Food.FoodStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface FoodRepository extends JpaRepository<Food, Long> {

    // 店舗の食品一覧
    Page<Food> findByStoreIdAndIsActiveTrue(Long storeId, Pageable pageable);
    
    // カテゴリ別食品一覧
    Page<Food> findByCategoryIdAndIsActiveTrue(Long categoryId, Pageable pageable);
    
    // ステータス別食品一覧
    Page<Food> findByStatusAndIsActiveTrue(FoodStatus status, Pageable pageable);
    
    // 価格範囲での検索
    @Query("SELECT f FROM Food f WHERE f.currentPrice BETWEEN :minPrice AND :maxPrice AND f.isActive = true")
    Page<Food> findByPriceRange(@Param("minPrice") Double minPrice, @Param("maxPrice") Double maxPrice, Pageable pageable);
    
    // 期限切れ食品の検索
    @Query("SELECT f FROM Food f WHERE f.expiryDate <= :now AND f.isActive = true")
    List<Food> findExpiredFoods(@Param("now") LocalDateTime now);
    
    // 近くの食品検索（簡易版）- 一時的にコメントアウト
    // @Query("SELECT f FROM Food f WHERE f.store.location IS NOT NULL AND f.isActive = true")
    // Page<Food> findFoodsWithLocation(Pageable pageable);
    
    // タグでの検索
    @Query("SELECT f FROM Food f WHERE :tag MEMBER OF f.tags AND f.isActive = true")
    Page<Food> findByTag(@Param("tag") String tag, Pageable pageable);
    
    // 店舗の有効な食品数
    long countByStoreIdAndIsActiveTrue(Long storeId);
}
