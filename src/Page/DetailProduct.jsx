import { Carousel, Button, InputNumber, DatePicker, message, Modal } from 'antd';
import { ShoppingCartOutlined, CalendarOutlined, CheckCircleFilled } from '@ant-design/icons';
import Header from '../Components/Header/Header';
import { useState, useRef, useEffect } from 'react';
import Footer from '../Components/Footer/Footer';
import { requestCreateCart, requestCreateViewProduct, requestGetProductById } from '../config/request';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../hooks/useStore';

const fallbackImage = 'https://via.placeholder.com/400x500/f0f0f0/666666?text=No+Image';

function DetailProduct() {
    const [quantity, setQuantity] = useState(1);
    const [carouselIdx, setCarouselIdx] = useState(0);
    const [imageErrors, setImageErrors] = useState({});
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const carouselRef = useRef();
    const [product, setProduct] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    const { fetchCart, dataUser } = useStore();
    const { id } = useParams();

    const handleImageError = (index) => {
        setImageErrors((prev) => ({
            ...prev,
            [index]: true,
        }));
    };

    const getImageSrc = (index) => {
        return imageErrors[index] || !product ? fallbackImage : product?.images[index];
    };

    const handleStartDateChange = (date) => {
        setStartDate(date);
        if (endDate && date && endDate.isBefore(date)) {
            setEndDate(date);
        }
    };

    const handleEndDateChange = (date) => {
        setEndDate(date);
    };

    const disabledEndDate = (current) => {
        return startDate ? current && current < startDate : false;
    };

    useEffect(() => {
        const fetchProductById = async () => {
            try {
                const productData = await requestGetProductById(id);
                setProduct(productData.metadata);
                if (!dataUser._id) return;
                await requestCreateViewProduct({ productId: productData.metadata._id });
            } catch (error) {
                console.error("Failed to fetch product:", error);

            }
        };
        fetchProductById();
    }, [id, dataUser._id]);

    const handleAddToCart = async () => {
        if (!product) return;

        const data = {
            product: product._id,
            quantity: quantity,
            startDate: startDate,
            endDate: endDate,
        };
        try {
            await requestCreateCart(data);
            await fetchCart();
            setIsModalOpen(true);
        } catch (error) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <Header />
            <div className="w-[90%] mx-auto py-10 px-4 flex flex-col lg:flex-row gap-8">
                {/* Ảnh sản phẩm */}
                <div className="lg:w-1/3 flex flex-col items-center">
                    <div className="w-full max-w-sm bg-white rounded-xl shadow-lg mb-4 overflow-hidden relative">
                        <Carousel
                            dots={false}
                            afterChange={setCarouselIdx}
                            ref={carouselRef}
                            className="w-full"
                            effect="fade"
                        >
                            {product?.images.map((src, idx) => (
                                <div key={idx} className="flex items-center justify-center h-[500px] bg-gray-50">
                                    <img
                                        src={getImageSrc(idx)}
                                        alt={`Ảnh sản phẩm ${idx + 1}`}
                                        className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                                        onError={() => handleImageError(idx)}
                                        loading="lazy"
                                    />
                                </div>
                            ))}
                        </Carousel>
                        <div className="absolute top-3 right-3 bg-white bg-opacity-90 rounded-full px-2 py-1 text-xs font-medium text-gray-600">
                            {carouselIdx + 1}/{product?.images.length || 1}
                        </div>
                    </div>

                    {/* Thumbnails */}
                    <div className="flex gap-2 mt-4 flex-wrap justify-center">
                        {product?.images.map((src, idx) => (
                            <button
                                key={idx}
                                className={`border-2 rounded-lg w-16 h-20 flex items-center justify-center overflow-hidden transition-all duration-200 shadow-sm bg-white ${carouselIdx === idx
                                    ? 'border-blue-500 ring-2 ring-blue-300 scale-105'
                                    : 'border-gray-200 hover:border-blue-400 hover:scale-105'
                                    }`}
                                onClick={() => {
                                    setCarouselIdx(idx);
                                    carouselRef.current.goTo(idx);
                                }}
                                aria-label={`Xem ảnh ${idx + 1}`}
                            >
                                <img
                                    src={getImageSrc(idx)}
                                    alt={`Thumbnail ${idx + 1}`}
                                    className="object-cover h-full w-full rounded"
                                    onError={() => handleImageError(idx)}
                                />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Thông tin sản phẩm */}
                <div className="lg:w-1/2 bg-white rounded-xl shadow-lg p-6 lg:p-8 flex flex-col gap-6">
                    <div>
                        <h1 className="text-xl lg:text-2xl font-bold mb-3 leading-snug text-gray-800">
                            {product?.nameProduct || 'Đang tải...'}
                        </h1>
                        <div className="flex items-baseline gap-3 mb-6">
                            <span className="text-2xl lg:text-3xl font-extrabold text-red-500">
                                {product?.price ? `${product.price.toLocaleString()}₫` : '...'}
                            </span>
                        </div>
                    </div>

                    {/* Thông tin chi tiết */}
                    <div className="bg-gray-50 rounded-lg p-4 border">
                        <h3 className="font-semibold mb-3 text-gray-700">Thông tin chi tiết</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                            <div className="flex flex-col sm:col-span-1">
                                <span className="text-gray-500 text-sm font-medium">Công ty phát hành</span>
                                <span className="text-gray-700 font-semibold">{product?.publisher}</span>
                            </div>
                            <div className="flex flex-col sm:col-span-1">
                                <span className="text-gray-500 text-sm font-medium">Nhà xuất bản</span>
                                <span className="text-gray-700 font-semibold">{product?.publishingHouse}</span>
                            </div>
                            <div className="flex flex-col sm:col-span-1">
                                <span className="text-gray-500 text-sm font-medium">Tình trạng trong kho còn lại</span>
                                <span className="text-gray-700 font-semibold">{product?.stock} sản phẩm</span>
                            </div>
                            <div className="flex flex-col sm:col-span-1">
                                <span className="text-gray-500 text-sm font-medium">Loại bìa</span>
                                <span className="text-gray-700 font-semibold">
                                    {product?.coverType === 'hardcover' ? 'Bìa cứng' : 'Bìa mềm'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Mô tả sản phẩm */}
                    <div className="bg-blue-50 rounded-lg p-4">
                        <h3 className="font-semibold mb-2 text-blue-700">Mô tả sản phẩm</h3>
                        <p
                            className="text-gray-700 whitespace-pre-line text-sm leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: product?.description }}
                        />
                    </div>
                </div>

                {/* Mua hàng */}
                <div className="lg:w-1/4 bg-white rounded-xl shadow-lg p-6 lg:p-8 flex flex-col gap-6 h-fit border border-blue-100 top-24">
                    <div className="flex items-end">
                        <div className="text-2xl lg:text-3xl font-extrabold text-red-500 mb-2">
                            {product?.price ? `${product.price.toLocaleString()}₫` : '...'}
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-gray-600 font-medium">Số lượng</span>
                        <InputNumber
                            min={1}
                            max={product?.stock || 1}
                            value={quantity}
                            onChange={(value) => setQuantity(value || 1)}
                            className="!w-24"
                            size="large"
                        />
                    </div>
                    <div className="space-y-3 pt-3 border-t border-gray-100">
                        <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                            <CalendarOutlined className="mr-2 text-blue-500" />
                            Thời gian thuê
                        </h4>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Ngày bắt đầu</label>
                                <DatePicker
                                    placeholder="Chọn ngày bắt đầu"
                                    className="w-full"
                                    format="DD/MM/YYYY"
                                    value={startDate}
                                    onChange={handleStartDateChange}
                                    disabledDate={(current) => current && current < new Date().setHours(0, 0, 0, 0)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Ngày kết thúc</label>
                                <DatePicker
                                    placeholder="Chọn ngày kết thúc"
                                    className="w-full"
                                    format="DD/MM/YYYY"
                                    value={endDate}
                                    onChange={handleEndDateChange}
                                    disabledDate={disabledEndDate}
                                />
                            </div>
                            {startDate && endDate && (
                                <div className="bg-blue-50 p-2 rounded text-xs text-blue-700 mt-2">
                                    Thời gian thuê: {endDate.diff(startDate, 'days') + 1} ngày
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="space-y-3">
                        <Button
                            icon={<ShoppingCartOutlined />}
                            className="border-2 border-blue-500 text-blue-500 font-semibold h-12 rounded-lg text-base hover:bg-blue-50 hover:border-blue-600 transition-all duration-200"
                            size="large"
                            block
                            onClick={handleAddToCart}
                            disabled={!startDate || !endDate || !product}
                        >
                            Thêm vào giỏ
                        </Button>
                    </div>
                    <div className="pt-4 border-t border-gray-200">
                        {/* ...Thông tin bổ sung... */}
                    </div>
                </div>
            </div>

            <Footer />

            {/* THAY ĐỔI 4: Thêm Modal vào JSX */}
            <Modal
                title={
                    <div className="flex items-center gap-2">
                        <CheckCircleFilled className="text-green-500 text-2xl" />
                        <span className="text-lg font-semibold">Thêm vào giỏ hàng thành công!</span>
                    </div>
                }
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                centered
                maskClosable={false}
                keyboard={false}
            >
                <div className="py-6">
                    {/* Card sản phẩm */}
                    <div className="flex items-center gap-4 bg-gray-50 rounded-lg p-3 shadow-sm">
                        <img
                            src={getImageSrc(carouselIdx)}
                            alt={product?.nameProduct}
                            className="w-16 h-20 object-cover rounded-md border"
                        />
                        <div className="flex-1">
                            <p className="font-semibold text-gray-800 text-sm mb-1 line-clamp-2">
                                {product?.nameProduct}
                            </p>
                            <p className="text-xs text-gray-500">
                                Số lượng: <span className="font-medium text-gray-700">{quantity}</span>
                            </p>
                        </div>
                    </div>

                    {/* Nút hành động */}
                    <div className="flex gap-3 mt-6">
                        <Button
                            block
                            size="large"
                            onClick={() => {
                                setIsModalOpen(false);
                                navigate('/');
                            }}

                            className="h-11 rounded-lg border-gray-300 hover:border-blue-500 hover:text-blue-500 transition-all"
                        >
                            Tiếp tục mua sắm
                        </Button>
                        <Button
                            type="primary"
                            block
                            size="large"
                            onClick={() => navigate('/cart')}
                            className="bg-blue-600 h-11 rounded-lg font-medium hover:bg-blue-700 transition-all"
                        >
                            Xem giỏ hàng
                        </Button>
                    </div>
                </div>

            </Modal>
        </div>
    );
}

export default DetailProduct;