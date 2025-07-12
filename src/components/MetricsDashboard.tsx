import React from 'react';
import { TrendingDown, Target, Activity, BarChart3 } from 'lucide-react';
import { TrainingMetrics } from '../types/network';

interface MetricsDashboardProps {
  metrics: TrainingMetrics[];
  currentLoss: number;
  currentAccuracy: number;
}

export const MetricsDashboard: React.FC<MetricsDashboardProps> = ({
  metrics,
  currentLoss,
  currentAccuracy
}) => {
  const recentMetrics = metrics.slice(-50); // Show last 50 epochs

  const maxLoss = Math.max(...recentMetrics.map(m => m.loss), 1);
  const maxAccuracy = 100;

  const renderMiniChart = (data: number[], color: string, max: number) => {
    if (data.length < 2) return null;

    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * 200;
      const y = 60 - (value / max) * 60;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg width="200" height="60" className="overflow-visible">
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          className="drop-shadow-sm"
        />
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
            <stop offset="100%" stopColor={color} stopOpacity="0"/>
          </linearGradient>
        </defs>
        <polygon
          points={`0,60 ${points} 200,60`}
          fill={`url(#gradient-${color})`}
        />
      </svg>
    );
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return 'text-green-400';
    if (accuracy >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getLossColor = (loss: number) => {
    if (loss <= 0.1) return 'text-green-400';
    if (loss <= 0.5) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 space-y-6">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <BarChart3 className="w-5 h-5" />
        Training Metrics
      </h2>

      {/* Current Metrics Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-red-400" />
            <span className="text-sm font-medium text-gray-300">Loss</span>
          </div>
          <div className={`text-2xl font-bold ${getLossColor(currentLoss)}`}>
            {currentLoss.toFixed(4)}
          </div>
          <div className="mt-2">
            {renderMiniChart(recentMetrics.map(m => m.loss), '#EF4444', maxLoss)}
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-gray-300">Accuracy</span>
          </div>
          <div className={`text-2xl font-bold ${getAccuracyColor(currentAccuracy)}`}>
            {currentAccuracy.toFixed(1)}%
          </div>
          <div className="mt-2">
            {renderMiniChart(recentMetrics.map(m => m.accuracy), '#10B981', maxAccuracy)}
          </div>
        </div>
      </div>

      {/* Detailed Charts */}
      <div className="space-y-4">
        <div className="bg-gray-900 rounded-lg p-4">
          <h4 className="font-semibold text-gray-200 mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Training Progress
          </h4>
          
          {recentMetrics.length > 0 ? (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-400 mb-1">
                  <span>Loss Trend</span>
                  <span>{recentMetrics[recentMetrics.length - 1]?.loss.toFixed(4)}</span>
                </div>
                <div className="h-16 relative">
                  {renderMiniChart(recentMetrics.map(m => m.loss), '#EF4444', maxLoss)}
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm text-gray-400 mb-1">
                  <span>Accuracy Trend</span>
                  <span>{recentMetrics[recentMetrics.length - 1]?.accuracy.toFixed(1)}%</span>
                </div>
                <div className="h-16 relative">
                  {renderMiniChart(recentMetrics.map(m => m.accuracy), '#10B981', maxAccuracy)}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              Start training to see metrics
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-gray-900 rounded p-3">
            <div className="text-lg font-bold text-blue-400">
              {metrics.length}
            </div>
            <div className="text-xs text-gray-400">Epochs</div>
          </div>
          
          <div className="bg-gray-900 rounded p-3">
            <div className="text-lg font-bold text-purple-400">
              {metrics.length > 0 ? Math.min(...metrics.map(m => m.loss)).toFixed(4) : '—'}
            </div>
            <div className="text-xs text-gray-400">Best Loss</div>
          </div>
          
          <div className="bg-gray-900 rounded p-3">
            <div className="text-lg font-bold text-green-400">
              {metrics.length > 0 ? Math.max(...metrics.map(m => m.accuracy)).toFixed(1) : '—'}%
            </div>
            <div className="text-xs text-gray-400">Best Accuracy</div>
          </div>
        </div>
      </div>
    </div>
  );
};