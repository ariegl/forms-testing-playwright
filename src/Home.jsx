import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

function Home() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', message: string }
  const [deleteId, setDeleteId] = useState(null);
  const modalRef = useRef(null);

  useEffect(() => {
    fetchUsuarios();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchUsuarios = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/usuarios');
      if (!response.ok) {
        throw new Error('Error fetching users');
      }
      const data = await response.json();
      setUsuarios(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    if (modalRef.current) {
      modalRef.current.showModal();
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const response = await fetch(`http://localhost:3000/api/usuarios/${deleteId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Error deleting user');
      }
      setUsuarios(usuarios.filter(user => user.id !== deleteId));
      setToast({ type: 'success', message: 'Usuario eliminado correctamente' });
    } catch (err) {
      setToast({ type: 'error', message: 'Error al eliminar: ' + err.message });
    } finally {
      setDeleteId(null);
      if (modalRef.current) {
        modalRef.current.close();
      }
    }
  };

  const filteredUsuarios = usuarios.filter(user => 
    user.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats calculation
  const totalUsuarios = usuarios.length;
  const promedioEdad = totalUsuarios > 0 
    ? Math.round(usuarios.reduce((acc, curr) => acc + curr.edad, 0) / totalUsuarios) 
    : 0;
  const totalMasculino = usuarios.filter(u => u.sexo === 'masculino').length;
  const totalFemenino = usuarios.filter(u => u.sexo === 'femenino').length;

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-base-200">
      <span className="loading loading-dots loading-lg text-primary"></span>
    </div>
  );
  
  if (error) return (
    <div className="flex justify-center items-center h-screen bg-base-200">
      <div role="alert" className="alert alert-error shadow-lg w-full max-w-md">
        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span>Error: {error}</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-8 font-sans">
      <div className="container mx-auto max-w-6xl space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 border-b border-base-content/10 pb-6">
          <div>
            <h1 className="text-4xl font-extrabold text-base-content tracking-tight">Dashboard Usuarios</h1>
            <p className="text-base-content/60 mt-1">Gestión y visualización de registros</p>
          </div>
          <Link to="/" className="btn btn-primary gap-2 shadow-lg shadow-primary/30 hover:scale-105 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nuevo Usuario
          </Link>
        </div>

        {/* Stats Section */}
        {usuarios.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="stats shadow bg-base-100">
              <div className="stat">
                <div className="stat-figure text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                </div>
                <div className="stat-title">Total Usuarios</div>
                <div className="stat-value text-primary">{totalUsuarios}</div>
                <div className="stat-desc">Registrados</div>
              </div>
            </div>
            
            <div className="stats shadow bg-base-100">
              <div className="stat">
                <div className="stat-figure text-secondary">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <div className="stat-title">Edad Promedio</div>
                <div className="stat-value text-secondary">{promedioEdad}</div>
                <div className="stat-desc">Años</div>
              </div>
            </div>

            <div className="stats shadow bg-base-100">
              <div className="stat">
                <div className="stat-figure text-info">
                  <div className="avatar placeholder">
                    <div className="bg-neutral-focus text-neutral-content rounded-full w-10 h-10 flex items-center justify-center bg-blue-100 text-blue-600">
                      <span>M</span>
                    </div>
                  </div>
                </div>
                <div className="stat-title">Hombres</div>
                <div className="stat-value text-info">{totalMasculino}</div>
              </div>
            </div>

            <div className="stats shadow bg-base-100">
              <div className="stat">
                <div className="stat-figure text-secondary">
                   <div className="avatar placeholder">
                    <div className="bg-neutral-focus text-neutral-content rounded-full w-10 h-10 flex items-center justify-center bg-pink-100 text-pink-600">
                      <span>F</span>
                    </div>
                  </div>
                </div>
                <div className="stat-title">Mujeres</div>
                <div className="stat-value text-secondary">{totalFemenino}</div>
              </div>
            </div>
          </div>
        )}

        {/* Filters & Content */}
        <div className="card bg-base-100 shadow-xl overflow-hidden border border-base-200">
          <div className="p-4 border-b border-base-200 bg-base-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-xl font-bold px-2">Listado de Registros</h2>
            <div className="form-control w-full max-w-xs">
              <input 
                type="text" 
                placeholder="Buscar por nombre..." 
                className="input input-bordered input-sm w-full" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {filteredUsuarios.length === 0 ? (
            <div className="py-16 text-center flex flex-col items-center justify-center">
              <div className="bg-base-200 p-6 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-base-content/40">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold">No se encontraron resultados</h3>
              <p className="text-base-content/60 max-w-xs mx-auto mt-2">
                {searchTerm ? `No hay usuarios que coincidan con "${searchTerm}"` : "Aún no hay usuarios registrados."}
              </p>
              {!searchTerm && (
                <Link to="/" className="btn btn-sm btn-primary mt-6">
                  Crear primer registro
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="table table-zebra w-full">
                <thead className="bg-base-200/50 text-base-content/70 text-xs uppercase font-bold tracking-wider">
                  <tr>
                    <th className="py-4 pl-6">ID</th>
                    <th className="py-4">Nombre Completo</th>
                    <th className="py-4">Edad</th>
                    <th className="py-4">Sexo</th>
                    <th className="py-4">Términos</th>
                    <th className="py-4 pr-6 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filteredUsuarios.map((user) => (
                    <tr key={user.id} className="hover">
                      <th className="pl-6 font-mono opacity-50">#{user.id}</th>
                      <td className="font-semibold text-base">{user.nombre_completo}</td>
                      <td>{user.edad} años</td>
                      <td>
                         <span className={`badge badge-sm font-medium gap-1 py-3 px-3 ${
                          user.sexo === 'masculino' ? 'badge-info bg-blue-100 text-blue-700 border-transparent' : 
                          user.sexo === 'femenino' ? 'badge-secondary bg-pink-100 text-pink-700 border-transparent' : 
                          'badge-ghost'
                        }`}>
                          {user.sexo === 'masculino' && 'Masculino'} 
                          {user.sexo === 'femenino' && 'Femenino'} 
                          {user.sexo !== 'masculino' && user.sexo !== 'femenino' && user.sexo}
                        </span>
                      </td>
                      <td>
                        {user.terminos ? (
                          <div className="badge badge-success gap-1 bg-green-100 text-green-700 border-transparent p-3">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                            Aceptado
                          </div>
                        ) : (
                          <div className="badge badge-error gap-1 bg-red-100 text-red-700 border-transparent p-3">
                             Pendiente
                          </div>
                        )}
                      </td>
                      <td className="pr-6 text-center">
                        <button 
                          onClick={() => confirmDelete(user.id)}
                          className="btn btn-ghost btn-sm text-error hover:bg-error/10 tooltip"
                          data-tip="Eliminar"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <dialog ref={modalRef} className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-lg text-error">¿Eliminar registro?</h3>
          <p className="py-4">Esta acción no se puede deshacer. ¿Estás seguro de que quieres eliminar este usuario permanentemente?</p>
          <div className="modal-action">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn btn-ghost mr-2" onClick={() => setDeleteId(null)}>Cancelar</button>
            </form>
            <button className="btn btn-error" onClick={handleDelete}>Sí, eliminar</button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={() => setDeleteId(null)}>close</button>
        </form>
      </dialog>

      {/* Toast Notification */}
      {toast && (
        <div className="toast toast-end">
          <div className={`alert ${toast.type === 'success' ? 'alert-success' : 'alert-error'} text-white`}>
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
