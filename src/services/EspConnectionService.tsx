import { WifiNetwork } from '../types';
import api from "../axios";

export { type WifiNetwork };

// UUIDs zgodne z kodem ESP32 (Nordic UART Service)
const SERVICE_UUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
const CHARACTERISTIC_UUID_RX = "6e400002-b5a3-f393-e0a9-e50e24dcca9e"; // Write (Telefon -> ESP)
const CHARACTERISTIC_UUID_TX = "6e400003-b5a3-f393-e0a9-e50e24dcca9e"; // Notify (ESP -> Telefon)

export const connectToESP = async (
  userId: string,
  setNetworks: (networks: WifiNetwork[]) => void,
  onSuccess: () => void,
  setMessage: (msg: string) => void
): Promise<{ writeCharacteristic: any } | null> => {
  const nav = navigator as any;
  if (!nav.bluetooth) {
    setMessage("Twoja przeglądarka nie obsługuje Web Bluetooth.");
    return null;
  }

  try {
    setMessage("Szukanie urządzenia ESP32...");
    const device = await nav.bluetooth.requestDevice({
      filters: [{ namePrefix: "ESP32" }],
      optionalServices: [SERVICE_UUID],
    });

    if (!device.gatt) {
        throw new Error("Urządzenie nie obsługuje GATT");
    }

    setMessage("Łączenie z GATT...");
    const server = await device.gatt.connect();

    setMessage("Pobieranie usług...");
    const service = await server.getPrimaryService(SERVICE_UUID);

    setMessage("Konfiguracja kanałów komunikacji...");
    const rxCharacteristic = await service.getCharacteristic(CHARACTERISTIC_UUID_RX);
    const txCharacteristic = await service.getCharacteristic(CHARACTERISTIC_UUID_TX);

    // Obsługa powiadomień
    txCharacteristic.addEventListener(
      "characteristicvaluechanged",
      async (event: any) => {
        const value = event.target.value;
        const decoder = new TextDecoder("utf-8");
        const jsonString = decoder.decode(value);

        try {
          // Logowanie surowych danych dla debugowania
          console.log("ESP RX:", jsonString);
          const data = JSON.parse(jsonString);
          
          // 1. Odbiór listy sieci
          if (data.networks && Array.isArray(data.networks)) {
             setNetworks(data.networks);
             setMessage("Znaleziono sieci Wi-Fi. Wybierz jedną z listy.");
          } 
          // 2. Potwierdzenie połączenia z WiFi -> Start procedury Tokenu
          else if (data.wifi === "connected") {
             setMessage("Wi-Fi połączone! Pobieranie tokenu...");
             
             try {
                // Generujemy token dla urządzenia w backendzie
                const token = await pairDeviceWithApi(device.id, userId); 
                console.log("Token z API:", token);
                if (token) {
                   setMessage("Wysyłanie tokenu autoryzacyjnego...");
                   await sendTokenInChunks(rxCharacteristic, token);
                   setMessage("Token wysłany. Czekam na potwierdzenie urządzenia...");
                   // WAŻNE: Tu jeszcze nie wołamy onSuccess! Czekamy na 'jwt_received'
                } else {
                   setMessage("Błąd: Nie udało się uzyskać tokenu z API.");
                }
             } catch (err) {
                console.error("Pairing error:", err);
                setMessage("Błąd parowania urządzenia z kontem.");
             }
          } 
          // 3. Odbiór potwierdzenia odebrania tokenu (Nowa logika)
          else if (data.status === "jwt_received" || data.status === "config_complete") {
             console.log("Potwierdzenie JWT od ESP otrzymane.");
             setMessage("Urządzenie skonfigurowane pomyślnie!");
             onSuccess(); // Dopiero teraz przełączamy widok
          }
          // 4. Obsługa błędów
          else if (data.status === "error") {
             setMessage("Błąd połączenia ESP32 z Wi-Fi. Sprawdź hasło.");
          }
        } catch (e) {
          // Ignorujemy błędy parsowania JSON (mogą przychodzić fragmenty logów)
          console.log("Dane nie są JSONem:", jsonString);
        }
      }
    );

    await txCharacteristic.startNotifications();
    setMessage("Połączono! Czekam na listę sieci...");

    return { writeCharacteristic: rxCharacteristic };

  } catch (error: any) {
    console.error("Błąd Bluetooth:", error);
    setMessage(`Błąd: ${error.message || "Nie udało się połączyć"}`);
    return null;
  }
};

export const sendWifiCredentials = async (
    characteristic: any, 
    ssid: string, 
    pass: string
) => {
  const encoder = new TextEncoder();
  const data = JSON.stringify({ ssid, password: pass });
  await characteristic.writeValue(encoder.encode(data));
};

const pairDeviceWithApi = async (bluetoothDeviceId: string, userId: string): Promise<string | null> => {
  try {
     const response = await api.post("/devices/pair", {
        deviceId: bluetoothDeviceId,
        userId: userId,
        type: "ESP32_GROW_BOX"
     });
     return  response.data||response;
  } catch (error) {
     console.error("API Pairing Error", error);
     return null;
  }
};

const sendTokenInChunks = async (
  characteristic: any,
  token: string
) => {
  const encoder = new TextEncoder();
  const chunkSize = 20; // Bezpieczny rozmiar MTU

  await characteristic.writeValue(encoder.encode("__BEGIN__"));
  await delay(50);

  for (let i = 0; i < token.length; i += chunkSize) {
    const chunk = token.slice(i, i + chunkSize);
    await characteristic.writeValue(encoder.encode(chunk));
    await delay(50); 
  }

  await characteristic.writeValue(encoder.encode("__END__"));
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getUserHasDevices = async (userId: string): Promise<boolean> => {
    try {
        const response = await api.get(`/hasDevice?id=${userId}`);
        return response.data === true;
    } catch (error) {
        return false;
    }
};