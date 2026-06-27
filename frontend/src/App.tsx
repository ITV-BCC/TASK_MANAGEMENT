import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DashboardHome from './pages/dashboard/DashboardHome';
import TasksPage from './pages/dashboard/TasksPage';
import UsersPage from './pages/dashboard/UsersPage';
import VerticalsPage from './pages/dashboard/VerticalsPage';
import ProfilePage from './pages/dashboard/ProfilePage';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard/*" element={<Dashboard />}>
              <Route index element={<DashboardHome />} />
              <Route path="tasks" element={<TasksPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="verticals" element={<VerticalsPage />} />
              <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
