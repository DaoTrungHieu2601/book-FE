import React, { useState, useEffect } from 'react';
import {
    Checkbox,
    Button,
    InputNumber,
    Card,
    Row,
    Col,
    Divider,
    Empty,
    Badge,
    Tooltip,
    message
} from 'antd';
import {
    DeleteOutlined,
    GiftOutlined,
    ShoppingCartOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';

import Header from '../Components/Header/Header';
import { useStore } from '../hooks/useStore';
import { requestDeleteItem, requestUpdateQuantity } from '../config/request';

function CartUser() {
    const { dataCart, fetchCart } = useStore();

    const [selectedItems, setSelectedItems] = useState([]);

    useEffect(() => {
        setSelectedItems([]);
    }, [dataCart]);

    const updateQuantity = async (id, quantity) => {
        try {
            await requestUpdateQuantity({ productId: id, quantity });
            fetchCart();
        } catch (error) {
            message.error('Cập nhật số lượng thất bại');
        }
    };

    const removeItem = async (id) => {
        try {
            await requestDeleteItem({ productId: id });
            message.success('Xóa sản phẩm thành công');
            fetchCart();
        } catch (error) {
            message.error('Xóa sản phẩm thất bại');
        }
    };

    // tính tiền thuê theo số ngày
    const calcItemTotal = (item) => {
        const rentalDays = dayjs(item.endDate).diff(dayjs(item.startDate), 'day') + 1;
        return item.product.price * item.quantity * rentalDays;
    };

    // tính tổng thanh toán chỉ cho sản phẩm đã chọn
    const totalPrice = dataCart
        ?.filter((item) => selectedItems.includes(item._id))
        .reduce((sum, item) => sum + calcItemTotal(item), 0) || 0;

    return (
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
            <Header />

            <main className="w-[90%] mx-auto py-6 px-4">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <ShoppingCartOutlined className="text-2xl text-blue-600" />
                    <h1 className="text-2xl font-bold text-gray-800">Giỏ hàng của bạn</h1>
                    <Badge count={dataCart?.length || 0} className="ml-2" />
                </div>

                <Row gutter={24}>
                    {/* Danh sách sản phẩm */}
                    <Col xs={24} lg={16}>
                        <Card className="shadow-md rounded-xl border-0" bodyStyle={{ padding: '24px' }}>
                            {dataCart?.length === 0 ? (
                                <Empty description="Giỏ hàng trống" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                            ) : (
                                <div className="space-y-6">
                                    {dataCart?.map((item) => {
                                        const rentalDays = dayjs(item.endDate).diff(dayjs(item.startDate), 'day') + 1;
                                        const itemTotal = calcItemTotal(item);

                                        return (
                                            <div
                                                key={item._id}
                                                className="border border-gray-100 rounded-xl p-6 hover:shadow-md transition-all duration-200 bg-white"
                                            >
                                                <Row align="middle" gutter={16}>
                                                    {/* Checkbox */}
                                                    <Col flex="40px">
                                                        <Checkbox
                                                            checked={selectedItems.includes(item._id)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setSelectedItems([...selectedItems, item._id]);
                                                                } else {
                                                                    setSelectedItems(selectedItems.filter((id) => id !== item._id));
                                                                }
                                                            }}
                                                        />
                                                    </Col>

                                                    {/* Ảnh sản phẩm */}
                                                    <Col flex="80px">
                                                        <img
                                                            src={item.product.images[0]}
                                                            alt={item.product.nameProduct}
                                                            className="w-20 h-26 object-cover rounded-lg shadow-sm"
                                                            onError={(e) => {
                                                                e.target.src =
                                                                    'https://via.placeholder.com/80x104/f0f0f0/666666?text=No+Image';
                                                            }}
                                                        />
                                                    </Col>

                                                    {/* Thông tin sản phẩm */}
                                                    <Col flex="1">
                                                        <div className="space-y-2">
                                                            <h3 className="font-semibold text-gray-800 leading-tight line-clamp-2">
                                                                {item.product.nameProduct}
                                                            </h3>
                                                            <div className="text-sm text-gray-500 flex flex-col gap-1">
                                                                <span>Công ty phát hành: {item.product.publisher}</span>
                                                                <span>NXB: {item.product.publishingHouse}</span>
                                                                <span>Ngày thuê: {dayjs(item.startDate).format('DD/MM/YYYY')}</span>
                                                                <span>Ngày trả: {dayjs(item.endDate).format('DD/MM/YYYY')}</span>
                                                                <span>Thời gian thuê: {rentalDays} ngày</span>
                                                            </div>
                                                        </div>
                                                    </Col>

                                                    {/* Giá gốc */}
                                                    <Col flex="120px">
                                                        <div className="text-right">
                                                            <div className="text-lg font-bold text-red-500">
                                                                {item.product.price.toLocaleString()}₫ / ngày
                                                            </div>
                                                        </div>
                                                    </Col>

                                                    {/* Số lượng */}
                                                    <Col flex="120px">
                                                        <div className="text-center space-y-2">
                                                            <InputNumber
                                                                min={1}
                                                                max={item.product.stock}
                                                                value={item.quantity}
                                                                onChange={(value) =>
                                                                    updateQuantity(item.productId, value || 1)
                                                                }
                                                                className="w-full"
                                                                size="small"
                                                            />
                                                            <div className="text-xs text-orange-500">
                                                                Còn {item.product.stock} sản phẩm
                                                            </div>
                                                        </div>
                                                    </Col>

                                                    {/* Thành tiền */}
                                                    <Col flex="150px">
                                                        <div className="text-right font-bold text-lg text-red-500">
                                                            {itemTotal.toLocaleString()}₫
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {item.quantity} × {item.product.price.toLocaleString()}₫ × {rentalDays} ngày
                                                        </div>
                                                    </Col>

                                                    {/* Actions */}
                                                    <Col flex="80px">
                                                        <Tooltip title="Xóa khỏi giỏ hàng">
                                                            <Button
                                                                icon={<DeleteOutlined />}
                                                                size="small"
                                                                danger
                                                                onClick={() => removeItem(item.productId)}
                                                            />
                                                        </Tooltip>
                                                    </Col>
                                                </Row>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </Card>
                    </Col>

                    {/* Tóm tắt đơn hàng */}
                    <Col xs={24} lg={8}>
                        <div className="top-6">
                            <Card className="shadow-lg rounded-xl border-0" bodyStyle={{ padding: '24px' }}>
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <GiftOutlined className="text-blue-600" />
                                    Tóm tắt đơn hàng
                                </h3>

                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">
                                            Tạm tính ({selectedItems.length} sản phẩm)
                                        </span>
                                        <span className="font-semibold">
                                            {totalPrice.toLocaleString()}₫
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-blue-600">
                                        <span>Phí vận chuyển</span>
                                        <span className="font-semibold">Miễn phí</span>
                                    </div>
                                </div>

                                <Divider className="my-4" />
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-lg font-bold">Tổng thanh toán</span>
                                    <span className="text-xl font-extrabold text-red-500">{totalPrice.toLocaleString()}₫</span>
                                </div>

                                <Link to="/checkout">
                                    <Button
                                        type="primary"
                                        size="large"
                                        block
                                        disabled={selectedItems.length === 0}
                                        className="h-12 text-base font-semibold bg-gradient-to-r from-red-500 to-orange-400 hover:from-orange-500 hover:to-red-500 border-0 rounded-lg shadow-lg"
                                    >
                                        Mua hàng ({selectedItems.length})
                                    </Button>
                                </Link>
                            </Card>
                        </div>
                    </Col>
                </Row>
            </main>
        </div>
    );
}

export default CartUser;
