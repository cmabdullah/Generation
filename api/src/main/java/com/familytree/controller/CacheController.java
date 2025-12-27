package com.familytree.controller;

import com.familytree.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.CacheManager;
import org.springframework.cache.caffeine.CaffeineCache;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * REST Controller for Cache Management and Monitoring
 */
@RestController
@RequestMapping("/api/cache")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Cache Management", description = "Cache monitoring and management operations")
public class CacheController {

	private final CacheManager cacheManager;

	@GetMapping("/stats")
	@Operation(
			summary = "Get cache statistics",
			description = "Retrieves statistics for all caches including hit rate, size, and eviction count"
	)
	public ResponseEntity<ApiResponse<Map<String, Object>>> getCacheStats() {
		log.info("GET /api/cache/stats - Get cache statistics");

		Map<String, Object> stats = new HashMap<>();

		cacheManager.getCacheNames().forEach(cacheName -> {
			CaffeineCache caffeineCache = (CaffeineCache) cacheManager.getCache(cacheName);
			if (caffeineCache != null) {
				var cache = caffeineCache.getNativeCache();
				var cacheStats = cache.stats();

				Map<String, Object> cacheInfo = new HashMap<>();
				cacheInfo.put("size", cache.estimatedSize());
				cacheInfo.put("hitCount", cacheStats.hitCount());
				cacheInfo.put("missCount", cacheStats.missCount());
				cacheInfo.put("hitRate", String.format("%.2f%%", cacheStats.hitRate() * 100));
				cacheInfo.put("evictionCount", cacheStats.evictionCount());
				cacheInfo.put("loadSuccessCount", cacheStats.loadSuccessCount());
				cacheInfo.put("loadFailureCount", cacheStats.loadFailureCount());

				stats.put(cacheName, cacheInfo);
			}
		});

		return ResponseEntity.ok(ApiResponse.success("Cache statistics retrieved successfully", stats));
	}

	@GetMapping("/stats/{cacheName}")
	@Operation(
			summary = "Get specific cache statistics",
			description = "Retrieves statistics for a specific cache by name"
	)
	public ResponseEntity<ApiResponse<Map<String, Object>>> getCacheStatsByName(
			@Parameter(description = "Cache name", example = "familyTreeFull")
			@PathVariable String cacheName) {
		log.info("GET /api/cache/stats/{} - Get cache statistics", cacheName);

		CaffeineCache caffeineCache = (CaffeineCache) cacheManager.getCache(cacheName);
		if (caffeineCache == null) {
			return ResponseEntity.notFound().build();
		}

		var cache = caffeineCache.getNativeCache();
		var cacheStats = cache.stats();

		Map<String, Object> cacheInfo = new HashMap<>();
		cacheInfo.put("cacheName", cacheName);
		cacheInfo.put("size", cache.estimatedSize());
		cacheInfo.put("hitCount", cacheStats.hitCount());
		cacheInfo.put("missCount", cacheStats.missCount());
		cacheInfo.put("hitRate", String.format("%.2f%%", cacheStats.hitRate() * 100));
		cacheInfo.put("missRate", String.format("%.2f%%", cacheStats.missRate() * 100));
		cacheInfo.put("evictionCount", cacheStats.evictionCount());
		cacheInfo.put("loadSuccessCount", cacheStats.loadSuccessCount());
		cacheInfo.put("loadFailureCount", cacheStats.loadFailureCount());
		cacheInfo.put("averageLoadPenalty", cacheStats.averageLoadPenalty());

		return ResponseEntity.ok(ApiResponse.success("Cache statistics retrieved successfully", cacheInfo));
	}

	@DeleteMapping("/clear")
	@Operation(
			summary = "Clear all caches",
			description = "Clears all cache entries from all caches"
	)
	public ResponseEntity<ApiResponse<Map<String, String>>> clearAllCaches() {
		log.info("DELETE /api/cache/clear - Clear all caches");

		Map<String, String> result = new HashMap<>();
		cacheManager.getCacheNames().forEach(cacheName -> {
			var cache = cacheManager.getCache(cacheName);
			if (cache != null) {
				cache.clear();
				result.put(cacheName, "cleared");
				log.info("Cache cleared: {}", cacheName);
			}
		});

		return ResponseEntity.ok(ApiResponse.success("All caches cleared successfully", result));
	}

	@DeleteMapping("/clear/{cacheName}")
	@Operation(
			summary = "Clear specific cache",
			description = "Clears all entries from a specific cache"
	)
	public ResponseEntity<ApiResponse<String>> clearCache(
			@Parameter(description = "Cache name", example = "familyTreeFull")
			@PathVariable String cacheName) {
		log.info("DELETE /api/cache/clear/{} - Clear cache", cacheName);

		var cache = cacheManager.getCache(cacheName);
		if (cache != null) {
			cache.clear();
			log.info("Cache cleared: {}", cacheName);
			return ResponseEntity.ok(ApiResponse.success("Cache cleared successfully", cacheName));
		}

		return ResponseEntity.notFound().build();
	}

	@DeleteMapping("/evict/{cacheName}/{key}")
	@Operation(
			summary = "Evict specific cache entry",
			description = "Evicts a specific entry from a cache by key"
	)
	public ResponseEntity<ApiResponse<String>> evictCacheEntry(
			@Parameter(description = "Cache name", example = "personById")
			@PathVariable String cacheName,
			@Parameter(description = "Cache key", example = "gen5-001")
			@PathVariable String key) {
		log.info("DELETE /api/cache/evict/{}/{} - Evict cache entry", cacheName, key);

		var cache = cacheManager.getCache(cacheName);
		if (cache != null) {
			cache.evict(key);
			log.info("Cache entry evicted: {} from {}", key, cacheName);
			return ResponseEntity.ok(ApiResponse.success("Cache entry evicted successfully", key));
		}

		return ResponseEntity.notFound().build();
	}

	@GetMapping("/names")
	@Operation(
			summary = "Get all cache names",
			description = "Retrieves a list of all available cache names"
	)
	public ResponseEntity<ApiResponse<Object>> getCacheNames() {
		log.info("GET /api/cache/names - Get all cache names");

		var cacheNames = cacheManager.getCacheNames();
		return ResponseEntity.ok(ApiResponse.success("Cache names retrieved successfully", cacheNames));
	}
}
