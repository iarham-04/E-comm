'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ProductForm from '../../ProductForm';
import { API_URL } from '@/lib/api';
import { Loader2 } from 'lucide-react';

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`${API_URL}/admin/products/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setInitialData({
            name: data.name || '',
            slug: data.slug || '',
            description: data.description || '',
            price: data.price ? String(data.price) : '',
            categoryId: data.categoryId || '',
            stock: data.stock !== undefined ? String(data.stock) : '0',
            images: data.images || [],
            isActive: data.isActive ?? true,
            status: data.status || 'PUBLISHED',
            metaTitle: data.metaTitle || '',
            metaDescription: data.metaDescription || '',
            craftsmanshipStory: data.craftsmanshipStory || '',
            material: data.material || '',
            heightCm: data.heightCm ? String(data.heightCm) : '',
            widthCm: data.widthCm ? String(data.widthCm) : '',
            depthCm: data.depthCm ? String(data.depthCm) : '',
            weightKg: data.weightKg ? String(data.weightKg) : '',
            isLimitedEdition: data.isLimitedEdition ?? false,
            editionNumber: data.editionNumber ? String(data.editionNumber) : '',
            editionTotal: data.editionTotal ? String(data.editionTotal) : '',
            isGiftEligible: data.isGiftEligible ?? true,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400 text-xs">
        <Loader2 className="w-5 h-5 animate-spin mr-2 text-amber-400" />
        <span>Loading product details...</span>
      </div>
    );
  }

  return <ProductForm mode="edit" productId={id} initialData={initialData || undefined} />;
}
