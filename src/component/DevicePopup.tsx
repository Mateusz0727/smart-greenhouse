import React from 'react';
import { BiX, BiTrash, BiPowerOff, BiWater, BiSun, BiLeaf } from 'react-icons/bi';
import { CiTempHigh } from 'react-icons/ci';
import { MdOutlineSensors } from 'react-icons/md';
import { Device, RelayState } from '../services/ConstrolService';

interface DevicePopupProps {
  device: Device;
  onClose: () => void;
  onRemove: () => void;
  onOpenControlPanel: () => void;
  relayStates: RelayState[];
  loadingRelays: boolean;
  onToggleRelay: (relayName: string, currentState: boolean) => void;
}

const getSensorIcon = (type: string, size = 16) => {
  const t = type.toLowerCase();
  if (t.includes('temp')) return <CiTempHigh size={size} className="text-red-500" />;
  if (t.includes('hum') || t.includes('wilg')) return <BiWater size={size} className="text-blue-500" />;
  if (t.includes('light') || t.includes('świat')) return <BiSun size={size} className="text-yellow-500" />;
  if (t.includes('soil') || t.includes('gleb')) return <BiLeaf size={size} className="text-emerald-500" />;
  return <MdOutlineSensors size={size} className="text-gray-500" />;
};

const DevicePopup: React.FC<DevicePopupProps> = ({
  device,
  onClose,
  onRemove,
  onOpenControlPanel,
  relayStates,
  loadingRelays,
  onToggleRelay
}) => {
  return (
    <div className="device-popup">
        <div className="popup-header">
            <h3>{device.name}</h3>
            <button className="popup-close" onClick={onClose}>
                <BiX size={20} />
            </button>
        </div>
        <div className="popup-content">
            <div style={{marginBottom: '1rem', display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
                {device.sensors?.map(s => (
                    <div key={s} className="sensor-badge" style={{background: 'var(--bg-color)'}}>
                        {getSensorIcon(s, 14)} {s}
                    </div>
                ))}
            </div>

            <h4 style={{fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: '0.5rem'}}>Sterowanie</h4>
            
            {loadingRelays ? (
                <div className="spinner" style={{margin: '1rem auto'}}></div>
            ) : (
                <div className="relay-list">
                    {relayStates.length > 0 ? relayStates.map((relay, idx) => (
                        <div key={idx} className="relay-item">
                            <div className="relay-info">
                                <BiPowerOff size={16} />
                                {relay.relay}
                            </div>
                            <div 
                                className={`toggle-switch ${relay.state ? 'active' : ''}`}
                                onClick={() => onToggleRelay(relay.relay, relay.state)}
                            >
                                <div className="toggle-thumb"></div>
                            </div>
                        </div>
                    )) : (
                        <p style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>Brak dostępnych przekaźników.</p>
                    )}
                </div>
            )}

            <div style={{marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '8px'}}>
                <button 
                    className="map-btn-primary" 
                    onClick={onOpenControlPanel}
                >
                    Panel Sterowania
                </button>
                <button 
                    className="map-btn-secondary" 
                    style={{color: 'var(--danger)', borderColor: 'var(--danger)'}}
                    onClick={onRemove}
                >
                    <BiTrash size={18} />
                </button>
            </div>
        </div>
    </div>
  );
};

export default DevicePopup;
