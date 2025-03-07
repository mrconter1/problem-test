import React from 'react';
import { StairModel } from './types';

interface InfoPanelProps {
  loadingText: string;
}

/**
 * Info panel component
 */
export const InfoPanel: React.FC<InfoPanelProps> = ({ loadingText }) => {
  return (
    <div id="info" style={{
      position: 'absolute',
      top: '16px',
      left: '16px',
      padding: '16px',
      backgroundColor: 'rgba(0,0,0,0.8)',
      color: 'white',
      fontSize: '14px',
      borderRadius: '8px',
      fontFamily: 'monospace',
      zIndex: 1000,
      pointerEvents: 'none',
      whiteSpace: 'pre-line',
      maxWidth: '400px',
      minWidth: '300px',
      border: '1px solid #666',
      boxShadow: '0 4px 8px rgba(0,0,0,0.5)'
    }}>
      {loadingText}
    </div>
  );
};

interface ControlsPanelProps {
  stairModels: StairModel[];
  onModelChange: (modelId: string) => void;
}

/**
 * Controls panel component
 */
export const ControlsPanel: React.FC<ControlsPanelProps> = ({ stairModels, onModelChange }) => {
  return (
    <div id="controls" style={{
      position: 'absolute',
      top: '16px',
      right: '16px',
      padding: '16px',
      backgroundColor: 'rgba(0,0,0,0.8)',
      color: 'white',
      borderRadius: '8px',
      fontFamily: 'Arial, sans-serif',
      zIndex: 1000,
      fontSize: '14px',
      maxHeight: '80vh',
      overflowY: 'auto',
      border: '1px solid #666',
      boxShadow: '0 4px 8px rgba(0,0,0,0.5)'
    }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 'bold' }}>Stair Models</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {stairModels.map((model, index) => (
          <div key={model.id} style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="radio"
              id={`model-${model.id}`}
              name="stairModel"
              value={model.id}
              defaultChecked={index === 0}
              onChange={() => onModelChange(model.id)}
              style={{ marginRight: '12px', cursor: 'pointer' }}
            />
            <label 
              htmlFor={`model-${model.id}`}
              style={{ cursor: 'pointer' }}
            >
              {model.name}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Camera controls info component
 */
export const CameraInfo: React.FC = () => {
  return (
    <div id="cameraInfo" style={{
      position: 'absolute',
      bottom: '16px',
      left: '16px',
      padding: '16px',
      backgroundColor: 'rgba(0,0,0,0.8)',
      color: 'white',
      borderRadius: '8px',
      fontFamily: 'Arial, sans-serif',
      zIndex: 1000,
      fontSize: '14px',
      border: '1px solid #666',
      boxShadow: '0 4px 8px rgba(0,0,0,0.5)'
    }}>
      <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: 'bold' }}>Camera Controls</h3>
      <p style={{ margin: '0 0 8px 0' }}>📝 <strong>Left-click</strong>: Toggle mouse control</p>
      <p style={{ margin: '0 0 8px 0' }}>⌨️ <strong>WASD</strong>: Move horizontally</p>
      <p style={{ margin: '0 0 8px 0' }}>🚀 <strong>Space</strong>: Move up</p>
      <p style={{ margin: '0 0 8px 0' }}>⬇️ <strong>Shift</strong>: Move down</p>
      <p style={{ margin: '0 0 8px 0' }}>🔓 <strong>Escape</strong>: Exit mouse control</p>
      <p style={{ margin: '0 0 8px 0' }}>🖱️ <strong>Mouse</strong>: Look around</p>
    </div>
  );
}; 