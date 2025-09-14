import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const SkeletonSlide = () => (
    <div className="w-full h-48 md:h-72 bg-gray-300 rounded-lg animate-pulse"></div>
);

function HeroSlider({ products, loading }) {
    if (loading) return <SkeletonSlide />;
    if (!products || products.length === 0) return null;

    return (
        <div className="w-full rounded-lg overflow-hidden">
            <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={10}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true }}
                loop={true}
                autoplay={{ delay: 3000, disableOnInteraction: false }}
                className="mySwiper"
            >
                {products.map((product) => (
                    <SwiperSlide key={product._id}>
                        <Link to={`/product/${product._id}`}>
                            <div className="relative w-full h-64 md:h-96">
                                <img
                                    src={product.images && product.images[0]}
                                    alt={product.nameProduct}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                                <div className="absolute bottom-0 left-0 p-4 md:p-6 text-white">
                                    <h3 className="text-lg md:text-2xl font-bold">{product.nameProduct}</h3>
                                    <p className="hidden md:block text-sm mt-1 opacity-90">
                                        {product.category?.nameCategory || ''}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    </SwiperSlide>

                ))}
            </Swiper>
        </div>
    );
}

export default HeroSlider;