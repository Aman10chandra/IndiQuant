import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import StockDetail from './pages/StockDetail';
import StocksList from './pages/StocksList';
import DigestPage from './pages/Digest';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/stocks" element={<StocksList />} />
        <Route path="/stock" element={<Navigate to="/stocks" replace />} />
        <Route path="/stock/:ticker" element={<StockDetail />} />
        <Route path="/digest" element={<DigestPage />} />
      </Routes>
    </Router>
  );
}
