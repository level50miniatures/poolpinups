export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans p-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8 flex justify-between items-center bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Pinup Forge — Panel de Administración</h1>
            <p className="text-sm text-gray-500">Gestiona tus fases del Kickstarter y las opciones de voto</p>
          </div>
          <nav className="flex gap-4 text-sm font-medium">
            <a href="/admin" className="text-blue-600 hover:text-blue-800">Panel Principal</a>
            <a href="/" target="_blank" className="text-gray-500 hover:text-gray-700">Ver Web Pública ↗</a>
          </nav>
        </header>
        <main>
          {children}
        </main>
      </div>
    </div>
  );
}
