// HomePage.jsx
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { BookOutlined, FileSearchOutlined } from "@ant-design/icons";
import Cardbody from "../Cardbody/Cardbody";
import { useStore } from "../../hooks/useStore";
import { requestGetProducts } from "../../config/request";
import { Pagination } from "antd";
import HeroSlider from "./HeroSlider";
import RankingModule from "./RankingModule";

const colorOptions = [
    // giữ nguyên config màu bạn có
];

// parse giá an toàn
const parsePrice = (p) => {
    if (p == null) return 0;
    if (typeof p === "number") return p;
    const cleaned = String(p).replace(/[^0-9.-]+/g, "");
    const num = Number(cleaned);
    return Number.isFinite(num) ? num : 0;
};

// sort logic
const applySort = (products = [], order) => {
    const sorted = [...products];
    switch (order) {
        case "newest":
            sorted.sort((a, b) => {
                const ta = new Date(a?.createdAt).getTime() || 0;
                const tb = new Date(b?.createdAt).getTime() || 0;
                return tb - ta;
            });
            break;
        case "bestseller":
            sorted.sort((a, b) => (b?.sold || 0) - (a?.sold || 0));
            break;
        case "price-asc":
            sorted.sort((a, b) => parsePrice(a?.price) - parsePrice(b?.price));
            break;
        case "price-desc":
            sorted.sort((a, b) => parsePrice(b?.price) - parsePrice(a?.price));
            break;
        default:
            break;
    }
    return sorted;
};

function HomePage() {
    const { category } = useStore();

    const [allProducts, setAllProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hotProducts, setHotProducts] = useState([]);
    const [popularProducts, setPopularProducts] = useState([]);
    const [styledCategories, setStyledCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [sortOrder, setSortOrder] = useState("newest");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 12;

    // fetch sp theo category
    useEffect(() => {
        const fetchProductsByCategory = async () => {
            setLoading(true);
            try {
                const response = await requestGetProducts({ category: selectedCategory });
                const productsData = response?.metadata || [];

                // hot/popular
                const sortedByPopularity = [...productsData].sort(
                    (a, b) => (b?.sold || 0) - (a?.sold || 0)
                );
                setHotProducts(sortedByPopularity.slice(0, 6));
                setPopularProducts(
                    sortedByPopularity.filter((p) => (p?.sold || 0) > 0).slice(0, 10)
                );

                // luôn reset về newest khi đổi category
                setAllProducts(productsData);
                setSortOrder("newest");
                setCurrentPage(1);
            } catch (err) {
                console.error("Failed to fetch products:", err);
                setAllProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProductsByCategory();
    }, [selectedCategory]);

    // re-sort khi allProducts hoặc sortOrder thay đổi
    useEffect(() => {
        if (!Array.isArray(allProducts)) {
            setFilteredProducts([]);
            return;
        }
        const sorted = applySort(allProducts, sortOrder);
        setFilteredProducts(sorted);
        setCurrentPage(1);
    }, [allProducts, sortOrder]);

    // scroll to top khi đổi page/category
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [currentPage, selectedCategory]);

    // style category
    useEffect(() => {
        if (category && category.length > 0) {
            const styled = category.map((cat, index) => ({
                ...cat,
                icon: <BookOutlined />,
                ...colorOptions[index % colorOptions.length],
            }));
            setStyledCategories(styled);
        }
    }, [category]);

    const currentProducts = filteredProducts.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );
    const currentCategoryName =
        styledCategories.find((c) => c._id === selectedCategory)?.nameCategory ||
        "Truyện mới cập nhật";

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-12 gap-6">
                    <div className="col-span-12 lg:col-span-9 space-y-8">
                        <HeroSlider products={hotProducts} loading={loading} />

                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                            <div className="flex flex-col md:flex-row justify-between items-center border-b border-gray-200 pb-4 mb-4">
                                <h2 className="text-xl font-bold text-gray-800">
                                    {currentCategoryName}
                                </h2>
                                <div className="flex items-center gap-2 mt-4 md:mt-0">
                                    <span className="text-sm text-gray-600 hidden sm:block">
                                        Sắp xếp:
                                    </span>
                                    <select
                                        value={sortOrder}
                                        onChange={(e) => setSortOrder(e.target.value)}
                                        className="text-sm px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                                    >
                                        <option value="newest">Mới nhất</option>
                                        <option value="bestseller">Thuê nhiều</option>
                                        <option value="price-asc">Giá thấp</option>
                                        <option value="price-desc">Giá cao</option>
                                    </select>
                                </div>
                            </div>

                            {loading ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {Array.from({ length: pageSize }).map((_, i) => (
                                        <div key={i} className="animate-pulse">
                                            <div className="w-full aspect-[2/3] bg-gray-200 rounded-md"></div>
                                            <div className="h-4 mt-2 bg-gray-200 rounded w-3/4"></div>
                                        </div>
                                    ))}
                                </div>
                            ) : currentProducts.length > 0 ? (
                                <>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                        {currentProducts.map((product) => (
                                            <Link
                                                key={product._id}
                                                to={`/product/${product._id}`}
                                                className="group"
                                            >
                                                <Cardbody product={product} />
                                            </Link>
                                        ))}
                                    </div>
                                    {filteredProducts.length > pageSize && (
                                        <div className="flex justify-center mt-8">
                                            <Pagination
                                                current={currentPage}
                                                pageSize={pageSize}
                                                total={filteredProducts.length}
                                                onChange={(page) => setCurrentPage(page)}
                                                showSizeChanger={false}
                                            />
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center text-center py-16">
                                    <FileSearchOutlined className="text-5xl text-gray-300 mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-700">
                                        Không tìm thấy truyện
                                    </h3>
                                    <p className="text-gray-500 mt-1 max-w-xs">
                                        Không có truyện nào phù hợp với thể loại bạn đã chọn.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="col-span-12 lg:col-span-3 space-y-6">
                        <RankingModule
                            title="Được Thuê Nhiều Nhất"
                            products={popularProducts}
                            loading={loading}
                        />
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                            <div className="p-3 border-b border-gray-200">
                                <h3 className="text-sm font-semibold text-gray-800">
                                    Thể Loại
                                </h3>
                            </div>
                            <div className="p-3 grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => setSelectedCategory(null)}
                                    className={`text-sm text-left p-2 rounded-md transition-colors ${!selectedCategory
                                            ? "bg-blue-600 text-white font-semibold"
                                            : "hover:bg-gray-100 text-gray-700"
                                        }`}
                                >
                                    Tất cả
                                </button>
                                {styledCategories.map((cat) => (
                                    <button
                                        key={cat._id}
                                        onClick={() => setSelectedCategory(cat._id)}
                                        className={`text-sm text-left p-2 rounded-md transition-colors truncate ${selectedCategory === cat._id
                                                ? "bg-blue-600 text-white font-semibold"
                                                : "hover:bg-gray-100 text-gray-700"
                                            }`}
                                    >
                                        {cat.nameCategory}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HomePage;
