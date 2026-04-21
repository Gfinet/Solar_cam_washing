import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import './index.css'
import ProtectedRoute from './ProtectedRoute.jsx';
import Layout from './models/layout.jsx';
import Login from './models/login.jsx'
import Dashboard from './models/dashboard.jsx';
import Table from './models/table.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/param" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/table" element={<ProtectedRoute><Table /></ProtectedRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>,
)
