import { useState, useEffect } from 'react';

export function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/usuarios');
      if (!response.ok) throw new Error('Error fetching users');
      const data = await response.json();
      setUsers(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/api/usuarios/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Error deleting user');
      setUsers(prev => prev.filter(u => u.id !== id));
      return true;
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return { users, setUsers, loading, error, deleteUser, fetchUsers };
}
