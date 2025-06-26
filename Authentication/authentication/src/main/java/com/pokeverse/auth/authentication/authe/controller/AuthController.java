package com.pokeverse.auth.authentication.authe.controller;

import com.pokeverse.auth.authentication.authe.model.RToken;
import com.pokeverse.auth.authentication.authe.model.User;
import com.pokeverse.auth.authentication.authe.repository.RTokenRepository;
import com.pokeverse.auth.authentication.authe.repository.UserRepository;
import com.pokeverse.auth.authentication.authe.service.UserService;
import com.pokeverse.auth.authentication.authe.util.JwtUtil;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication Controller", description = "Handles authentication and user profile operations")
public class AuthController {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final UserService userService;
    private final RTokenRepository rTokenRepository;

    @Operation(summary = "Test endpoint to verify service is running",
            description = "Returns a simple string to confirm the authentication service is operational.")
    @ApiResponse(responseCode = "200", description = "Service is running",
            content = @Content(mediaType = "text/plain",
                    examples = @ExampleObject(value = "Hello from Authentication Service!")))
    @GetMapping("/test")
    public String test() {
        return "Hello from Authentication Service!";
    }

    @Operation(summary = "Initiate OAuth2 login flow",
            description = "Provides a URL to redirect users for OAuth2 authentication (e.g., Google, GitHub). " +
                    "Clients should guide users to the provided URL.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Login initiation successful",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"message\": \"Go to https://your-backend.com/oauth2/authorization/google to login\"}")))
    })
    @GetMapping("/login")
    public ResponseEntity<Map<String, String>> login() {
        return ResponseEntity.ok(Map.of(
                "message", "Go to https://your-backend.com/oauth2/authorization/google to login"
        ));
    }

    @Operation(summary = "Handle successful OAuth2 login callback",
            description = "This endpoint is typically called by the OAuth2 provider after a successful authentication. " +
                    "It processes the authenticated user's details, creates/updates a user record, " +
                    "and issues an access token and a refresh token.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Login successful, returns user details and tokens",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(name = "Successful Login Response", value = "{" +
                                    "\"user\": {" +
                                    "\"id\": 1," +
                                    "\"email\": \"testuser@example.com\"," +
                                    "\"name\": \"Test User\"," +
                                    "\"profilePicUrl\": \"https://example.com/profile.jpg\"" +
                                    "}," +
                                    "\"access_token\": \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\"," +
                                    "\"refresh_token\": \"an-example-refresh-token-string\"" +
                                    "}"))),
            @ApiResponse(responseCode = "401", description = "Unauthorized: User not authenticated by OAuth2 provider",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(name = "Unauthorized Response", value = "{\"error\": \"User not authenticated\"}")))
    })
    @GetMapping("/success")
    public ResponseEntity<?> loginSuccess(
            @Parameter(hidden = true) @AuthenticationPrincipal OAuth2User principal) { // @Parameter(hidden = true) hides this from swagger UI as it's handled by Spring Security
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not authenticated"));
        }

        String email = principal.getAttribute("email");
        String name = principal.getAttribute("name");
        String profilePicUrl = principal.getAttribute("picture");

        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = User.builder()
                    .email(email)
                    .name(name)
                    .profilePicUrl(profilePicUrl)
                    .build();
            return userRepository.save(newUser);
        });

        String accessToken = jwtUtil.generateToken(user.getEmail(), user.getId());
        String refreshToken = userService.refreshToken();

        RToken rToken = RToken.builder()
                .token(refreshToken)
                .expirationTime(LocalDateTime.now().plusDays(2))
                .userId(user)
                .build();
        rTokenRepository.save(rToken);

        return ResponseEntity.ok(Map.of(
                "user", user,
                "access_token", accessToken,
                "refresh_token", refreshToken
        ));
    }

    @Operation(summary = "Get logged-in user's information",
            description = "Retrieves the details of the currently authenticated user by validating their JWT access token provided in the Authorization header.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "User information retrieved successfully",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(name = "User Info Response", value = "{" +
                                    "\"userId\": 1," +
                                    "\"email\": \"testuser@example.com\"," +
                                    "\"name\": \"Test User\"," +
                                    "\"profile\": \"https://example.com/profile.jpg\"" +
                                    "}"))),
            @ApiResponse(responseCode = "401", description = "Unauthorized: Missing, invalid, or expired JWT token",
                    content = @Content(mediaType = "application/json",
                            examples = {
                                    @ExampleObject(name = "Missing Header", value = "{\"error\": \"Missing or invalid Authorization header\"}"),
                                    @ExampleObject(name = "Email Not Found", value = "{\"error\": \"Email not found in token\"}"),
                                    @ExampleObject(name = "JWT Expired", value = "{\"error\": \"JWT token expired\"}"),
                                    @ExampleObject(name = "Invalid JWT", value = "{\"error\": \"Invalid JWT token\"}")
                            })),
            @ApiResponse(responseCode = "404", description = "Not Found: User associated with token not found in database",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(name = "User Not Found", value = "{\"error\": \"User not found\"}")))
    })
    @GetMapping("/me")
    public ResponseEntity<?> getUserInfo(
            @Parameter(description = "Bearer token obtained after successful login", required = true,
                    examples = @ExampleObject(value = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"))
            HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Missing or invalid Authorization header"));
        }

        String token = authHeader.substring(7);
        try {
            String email = jwtUtil.extractEmail(token);
            if (email == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Email not found in token"));
            }

            return userRepository.findByEmail(email)
                    .map(user -> ResponseEntity.ok(Map.of(
                            "userId", user.getId(),
                            "email", user.getEmail(),
                            "name", user.getName(),
                            "profile", user.getProfilePicUrl()
                    )))
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found")));

        } catch (ExpiredJwtException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "JWT token expired"));
        } catch (JwtException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid JWT token"));
        }
    }

    @Operation(summary = "Refresh access token",
            description = "Exchanges an existing valid refresh token for a new access token and a new refresh token. " +
                    "This is used to maintain user sessions without requiring re-authentication.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Tokens refreshed successfully",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(name = "Successful Refresh Response", value = "{" +
                                    "\"access_token\": \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\"," +
                                    "\"refresh_token\": \"another-new-refresh-token-string\"" +
                                    "}"))),
            @ApiResponse(responseCode = "404", description = "Not Found: Refresh token not found",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(name = "Refresh Token Not Found", value = "{\"error\": \"Refresh token not found\"}"))),
            @ApiResponse(responseCode = "401", description = "Unauthorized: Refresh token expired",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(name = "Refresh Token Expired", value = "{\"error\": \"Refresh token expired\"}")))
    })
    @GetMapping("/refresh")
    public ResponseEntity<?> refreshToken(
            @Parameter(description = "The refresh token obtained during login or a previous refresh operation",
                    required = true,
                    examples = @ExampleObject(value = "an-example-refresh-token-string"))
            @RequestParam("refreshToken") String refreshToken) {
        Optional<RToken> optionalToken = rTokenRepository.findByToken(refreshToken);
        if (optionalToken.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Refresh token not found"));
        }

        RToken rToken = optionalToken.get();
        if (rToken.getExpirationTime().isBefore(LocalDateTime.now())) {
            rTokenRepository.delete(rToken);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Refresh token expired"));
        }

        String newAccessToken = jwtUtil.generateToken(rToken.getUserId().getEmail(), rToken.getUserId().getId());
        String newRefreshToken = userService.refreshToken();

        rToken.setToken(newRefreshToken);
        rToken.setExpirationTime(LocalDateTime.now().plusDays(2));
        rTokenRepository.save(rToken);

        return ResponseEntity.ok(Map.of(
                "access_token", newAccessToken,
                "refresh_token", newRefreshToken
        ));
    }

    @Operation(summary = "Get user profile picture by user ID",
            description = "Retrieves the profile picture URL for a specific user based on their unique user ID.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Profile picture URL retrieved successfully",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(name = "Profile Pic Response", value = "{\"profilePicUrl\": \"https://example.com/profile_pic_for_user_123.jpg\"}"))),
            @ApiResponse(responseCode = "404", description = "Not Found: User with the specified ID does not exist",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(name = "User Not Found", value = "{\"error\": \"User not found\"}")))
    })
    @GetMapping("/user/profile/pic/{userId}")
    public ResponseEntity<?> getUserProfilePic(
            @Parameter(description = "Unique identifier of the user", required = true, example = "123")
            @PathVariable Long userId) {
        return userRepository.findById(userId)
                .map(user -> ResponseEntity.ok(Map.of("profilePicUrl", user.getProfilePicUrl())))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found")));
    }
}