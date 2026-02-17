import React, { useState } from "react";
import { GrSecure } from "react-icons/gr";
import { WifiNetwork, connectToESP, sendWifiCredentials } from "../services/EspConnectionService";
import { CiWifiOn, CiBluetooth } from "react-icons/ci";
import "../styles/esp-connection.css";

interface EspConnectionProps {
    userId: string;
    onComplete?: () => void;
}

const EspConnection = ({ userId, onComplete }: EspConnectionProps) => {
  const [networks, setNetworks] = useState<WifiNetwork[]>([]);
  const [message, setMessage] = useState("");
  const [characteristicWrite, setCharacteristicWrite] = useState<any | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [connected, setConnected] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  // Ta funkcja zostanie wywołana przez Service DOPIERO gdy ESP potwierdzi "jwt_received"
  const handleConfigurationSuccess = () => {
    setMessage("✅ Urządzenie potwierdziło konfigurację!");
    setNetworks([]);
    setConnected(true);

    // Dajemy użytkownikowi chwilę na przeczytanie komunikatu sukcesu przed zmianą widoku
    setTimeout(() => {
        if (onComplete) {
            onComplete();
        } else {
            // Fallback reload jeśli onComplete nie podano
            window.location.reload(); 
        }
    }, 2000);
  };

  const connectToESPHandler = async () => {
    setIsScanning(true);
    setMessage("Inicjowanie Bluetooth...");

    try {
        const connection = await connectToESP(
            userId,
            setNetworks,
            handleConfigurationSuccess,
            setMessage
        );
        if (connection) {
            setCharacteristicWrite(connection.writeCharacteristic);
        }
    } catch (e) {
        console.error(e);
        setMessage("Nie udało się połączyć.");
    }
    setIsScanning(false);
  };

  const sendPassword = async () => {
    if(!selectedNetwork || !characteristicWrite) {
        setMessage("Błąd: Brak połączenia z urządzeniem.");
        return;
    }
    
    setMessage(`Wysyłanie danych Wi-Fi...`);
    try {
        await sendWifiCredentials(characteristicWrite, selectedNetwork, password);
        setMessage("Dane Wi-Fi wysłane. Czekam na połączenie ESP z siecią...");
    } catch (e) {
        console.error(e);
        setMessage("Błąd podczas wysyłania hasła.");
    }
  };

  return (
    <div className="setup-container">
      <div className="setup-card">
        <div className="setup-header">
            <div className="setup-header-bg"></div>
            <div className="setup-header-content">
                <div className="setup-icon-wrapper">
                    <CiBluetooth size={40} />
                </div>
                <h1>Dodaj nowe urządzenie</h1>
                <p>Upewnij się, że Twój moduł ESP32 jest w trybie parowania (dioda miga na niebiesko).</p>
            </div>
        </div>

        <div className="setup-body">
            {/* Initial State */}
            {networks.length <= 0 && !connected && (
                <div className="initial-view">
                <p className="status-message">{message || "Kliknij poniżej, aby rozpocząć skanowanie Bluetooth."}</p>
                <button 
                    onClick={connectToESPHandler} 
                    disabled={isScanning}
                    className="btn-start-scan"
                >
                    {isScanning ? (
                        <>
                             <div className="spinner" style={{width: '20px', height: '20px', borderColor: 'rgba(255,255,255,0.3)', borderLeftColor: '#fff', borderWidth: '3px'}}></div>
                             Szukanie urządzeń...
                        </>
                    ) : "Rozpocznij konfigurację"}
                </button>
                </div>
            )}
            
            {/* Success State */}
            {connected && (
                <div className="success-view">
                    <div className="success-icon">
                        <CiWifiOn size={48} />
                    </div>
                    <h2>Gotowe!</h2>
                    <p>Urządzenie zostało pomyślnie dodane. Przechodzenie do panelu...</p>
                </div>
            )}

            {/* Network List */}
            {networks.length > 0 && !connected && (
                <div className="networks-view">
                <h3 className="networks-header">Wybierz sieć Wi-Fi dla urządzenia</h3>
                <div className="networks-list">
                    {networks.map((net, idx) => (
                    <div 
                        key={idx} 
                        className={`network-item ${selectedNetwork === net.ssid ? 'selected' : ''}`}
                        onClick={() => setSelectedNetwork(net.ssid)}
                    >
                        <div className="net-info">
                            <div className="net-icon">
                                <CiWifiOn size={20} />
                            </div>
                            <div>
                                <span className="net-name">{net.ssid}</span>
                                {net.encryption === "secured" && <span className="net-security"><GrSecure size={10}/> Zabezpieczona</span>}
                            </div>
                        </div>
                        {selectedNetwork === net.ssid && (
                            <div className="check-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                            </div>
                        )}
                    </div>
                    ))}
                </div>
                </div>
            )}

            {/* Password Input */}
            {selectedNetwork && !connected && (
                <div className="password-form">
                <h2 className="pass-label">Uwierzytelnianie</h2>
                <div className="pass-input-group">
                    <input
                        type="password"
                        placeholder={`Hasło do "${selectedNetwork}"`}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pass-input"
                    />
                    <button 
                        onClick={sendPassword} 
                        className="btn-connect"
                    >
                        Połącz
                    </button>
                </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default EspConnection;