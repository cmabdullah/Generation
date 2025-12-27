package com.familytree.controller;

import com.familytree.dto.ApiResponse;
import com.familytree.dto.PersonDetailsRequest;
import com.familytree.dto.PersonDetailsResponse;
import com.familytree.dto.PersonPatchRequest;
import com.familytree.dto.PersonRequest;
import com.familytree.dto.PersonResponse;
import com.familytree.service.FamilyTreeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Family Tree API
 */
@CrossOrigin(
		origins = "*", // Allow all origins
		allowCredentials = "false" // Credentials not allowed
)
@RestController
@RequestMapping("/api/family-tree")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Family Tree", description = "Family Tree Management API")
public class FamilyTreeController {

	private final FamilyTreeService familyTreeService;

	@GetMapping
	@Operation(
			summary = "Get complete family tree",
			description = "Retrieves the entire family tree structure starting from the root node"
	)
	@ApiResponses(value = {
			@io.swagger.v3.oas.annotations.responses.ApiResponse(
					responseCode = "200",
					description = "Successfully retrieved family tree",
					content = @Content(schema = @Schema(implementation = PersonResponse.class))
			)
	})
	public ResponseEntity<ApiResponse<PersonResponse>> getFullTree() {
		log.info("GET /api/family-tree - Get full tree");
		PersonResponse tree = familyTreeService.getFullTree();
		return ResponseEntity.ok(ApiResponse.success("Family tree retrieved successfully", tree));
	}

	@GetMapping("/{id}")
	@Operation(
			summary = "Get person by ID",
			description = "Retrieves a specific person with their immediate children"
	)
	@ApiResponses(value = {
			@io.swagger.v3.oas.annotations.responses.ApiResponse(
					responseCode = "200",
					description = "Successfully retrieved person",
					content = @Content(schema = @Schema(implementation = PersonResponse.class))
			),
			@io.swagger.v3.oas.annotations.responses.ApiResponse(
					responseCode = "404",
					description = "Person not found"
			)
	})
	public ResponseEntity<ApiResponse<PersonResponse>> getPersonById(
			@Parameter(description = "Person ID", example = "gen5-001")
			@PathVariable String id) {
		log.info("GET /api/family-tree/{} - Get person by ID", id);
		PersonResponse person = familyTreeService.getPersonById(id);
		return ResponseEntity.ok(ApiResponse.success("Person retrieved successfully", person));
	}

	@GetMapping("/{id}/descendants")
	@Operation(
			summary = "Get person with all descendants",
			description = "Retrieves a person with their complete subtree of descendants"
	)
	@ApiResponses(value = {
			@io.swagger.v3.oas.annotations.responses.ApiResponse(
					responseCode = "200",
					description = "Successfully retrieved person with descendants",
					content = @Content(schema = @Schema(implementation = PersonResponse.class))
			),
			@io.swagger.v3.oas.annotations.responses.ApiResponse(
					responseCode = "404",
					description = "Person not found"
			)
	})
	public ResponseEntity<ApiResponse<PersonResponse>> getPersonWithDescendants(
			@Parameter(description = "Person ID", example = "gen5-001")
			@PathVariable String id) {
		log.info("GET /api/family-tree/{}/descendants - Get person with descendants", id);
		PersonResponse person = familyTreeService.getPersonWithAllDescendants(id);
		return ResponseEntity.ok(ApiResponse.success("Person with descendants retrieved successfully", person));
	}

	@PostMapping
	@Operation(
			summary = "Create new person",
			description = "Creates a new person in the family tree. Optionally specify parentId to establish parent-child relationship."
	)
	@ApiResponses(value = {
			@io.swagger.v3.oas.annotations.responses.ApiResponse(
					responseCode = "201",
					description = "Person created successfully",
					content = @Content(schema = @Schema(implementation = PersonResponse.class))
			),
			@io.swagger.v3.oas.annotations.responses.ApiResponse(
					responseCode = "400",
					description = "Invalid input data"
			),
			@io.swagger.v3.oas.annotations.responses.ApiResponse(
					responseCode = "409",
					description = "Person with this ID already exists"
			)
	})
	public ResponseEntity<ApiResponse<PersonResponse>> createPerson(
			@Valid @RequestBody PersonRequest request) {
		log.info("POST /api/family-tree - Create person: {}", request.getId());
		PersonResponse person = familyTreeService.createPerson(request);
		return ResponseEntity
				.status(HttpStatus.CREATED)
				.body(ApiResponse.success("Person created successfully", person));
	}

