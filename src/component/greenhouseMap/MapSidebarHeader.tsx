import React from 'react';
import { BiPlus, BiSave, BiTrash } from 'react-icons/bi';
import { MapSchema } from '../../services/ConstrolService';

interface MapSidebarHeaderProps {
  maps: MapSchema[];
  currentMapId: string | null;
  mapName: string;
  onMapChange: (mapId: string) => void;
  onCreateMap: () => void;
  onMapNameChange: (name: string) => void;
  onSaveMap: () => void;
  onDeleteMap: () => void;
}

const MapSidebarHeader: React.FC<MapSidebarHeaderProps> = ({
  maps,
  currentMapId,
  mapName,
  onMapChange,
  onCreateMap,
  onMapNameChange,
  onSaveMap,
  onDeleteMap
}) => {
  return (
    <div className="map-sidebar-header">
      <div style={{marginBottom: '1rem'}}>
         <div style={{display: 'flex', gap: '8px', marginBottom: '8px'}}>
            <select 
                value={currentMapId || ''} 
                onChange={(e) => onMapChange(e.target.value)}
                style={{flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)'}}
            >
                {maps.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <button onClick={onCreateMap} className="map-btn-secondary" style={{width: 'auto', padding: '8px'}}>
                <BiPlus size={18} />
            </button>
         </div>
         <div style={{display: 'flex', gap: '8px'}}>
            <input 
                type="text" 
                value={mapName} 
                onChange={(e) => onMapNameChange(e.target.value)}
                style={{flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)'}}
            />
            <button onClick={onSaveMap} className="map-btn-primary" style={{width: 'auto', padding: '8px'}} title="Zapisz">
                <BiSave size={18} />
            </button>
            <button onClick={onDeleteMap} className="map-btn-secondary" style={{width: 'auto', padding: '8px', color: 'var(--danger)'}} title="Usuń">
                <BiTrash size={18} />
            </button>
         </div>
      </div>
      <div style={{height: '1px', background: 'var(--border-color)', margin: '1rem 0'}}></div>
    </div>
  );
};

export default MapSidebarHeader;
