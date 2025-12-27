package com.familytree.util;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

/**
 * Helper class to deserialize JSON tree structure from data_full.json
 */
@Data
public class JsonTreeNode {

	private String id;
	private String name;
	private String avatar;
	private String address;
	private String gender;
	private Integer level;
	private String signature;
	private String spouse;
	private String contributorId;
	private Boolean isPositionLocked;
	private String signatureId;

	@JsonProperty("childs")
	private List<JsonTreeNode> childs = new ArrayList<>();
}
