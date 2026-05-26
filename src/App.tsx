import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShoppingBag, Settings, Plus, Trash2, Eye, ExternalLink, 
  LogOut, CheckCircle, XCircle, Package, ArrowLeft, 
  Image as ImageIcon, Loader, UploadCloud, Lock
} from 'lucide-react';

// --- DATOS INICIALES MOCK ---
const INITIAL_PRODUCTS = [
  { 
    id: 1, name: "Vintage Nike Hoodie", price: 850, status: 'available', category: 'Drop 1',
    igLink: "https://www.instagram.com/p/DYqefHvEZSW/",
    imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600" 
  }
];

const App = () => {
  const [view, setView] = useState('landing');
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [filter, setFilter] = useState('all');
  
  // --- ESTADOS DE LOGIN FUNCIONAL ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authForm, setAuthForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  // Verificar si hay una sesión guardada al cargar la página
  useEffect(() => {
    const session = localStorage.getItem('adminSession');
    if (session === 'active') {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (authForm.username === 'admin' && authForm.password === 'streetwear2026') {
      setIsLoggedIn(true);
      setLoginError('');
      localStorage.setItem('adminSession', 'active');
    } else {
      setLoginError('Usuario o contraseña incorrectos.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('adminSession');
    setView('landing');
  };

  // --- ESTADOS DE CARGA Y PRODUCTOS ---
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: '', igLink: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const uploadToS3Mock = async (file) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockUrl = URL.createObjectURL(file);
        resolve(mockUrl);
      }, 1500);
    });
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price || !newProduct.igLink || !selectedFile) {
        alert("Todos los campos y la imagen son obligatorios.");
        return;
    }
    
    setIsUploading(true);
    try {
      const s3Url = await uploadToS3Mock(selectedFile);

      const item = {
        ...newProduct,
        id: Date.now(),
        status: 'available',
        price: parseFloat(newProduct.price),
        imageUrl: s3Url 
      };
      
      setProducts([item, ...products]);
      setNewProduct({ name: '', price: '', category: '', igLink: '' });
      setSelectedFile(null);
      
      const fileInput = document.getElementById('file-upload');
      if (fileInput) fileInput.value = '';
    } catch (error) {
      alert("Hubo un error subiendo la imagen. Revisa la consola.");
    } finally {
      setIsUploading(false);
    }
  };

  const toggleStatus = (id) => {
    setProducts(products.map(p => 
      p.id === id ? { ...p, status: p.status === 'available' ? 'sold' : 'available' } : p
    ));
  };

  const deleteProduct = (id) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const filteredProducts = useMemo(() => {
    if (filter === 'all') return products;
    return products.filter(p => p.status === filter);
  }, [products, filter]);

  // --- RENDERS INTERNOS (EVITAN LA PÉRDIDA DE ENFOQUE) ---

  const renderLoginView = () => (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
        <div className="text-center mb-8">
          <div className="bg-black w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="text-white" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Acceso Seguro</h2>
          <p className="text-slate-500">Ingresa tus credenciales de administrador</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Usuario</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={authForm.username}
              onChange={(e) => setAuthForm({...authForm, username: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Contraseña</label>
            <input 
              type="password" 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={authForm.password}
              onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
              required
            />
          </div>
          
          {loginError && <p className="text-red-500 text-xs font-bold">{loginError}</p>}

          <button type="submit" className="w-full bg-black text-white py-3.5 rounded-xl font-bold hover:bg-slate-800 transition shadow-lg mt-4">
            Iniciar Sesión
          </button>
        </form>

        <button 
          onClick={() => setView('landing')}
          className="w-full text-slate-500 py-4 mt-2 text-sm font-medium hover:text-black transition flex justify-center items-center gap-2"
        >
          <ArrowLeft size={16}/> Volver al Catálogo Público
        </button>
      </div>
    </div>
  );

  const renderAdminView = () => (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row font-sans">
      <aside className="w-full md:w-96 bg-white border-r border-slate-200 p-6 flex flex-col overflow-y-auto">
        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-200">
            <Settings className="text-white" size={24} />
          </div>
          <div>
            <h2 className="font-black text-xl tracking-tight leading-none">ADMIN HUB</h2>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">S3 Storage Simulado</span>
          </div>
        </div>

        <div className="flex-grow">
          <form onSubmit={handleAddProduct} className="space-y-4">
            
            {/* Input File */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">1. Subir Imagen</label>
              <div className="relative border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition cursor-pointer">
                <input 
                  id="file-upload"
                  type="file" 
                  accept="image/png, image/jpeg, image/webp"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileChange}
                  required
                />
                {selectedFile ? (
                  <div className="text-center">
                    <CheckCircle className="mx-auto text-green-500 mb-2" size={24} />
                    <p className="text-sm font-bold text-slate-700 truncate w-48">{selectedFile.name}</p>
                    <p className="text-xs text-slate-400">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <div className="text-center pointer-events-none">
                    <UploadCloud className="mx-auto text-slate-400 mb-2" size={24} />
                    <p className="text-sm font-bold text-slate-600">Haz clic o arrastra una foto</p>
                    <p className="text-xs text-slate-400">JPG, PNG, WEBP</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">2. Enlace de Instagram</label>
              <input 
                type="url" placeholder="https://www.instagram.com/p/..." 
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={newProduct.igLink}
                onChange={e => setNewProduct({...newProduct, igLink: e.target.value})}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">3. Detalles de Prenda</label>
              <input 
                type="text" placeholder="Nombre (ej. Jordan 1 Retro)" 
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none mb-3"
                value={newProduct.name}
                onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                required
              />
              <div className="flex gap-3 mb-3">
                <div className="relative w-1/2">
                    <span className="absolute left-3 top-3 text-slate-400 font-bold">$</span>
                    <input 
                        type="number" placeholder="Precio" 
                        className="w-full pl-8 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={newProduct.price}
                        onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                        required
                    />
                </div>
                <input 
                  type="text" placeholder="Categoría" 
                  className="w-1/2 px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newProduct.category}
                  onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isUploading}
              className={`w-full text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-lg mt-6 ${
                isUploading ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
              }`}
            >
              {isUploading ? (
                <><Loader className="animate-spin" size={18} /> Subiendo a AWS S3...</>
              ) : (
                <><Plus size={18} /> Publicar Drop</>
              )}
            </button>
          </form>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100">
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-3 bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600 py-3 rounded-xl transition font-bold w-full text-sm"
          >
            <LogOut size={16} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="flex-grow p-4 md:p-8 lg:p-12">
        <header className="mb-8 flex justify-between items-end bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <h1 className="text-2xl font-black text-slate-900 mb-1">Inventario Seguro</h1>
            <p className="text-sm text-slate-500 font-medium">Gestión visual rápida del catálogo web.</p>
          </div>
          <button 
            onClick={() => setView('landing')}
            className="flex items-center gap-2 text-slate-600 bg-slate-50 px-4 py-2 rounded-lg font-bold hover:bg-slate-100 transition text-sm border border-slate-200"
          >
            <Eye size={16} /> Ver Catálogo
          </button>
        </header>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase">Prenda</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase">Precio</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase">Estado</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase text-right">Borrar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map(product => (
                  <tr key={product.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                          <img src={product.imageUrl} alt="" className="w-full h-full object-cover"/>
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{product.name}</p>
                          <a href={product.igLink} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-blue-500 hover:underline flex items-center gap-1 mt-0.5">
                              Enlace Instagram <ExternalLink size={10}/>
                          </a>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-700">${product.price}</td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => toggleStatus(product.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-black transition uppercase tracking-wide border ${
                          product.status === 'available' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}
                      >
                        {product.status === 'available' ? <><CheckCircle size={14} /> Disponible</> : <><XCircle size={14} /> Vendido</>}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => deleteProduct(product.id)} className="p-2.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );

  const renderLandingView = () => (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      <nav className="border-b border-slate-100 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-black p-1.5 rounded-lg">
              <ShoppingBag className="text-white" size={20} />
            </div>
            <span className="font-black text-xl tracking-tighter italic">STREETWEAR HUB</span>
          </div>
          <button 
            onClick={() => setView('admin')}
            className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition text-slate-600 flex items-center gap-2 px-4"
          >
            <Settings size={16} /> <span className="text-xs font-bold uppercase hidden sm:block">Admin Login</span>
          </button>
        </div>
      </nav>

      <header className="py-12 px-4 text-center max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter uppercase italic">
          Catálogo <span className="text-blue-600">Oficial</span>
        </h1>
        <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
          Explora las piezas disponibles. Haz clic en "Ver en Instagram" para ir directo al post original.
        </p>
        
        <div className="flex flex-wrap justify-center gap-3">
          {['all', 'available', 'sold'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2 rounded-full text-sm font-bold uppercase transition ${
                filter === f ? 'bg-black text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f === 'all' ? 'Todos' : f === 'available' ? 'Disponibles' : 'Vendidos'}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredProducts.map(product => (
            <div key={product.id} className="group relative">
              <div className={`aspect-square rounded-2xl mb-4 overflow-hidden relative border border-slate-200 bg-slate-50 ${
                product.status === 'sold' ? 'grayscale opacity-80' : ''
              }`}>
                <img 
                  src={product.imageUrl} 
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                
                {product.status === 'sold' && (
                  <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] flex items-center justify-center z-10">
                    <span className="bg-black text-white px-6 py-2 font-black uppercase text-lg -rotate-12 shadow-xl border-2 border-white">SOLD OUT</span>
                  </div>
                )}

                <div className="absolute top-4 right-4 z-20">
                  <span className="bg-white text-black px-3 py-1.5 rounded-lg text-sm font-black shadow-md border border-slate-100">
                    ${product.price}
                  </span>
                </div>
              </div>

              <div className="space-y-2 px-1">
                <h3 className="font-bold text-lg leading-tight text-slate-900">{product.name}</h3>
                <span className="inline-block px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-widest rounded">
                    {product.category}
                </span>
                
                <a 
                  href={product.igLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => product.status === 'sold' ? e.preventDefault() : null}
                  className={`w-full mt-4 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold transition ${
                    product.status === 'available' 
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200' 
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  }`}
                >
                  {product.status === 'available' ? <><ExternalLink size={16} /> Pujar en Instagram</> : 'No Disponible'}
                </a>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );

  // --- CONTROLADOR DE VISTA DE COMPONENTE ---
  if (view === 'admin' && !isLoggedIn) return renderLoginView();
  if (view === 'admin' && isLoggedIn) return renderAdminView();
  return renderLandingView();
};

export default App;
