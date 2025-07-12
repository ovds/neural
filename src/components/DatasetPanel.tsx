import React, { useState } from 'react';
import { Plus, Trash2, Download, Upload, Database } from 'lucide-react';
import { TrainingData } from '../types/network';

interface DatasetPanelProps {
  trainingData: TrainingData[];
  onDataChange: (data: TrainingData[]) => void;
  inputSize: number;
  outputSize: number;
}

export const DatasetPanel: React.FC<DatasetPanelProps> = ({
  trainingData,
  onDataChange,
  inputSize,
  outputSize
}) => {
  const [newInputs, setNewInputs] = useState<string>(Array(inputSize).fill('0').join(', '));
  const [newOutputs, setNewOutputs] = useState<string>(Array(outputSize).fill('0').join(', '));
  const [newLabel, setNewLabel] = useState<string>('');

  const addDataPoint = () => {
    const inputs = newInputs.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
    const outputs = newOutputs.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
    
    if (inputs.length === inputSize && outputs.length === outputSize) {
      const newData: TrainingData = {
        inputs,
        outputs,
        label: newLabel || `Data Point ${trainingData.length + 1}`
      };
      onDataChange([...trainingData, newData]);
      
      // Reset form
      setNewInputs(Array(inputSize).fill('0').join(', '));
      setNewOutputs(Array(outputSize).fill('0').join(', '));
      setNewLabel('');
    }
  };

  const removeDataPoint = (index: number) => {
    const newData = trainingData.filter((_, i) => i !== index);
    onDataChange(newData);
  };

  const loadDefaultDataset = () => {
    // XOR problem for 2 inputs, 1 output
    if (inputSize === 2 && outputSize === 1) {
      const xorData: TrainingData[] = [
        { inputs: [0, 0], outputs: [0], label: 'XOR: 0,0 → 0' },
        { inputs: [0, 1], outputs: [1], label: 'XOR: 0,1 → 1' },
        { inputs: [1, 0], outputs: [1], label: 'XOR: 1,0 → 1' },
        { inputs: [1, 1], outputs: [0], label: 'XOR: 1,1 → 0' }
      ];
      onDataChange(xorData);
    } else {
      // Generate random data for other configurations
      const randomData: TrainingData[] = Array.from({ length: 10 }, (_, i) => ({
        inputs: Array.from({ length: inputSize }, () => Math.random()),
        outputs: Array.from({ length: outputSize }, () => Math.random()),
        label: `Random Data ${i + 1}`
      }));
      onDataChange(randomData);
    }
  };

  const exportDataset = () => {
    const dataStr = JSON.stringify(trainingData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'neural_network_dataset.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const importDataset = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          if (Array.isArray(data)) {
            onDataChange(data);
          }
        } catch (error) {
          alert('Error parsing JSON file');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 space-y-6">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Database className="w-5 h-5" />
        Training Dataset
      </h2>

      {/* Dataset Actions */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={loadDefaultDataset}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
        >
          <Database className="w-4 h-4" />
          Load Sample
        </button>
        
        <button
          onClick={exportDataset}
          disabled={trainingData.length === 0}
          className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded text-sm transition-colors"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
        
        <label className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors cursor-pointer">
          <Upload className="w-4 h-4" />
          Import
          <input
            type="file"
            accept=".json"
            onChange={importDataset}
            className="hidden"
          />
        </label>
      </div>

      {/* Add New Data Point */}
      <div className="bg-gray-900 rounded-lg p-4 space-y-3">
        <h4 className="font-semibold text-gray-200">Add Data Point</h4>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Inputs ({inputSize} values)
          </label>
          <input
            type="text"
            value={newInputs}
            onChange={(e) => setNewInputs(e.target.value)}
            placeholder="e.g., 0.5, 0.8, 0.2"
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Outputs ({outputSize} values)
          </label>
          <input
            type="text"
            value={newOutputs}
            onChange={(e) => setNewOutputs(e.target.value)}
            placeholder="e.g., 1.0"
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Label (optional)
          </label>
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="e.g., High confidence case"
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-3 py-2 text-sm"
          />
        </div>

        <button
          onClick={addDataPoint}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Data Point
        </button>
      </div>

      {/* Current Dataset */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h4 className="font-semibold text-gray-200">
            Current Dataset ({trainingData.length} points)
          </h4>
          {trainingData.length > 0 && (
            <button
              onClick={() => onDataChange([])}
              className="text-red-400 hover:text-red-300 text-sm"
            >
              Clear All
            </button>
          )}
        </div>

        <div className="max-h-64 overflow-y-auto space-y-2">
          {trainingData.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              No training data. Add some data points or load a sample dataset.
            </div>
          ) : (
            trainingData.map((data, index) => (
              <div key={index} className="bg-gray-900 rounded p-3 flex justify-between items-center">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-200 truncate">
                    {data.label}
                  </div>
                  <div className="text-xs text-gray-400">
                    In: [{data.inputs.map(n => n.toFixed(2)).join(', ')}] → 
                    Out: [{data.outputs.map(n => n.toFixed(2)).join(', ')}]
                  </div>
                </div>
                <button
                  onClick={() => removeDataPoint(index)}
                  className="ml-2 text-red-400 hover:text-red-300 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};