import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { BoothProvider } from './context/BoothContext';
import LandingPage from './pages/LandingPage';
import BoothPage from './pages/BoothPage';
import Navbar from './components/layout/Navbar';
import Preloader from './components/layout/Preloader';

export default function App() {
  return (
    <ThemeProvider>
      <BoothProvider>
        <BrowserRouter>
          <Preloader />
          <div className="noise">
            <Navbar />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/booth" element={<BoothPage />} />
            </Routes>
          </div>
        </BrowserRouter>
      </BoothProvider>
    </ThemeProvider>
  );
}
