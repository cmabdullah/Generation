// Family Tree Visualization Engine
class FamilyTree {
    constructor() {
        this.data = null;
        this.svg = document.getElementById('tree-canvas');
        this.treeGroup = document.getElementById('tree-group');
        this.nodesLayer = document.getElementById('nodes-layer');
        this.connectionsLayer = document.getElementById('connections-layer');

        this.nodeWidth = 150;
        this.nodeHeight = 120;
        this.horizontalSpacing = 250;
        this.verticalSpacing = 150;

        this.scale = 1;
        this.translateX = 0;
        this.translateY = 0;

        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;

        this.nodePositions = new Map();

        this.init();
    }

    async init() {
        this.showLoading();

        try {
            await this.loadData();
            this.calculateLayout(this.data, 0, 0, 0);
            this.centerTree();
            this.render();
            this.setupEventListeners();
            this.hideLoading();
        } catch (error) {
            console.error('Error initializing tree:', error);
            alert('Failed to load family tree data');
            this.hideLoading();
        }
    }

    async loadData() {
        const response = await fetch('data/family-tree-data.json');
        this.data = await response.json();
    }

    showLoading() {
        document.getElementById('loading-overlay').classList.remove('hidden');
    }

    hideLoading() {
        document.getElementById('loading-overlay').classList.add('hidden');
    }

    // Calculate positions for all nodes using a tree layout algorithm
    calculateLayout(node, x, y, depth) {
        if (!node) return { width: 0, height: 0 };

        const nodeId = node.id;
        this.nodePositions.set(nodeId, { x, y, node });

        if (!node.children || node.children.length === 0) {
            return { width: this.nodeWidth, height: this.nodeHeight };
        }

        let childY = y;
        let totalHeight = 0;
        const childrenInfo = [];

        // Calculate positions for all children
        for (let child of node.children) {
            const childX = x + this.horizontalSpacing;
            const childLayout = this.calculateLayout(child, childX, childY, depth + 1);
            childrenInfo.push({ child, y: childY, height: childLayout.height });
            childY += childLayout.height + this.verticalSpacing;
            totalHeight += childLayout.height + this.verticalSpacing;
        }

        totalHeight -= this.verticalSpacing; // Remove last spacing

        // Center parent node relative to children
        const centerY = y + (totalHeight / 2) - (this.nodeHeight / 2);
        this.nodePositions.set(nodeId, { x, y: centerY, node });

        return { width: this.nodeWidth, height: totalHeight };
    }

    centerTree() {
        // Get SVG dimensions
        const svgRect = this.svg.getBoundingClientRect();
        const svgWidth = svgRect.width;
        const svgHeight = svgRect.height;

        // Find bounds of the tree
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;

        for (let [id, pos] of this.nodePositions) {
            minX = Math.min(minX, pos.x);
            maxX = Math.max(maxX, pos.x + this.nodeWidth);
            minY = Math.min(minY, pos.y);
            maxY = Math.max(maxY, pos.y + this.nodeHeight);
        }

        const treeWidth = maxX - minX;
        const treeHeight = maxY - minY;

        // Calculate initial translation to center the tree
        this.translateX = (svgWidth - treeWidth) / 2 - minX + 50;
        this.translateY = (svgHeight - treeHeight) / 2 - minY + 50;

        this.updateTransform();
    }

    render() {
        this.renderConnections();
        this.renderNodes();
    }

    renderNodes() {
        this.nodesLayer.innerHTML = '';

        for (let [id, pos] of this.nodePositions) {
            const node = pos.node;
            const nodeGroup = this.createNodeElement(node, pos.x, pos.y);
            this.nodesLayer.appendChild(nodeGroup);
        }
    }

    createNodeElement(node, x, y) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.classList.add('node', `node-gen${node.generation}`);
        g.setAttribute('data-id', node.id);
        g.setAttribute('transform', `translate(${x}, ${y})`);

        // Node rectangle
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.classList.add('node-rect');
        rect.setAttribute('width', this.nodeWidth);
        rect.setAttribute('height', this.nodeHeight);
        g.appendChild(rect);

        // Photo circle placeholder
        const photoCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        photoCircle.classList.add('node-photo-container');
        photoCircle.setAttribute('cx', this.nodeWidth / 2);
        photoCircle.setAttribute('cy', 35);
        photoCircle.setAttribute('r', 28);
        photoCircle.style.pointerEvents = 'none';
        g.appendChild(photoCircle);

