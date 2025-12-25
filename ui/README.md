# Family Tree Frontend

Interactive family tree visualization and editor built with React, TypeScript, and Konva.js.

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Backend API running at `http://localhost:8080`

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Then open http://localhost:5173

### Build for Production

```bash
npm run build
npm run preview
```

## 🎯 Features

### ✅ Implemented (MVP Ready!)

- ✅ Canvas-based rendering with Konva.js
- ✅ Tree layout algorithm (Reingold-Tilford)
- ✅ Color-coded generations (10 levels)
- ✅ Zoom & Pan controls
- ✅ Drag & drop nodes (Edit mode)
- ✅ Position persistence to database
- ✅ Info panel with person details
- ✅ Family relationship navigation
- ✅ Search functionality (UI ready)
- ✅ View/Edit mode toggle
- ✅ Responsive design
- ✅ Error handling & notifications

## 📁 Key Files

- `src/App.tsx` - Main application
- `src/components/canvas/FamilyTreeCanvas.tsx` - Konva Stage
- `src/components/canvas/TreeNodeComponent.tsx` - Individual nodes
- `src/stores/treeStore.ts` - Tree data state
- `src/stores/uiStore.ts` - UI state

## 🎨 Technologies

- React 18 + TypeScript
- Konva.js (canvas rendering)
- Zustand (state management)
- Axios (API client)
- Bootstrap 5 + Reactstrap

## 📖 Usage

### View Mode
- Drag canvas to pan
- Mouse wheel to zoom
- Click node to see details

### Edit Mode
- Click "Edit Mode" button
- Drag nodes to reposition
- Positions auto-save to database

## 🐛 Troubleshooting

**Backend Connection Error:**
```bash
cd ../family-tree-api
./mvnw spring-boot:run
```

**CORS Issues:**
Backend already configured. Verify it's running on port 8080.

## 📝 License

See LICENSE file in project root.
