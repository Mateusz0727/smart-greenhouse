import React, { useState, useEffect } from "react";
import { Device, getDevices, toggleRelayState, getRelayStates } from "../services/ConstrolService";
import { CiEdit, CiSaveDown2, CiCircleRemove, CiRouter } from "react-icons/ci";
import { BiWater, BiWind, BiBulb, BiHomeAlt, BiLeaf, BiSun } from "react-icons/bi";
import { MdOutlineSensors } from "react-icons/md";
import "../styles/control-panel.css";

// Modern Tile Component
function ControlTile({
  label,
  subLabel,
  enabled,
  onToggle,
  icon: Icon,
  colorClass = "bg-emerald-500"
}: {
  label: string;
  subLabel?: string;
  enabled: boolean;
  onToggle: () => void;
  icon: React.ElementType;
  colorClass?: string;
}) {
  return (
    <button
      onClick={onToggle}
      className={`control-tile ${enabled ? 'enabled' : ''} ${colorClass}`}
    >
      <div className="tile-deco-circle"></div>
      
      <div className="tile-header">
         <div className="tile-icon">
            <Icon size={24} />
         </div>
         <div className="status-indicator-dot"></div>
      </div>

      <div className="tile-content">
        <span className="tile-sublabel">{subLabel || (enabled ? "Włączone" : "Wyłączone")}</span>
        <span className="tile-label">{label}</span>
      </div>
    </button>
  );
}

interface ControlPanelProps {
    userId: string;
    onAddDevice?: () => void;
}

