import React, { useEffect, useState } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import { CiTimer, CiTempHigh, CiSettings, CiCloudOn } from "react-icons/ci";
import { BiHomeAlt } from "react-icons/bi";
import { jwtDecode } from "jwt-decode";
import Header from "../component/Header";
import EspStatus from "./EspStatus";
import TemperatureTrends from "../component/TemperatureTrends";
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
       // setTempData(stats);

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
            <Route path="*" element={<div style={{textAlign: 'center', color: '#94a3b8', marginTop: '50px'}}>Sekcja w budowie</div>} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;