import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, 
    Package, 
    Store, 
    Calendar, 
    Clock, 
    CheckCircle, 
    AlertCircle,
    Download,
    QrCode,
    Truck,
    MapPin
} from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { requestGetReturnableOrders, requestCreateReturnRequest, requestGetUserReturnRequests } from '../config/request';

const ReturnBooks = () => {
    const navigate = useNavigate();
    const { dataUser } = useStore();
    const [returnableOrders, setReturnableOrders] = useState([]);
    const [userReturnRequests, setUserReturnRequests] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [returnMethod, setReturnMethod] = useState('');
    const [selectedItems, setSelectedItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('returnable'); // 'returnable' or 'requests'

    useEffect(() => {
        if (!dataUser._id) {
            navigate('/login');
            return;
        }
        fetchReturnableOrders();
        fetchUserReturnRequests();
    }, [dataUser._id]);

    const fetchReturnableOrders = async () => {
        try {
            const response = await requestGetReturnableOrders();
            setReturnableOrders(response.metadata || []);
        } catch (error) {
            console.error('Error fetching returnable orders:', error);
        }
    };

    const fetchUserReturnRequests = async () => {
        try {
            const response = await requestGetUserReturnRequests();
            setUserReturnRequests(response.metadata || []);
        } catch (error) {
            console.error('Error fetching user return requests:', error);
        }
    };

    const handleOrderSelect = (order) => {
        setSelectedOrder(order);
        setSelectedItems(order.items.map(item => ({
            productId: item.productId._id,
            quantity: item.quantity,
            product: item.productId
        })));
    };

    const handleItemToggle = (item) => {
        setSelectedItems(prev => {
            const exists = prev.find(i => i.productId === item.productId._id);
            if (exists) {
                return prev.filter(i => i.productId !== item.productId._id);
            } else {
                return [...prev, {
                    productId: item.productId._id,
                    quantity: item.quantity,
                    product: item.productId
                }];
            }
        });
    };

    const handleCreateReturnRequest = async () => {
        if (!selectedOrder || !returnMethod || selectedItems.length === 0) {
            alert('Vui lòng chọn đơn thuê, phương thức trả và sách cần trả');
            return;
        }

        setLoading(true);
        try {
            const response = await requestCreateReturnRequest({
                rentalOrderId: selectedOrder._id,
                returnMethod,
                items: selectedItems
            });

            alert('Tạo yêu cầu trả sách thành công!');
            setSelectedOrder(null);
            setReturnMethod('');
            setSelectedItems([]);
            fetchUserReturnRequests();
            setActiveTab('requests');
        } catch (error) {
            console.error('Error creating return request:', error);
            alert('Có lỗi xảy ra khi tạo yêu cầu trả sách');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'text-yellow-600 bg-yellow-100';
            case 'approved': return 'text-blue-600 bg-blue-100';
            case 'shipped': return 'text-purple-600 bg-purple-100';
            case 'received': return 'text-indigo-600 bg-indigo-100';
            case 'inspected': return 'text-orange-600 bg-orange-100';
            case 'completed': return 'text-green-600 bg-green-100';
            case 'cancelled': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'pending': return 'Chờ duyệt';
            case 'approved': return 'Đã duyệt';
            case 'shipped': return 'Đã gửi';
            case 'received': return 'Đã nhận';
            case 'inspected': return 'Đang kiểm định';
            case 'completed': return 'Hoàn thành';
            case 'cancelled': return 'Đã hủy';
            default: return status;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Quay lại
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">Trả sách</h1>
                    <p className="text-gray-600 mt-2">Quản lý việc trả sách thuê của bạn</p>
                </div>

                {/* Tabs */}
                <div className="mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => setActiveTab('returnable')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'returnable'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                Đơn thuê có thể trả ({returnableOrders.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('requests')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'requests'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                Yêu cầu trả sách ({userReturnRequests.length})
                            </button>
                        </nav>
                    </div>
                </div>

                {activeTab === 'returnable' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Danh sách đơn thuê */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                <div className="p-6 border-b border-gray-200">
                                    <h2 className="text-lg font-semibold text-gray-900">Đơn thuê có thể trả</h2>
                                </div>
                                <div className="divide-y divide-gray-200">
                                    {returnableOrders.length === 0 ? (
                                        <div className="p-6 text-center text-gray-500">
                                            <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                            <p>Không có đơn thuê nào có thể trả</p>
                                        </div>
                                    ) : (
                                        returnableOrders.map((order) => (
                                            <div
                                                key={order._id}
                                                className={`p-6 cursor-pointer transition-colors ${
                                                    selectedOrder?._id === order._id
                                                        ? 'bg-blue-50 border-l-4 border-blue-500'
                                                        : 'hover:bg-gray-50'
                                                }`}
                                                onClick={() => handleOrderSelect(order)}
                                            >
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h3 className="font-medium text-gray-900">
                                                            Đơn thuê #{order._id.slice(-8)}
                                                        </h3>
                                                        <p className="text-sm text-gray-500">
                                                            {new Date(order.rentalStartDate).toLocaleDateString('vi-VN')} - {new Date(order.rentalEndDate).toLocaleDateString('vi-VN')}
                                                        </p>
                                                    </div>
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                        order.orderStatus === 'active' 
                                                            ? 'text-green-600 bg-green-100' 
                                                            : 'text-red-600 bg-red-100'
                                                    }`}>
                                                        {order.orderStatus === 'active' ? 'Đang thuê' : 'Quá hạn'}
                                                    </span>
                                                </div>
                                                <div className="space-y-2">
                                                    {order.items.map((item) => (
                                                        <div key={item.productId._id} className="flex items-center">
                                                            <img
                                                                src={item.productId.images[0]}
                                                                alt={item.productId.nameProduct}
                                                                className="w-10 h-10 rounded object-cover"
                                                            />
                                                            <div className="ml-3 flex-1">
                                                                <p className="text-sm font-medium text-gray-900">
                                                                    {item.productId.nameProduct}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    Số lượng: {item.quantity}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Form tạo yêu cầu trả */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-8">
                                <div className="p-6 border-b border-gray-200">
                                    <h2 className="text-lg font-semibold text-gray-900">Tạo yêu cầu trả sách</h2>
                                </div>
                                <div className="p-6 space-y-6">
                                    {selectedOrder ? (
                                        <>
                                            {/* Phương thức trả */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                                    Phương thức trả
                                                </label>
                                                <div className="space-y-3">
                                                    <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                                        <input
                                                            type="radio"
                                                            name="returnMethod"
                                                            value="shipping"
                                                            checked={returnMethod === 'shipping'}
                                                            onChange={(e) => setReturnMethod(e.target.value)}
                                                            className="mr-3"
                                                        />
                                                        <div className="flex items-center">
                                                            <Truck className="w-5 h-5 text-blue-600 mr-2" />
                                                            <div>
                                                                <p className="font-medium">Gửi bưu điện</p>
                                                                <p className="text-sm text-gray-500">Có nhãn trả trước</p>
                                                            </div>
                                                        </div>
                                                    </label>
                                                    <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                                        <input
                                                            type="radio"
                                                            name="returnMethod"
                                                            value="store_pickup"
                                                            checked={returnMethod === 'store_pickup'}
                                                            onChange={(e) => setReturnMethod(e.target.value)}
                                                            className="mr-3"
                                                        />
                                                        <div className="flex items-center">
                                                            <Store className="w-5 h-5 text-green-600 mr-2" />
                                                            <div>
                                                                <p className="font-medium">Trả tại cửa hàng</p>
                                                                <p className="text-sm text-gray-500">Quét QR code</p>
                                                            </div>
                                                        </div>
                                                    </label>
                                                </div>
                                            </div>

                                            {/* Danh sách sách được chọn */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                                    Sách cần trả
                                                </label>
                                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                                    {selectedOrder.items.map((item) => (
                                                        <label key={item.productId._id} className="flex items-center p-2 border border-gray-200 rounded cursor-pointer hover:bg-gray-50">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedItems.some(i => i.productId === item.productId._id)}
                                                                onChange={() => handleItemToggle(item)}
                                                                className="mr-3"
                                                            />
                                                            <img
                                                                src={item.productId.images[0]}
                                                                alt={item.productId.nameProduct}
                                                                className="w-8 h-8 rounded object-cover"
                                                            />
                                                            <div className="ml-2 flex-1">
                                                                <p className="text-sm font-medium text-gray-900">
                                                                    {item.productId.nameProduct}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    Số lượng: {item.quantity}
                                                                </p>
                                                            </div>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Thông tin hạn trả */}
                                            <div className="bg-blue-50 p-4 rounded-lg">
                                                <div className="flex items-center mb-2">
                                                    <Clock className="w-4 h-4 text-blue-600 mr-2" />
                                                    <span className="text-sm font-medium text-blue-900">Hạn trả</span>
                                                </div>
                                                <p className="text-sm text-blue-700">
                                                    {new Date(selectedOrder.returnWindow).toLocaleDateString('vi-VN')}
                                                </p>
                                            </div>

                                            <button
                                                onClick={handleCreateReturnRequest}
                                                disabled={loading || !returnMethod || selectedItems.length === 0}
                                                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                            >
                                                {loading ? 'Đang xử lý...' : 'Tạo yêu cầu trả sách'}
                                            </button>
                                        </>
                                    ) : (
                                        <div className="text-center text-gray-500 py-8">
                                            <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                            <p>Chọn đơn thuê để tạo yêu cầu trả sách</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'requests' && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Yêu cầu trả sách của bạn</h2>
                        </div>
                        <div className="divide-y divide-gray-200">
                            {userReturnRequests.length === 0 ? (
                                <div className="p-6 text-center text-gray-500">
                                    <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                    <p>Chưa có yêu cầu trả sách nào</p>
                                </div>
                            ) : (
                                userReturnRequests.map((request) => (
                                    <div key={request._id} className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="font-medium text-gray-900">
                                                    Mã RMA: {request.rmaNumber}
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    Tạo ngày: {new Date(request.createdAt).toLocaleDateString('vi-VN')}
                                                </p>
                                            </div>
                                            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(request.returnStatus)}`}>
                                                {getStatusText(request.returnStatus)}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Thông tin sách */}
                                            <div>
                                                <h4 className="font-medium text-gray-900 mb-3">Sách cần trả</h4>
                                                <div className="space-y-2">
                                                    {request.items.map((item) => (
                                                        <div key={item.productId._id} className="flex items-center p-2 bg-gray-50 rounded">
                                                            <img
                                                                src={item.productId.images[0]}
                                                                alt={item.productId.nameProduct}
                                                                className="w-10 h-10 rounded object-cover"
                                                            />
                                                            <div className="ml-3">
                                                                <p className="text-sm font-medium text-gray-900">
                                                                    {item.productId.nameProduct}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    Số lượng: {item.quantity}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Thông tin trả */}
                                            <div>
                                                <h4 className="font-medium text-gray-900 mb-3">Thông tin trả</h4>
                                                <div className="space-y-3">
                                                    <div className="flex items-center">
                                                        {request.returnMethod === 'shipping' ? (
                                                            <Truck className="w-4 h-4 text-blue-600 mr-2" />
                                                        ) : (
                                                            <Store className="w-4 h-4 text-green-600 mr-2" />
                                                        )}
                                                        <span className="text-sm text-gray-700">
                                                            {request.returnMethod === 'shipping' ? 'Gửi bưu điện' : 'Trả tại cửa hàng'}
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="flex items-center">
                                                        <Calendar className="w-4 h-4 text-gray-600 mr-2" />
                                                        <span className="text-sm text-gray-700">
                                                            Hạn trả: {new Date(request.returnDeadline).toLocaleDateString('vi-VN')}
                                                        </span>
                                                    </div>

                                                    {request.returnMethod === 'store_pickup' && request.pickupLocation && (
                                                        <div className="flex items-start">
                                                            <MapPin className="w-4 h-4 text-gray-600 mr-2 mt-0.5" />
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-900">
                                                                    {request.pickupLocation.storeName}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    {request.pickupLocation.address}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {request.additionalFees > 0 && (
                                                        <div className="bg-red-50 p-3 rounded">
                                                            <p className="text-sm font-medium text-red-900">
                                                                Phí phát sinh: {request.additionalFees.toLocaleString()} đ
                                                            </p>
                                                            <p className="text-xs text-red-700">
                                                                {request.feeDescription}
                                                            </p>
                                                        </div>
                                                    )}

                                                    {request.refundAmount > 0 && (
                                                        <div className="bg-green-50 p-3 rounded">
                                                            <p className="text-sm font-medium text-green-900">
                                                                Số tiền hoàn lại: {request.refundAmount.toLocaleString()} đ
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="mt-6 flex space-x-3">
                                            {request.returnMethod === 'shipping' && request.shippingLabel?.labelUrl && (
                                                <button className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                                                    <Download className="w-4 h-4 mr-2" />
                                                    Tải nhãn vận chuyển
                                                </button>
                                            )}
                                            
                                            {request.returnMethod === 'store_pickup' && request.pickupLocation?.qrCode && (
                                                <button className="flex items-center px-4 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                                                    <QrCode className="w-4 h-4 mr-2" />
                                                    Xem QR Code
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReturnBooks;
