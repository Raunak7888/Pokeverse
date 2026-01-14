package com.pokeverse.play.auth.handler;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pokeverse.play.auth.dto.AuthenticatedUser;
import com.pokeverse.play.auth.dto.UserDto;
import com.pokeverse.play.auth.service.JwtService;
import com.pokeverse.play.auth.service.RefreshTokenService;
import com.pokeverse.play.model.RefreshToken;
import com.pokeverse.play.model.User;
import com.pokeverse.play.repository.RefreshTokenRepository;
import com.pokeverse.play.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final ObjectMapper objectMapper = new ObjectMapper();
    @Value("${app.cors.allowed-origins}")
    private String frontendUrl;


    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        System.out.println("OAuth2 Login Successful");
        System.out.println(request.getParameter("state"));

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String picture = oAuth2User.getAttribute("picture");
        String providerId = oAuth2User.getAttribute("sub");

        User user = userRepository.findByEmail(email);

        if (user == null) {
            System.out.println("Creating new user with email: " + email);
            user = User.builder()
                    .email(email)
                    .username(name)
                    .profilePictureUrl(picture)
                    .providerId(providerId)
                    .provider("GOOGLE")
                    .build();
            userRepository.save(user);
        }

        RefreshToken refreshToken = refreshTokenService.CreateRefreshTokenForOldUser(user);

        String jwt = jwtService.generateToken(user.getEmail(), Map.of("id", user.getId()));

        AuthenticatedUser authenticatedUser = new AuthenticatedUser(UserDto.from(user), jwt, refreshToken.getToken());

        String redirectUrl = frontendUrl + "?user="+authenticatedUser+"&token=" + jwt + "&refreshToken=" + refreshToken.getToken();
        response.sendRedirect(redirectUrl);
    }

}

