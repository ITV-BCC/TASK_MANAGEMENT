import Sidebar from '../components/Sidebar';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';

export default function Dashboard() {
  // Protect the route - if not logged in, send them back to login
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/login';
    return null;
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto pt-16 lg:pt-0">
        <Outlet />
      </main>
    </div>
  );
}
