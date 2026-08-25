# Features for this week

implment logic for exporting as json
implment logic for simulating scenario (aka need a template json)

1. populate the editor with meaningful basecomponents
   1. Node Graph should be a horizontal table where you can add collumns (but not rows), then can add nodes, change their icon amongst the preset few(`sheet` `globe` `server` `workflow` `database`) and rename em. (color changing is set on the activity step. implement this later) Also allow the user to define edges between any 2 nodes which are on adjacent columns (but not same column) read the existing `NodeDataFlowDiagram.jsx` for reference.
   2. Forms should let you add, remove, reorder, rename new formfields, and specify whether they are: `string` `email` `int` `date` (come up with more as you see fit)
   3. DBTables should let you define the specific collumns. The 0th collumn must be State and cannot be changed. Enforce SNAKE_CAPS casing
2. populate the editor with meaningful activitySteps
   1. NodeState changes: `active` `inactive` `updated` `completed` `error` (link `NodeDataFlowDiagram.jsx` for reference)
3. deleting a base component with existing steps pointing to that component should show a warning, and ask you to confirm delete (and hence deleting every relating activity steps)

Update Scenario Model Accordingly, and turn every one of them into their own isolated jsx file stored in src/builder/components

1. implment logic for showcasePanel showing. (local storage stores this information)
2. Also the app checks if you have any existing scenarios stored in your browser and add it to the tab for you. handle tablist overflowing too please. (never shrink them, always make sure they are truncated instead) if not enough space, add a drop down at the far end

ok i should beba



Reset Scenario should be moved to the individudal tabs rather than the header bleh. (or maybe not? maybe not needed.)
editor must auto save before moving to browser
