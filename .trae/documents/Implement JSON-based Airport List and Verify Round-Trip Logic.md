I will implement the requested features to enhance the airport search and date selection experience.

### **1. Airport Data Integration (JSON Source)**

To "list out all" airports using a JSON source as requested, I will:

* **Create a new data file**: `apps/skytripsv1/src/data/airports.json` containing a curated list of major global airports (including Sydney, Kathmandu, London, Tokyo, etc.) structured to match the application's data model.

* **Update** **`AirportSearch.tsx`**:

  * Import the local JSON data.

  * Modify the component to **display this default list** immediately when the user clicks/focuses on the "From" or "To" fields, instead of requiring them to type first.

  * This ensures users see a helpful list of popular destinations (City + IATA Code) instantly.

### **2. Round-Trip & Return Date Logic**

I will confirm and ensure the "Round-trip" selection logic works as requested:

* **Verification**: Ensure the `SearchWidget` correctly passes the `tripType` ('round\_trip' vs 'one\_way') to the `DateRangePicker`.

* **Behavior**:

  * **One-way**: The Return Date field will be hidden.

  * **Round-trip**: The Return Date field will be visible and mandatory.

  * **Validation**: Ensure users cannot select a return date earlier than the departure date.

### **Implementation Steps**

1. Create `apps/skytripsv1/src/data/airports.json` with comprehensive airport data.
2. Modify `apps/skytripsv1/src/components/AirportSearch.tsx` to load and display this data on focus.
3. (Already implemented) Verify `SearchWidget.tsx` handles the round-trip toggle correctly to show/hide the return date.

