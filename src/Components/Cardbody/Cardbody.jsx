import React from 'react';
import { BookOpen } from 'lucide-react';

function Cardbody({ product }) {
    if (!product) {
        return <div className="p-4 text-red-500">Không có dữ liệu sản phẩm</div>;
    }

    return (
        <div className="w-full max-w-sm bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer border border-gray-100 group">
            {/* Image Container */}
            <div className="relative w-full aspect-[2/3] bg-gray-100 overflow-hidden">
                <img
                    src={product?.images?.[0] || "/placeholder.png"}
                    alt={product?.nameProduct || "Không có tên"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-sm">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                </div>
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col gap-2">
                {/* Title */}
                <h1 className="text-sm text-gray-900 font-medium leading-tight line-clamp-2">
                    {product?.nameProduct || "Sản phẩm không tên"}
                </h1>

                {/* Price */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex items-baseline gap-1">
                        <span className="text-lg font-bold text-red-500">
                            {product?.price ? product.price.toLocaleString("vi-VN") : "0"}đ
                        </span>
                        <span className="text-sm text-gray-500">/ ngày</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Cardbody;
