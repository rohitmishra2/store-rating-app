import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../auth/useAuth';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' });

  const [stores, setStores] = useState([]);
  const [storeFilters, setStoreFilters] = useState({ name: '', email: '', address: '' });

  const [storeOwners, setStoreOwners] = useState([]);

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
    role: 'user',
  });
  const [newStore, setNewStore] = useState({
    name: '',
    email: '',
    address: '',
    owner_id: '',
  });

  const [userMessage, setUserMessage] = useState(null);
  const [storeMessage, setStoreMessage] = useState(null);

  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      setStats(res.data);
    } catch (err) {
      console.error(err);
      logout();
      navigate('/');
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${auth.token}` },
        params: filters,
      });
      setUsers(res.data.users);
      const owners = res.data.users.filter((u) => u.role === 'store_owner');
      setStoreOwners(owners);
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStores = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/stores', {
        headers: { Authorization: `Bearer ${auth.token}` },
        params: storeFilters,
      });
      setStores(res.data.stores);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchStores();
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        'http://localhost:5000/api/admin/users',
        newUser,
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      setUserMessage({ type: 'success', text: res.data.message });
      setNewUser({ name: '', email: '', address: '', password: '', role: 'user' });
      fetchUsers();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create user';
      setUserMessage({ type: 'error', text: msg });
    }
  };

  const handleAddStore = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        'http://localhost:5000/api/admin/stores',
        newStore,
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      setStoreMessage({ type: 'success', text: res.data.message });
      setNewStore({ name: '', email: '', address: '', owner_id: '' });
      fetchStores();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create store';
      setStoreMessage({ type: 'error', text: msg });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-10 border-b pb-4">
        <h1 className="text-4xl font-extrabold text-purple-700 uppercase">Admin Dashboard</h1>
        <button
          onClick={logout}
          className="bg-red-600 text-white px-5 py-2 rounded-lg shadow hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-purple-500">
          <p className="text-gray-600">Total Users</p>
          <h2 className="text-3xl font-bold text-purple-700">{stats.totalUsers}</h2>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-green-500">
          <p className="text-gray-600">Total Stores</p>
          <h2 className="text-3xl font-bold text-green-600">{stats.totalStores}</h2>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-yellow-500">
          <p className="text-gray-600">Total Ratings</p>
          <h2 className="text-3xl font-bold text-yellow-600">{stats.totalRatings}</h2>
        </div>
      </div>

      {/* User Filters */}
      <form
        onSubmit={handleFilterSubmit}
        className="bg-white shadow rounded-xl p-6 mb-8 grid grid-cols-1 sm:grid-cols-4 gap-4"
      >
        <input
          type="text"
          name="name"
          value={filters.name}
          onChange={handleFilterChange}
          placeholder="Filter by Name"
          className="p-2 border border-gray-300 rounded"
        />
        <input
          type="text"
          name="email"
          value={filters.email}
          onChange={handleFilterChange}
          placeholder="Filter by Email"
          className="p-2 border border-gray-300 rounded"
        />
        <input
          type="text"
          name="address"
          value={filters.address}
          onChange={handleFilterChange}
          placeholder="Filter by Address"
          className="p-2 border border-gray-300 rounded"
        />
        <select
          name="role"
          value={filters.role}
          onChange={handleFilterChange}
          className="p-2 border border-gray-300 rounded"
        >
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="store_owner">Store Owner</option>
        </select>
        <button
          type="submit"
          className="sm:col-span-4 mt-2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Apply Filters
        </button>
      </form>

      {/* User Table */}
      <div className="bg-white shadow rounded-xl p-6 mb-16">
        <h3 className="text-2xl font-bold mb-4">Users List</h3>
        {loading ? (
          <p className="text-gray-600">Loading users...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border rounded-lg text-sm">
              <thead>
                <tr className="bg-gray-200 text-left">
                  <th className="p-3 border">Name</th>
                  <th className="p-3 border">Email</th>
                  <th className="p-3 border">Address</th>
                  <th className="p-3 border">Role</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center p-6 text-gray-500">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="p-3 border">{user.name}</td>
                      <td className="p-3 border">{user.email}</td>
                      <td className="p-3 border">{user.address}</td>
                      <td className="p-3 border capitalize text-blue-600">{user.role}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Store Filters */}
      <div className="mt-12">
        <h3 className="text-2xl font-bold mb-4">Stores List</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchStores();
          }}
          className="bg-white shadow rounded-xl p-6 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <input
            type="text"
            placeholder="Filter by Name"
            value={storeFilters.name}
            onChange={(e) => setStoreFilters({ ...storeFilters, name: e.target.value })}
            className="p-2 border border-gray-300 rounded"
          />
          <input
            type="text"
            placeholder="Filter by Email"
            value={storeFilters.email}
            onChange={(e) => setStoreFilters({ ...storeFilters, email: e.target.value })}
            className="p-2 border border-gray-300 rounded"
          />
          <input
            type="text"
            placeholder="Filter by Address"
            value={storeFilters.address}
            onChange={(e) => setStoreFilters({ ...storeFilters, address: e.target.value })}
            className="p-2 border border-gray-300 rounded"
          />
          <button
            type="submit"
            className="sm:col-span-3 mt-2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Apply Filters
          </button>
        </form>

        {/* Store Table */}
        <div className="bg-white shadow rounded-xl p-6">
          <div className="overflow-x-auto">
            <table className="w-full border rounded-lg text-sm">
              <thead>
                <tr className="bg-gray-200 text-left">
                  <th className="p-3 border">Name</th>
                  <th className="p-3 border">Email</th>
                  <th className="p-3 border">Address</th>
                  <th className="p-3 border">Owner</th>
                  <th className="p-3 border">Avg Rating</th>
                </tr>
              </thead>
              <tbody>
                {stores.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center p-6 text-gray-500">
                      No stores found.
                    </td>
                  </tr>
                ) : (
                  stores.map((store) => (
                    <tr key={store.id} className="hover:bg-gray-50">
                      <td className="p-3 border">{store.name}</td>
                      <td className="p-3 border">{store.email}</td>
                      <td className="p-3 border">{store.address}</td>
                      <td className="p-3 border">{store.owner_name}</td>
                      <td className="p-3 border text-yellow-600 font-bold">
                        ⭐ {store.avg_rating || 0}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add User Form */}
      <div className="mt-16 bg-white shadow rounded-xl p-6">
        <h3 className="text-2xl font-bold mb-4">Add New User</h3>
        {userMessage && (
          <div
            className={`mb-4 p-3 rounded ${
              userMessage.type === 'success'
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {userMessage.text}
          </div>
        )}
        <form onSubmit={handleAddUser} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Name"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            required
            className="p-2 border rounded"
          />
          <input
            type="email"
            placeholder="Email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            required
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Address"
            value={newUser.address}
            onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
            className="p-2 border rounded"
          />
          <input
            type="password"
            placeholder="Password"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            required
            className="p-2 border rounded"
          />
          <select
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            className="p-2 border rounded"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="store_owner">Store Owner</option>
          </select>
          <button
            type="submit"
            className="sm:col-span-2 bg-green-600 text-white py-2 rounded hover:bg-green-700"
          >
            Add User
          </button>
        </form>
      </div>

      {/* Add Store Form */}
      <div className="mt-16 bg-white shadow rounded-xl p-6">
        <h3 className="text-2xl font-bold mb-4">Add New Store</h3>
        {storeMessage && (
          <div
            className={`mb-4 p-3 rounded ${
              storeMessage.type === 'success'
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {storeMessage.text}
          </div>
        )}
        <form onSubmit={handleAddStore} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Store Name"
            value={newStore.name}
            onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
            required
            className="p-2 border rounded"
          />
          <input
            type="email"
            placeholder="Store Email"
            value={newStore.email}
            onChange={(e) => setNewStore({ ...newStore, email: e.target.value })}
            required
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Store Address"
            value={newStore.address}
            onChange={(e) => setNewStore({ ...newStore, address: e.target.value })}
            required
            className="p-2 border rounded"
          />
          <select
            value={newStore.owner_id}
            onChange={(e) => setNewStore({ ...newStore, owner_id: e.target.value })}
            required
            className="p-2 border rounded"
          >
            <option value="">Select Store Owner</option>
            {storeOwners.map((owner) => (
              <option key={owner.id} value={owner.id}>
                {owner.name} ({owner.email})
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="sm:col-span-2 bg-green-600 text-white py-2 rounded hover:bg-green-700"
          >
            Add Store
          </button>
        </form>
      </div>
    </div>
  );
}
