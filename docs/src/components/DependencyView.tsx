import React, { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { RoadmapItem } from '../types/roadmap';

interface DependencyViewProps {
  items: RoadmapItem[];
}

// Status colors for nodes
const statusColors: Record<string, string> = {
  proposed: '#6b7280',
  adr_validated: '#3b82f6',
  bdd_pending: '#8b5cf6',
  bdd_complete: '#10b981',
  implementing: '#f59e0b',
  nfr_validating: '#f97316',
  nfr_blocked: '#ef4444',
  complete: '#10b981',
};

// Status icons as SVG components
const StatusIcon = ({ status }: { status: string }) => {
  const iconStyle = { width: '16px', height: '16px', marginRight: '6px', flexShrink: 0 };
  
  switch (status) {
    case 'proposed':
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="4" fill="#6b7280" />
        </svg>
      );
    case 'adr_validated':
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
          <path d="M9 12h6M9 16h6M9 8h6M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
        </svg>
      );
    case 'bdd_pending':
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2">
          <path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      );
    case 'bdd_complete':
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      );
    case 'implementing':
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
          <path d="M2 12h4M20 12h4M12 2v4M12 20v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
      );
    case 'nfr_validating':
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
      );
    case 'nfr_blocked':
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M4.93 4.93l14.14 14.14" />
        </svg>
      );
    case 'complete':
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      );
    default:
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
  }
};

// Custom node component
const RoadNode = ({ data }: { data: any }) => {
  return (
    <div
      style={{
        background: 'white',
        border: `2px solid ${data.color}`,
        borderRadius: '8px',
        padding: '10px',
        minWidth: '150px',
        maxWidth: '200px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '4px' }}>
        {data.id}
      </div>
      <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '4px', display: 'flex', alignItems: 'center' }}>
        <StatusIcon status={data.status} />
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {data.title}
        </span>
      </div>
      <div style={{ fontSize: '0.75rem', color: data.color }}>
        {data.status.replace(/_/g, ' ')}
      </div>
    </div>
  );
};

const nodeTypes = {
  road: RoadNode,
};

export default function DependencyView({ items }: DependencyViewProps): JSX.Element {
  // Create nodes from ROAD items
  const initialNodes: Node[] = useMemo(() => {
    return items.map((item, index) => ({
      id: item.id,
      type: 'road',
      position: {
        // Arrange in a grid layout
        x: (index % 5) * 250,
        y: Math.floor(index / 5) * 150,
      },
      data: {
        id: item.id,
        title: item.title,
        status: item.status,
        color: statusColors[item.status] || '#6b7280',
      },
    }));
  }, [items]);

  // Create edges from dependencies
  const initialEdges: Edge[] = useMemo(() => {
    const edges: Edge[] = [];
    
    items.forEach(item => {
      // Create edges for blocked_by relationships
      if (item.blocked_by && item.blocked_by.length > 0) {
        item.blocked_by.forEach(blockerId => {
          edges.push({
            id: `${blockerId}-${item.id}`,
            source: blockerId,
            target: item.id,
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#ef4444', strokeWidth: 2 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#ef4444',
            },
            label: 'blocks',
            labelStyle: { fill: '#ef4444', fontSize: 10 },
          });
        });
      }
      
      // Create edges for blocks relationships
      if (item.blocks && item.blocks.length > 0) {
        item.blocks.forEach(blockedId => {
          // Only add if not already added from the other direction
          const existingEdge = edges.find(e => e.source === item.id && e.target === blockedId);
          if (!existingEdge) {
            edges.push({
              id: `${item.id}-${blockedId}`,
              source: item.id,
              target: blockedId,
              type: 'smoothstep',
              animated: true,
              style: { stroke: '#f59e0b', strokeWidth: 2 },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: '#f59e0b',
              },
              label: 'blocks',
              labelStyle: { fill: '#f59e0b', fontSize: 10 },
            });
          }
        });
      }
      
      // Create edges for depends_on relationships
      if (item.depends_on && item.depends_on.length > 0) {
        item.depends_on.forEach(depId => {
          edges.push({
            id: `${depId}-dep-${item.id}`,
            source: depId,
            target: item.id,
            type: 'smoothstep',
            animated: false,
            style: { stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '5,5' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#3b82f6',
            },
            label: 'depends on',
            labelStyle: { fill: '#3b82f6', fontSize: 10 },
          });
        });
      }
    });
    
    return edges;
  }, [items]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  if (items.length === 0) {
    return (
      <div className="dependency-empty">
        <p>No roadmap items to display.</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '600px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Background />
        <Controls />
        <MiniMap
          nodeColor={(node: Node): string => (node.data?.color as string) || '#6b7280'}
          maskColor="rgba(240, 240, 240, 0.6)"
        />
      </ReactFlow>
      
      <div style={{ marginTop: '10px', fontSize: '0.875rem', color: '#6b7280' }}>
        <strong>Legend:</strong>
        <span style={{ marginLeft: '10px', color: '#ef4444' }}>— blocks (blocking)</span>
        <span style={{ marginLeft: '10px', color: '#f59e0b' }}>— blocks (blocked by)</span>
        <span style={{ marginLeft: '10px', color: '#3b82f6' }}>- - depends on</span>
      </div>
    </div>
  );
}
