import React from 'react';
import Navbar from './Navbar';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-900 text-gray-100">
            <Navbar />
            <main className="max-w-6xl mx-auto mt-6 px-4">
                {children}
            </main>
        </div>
    );
};

export default Layout;
