/**
 * Data Parser for Family Tree
 *
 * This script can be used to parse the SVG data from index.html
 * and extract family member information into a structured JSON format.
 *
 * Usage: Run this in Node.js or browser console to parse data
 */

class FamilyDataParser {
    constructor() {
        this.familyData = {
            members: [],
            relationships: []
        };
    }

    /**
     * Parse SVG text elements from the HTML file
     * @param {string} svgContent - The content of the SVG
     */
    parseSVGText(svgContent) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgContent, 'text/html');

        // Find all text elements
        const textElements = doc.querySelectorAll('text');

        const names = [];
        textElements.forEach(textEl => {
            const content = textEl.textContent.trim();
            if (content && content.length > 3) {
                // Extract name and location if present
                const locationMatch = content.match(/\(([^)]+)\)/);
                const name = content.replace(/\([^)]+\)/g, '').trim();
                const location = locationMatch ? locationMatch[1] : null;

                if (name) {
                    names.push({
                        name,
                        location,
                        rawText: content
                    });
                }
            }
        });

        return names;
    }

    /**
     * Build a hierarchical tree structure from flat data
     * @param {Array} members - Array of member objects
     */
    buildHierarchy(members) {
        // This is a simplified version
        // In reality, you'd need to analyze the SVG structure and connection lines
        // to determine parent-child relationships

        const root = {
            id: 'root',
            name: members[0]?.name || 'Unknown',
            generation: 1,
            photo: null,
            location: members[0]?.location || null,
            children: []
        };

        // For demonstration, create a simple hierarchy
        // You would implement more sophisticated logic based on your SVG structure

        return root;
    }

    /**
     * Export data to JSON format
     */
    exportToJSON(data) {
        return JSON.stringify(data, null, 2);
    }

    /**
     * Manual helper to create a tree structure
     * This can be used in the browser console
     */
    createNode(id, name, generation, location = null, children = []) {
        return {
            id,
            name,
            generation,
            photo: null,
            location,
            children
        };
    }

    /**
     * Validate the tree structure
     */
    validateTree(node, generation = 1, errors = []) {
        if (!node.id) {
            errors.push(`Node missing ID: ${node.name}`);
        }

        if (!node.name) {
            errors.push(`Node missing name: ${node.id}`);
        }

        if (node.generation !== generation) {
            errors.push(`Generation mismatch for ${node.name}: expected ${generation}, got ${node.generation}`);
        }

        if (node.children) {
            node.children.forEach(child => {
                this.validateTree(child, generation + 1, errors);
            });
        }

        return errors;
    }

    /**
     * Count total nodes in the tree
     */
    countNodes(node) {
        let count = 1;
        if (node.children) {
            node.children.forEach(child => {
                count += this.countNodes(child);
            });
        }
        return count;
    }

    /**
     * Get all nodes at a specific generation level
     */
    getNodesAtGeneration(node, targetGen, currentGen = 1) {
        if (currentGen === targetGen) {
            return [node];
        }

        let nodes = [];
        if (node.children) {
            node.children.forEach(child => {
                nodes = nodes.concat(this.getNodesAtGeneration(child, targetGen, currentGen + 1));
            });
        }

        return nodes;
    }

    /**
     * Search for a node by name
     */
    findNode(node, searchName) {
        if (node.name.toLowerCase().includes(searchName.toLowerCase())) {
            return node;
        }

        if (node.children) {
            for (let child of node.children) {
                const found = this.findNode(child, searchName);
                if (found) return found;
            }
        }

        return null;
    }

    /**
     * Get path from root to a specific node
     */
    getPathToNode(node, targetId, path = []) {
        path.push(node);

        if (node.id === targetId) {
            return path;
        }

        if (node.children) {
            for (let child of node.children) {
                const result = this.getPathToNode(child, targetId, [...path]);
                if (result) return result;
            }
        }

        return null;
    }
}

// Export for use in browser or Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FamilyDataParser;
}

// Usage example in browser console:
/*
const parser = new FamilyDataParser();

// Load your data
fetch('data/family-tree-data.json')
    .then(response => response.json())
    .then(data => {
        console.log('Tree has', parser.countNodes(data), 'members');
        console.log('Generation 3:', parser.getNodesAtGeneration(data, 3));

        // Validate
        const errors = parser.validateTree(data);
        if (errors.length > 0) {
            console.error('Validation errors:', errors);
        } else {
            console.log('Tree structure is valid!');
        }
    });
*/
