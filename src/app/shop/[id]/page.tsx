import { db, Product } from "@/lib/db";
import { notFound } from "next/navigation";
import ProductDetailClient from "@/components/ProductDetailClient";

export default async function ProductPage({ params }: { params: { id: string } }) {
  const { id } = await params;  // Await params in newer Next.js versions if needed, or structured destructuring
  const product = await db.prepare("SELECT * FROM products WHERE id = ?").get(id) as Product;

  if (!product) {
    notFound();
  }

  // Convert price to Number
  product.price = Number(product.price);

  return (
      <ProductDetailClient product={product} />
  );
}
