import React, { useState, useEffect, useCallback } from 'react';
import { NetworkVisualization } from './components/NetworkVisualization';
import { ControlPanel } from './components/ControlPanel';
import { MetricsDashboard } from './components/MetricsDashboard';
import { DatasetPanel } from './components/DatasetPanel';
import { TooltipSystem } from './components/TooltipSystem';
import { NeuralNetwork } from './utils/neuralNetwork';
import { 
  NetworkConfig, 
  AnimationState, 
  TrainingData, 
  TrainingMetrics,
  NetworkNode,
  NetworkConnection
} from './types/network';
import { Brain } from 'lucide-react';

function App() {
  // Initial configuration
  const [config, setConfig] = useState<NetworkConfig>({
    inputSize: 2,
    hiddenLayers: [4, 3],
    outputSize: 1,
    learningRate: 0.1,
    activationFunction: 'sigmoid'
  });

  const [network, setNetwork] = useState<NeuralNetwork>(new NeuralNetwork(config));
  const [trainingData, setTrainingData] = useState<TrainingData[]>([]);
  const [metrics, setMetrics] = useState<TrainingMetrics[]>([]);
  const [currentLoss, setCurrentLoss] = useState<number>(0);
  const [currentAccuracy, setCurrentAccuracy] = useState<number>(0);
  
  const [animationState, setAnimationState] = useState<AnimationState>({
    isTraining: false,
    currentEpoch: 0,
    trainingSpeed: 1.0,
    showDataFlow: true,
    highlightedConnection: null,
    currentDataPoint: null
  });

  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<NetworkConnection | null>(null);

  // Update network when configuration changes
  useEffect(() => {
    const newNetwork = new NeuralNetwork(config);
    setNetwork(newNetwork);
    setMetrics([]);
    setAnimationState(prev => ({ ...prev, currentEpoch: 0 }));
  }, [config]);

  // Training loop
  useEffect(() => {
    if (!animationState.isTraining || trainingData.length === 0) return;

    const interval = setInterval(() => {
      trainStep();
    }, 1000 / animationState.trainingSpeed);

    return () => clearInterval(interval);
  }, [animationState.isTraining, animationState.trainingSpeed, trainingData]);

  const trainStep = useCallback(() => {
    if (trainingData.length === 0) return;

    let totalLoss = 0;
    let correctPredictions = 0;

    // Train on all data points
    trainingData.forEach((data, index) => {
      setAnimationState(prev => ({ ...prev, currentDataPoint: data }));
      
      const predictions = network.forward(data.inputs);
      network.backward(data.outputs);
      
      const loss = network.calculateLoss(predictions, data.outputs);
      totalLoss += loss;

      // Calculate accuracy (simplified for binary classification)
      if (data.outputs.length === 1) {
        const predicted = predictions[0] > 0.5 ? 1 : 0;
        const actual = data.outputs[0] > 0.5 ? 1 : 0;
        if (predicted === actual) correctPredictions++;
      }
    });

    const avgLoss = totalLoss / trainingData.length;
    const accuracy = (correctPredictions / trainingData.length) * 100;

    setCurrentLoss(avgLoss);
    setCurrentAccuracy(accuracy);

    const newMetric: TrainingMetrics = {
      epoch: animationState.currentEpoch + 1,
      loss: avgLoss,
      accuracy,
      timestamp: Date.now()
    };

    setMetrics(prev => [...prev, newMetric]);
    setAnimationState(prev => ({ 
      ...prev, 
      currentEpoch: prev.currentEpoch + 1,
      currentDataPoint: null
    }));
  }, [network, trainingData, animationState.currentEpoch]);

  const handleConfigChange = (newConfig: Partial<NetworkConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  };

  const handleAnimationChange = (newState: Partial<AnimationState>) => {
    setAnimationState(prev => ({ ...prev, ...newState }));
  };

  const handleReset = () => {
    const newNetwork = new NeuralNetwork(config);
    setNetwork(newNetwork);
    setMetrics([]);
    setCurrentLoss(0);
    setCurrentAccuracy(0);
    setAnimationState(prev => ({ 
      ...prev, 
      currentEpoch: 0, 
      isTraining: false,
      currentDataPoint: null
    }));
  };

  const handleStep = () => {
    if (trainingData.length > 0) {
      trainStep();
    }
  };

  const handleNodeClick = (node: NetworkNode) => {
    setSelectedNode(node);
    setSelectedConnection(null);
  };

  const handleConnectionClick = (connection: NetworkConnection) => {
    setSelectedConnection(connection);
    setSelectedNode(null);
    setAnimationState(prev => ({ 
      ...prev, 
      highlightedConnection: connection.id 
    }));
  };

  const handleTooltipClose = () => {
    setSelectedNode(null);
    setSelectedConnection(null);
    setAnimationState(prev => ({ 
      ...prev, 
      highlightedConnection: null 
    }));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center gap-3">
          <Brain className="w-8 h-8 text-blue-400" />
          <div>
            <h1 className="text-2xl font-bold">Neural Network Visualizer</h1>
            <p className="text-gray-400 text-sm">
              Interactive learning tool for understanding neural network training
            </p>
          </div>
        </div>
      </header>

      <main className="p-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Network Visualization */}
          <div className="xl:col-span-2">
            <NetworkVisualization
              nodes={network.nodes}
              connections={network.connections}
              animationState={animationState}
              onNodeClick={handleNodeClick}
              onConnectionClick={handleConnectionClick}
            />
          </div>

          {/* Right Panel */}
          <div className="space-y-6">
            <ControlPanel
              config={config}
              animationState={animationState}
              onConfigChange={handleConfigChange}
              onAnimationChange={handleAnimationChange}
              onReset={handleReset}
              onStep={handleStep}
            />

            <MetricsDashboard
              metrics={metrics}
              currentLoss={currentLoss}
              currentAccuracy={currentAccuracy}
            />
          </div>
        </div>

        {/* Bottom Panel */}
        <div className="mt-6">
          <DatasetPanel
            trainingData={trainingData}
            onDataChange={setTrainingData}
            inputSize={config.inputSize}
            outputSize={config.outputSize}
          />
        </div>
      </main>

      {/* Tooltip System */}
      <TooltipSystem
        selectedNode={selectedNode}
        selectedConnection={selectedConnection}
        onClose={handleTooltipClose}
      />
    </div>
  );
}

export default App;