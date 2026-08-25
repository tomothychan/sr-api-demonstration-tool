# Features for this week

implment logic for exporting as json
implment logic for simulating scenario (aka need a template json)


1. populate the editor with meaningful stepActivity
   1. NodeState changes: `active` `inactive` `updated` `completed` `error` (link `NodeDataFlowDiagram.jsx` for reference)
   2. Edge color changes
   3. Packet movement, including its text and direction and everything according to `NodeDataFlowDiagram.jsx`
   4. the state of the DB at that step, including all entries and each entry's state and values and everything. inspect `LiveDatabaseTable.jsx` for reference
   5. new inspectorPanel entry. inspect `InspectorPanel.jsx` for reference. `setLogs` is also use but i havent build the template file yet so ignore that for now.
2. deleting a base component with existing steps pointing to that component should show a warning, and ask you to confirm delete (and hence deleting every relating activity steps)

each stepAcitivity may reference the id of a node graph, node, edge, table, form, etc, if relevant / neccessary. make sure those can be configured and edit as well.

Update `ScenarioModel` if need be accordingly, otherwise use it as reference, and turn every stepActivity component into their own isolated jsx file stored in src/builder/components/activities/
inspect an existing hardcoded `WebhookSubscriptionStoryboard` for reference
 
1. implment logic for showcasePanel showing. (local storage stores this information)
2. Also the app checks if you have any existing scenarios stored in your browser and add it to the tab for you. handle tablist overflowing too please. (never shrink them, always make sure they are truncated instead) if not enough space, add a drop down at the far end

ok i should beba



Reset Scenario should be moved to the individudal tabs rather than the header bleh. (or maybe not? maybe not needed.)
editor must auto save before moving to browser
