import React, { useState, useEffect } from 'react';
import { StairModel, RenderingMode } from './types';

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
  selectedModelId?: string;
}

/**
 * Controls panel component
 */
export const ControlsPanel: React.FC<ControlsPanelProps> = ({ stairModels, onModelChange, selectedModelId }) => {
  const [selectedId, setSelectedId] = useState<string>(selectedModelId || (stairModels.length > 0 ? stairModels[0].id : ''));
  
  // Update selectedId when selectedModelId changes
  useEffect(() => {
    if (selectedModelId) {
      setSelectedId(selectedModelId);
    } else if (stairModels.length > 0 && !selectedId) {
      setSelectedId(stairModels[0].id);
    }
  }, [selectedModelId, stairModels, selectedId]);
  
  const handleModelSelect = (modelId: string) => {
    setSelectedId(modelId);
    onModelChange(modelId);
  };
  
  return (
    <div id="controls" style={{
      position: 'absolute',
      bottom: '16px',
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
      <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 'bold' }}>Current Stair Model</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {stairModels.map((model) => (
          <div key={model.id} style={{ display: 'flex', alignItems: 'center' }}>
            <div 
              style={{ 
                position: 'relative',
                width: '20px',
                height: '20px',
                marginRight: '12px',
                cursor: 'pointer'
              }}
            >
              <input
                type="radio"
                id={`model-${model.id}`}
                name="stairModel"
                value={model.id}
                checked={selectedId === model.id}
                onChange={() => handleModelSelect(model.id)}
                style={{ 
                  opacity: 0,
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  margin: 0,
                  cursor: 'pointer'
                }}
              />
              <div 
                style={{ 
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  border: '2px solid #4a90e2',
                  backgroundColor: 'transparent',
                  boxSizing: 'border-box',
                  pointerEvents: 'none'
                }}
              />
              <div 
                style={{ 
                  position: 'absolute',
                  top: '4px',
                  left: '4px',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: '#4a90e2',
                  opacity: selectedId === model.id ? 1 : 0,
                  transition: 'opacity 0.2s',
                  pointerEvents: 'none'
                }}
              />
            </div>
            <label 
              htmlFor={`model-${model.id}`}
              style={{ cursor: 'pointer' }}
            >
              {model.id}
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
      <p style={{ margin: '0 0 8px 0' }}>🖱️ <strong>Mouse</strong>: Look around</p>
      <p style={{ margin: '0 0 0 0' }}>🐢 <strong>Right-click</strong>: Hold for slow movement</p>
    </div>
  );
};

interface RenderingModeToggleProps {
  currentMode: RenderingMode;
  onModeChange: (mode: RenderingMode) => void;
}

/**
 * Rendering mode toggle component (positioned in top right)
 */
export const RenderingModeToggle: React.FC<RenderingModeToggleProps> = ({ 
  currentMode, 
  onModeChange 
}) => {
  return (
    <div style={{
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
      border: '1px solid #666',
      boxShadow: '0 4px 8px rgba(0,0,0,0.5)'
    }}>
      <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 'bold' }}>Rendering Mode</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '20px', height: '20px', marginRight: '12px' }}>
            <input
              type="radio"
              id="all-faces"
              name="renderingMode"
              checked={currentMode === RenderingMode.ALL_FACES}
              onChange={() => onModeChange(RenderingMode.ALL_FACES)}
              style={{ 
                opacity: 0,
                position: 'absolute',
                width: '100%',
                height: '100%',
                margin: 0,
                cursor: 'pointer'
              }}
            />
            <div style={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              border: '2px solid #4a90e2',
              backgroundColor: 'transparent',
              boxSizing: 'border-box',
              pointerEvents: 'none'
            }}/>
            <div style={{ 
              position: 'absolute',
              top: '4px',
              left: '4px',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#4a90e2',
              opacity: currentMode === RenderingMode.ALL_FACES ? 1 : 0,
              transition: 'opacity 0.2s',
              pointerEvents: 'none'
            }}/>
          </div>
          <label htmlFor="all-faces" style={{ cursor: 'pointer' }}>
            All Faces
          </label>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '20px', height: '20px', marginRight: '12px' }}>
            <input
              type="radio"
              id="flat-rectangles"
              name="renderingMode"
              checked={currentMode === RenderingMode.FLAT_RECTANGLES}
              onChange={() => onModeChange(RenderingMode.FLAT_RECTANGLES)}
              style={{ 
                opacity: 0,
                position: 'absolute',
                width: '100%',
                height: '100%',
                margin: 0,
                cursor: 'pointer'
              }}
            />
            <div style={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              border: '2px solid #4a90e2',
              backgroundColor: 'transparent',
              boxSizing: 'border-box',
              pointerEvents: 'none'
            }}/>
            <div style={{ 
              position: 'absolute',
              top: '4px',
              left: '4px',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#4a90e2',
              opacity: currentMode === RenderingMode.FLAT_RECTANGLES ? 1 : 0,
              transition: 'opacity 0.2s',
              pointerEvents: 'none'
            }}/>
          </div>
          <label htmlFor="flat-rectangles" style={{ cursor: 'pointer' }}>
            Horizontal Rectangles
          </label>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '20px', height: '20px', marginRight: '12px' }}>
            <input
              type="radio"
              id="closed-rectangles"
              name="renderingMode"
              checked={currentMode === RenderingMode.CLOSED_RECTANGLES}
              onChange={() => onModeChange(RenderingMode.CLOSED_RECTANGLES)}
              style={{ 
                opacity: 0,
                position: 'absolute',
                width: '100%',
                height: '100%',
                margin: 0,
                cursor: 'pointer'
              }}
            />
            <div style={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              border: '2px solid #4a90e2',
              backgroundColor: 'transparent',
              boxSizing: 'border-box',
              pointerEvents: 'none'
            }}/>
            <div style={{ 
              position: 'absolute',
              top: '4px',
              left: '4px',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#4a90e2',
              opacity: currentMode === RenderingMode.CLOSED_RECTANGLES ? 1 : 0,
              transition: 'opacity 0.2s',
              pointerEvents: 'none'
            }}/>
          </div>
          <label htmlFor="closed-rectangles" style={{ cursor: 'pointer' }}>
            Closed Horizontal Rectangles
          </label>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '20px', height: '20px', marginRight: '12px' }}>
            <input
              type="radio"
              id="rectangles-with-centers"
              name="renderingMode"
              checked={currentMode === RenderingMode.RECTANGLES_WITH_CENTERS}
              onChange={() => onModeChange(RenderingMode.RECTANGLES_WITH_CENTERS)}
              style={{ 
                opacity: 0,
                position: 'absolute',
                width: '100%',
                height: '100%',
                margin: 0,
                cursor: 'pointer'
              }}
            />
            <div style={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              border: '2px solid #4a90e2',
              backgroundColor: 'transparent',
              boxSizing: 'border-box',
              pointerEvents: 'none'
            }}/>
            <div style={{ 
              position: 'absolute',
              top: '4px',
              left: '4px',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#4a90e2',
              opacity: currentMode === RenderingMode.RECTANGLES_WITH_CENTERS ? 1 : 0,
              transition: 'opacity 0.2s',
              pointerEvents: 'none'
            }}/>
          </div>
          <label htmlFor="rectangles-with-centers" style={{ cursor: 'pointer' }}>
            Rectangles with Center Points
          </label>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '20px', height: '20px', marginRight: '12px' }}>
            <input
              type="radio"
              id="uppermost-rectangles"
              name="renderingMode"
              checked={currentMode === RenderingMode.UPPERMOST_RECTANGLES}
              onChange={() => onModeChange(RenderingMode.UPPERMOST_RECTANGLES)}
              style={{ 
                opacity: 0,
                position: 'absolute',
                width: '100%',
                height: '100%',
                margin: 0,
                cursor: 'pointer'
              }}
            />
            <div style={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              border: '2px solid #4a90e2',
              backgroundColor: 'transparent',
              boxSizing: 'border-box',
              pointerEvents: 'none'
            }}/>
            <div style={{ 
              position: 'absolute',
              top: '4px',
              left: '4px',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#4a90e2',
              opacity: currentMode === RenderingMode.UPPERMOST_RECTANGLES ? 1 : 0,
              transition: 'opacity 0.2s',
              pointerEvents: 'none'
            }}/>
          </div>
          <label htmlFor="uppermost-rectangles" style={{ cursor: 'pointer' }}>
            Uppermost Rectangles Only
          </label>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '20px', height: '20px', marginRight: '12px' }}>
            <input
              type="radio"
              id="aspect-ratio-rectangles"
              name="renderingMode"
              checked={currentMode === RenderingMode.ASPECT_RATIO_RECTANGLES}
              onChange={() => onModeChange(RenderingMode.ASPECT_RATIO_RECTANGLES)}
              style={{ 
                opacity: 0,
                position: 'absolute',
                width: '100%',
                height: '100%',
                margin: 0,
                cursor: 'pointer'
              }}
            />
            <div style={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              border: '2px solid #4a90e2',
              backgroundColor: 'transparent',
              boxSizing: 'border-box',
              pointerEvents: 'none'
            }}/>
            <div style={{ 
              position: 'absolute',
              top: '4px',
              left: '4px',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#4a90e2',
              opacity: currentMode === RenderingMode.ASPECT_RATIO_RECTANGLES ? 1 : 0,
              transition: 'opacity 0.2s',
              pointerEvents: 'none'
            }}/>
          </div>
          <label htmlFor="aspect-ratio-rectangles" style={{ cursor: 'pointer' }}>
            Aspect Ratio 1:3.5-1:4
          </label>
        </div>
      </div>
    </div>
  );
}; 