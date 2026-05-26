import React, { useState, useMemo, useEffect } from "react";
import {
  ShoppingBag,
  Settings,
  Plus,
  Trash2,
  Eye,
  ExternalLink,
  LogOut,
  CheckCircle,
  XCircle,
  Package,
  ArrowLeft,
  Image as ImageIcon,
  Loader,
} from "lucide-react";

// --- UTILIDAD PARA EXTRAER IMÁGENES (SOLUCIÓN RÁPIDA PARA DEMO) ---
// Extrae el ID del post y usa un servicio público de thumbnail
const extractInstagramImage = (url) => {
  try {
    // Ejemplo URL: https://www.instagram.com/p/DYqefHvEZSW/?igsh=...
    const urlObj = new URL(url);
    const pathnameParts = urlObj.pathname.split("/");
    // Buscar la parte 'p' y tomar el siguiente segmento que es el ID (ej. DYqefHvEZSW)
    const pIndex = pathnameParts.indexOf("p");

    if (pIndex !== -1 && pathnameParts[pIndex + 1]) {
      const postId = pathnameParts[pIndex + 1];
      // Usar un servicio público o la URL directa de GraphQL (suele funcionar para demos cortas)
      // Nota: Esta URL puede fallar si Instagram cambia sus políticas CORS, pero es la forma más rápida sin API.
      return `https://instagram.com/p/${postId}/media/?size=l`;
    }
  } catch (error) {
    console.error("Error analizando URL de Instagram:", error);
  }
  return null; // Retorna null si falla
};

const INITIAL_PRODUCTS = [
  { 
    id: 1, 
    name: "Prenda Drop 1", 
    price: 850, 
    status: 'available', 
    category: 'Drop Reciente', 
    description: "Excelente estado.",
    igLink: "https://www.instagram.com/p/DYqefHvEZSW/?igsh=MWc2eDc4MGRienNocw==",
    imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600" // Sudadera/Hoodie
  },
  { 
    id: 2, 
    name: "Prenda Drop 2", 
    price: 1200, 
    status: 'available', 
    category: 'Drop Reciente', 
    description: "Talla única.",
    igLink: "https://www.instagram.com/p/DYqeI_BkWOS/?igsh=MXE2ZWFnemFsZ2F1ZA==",
    imageUrl: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=600" // Sneakers/Tenis
  },
  { 
    id: 3, 
    name: "Prenda Drop 3", 
    price: 950, 
    status: 'sold', 
    category: 'Vintage', 
    description: "Pieza de colección.",
    igLink: "https://www.instagram.com/p/DYqd72TkQUx/?igsh=MTlhcTVpaTFlazEwdQ==",
    imageUrl: "https://images.unsplash.com/photo-1578932750294-f5075e85f44a?q=80&w=600" // Chamarra/Jacket style
  },
  { 
    id: 4, 
    name: "Prenda Drop 4", 
    price: 1500, 
    status: 'available', 
    category: 'Exclusivo', 
    description: "Edición limitada.",
    igLink: "https://www.instagram.com/p/DYqdx31EXj8/?igsh=MWVvcHF0bnJwN3c3cA==",
    imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600" // Playera/T-Shirt
  },
];

