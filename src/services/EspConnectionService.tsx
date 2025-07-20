import api from "../axios";
import authHeader from "./AuthService";

export interface WifiNetwork {
  ssid: string;
  rssi: number;
  encryption: string;
}

export interface BluetoothConnection {
  notifyCharacteristic: BluetoothRemoteGATTCharacteristic;
  writeCharacteristic: BluetoothRemoteGATTCharacteristic;
  device: BluetoothDevice;
}

export const connectToESP = async (
  onNetworksReceived: (networks: WifiNetwork[]) => void,
  onWifiConnected: () => void,
  onError: (message: string) => void
): Promise<BluetoothConnection | null> => {
  try {
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ namePrefix: "ESP32" }],
      optionalServices: ["6e400001-b5a3-f393-e0a9-e50e24dcca9e"]
    });

    if (!device.gatt) {
      onError("Urządzenie nie obsługuje GATT");
      return null;
    }

    const server = await device.gatt.connect();
    const service = await server.getPrimaryService("6e400001-b5a3-f393-e0a9-e50e24dcca9e");

    const notifyChar = await service.getCharacteristic("6e400003-b5a3-f393-e0a9-e50e24dcca9e");
    const writeChar = await service.getCharacteristic("6e400002-b5a3-f393-e0a9-e50e24dcca9e");

    await notifyChar.startNotifications();

    notifyChar.addEventListener("characteristicvaluechanged", async (event: Event) => {
      const target = event.target as BluetoothRemoteGATTCharacteristic;
      const value = target?.value;
      if (!value) return;

      const raw = new TextDecoder().decode(value);

      try {
        const json = JSON.parse(raw);

        if (Array.isArray(json.networks)) {
          onNetworksReceived(json.networks);
        } else if (json.wifi === "connected") {
          console.log("✅ ESP połączone z Wi-Fi!");
          onWifiConnected();

          const deviceTokenResponse = await pairDeviceWithApi(device.id);
          
          const deviceToken = deviceTokenResponse?.data;
          if (!deviceToken) {
            onError("Nie udało się pobrać tokena z API");
            return;
          }

          // 🧩 podziel token i wyślij w kawałkach
          await sendTokenInChunks(writeChar, deviceToken);
          console.log("🔐 Token API wysłany do ESP");
        } else {
          onError("Nieznany format wiadomości z ESP");
        }

      } catch (err) {
        console.error("Błąd parsowania JSON:", err);
        onError("Błąd parsowania danych z ESP");
      }
    });

    return {
      notifyCharacteristic: notifyChar,
      writeCharacteristic: writeChar,
      device
    };
  } catch (error) {
    console.error("Błąd podczas połączenia:", error);
    onError("Błąd podczas łączenia z ESP32");
    return null;
  }
};
const sendTokenInChunks = async (
  writeCharacteristic: BluetoothRemoteGATTCharacteristic,
  token: string
) => {
  const encoder = new TextEncoder();
  const chunkSize = 180;

  await writeCharacteristic.writeValue(encoder.encode("__BEGIN__"));
  await delay(30);

  for (let i = 0; i < token.length; i += chunkSize) {
    const chunk = token.slice(i, i + chunkSize);
    await writeCharacteristic.writeValue(encoder.encode(chunk));
    await delay(30);
  }

 
  await writeCharacteristic.writeValue(encoder.encode("__END__"));
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
export const pairDeviceWithApi = (deviceId: string) => {
  return api.post("devices/pair", {
   deviceId
  });
};
export const getUserHasDevices = async (userId: string): Promise<boolean> => {
  try {
    const response = await api.get("/hasDevice", {
      params: { id: userId },
      headers: authHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Błąd podczas pobierania informacji o urządzeniach:", error);
    throw error;
  }
};
export const sendWifiCredentials = async (
  writeCharacteristic: BluetoothRemoteGATTCharacteristic,
  ssid: string,
  password: string
): Promise<void> => {
  const payload = JSON.stringify({ ssid, password });
  const encoded = new TextEncoder().encode(payload);
  await writeCharacteristic.writeValue(encoded);
};