	@PatchMapping("/{id}")
	@Operation(
			summary = "Update person",
			description = "Updates an existing person's properties. Only non-null fields in the request will be updated."
	)
	@ApiResponses(value = {
			@io.swagger.v3.oas.annotations.responses.ApiResponse(
					responseCode = "200",
					description = "Person updated successfully",
					content = @Content(schema = @Schema(implementation = PersonResponse.class))
			),
			@io.swagger.v3.oas.annotations.responses.ApiResponse(
					responseCode = "400",
					description = "Invalid input data"
			),
			@io.swagger.v3.oas.annotations.responses.ApiResponse(
					responseCode = "404",
					description = "Person not found"
			)
	})
	public ResponseEntity<ApiResponse<PersonResponse>> updatePerson(
			@Parameter(description = "Person ID", example = "gen5-001")
			@PathVariable String id,
			@Valid @RequestBody PersonPatchRequest request) {
		log.info("PATCH /api/family-tree/{} - Update person", id);
		PersonResponse person = familyTreeService.updatePerson(id, request);
		return ResponseEntity.ok(ApiResponse.success("Person updated successfully", person));
	}

	@DeleteMapping("/{id}")
	@Operation(
			summary = "Delete person",
			description = "Deletes a person from the family tree"
	)
	@ApiResponses(value = {
			@io.swagger.v3.oas.annotations.responses.ApiResponse(
					responseCode = "200",
					description = "Person deleted successfully"
			),
			@io.swagger.v3.oas.annotations.responses.ApiResponse(
					responseCode = "404",
					description = "Person not found"
			)
	})
	public ResponseEntity<ApiResponse<Void>> deletePerson(
			@Parameter(description = "Person ID", example = "gen5-001")
			@PathVariable String id) {
		log.info("DELETE /api/family-tree/{} - Delete person", id);
		familyTreeService.deletePerson(id);
		return ResponseEntity.ok(ApiResponse.success("Person deleted successfully", null));
	}

	@GetMapping("/search")
	@Operation(
			summary = "Search persons by name",
			description = "Searches for persons whose name contains the search term (case-insensitive)"
	)
	@ApiResponses(value = {
			@io.swagger.v3.oas.annotations.responses.ApiResponse(
					responseCode = "200",
					description = "Search completed successfully"
			)
	})
	public ResponseEntity<ApiResponse<List<PersonResponse>>> searchByName(
			@Parameter(description = "Search term", example = "Muhammad")
			@RequestParam String name) {
		log.info("GET /api/family-tree/search?name={} - Search by name", name);
		List<PersonResponse> persons = familyTreeService.searchByName(name);
		return ResponseEntity.ok(ApiResponse.success("Search completed successfully", persons));
	}

	@GetMapping("/level/{level}")
	@Operation(
			summary = "Get persons by generation level",
			description = "Retrieves all persons at a specific generation level"
	)
	@ApiResponses(value = {
			@io.swagger.v3.oas.annotations.responses.ApiResponse(
					responseCode = "200",
					description = "Successfully retrieved persons at level"
			)
	})
	public ResponseEntity<ApiResponse<List<PersonResponse>>> getPersonsByLevel(
			@Parameter(description = "Generation level", example = "5")
			@PathVariable Integer level) {
		log.info("GET /api/family-tree/level/{} - Get persons by level", level);
		List<PersonResponse> persons = familyTreeService.getPersonsByLevel(level);
		return ResponseEntity.ok(ApiResponse.success("Persons at level " + level + " retrieved successfully", persons));
	}

	@GetMapping("/count")
	@Operation(
			summary = "Get total count",
			description = "Returns the total number of persons in the family tree"
	)
	@ApiResponses(value = {
			@io.swagger.v3.oas.annotations.responses.ApiResponse(
					responseCode = "200",
					description = "Successfully retrieved count"
			)
	})
	public ResponseEntity<ApiResponse<Long>> getTotalCount() {
		log.info("GET /api/family-tree/count - Get total count");
		long count = familyTreeService.getTotalCount();
		return ResponseEntity.ok(ApiResponse.success("Total count retrieved successfully", count));
	}

