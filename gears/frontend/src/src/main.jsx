import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import './index.css'

import ProtectedRoute from './models/ProtectedRoute.jsx';
import Layout from './models/layout.jsx';

import Login from './pages/login.jsx'
import Dashboard from './pages/dashboard.jsx';
import Table from './pages/table.jsx'
import Schedule from './pages/schedule.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/schedule" element={<ProtectedRoute><Schedule /></ProtectedRoute>} />
          <Route path="/table" element={<ProtectedRoute><Table /></ProtectedRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>,
)
