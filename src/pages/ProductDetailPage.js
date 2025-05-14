import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Edit, ShoppingBag, Truck, Calendar, Tag, CircleDollarSign } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

const BASE_URL = 'https://render-1-ehkn.onrender.com';

const ProductDetailPage = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${BASE_URL}/api/products/${id}`);
        setProduct(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError(`Failed to load product: ${err.message}`);
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return <Layout><div className="flex items-center justify-center h-64">Loading...</div></Layout>;
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-red-50 text-red-800 p-4 rounded-lg mb-6">
          {error}
        </div>
        <Link to="/products" className="flex items-center text-purple-600 hover:text-purple-800">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Link>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
          <p className="mb-4">The product you're looking for doesn't exist or has been removed.</p>
          <Link to="/products" className="inline-flex items-center text-purple-600 hover:text-purple-800">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Link>
        </div>
      </Layout>
    );
  }

  // Handle the image URL correctly for GridFS
  const getProductImageUrl = (product) => {
    if (product.imageId) {
      return `${BASE_URL}/api/images/${product.imageId}`;
    } else if (product.imageUrl && product.imageUrl.startsWith('/api/images/')) {
      return `${BASE_URL}${product.imageUrl}`;
    } else if (product.imageUrl) {
      return product.imageUrl;
    }
    return '/placeholder-product.png';
  };

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/products" className="flex items-center text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Product Details</h1>
        </div>
        <Link 
          to={`/products/edit/${product._id}`} 
          className="rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 flex items-center"
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit Product
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="grid md:grid-cols-2 gap-8 p-6">
          <div className="flex justify-center items-center">
            <div className="w-full max-w-md relative h-80 rounded-lg overflow-hidden">
              <img
                src={getProductImageUrl(product)}
                alt={product.name}
                className="h-full w-full object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/placeholder-product.png';
                }}
              />
            </div>
          </div>

          <div className="flex flex-col">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h2>
            <div className="flex items-center mb-4">
              <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
                {product.category}
              </span>
              <span className="mx-2 text-gray-300">•</span>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>
            
            <div className="mt-2 mb-6">
              <p className="text-3xl font-bold text-gray-900">₹{product.price?.toFixed(2)}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-3 rounded-md">
                <div className="flex items-center text-gray-500 mb-1">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  <span className="text-xs font-medium">AVAILABLE QUANTITY</span>
                </div>
                <p className="text-lg font-medium">{product.availableQuantity || product.stock || 0}</p>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-md">
                <div className="flex items-center text-gray-500 mb-1">
                  <Truck className="w-4 h-4 mr-2" />
                  <span className="text-xs font-medium">SOLD</span>
                </div>
                <p className="text-lg font-medium">{product.sold || 0}</p>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-md">
                <div className="flex items-center text-gray-500 mb-1">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span className="text-xs font-medium">DATE ADDED</span>
                </div>
                <p className="text-sm font-medium">
                  {new Date(product.dateAdded).toLocaleDateString()}
                </p>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-md">
                <div className="flex items-center text-gray-500 mb-1">
                  <Tag className="w-4 h-4 mr-2" />
                  <span className="text-xs font-medium">RATING</span>
                </div>
                <p className="text-lg font-medium">{product.rating || 0}/5</p>
              </div>
            </div>
            
            {product.offerEnds && new Date(product.offerEnds) > new Date() && (
              <div className="bg-yellow-50 p-3 rounded-md mb-6">
                <div className="flex items-center text-yellow-800 mb-1">
                  <CircleDollarSign className="w-4 h-4 mr-2" />
                  <span className="text-xs font-medium">SPECIAL OFFER ENDS</span>
                </div>
                <p className="text-sm font-medium">
                  {new Date(product.offerEnds).toLocaleDateString()}
                </p>
              </div>
            )}
            
            {product.colors && product.colors.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Available Colors</h3>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color, index) => (
                    <span key={index} className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-800">
                      {color}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="border-t border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Product Description</h3>
          <div className="prose prose-sm max-w-none text-gray-500">
            <p>{product.description}</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetailPage;