const ControlPanel = ({ userId, onAddDevice }: ControlPanelProps) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // States for controls
  const [wateringOn, setWateringOn] = useState(false);
  const [ventilationOn, setVentilationOn] = useState(false);
  const [lightingOn, setLightingOn] = useState(false);
  const [heatingOn, setHeatingOn] = useState(false);
  const [wateringLevel, setWateringLevel] = useState(50);

  const [editNameForDevice, setEditNameForDevice] = useState<string | null>(null);
  const [editedName, setEditedName] = useState<string>("");

  useEffect(() => {
    const fetchDevices = async () => {
        setLoading(true);
        try {
            const data = await getDevices(userId);
            const deviceList = Array.isArray(data) ? data : [];
            setDevices(deviceList);
            if (deviceList.length > 0) {
                setSelectedDevice(deviceList[0]);
            }
        } catch (err) {
            setError("Nie udało się pobrać urządzeń.");
            setDevices([]);
        } finally {
            setLoading(false);
        }
    };
    fetchDevices();
  }, [userId]);

  // Fetch Relay States periodically
  useEffect(() => {
    const fetchStates = async () => {
        if (!selectedDevice) return;
        try {
            const states = await getRelayStates(selectedDevice.deviceId);
            // Reset local states to ensure we don't show stale "on" states
            setWateringOn(false);
            setVentilationOn(false);
            setLightingOn(false);
            setHeatingOn(false);

            if (Array.isArray(states)) {
                states.forEach(r => {
                    const name = r.relay.toLowerCase();
                    // Mapping based on known API responses (fan, led) and standard names
                    if (name === "water" || name === "pump") setWateringOn(r.state);
                    if (name === "fan") setVentilationOn(r.state);
                    if (name === "light" || name === "led") setLightingOn(r.state);
                    if (name === "heat" || name === "heater") setHeatingOn(r.state);
                });
            }
        } catch (err) {
            console.error("Failed to fetch relay states", err);
        }
    };

    fetchStates();
    const interval = setInterval(fetchStates, 5000);
    return () => clearInterval(interval);
  }, [selectedDevice]);

  const handleToggle = async (relay: string, state: boolean, setLocalState: (s: boolean) => void) => {
    if (!selectedDevice) return;
    setLocalState(state);
    const success = await toggleRelayState(selectedDevice.deviceId, relay, state);
    if (!success) {
        setLocalState(!state);
        alert("Błąd sterowania urządzeniem");
    }
  };

  if (loading) return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px'}}>
        <div className="spinner" style={{width: '40px', height: '40px', borderColor: '#e2e8f0', borderLeftColor: '#10b981', borderWidth: '4px'}}></div>
        <p style={{color: '#94a3b8', marginTop: '1rem'}}>Łączenie z urządzeniami...</p>
    </div>
  );

  // Allow rendering if devices list is empty to show empty state with a button
  if (!loading && devices.length === 0) return (
    <div className="control-panel-container fade-in">
        <div className="empty-devices-card">
            <div className="empty-icon-wrapper">
                <CiRouter size={64} />
            </div>
            <h3>Brak skonfigurowanych urządzeń</h3>
            <p>Nie znaleziono żadnych sterowników przypisanych do Twojego konta. Rozpocznij od dodania pierwszego modułu ESP32.</p>
            {onAddDevice && (
                <button className="btn-add-primary" onClick={onAddDevice}>
                    <span style={{fontSize: '1.2rem', marginRight: '8px'}}>+</span>
                    Skonfiguruj nowe urządzenie
                </button>
            )}
        </div>
    </div>
  );

  return (
    <div className="control-panel-container fade-in">
      {/* Device List Column */}
      <div className="devices-column">
        <div className="section-header">
            <h3>Urządzenia</h3>
            <span className="device-count">{devices.length} aktywne</span>
        </div>
        
        <div className="device-list">
            {devices.map((device) => (
            <div 
                key={device.deviceId} 
                className={`device-item ${selectedDevice?.deviceId === device.deviceId ? 'active' : ''}`}
                onClick={() => setSelectedDevice(device)}
            >
              {selectedDevice?.deviceId === device.deviceId && (
                  <div className="device-item-bg"></div>
              )}

              {editNameForDevice === device.deviceId ? (
                <div className="device-edit-form" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    autoFocus
                  />
                  <button onClick={() => { device.name = editedName; setDevices([...devices]); setEditNameForDevice(null); }} style={{color: 'white', background: 'none', border: 'none', cursor: 'pointer'}}><CiSaveDown2 size={24}/></button>
                  <button onClick={() => setEditNameForDevice(null)} style={{color: 'white', opacity: 0.7, background: 'none', border: 'none', cursor: 'pointer'}}><CiCircleRemove size={24} /></button>
                </div>
              ) : (
                <div className="device-item-content">
                    <div className="device-info">
                        <div className="device-icon">
                             <CiRouter size={22} />
                        </div>
                        <div>
                            <span className="device-name">{device.name}</span>
                            <span className="device-id">ID: {device.deviceId}</span>
                        </div>
                    </div>
                    <button
                      className="edit-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditNameForDevice(device.deviceId);
                        setEditedName(device.name);
                      }}
                    >
                      <CiEdit size={22} />
                    </button>
                </div>
              )}
            </div>
            ))}
        </div>
        
        <button className="add-device-btn" onClick={onAddDevice}>
            <span style={{fontSize: '1.25rem', lineHeight: 1}}>+</span> Dodaj urządzenie
        </button>
      </div>

      {/* Control Panel Column */}
      <div className="controls-column">
        {selectedDevice ? (
          <div>
            {/* Header for selected device */}
            <div className="device-header-card">
                <div className="device-header-info">
                    <h2>{selectedDevice.name}</h2>
                    <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                         <span className="status-badge">
                            <span className="status-dot"></span> Online
                         </span>
                         <span style={{color: '#94a3b8', fontSize: '0.875rem'}}>Ostatnia akt: teraz</span>
                    </div>
                </div>
                <button className="diagnostic-btn">
                    <MdOutlineSensors size={18} />
                    Diagnostyka
                </button>
            </div>

            {/* Grid of Control Tiles */}
            <div className="controls-grid">
                <ControlTile
                    label="Nawadnianie"
                    subLabel={wateringOn ? "Aktywne" : "Wyłączone"}
                    enabled={wateringOn}
                    icon={BiWater}
                    colorClass="bg-blue-500"
                    onToggle={() => handleToggle("water", !wateringOn, setWateringOn)}
                />
                <ControlTile
                    label="Wentylacja"
                    subLabel={ventilationOn ? "Aktywna" : "Wyłączona"}
                    enabled={ventilationOn}
                    icon={BiWind}
                    colorClass="bg-teal-500"
                    onToggle={() => handleToggle("fan", !ventilationOn, setVentilationOn)}
                />
                <ControlTile
                    label="Oświetlenie"
                    subLabel={lightingOn ? "Włączone" : "Wyłączone"}
                    enabled={lightingOn}
                    icon={BiBulb}
                    colorClass="bg-amber-400"
                    onToggle={() => handleToggle("led", !lightingOn, setLightingOn)}
                />
                <ControlTile
                    label="Ogrzewanie"
                    subLabel={heatingOn ? "Włączone" : "Wyłączone"}
                    enabled={heatingOn}
                    icon={BiSun}
                    colorClass="bg-orange-500"
                    onToggle={() => handleToggle("heat", !heatingOn, setHeatingOn)}
                />
            </div>

            {/* Advanced Controls Section */}
            <div className="advanced-grid">
                {/* Watering Slider Card */}
                <div className="panel-card">
                    <div className="panel-card-header">
                        <div className="header-with-icon">
                            <div className="icon-box">
                                <BiWater size={24}/>
                            </div>
                            <span className="header-title">Poziom wilgotności</span>
                        </div>
                        <span className="header-value">{wateringLevel}%</span>
                    </div>
                    
                    <div className="slider-container">
                         <div 
                            className="slider-fill"
                            style={{width: `${wateringLevel}%`}}
                         ></div>
                         <input
                            type="range"
                            min={0}
                            max={100}
                            value={wateringLevel}
                            onChange={(e) => setWateringLevel(+e.target.value)}
                            className="range-input"
                        />
                         <div 
                            className="slider-thumb"
                            style={{left: `calc(${wateringLevel}% - 12px)`}}
                         ></div>
                    </div>
                    
                    <div className="slider-labels">
                        <span>Min</span>
                        <span>Optimum</span>
                        <span>Max</span>
                    </div>
                </div>

                {/* Auto Mode Card */}
                <div className="panel-card auto-mode-card">
                    <div>
                        <div className="header-with-icon" style={{marginBottom: '8px'}}>
                             <BiLeaf color="#10b981" size={24}/>
                             <h4 className="header-title">Tryb Automatyczny</h4>
                        </div>
                        <p className="auto-desc">System samodzielnie dobiera parametry nawadniania i oświetlenia na podstawie czujników.</p>
                    </div>
                    <div className="auto-actions">
                        <button className="btn-ai">Aktywuj AI</button>
                        <button className="btn-schedule">Harmonogram</button>
                    </div>
                </div>
            </div>

          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon-circle">
                <BiHomeAlt size={40} color="#cbd5e1"/>
            </div>
            <h3>Wybierz urządzenie</h3>
            <p>Kliknij na jedno z urządzeń po lewej stronie, aby zarządzać.</p>
          </div>
        )}
      </div>
    </div>
  );
}
export default ControlPanel;