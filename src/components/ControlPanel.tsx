import React from 'react';
import { Play, Pause, RotateCcw, Settings, Zap, Target } from 'lucide-react';
import { NetworkConfig, AnimationState } from '../types/network';

interface ControlPanelProps {
  config: NetworkConfig;
  animationState: AnimationState;
  onConfigChange: (config: Partial<NetworkConfig>) => void;
  onAnimationChange: (state: Partial<AnimationState>) => void;
  onReset: () => void;
  onStep: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  config,
  animationState,
  onConfigChange,
  onAnimationChange,
  onReset,
  onStep
}) => {
  return (
    <div className="bg-gray-800 rounded-lg p-6 space-y-6">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Settings className="w-5 h-5" />
        Control Panel
      </h2>

      {/* Training Controls */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-200">Training Controls</h3>
        
        <div className="flex gap-2">
          <button
            onClick={() => onAnimationChange({ isTraining: !animationState.isTraining })}
            className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
              animationState.isTraining 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {animationState.isTraining ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {animationState.isTraining ? 'Pause' : 'Start'}
          </button>

          <button
            onClick={onStep}
            disabled={animationState.isTraining}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded transition-colors"
          >
            <Target className="w-4 h-4" />
            Step
          </button>

          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Training Speed: {animationState.trainingSpeed}x
          </label>
          <input
            type="range"
            min="0.1"
            max="5"
            step="0.1"
            value={animationState.trainingSpeed}
            onChange={(e) => onAnimationChange({ trainingSpeed: parseFloat(e.target.value) })}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="showDataFlow"
            checked={animationState.showDataFlow}
            onChange={(e) => onAnimationChange({ showDataFlow: e.target.checked })}
            className="rounded"
          />
          <label htmlFor="showDataFlow" className="text-sm text-gray-300">
            Show Data Flow Animation
          </label>
        </div>
      </div>

      {/* Network Configuration */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Network Configuration
        </h3>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Learning Rate: {config.learningRate.toFixed(3)}
          </label>
          <input
            type="range"
            min="0.001"
            max="1"
            step="0.001"
            value={config.learningRate}
            onChange={(e) => onConfigChange({ learningRate: parseFloat(e.target.value) })}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Activation Function
          </label>
          <select
            value={config.activationFunction}
            onChange={(e) => onConfigChange({ 
              activationFunction: e.target.value as 'sigmoid' | 'relu' | 'tanh' 
            })}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-3 py-2"
          >
            <option value="sigmoid">Sigmoid</option>
            <option value="relu">ReLU</option>
            <option value="tanh">Tanh</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Hidden Layers (comma-separated)
          </label>
          <input
            type="text"
            value={config.hiddenLayers.join(', ')}
            onChange={(e) => {
              const layers = e.target.value.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
              onConfigChange({ hiddenLayers: layers });
            }}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-3 py-2"
            placeholder="e.g., 4, 3"
          />
        </div>
      </div>

      {/* Current Status */}
      <div className="space-y-2 p-4 bg-gray-900 rounded">
        <h4 className="font-semibold text-gray-200">Current Status</h4>
        <div className="text-sm text-gray-400 space-y-1">
          <div>Epoch: {animationState.currentEpoch}</div>
          <div>Status: {animationState.isTraining ? 'Training...' : 'Paused'}</div>
          <div>Nodes: {config.inputSize + config.hiddenLayers.reduce((a, b) => a + b, 0) + config.outputSize}</div>
        </div>
      </div>
    </div>
  );
};