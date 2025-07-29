import api from "../axios";
export interface RelayState {
  relay: string;
  state: boolean;
  timestampUtc: string;
}

export interface Device {
  deviceId: string;
  name: string;
  userId: string; 
  relayStates: RelayState[];
}
export const toggleRelayState = async (
  deviceId: string,
  relay: string,
  state: boolean
): Promise<boolean> => {
  try {
    const response = await api.post("relay", {
      deviceId,
      relay,
      state,
    });
    return response.status === 200;
  } catch (error) {
    console.error("Błąd API toggleRelayState:", error);
    return false;
  }
};

export const getRelayState = async (
  deviceId: string) => {
  try {
    const response = await api.get(`relay?id=${deviceId}`);
    return response.data;
  } catch (error) {
    console.error("Błąd API getRelayState:", error);
    return false;
  }};

  export const getDevices = async (
  userId: string): Promise<Device[]> => {
  try {
    const response = await api.get(`/devices?id=${userId}`); 
    return response.data.devices; 
  } catch (error) {
    console.error("Błąd pobierania urządzeń:", error);
    return [];
  }
};
