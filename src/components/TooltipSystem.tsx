import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, X } from 'lucide-react';
import { NetworkNode, NetworkConnection } from '../types/network';

interface TooltipSystemProps {
  selectedNode: NetworkNode | null;
  selectedConnection: NetworkConnection | null;
  onClose: () => void;
}

export const TooltipSystem: React.FC<TooltipSystemProps> = ({
  selectedNode,
  selectedConnection,
  onClose
}) => {
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);

  const tutorialSteps = [
    {
      title: "Welcome to Neural Network Visualizer",
      content: "This interactive tool helps you understand how neural networks learn. Let's start with the basics!"
    },
    {
      title: "Network Architecture",
      content: "The network consists of layers: input (left), hidden (middle), and output (right). Each circle is a neuron that processes information."
    },
    {
      title: "Connections and Weights",
      content: "Lines between neurons represent connections with weights. Thicker, brighter lines indicate stronger connections."
    },
    {
      title: "Training Process",
      content: "During training, the network adjusts weights to minimize prediction errors. Watch the connections change color and thickness!"
    },
    {
      title: "Control Panel",
      content: "Use the control panel to adjust learning rate, change activation functions, and control training speed."
    },
    {
      title: "Dataset Management",
      content: "Add your own training data or use sample datasets to see how different data affects learning."
    }
  ];

  const NodeTooltip = ({ node }: { node: NetworkNode }) => (
    <div className="bg-gray-900 border border-gray-600 rounded-lg p-4 max-w-sm">
      <h3 className="font-bold text-white mb-2">
        {node.type.charAt(0).toUpperCase() + node.type.slice(1)} Neuron
      </h3>
      
      <div className="space-y-2 text-sm text-gray-300">
        <div className="flex justify-between">
          <span>Activation:</span>
          <span className="font-mono text-blue-400">{node.activation.toFixed(4)}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Bias:</span>
          <span className="font-mono text-green-400">{node.bias.toFixed(4)}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Layer:</span>
          <span className="text-purple-400">{node.layer}</span>
        </div>
      </div>

      <div className="mt-3 p-3 bg-gray-800 rounded">
        <h4 className="font-semibold text-gray-200 mb-1">What is this?</h4>
        <p className="text-xs text-gray-400">
          {node.type === 'input' 
            ? "Input neurons receive raw data and pass it forward to the network."
            : node.type === 'output'
            ? "Output neurons produce the final predictions of the network."
            : "Hidden neurons process information using activation functions and weighted connections."
          }
        </p>
      </div>

      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-400 hover:text-white"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );

  const ConnectionTooltip = ({ connection }: { connection: NetworkConnection }) => (
    <div className="bg-gray-900 border border-gray-600 rounded-lg p-4 max-w-sm">
      <h3 className="font-bold text-white mb-2">Neural Connection</h3>
      
      <div className="space-y-2 text-sm text-gray-300">
        <div className="flex justify-between">
          <span>Weight:</span>
          <span className={`font-mono ${connection.weight > 0 ? 'text-blue-400' : 'text-red-400'}`}>
            {connection.weight.toFixed(4)}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Gradient:</span>
          <span className="font-mono text-yellow-400">{connection.gradient.toFixed(4)}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Strength:</span>
          <span className="text-purple-400">
            {Math.abs(connection.weight) > 0.5 ? 'Strong' : 'Weak'}
          </span>
        </div>
      </div>

      <div className="mt-3 p-3 bg-gray-800 rounded">
        <h4 className="font-semibold text-gray-200 mb-1">How it works</h4>
        <p className="text-xs text-gray-400">
          This connection multiplies the input by its weight. Positive weights (blue) strengthen the signal, 
          while negative weights (red) inhibit it. The gradient shows how this weight should change during learning.
        </p>
      </div>

      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-400 hover:text-white"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );

  const TutorialModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-white">
            Tutorial ({tutorialStep + 1}/{tutorialSteps.length})
          </h3>
          <button
            onClick={() => setShowTutorial(false)}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <h4 className="font-semibold text-gray-200 mb-2">
            {tutorialSteps[tutorialStep].title}
          </h4>
          <p className="text-gray-400 text-sm">
            {tutorialSteps[tutorialStep].content}
          </p>
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => setTutorialStep(Math.max(0, tutorialStep - 1))}
            disabled={tutorialStep === 0}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-700 text-white rounded transition-colors"
          >
            Previous
          </button>
          
          {tutorialStep < tutorialSteps.length - 1 ? (
            <button
              onClick={() => setTutorialStep(tutorialStep + 1)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              onClick={() => setShowTutorial(false)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
            >
              Finish
            </button>
          )}
        </div>

        <div className="mt-4 bg-gray-700 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((tutorialStep + 1) / tutorialSteps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Help Button */}
      <button
        onClick={() => setShowTutorial(true)}
        className="fixed top-4 right-4 z-40 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 transition-colors shadow-lg"
        title="Show Tutorial"
      >
        <HelpCircle className="w-5 h-5" />
      </button>

      {/* Node Tooltip */}
      {selectedNode && (
        <div className="fixed top-20 right-4 z-30">
          <NodeTooltip node={selectedNode} />
        </div>
      )}

      {/* Connection Tooltip */}
      {selectedConnection && (
        <div className="fixed top-20 right-4 z-30">
          <ConnectionTooltip connection={selectedConnection} />
        </div>
      )}

      {/* Tutorial Modal */}
      {showTutorial && <TutorialModal />}
    </>
  );
};