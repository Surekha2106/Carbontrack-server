package com.carbontrack.carbontrack;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.cache.CacheManager;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;

@SpringBootApplication
@EnableCaching

public class CarbontrackApplication {

	public static void main(String[] args) {
		org.springframework.context.ApplicationContext context = SpringApplication.run(CarbontrackApplication.class, args);
		String port = context.getEnvironment().getProperty("server.port", "8080");
		System.out.println("\n\n========================================================");
		System.out.println("🚀 Backend is successfully running!");
		System.out.println("🔗 Click or copy this link: http://localhost:" + port);
		System.out.println("========================================================\n\n");
	}
}
