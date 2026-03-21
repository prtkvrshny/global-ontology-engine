# Global Ontology Engine (GOE Core)

An advanced, cyber-military inspired intelligence dashboard built for tracking global macroeconomics, geopolitical volatility, and live tactical data streams.

## 🌍 Overview

The **Global Ontology Engine** is a high-performance React application designed to visualize and analyze real-time global activities. By combining custom 3D WebGL renderers with live global event APIs (GDELT), GOE Core allows operators to synthesize massive amounts of worldwide data into actionable intelligence briefs. 

The aesthetic is aggressively styled around a dark, glassmorphic "hacker/cyberpunk" scheme featuring neon greens, vibrant cyan, and high-contrast yellows to immediately highlight critical vectors.

## ✨ Key Features

### 1. Global Topology Graph
- **Interactive 3D Matrix:** Built on `react-globe.gl`, featuring a fluid, dynamic camera that maps 192 sovereign nations.
- **Geopolitical Ontologies:** Automatically maps and visually connects an operator's selected nation to its specific "Allies" (Green Arcs) and "Threats" (Red Arcs) utilizing deterministic hashing and hardcoded relational paradigms.
- **Global Trade Network:** Features a highly accurate, internet-vetted macroeconomic database. Clicking on a Tier-1 nation computes its top export/import commodities, tracks exact distribution percentages (e.g., *Exports Aerospace to Canada (15%)*), and maps out the relevant supply chain partners.

### 2. Live Intelligence Feeds (GDELT Integration)
- **Real-Time Extraction:** Pulls live, global news intelligence vectors via the **GDELT Project 2.0 API**, bypassing standard cross-origin restrictions using automated JSONP script injection.
- **Categorical Routing:** Filter global events securely by context (Political, Military, Economic). 
- **Strategic Briefings:** Operators can generate comprehensive, structured "Strategic Action Matrices" summarizing raw intelligence reports directly within the UI.

### 3. Operator Customization
- **Origin Node Bias:** Users authenticate into the engine by selecting an "Operator Origin" country. The dashboard fundamentally alters its live-feed relevance, localized timestamps, and trade perspectives (Internal vs External circulation) based on the user's physical node placement.
- **Fluid UI Navigation:** Features a seamless, React-driven Sidebar navigating through Dashboard, Intelligence Graph, Defense Intel, Climate & Geo, and Voice System frameworks.

## 🛠️ Technology Stack

- **Framework:** React 18 (via Vite)
- **3D Rendering:** `react-globe.gl` / Three.js
- **Animations:** Framer Motion
- **Icons:** `lucide-react`
- **Data Sourcing:** GDELT 2.0 Event Database
- **Styling:** Custom CSS with CSS Variables, Flexbox architectural grids, and Backdrop Filters for a premium glassmorphic UI.

## 📂 Project Structure

```text
global-ontology-engine/
├── src/
│   ├── components/       # Reusable UI architecture
│   │   ├── ReportModal.jsx     # Strategic briefing generator
│   │   ├── Sidebar.jsx         # Main navigation matrix
│   │   └── SettingsModal.jsx   # Operator configuration
│   ├── pages/            # Core dashboard modules
│   │   ├── Dashboard.jsx       # Overview and geographic status
│   │   ├── IntelligenceGraph.jsx # WebGL Earth & Trade Engine
│   │   ├── DataFeeds.jsx       # GDELT live ingestion stream
│   │   ├── DefenseIntel.jsx    # Military tracking metrics
│   │   └── Login.jsx           # Operator authentication portal
│   ├── utils/            # Background logic
│   │   └── gdeltFetcher.js     # JSONP GDELT API handler
│   ├── App.jsx           # Primary routing construct
│   ├── index.css         # Global typography & root variables
│   └── App.css           # Sub-nav and global layout styling
```

## 🚀 Installation & Usage

1. **Clone the Repository:**
   Ensure you have Node.js (v16+) installed.

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Boot the Engine:**
   Run the development server directly from the Vite compiler.
   ```bash
   npm run dev
   ```

4. **Initialize:**
   Open `http://localhost:5173` in your browser. Select your Operator Country to begin your session.

## 🔧 Core Mechanics for Developers

- **IntelligenceGraph Flexbox Architecture:** The 3D map is structurally bound using a `flex: 1` wrapper, perfectly isolating it from the overlapping `350px` sidebar. If modifying the map canvas, ensure the `dimensions.width` variable correctly subtracts the sidebar displacement.
- **Trade Algorithms:** To augment the Intelligence Graph with more accurate data for specific non-Tier-1 nations, simply add objects into the `REAL_TRADE_PROFILES` array inside `IntelligenceGraph.jsx`. Any unspecified nations will cleanly default to the deterministic structural hash.
