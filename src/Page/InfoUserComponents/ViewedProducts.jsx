import { Card, Empty, Button, Rate } from 'antd';
import { useEffect, useState } from 'react';

import { requestGetViewProduct } from '../../config/request';

import CardBody from '../../Components/CardBody/CardBody';

const ViewedProducts = () => {
    const [viewedProducts, setViewedProducts] = useState([]);

    useEffect(() => {
        const fetchViewProduct = async () => {
            const res = await requestGetViewProduct();
            setViewedProducts(res.metadata);
        };
        fetchViewProduct();
    }, []);

    return (

        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Sản phẩm đã xem</h2>

            {viewedProducts.length === 0 ? (
                <div className="text-center py-10">
                    <Empty description="Bạn chưa xem sản phẩm nào" />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {viewedProducts.map((product, index) => (
                        <CardBody key={index} product={product.product} />

                    ))}
                </div>
            )}
        </div>
    );
};

export default ViewedProducts;
