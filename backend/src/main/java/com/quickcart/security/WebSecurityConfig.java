package com.quickcart.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class WebSecurityConfig {

    private final UserDetailsServiceImpl userDetailsService;
    private final AuthEntryPointJwt unauthorizedHandler;
    private final JwtUtils jwtUtils;

    @Bean
    public AuthTokenFilter authenticationJwtTokenFilter() {
        return new AuthTokenFilter(jwtUtils, userDetailsService);
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin", "Access-Control-Request-Method", "Access-Control-Request-Headers"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Public Endpoints
                        .requestMatchers("/api/auth/**", "/api/v1/auth/**").permitAll()
                        .requestMatchers("/health/**", "/api/health/**", "/api/v1/health/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/products/**", "/api/v1/products/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/categories/**", "/api/v1/categories/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/brands/**", "/api/v1/brands/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/recommendations/**", "/api/recommendations/**", "/api/v1/recommendations/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/coupons/active", "/api/v1/coupons/active").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/reviews/product/**", "/api/v1/reviews/product/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/wallet/loyalty-perks", "/api/v1/wallet/loyalty-perks").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/dining/restaurants/**", "/api/dining/cuisines", "/api/dining/cities").permitAll()
                        .requestMatchers("/ws-quickcart/**").permitAll()
                        .requestMatchers("/h2-console/**").permitAll()
                        .requestMatchers("/actuator/**").permitAll()
                        .requestMatchers("/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()

                        // Role-Based Endpoints
                        .requestMatchers("/api/admin/**", "/api/v1/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/inventory/**", "/api/v1/inventory/**").hasAnyRole("ADMIN", "STORE_MANAGER")
                        .requestMatchers("/api/delivery/**", "/api/v1/delivery/**").hasAnyRole("DELIVERY_PARTNER", "ADMIN")
                        .requestMatchers(
                                "/api/customer/**", "/api/v1/customer/**",
                                "/api/cart/**", "/api/v1/cart/**",
                                "/api/orders/**", "/api/v1/orders/**",
                                "/api/addresses/**", "/api/v1/addresses/**",
                                "/api/payments/**", "/api/v1/payments/**",
                                "/api/coupons/validate", "/api/v1/coupons/validate",
                                "/api/wallet/**", "/api/v1/wallet/**",
                                "/api/notifications/**", "/api/v1/notifications/**",
                                "/api/dining/bookings/**", "/api/dining/reviews/**", "/api/dining/favorites/**"
                        ).authenticated()

                        .anyRequest().authenticated()
                );

        // Required for H2 Console frame display
        http.headers(headers -> headers.frameOptions(HeadersConfigurer.FrameOptionsConfig::disable));

        http.authenticationProvider(authenticationProvider());
        http.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
