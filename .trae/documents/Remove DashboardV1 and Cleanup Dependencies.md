I will remove all `DashboardV1` components and configurations while preserving `SkyTripV1`.

### **Plan of Action**

1.  **Remove Dashboard Application Files**
    *   Delete the entire directory `apps/dashboardsv1` and its contents.

2.  **Clean Project Configuration (`nx.json`)**
    *   Remove the `dashboardsv1` entry from the `projects` object.

3.  **Update Package Dependencies (`package.json`)**
    *   Remove all NPM scripts specific to `dashboardsv1` (e.g., `dev:dashboardsv1`, `build:dashboardsv1`, `start:dashboardsv1`).
    *   Update shared scripts (like `dev`, `start`, `build`) to only target `skytripsv1`.

4.  **Verification**
    *   Run `npm run dev:skytripsv1` to confirm the SkyTrip application still starts and functions correctly.
    *   Verify `package.json` and `nx.json` are clean of dashboard references.
