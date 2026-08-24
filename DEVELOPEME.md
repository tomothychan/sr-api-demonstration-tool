# Features for this week
Browser Feature:
- See all scenarios saved to browser as a list.
- Rename scenarios

Scenarios are all saved to browder and itself can be - via indexDB.
- a template json
- a jsx file (exactly like the ones already on file)


- Also need a template scenario that can read a databsae file and call it.

dbState is an array of arrys, where the 0ths entry is the header, and the dbState[n][0], denotes the rows state / purpose, that being `added`, `updated`, `deleted`, `default`.

types of components: `form`, `nodeGraph`, `dbTable`, `inspectorPanel`

Also the app checks if you have any existing scenarios stored in your browser and add it to the tab for you. handle tablist overflowing too please. (never shrink them, always make sure they are truncated instead) if not enough space, add a drop down at the far end
{
  "id" : "my-scenario-id",
  "name" : "my-scenario-name",
  "inspectorPanelEnabled": "true",
  "baseComponents": [ // in vertical order
    { // example for a filled in form
      "type": "form",
      // idk figure it out.
    },

    { // example for a node graph
      "type": "nodeGraph",
      "id": "nodeGraph-01",
      "nodes" : [

      ],
      "edges" : [

      ],
    },
    { // example for a db
      "type": "dbTable",
      "id": "dbTable-01",
      "dbCollumns": [
        { "key": "candidateId", "label": "CANDIDATE_ID" },
        { "key": "name", "label": "FULL_NAME" },
        { "key": "email", "label": "EMAIL" },
        { "key": "stage", "label": "STAGE" }
      ],
    }
  ]


  "steps" : {
    0: [ // starting state
      {
        "id": "my-db-id",
        "state": {
          "candidateId": 1,
          "name": "candidate.name",
          "email": "happy@happymail.com",
          "stage": "onboarding",
          "_rowStatus": "added"
        }      
      }
    ]
  }
}


```