import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/AuthService';
import { User } from '../types';
import '../styles/header.css';

interface HeaderProps {
    user: User;
}

export default function Header({ user }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
        await logout();
    } catch (error) {
        console.error("Logout error", error);
    } finally {
        localStorage.removeItem("accessToken");
        navigate("/");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="header-container">
      <div className="header-left">
        <h2>Panel Sterowania</h2>
        <p>Witaj, {user.firstName || 'Użytkowniku'}</p>
      </div>

      <div className="header-right" ref={dropdownRef}>
        <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="user-btn"
        >
            <div className="user-info">
                <p className="user-email">{user.email || 'user@example.com'}</p>
                <p className="user-role">{user.role || 'Admin'}</p>
            </div>
            <div className="user-avatar">
               <img src="https://picsum.photos/200" alt="Avatar" />
            </div>
        </button>

        {menuOpen && (
            <div className="dropdown-menu">
                <button className="dropdown-item">
                    Mój Profil
                </button>
                <button className="dropdown-item">
                    Ustawienia
                </button>
                <div className="dropdown-divider"></div>
                <button 
                    onClick={handleLogout}
                    className="dropdown-item logout"
                >
                    Wyloguj
                </button>
            </div>
        )}
      </div>
    </header>
  );
}