const App = () => {
  const [view, setView] = useState("landing");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [filter, setFilter] = useState("all");

  // Estados para nuevo producto
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    category: "",
    igLink: "",
    description: "",
  });
  const [isExtractingImage, setIsExtractingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  // Efecto para intentar extraer imagen cuando cambia el enlace de IG en el admin
  useEffect(() => {
    if (newProduct.igLink && newProduct.igLink.includes("instagram.com/p/")) {
      setIsExtractingImage(true);
      // Pequeño delay para simular carga
      setTimeout(() => {
        const extracted = extractInstagramImage(newProduct.igLink);
        setPreviewImage(extracted);
        setIsExtractingImage(false);
      }, 500);
    } else {
      setPreviewImage(null);
    }
  }, [newProduct.igLink]);

  const filteredProducts = useMemo(() => {
    if (filter === "all") return products;
    return products.filter((p) => p.status === filter);
  }, [products, filter]);

  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price || !newProduct.igLink) {
      alert("Nombre, Precio y Enlace de Instagram son obligatorios.");
      return;
    }

    const item = {
      ...newProduct,
      id: Date.now(),
      status: "available",
      price: parseFloat(newProduct.price),
      imageUrl: previewImage,
    };

    setProducts([item, ...products]);
    setNewProduct({
      name: "",
      price: "",
      category: "",
      igLink: "",
      description: "",
    });
    setPreviewImage(null);
  };

  const toggleStatus = (id) => {
    setProducts(
      products.map((p) =>
        p.id === id
          ? { ...p, status: p.status === "available" ? "sold" : "available" }
          : p
      )
    );
  };

  const deleteProduct = (id) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  // --- VISTAS ---

  const LoginView = () => (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
        <div className="text-center mb-8">
          <div className="bg-black w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Settings className="text-white" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">
            Panel Administrativo
          </h2>
          <p className="text-slate-500">Demo para Exposición</p>
        </div>
        <div className="space-y-4">
          <button
            onClick={() => setIsLoggedIn(true)}
            className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition transform active:scale-95"
          >
            Entrar como Administrador
          </button>
          <button
            onClick={() => setView("landing")}
            className="w-full text-slate-500 py-2 text-sm font-medium hover:text-black transition flex justify-center items-center gap-2"
          >
            <ArrowLeft size={16} /> Volver al Catálogo
          </button>
        </div>
      </div>
    </div>
  );

  const LandingView = () => (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      <nav className="border-b border-slate-100 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-black p-1.5 rounded-lg">
              <ShoppingBag className="text-white" size={20} />
            </div>
            <span className="font-black text-xl tracking-tighter italic">
              STREETWEAR HUB
            </span>
          </div>
          <button
            onClick={() => setView("admin")}
            className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition text-slate-600 flex items-center gap-2 px-4"
          >
            <Settings size={16} />{" "}
            <span className="text-xs font-bold uppercase hidden sm:block">
              Admin
            </span>
          </button>
        </div>
      </nav>

      <header className="py-12 px-4 text-center max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter uppercase italic">
          Catálogo <span className="text-slate-400">Oficial</span>
        </h1>
        <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
          Explora las piezas disponibles. Haz clic en "Ver en Instagram" para ir
          directo al post original y dejar tu puja.
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          {["all", "available", "sold"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2 rounded-full text-sm font-bold uppercase transition ${
                filter === f
                  ? "bg-black text-white shadow-lg"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {f === "all"
                ? "Todos"
                : f === "available"
                ? "Disponibles"
                : "Vendidos"}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredProducts.map((product) => (
            <div key={product.id} className="group relative">
              <div
                className={`aspect-square rounded-2xl mb-4 overflow-hidden relative border border-slate-200 bg-slate-50 ${
                  product.status === "sold" ? "grayscale opacity-80" : ""
                }`}
              >
                {/* Visualización de Imagen Extraída */}
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    onError={(e) => {
                      // Fallback si la imagen directa de IG falla (CORS o enlace roto)
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}

                {/* Fallback Icon (Se muestra si no hay imageUrl o si la img falla) */}
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 bg-slate-50"
                  style={{ display: product.imageUrl ? "none" : "flex" }}
                >
                  <ImageIcon size={48} strokeWidth={1} className="mb-2" />
                  <span className="text-xs font-medium uppercase tracking-widest text-slate-400">
                    Post Link Only
                  </span>
                </div>

                {product.status === "sold" && (
                  <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] flex items-center justify-center z-10">
                    <span className="bg-black text-white px-6 py-2 font-black uppercase text-lg -rotate-12 shadow-xl border-2 border-white">
                      SOLD OUT
                    </span>
                  </div>
                )}

                <div className="absolute top-4 right-4 z-20">
                  <span className="bg-white text-black px-3 py-1.5 rounded-lg text-sm font-black shadow-md border border-slate-100">
                    ${product.price}
                  </span>
                </div>
              </div>

              <div className="space-y-2 px-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-lg leading-tight text-slate-900">
                    {product.name}
                  </h3>
                </div>
                <span className="inline-block px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-widest rounded">
                  {product.category}
                </span>

                <a
                  href={product.igLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) =>
                    product.status === "sold" ? e.preventDefault() : null
                  }
                  className={`w-full mt-4 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold transition ${
                    product.status === "available"
                      ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                  }`}
                >
                  {product.status === "available" ? (
                    <>
                      Ver publicación en IG <ExternalLink size={16} />
                    </>
                  ) : (
                    "No Disponible"
                  )}
                </a>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );

  const AdminView = () => (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row font-sans">
      <aside className="w-full md:w-96 bg-white border-r border-slate-200 p-6 flex flex-col overflow-y-auto">
        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100">
          <div className="bg-black p-2 rounded-xl">
            <Settings className="text-white" size={24} />
          </div>
          <div>
            <h2 className="font-black text-xl tracking-tight leading-none">
              ADMIN HUB
            </h2>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Demo Exposición
            </span>
          </div>
        </div>

        <div className="flex-grow">
          <h3 className="text-sm font-bold text-slate-800 mb-4">
            Añadir Nueva Prenda
          </h3>
          <form onSubmit={handleAddProduct} className="space-y-4">
            {/* Campo clave: Enlace de IG */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                1. Pegar URL de Instagram
              </label>
              <input
                type="url"
                placeholder="https://www.instagram.com/p/..."
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                value={newProduct.igLink}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, igLink: e.target.value })
                }
                required
              />

              {/* Preview Status */}
              {newProduct.igLink && (
                <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-start gap-3">
                  <div className="w-12 h-12 bg-slate-200 rounded shrink-0 flex items-center justify-center overflow-hidden">
                    {isExtractingImage ? (
                      <Loader
                        className="animate-spin text-slate-400"
                        size={16}
                      />
                    ) : previewImage ? (
                      <img
                        src={previewImage}
                        alt="preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon size={16} className="text-slate-400" />
                    )}
                  </div>
                  <div className="text-xs text-slate-500 flex-1">
                    {isExtractingImage
                      ? "Intentando obtener miniatura..."
                      : previewImage
                      ? "Miniatura generada automáticamente desde URL."
                      : "Se usará URL para redirección (miniatura no disponible)."}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                2. Detalles de Prenda
              </label>
              <input
                type="text"
                placeholder="Nombre (ej. Jordan 1 Retro)"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none mb-3"
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, name: e.target.value })
                }
                required
              />
              <div className="flex gap-3 mb-3">
                <div className="relative w-1/2">
                  <span className="absolute left-3 top-3 text-slate-400 font-bold">
                    $
                  </span>
                  <input
                    type="number"
                    placeholder="Precio"
                    className="w-full pl-8 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newProduct.price}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, price: e.target.value })
                    }
                    required
                  />
                </div>
                <input
                  type="text"
                  placeholder="Categoría (opcional)"
                  className="w-1/2 px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newProduct.category}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, category: e.target.value })
                  }
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-black text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition shadow-lg shadow-slate-200 mt-6"
            >
              <Plus size={18} /> Publicar en Catálogo
            </button>
          </form>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100">
          <button
            onClick={() => {
              setIsLoggedIn(false);
              setView("landing");
            }}
            className="flex items-center justify-center gap-3 bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600 py-3 rounded-xl transition font-bold w-full text-sm"
          >
            <LogOut size={16} /> Cerrar Sesión Segura
          </button>
        </div>
      </aside>

      <main className="flex-grow p-4 md:p-8 lg:p-12">
        <header className="mb-8 flex justify-between items-end bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <h1 className="text-2xl font-black text-slate-900 mb-1">
              Control de Inventario
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Cambia los estados de disponible a vendido con un clic.
            </p>
          </div>
          <button
            onClick={() => setView("landing")}
            className="flex items-center gap-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-lg font-bold hover:bg-blue-100 transition text-sm"
          >
            <Eye size={16} /> Ver Catálogo Público
          </button>
        </header>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">
                    Item (IG Post)
                  </th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">
                    Estado Actual
                  </th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider text-right">
                    Borrar
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-slate-50 transition group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden shrink-0 border border-slate-200">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon size={18} className="text-slate-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">
                            {product.name}
                          </p>
                          <a
                            href={product.igLink}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] font-bold text-blue-500 hover:underline flex items-center gap-1 mt-0.5"
                          >
                            Ver post IG <ExternalLink size={10} />
                          </a>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-700">
                      ${product.price}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleStatus(product.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-black transition uppercase tracking-wide border ${
                          product.status === "available"
                            ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                            : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                        }`}
                      >
                        {product.status === "available" ? (
                          <>
                            <CheckCircle size={14} /> Disponible
                          </>
                        ) : (
                          <>
                            <XCircle size={14} /> Vendido
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="p-2.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition inline-flex"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {products.length === 0 && (
            <div className="text-center py-20">
              <Package size={40} className="mx-auto text-slate-200 mb-3" />
              <p className="text-slate-500 font-medium">
                El inventario está vacío. Añade una URL de Instagram.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );

  if (view === "admin" && !isLoggedIn) return <LoginView />;
  if (view === "admin" && isLoggedIn) return <AdminView />;

  return <LandingView />;
};

export default App;
