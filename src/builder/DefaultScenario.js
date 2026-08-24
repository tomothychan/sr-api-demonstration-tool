import { ScenarioModel } from './ScenarioModels';

export const DEFAULT_SCENARIO_TEMPLATE = new ScenarioModel({
  id: 'custom_scenario_template',
  name: 'New Custom Integration Scenario',
  description: 'Custom integration scenario built with the visual scenario editor.',
  inspectorPanelEnabled: true,
  baseComponents: [
    {
      id: 'form-01',
      type: 'form',
      title: 'Interactive Form Input',
      fields: [
        { name: 'firstName', label: 'First Name', type: 'text', defaultValue: 'Alex' },
        { name: 'lastName', label: 'Last Name', type: 'text', defaultValue: 'Morgan' },
        { name: 'email', label: 'Email Address', type: 'email', defaultValue: 'alex.morgan@example.com' }
      ]
    },
    {
      id: 'nodeGraph-01',
      type: 'nodeGraph',
      title: 'System Node Architecture',
      nodes: [
        { id: 'client', label: 'Career Portal', sublabel: 'React Front-End', icon: 'globe', col: 1 },
        { id: 'middleware', label: 'API Wrapper', sublabel: 'Data Mapper', icon: 'workflow', col: 2 },
        { id: 'sr_api', label: 'SmartRecruiters', sublabel: 'Open Web API', icon: 'server', col: 3 }
      ],
      edges: [
        { from: 'client', to: 'middleware' },
        { from: 'middleware', to: 'sr_api' }
      ]
    },
    {
      id: 'dbTable-01',
      type: 'dbTable',
      title: 'SmartRecruiters Candidate Database',
      tableName: 'candidates',
      dbColumns: [
        { key: 'candidateId', label: 'CANDIDATE_ID' },
        { key: 'name', label: 'FULL_NAME' },
        { key: 'email', label: 'EMAIL' },
        { key: 'stage', label: 'STAGE' }
      ]
    }
  ],
  steps: [
    {
      id: 'step-0',
      title: 'Step 0: Initial State',
      activities: [
        {
          id: 'act-01',
          type: 'dbMutations',
          name: 'Initial DB Records',
          config: { tableName: 'candidates', records: [] }
        }
      ]
    },
    {
      id: 'step-1',
      title: 'Step 1: Submit Application Payload',
      activities: [
        {
          id: 'act-02',
          type: 'PacketMovement',
          name: 'Send Form Payload',
          config: { fromNode: 'client', toNode: 'middleware', label: 'Form Payload' }
        },
        {
          id: 'act-03',
          type: 'inspectorPanelEntry',
          name: 'Log Form Event',
          config: { title: 'Client Action: Form Submitted', statusType: 'action' }
        }
      ]
    }
  ]
}).toJSON();