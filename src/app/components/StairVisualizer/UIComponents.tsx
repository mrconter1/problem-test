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
  // State to track whether the panel is expanded or collapsed
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  
  // Define render modes with descriptions for tooltips
  const renderModes = [
    { 
      id: 'all-faces', 
      mode: RenderingMode.ALL_FACES, 
      label: 'All Faces',
      description: 'Shows all faces of the model'
    },
    { 
      id: 'flat-rectangles', 
      mode: RenderingMode.FLAT_RECTANGLES, 
      label: 'Horizontal Rectangles',
      description: 'Highlights only the horizontal rectangular faces'
    },
    { 
      id: 'closed-rectangles', 
      mode: RenderingMode.CLOSED_RECTANGLES, 
      label: 'Closed Horizontal Rectangles',
      description: 'Shows only rectangles that are properly closed (4 connected lines)'
    },
    { 
      id: 'uppermost-rectangles', 
      mode: RenderingMode.UPPERMOST_RECTANGLES, 
      label: 'Uppermost Rectangles',
      description: 'Keeps only the topmost rectangle when multiple are stacked'
    },
    { 
      id: 'aspect-ratio-rectangles', 
      mode: RenderingMode.ASPECT_RATIO_RECTANGLES, 
      label: 'Aspect Ratio 1:3.5-1:4',
      description: 'Filters rectangles to only those with aspect ratio between 1:3.5 and 1:4'
    },
    { 
      id: 'long-side-lines', 
      mode: RenderingMode.LONG_SIDE_LINES, 
      label: 'Measure Step Width',
      description: 'Extracts long sides from filtered rectangles and measures the distance between them'
    }
  ];
  
  return (
    <div style={{
      position: 'absolute',
      top: '16px',
      right: '16px',
      maxWidth: '300px',
      backgroundColor: 'rgba(0,0,0,0.8)',
      color: 'white',
      borderRadius: '8px',
      fontFamily: 'Arial, sans-serif',
      zIndex: 1000,
      fontSize: '14px',
      border: '1px solid #666',
      boxShadow: '0 4px 8px rgba(0,0,0,0.5)',
      transition: 'all 0.3s ease'
    }}>
      {/* Header with collapse button */}
      <div 
        style={{
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: isCollapsed ? 'none' : '1px solid #555',
          cursor: 'pointer'
        }}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <h3 style={{ 
          margin: 0, 
          fontSize: '16px', 
          fontWeight: 'bold', 
          display: 'flex', 
          alignItems: 'center' 
        }}>
          <span style={{ marginRight: '8px' }}>🔍</span> 
          Filter Pipeline
          <span style={{ 
            fontSize: '12px', 
            color: '#aaa', 
            marginLeft: '8px',
            fontWeight: 'normal'
          }}>
            (Click to {isCollapsed ? 'expand' : 'collapse'})
          </span>
        </h3>
        <div style={{ 
          transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.3s ease'
        }}>
          ▼
        </div>
      </div>
      
      {/* Collapsible content */}
      {!isCollapsed && (
        <div style={{ padding: '16px' }}>
          <p style={{ 
            margin: '0 0 12px 0', 
            fontSize: '13px', 
            color: '#ccc',
            lineHeight: '1.4'
          }}>
            Select a filter level below. Each step refines the previous filter's results:
          </p>
          
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: '12px',
            maxHeight: '70vh',
            overflowY: 'auto',
            padding: '0 4px'
          }}>
            {renderModes.map((mode, index) => (
              <div 
                key={mode.id}
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  backgroundColor: currentMode === mode.mode ? 'rgba(74, 144, 226, 0.3)' : 'transparent',
                  transition: 'background-color 0.2s',
                  cursor: 'pointer',
                  position: 'relative'
                }}
                onClick={() => onModeChange(mode.mode)}
                title={mode.description}
                >
                  {/* Step number */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    minWidth: '24px',
                    height: '24px',
                    backgroundColor: currentMode === mode.mode ? '#4a90e2' : '#555',
                    color: 'white',
                    borderRadius: '50%',
                    marginRight: '12px',
                    fontWeight: 'bold',
                    fontSize: '12px',
                    transition: 'background-color 0.2s'
                  }}>
                    {index + 1}
                  </div>
                  
                  {/* Label */}
                  <div>
                    <div style={{ 
                      fontWeight: currentMode === mode.mode ? 'bold' : 'normal',
                      transition: 'font-weight 0.2s'
                    }}>
                      {mode.label}
                    </div>
                    
                    {/* Description only shows for active item */}
                    {currentMode === mode.mode && (
                      <div style={{ 
                        fontSize: '11px', 
                        color: '#aaa',
                        marginTop: '4px',
                        transition: 'all 0.3s',
                        maxWidth: '200px'
                      }}>
                        {mode.description}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 