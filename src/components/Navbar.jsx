import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-gray-800 shadow-lg border-b border-gray-700">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex justify-between">
                    <div className="flex space-x-7">
                        <div>
                            <Link to="/" className="flex items-center py-4 px-2">
                                <span className="font-semibold text-white text-lg">NGO Donation</span>
                            </Link>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center space-x-3 ">
                        {user ? (
                            <>
                                <span className="py-2 px-2 font-medium text-gray-300">Hello, {user.name}</span>
                                {user.role === 'admin' ? (
                                    <Link to="/admin" className="py-2 px-2 font-medium text-gray-300 hover:text-green-400 transition duration-300">Admin Dashboard</Link>
                                ) : (
                                    <Link to="/dashboard" className="py-2 px-2 font-medium text-gray-300 hover:text-green-400 transition duration-300">Dashboard</Link>
                                )}
                                <button onClick={handleLogout} className="py-2 px-2 font-medium text-white bg-red-600 rounded hover:bg-red-500 transition duration-300">Log Out</button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="py-2 px-2 font-medium text-gray-300 hover:text-green-400 transition duration-300">Log In</Link>
                                <Link to="/register" className="py-2 px-2 font-medium text-white bg-green-600 rounded hover:bg-green-500 transition duration-300">Sign Up</Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
