import React, { useRef, useEffect } from 'react';
import { NetworkNode, NetworkConnection, AnimationState } from '../types/network';

interface NetworkVisualizationProps {
  nodes: NetworkNode[];
  connections: NetworkConnection[];
  animationState: AnimationState;
  onNodeClick: (node: NetworkNode) => void;
  onConnectionClick: (connection: NetworkConnection) => void;
}

export const NetworkVisualization: React.FC<NetworkVisualizationProps> = ({
  nodes,
  connections,
  animationState,
  onNodeClick,
  onConnectionClick
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  const getNodeColor = (node: NetworkNode): string => {
    const intensity = Math.abs(node.activation);
    const hue = node.activation > 0 ? 120 : 0; // Green for positive, red for negative
    return `hsl(${hue}, 70%, ${50 + intensity * 30}%)`;
  };

  const getConnectionColor = (connection: NetworkConnection): string => {
    const intensity = Math.abs(connection.weight);
    const hue = connection.weight > 0 ? 220 : 10; // Blue for positive, red for negative
    return `hsl(${hue}, 80%, ${40 + intensity * 40}%)`;
  };

  const getConnectionWidth = (connection: NetworkConnection): number => {
    return Math.max(1, Math.abs(connection.weight) * 5);
  };

  const renderActivationFunction = (node: NetworkNode) => {
    if (node.type === 'input') return null;
    
    return (
      <g>
        <circle
          cx={node.x + 25}
          cy={node.y - 25}
          r={8}
          fill="rgba(255, 255, 255, 0.9)"
          stroke="#4F46E5"
          strokeWidth="1"
        />
        <text
          x={node.x + 25}
          y={node.y - 21}
          textAnchor="middle"
          fontSize="8"
          fill="#4F46E5"
          fontWeight="bold"
        >
          f
        </text>
      </g>
    );
  };

  const renderDataFlow = () => {
    if (!animationState.showDataFlow || !animationState.currentDataPoint) return null;

    return (
      <g className="data-flow">
        {connections.map((connection, index) => {
          const fromNode = nodes.find(n => n.id === connection.fromNodeId);
          const toNode = nodes.find(n => n.id === connection.toNodeId);
          if (!fromNode || !toNode) return null;

          return (
            <circle
              key={`flow-${connection.id}`}
              r="3"
              fill="#FFD700"
              className="animate-pulse"
            >
              <animateMotion
                dur="2s"
                repeatCount="indefinite"
                begin={`${index * 0.1}s`}
              >
                <mpath href={`#path-${connection.id}`} />
              </animateMotion>
            </circle>
          );
        })}
      </g>
    );
  };

  return (
    <div className="bg-gray-900 rounded-lg p-4 overflow-auto">
      <svg
        ref={svgRef}
        width="100%"
        height="600"
        viewBox="0 0 1000 600"
        className="border border-gray-700 rounded"
      >
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          {connections.map(connection => {
            const fromNode = nodes.find(n => n.id === connection.fromNodeId);
            const toNode = nodes.find(n => n.id === connection.toNodeId);
            if (!fromNode || !toNode) return null;

            return (
              <path
                key={`path-${connection.id}`}
                id={`path-${connection.id}`}
                d={`M ${fromNode.x + 15} ${fromNode.y} L ${toNode.x - 15} ${toNode.y}`}
                fill="none"
              />
            );
          })}
        </defs>

        {/* Background grid */}
        <defs>
          <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#374151" strokeWidth="0.5" opacity="0.3"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Connections */}
        <g className="connections">
          {connections.map(connection => {
            const fromNode = nodes.find(n => n.id === connection.fromNodeId);
            const toNode = nodes.find(n => n.id === connection.toNodeId);
            if (!fromNode || !toNode) return null;

            const isHighlighted = animationState.highlightedConnection === connection.id;

            return (
              <line
                key={connection.id}
                x1={fromNode.x + 15}
                y1={fromNode.y}
                x2={toNode.x - 15}
                y2={toNode.y}
                stroke={getConnectionColor(connection)}
                strokeWidth={getConnectionWidth(connection)}
                opacity={isHighlighted ? 1 : 0.6}
                filter={isHighlighted ? "url(#glow)" : "none"}
                className="cursor-pointer transition-all duration-200 hover:opacity-100"
                onClick={() => onConnectionClick(connection)}
              />
            );
          })}
        </g>

        {/* Data flow animation */}
        {renderDataFlow()}

        {/* Nodes */}
        <g className="nodes">
          {nodes.map(node => (
            <g key={node.id}>
              <circle
                cx={node.x}
                cy={node.y}
                r={15}
                fill={getNodeColor(node)}
                stroke="#ffffff"
                strokeWidth="2"
                className="cursor-pointer transition-all duration-200 hover:r-18"
                onClick={() => onNodeClick(node)}
                filter="url(#glow)"
              />
              <text
                x={node.x}
                y={node.y + 5}
                textAnchor="middle"
                fontSize="10"
                fill="white"
                fontWeight="bold"
                pointerEvents="none"
              >
                {node.activation.toFixed(2)}
              </text>
              {renderActivationFunction(node)}
            </g>
          ))}
        </g>

        {/* Layer labels */}
        <g className="layer-labels">
          {Array.from(new Set(nodes.map(n => n.layer))).map(layer => {
            const layerNodes = nodes.filter(n => n.layer === layer);
            const layerType = layerNodes[0]?.type;
            const x = layerNodes[0]?.x || 0;
            
            return (
              <text
                key={layer}
                x={x}
                y={30}
                textAnchor="middle"
                fontSize="14"
                fill="#9CA3AF"
                fontWeight="bold"
              >
                {layerType === 'input' ? 'Input Layer' :
                 layerType === 'output' ? 'Output Layer' :
                 `Hidden Layer ${layer}`}
              </text>
            );
          })}
        </g>
      </svg>
    </div>
  );
};