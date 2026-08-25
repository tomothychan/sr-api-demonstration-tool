import React from 'react';
import NodeUpdateActivityEditor from './NodeUpdateActivityEditor';
import EdgeUpdateActivityEditor from './EdgeUpdateActivityEditor';
import PacketMovementActivityEditor from './PacketMovementActivityEditor';
import DbMutationsActivityEditor from './DbMutationsActivityEditor';
import InspectorPanelActivityEditor from './InspectorPanelActivityEditor';

export default function ActivityEditor({ activity, baseComponents = [], onChange }) {
  switch (activity.type) {
    case 'NodeUpdate':
      return <NodeUpdateActivityEditor activity={activity} baseComponents={baseComponents} onChange={onChange} />;
    case 'EdgeUpdate':
      return <EdgeUpdateActivityEditor activity={activity} baseComponents={baseComponents} onChange={onChange} />;
    case 'PacketMovement':
      return <PacketMovementActivityEditor activity={activity} baseComponents={baseComponents} onChange={onChange} />;
    case 'dbMutations':
      return <DbMutationsActivityEditor activity={activity} baseComponents={baseComponents} onChange={onChange} />;
    case 'inspectorPanelEntry':
      return <InspectorPanelActivityEditor activity={activity} onChange={onChange} />;
    default:
      return (
        <div style={{ fontSize: '0.725rem', color: 'var(--sr-color-text-subtle)' }}>
          Unknown activity type: [{activity.type}]
        </div>
      );
  }
}