import React, { useState } from 'react';

const PaymentModal = ({ order, onSuccess, onFailure, onClose }) => {
    const [processing, setProcessing] = useState(false);

    const handlePayment = async (status) => {
        setProcessing(true);
        // Simulate network delay of a real gateway
        setTimeout(() => {
            setProcessing(false);
            if (status === 'success') {
                onSuccess();
            } else {
                onFailure();
            }
        }, 2000);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-8 max-w-md w-full border border-gray-700 transform transition-all scale-100">
                <div className="flex justify-between items-center mb-6 border-b border-gray-600 pb-4">
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <span>💳</span> Secure Payment
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xl font-bold">
                        &times;
                    </button>
                </div>

                <div className="space-y-4 mb-8">
                    <div className="flex justify-between text-gray-600 dark:text-gray-300">
                        <span>Merchant:</span>
                        <span className="font-semibold">NGO Donation</span>
                    </div>
                    <div className="flex justify-between text-gray-600 dark:text-gray-300">
                        <span>Order ID:</span>
                        <span className="font-mono text-sm">{order.id}</span>
                    </div>
                    <div className="flex justify-between items-center text-lg font-bold text-gray-800 dark:text-white pt-4 border-t border-gray-600">
                        <span>Total Amount:</span>
                        <span className="text-2xl text-green-600 dark:text-green-400">₹{order.amount / 100}</span>
                    </div>
                </div>

                {processing ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-gray-600 dark:text-gray-300 animate-pulse">Processing Transaction...</p>
                    </div>
                ) : (
                    <div className="flex gap-4 flex-col">
                        <button
                            onClick={() => handlePayment('success')}
                            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition duration-300 font-bold shadow-lg flex justify-center items-center gap-2"
                        >
                            <span>✅</span> Simulate Successful Payment
                        </button>
                        <button
                            onClick={() => handlePayment('failed')}
                            className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition duration-300 font-bold shadow-lg flex justify-center items-center gap-2"
                        >
                            <span>❌</span> Simulate Failure / Cancel
                        </button>
                    </div>
                )}

                <p className="mt-6 text-xs text-center text-gray-500 dark:text-gray-400">
                    This is a secure sandbox environment. No real money is deducted.
                </p>
            </div>
        </div>
    );
};

export default PaymentModal;
