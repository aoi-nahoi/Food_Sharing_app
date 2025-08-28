package com.foodloss.service;

import com.foodloss.dto.AuthResponse;
import com.foodloss.dto.UserProfileRequest;
import com.foodloss.entity.User;
import com.foodloss.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthResponse login(String email, String password) {
        User user = userRepository.findByEmailAndIsActiveTrue(email)
            .orElseThrow(() -> new RuntimeException("ユーザーが見つかりません"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("パスワードが一致しません");
        }

        // 最終ログイン時刻を更新
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        String token = jwtService.generateToken(user);
        return new AuthResponse(token, user);
    }

    public AuthResponse register(String email, String password, String name, User.UserRole role) {
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("このメールアドレスは既に使用されています");
        }

        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setName(name);
        user.setRole(role);
        user.setIsActive(true);
        user.setEmailVerified(false);

        User savedUser = userRepository.save(user);
        String token = jwtService.generateToken(savedUser);
        
        return new AuthResponse(token, savedUser);
    }

    public User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmailAndIsActiveTrue(email)
            .orElseThrow(() -> new RuntimeException("ユーザーが見つかりません"));
    }

    public User updateProfile(UserProfileRequest request) {
        User currentUser = getCurrentUser();
        
        if (request.getName() != null) {
            currentUser.setName(request.getName());
        }
        if (request.getPhoneNumber() != null) {
            currentUser.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getAvatar() != null) {
            currentUser.setAvatar(request.getAvatar());
        }
        if (request.getNotificationSettings() != null) {
            currentUser.setNotificationSettings(request.getNotificationSettings());
        }

        return userRepository.save(currentUser);
    }

    public void logout() {
        // JWTトークンの無効化処理（必要に応じて実装）
        SecurityContextHolder.clearContext();
    }
}
