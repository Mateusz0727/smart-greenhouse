import React, { useState } from 'react'
import api from '../axios';

interface RelayToggleProps {
  deviceId: string;
  relayName: string;
}

interface RelayPayload {
  deviceId: string;
  relay: string;
  state: boolean;
}

const RelayToggle: React.FC<RelayToggleProps> = ({ deviceId, relayName }) => {
  const [relayState, setRelayState] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleToggle = async () => {
    const newState = !relayState;
    setRelayState(newState);
    setLoading(true);

    const payload: RelayPayload = {
      deviceId,
      relay: relayName,
      state: newState,
    };

    try {
      await api.post("/relay", { payload });
      console.log('✅ Wysłano do API:', payload);
    } catch (error) {
      console.error('❌ Błąd API:', error);
      setRelayState(!newState); // Przywróć poprzedni stan w razie błędu
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ margin: '1rem' }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <input
          type="checkbox"
          checked={relayState}
          onChange={handleToggle}
          disabled={loading}
        />
        {relayName} ({relayState ? 'Włączony' : 'Wyłączony'})
      </label>
    </div>
  );
};

export default RelayToggle;
