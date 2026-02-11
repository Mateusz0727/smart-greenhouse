import React, { useState } from "react";
import "../styles/Bluetooth.css";
import { GrSecure } from "react-icons/gr";
import {
  connectToESP,
  sendWifiCredentials,
  WifiNetwork,
} from "../services/EspConnectionService";

const EspConnection: React.FC = () => {
  const [networks, setNetworks] = useState<WifiNetwork[]>([]);
  const [message, setMessage] = useState("");
  const [characteristicNotify, setCharacteristicNotify] =
    useState<BluetoothRemoteGATTCharacteristic | null>(null);
  const [characteristicWrite, setCharacteristicWrite] =
    useState<BluetoothRemoteGATTCharacteristic | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [connected, setConnected] = useState(false);

  const handleWifiSuccess = () => {
    setMessage("✅ ESP32 połączone z Wi-Fi!");
    setNetworks([]);
    setConnected(true);
  };

  const connectToESPHandler = async () => {
    const connection = await connectToESP(
      setNetworks,
      handleWifiSuccess,
      setMessage
    );
    if (connection) {
      setCharacteristicNotify(connection.notifyCharacteristic);
      setCharacteristicWrite(connection.writeCharacteristic);
    }
  };

  const sendPassword = async () => {
    if (!characteristicWrite || !selectedNetwork) {
      setMessage("Brakuje danych do wysłania");
      return;
    }

    try {
      await sendWifiCredentials(characteristicWrite, selectedNetwork, password);
      setMessage(`📡 Wysłano dane do ESP32 dla sieci "${selectedNetwork}"`);
      setPassword("");
    } catch (error) {
      console.error("Błąd wysyłania hasła:", error);
      setMessage("❌ Błąd wysyłania hasła");
    }
  };

  return (
    <div className="bluetooth-esp-container">
      {networks.length <= 0 && !connected && (
        <div>
          <h1>Połącz z SmartGreenhouse</h1>
          <button onClick={connectToESPHandler} className="connect-button">
            Połącz
          </button>
        </div>
      )}

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
                <td>
                 {net.encryption === "secured" ? (React.createElement(GrSecure as any)) : ""} {net.ssid}
                </td>
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

export default EspConnection;
