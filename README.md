# SmartRecruiters API Storyboard & Integration Simulator

An interactive, dark-mode React application designed to simulate and demonstrate real-time integration workflows between custom front-end portals, middleware (SAP CPI), external data sources (Google Sheets), and the SmartRecruiters Open Web API.

---

## Key Features

* **Interactive Step Controls:** Execute workflows step-by-step using "Run step" or run automated playbacks with "Run all / Pause".
* **Dynamic Auto-Pacing:** Automated execution adapts dynamically—forcing a deliberate delay (2,000ms) for initial steps to ensure readability, then scaling up to rapid execution (150ms) for high-volume batch imports.
* **Consolidated API Inspector Panel:** Reusable right-side inspector (`InspectorPanel.jsx`) with syntax-highlighted JSON payloads, color-coded action badges, and a pinned action control bar at the bottom.
* **Smooth Auto-Scrolling:** Built-in `requestAnimationFrame` ease-out animation that smoothly glides the timeline view as new API events are logged.
* **Live Google Sheets Integration:** Fetches real-time CSV streams directly from Google Sheets with graceful offline fallback data and preview payload truncation (>20 items).
* **Dark Mode & Custom Scrollbars:** Full CSS dark mode styling with custom WebKit/Firefox scrollbars and `color-scheme: dark` compatibility.

---

## Scenario Modules

### 1. Candidate Application Storyboard (`CandidateApplicationStoryboard.jsx`)
Simulates a job seeker applying on a custom career portal:
1. **Client Form Submission:** Captures candidate inputs.
2. **Data Transformation & Resume Parsing:** Maps inputs to SmartRecruiters Open Web API JSON.
3. **Email Deduplication Anchoring:** Checks backend endpoints for duplicate candidate records.
4. **Candidate Record Creation:** Fires an `HTTP POST /postings/{jobId}/candidates` request and displays the 201 Created response.

### 2. SuccessFactors Handoff Storyboard (`SuccessFactorsHandoffStoryboard.jsx`)
Simulates a recruiter hiring a candidate and transferring data to SAP SuccessFactors Employee Central:
1. **Recruiter Status Update:** Candidate moved to `HIRED` status.
2. **Outbound Webhook Event:** SmartRecruiters fires a real-time `candidate.hired` event.
3. **SAP CPI Middleware Mapping:** SAP Integration Suite transforms JSON properties into SuccessFactors OData API schema.
4. **SuccessFactors EC Queue:** Creates candidate records in the *Manage Pending Hires* queue.

### 3. Google Sheet Batch Import (`GoogleSheetImportStoryboard.jsx`)
Simulates an automated ETL pipeline for batch candidate sourcing:
1. **Live CSV Stream:** Fetches rows directly from a public Google Sheet with a scrollable table view (sticky headers, max 10 rows visible).
2. **Schema Extraction:** Parses and normalizes 12 custom candidate fields (`firstName`, `lastName`, `email`, `phone`, `city`, `country`, `jobId`, `institution`, `degree`, `major`, `eduStartDate`, `eduEndDate`).
3. **Batch POST Dispatch:** Sequentially posts each candidate record to SmartRecruiters with payload truncation for preview safety.

---

## Project Directory Structure

```text
src/
├── components/
│   └── InspectorPanel.jsx             # Reusable API timeline inspector panel
├── storyboards/
│   ├── CandidateApplicationStoryboard.jsx   # Candidate site application flow
│   ├── SuccessFactorsHandoffStoryboard.jsx  # Webhook to SAP SuccessFactors flow
│   └── GoogleSheetImportStoryboard.jsx      # Google Sheet batch sourcing flow
├── utils/
│   └── scroll.js                      # Custom ease-out smooth scroll utility
├── App.jsx                            # Main shell app with tab navigation
├── index.css                          # Global dark mode styles & dark scrollbars
└── main.jsx                           # Application entry point

```

---

## Installation & Setup

1. **Clone the Repository**
```bash
git clone [https://github.com/your-org/smartrecruiters-api-storyboard.git](https://github.com/your-org/smartrecruiters-api-storyboard.git)
cd smartrecruiters-api-storyboard

```


2. **Install Dependencies**
```bash
npm install

```


*Required package:* `lucide-react` for icons.
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

### Auto-Scroll Speed

To adjust the log timeline scroll animation speed, modify the duration parameter in `utils/scroll.js` or the call inside `InspectorPanel.jsx`:

```javascript
// duration in milliseconds (300ms default, lower = faster)
smoothScrollTo(timelineRef.current, timelineRef.current.scrollHeight, 300);

```

### Dark Scrollbar Styling

Custom WebKit and Firefox scrollbars are pre-configured in `index.css`:

```css
html {
  color-scheme: dark;
}

::-webkit-scrollbar {
  width: 8px !important;
  height: 8px !important;
}

::-webkit-scrollbar-track {
  background: #18181b !important;
}

::-webkit-scrollbar-thumb {
  background: #3f3f46 !important;
  border-radius: 4px;
}

```

---

## Tech Stack

* **Frontend Framework:** React 18 / 19
* **Icon Suite:** [Lucide React](https://lucide.dev/)
* **Styling:** CSS3 Variables, Modern Flexbox/Grid layouts
* **Build Tooling:** Vite
