/**
 * Factory and Data Class definitions for Scenarios, Components, Steps, and Step Activities.
 */

export class StepActivity {
  constructor({ id = `act-${Date.now()}`, type = 'inspectorPanelEntry', name = '', config = {} } = {}) {
    this.id = id;
    this.type = type; // 'dbMutations' | 'PacketMovement' | 'NodeUpdate' | 'EdgeUpdate' | 'inspectorPanelEntry'
    this.name = name || `New ${type} Activity`;
    this.config = StepActivity.getDefaultConfig(type, config);
  }

  static getDefaultConfig(type, overrideConfig = {}) {
    const defaults = {
      NodeUpdate: {
        nodeGraphId: '',
        nodeId: '',
        state: 'active' // 'inactive' | 'active' | 'completed' | 'updated' | 'error'
      },
      EdgeUpdate: {
        nodeGraphId: '',
        fromNode: '',
        toNode: '',
        state: 'active',
        color: '#3b82f6'
      },
      PacketMovement: {
        nodeGraphId: '',
        fromNode: '',
        toNode: '',
        label: 'POST /event',
        direction: 'forward', // 'forward' | 'reverse'
        color: '#3b82f6'
      },
      dbMutations: {
        dbTableId: '',
        records: []
      },
      inspectorPanelEntry: {
        title: 'Execution Log Entry',
        details: 'Operation performed successfully.',
        payloadText: '{\n  "status": 200,\n  "success": true\n}',
        statusType: 'action' // 'action' | 'process' | 'success'
      }
    };

    return { ...(defaults[type] || {}), ...overrideConfig };
  }
}

export class Step {
  constructor({ id = `step-${Date.now()}`, title = '', activities = [] } = {}) {
    this.id = id;
    this.title = title || 'New Step';
    this.activities = activities.map((act) => new StepActivity(act));
  }
}

export class BaseComponent {
  constructor({ id, type, title, ...extraProps } = {}) {
    this.id = id || `${type}_${Date.now()}`;
    this.type = type; // 'form' | 'nodeGraph' | 'dbTable'
    this.title = title || `New ${type} Component`;
    Object.assign(this, extraProps);
  }

  static createForm(config = {}) {
    return new BaseComponent({
      id: config.id || `form_${Date.now()}`,
      type: 'form',
      title: config.title || 'New Form Component',
      fields: config.fields || []
    });
  }

  static createNodeGraph(config = {}) {
    return new BaseComponent({
      id: config.id || `nodeGraph_${Date.now()}`,
      type: 'nodeGraph',
      title: config.title || 'New Node Graph Component',
      nodes: config.nodes || [],
      edges: config.edges || []
    });
  }

  static createDbTable(config = {}) {
    return new BaseComponent({
      id: config.id || `dbTable_${Date.now()}`,
      type: 'dbTable',
      title: config.title || 'New Database Table Component',
      tableName: config.tableName || 'Company DB',
      dbColumns: config.dbColumns || [
        { key: 'STATE', label: 'STATE', isFixed: true }
      ]
    });
  }
}

export class ScenarioModel {
  constructor({
    id = `custom_scenario_${Date.now()}`,
    name = 'Untitled Scenario',
    description = '',
    inspectorPanelEnabled = true,
    baseComponents = [],
    steps = [new Step({ title: 'Initial Step', activities: [] })]
  } = {}) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.inspectorPanelEnabled = Boolean(inspectorPanelEnabled);
    this.baseComponents = baseComponents.map((comp) => new BaseComponent(comp));
    this.steps = steps.map((step) => new Step(step));
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      inspectorPanelEnabled: this.inspectorPanelEnabled,
      baseComponents: this.baseComponents.map((comp) => {
        if (comp.type === 'nodeGraph' && Array.isArray(comp.edges)) {
          return {
            ...comp,
            edges: comp.edges.filter((e) => e.from && e.from !== '---' && e.to && e.to !== '---')
          };
        }
        return comp;
      }),
      steps: this.steps
    };
  }
}