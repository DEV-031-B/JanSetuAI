import React, { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Sidebar from './components/Sidebar'

// Pages
import Landing from './pages/Landing'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import CitizenPortal from './pages/CitizenPortal'
import AIClassifier from './pages/AIClassifier'
import Complaints from './pages/Complaints'
import Escalations from './pages/Escalations'
import ExecutiveBrief from './pages/ExecutiveBrief'
import Workers from './pages/Workers'
import SentimentEngine from './pages/SentimentEngine'

function PrivateRoute({ children, allowedRoles }) {
  const { user } = useAuth()
  const [isSidebarOpen, setSidebarOpen] = useState(false)

  if (!user) return <Navigate to="/login" />
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/dashboard" />
  return (
    <div className="flex bg-gray-50 min-h-screen overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header Banner */}
        <div className="md:hidden bg-navy text-white px-4 py-3 flex items-center justify-between shadow-md z-30">
          <div className="flex items-center gap-2">
            <span className="text-xl">🇮🇳</span>
            <div className="font-black text-lg tracking-tight">JanSetu AI</div>
          </div>
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 text-blue-200 bg-blue-800 rounded hover:bg-blue-700 transition shadow-inner"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>
        </div>

        {/* Scrollable Main Block */}
        <div className="flex-1 overflow-y-auto w-full relative">
          {children}
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      
      <Route path="/submit" element={
        <PrivateRoute><CitizenPortal /></PrivateRoute>
      } />
      
      <Route path="/dashboard" element={
        <PrivateRoute allowedRoles={['admin', 'leader']}><Dashboard /></PrivateRoute>
      } />
      
      <Route path="/complaints" element={
        <PrivateRoute allowedRoles={['admin', 'leader']}><Complaints /></PrivateRoute>
      } />
      
      <Route path="/classifier" element={
        <PrivateRoute><AIClassifier /></PrivateRoute>
      } />
      
      <Route path="/escalations" element={
        <PrivateRoute allowedRoles={['admin', 'leader']}><Escalations /></PrivateRoute>
      } />
      
      <Route path="/brief" element={
        <PrivateRoute allowedRoles={['leader']}><ExecutiveBrief /></PrivateRoute>
      } />
      
      <Route path="/workers" element={
        <PrivateRoute allowedRoles={['admin', 'leader']}><Workers /></PrivateRoute>
      } />
      
      <Route path="/sentiment" element={
        <PrivateRoute allowedRoles={['admin', 'leader']}><SentimentEngine /></PrivateRoute>
      } />
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App