        // Photo icon (placeholder)
        const photoIcon = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        photoIcon.classList.add('node-photo-icon');
        photoIcon.setAttribute('x', this.nodeWidth / 2);
        photoIcon.setAttribute('y', 42);
        photoIcon.setAttribute('text-anchor', 'middle');
        photoIcon.setAttribute('font-size', '24');
        photoIcon.setAttribute('fill', '#95A5A6');
        photoIcon.style.pointerEvents = 'none';
        photoIcon.textContent = '👤';
        g.appendChild(photoIcon);

        // Name text
        const nameText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        nameText.classList.add('node-name');
        nameText.setAttribute('x', this.nodeWidth / 2);
        nameText.setAttribute('y', 80);
        nameText.style.pointerEvents = 'none';

        // Wrap long names
        const maxChars = 18;
        const name = node.name;
        if (name.length > maxChars) {
            const words = name.split(' ');
            let line1 = '';
            let line2 = '';
            let inFirstLine = true;

            for (let word of words) {
                if (inFirstLine && (line1 + word).length <= maxChars) {
                    line1 += (line1 ? ' ' : '') + word;
                } else {
                    inFirstLine = false;
                    line2 += (line2 ? ' ' : '') + word;
                }
            }

            const tspan1 = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
            tspan1.setAttribute('x', this.nodeWidth / 2);
            tspan1.setAttribute('dy', 0);
            tspan1.textContent = line1;
            nameText.appendChild(tspan1);

            if (line2) {
                const tspan2 = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
                tspan2.setAttribute('x', this.nodeWidth / 2);
                tspan2.setAttribute('dy', 16);
                tspan2.textContent = line2;
                nameText.appendChild(tspan2);
            }
        } else {
            nameText.textContent = name;
        }
        g.appendChild(nameText);

        // Location text
        if (node.location) {
            const locationText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            locationText.classList.add('node-location');
            locationText.setAttribute('x', this.nodeWidth / 2);
            locationText.setAttribute('y', name.length > maxChars ? 110 : 100);
            locationText.style.pointerEvents = 'none';
            locationText.textContent = `(${node.location})`;
            g.appendChild(locationText);
        }

        // Click event
        g.addEventListener('click', () => this.showNodeInfo(node));

