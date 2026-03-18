import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function App() {
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    edad: '',
    sexo: '',
    terminos: false
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/api/usuarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Usuario registrado exitosamente');
        setFormData({
          nombreCompleto: '',
          edad: '',
          sexo: '',
          terminos: false
        });
        navigate('/home');
      } else {
        alert('Error al registrar usuario');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-base-200 p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-center justify-center text-primary text-2xl mb-4 font-bold">Registro de Usuario</h2>
          <form onSubmit={handleSubmit} className="form-control gap-4">
            
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">Nombre Completo</span>
              </label>
              <input
                type="text"
                placeholder="Escribe tu nombre completo"
                className="input input-bordered w-full focus:input-primary"
                id="nombreCompleto"
                name="nombreCompleto"
                value={formData.nombreCompleto}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">Edad</span>
              </label>
              <input
                type="number"
                placeholder="Ej: 25"
                className="input input-bordered w-full focus:input-primary"
                id="edad"
                name="edad"
                value={formData.edad}
                onChange={handleChange}
                required
                min="1"
                max="120"
              />
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">Sexo</span>
              </label>
              <select
                className="select select-bordered w-full focus:select-primary"
                id="sexo"
                name="sexo"
                value={formData.sexo}
                onChange={handleChange}
                required
              >
                <option value="" disabled>Seleccione una opción...</option>
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            <div className="form-control mt-2">
              <label className="label cursor-pointer justify-start gap-3 hover:bg-base-200 p-2 rounded-lg transition-colors">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  id="terminos"
                  name="terminos"
                  checked={formData.terminos}
                  onChange={handleChange}
                  required
                />
                <span className="label-text select-none">Acepto los términos y condiciones</span>
              </label>
            </div>

            <div className="card-actions flex-col mt-6 gap-3">
              <button type="submit" className="btn btn-primary w-full shadow-md hover:shadow-lg transition-shadow">
                Registrar
              </button>
              
              <div className="divider text-sm text-base-content/50 my-1">O</div>

              <Link to="/home" className="btn btn-outline btn-secondary w-full">
                Ver usuarios registrados
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
