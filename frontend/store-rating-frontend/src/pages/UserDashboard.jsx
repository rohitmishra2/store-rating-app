import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../auth/useAuth';
import { useNavigate } from 'react-router-dom';

export default function UserDashboard() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  const [stores, setStores] = useState([]);
  const [filters, setFilters] = useState({ name: '', address: '' });
  const [ratings, setRatings] = useState({}); // store_id: rating
  const [message, setMessage] = useState(null);

  const fetchStores = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/stores', {
        headers: { Authorization: `Bearer ${auth.token}` },
        params: filters,
      });
      setStores(res.data.stores);
    } catch (err) {
      console.error(err);
      logout();
      navigate('/');
    }
  };

  const fetchMyRatings = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/ratings/my', {
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      const ratingMap = {};
      res.data.ratings.forEach((r) => {
        ratingMap[r.store_id] = r.rating;
      });

      setRatings(ratingMap);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleRate = async (store_id, rating) => {
    try {
      const res = await axios.post(
        `http://localhost:5000/api/ratings`,
        { store_id, rating },
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      setMessage({ type: 'success', text: res.data.message });
      setRatings({ ...ratings, [store_id]: rating });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Rating failed',
      });
    }
  };

  useEffect(() => {
    fetchStores();
    fetchMyRatings();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-purple-700">User Dashboard</h1>
        <button
          onClick={logout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {/* Feedback Message */}
      {message && (
        <div
          className={`mb-4 p-3 rounded ${
            message.type === 'success'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Search Filters */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          fetchStores();
        }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6"
      >
        <input
          type="text"
          name="name"
          placeholder="Search by Name"
          value={filters.name}
          onChange={handleFilterChange}
          className="p-2 border border-gray-300 rounded"
        />
        <input
          type="text"
          name="address"
          placeholder="Search by Address"
          value={filters.address}
          onChange={handleFilterChange}
          className="p-2 border border-gray-300 rounded"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Search
        </button>
      </form>

      {/* Store List */}
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Stores</h2>

        {stores.length === 0 ? (
          <p className="text-gray-500">No stores found.</p>
        ) : (
          <div className="space-y-4">
            {stores.map((store) => (
              <div
                key={store.id}
                className="border rounded p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {store.name}
                  </h3>
                  <p className="text-gray-500">{store.address}</p>
                  <p className="text-yellow-600">
                    ⭐ Avg Rating: {store.avg_rating || 0}
                  </p>
                  <p className="text-blue-600">
                    Your Rating:{' '}
                    {ratings[store.id] ? `${ratings[store.id]} ⭐` : 'Not Rated'}
                  </p>
                </div>

                <div className="flex gap-2 mt-4 sm:mt-0">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRate(store.id, star)}
                      className={`px-3 py-1 rounded text-white ${
                        ratings[store.id] === star
                          ? 'bg-green-600'
                          : 'bg-gray-400 hover:bg-gray-500'
                      }`}
                    >
                      {star}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
