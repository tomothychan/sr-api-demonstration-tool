/**
 * Factory and Data Class definitions for Scenarios, Components, Steps, and Step Activities.
 */

export class StepActivity {
  constructor({ id = `act-${Date.now()}`, type = 'inspectorPanelEntry', name = '', config = {} } = {}) {
    this.id = id;
    this.type = type; // 'dbMutations' | 'PacketMovement' | 'NodeUpdate' | 'EdgeUpdate' | 'inspectorPanelEntry'
    this.name = name || `New ${type} Activity`;
    this.config = config;
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
    this.id = id || `${type}-${Date.now()}`;
    this.type = type; // 'form' | 'nodeGraph' | 'dbTable'
    this.title = title || `New ${type} Component`;
    Object.assign(this, extraProps);
  }

  static createForm(config = {}) {
    return new BaseComponent({
      type: 'form',
      title: config.title || 'Interactive Form Input',
      fields: config.fields || [{ name: 'field1', label: 'Field Label', type: 'text', defaultValue: '' }]
    });
  }

  static createNodeGraph(config = {}) {
    return new BaseComponent({
      type: 'nodeGraph',
      title: config.title || 'System Node Architecture',
      nodes: config.nodes || [{ id: 'node_1', label: 'Node 1', sublabel: 'Sublabel', icon: 'server', col: 1 }],
      edges: config.edges || []
    });
  }

  static createDbTable(config = {}) {
    return new BaseComponent({
      type: 'dbTable',
      title: config.title || 'Database State',
      tableName: config.tableName || 'custom_table',
      dbColumns: config.dbColumns || [{ key: 'id', label: 'ID' }]
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
      baseComponents: this.baseComponents,
      steps: this.steps
    };
  }
}