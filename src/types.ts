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
}

export interface Device {
  deviceId: string;
  name: string;
  relayStates?: RelayState[];
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
