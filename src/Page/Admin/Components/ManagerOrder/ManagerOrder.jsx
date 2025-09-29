import React, { useState, useEffect } from 'react';
import { Table, Tag, Space, Button, Modal, Descriptions, Select, Image, message, DatePicker, Row, Col } from 'antd';
import classNames from 'classnames/bind';
import styles from './ManagerOrder.module.scss';
import { requestGetPaymentsAdmin, requestUpdateOrderStatus } from '../../../../config/request';
import { EyeOutlined } from '@ant-design/icons';


import dayjs from 'dayjs';

const cx = classNames.bind(styles);
const { RangePicker } = DatePicker;

import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"

function ManagerOrder() {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateRange, setDateRange] = useState(null);

    // Fetch orders data when component mounts
    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await requestGetPaymentsAdmin();
            setOrders(response.metadata);
        } catch (error) {
            console.error('Error fetching orders:', error);
            message.error('Lỗi khi tải danh sách đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (record) => {
        setSelectedOrder(record);
        setIsModalVisible(true);
    };

    const handleStatusChange = async (newStatus, record) => {
        try {
            const data = {
                id: record._id,
                status: newStatus,
            };
            await requestUpdateOrderStatus(data);
            message.success('Cập nhật trạng thái thành công');
            fetchOrders();
        } catch (error) {
            console.error('Error updating status:', error);
            message.error('Lỗi khi cập nhật trạng thái');
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'gold',
            completed: 'blue',
            delivered: 'green',
            returned: 'purple',
            cancelled: 'red',
        };
        return colors[status.toLowerCase()];
    };

    const getStatusText = (status) => {
        const statusText = {
            pending: 'Chờ xử lý',
            completed: 'Đã xử lý',
            return_requested: 'Yêu cầu trả sách',
            delivered: 'Đã giao hàng',
            returned: 'Đã trả sách',
            cancelled: 'Đã hủy',
            return_requested: 'orange',
        };
        return statusText[status.toLowerCase()];
    };

    const handleFilterChange = (type, value) => {
        if (type === 'status') {
            setStatusFilter(value);
        } else if (type === 'date') {
            setDateRange(value);
        }
    };

    const getFilteredOrders = () => {
        let filteredOrders = [...orders];

        // Filter by status
        if (statusFilter !== 'all') {
            filteredOrders = filteredOrders.filter((order) => order.status === statusFilter);
        }

        // Filter by date range
        if (dateRange && dateRange[0] && dateRange[1]) {
            const startDate = dateRange[0].startOf('day');
            const endDate = dateRange[1].endOf('day');
            filteredOrders = filteredOrders.filter((order) => {
                const orderDate = dayjs(order.createdAt);
                return orderDate.isAfter(startDate) && orderDate.isBefore(endDate);
            });
        }

        return filteredOrders;
    };

    const columns = [
        {
            title: 'Mã đơn hàng',
            dataIndex: '_id',
            key: '_id',
            width: '15%',
        },
        {
            title: 'Khách hàng',
            dataIndex: 'fullName',
            key: 'fullName',
            width: '15%',
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phone',
            key: 'phone',
            width: '12%',
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'totalPrice',
            key: 'totalPrice',
            width: '12%',
            align: 'right',
            render: (price) => <span className={cx('price')}>{price.toLocaleString('vi-VN')}đ</span>,
        },
        {
            title: 'Trạng thái',
            key: 'status',
            dataIndex: 'status',
            width: '15%',
            render: (status, record) => (
                <Select
                    value={status}
                    style={{ width: 140 }}
                    onChange={(newStatus) => handleStatusChange(newStatus, record)}
                    className={cx('status-select')}
                >
                    <Select.Option value="pending">
                        <Tag color="gold">Chờ xử lý</Tag>
                    </Select.Option>
                    <Select.Option value="completed">
                        <Tag color="blue">Đã xử lý</Tag>
                    </Select.Option>
                    <Select.Option value="delivered">
                        <Tag color="green">Đã giao hàng</Tag>
                    </Select.Option>
                    <Select.Option value="returned">
                        <Tag color="purple">Đã trả sách</Tag>
                    </Select.Option>
                    <Select.Option value="cancelled">
                        <Tag color="red">Đã hủy</Tag>
                    </Select.Option>
                    <Select.Option value="return_requested">
                        <Tag color="orange">Yêu cầu trả sách</Tag>
                    </Select.Option>
                </Select>
            ),
        },
        // {
        //     title: 'Phương thức thanh toán',
        //     dataIndex: 'paymentMethod',
        //     key: 'paymentMethod',
        //     width: '12%',
        // },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: '15%',
            render: (text) => new Date(text).toLocaleString('vi-VN')
        },
        {
            title: 'Ngày cập nhật',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            width: '15%',
            render: (text) => new Date(text).toLocaleString('vi-VN')
        },

        {
            title: 'Quản lý',
            key: 'action',
            width: '10%',
            align: 'center',
            render: (_, record) => (

                <Space size="middle">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <EyeOutlined
                                className="text-[18px] !text-blue-500"
                                onClick={() => handleViewDetails(record)}
                            />
                        </TooltipTrigger>
                        <TooltipContent>
                            Chi tiết
                        </TooltipContent>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div className={cx('wrapper')}>
            <div className={cx('header')}>
                <h2 className={cx('title')}>Quản lý đơn hàng</h2>
            </div>

            <div className={cx('filters')}>
                <Row gutter={16}>
                    <Col span={8}>
                        <Select
                            style={{ width: '100%' }}
                            placeholder="Lọc theo trạng thái"
                            value={statusFilter}
                            onChange={(value) => handleFilterChange('status', value)}
                        >
                            <Select.Option value="all">Tất cả trạng thái</Select.Option>
                            <Select.Option value="pending">Chờ xử lý</Select.Option>
                            <Select.Option value="return_requested">Đã xử lý</Select.Option>
                            <Select.Option value="delivered">Đã giao hàng</Select.Option>
                            <Select.Option value="returned">Đã trả sách</Select.Option>
                            <Select.Option value="cancelled">Đã hủy</Select.Option>
                            <Select.Option value="return_requested">Yêu cầu trả sách</Select.Option>
                        </Select>
                    </Col>
                    <Col span={8}>
                        <RangePicker
                            style={{ width: '100%' }}
                            placeholder={['Từ ngày', 'Đến ngày']}
                            value={dateRange}
                            onChange={(value) => handleFilterChange('date', value)}
                            format="DD/MM/YYYY"
                        />
                    </Col>
                </Row>
            </div>

            <div className={cx('content')}>
                <Table
                    columns={columns}
                    dataSource={getFilteredOrders()}
                    rowKey="_id"
                    pagination={{
                        showTotal: (total, range) => `Hiện ${range[0]} trên ${total} mục`,
                        pageSize: 10,
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50', '100'],
                        position: ['bottomRight'],
                    }}
                    loading={loading}
                    scroll={{ x: 'max-content' }}
                />
            </div>

            <Modal
                title={<div className={cx('modal-title')}>Chi tiết đơn hàng</div>}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={700}
                className={cx('order-modal')}
            >
                {selectedOrder && (
                    <Descriptions bordered column={1}>
                        <Descriptions.Item label="Mã đơn hàng">{selectedOrder._id}</Descriptions.Item>
                        <Descriptions.Item label="Sản phẩm">
                            <Space direction="vertical" className={cx('products-list')}>
                                {selectedOrder.products.map((product, index) => (
                                    <Space key={index} direction="vertical" className={cx('product-detail-item')}>
                                        <Image
                                            src={product.product.images[0]}
                                            alt={product.product.nameProduct}
                                            width={100}
                                            height={100}
                                            style={{ objectFit: 'cover' }}
                                        />
                                        <div>{product.product.nameProduct}</div>
                                        <div>Số lượng: {product.quantity}</div>
                                        <div>Giá: {product.product.price.toLocaleString('vi-VN')}đ</div>
                                    </Space>
                                ))}
                            </Space>
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày đặt hàng">
                            {dayjs(selectedOrder.createdAt).format('HH:mm DD/MM/YYYY')}
                        </Descriptions.Item>
                        <Descriptions.Item label="Khách hàng">{selectedOrder.fullName}</Descriptions.Item>
                        <Descriptions.Item label="Số điện thoại">{selectedOrder.phone}</Descriptions.Item>
                        <Descriptions.Item label="Địa chỉ">{selectedOrder.address}</Descriptions.Item>
                        <Descriptions.Item label="Tổng tiền">
                            {selectedOrder.totalPrice.toLocaleString('vi-VN')}đ
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">
                            <Tag color={getStatusColor(selectedOrder.status)}>
                                {getStatusText(selectedOrder.status)}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Phương thức thanh toán">
                            {selectedOrder.paymentMethod}
                        </Descriptions.Item>
                        {selectedOrder.status === 'returned' && (
                            <>
                                <Descriptions.Item label="Lý do trả sách">
                                    {selectedOrder.returnReason || 'Không có lý do'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Ngày yêu cầu trả sách">
                                    {selectedOrder.returnRequestDate ? dayjs(selectedOrder.returnRequestDate).format('HH:mm DD/MM/YYYY') : 'Không có'}
                                </Descriptions.Item>
                            </>
                        )}
                    </Descriptions>
                )}
            </Modal>
        </div>
    );
}

export default ManagerOrder;
