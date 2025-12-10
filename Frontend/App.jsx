import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import EmotionScanPage from './pages/EmotionScanPage';
import SuggestionsPage from './pages/SuggestionsPage';
import ProgressPage from './pages/ProgressPage';
import AccountPage from './pages/AccountPage';
import AdminDashboard from './pages/AdminDashboard';
import RegisterPage from './pages/RegisterPage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<><HomePage /><Footer /></>} />
        <Route path="/login" element={<><LoginPage /><Footer /></>} />
        <Route path="/scan" element={<><EmotionScanPage /><Footer /></>} />
        <Route path="/suggestions" element={<><SuggestionsPage /><Footer /></>} />
        <Route path="/progress" element={<><ProgressPage /><Footer /></>} />
        <Route path="/account" element={<><AccountPage /><Footer /></>} />
        <Route path="/admin" element={<><AdminDashboard /><Footer /></>} />
        <Route path="/register" element={<><RegisterPage /><Footer /></>} />
      </Routes>
    </Router>
  );
}