package com.carbontrack.carbontrack.controller;

import com.carbontrack.carbontrack.service.BenchmarkService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/benchmark")
@RequiredArgsConstructor
public class BenchmarkController {

    private final BenchmarkService benchmarkService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getPeerBenchmark(Authentication authentication) {
        return ResponseEntity.ok(benchmarkService.getPeerBenchmark(authentication.getName()));
    }
}
