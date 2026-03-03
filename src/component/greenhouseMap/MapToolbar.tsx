import React from 'react';
import { BiZoomIn, BiZoomOut, BiReset } from 'react-icons/bi';

interface MapToolbarProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

const MapToolbar: React.FC<MapToolbarProps> = ({ onZoomIn, onZoomOut, onReset }) => {
  return (
    <div className="map-toolbar">
      <div className="toolbar-group">
        <button onClick={onZoomIn} className="toolbar-btn" title="Przybliż">
          <BiZoomIn size={20} />
        </button>
        <button onClick={onZoomOut} className="toolbar-btn" title="Oddal">
          <BiZoomOut size={20} />
        </button>
        <button onClick={onReset} className="toolbar-btn" title="Resetuj widok">
          <BiReset size={20} />
        </button>
      </div>
    </div>
  );
};

export default MapToolbar;
