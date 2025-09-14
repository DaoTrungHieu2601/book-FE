import { Link } from 'react-router-dom';

function RankingModule({ title, products, loading }) {
    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-3 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
            </div>
            <div className="p-3 space-y-3">
                {loading && Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 animate-pulse">
                        <div className="w-10 h-14 bg-gray-300 rounded"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-300 rounded"></div>
                            <div className="h-3 w-1/2 bg-gray-300 rounded"></div>
                        </div>
                    </div>
                ))}
                {!loading && products.map((product) => (
                    <Link to={`/product/${product._id}`} key={product._id} className="flex items-center gap-3 group">
                        <div className="w-10 h-14 flex-shrink-0 rounded overflow-hidden">
                            <img
                                src={product.images && product.images[0]}
                                alt={product.nameProduct}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 line-clamp-2">
                                {product.nameProduct}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{product.sold?.toLocaleString() || 0} lượt thuê</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default RankingModule;