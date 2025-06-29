import React, { useState } from "react";
import "../styles/Bluetooth.css";
import { GrSecure } from "react-icons/gr";
interface WifiNetwork {
  ssid: string;
  rssi: number;
  encryption: string;
}

const BluetoothESP: React.FC = () => {
  const [networks, setNetworks] = useState<WifiNetwork[]>([]);
  const [message, setMessage] = useState("");
  const [characteristicNotify, setCharacteristicNotify] = useState<BluetoothRemoteGATTCharacteristic | null>(null);
  const [characteristicWrite, setCharacteristicWrite] = useState<BluetoothRemoteGATTCharacteristic | null>(null);

  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null);
  const [password, setPassword] = useState("");

  const connectToESP = async () => {
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: "ESP32" }],
        optionalServices: ["6e400001-b5a3-f393-e0a9-e50e24dcca9e"]
      });

      if (!device.gatt) {
        setMessage("Urządzenie nie obsługuje GATT");
        return;
      }

      const server = await device.gatt.connect();
      const service = await server.getPrimaryService("6e400001-b5a3-f393-e0a9-e50e24dcca9e");

      const notifyChar = await service.getCharacteristic("6e400003-b5a3-f393-e0a9-e50e24dcca9e");
      await notifyChar.startNotifications();
      notifyChar.addEventListener("characteristicvaluechanged", (event: Event) => {
        const target = event.target as BluetoothRemoteGATTCharacteristic | null;
        if (!target) return;
        const value = target.value;
        if (!value) return;

        const raw = new TextDecoder().decode(value);

        try {
          const json = JSON.parse(raw);
          if (json.networks && Array.isArray(json.networks)) {
            setNetworks(json.networks);
          } else {
            setMessage("Nieprawidłowy format danych JSON");
          }
        } catch (e) {
          setMessage("Błąd parsowania JSON");
        }
      });

      const writeChar = await service.getCharacteristic("6e400002-b5a3-f393-e0a9-e50e24dcca9e");
      setCharacteristicWrite(writeChar);

      setCharacteristicNotify(notifyChar);
    } catch (error) {
      console.error("Błąd podczas połączenia:", error);
     
    }
  };

  const sendPassword = async () => {
    if (!characteristicWrite) {
      setMessage("Brak charakterystyki do zapisu");
      return;
    }
    if (!selectedNetwork) {
      setMessage("Wybierz sieć Wi-Fi");
      return;
    }

    const data = JSON.stringify({ ssid: selectedNetwork, password: password });
    const encoder = new TextEncoder();
    const encoded = encoder.encode(data);

    try {
      await characteristicWrite.writeValue(encoded);
      setMessage(`Wysłano dane do ESP32 dla sieci "${selectedNetwork}"`);
      setPassword("");
    } catch (error) {
      console.error("Błąd wysyłania hasła:", error);
      setMessage("Błąd wysyłania hasła");
    }
  };

  return (
    <div className="bluetooth-esp-container">
      {networks.length <=0 && (
        <div>
      <h1>Połącz z SmartGreenhouse</h1>
      <button onClick={connectToESP} className="connect-button">
        Połącz
      </button></div>)}
      <p className="message">{message}</p>

      {networks.length > 0 && (
        <table className="wifi-table">
          <thead>
            <tr>
              <th>SSID</th>
              
              <th>Wybierz</th>
            </tr>
          </thead>
          <tbody>
            {networks.map((net, idx) => (
              <tr key={idx}>
                <td>{net.encryption === "secured" ? <GrSecure /> : ""} {net.ssid}</td>
                <td>
                  <button
                    className="select-button"
                    onClick={() => setSelectedNetwork(net.ssid)}
                  >
                    Wybierz
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedNetwork && (
        <div className="password-section">
          <h2>Sieć: {selectedNetwork}</h2>
          <input
            type="password"
            placeholder="Wpisz hasło"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={sendPassword} className="send-button">
            Wyślij hasło do ESP32
          </button>
        </div>
      )}
    </div>
  );
};

export default BluetoothESP;
