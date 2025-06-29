import React, { useEffect, useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import BluetoothESP from "./Bluetooth";
import "../styles/Dashboard.css";
import { CiTimer, CiTempHigh } from "react-icons/ci";
import api from "../axios";
import {jwtDecode} from "jwt-decode";
import Header from "../component/Header";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

function Dashboard() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        const decoded: any = jwtDecode(token);
        const userId = decoded.sub;

        const response = await api.get(`/user?id=${userId}`);
        
        setUser(response.data);
      } catch (error) {
        console.error("Błąd pobierania danych użytkownika:", error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="dashboard">
      <div className="sidebar">
        <h1>SmartGreenhouse</h1>
        <nav className="menu">
          <Link className="button" to="/dashboard">Dashboard</Link>
          <Link className="button" to="/dashboard"><CiTempHigh />Czujniki</Link>
          <Link className="button" to="/dashboard/connect">Sterowanie</Link>
          <Link className="button" to="/dashboard"><CiTimer />Historia</Link>
          <Link className="button" to="/dashboard">Pogoda</Link>
        </nav>
      </div>

      <div className="main-content">
        <Header/>
        <div className="content">
          <Routes>
            <Route path="/" element={<p>Witaj w SmartGreenhouse!</p>} />
            <Route path="connect" element={<BluetoothESP />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
