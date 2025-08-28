package com.foodloss.dto;

import com.foodloss.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private User user;
    private String message;
    
    public AuthResponse(String token, User user) {
        this.token = token;
        this.user = user;
    }
}
