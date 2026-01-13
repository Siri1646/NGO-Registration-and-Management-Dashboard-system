import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [donations, setDonations] = useState([]);
    const [stats, setStats] = useState({ userCount: 0 });
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        if (user && user.role !== 'admin') {
            navigate('/dashboard');
            return;
        }

        const fetchData = async () => {
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                };

                const usersRes = await axios.get('/api/admin/users', config);
                const statsRes = await axios.get('/api/admin/stats', config);
                const donationsRes = await axios.get('/api/donations/all', config);

                setUsers(usersRes.data);
                setStats(statsRes.data);
                setDonations(donationsRes.data);
                setLoading(false);

            } catch (error) {
                console.error('Error fetching admin data', error);
                setLoading(false);
            }
        };

        if (user) {
            fetchData();
        }
    }, [user, navigate]);

    const handleExport = () => {
        const csvContent = "data:text/csv;charset=utf-8,"
            + "Name,Email,Role,Phone,Address\n"
            + users.map(u => `${u.name},${u.email},${u.role},${u.phone || ''},${u.address || ''}`).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "ngo_users.csv");
        document.body.appendChild(link);
        link.click();
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(filter.toLowerCase()) ||
        u.email.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <Layout>
            <h1 className="text-2xl font-bold mb-6 text-white">Admin Dashboard</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-blue-500 text-white">
                    <p className="text-gray-400 font-semibold">Total Users</p>
                    <p className="text-2xl font-bold">{stats.userCount}</p>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-green-500 text-white">
                    <p className="text-gray-400 font-semibold">Total Donations</p>
                    <p className="text-2xl font-bold">₹{donations.reduce((acc, curr) => acc + (curr.status === 'success' ? curr.amount : 0), 0)}</p>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-yellow-500 text-white">
                    <p className="text-gray-400 font-semibold">Total Transactions</p>
                    <p className="text-2xl font-bold">{donations.length}</p>
                </div>
            </div>

            {/* Recent Donations */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-8 border border-gray-700">
                <h2 className="text-xl font-bold mb-4 text-white border-b border-gray-600 pb-2">Recent Donations</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full leading-normal">
                        <thead>
                            <tr>
                                <th className="px-5 py-3 border-b-2 border-gray-600 bg-gray-700 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-5 py-3 border-b-2 border-gray-600 bg-gray-700 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-5 py-3 border-b-2 border-gray-600 bg-gray-700 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-5 py-3 border-b-2 border-gray-600 bg-gray-700 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {donations.map((donation) => (
                                <tr key={donation._id}>
                                    <td className="px-5 py-5 border-b border-gray-600 bg-gray-800 text-sm text-gray-300">
                                        {new Date(donation.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-600 bg-gray-800 text-sm text-gray-300">
                                        {donation.user ? donation.user.name : 'Unknown'}
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-600 bg-gray-800 text-sm font-semibold text-gray-300">
                                        ₹{donation.amount}
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-600 bg-gray-800 text-sm">
                                        <span className={`relative inline-block px-3 py-1 font-semibold leading-tight 
                                            ${donation.status === 'success' ? 'text-green-200' :
                                                donation.status === 'pending' ? 'text-yellow-200' : 'text-red-200'}`}>
                                            <span aria-hidden className={`absolute inset-0 opacity-20 rounded-full 
                                                ${donation.status === 'success' ? 'bg-green-600' :
                                                    donation.status === 'pending' ? 'bg-yellow-600' : 'bg-red-600'}`}>
                                            </span>
                                            <span className="relative capitalize">{donation.status}</span>
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* All Users */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
                <div className="flex justify-between items-center mb-4 border-b border-gray-600 pb-2">
                    <h2 className="text-xl font-bold text-white">Registered Users</h2>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Filter by name/email..."
                            className="px-3 py-1 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        />
                        <button
                            onClick={handleExport}
                            className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700 transition"
                        >
                            Export CSV
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full leading-normal">
                        <thead>
                            <tr>
                                <th className="px-5 py-3 border-b-2 border-gray-600 bg-gray-700 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                    Name
                                </th>
                                <th className="px-5 py-3 border-b-2 border-gray-600 bg-gray-700 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-5 py-3 border-b-2 border-gray-600 bg-gray-700 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                    Role
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((u) => (
                                <tr key={u._id}>
                                    <td className="px-5 py-5 border-b border-gray-600 bg-gray-800 text-sm text-gray-300">
                                        {u.name}
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-600 bg-gray-800 text-sm text-gray-300">
                                        {u.email}
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-600 bg-gray-800 text-sm text-gray-300">
                                        {u.role}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
};

export default AdminDashboard;
