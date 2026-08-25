# Features for this week

- editor must auto save before moving to browser

1. ok change how the tablist is constructured: use storageService to fetch all stored, identified which one should be shown via getShowcasePanelScenarios, and create subsequent tabs. This could include or not include the existing jsx defaults, or the custom ones.
2. If there are no stored scenario, the empty tab is replaced by a tab that says "Want to create your own scenarios, go to our Scenario Editor!" and has a button that navigates there. Otherwise it disappears
3. Also the app checks if you have any existing scenarios stored in your browser and add it to the tab for you. handle tablist overflowing too please. (never shrink them, always make sure they are truncated instead) if not enough space, add a drop down at the far end

In the apiheader, add a Go to Showcase / Go to Editor