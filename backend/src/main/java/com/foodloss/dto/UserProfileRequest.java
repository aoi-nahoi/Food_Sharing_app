package com.foodloss.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UserProfileRequest {
    
    @NotBlank(message = "名前は必須です")
    private String name;
    
    @Email(message = "有効なメールアドレスを入力してください")
    private String email;
    
    private String phoneNumber;
    
    private String avatar;
    
    private String notificationSettings;
}
