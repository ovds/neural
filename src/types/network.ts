export interface NetworkNode {
  id: string;
  x: number;
  y: number;
  layer: number;
  activation: number;
  bias: number;
  type: 'input' | 'hidden' | 'output';
}

export interface NetworkConnection {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  weight: number;
  gradient: number;
}

export interface TrainingData {
  inputs: number[];
  outputs: number[];
  label?: string;
}

export interface NetworkConfig {
  inputSize: number;
  hiddenLayers: number[];
  outputSize: number;
  learningRate: number;
  activationFunction: 'sigmoid' | 'relu' | 'tanh';
}

export interface TrainingMetrics {
  epoch: number;
  loss: number;
  accuracy: number;
  timestamp: number;
}

export interface AnimationState {
  isTraining: boolean;
  currentEpoch: number;
  trainingSpeed: number;
  showDataFlow: boolean;
  highlightedConnection: string | null;
  currentDataPoint: TrainingData | null;
}