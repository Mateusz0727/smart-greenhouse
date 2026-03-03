export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface RelayState {
  relay: string;
  state: boolean;
  timestampUtc?: string;
}

export interface Device {
  deviceId: string;
  name: string;
  relayStates?: RelayState[];
  sensors?: string[]; // e.g. ['temperature', 'humidity']
}

export interface WifiNetwork {
  ssid: string;
  rssi: number;
  encryption: string;
}

export interface TemperatureData {
  deviceId: string;
  date: string;
  dayAvgTemperature: number | null;
  nightAvgTemperature: number | null;
}

export interface Point {
  x: number;
  y: number;
}

export interface PlacedDevice {
  id: string; 
  deviceId: string;
  x: number; 
  y: number; 
}

export interface MapSchema {
  id: string;
  name: string;
  shape: Point[];
  placedDevices: PlacedDevice[];
}