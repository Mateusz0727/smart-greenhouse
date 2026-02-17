import api from "../axios";
import { Device, TemperatureData, RelayState } from '../types';

export { type Device, type TemperatureData };

// Zgodnie z OpenAPI: GET /devices?id=UUID
export const getDevices = async (userId: string): Promise<Device[]> => {
  try {
    const response = await api.get(`/devices?id=${userId}`);
    // Ensure we always return an array
    if (Array.isArray(response.data)) {
        return response.data;
    }
    // Handle case where API might wrap it or return a single object
    if (response.data && typeof response.data === 'object') {
        // If it's a wrapper like { devices: [...] }
        if (Array.isArray((response.data as any).devices)) {
            return (response.data as any).devices;
        }
        // If it's a single device object, wrap it
        if ((response.data as any).deviceId) {
            return [response.data];
        }
    }
    return [];
  } catch (error) {
    console.error("Error fetching devices", error);
    return [];
  }
};

// Zgodnie z OpenAPI: POST /relay
// Body: { deviceId, relay, state }
export const toggleRelayState = async (deviceId: string, relay: string, state: boolean): Promise<boolean> => {
  try {
    await api.post(`/relay`, {
      deviceId,
      relay,
      state
    });
    return true;
  } catch (error) {
    console.error("Error toggling relay", error);
    return false;
  }
};

// Zgodnie z OpenAPI: GET /relay?id=deviceId
export const getRelayStates = async (deviceId: string): Promise<RelayState[]> => {
  try {
    const response = await api.get(`/relay?id=${deviceId}`);
    
    // Check for { relayStates: [...] } wrapper
    if (response.data && Array.isArray(response.data.relayStates)) {
        return response.data.relayStates;
    }
    
    if (Array.isArray(response.data)) {
        return response.data;
    }
    
    if (response.data && typeof response.data === 'object') {
        return Object.entries(response.data).map(([key, value]) => ({
            relay: key,
            state: value as boolean
        }));
    }
    return [];
  } catch (error) {
    console.error("Error fetching relay states", error);
    return [];
  }
};

export const getTemperatureStats = async (userId: string): Promise<TemperatureData[]> => {
  try {
    const response = await api.get(`/v1/users/${userId}/temperature-stats`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Error fetching temperature stats", error);
    return [];
  }
};