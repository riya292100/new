import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { catalogApi } from '../services/api';
import { FALLBACK_PRODUCTS } from '../utils/demoConfig';
import ProductDetailModal from '../components/ProductDetailModal';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    if (id) {
      catalogApi
        .getProductById(id)
        .then((res) => {
          if (res?.data) {
            setProduct(res.data);
          } else {
            const fb = FALLBACK_PRODUCTS.find((p) => String(p.id) === String(id));
            if (fb) setProduct(fb);
            else navigate('/category/all');
          }
        })
        .catch(() => {
          const fb = FALLBACK_PRODUCTS.find((p) => String(p.id) === String(id));
          if (fb) setProduct(fb);
          else navigate('/category/all');
        });
    }
  }, [id, navigate]);

  return (
    <div className="container" style={{ paddingTop: '20px' }}>
      {product && <ProductDetailModal product={product} onClose={() => navigate(-1)} />}
    </div>
  );
};

export default ProductDetailsPage;
