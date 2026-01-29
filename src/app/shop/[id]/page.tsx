import { db, Product } from "@/lib/db";
import { notFound } from "next/navigation";
import ProductDetailClient from "@/components/ProductDetailClient";

export default async function ProductPage({ params }: { params: { id: string } }) {
  const { id } = await params;  // Await params in newer Next.js versions if needed, or structured destructuring
  const product = db.prepare("SELECT * FROM products WHERE id = ?").get(id) as Product;

  if (!product) {
    notFound();
  }

  return (
      <ProductDetailClient product={product} />
  );
}
