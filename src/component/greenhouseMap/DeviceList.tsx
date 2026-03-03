import React from 'react';
import { BiChip, BiCheck, BiMapAlt } from 'react-icons/bi';
import { CiTempHigh } from 'react-icons/ci';
import { MdOutlineSensors } from 'react-icons/md';
import { BiWater, BiSun, BiLeaf } from 'react-icons/bi';
import { Device, PlacedDevice } from '../../services/ConstrolService';

interface DeviceListProps {
  loading: boolean;
  availableDevices: Device[];
  placedDevices: PlacedDevice[];
  isDeviceUsedGlobally: (deviceId: string) => boolean;
  onPlaceDevice: (device: Device) => void;
}

const getSensorIcon = (type: string, size = 16) => {
  const t = type.toLowerCase();
  if (t.includes('temp')) return <CiTempHigh size={size} className="text-red-500" />;
  if (t.includes('hum') || t.includes('wilg')) return <BiWater size={size} className="text-blue-500" />;
  if (t.includes('light') || t.includes('świat')) return <BiSun size={size} className="text-yellow-500" />;
  if (t.includes('soil') || t.includes('gleb')) return <BiLeaf size={size} className="text-emerald-500" />;
  return <MdOutlineSensors size={size} className="text-gray-500" />;
};

const DeviceList: React.FC<DeviceListProps> = ({
  loading,
  availableDevices,
  placedDevices,
  isDeviceUsedGlobally,
  onPlaceDevice
}) => {
  return (
    <div className="map-sidebar-content">
      <h2 style={{marginBottom: '1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-light)', textTransform: 'uppercase'}}>
        Dostępne Urządzenia
      </h2>
      
      {loading ? (
         <div className="spinner" style={{margin: '2rem auto'}}></div>
      ) : (
        <div className="device-list">
          {availableDevices.map(device => {
             const isPlacedInCurrent = placedDevices.some(pd => pd.deviceId === device.deviceId);
             const isPlacedGlobally = isDeviceUsedGlobally(device.deviceId);
             
             const status = isPlacedInCurrent ? 'placed' : (isPlacedGlobally ? 'unavailable' : 'available');

             return (
              <div 
                key={device.deviceId} 
                className={`map-device-item ${status}`}
                onClick={() => status === 'available' && onPlaceDevice(device)}
                style={{ 
                    cursor: status === 'available' ? 'pointer' : 'not-allowed', 
                    opacity: status === 'available' ? 1 : 0.5 
                }}
              >
                <div className="map-device-header">
                  <div className="map-device-icon">
                    <BiChip size={20} />
                  </div>
                  <div className="map-device-info">
                    <h3>{device.name}</h3>
                    <p>ID: {device.deviceId.substring(0, 8)}...</p>
                  </div>
                  {status === 'placed' && <BiCheck className="text-green-500 ml-auto" size={20} />}
                  {status === 'unavailable' && <BiMapAlt className="text-orange-500 ml-auto" size={20} title="Użyte na innej mapie" />}
                </div>
                
                <div className="map-device-sensors">
                  {device.sensors?.map(sensor => (
                    <div key={sensor} className="sensor-badge">
                      {getSensorIcon(sensor, 12)}
                      <span>{sensor}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {availableDevices.length === 0 && (
              <p style={{textAlign: 'center', color: 'var(--text-light)', fontSize: '0.875rem'}}>Brak urządzeń do rozmieszczenia.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default DeviceList;
