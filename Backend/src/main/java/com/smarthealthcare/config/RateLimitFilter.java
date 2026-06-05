package com.smarthealthcare.config;

import io.github.bucket4j.*;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.springframework.stereotype.Component;
import java.io.IOException;
import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitFilter implements Filter {

    // Store one bucket per IP address
    private final ConcurrentHashMap<String, Bucket> buckets =
            new ConcurrentHashMap<>();

    private Bucket createBucket() {
        // Allow 20 requests per minute per IP
        return Bucket.builder()
                .addLimit(Bandwidth.classic(20,
                        Refill.greedy(20, Duration.ofMinutes(1))))
                .build();
    }

    @Override
    public void doFilter(ServletRequest request,
                         ServletResponse response,
                         FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        String ip = httpRequest.getRemoteAddr();
        Bucket bucket = buckets.computeIfAbsent(ip,
                k -> createBucket());

        if (bucket.tryConsume(1)) {
            chain.doFilter(request, response);
        } else {
            httpResponse.setStatus(429); // Too Many Requests
            httpResponse.getWriter().write(
                    "{\"error\": \"Too many requests. " +
                            "Please wait before trying again.\"}");
        }
    }
}