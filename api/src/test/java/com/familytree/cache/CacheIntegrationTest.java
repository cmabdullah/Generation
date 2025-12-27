package com.familytree.cache;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cache.CacheManager;
import org.springframework.cache.caffeine.CaffeineCache;

import static com.familytree.config.CacheConfig.*;
import static org.assertj.core.api.Assertions.assertThat;

/**
 * Integration tests for Caffeine caching configuration
 * These tests verify that the cache infrastructure is properly configured
 */
@SpringBootTest
class CacheIntegrationTest {

	@Autowired
	private CacheManager cacheManager;

	@BeforeEach
	void clearCaches() {
		// Clear all caches before each test
		cacheManager.getCacheNames().forEach(cacheName -> {
			var cache = cacheManager.getCache(cacheName);
			if (cache != null) {
				cache.clear();
			}
		});
	}

	@Test
	void testCacheManagerExists() {
		// Verify cache manager is properly configured
		assertThat(cacheManager).isNotNull();
	}

	@Test
	void testAllCachesAreConfigured() {
		// Verify all expected caches are configured
		assertThat(cacheManager.getCache(FAMILY_TREE_FULL)).isNotNull();
		assertThat(cacheManager.getCache(PERSON_BY_ID)).isNotNull();
		assertThat(cacheManager.getCache(PERSON_DESCENDANTS)).isNotNull();
		assertThat(cacheManager.getCache(SEARCH_RESULTS)).isNotNull();
		assertThat(cacheManager.getCache(PERSONS_BY_LEVEL)).isNotNull();
	}

	@Test
	void testCacheNamesAreCorrect() {
		// Verify cache names match expected values
		var cacheNames = cacheManager.getCacheNames();
		assertThat(cacheNames).containsExactlyInAnyOrder(
			FAMILY_TREE_FULL,
			PERSON_BY_ID,
			PERSON_DESCENDANTS,
			SEARCH_RESULTS,
			PERSONS_BY_LEVEL
		);
	}

	@Test
	void testCachesAreCaffeineType() {
		// Verify all caches are Caffeine caches
		cacheManager.getCacheNames().forEach(cacheName -> {
			var cache = cacheManager.getCache(cacheName);
			assertThat(cache).isInstanceOf(CaffeineCache.class);
		});
	}

	@Test
	void testCacheStatisticsEnabled() {
		// Verify cache statistics are enabled
		CaffeineCache caffeineCache = (CaffeineCache) cacheManager.getCache(FAMILY_TREE_FULL);
		assertThat(caffeineCache).isNotNull();

		var stats = caffeineCache.getNativeCache().stats();
		assertThat(stats).isNotNull();

		// Stats should be available (initially zero or near-zero)
		assertThat(stats.hitCount()).isGreaterThanOrEqualTo(0);
		assertThat(stats.missCount()).isGreaterThanOrEqualTo(0);
	}

	@Test
	void testCachePutAndGet() {
		// Test basic cache put and get operations
		var cache = cacheManager.getCache(PERSON_BY_ID);
		assertThat(cache).isNotNull();

		// Put a test value
		String testKey = "test-key-123";
		String testValue = "test-value";
		cache.put(testKey, testValue);

		// Verify it's in the cache
		var cachedValue = cache.get(testKey);
		assertThat(cachedValue).isNotNull();
		assertThat(cachedValue.get()).isEqualTo(testValue);
	}

	@Test
	void testCacheClear() {
		// Test cache clear operation
		var cache = cacheManager.getCache(SEARCH_RESULTS);
		assertThat(cache).isNotNull();

		// Add some test data
		cache.put("key1", "value1");
		cache.put("key2", "value2");

		// Verify data exists
		assertThat(cache.get("key1")).isNotNull();
		assertThat(cache.get("key2")).isNotNull();

		// Clear cache
		cache.clear();

		// Verify cache is empty
		assertThat(cache.get("key1")).isNull();
		assertThat(cache.get("key2")).isNull();
	}

	@Test
	void testCacheEvict() {
		// Test cache evict operation
		var cache = cacheManager.getCache(PERSONS_BY_LEVEL);
		assertThat(cache).isNotNull();

		// Add test data
		String testKey = "level-5";
		cache.put(testKey, "some-data");
		assertThat(cache.get(testKey)).isNotNull();

		// Evict specific entry
		cache.evict(testKey);

		// Verify entry is removed
		assertThat(cache.get(testKey)).isNull();
	}

	@Test
	void testMultipleCachesIndependent() {
		// Test that caches are independent from each other
		var cache1 = cacheManager.getCache(FAMILY_TREE_FULL);
		var cache2 = cacheManager.getCache(PERSON_BY_ID);

		// Add data to both caches
		cache1.put("key", "value1");
		cache2.put("key", "value2");

		// Verify each cache has its own data
		assertThat(cache1.get("key").get()).isEqualTo("value1");
		assertThat(cache2.get("key").get()).isEqualTo("value2");

		// Clear one cache
		cache1.clear();

		// Verify only that cache was cleared
		assertThat(cache1.get("key")).isNull();
		assertThat(cache2.get("key")).isNotNull();
		assertThat(cache2.get("key").get()).isEqualTo("value2");
	}

	@Test
	void testCacheStatisticsTracking() {
		// Test that statistics are properly tracked
		CaffeineCache caffeineCache = (CaffeineCache) cacheManager.getCache(PERSON_DESCENDANTS);
		assertThat(caffeineCache).isNotNull();

		var cache = caffeineCache.getNativeCache();

		// Put some values
		cache.put("key1", "value1");
		cache.put("key2", "value2");

		// Get a value (cache hit)
		cache.getIfPresent("key1");

		// Get non-existent value (cache miss)
		cache.getIfPresent("key-does-not-exist");

		// Check statistics
		var stats = cache.stats();
		assertThat(stats.hitCount()).isGreaterThan(0);
		assertThat(stats.missCount()).isGreaterThan(0);
	}
}
