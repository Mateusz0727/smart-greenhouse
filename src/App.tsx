import React from 'react';

import Login from './module/Login';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Dashboard from './module/Dashboard';
import ProtectedRoute from './component/ProtectedRouteProps';

const App: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Login />} />
       <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  </BrowserRouter>
);
export default App;


