
import React from 'react';
import { HashRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { DataProvider } from './contexts/DataContext';
import { DashboardPage } from './pages/DashboardPage';
import { ConfigPage } from './pages/ConfigPage';
import { NiveisPage } from './pages/NiveisPage';
import { TradesPage } from './pages/TradesPage';
import { DiarioPage } from './pages/DiarioPage';
import { MetricasPage } from './pages/MetricasPage';
import { Home, Settings, BarChart3, CandlestickChart, BookOpen, LayoutDashboard } from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/niveis', label: 'Níveis', icon: BarChart3 },
  { path: '/trades', label: 'Trades', icon: CandlestickChart },
  { path: '/diario', label: 'Diário', icon: BookOpen },
  { path: '/metricas', label: 'Métricas', icon: Home },
  { path: '/config', label: 'Config', icon: Settings },
];

const App: React.FC = () => {
  return (
    <DataProvider>
      <HashRouter>
        <div className="flex h-screen bg-gray-50 text-gray-800">
          <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
            <div className="h-16 flex items-center justify-center px-4 border-b border-gray-200">
              <h1 className="text-xl font-bold text-blue-600">FIMATHE</h1>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                      isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </aside>
          <main className="flex-1 flex flex-col overflow-hidden">
             <Header />
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/config" element={<ConfigPage />} />
                <Route path="/niveis" element={<NiveisPage />} />
                <Route path="/trades" element={<TradesPage />} />
                <Route path="/diario" element={<DiarioPage />} />
                <Route path="/metricas" element={<MetricasPage />} />
              </Routes>
            </div>
          </main>
        </div>
      </HashRouter>
    </DataProvider>
  );
};

const Header: React.FC = () => {
    const location = useLocation();
    const currentNavItem = navItems.find(item => item.path === location.pathname);
    const title = currentNavItem ? currentNavItem.label : 'Dashboard';

    return (
        <header className="h-16 bg-white border-b border-gray-200 flex-shrink-0 flex items-center px-6 md:px-8">
            <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
        </header>
    );
}

export default App;
