import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';

const UserDashboard = () => {
    const { user } = useAuth();
    const [donations, setDonations] = useState([]);
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(true);

    const [currentOrder, setCurrentOrder] = useState(null);

    const fetchDonations = async () => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.get('/api/donations/my', config);
            setDonations(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching donations', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchDonations();
        }
    }, [user]);

    const handleDonation = async (e) => {
        e.preventDefault();
        if (!amount || amount <= 0) return alert('Please enter a valid amount');

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            // 1. Create Order (Pending Donation)
            const { data: orderData } = await axios.post('/api/donations/create-order', { amount }, config);

            // 2. Open Razorpay Modal (Sandbox Mode)
            const options = {
                key: 'rzp_test_12345678901234', // Sandbox/Test Key
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'NGO Donation',
                description: 'Support our cause',
                order_id: orderData.id,
                handler: async function (response) {
                    // Verify payment on server
                    try {
                        const verifyData = {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            donationId: orderData.donationId,
                        };
                        const verifyRes = await axios.post('/api/donations/verify', verifyData, config);
                        if (verifyRes.data.success) {
                            alert('Payment Successful!');
                            fetchDonations();
                            setAmount('');
                        } else {
                            alert('Payment verification failed on server.');
                        }
                    } catch (err) {
                        console.error('Verification error', err);
                        alert('Payment verification failed.');
                    }
                },
                prefill: {
                    name: user.name,
                    email: user.email,
                    contact: user.phone,
                },
                theme: {
                    color: '#3399cc',
                },
                modal: {
                    ondismiss: async function () {
                        // Mark as failed/cancelled
                        try {
                            await axios.post('/api/donations/fail', { donationId: orderData.donationId }, config);
                            fetchDonations();
                            alert('Payment Cancelled/Failed');
                        } catch (e) {
                            console.error('Error marking payment as failed', e);
                        }
                    },
                },
            };
            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error) {
            console.error('Donation initiation failed', error);
            alert('Could not initiate donation. Please try again.');
        }
    };

    // The success and failure flows are now handled directly in the Razorpay handler above.
    // Keeping these functions for compatibility but they simply close the modal if it were used.
    const handlePaymentSuccess = async () => {
        // No-op – success handled in Razorpay handler
    };

    const handlePaymentFailure = async () => {
        // No-op – failure handled in Razorpay modal ondismiss above
    };

    const handleModalClose = () => {
        // No custom modal, nothing to close.
    };

    return (
        <Layout>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Profile Section */}
                <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700 text-gray-100">
                    <h2 className="text-xl font-bold mb-4 text-white border-b border-gray-600 pb-2">My Profile</h2>
                    <div className="space-y-2">
                        <p><span className="font-semibold text-gray-300">Name:</span> {user?.name}</p>
                        <p><span className="font-semibold text-gray-300">Email:</span> {user?.email}</p>
                        <p><span className="font-semibold text-gray-300">Phone:</span> {user?.phone || 'N/A'}</p>
                        <p><span className="font-semibold text-gray-300">Address:</span> {user?.address || 'N/A'}</p>
                    </div>
                </div>

                {/* Donate Section */}
                <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
                    <h2 className="text-xl font-bold mb-4 text-white border-b border-gray-600 pb-2">Make a Donation</h2>
                    <form onSubmit={handleDonation}>
                        <div className="mb-4">
                            <label className="block text-gray-300 text-sm font-bold mb-2">Amount (INR)</label>
                            <input
                                type="number"
                                className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="Enter amount to donate"
                                min="1"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-500 transition duration-300 font-semibold"
                        >
                            Donate Now
                        </button>
                    </form>
                </div>
            </div>

            {/* Donation History */}
            <div className="mt-8 bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
                <h2 className="text-xl font-bold mb-4 text-white border-b border-gray-600 pb-2">Donation History</h2>
                {loading ? (
                    <p className="text-gray-400">Loading history...</p>
                ) : donations.length === 0 ? (
                    <p className="text-gray-400">No donations yet.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full leading-normal">
                            <thead>
                                <tr>
                                    <th className="px-5 py-3 border-b-2 border-gray-600 bg-gray-700 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-5 py-3 border-b-2 border-gray-600 bg-gray-700 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-5 py-3 border-b-2 border-gray-600 bg-gray-700 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-5 py-3 border-b-2 border-gray-600 bg-gray-700 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                        Payment ID
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {donations.map((donation) => (
                                    <tr key={donation._id}>
                                        <td className="px-5 py-5 border-b border-gray-600 bg-gray-800 text-sm text-gray-300">
                                            {new Date(donation.createdAt).toLocaleDateString()}
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
                                        <td className="px-5 py-5 border-b border-gray-600 bg-gray-800 text-sm text-gray-400">
                                            {donation.paymentId || '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

        </Layout>
    );
};

export default UserDashboard;
