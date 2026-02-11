import { useEffect, useState } from "react";
import { getUserHasDevices } from "../services/EspConnectionService";
import EspConnection from "../component/EspConnection";
import SmartGreenhouseControl from "./ControlPanel";

const EspStatus = ({ userId }: { userId: string }) => {
  const [hasDevice, setHasDevice] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getUserHasDevices(userId);
        setHasDevice(result);
      } catch (err) {
        setHasDevice(false);
      }
    };
    fetchData();
  }, [userId]);

  return (
    <div>
      {hasDevice === null && <p>Ładowanie...</p>}
      {hasDevice === true && <SmartGreenhouseControl userId={userId}/>}
      {hasDevice === false && <p><EspConnection/></p>}
    </div>
  );
};

export default EspStatus;