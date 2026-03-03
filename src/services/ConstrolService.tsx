import api from "../axios";
import { Device, TemperatureData, RelayState, MapSchema, Point, PlacedDevice } from '../types';

export { type Device, type TemperatureData, type RelayState, type MapSchema, type Point, type PlacedDevice };

export const getDevices = async (userId: string): Promise<Device[]> => {
  try {
    const response = await api.get(`/devices?id=${userId}`);
    if (Array.isArray(response.data)) {
        return response.data;
    }
    if (response.data && typeof response.data === 'object') {
        if (Array.isArray((response.data as any).devices)) {
            return (response.data as any).devices;
        }
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

export const getMaps = async (userId: string): Promise<MapSchema[]> => {
  try {
    const response = await api.get(`/maps?userId=${userId}`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Error fetching maps", error);
    return [];
  }
};

export const saveMap = async (userId: string, map: MapSchema): Promise<MapSchema | null> => {
  try {
    
    const response = await api.post(`/maps`, { ...map, userId });
    return response.data;
  } catch (error) {
    console.error("Error saving map", error);
    return null;
  }
};

export const deleteMap = async (mapId: string): Promise<boolean> => {
  try {
    await api.delete(`/maps/${mapId}`);
    return true;
  } catch (error) {
    console.error("Error deleting map", error);
    return false;
  }
};

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

export const getRelayStates = async (deviceId: string): Promise<{ states: RelayState[], online: boolean }> => {
  try {
    const response = await api.get(`/relay?id=${deviceId}`);
    
    let states: RelayState[] = [];
    let online = false;

    const data = response.data;

    if (data) {
        if (typeof data.online === 'boolean') {
            online = data.online;
        }

        if (Array.isArray(data.relayStates)) {
            states = data.relayStates;
        } else if (Array.isArray(data)) {
            states = data;
        } else if (typeof data === 'object') {
             
             states = Object.entries(data)
                .filter(([key]) => key !== 'online' && key !== 'relayStates')
                .map(([key, value]) => ({
                    relay: key,
                    state: value as boolean
                }));
        }
    }
    
    return { states, online };
  } catch (error) {
    console.error("Error fetching relay states", error);
    return { states: [], online: false };
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