import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import {
  FiHome,
  FiUsers,
  FiCalendar,
  FiFileText,
  FiLogOut,
  FiMenu,
  FiX,
  FiSettings,
  FiBell,
  FiSearch
} from 'react-icons/fi'
import { useState } from 'react'

const navigation = [
  { name: 'Beranda', href: '/beranda', icon: FiHome },
  { name: 'Pasien', href: '/pasien', icon: FiUsers },
  { name: 'Kunjungan', href: '/kunjungan', icon: FiFileText },
  { name: 'Janji Temu', href: '/janji-temu', icon: FiCalendar },
]

function MainLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/masuk')
  }

  return (
    <div className="min-h-screen bg-slate-200">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-primary-900 text-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-20 items-center justify-between px-6 border-b border-primary-800">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">H</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-white">Hospital<span className="text-primary-400">EMR</span></span>
            </div>
            <button
              className="lg:hidden text-primary-200 hover:text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <FiX className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
            <div className="text-xs font-semibold text-primary-200 uppercase tracking-wider mb-4 px-2">Menu Utama</div>
            {navigation.map((item) => {
              const isActive = location.pathname.startsWith(item.href)
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${isActive
                    ? 'bg-primary-800 text-white shadow-md shadow-primary-900/20'
                    : 'text-primary-100 hover:bg-primary-800 hover:text-white'
                    }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className={`mr-3 h-5 w-5 transition-colors ${isActive ? 'text-white' : 'text-primary-300 group-hover:text-white'}`} />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User section */}
          <div className="border-t border-primary-800 p-4 bg-primary-800/50">
            <div className="flex items-center mb-4 px-2">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-primary-700 flex items-center justify-center text-white font-semibold ring-2 ring-primary-600">
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </div>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-primary-200 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
            >
              <FiLogOut className="mr-2 h-4 w-4" />
              Keluar
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-72 flex flex-col min-h-screen transition-all duration-300">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
          <div className="flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
            <button
              className="lg:hidden text-slate-500 hover:text-slate-700"
              onClick={() => setSidebarOpen(true)}
            >
              <FiMenu className="h-6 w-6" />
            </button>

            <div className="flex-1 flex items-center justify-between lg:justify-end gap-4">
              <div className="lg:hidden">
                <h2 className="text-lg font-semibold text-slate-800">
                  {navigation.find(item => location.pathname.startsWith(item.href))?.name || 'Hospital EMR'}
                </h2>
              </div>

              <div className="flex items-center space-x-3 sm:space-x-6">




                {/* Date Display */}
                <span className="hidden md:block text-sm font-medium text-slate-500">
                  {new Date().toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>


              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default MainLayout
