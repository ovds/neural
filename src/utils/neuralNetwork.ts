import { NetworkNode, NetworkConnection, TrainingData, NetworkConfig } from '../types/network';

export class NeuralNetwork {
  nodes: NetworkNode[] = [];
  connections: NetworkConnection[] = [];
  config: NetworkConfig;

  constructor(config: NetworkConfig) {
    this.config = config;
    this.initializeNetwork();
  }

  initializeNetwork() {
    this.nodes = [];
    this.connections = [];
    
    const layerSizes = [this.config.inputSize, ...this.config.hiddenLayers, this.config.outputSize];
    let nodeId = 0;

    // Create nodes for each layer
    layerSizes.forEach((layerSize, layerIndex) => {
      const layerType = layerIndex === 0 ? 'input' : 
                       layerIndex === layerSizes.length - 1 ? 'output' : 'hidden';
      
      for (let i = 0; i < layerSize; i++) {
        this.nodes.push({
          id: `node-${nodeId++}`,
          x: layerIndex * 200 + 100,
          y: i * 80 + 100,
          layer: layerIndex,
          activation: 0,
          bias: Math.random() * 2 - 1,
          type: layerType
        });
      }
    });

    // Create connections between adjacent layers
    for (let layer = 0; layer < layerSizes.length - 1; layer++) {
      const currentLayerNodes = this.nodes.filter(n => n.layer === layer);
      const nextLayerNodes = this.nodes.filter(n => n.layer === layer + 1);

      currentLayerNodes.forEach(fromNode => {
        nextLayerNodes.forEach(toNode => {
          this.connections.push({
            id: `conn-${fromNode.id}-${toNode.id}`,
            fromNodeId: fromNode.id,
            toNodeId: toNode.id,
            weight: Math.random() * 2 - 1,
            gradient: 0
          });
        });
      });
    }
  }

  forward(inputs: number[]): number[] {
    // Set input layer activations
    const inputNodes = this.nodes.filter(n => n.type === 'input');
    inputNodes.forEach((node, index) => {
      node.activation = inputs[index] || 0;
    });

    // Forward propagation through hidden and output layers
    const layers = Math.max(...this.nodes.map(n => n.layer));
    for (let layer = 1; layer <= layers; layer++) {
      const layerNodes = this.nodes.filter(n => n.layer === layer);
      
      layerNodes.forEach(node => {
        const incomingConnections = this.connections.filter(c => c.toNodeId === node.id);
        let sum = node.bias;
        
        incomingConnections.forEach(conn => {
          const fromNode = this.nodes.find(n => n.id === conn.fromNodeId)!;
          sum += fromNode.activation * conn.weight;
        });
        
        node.activation = this.activate(sum);
      });
    }

    return this.nodes.filter(n => n.type === 'output').map(n => n.activation);
  }

  backward(expectedOutputs: number[]) {
    const outputNodes = this.nodes.filter(n => n.type === 'output');
    
    // Calculate output layer errors
    outputNodes.forEach((node, index) => {
      const error = expectedOutputs[index] - node.activation;
      (node as any).error = error * this.activateDerivative(node.activation);
    });

    // Backpropagate errors
    const layers = Math.max(...this.nodes.map(n => n.layer));
    for (let layer = layers - 1; layer >= 0; layer--) {
      const layerNodes = this.nodes.filter(n => n.layer === layer);
      
      layerNodes.forEach(node => {
        if (node.type === 'input') return;
        
        const outgoingConnections = this.connections.filter(c => c.fromNodeId === node.id);
        let errorSum = 0;
        
        outgoingConnections.forEach(conn => {
          const toNode = this.nodes.find(n => n.id === conn.toNodeId)!;
          errorSum += (toNode as any).error * conn.weight;
        });
        
        (node as any).error = errorSum * this.activateDerivative(node.activation);
      });
    }

    // Update weights and calculate gradients
    this.connections.forEach(conn => {
      const fromNode = this.nodes.find(n => n.id === conn.fromNodeId)!;
      const toNode = this.nodes.find(n => n.id === conn.toNodeId)!;
      
      const gradient = (toNode as any).error * fromNode.activation;
      conn.gradient = gradient;
      conn.weight += this.config.learningRate * gradient;
    });
  }

  activate(x: number): number {
    switch (this.config.activationFunction) {
      case 'sigmoid':
        return 1 / (1 + Math.exp(-x));
      case 'relu':
        return Math.max(0, x);
      case 'tanh':
        return Math.tanh(x);
      default:
        return 1 / (1 + Math.exp(-x));
    }
  }

  activateDerivative(x: number): number {
    switch (this.config.activationFunction) {
      case 'sigmoid':
        return x * (1 - x);
      case 'relu':
        return x > 0 ? x : 0;
      case 'tanh':
        return 1 - x * x;
      default:
        return x * (1 - x);
    }
  }

  calculateLoss(predictions: number[], targets: number[]): number {
    return predictions.reduce((sum, pred, i) => {
      return sum + Math.pow(pred - targets[i], 2);
    }, 0) / predictions.length;
  }
}