        return g;
    }

    renderConnections() {
        this.connectionsLayer.innerHTML = '';

        for (let [id, pos] of this.nodePositions) {
            const node = pos.node;
            if (node.children && node.children.length > 0) {
                for (let child of node.children) {
                    const childPos = this.nodePositions.get(child.id);
                    if (childPos) {
                        const path = this.createConnection(pos, childPos, node.generation);
                        this.connectionsLayer.appendChild(path);
                    }
                }
            }
        }
    }

    createConnection(parentPos, childPos, generation) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.classList.add('connection', `connection-gen${generation}`);

        // Start point: right center of parent node
        const startX = parentPos.x + this.nodeWidth;
        const startY = parentPos.y + (this.nodeHeight / 2);

        // End point: left center of child node
        const endX = childPos.x;
        const endY = childPos.y + (this.nodeHeight / 2);

        // Control points for bezier curve
        const controlOffset = (endX - startX) / 2;
        const controlX1 = startX + controlOffset;
        const controlY1 = startY;
        const controlX2 = endX - controlOffset;
        const controlY2 = endY;

        // Create cubic bezier curve
        const pathData = `M ${startX} ${startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`;
        path.setAttribute('d', pathData);
        path.setAttribute('marker-end', `url(#arrow-gen${generation})`);

        return path;
    }

    setupEventListeners() {
        // Zoom buttons
        document.getElementById('zoom-in').addEventListener('click', () => this.zoom(1.2));
        document.getElementById('zoom-out').addEventListener('click', () => this.zoom(0.8));
        document.getElementById('reset-view').addEventListener('click', () => this.resetView());

        // Search
        document.getElementById('search-btn').addEventListener('click', () => this.search());
        document.getElementById('search-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.search();
        });

        // Generation filter
        document.getElementById('generation-filter').addEventListener('change', (e) => {
            this.filterByGeneration(e.target.value);
        });

        // Pan functionality
        this.svg.addEventListener('mousedown', (e) => this.startDrag(e));
        this.svg.addEventListener('mousemove', (e) => this.drag(e));
        this.svg.addEventListener('mouseup', () => this.endDrag());
        this.svg.addEventListener('mouseleave', () => this.endDrag());

        // Touch events for mobile
        this.svg.addEventListener('touchstart', (e) => this.startDrag(e.touches[0]));
        this.svg.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.drag(e.touches[0]);
        });
        this.svg.addEventListener('touchend', () => this.endDrag());

        // Wheel zoom
        this.svg.addEventListener('wheel', (e) => {
            e.preventDefault();
            const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
            this.zoom(zoomFactor);
        });

        // Close info panel
        document.getElementById('close-panel').addEventListener('click', () => {
            document.getElementById('info-panel').classList.add('hidden');
        });
    }

    startDrag(e) {
        this.isDragging = true;
        this.startX = e.clientX - this.translateX;
        this.startY = e.clientY - this.translateY;
        this.svg.classList.add('grabbing');
    }

    drag(e) {
        if (!this.isDragging) return;
        this.translateX = e.clientX - this.startX;
        this.translateY = e.clientY - this.startY;
        this.updateTransform();
    }

    endDrag() {
        this.isDragging = false;
        this.svg.classList.remove('grabbing');
    }

    zoom(factor) {
        this.scale *= factor;
        this.scale = Math.max(0.1, Math.min(3, this.scale)); // Limit zoom
        this.updateTransform();
    }

    resetView() {
        this.scale = 1;
        this.centerTree();
    }

    updateTransform() {
        this.treeGroup.setAttribute('transform',
            `translate(${this.translateX}, ${this.translateY}) scale(${this.scale})`);
    }

    search() {
        const query = document.getElementById('search-input').value.toLowerCase().trim();
        if (!query) return;

        // Remove previous highlights
        document.querySelectorAll('.highlighted').forEach(el => {
            el.classList.remove('highlighted');
        });

        // Search for nodes
        let found = false;
        for (let [id, pos] of this.nodePositions) {
            if (pos.node.name.toLowerCase().includes(query)) {
                const nodeElement = document.querySelector(`[data-id="${id}"]`);
                if (nodeElement) {
                    nodeElement.classList.add('highlighted');
                    this.panToNode(pos);
                    found = true;
                    break; // Focus on first match
                }
            }
        }

        if (!found) {
            alert('No matching family member found');
        }
    }

    panToNode(pos) {
        const svgRect = this.svg.getBoundingClientRect();
        const targetX = pos.x + this.nodeWidth / 2;
        const targetY = pos.y + this.nodeHeight / 2;

        this.translateX = svgRect.width / 2 - targetX * this.scale;
        this.translateY = svgRect.height / 2 - targetY * this.scale;
        this.updateTransform();
    }

    filterByGeneration(generation) {
        const nodes = document.querySelectorAll('.node');

        if (generation === 'all') {
            nodes.forEach(node => node.style.display = 'block');
            document.querySelectorAll('.connection').forEach(conn => {
                conn.style.display = 'block';
            });
        } else {
            const gen = parseInt(generation);
            nodes.forEach(node => {
                const nodeGen = parseInt(node.classList[1].replace('node-gen', ''));
                node.style.display = nodeGen <= gen ? 'block' : 'none';
            });

            // Filter connections
            document.querySelectorAll('.connection').forEach(conn => {
                const connGen = parseInt(conn.classList[1].replace('connection-gen', ''));
                conn.style.display = connGen < gen ? 'block' : 'none';
            });
        }
    }

    showNodeInfo(node) {
        const panel = document.getElementById('info-panel');
        panel.classList.remove('hidden');

        document.getElementById('person-name').textContent = node.name;
        document.getElementById('person-location').textContent = node.location ? `Location: ${node.location}` : '';
        document.getElementById('person-generation').textContent = `Generation ${node.generation}`;

        // Children
        const childrenDiv = document.getElementById('person-children');
        if (node.children && node.children.length > 0) {
            childrenDiv.innerHTML = '<h3>Children:</h3><ul>' +
                node.children.map(child => `<li>${child.name}</li>`).join('') +
                '</ul>';
        } else {
            childrenDiv.innerHTML = '<p style="color: #7F8C8D;">No children recorded</p>';
        }

        // Photo placeholder
        const photoImg = document.getElementById('person-photo');
        photoImg.style.display = 'none';
    }
}

// Initialize the tree when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new FamilyTree();
});
