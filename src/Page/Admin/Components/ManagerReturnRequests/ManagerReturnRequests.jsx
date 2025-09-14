import React, { useState, useEffect } from 'react';
import {
    Package,
    Search,
    Filter,
    Eye,
    Edit,
    CheckCircle,
    XCircle,
    Truck,
    Store,
    Calendar,
    Clock,
    AlertCircle
} from 'lucide-react';
import { requestGetAllReturnRequests, requestUpdateReturnStatus } from '../../../../config/request';

const ManagerReturnRequests = () => {
    const [returnRequests, setReturnRequests] = useState([]);
    const [filteredRequests, setFilteredRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [updateForm, setUpdateForm] = useState({
        returnStatus: '',
        inspectionNotes: '',
        additionalFees: 0,
        feeDescription: ''
    });

    useEffect(() => {
        fetchReturnRequests();
    }, []);

    useEffect(() => {
        filterRequests();
    }, [returnRequests, searchTerm, statusFilter]);

    const fetchReturnRequests = async () => {
        setLoading(true);
        try {
            const response = await requestGetAllReturnRequests();
            setReturnRequests(response.metadata || []);
        } catch (error) {
            console.error('Error fetching return requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterRequests = () => {
        let filtered = returnRequests;

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(request =>
                request.rmaNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                request.userId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                request.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by status
        if (statusFilter !== 'all') {
            filtered = filtered.filter(request => request.returnStatus === statusFilter);
        }

        setFilteredRequests(filtered);
    };

    const handleViewDetail = (request) => {
        setSelectedRequest(request);
        setShowDetailModal(true);
    };

    const handleUpdateStatus = (request) => {
        setSelectedRequest(request);
        setUpdateForm({
            returnStatus: request.returnStatus,
            inspectionNotes: request.inspectionNotes || '',
            additionalFees: request.additionalFees || 0,
            feeDescription: request.feeDescription || ''
        });
        setShowUpdateModal(true);
    };

    const handleSubmitUpdate = async () => {
        try {
            await requestUpdateReturnStatus(selectedRequest.rmaNumber, updateForm);
            alert('Cập nhật trạng thái thành công!');
            setShowUpdateModal(false);
            fetchReturnRequests();
        } catch (error) {
            console.error('Error updating return status:', error);
            alert('Có lỗi xảy ra khi cập nhật trạng thái');
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
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý yêu cầu trả sách</h1>
                <p className="text-gray-600">Theo dõi và xử lý các yêu cầu trả sách từ khách hàng</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Tìm theo RMA, tên khách hàng..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="pending">Chờ duyệt</option>
                            <option value="approved">Đã duyệt</option>
                            <option value="shipped">Đã gửi</option>
                            <option value="received">Đã nhận</option>
                            <option value="inspected">Đang kiểm định</option>
                            <option value="completed">Hoàn thành</option>
                            <option value="cancelled">Đã hủy</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={fetchReturnRequests}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Làm mới
                        </button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Mã RMA
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Khách hàng
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Phương thức
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Trạng thái
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ngày tạo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Hạn trả
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Quản lý
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                                        Đang tải...
                                    </td>
                                </tr>
                            ) : filteredRequests.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                                        Không có yêu cầu trả sách nào
                                    </td>
                                </tr>
                            ) : (
                                filteredRequests.map((request) => (
                                    <tr key={request._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {request.rmaNumber}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {request.userId?.fullName || 'N/A'}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {request.userId?.email || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {request.returnMethod === 'shipping' ? (
                                                    <Truck className="w-4 h-4 text-blue-600 mr-2" />
                                                ) : (
                                                    <Store className="w-4 h-4 text-green-600 mr-2" />
                                                )}
                                                <span className="text-sm text-gray-900">
                                                    {request.returnMethod === 'shipping' ? 'Gửi bưu điện' : 'Trả tại cửa hàng'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.returnStatus)}`}>
                                                {getStatusText(request.returnStatus)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(request.createdAt).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(request.returnDeadline).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    onClick={() => handleViewDetail(request)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateStatus(request)}
                                                    className="text-green-600 hover:text-green-900"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detail Modal */}
            {showDetailModal && selectedRequest && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Chi tiết yêu cầu trả sách
                                </h2>
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="font-medium text-gray-900 mb-3">Thông tin cơ bản</h3>
                                    <div className="space-y-2">
                                        <p><span className="font-medium">Mã RMA:</span> {selectedRequest.rmaNumber}</p>
                                        <p><span className="font-medium">Khách hàng:</span> {selectedRequest.userId?.fullName}</p>
                                        <p><span className="font-medium">Email:</span> {selectedRequest.userId?.email}</p>
                                        <p><span className="font-medium">Phương thức:</span> {selectedRequest.returnMethod === 'shipping' ? 'Gửi bưu điện' : 'Trả tại cửa hàng'}</p>
                                        <p><span className="font-medium">Trạng thái:</span> {getStatusText(selectedRequest.returnStatus)}</p>
                                        <p><span className="font-medium">Ngày tạo:</span> {new Date(selectedRequest.createdAt).toLocaleDateString('vi-VN')}</p>
                                        <p><span className="font-medium">Hạn trả:</span> {new Date(selectedRequest.returnDeadline).toLocaleDateString('vi-VN')}</p>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-900 mb-3">Sách cần trả</h3>
                                    <div className="space-y-2">
                                        {selectedRequest.items?.map((item) => (
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
                            </div>

                            {selectedRequest.inspectionNotes && (
                                <div className="mt-6">
                                    <h3 className="font-medium text-gray-900 mb-2">Ghi chú kiểm định</h3>
                                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                                        {selectedRequest.inspectionNotes}
                                    </p>
                                </div>
                            )}

                            {selectedRequest.additionalFees > 0 && (
                                <div className="mt-6">
                                    <h3 className="font-medium text-gray-900 mb-2">Phí phát sinh</h3>
                                    <div className="bg-red-50 p-3 rounded">
                                        <p className="text-sm font-medium text-red-900">
                                            {selectedRequest.additionalFees.toLocaleString()} đ
                                        </p>
                                        <p className="text-xs text-red-700">
                                            {selectedRequest.feeDescription}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {selectedRequest.refundAmount > 0 && (
                                <div className="mt-6">
                                    <h3 className="font-medium text-gray-900 mb-2">Số tiền hoàn lại</h3>
                                    <div className="bg-green-50 p-3 rounded">
                                        <p className="text-sm font-medium text-green-900">
                                            {selectedRequest.refundAmount.toLocaleString()} đ
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Update Modal */}
            {showUpdateModal && selectedRequest && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg max-w-md w-full mx-4">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900">
                                Cập nhật trạng thái
                            </h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Trạng thái mới
                                </label>
                                <select
                                    value={updateForm.returnStatus}
                                    onChange={(e) => setUpdateForm({ ...updateForm, returnStatus: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="pending">Chờ duyệt</option>
                                    <option value="approved">Đã duyệt</option>
                                    <option value="shipped">Đã gửi</option>
                                    <option value="received">Đã nhận</option>
                                    <option value="inspected">Đang kiểm định</option>
                                    <option value="completed">Hoàn thành</option>
                                    <option value="cancelled">Đã hủy</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Ghi chú kiểm định
                                </label>
                                <textarea
                                    value={updateForm.inspectionNotes}
                                    onChange={(e) => setUpdateForm({ ...updateForm, inspectionNotes: e.target.value })}
                                    rows="3"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Nhập ghi chú kiểm định..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phí phát sinh (đ)
                                </label>
                                <input
                                    type="number"
                                    value={updateForm.additionalFees}
                                    onChange={(e) => setUpdateForm({ ...updateForm, additionalFees: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="0"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mô tả phí phát sinh
                                </label>
                                <input
                                    type="text"
                                    value={updateForm.feeDescription}
                                    onChange={(e) => setUpdateForm({ ...updateForm, feeDescription: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Lý do phí phát sinh..."
                                />
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                            <button
                                onClick={() => setShowUpdateModal(false)}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleSubmitUpdate}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Cập nhật
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagerReturnRequests;
