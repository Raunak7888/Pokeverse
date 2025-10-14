package com.pokeverse.play.auth.controller;

import com.pokeverse.play.auth.dto.UserDto;
import com.pokeverse.play.model.User;
import com.pokeverse.play.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/api/users")
public class UserController {

    private final UserRepository userRepository;

    // GET /users/me
    @GetMapping("/me")
    public UserDto getCurrentUser(@AuthenticationPrincipal Jwt jwt) {
        String email = jwt.getClaims().get("sub").toString(); // safer than jwt.getSubject()
        User user = userRepository.findByEmail(email);
        return UserDto.from(user);
    }

}
