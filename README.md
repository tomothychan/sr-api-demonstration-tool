# SmartRecruiters API Storyboard & Integration Simulator

An interactive, dark-mode React application designed to simulate and demonstrate real-time integration workflows between custom front-end portals, middleware (SAP CPI), external data sources (Google Sheets), and the SmartRecruiters Open Web API.

---

## Key Features

* **Interactive Step Controls:** Execute workflows step-by-step using "Run step" or run automated playbacks with "Run all / Pause".
* **Dynamic Auto-Pacing:** Automated execution adapts dynamically—forcing a deliberate delay (2,000ms) for initial steps to ensure readability, then scaling up to rapid execution (150ms) for high-volume batch imports.
* **Consolidated API Inspector Panel:** Reusable right-side inspector (`InspectorPanel.jsx`) with syntax-highlighted JSON payloads, color-coded action badges, and a pinned action control bar at the bottom.
* **Node-to-Node Data Flow Diagram:** Flexible architectural node graph (`NodeDataFlowDiagram.jsx`) supporting custom topologies (linear pipelines, two-way handshakes, parallel branching), state-driven node styling (inactive, active, completed, updated, error), and animated data packet movement between system endpoints.
* **Live Database Updates:** Synchronized table component (`LiveDatabaseTable.jsx`) displaying real-time backend record mutations with color-coded state indicators for insertions (green `+`), field updates (yellow `>`), and record deletions (red `-`).
* **Built-in Scenario Builder** Flexible builder components allow you to customize your own scenarios for a range of different circumstances, be it API demonstration, supply chain workflow, etc. All scenarios are stored inside your browser, so all data is private to you and only you.
* **Dark Mode & Light Mode Theme Support:** Full CSS variable-driven styling supporting seamless dark and light theme switching.

---

## Installation & Setup

1. **Clone the Repository**
```bash
git clone https://github.com/tomothychan/sr-api-demonstration-tool.git
cd sr-api-demonstration-tool
```


2. **Install Dependencies**
```bash
npm install
```


3. **Start Development Server**
```bash
npm run dev
```


4. **Build for Production**
```bash
npm run build
```



---

## Configuration & Customization

### Google Sheet Integration

To connect your own Google Sheet to the Batch Import storyboard, ensure the sheet is shared as **"Anyone with the link can view"** and update the `SPREADSHEET_ID` variable in `GoogleSheetImportStoryboard.jsx`:

```javascript
const SPREADSHEET_ID = 'YOUR_GOOGLE_SHEET_ID_HERE';
```

---

## Tech Stack

* **Frontend Framework:** React 18 / 19
* **Icon Suite:** [Lucide React](https://lucide.dev/)
* **Styling:** CSS3 Variables, Modern Flexbox/Grid layouts
* **Build Tooling:** Vite