	@PostMapping("/reload-data")
	@Operation(
			summary = "Reload data from JSON",
			description = "Admin operation: Clears database and reloads data from JSON file"
	)
	@ApiResponses(value = {
			@io.swagger.v3.oas.annotations.responses.ApiResponse(
					responseCode = "200",
					description = "Data reloaded successfully"
			)
	})
	public ResponseEntity<ApiResponse<Void>> reloadData() {
		log.info("POST /api/family-tree/reload-data - Reload data");
		familyTreeService.reloadData();
		return ResponseEntity.ok(ApiResponse.success("Data reloaded successfully", null));
	}

	@PatchMapping("/reset-positions")
	@Operation(
			summary = "Reset all node positions",
			description = "Resets all positionX and positionY values to null, forcing automatic layout recalculation"
	)
	@ApiResponses(value = {
			@io.swagger.v3.oas.annotations.responses.ApiResponse(
					responseCode = "200",
					description = "All positions reset successfully"
			)
	})
	public ResponseEntity<ApiResponse<Void>> resetAllPositions() {
		log.info("PATCH /api/family-tree/reset-positions - Reset all positions");
		familyTreeService.resetAllPositions();
		return ResponseEntity.ok(ApiResponse.success("All positions reset successfully", null));
	}

	// === Person Details Endpoints ===

	@PostMapping("/{personId}/details")
	@Operation(
			summary = "Add or update person details",
			description = "Creates or updates extended details for a person. If details exist, they will be updated; otherwise, new details will be created."
	)
	@ApiResponses(value = {
			@io.swagger.v3.oas.annotations.responses.ApiResponse(
					responseCode = "200",
					description = "Person details created/updated successfully",
					content = @Content(schema = @Schema(implementation = PersonDetailsResponse.class))
			),
			@io.swagger.v3.oas.annotations.responses.ApiResponse(
					responseCode = "404",
					description = "Person not found"
			)
	})
	public ResponseEntity<ApiResponse<PersonDetailsResponse>> addOrUpdatePersonDetails(
			@Parameter(description = "Person ID", example = "gen5-001")
			@PathVariable String personId,
			@Valid @RequestBody PersonDetailsRequest request) {
		log.info("POST /api/family-tree/{}/details - Add/update person details", personId);
		PersonDetailsResponse details = familyTreeService.addOrUpdatePersonDetails(personId, request);
		return ResponseEntity.ok(ApiResponse.success("Person details saved successfully", details));
	}

	@GetMapping("/{personId}/details")
	@Operation(
			summary = "Get person details",
			description = "Retrieves extended details for a person"
	)
	@ApiResponses(value = {
			@io.swagger.v3.oas.annotations.responses.ApiResponse(
					responseCode = "200",
					description = "Person details retrieved successfully",
					content = @Content(schema = @Schema(implementation = PersonDetailsResponse.class))
			),
			@io.swagger.v3.oas.annotations.responses.ApiResponse(
					responseCode = "404",
					description = "Person or details not found"
			)
	})
	public ResponseEntity<ApiResponse<PersonDetailsResponse>> getPersonDetails(
			@Parameter(description = "Person ID", example = "gen5-001")
			@PathVariable String personId) {
		log.info("GET /api/family-tree/{}/details - Get person details", personId);
		return familyTreeService.getPersonDetails(personId)
				.map(details -> ResponseEntity.ok(ApiResponse.success("Person details retrieved successfully", details)))
				.orElse(ResponseEntity
						.status(HttpStatus.NOT_FOUND)
						.body(ApiResponse.error("Person details not found")));
	}

	@DeleteMapping("/{personId}/details")
	@Operation(
			summary = "Delete person details",
			description = "Deletes extended details for a person"
	)
	@ApiResponses(value = {
			@io.swagger.v3.oas.annotations.responses.ApiResponse(
					responseCode = "200",
					description = "Person details deleted successfully"
			),
			@io.swagger.v3.oas.annotations.responses.ApiResponse(
					responseCode = "404",
					description = "Person not found"
			)
	})
	public ResponseEntity<ApiResponse<Void>> deletePersonDetails(
			@Parameter(description = "Person ID", example = "gen5-001")
			@PathVariable String personId) {
		log.info("DELETE /api/family-tree/{}/details - Delete person details", personId);
		familyTreeService.deletePersonDetails(personId);
		return ResponseEntity.ok(ApiResponse.success("Person details deleted successfully", null));
	}
}
