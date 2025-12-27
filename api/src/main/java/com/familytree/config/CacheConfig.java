package com.familytree.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

/**
 * Cache configuration for Caffeine in-memory caching
 */
@Configuration
@EnableCaching
@Slf4j
public class CacheConfig {

	public static final String FAMILY_TREE_FULL = "familyTreeFull";
	public static final String PERSON_BY_ID = "personById";
	public static final String PERSON_DESCENDANTS = "personDescendants";
	public static final String SEARCH_RESULTS = "searchResults";
	public static final String PERSONS_BY_LEVEL = "personsByLevel";

	@Bean
	public CacheManager cacheManager() {
		log.info("Initializing Caffeine Cache Manager");

		CaffeineCacheManager cacheManager = new CaffeineCacheManager(
				FAMILY_TREE_FULL,
				PERSON_BY_ID,
				PERSON_DESCENDANTS,
				SEARCH_RESULTS,
				PERSONS_BY_LEVEL
		);

		// Set default cache configuration
		cacheManager.setCaffeine(defaultCacheBuilder());

		log.info("Cache Manager initialized with {} caches", cacheManager.getCacheNames().size());
		return cacheManager;
	}

	/**
	 * Default cache configuration
	 * - 10 minutes TTL
	 * - Max 1000 entries
	 * - Record stats for monitoring
	 */
	private Caffeine<Object, Object> defaultCacheBuilder() {
		return Caffeine.newBuilder()
				.expireAfterWrite(10, TimeUnit.MINUTES)
				.maximumSize(1000)
				.recordStats()
				.removalListener((key, value, cause) ->
						log.debug("Cache entry removed - Key: {}, Cause: {}", key, cause)
				);
	}

	/**
	 * Cache configuration for full family tree
	 * - 10 minutes TTL (tree structure rarely changes)
	 * - Only 1 entry (there's only one full tree)
	 * - High hit rate expected
	 */
	@Bean
	public Caffeine<Object, Object> familyTreeFullCache() {
		return Caffeine.newBuilder()
				.expireAfterWrite(10, TimeUnit.MINUTES)
				.maximumSize(1)
				.recordStats()
				.removalListener((key, value, cause) ->
						log.info("Full family tree cache evicted - Cause: {}", cause)
				);
	}

	/**
	 * Cache configuration for individual person lookups
	 * - 5 minutes TTL
	 * - 500 entries max (covers most active users)
	 * - Medium hit rate expected
	 */
	@Bean
	public Caffeine<Object, Object> personByIdCache() {
		return Caffeine.newBuilder()
				.expireAfterWrite(5, TimeUnit.MINUTES)
				.maximumSize(500)
				.recordStats();
	}

	/**
	 * Cache configuration for person with descendants
	 * - 5 minutes TTL
	 * - 100 entries max
	 * - Medium hit rate expected
	 */
	@Bean
	public Caffeine<Object, Object> personDescendantsCache() {
		return Caffeine.newBuilder()
				.expireAfterWrite(5, TimeUnit.MINUTES)
				.maximumSize(100)
				.recordStats();
	}

	/**
	 * Cache configuration for search results
	 * - 2 minutes TTL (search results can be more volatile)
	 * - 200 entries max
	 * - Lower hit rate expected
	 */
	@Bean
	public Caffeine<Object, Object> searchResultsCache() {
		return Caffeine.newBuilder()
				.expireAfterWrite(2, TimeUnit.MINUTES)
				.maximumSize(200)
				.recordStats();
	}

	/**
	 * Cache configuration for persons by level
	 * - 5 minutes TTL
	 * - 50 entries max (limited number of generation levels)
	 * - High hit rate expected
	 */
	@Bean
	public Caffeine<Object, Object> personsByLevelCache() {
		return Caffeine.newBuilder()
				.expireAfterWrite(5, TimeUnit.MINUTES)
				.maximumSize(50)
				.recordStats();
	}
}
