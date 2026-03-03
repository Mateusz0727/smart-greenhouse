import React, { useEffect, useState } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import { CiTimer, CiTempHigh, CiSettings, CiCloudOn, CiMap } from "react-icons/ci";
import { BiHomeAlt } from "react-icons/bi";
import { jwtDecode } from "jwt-decode";
import Header from "../component/Header";
import EspStatus from "./EspStatus";
import TemperatureTrends from "../component/TemperatureTrends";
import GreenhouseMap from "./GreenhouseMap";
import { User, TemperatureData } from "../types";
import "../styles/dashboard.css";

function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [tempData, setTempData] = useState<TemperatureData[]>([]);
  const location = useLocation();

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      try {
        const decoded: any = jwtDecode(token);
        const userId = decoded.sub || decoded.id; 
        
        // Set User from Token
        setUser({ 
            id: userId, 
            email: decoded.email || "user@example.com", 
            firstName: decoded.firstName || "Użytkownik", 
            lastName: decoded.lastName || "", 
            role: decoded.role || "USER" 
        });

        // Fetch Real Temperature Data
      //  const stats = await getTemperatureStats(userId);
       setTempData([
  {
    "deviceId": "device-123",
    "date": "2023-10-25",
    "dayAvgTemperature": 24.5,
    "nightAvgTemperature": 18.2
  },
  {
    "deviceId": "device-123",
    "date": "2023-10-26",
    "dayAvgTemperature": 23.8,
    "nightAvgTemperature": 17.9
  },
  {
    "deviceId": "device-123",
    "date": "2023-10-27",
    "dayAvgTemperature": 25.1,
    "nightAvgTemperature": 19.0
  },
  {
    "deviceId": "device-123",
    "date": "2023-10-28",
    "dayAvgTemperature": 24.2,
    "nightAvgTemperature": 18.5
  },
  {
    "deviceId": "device-123",
    "date": "2023-10-29",
    "dayAvgTemperature": 23.5,
    "nightAvgTemperature": 17.6
  },
  {
    "deviceId": "device-123",
    "date": "2023-10-30",
    "dayAvgTemperature": 22.9,
    "nightAvgTemperature": 17.1
  },
  {
    "deviceId": "device-123",
    "date": "2023-10-31",
    "dayAvgTemperature": 23.1,
    "nightAvgTemperature": 16.8
  },
  {
    "deviceId": "device-123",
    "date": "2023-11-01",
    "dayAvgTemperature": 21.8,
    "nightAvgTemperature": 16.2
  },
  {
    "deviceId": "device-123",
    "date": "2023-11-02",
    "dayAvgTemperature": 22.0,
    "nightAvgTemperature": 16.5
  },
  {
    "deviceId": "device-123",
    "date": "2023-11-03",
    "dayAvgTemperature": 21.5,
    "nightAvgTemperature": 15.9
  },
  {
    "deviceId": "device-123",
    "date": "2023-11-04",
    "dayAvgTemperature": 20.8,
    "nightAvgTemperature": 15.1
  },
  {
    "deviceId": "device-123",
    "date": "2023-11-05",
    "dayAvgTemperature": 21.2,
    "nightAvgTemperature": 15.5
  },
  {
    "deviceId": "device-123",
    "date": "2023-11-06",
    "dayAvgTemperature": 20.5,
    "nightAvgTemperature": 14.8
  },
  {
    "deviceId": "device-123",
    "date": "2023-11-07",
    "dayAvgTemperature": 19.8,
    "nightAvgTemperature": 14.2
  },
  {
    "deviceId": "device-123",
    "date": "2023-11-08",
    "dayAvgTemperature": 20.1,
    "nightAvgTemperature": 14.5
  },
  {
    "deviceId": "device-123",
    "date": "2023-11-09",
    "dayAvgTemperature": 19.5,
    "nightAvgTemperature": 13.9
  },
  {
    "deviceId": "device-123",
    "date": "2023-11-10",
    "dayAvgTemperature": 18.9,
    "nightAvgTemperature": 13.5
  },
  {
    "deviceId": "device-123",
    "date": "2023-11-11",
    "dayAvgTemperature": 19.2,
    "nightAvgTemperature": 14.0
  },
  {
    "deviceId": "device-123",
    "date": "2023-11-12",
    "dayAvgTemperature": 18.5,
    "nightAvgTemperature": 13.2
  },
  {
    "deviceId": "device-123",
    "date": "2023-11-13",
    "dayAvgTemperature": 17.8,
    "nightAvgTemperature": 12.8
  },
  {
    "deviceId": "device-123",
    "date": "2023-11-14",
    "dayAvgTemperature": 18.1,
    "nightAvgTemperature": 13.1
  },
  {
    "deviceId": "device-123",
    "date": "2023-11-15",
    "dayAvgTemperature": 17.5,
    "nightAvgTemperature": 12.5
  },
  {
    "deviceId": "device-123",
    "date": "2023-11-16",
    "dayAvgTemperature": 16.9,
    "nightAvgTemperature": 11.8
  },
  {
    "deviceId": "device-123",
    "date": "2023-11-17",
    "dayAvgTemperature": 17.2,
    "nightAvgTemperature": 12.1
  },
  {
    "deviceId": "device-123",
    "date": "2023-11-18",
    "dayAvgTemperature": 16.5,
    "nightAvgTemperature": 11.5
  },
  {
    "deviceId": "device-123",
    "date": "2023-11-19",
    "dayAvgTemperature": 15.8,
    "nightAvgTemperature": 10.9
  },
  {
    "deviceId": "device-123",
    "date": "2023-11-20",
    "dayAvgTemperature": 16.1,
    "nightAvgTemperature": 11.2
  },
  {
    "deviceId": "device-123",
    "date": "2023-11-21",
    "dayAvgTemperature": 15.5,
    "nightAvgTemperature": 10.5
  },
  {
    "deviceId": "device-123",
    "date": "2023-11-22",
    "dayAvgTemperature": 14.9,
    "nightAvgTemperature": 9.8
  },
  {
    "deviceId": "device-123",
    "date": "2023-11-23",
    "dayAvgTemperature": 15.2,
    "nightAvgTemperature": 10.1
  },
  {
    "deviceId": "device-123",
    "date": "2023-11-24",
    "dayAvgTemperature": 14.5,
    "nightAvgTemperature": 9.5
  },
  {
    "deviceId": "device-123",
    "date": "2023-11-25",
    "dayAvgTemperature": 13.8,
    "nightAvgTemperature": 8.9
  },
  {
    "deviceId": "device-123",
    "date": "2023-11-26",
    "dayAvgTemperature": 14.1,
    "nightAvgTemperature": 9.2
  },
  {
    "deviceId": "device-123",
    "date": "2023-11-27",
    "dayAvgTemperature": 13.5,
    "nightAvgTemperature": 8.5
  },
  {
    "deviceId": "device-123",
    "date": "2023-11-28",
    "dayAvgTemperature": 12.8,
    "nightAvgTemperature": 7.9
  }
]);

      } catch (error) {
        console.error("Błąd pobierania danych kokpitu:", error);
      }
    };
    fetchDashboardData();
  }, []);

  const NavItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => {
    const isActive = location.pathname === to || (to !== '/dashboard' && location.pathname.startsWith(to));
    return (
      <Link to={to} className={`nav-item ${isActive ? "active" : ""}`}>
        <Icon />
        <span>{label}</span>
      </Link>
    );
  };

  if (!user) {
    return <div className="flex h-screen items-center justify-center text-slate-400">Ładowanie panelu...</div>;
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-glow"></div>

        <div className="sidebar-brand">
          <div className="logo-icon">
            <CiCloudOn size={24} />
          </div>
          <div className="brand-text">
            <h1>Smart<span>Green</span></h1>
            <p>House Control</p>
          </div>
        </div>
        
        <nav className="sidebar-nav">
            <div className="menu-label">Menu</div>
            <NavItem to="/dashboard" icon={BiHomeAlt} label="Przegląd" />
            <NavItem to="/dashboard/trends" icon={CiTempHigh} label="Czujniki & Wykresy" />
            <NavItem to="/dashboard/connect" icon={CiSettings} label="Urządzenia & Sterowanie" />
            <NavItem to="/dashboard/map" icon={CiMap} label="Mapa Szklarni" />
            <NavItem to="/dashboard/history" icon={CiTimer} label="Historia Zdarzeń" />
        </nav>

        <div className="sidebar-footer">
            <div className="system-status">
                <div className="status-indicator">
                   <div className="ping-dot"></div>
                   <span className="status-text">System Online</span>
                </div>
                <p className="status-desc">
                  Wszystkie moduły ESP32 są połączone i przesyłają dane w czasie rzeczywistym.
                </p>
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-layout">
        <Header user={user} />
        
        <main className="content-scrollable">
           <Routes>
            <Route path="/" element={
                <div className="welcome-section fade-in">
                    <div className="welcome-header">
                        <h2>Dzień dobry, {user.firstName}! 👋</h2>
                        <p>Oto co dzieje się dzisiaj w Twojej szklarni.</p>
                    </div>
                    
                    <div className="dashboard-grid">
                        <div>
                           {tempData.length > 0 ? (
                             <TemperatureTrends data={tempData} />
                           ) : (
                             <div className="bg-white p-8 rounded-3xl border border-slate-100 text-center text-slate-400">
                                Brak danych z czujników do wyświetlenia.
                             </div>
                           )}
                        </div>
                        <div>
                           <div className="weather-widget">
                              <div className="weather-glow"></div>
                              
                              <div className="weather-header">
                                    <span className="location-badge">Warszawa</span>
                                    <CiCloudOn size={48} style={{opacity: 0.8}} />
                              </div>
                              
                              <div className="weather-main">
                                    <h3 className="temp-big">24°</h3>
                                    <p className="weather-desc">Słonecznie z lekkim zachmurzeniem</p>
                              </div>
                              
                              <div className="weather-details">
                                  <div className="weather-detail-item">
                                      <div className="weather-detail-label">Wiatr</div>
                                      <div className="weather-detail-value">12 km/h</div>
                                  </div>
                                  <div className="weather-detail-item">
                                      <div className="weather-detail-label">Wilg.</div>
                                      <div className="weather-detail-value">48%</div>
                                  </div>
                                  <div className="weather-detail-item">
                                      <div className="weather-detail-label">Opady</div>
                                      <div className="weather-detail-value">0 mm</div>
                                  </div>
                              </div>
                           </div>
                        </div>
                    </div>
                </div>
            } />
            <Route path="trends" element={
                <div style={{maxWidth: '1000px', margin: '0 auto'}}>
                    <TemperatureTrends data={tempData} />
                </div>
            } />
            <Route path="connect" element={<EspStatus userId={user.id} />} />
            <Route path="map" element={<GreenhouseMap userId={user.id} />} />
            <Route path="*" element={<div style={{textAlign: 'center', color: '#94a3b8', marginTop: '50px'}}>Sekcja w budowie</div>} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
