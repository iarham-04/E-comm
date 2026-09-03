'use client';

import { useParams } from 'next/navigation';
import ProductForm from '../../ProductForm';

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  // In production: fetch initialData from GET /admin/products/:id and pass as initialData prop
  return <ProductForm mode="edit" productId={id} />;
}
