import React, { useEffect, useState } from "react";
import { getUserHasDevices } from "../services/EspConnectionService";
import EspConnection from "../component/EspConnection";
import ControlPanel from "./ControlPanel";

const EspStatus = ({ userId }: { userId: string }) => {
  const [hasDevice, setHasDevice] = useState<boolean | null>(null);

  useEffect(() => {
    const checkDevices = async () => {
      try {
        const result = await getUserHasDevices(userId);
        setHasDevice(result);
      } catch (err) {
        setHasDevice(false);
      }
    };
    checkDevices();
  }, [userId]);

  return (
    <div className="animate-in fade-in duration-500 w-full">
      {hasDevice === null && (
        <div className="flex flex-col items-center justify-center h-64">
            <div className="spinner" style={{width: '40px', height: '40px', borderColor: '#e2e8f0', borderLeftColor: '#10b981', borderWidth: '4px'}}></div>
            <p className="text-gray-500 mt-4">Sprawdzanie urządzeń...</p>
        </div>
      )}
      
      {hasDevice === true && (
        <ControlPanel 
            userId={userId} 
            onAddDevice={() => setHasDevice(false)} 
        />
      )}
      
      {hasDevice === false && (
        <EspConnection 
            userId={userId} 
            onComplete={() => setHasDevice(true)} 
        />
      )}
    </div>
  );
};

export default EspStatus;