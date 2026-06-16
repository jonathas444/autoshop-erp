import PDV from './modules/pdv/PDV'
import OrdensServico from './modules/ordens-servico/OrdensServico'
import Estoque from './modules/estoque/Estoque'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import Clientes from './modules/clientes/Clientes'

function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-gray-100">

        {/* Sidebar */}
        <aside className="w-56 bg-white border-r border-gray-200 flex flex-col">
          
          {/* Logo */}
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-base font-semibold text-gray-900">🔧 AutoShop ERP</h1>
            <p className="text-xs text-gray-500">Mecânica automotiva</p>
          </div>

          {/* Menu */}
          <nav className="flex-1 p-2 space-y-1">
            <NavLink to="/" end className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>
              📊 Dashboard
            </NavLink>
            <NavLink to="/pdv" className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>
              💳 Frente de caixa
            </NavLink>
            <NavLink to="/ordens-servico" className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>
              📋 Ordens de serviço
            </NavLink>
            <NavLink to="/estoque" className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>
              📦 Estoque
            </NavLink>
            <NavLink to="/clientes" className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>
              👥 Clientes
            </NavLink>
          </nav>

          {/* Rodapé sidebar */}
          <div className="p-3 border-t border-gray-200">
            <p className="text-xs text-gray-400">v1.0.0</p>
          </div>
        </aside>

        {/* Conteúdo principal */}
        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={<h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>} />
          <Route path="/pdv" element={<PDV />} />
            <Route path="/ordens-servico" element={<OrdensServico />} />
            <Route path="/estoque" element={<Estoque/>} />
            <Route path="/clientes" element={<Clientes />} />
          </Routes>
        </main>

      </div>
    </BrowserRouter>
  )
}

export default App