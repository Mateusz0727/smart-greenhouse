import React, { useState, useEffect } from "react";
import "../styles/DevicesPanel.css";
import { Device, getDevices, getRelayState, toggleRelayState } from "../services/ConstrolService";

const LOCAL_STORAGE_JWT_KEY = "accessToken";



interface DecodedToken {
  device_id?: string;
}

function ToggleSwitch({
  label,
  enabled,
  onToggle,
}: {
  label: string;
  enabled: boolean;
  onToggle: () =>void;
   
  
}) {
  return (
    <div className="toggle-switch">
      <span>{label}</span>
      <button
        onClick={onToggle}
        className={enabled ? "btn-on" : "btn-off"}
      >
        {enabled ? "ON" : "OFF"}
      </button>
    </div>
  );
}

const ControlPanel = ({ userId }: { userId: string }) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [wateringOn, setWateringOn] = useState(true);
  const [ventilationOn, setVentilationOn] = useState(true);
  const [lightingOn, setLightingOn] = useState(false);
  const [wateringLevel, setWateringLevel] = useState(50);

  const [editNameForDevice, setEditNameForDevice] = useState<string | null>(null);
  const [editedName, setEditedName] = useState<string>("");
 useEffect(() => {
  const fetchDevices = async () => {
    const token = localStorage.getItem(LOCAL_STORAGE_JWT_KEY);
    if (!token) {
      setError("Brak tokena JWT w localStorage");
      return;
    }

    try {
      const devicesFromApi = await getDevices(userId);

      if (!Array.isArray(devicesFromApi)) {
        setError("Niepoprawny format danych z API");
        return;
      }

      setDevices(devicesFromApi);
      setSelectedDevice(devicesFromApi[0]);

      const relayStates = devicesFromApi[0]?.relayStates ?? [];
      relayStates.forEach((relay: any) => {
        if (relay.relay === "led") setWateringOn(relay.state);
        if (relay.relay === "fan") setVentilationOn(relay.state);
        if (relay.relay === "light") setLightingOn(relay.state);
      });
    } catch (err) {
      console.error(err);
      setError("Błąd pobierania urządzeń z API");
    }
  };

  fetchDevices();
}, [userId]);

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (devices.length === 0) {
    return <div className="no-devices">Brak urządzeń do wyświetlenia</div>;
  }

  return (
    <div className="devices-panel">
      <div className="devices-list">
        <h3>Urządzenia</h3>
            {devices.map((device) => (
            <div key={device.deviceId} className="device-item">
              {editNameForDevice === device.deviceId ? (
                <div className="device-edit">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                  />
                  <button
                    onClick={() => {
                      device.name = editedName; 
                      
                      setDevices(devices);
                      setEditNameForDevice(null);
                    }}
                  >
                    Save
                  </button>
                  <button className="cancel" onClick={() => setEditNameForDevice(null)}>Cancel</button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setSelectedDevice(device)}
                    className={
                      selectedDevice?.deviceId === device.deviceId
                        ? "device-btn selected"
                        : "device-btn"
                    }
                  >
                    <span className="device-name">{device.name}</span>
                    <span
                      className="edit-icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditNameForDevice(device.deviceId);
                        setEditedName(device.name);
                      }}
                    >
                      Edit
                    </span>
                  </button>
          </>
        )}
      </div>
    ))}
      </div>

      {/* Prawa kolumna - panel sterowania */}
     {selectedDevice ? (
  <div className="control-panel">
    <h3>Sterowanie - {selectedDevice.name}</h3>

    <ToggleSwitch
      label="Nawadnianie"
      enabled={wateringOn}
      onToggle={async () => {
        const success = await toggleRelayState(
          selectedDevice.deviceId,
          "led",
          !wateringOn
        );
        if (success) {
          setWateringOn(!wateringOn);
        } else {
          alert("Nie udało się zmienić stanu nawadniania.");
        }
      }}
    />
    <ToggleSwitch
       label="Wentylacja"
      enabled={ventilationOn}
      onToggle={async () => {
        const success = await toggleRelayState(
          selectedDevice.deviceId,
          "fan",
          !ventilationOn
        );
        if (success) {
          setVentilationOn(!ventilationOn);
        } else {
          alert("Nie udało się zmienić stanu nawadniania.");
        }
      }}
    />
   
    <ToggleSwitch
      label="Oświetlenie"
      enabled={lightingOn}
      onToggle={() => setLightingOn(!lightingOn)}
    />

    <label className="watering-label">Poziom nawadniania</label>
    <input
      type="range"
      min={0}
      max={100}
      value={wateringLevel}
      onChange={(e) => setWateringLevel(+e.target.value)}
      className="watering-range"
    />

    <button
      className="refresh-btn"
      onClick={() => alert("Odświeżanie danych...")}
    >
      Refresh 
    </button>
  </div>
) : (
  <div className="control-panel empty">
    <p>Wybierz urządzenie, aby wyświetlić panel sterowania.</p>
  </div>
)}
    </div>
  );
}
export default ControlPanel;