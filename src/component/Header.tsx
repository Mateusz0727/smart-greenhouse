import React, { useState, useEffect, useRef } from 'react';
import '../styles/header.css';
import { logout } from '../services/AuthService';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
   const navigate = useNavigate();
    const handleLogout = async () => {
    
    try {
        await logout();
        navigate("/");
    } catch (error) {
        alert("Błąd wylogowania.");
        console.error("Logout error", error);
    } 
    };
  const toggleMenu = (): void => {
    setMenuOpen(!menuOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="sg-header">
      <div className="sg-header-left">
        <h1>Dashboard</h1>
      
      </div>

      <div className="sg-header-right" ref={dropdownRef}>
        <img
          src="/avatar.png"
          alt="Avatar"
          className="sg-avatar"
          onClick={toggleMenu}
        />
        {menuOpen && (
            <div className="sg-dropdown">
                <button className="sg-dropdown-btn">Profil</button>
                <button className="sg-dropdown-btn">Ustawienia</button>
                <button className="sg-dropdown-btn" onClick={handleLogout}>Wyloguj</button>
            </div>
            )}
      </div>
    </header>
  );
}
