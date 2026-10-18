import { redirect } from 'next/navigation';

/** Subcategories aren't used — send old links to the parent category page. */
export default function SubcategoryRedirect({ params }: { params: { slug: string } }) {
  redirect(`/collections/${encodeURIComponent(params.slug)}`);
}
