# Family Tree Frontend

Interactive family tree visualization and editor built with React, TypeScript, and Konva.js.

## 🚀 Quick Start

### Prerequisites

- Node.js 20.19+ or 22.12+ (for Vite 7.3.0 compatibility)
- Java 17+ (for Gradle build)
- Backend API running at `http://localhost:8080`

### Installation

**Using Gradle (Recommended):**
```bash
cd ..
./gradlew :ui:npmInstall
```

**Or using npm directly:**
```bash
npm install
```

### Development

**Using Gradle:**
```bash
cd ..
./gradlew :ui:npmDev
```

**Or using npm directly:**
```bash
npm run dev
```

Then open http://localhost:5173

### Build for Production

**Using Gradle:**
```bash
cd ..
./gradlew :ui:build        # Build + lint checks
./gradlew :ui:assemble     # Build only (skip lint)
```

**Or using npm directly:**
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

- React 19 + TypeScript 5.9
- Vite 7.3.0 (build tool)
- Konva.js (canvas rendering)
- Zustand (state management)
- Axios (API client)
- Bootstrap 5 + Reactstrap
- Gradle (build automation)

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
# Using Gradle (Recommended)
cd ..
./gradlew :api:bootRun

**CORS Issues:**
Backend already configured. Verify it's running on port 8080.

**Node Version Issues:**
If you see "Vite requires Node.js version 20.19+ or 22.12+" errors:
```bash
# Install Node v22 using nvm
nvm install 22
nvm use 22
nvm alias default 22

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## 📝 License

See LICENSE file in project root.
