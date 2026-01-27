import { db, Product } from "@/lib/db";
import ShopClient from "@/components/ShopClient";

async function getProducts(): Promise<Product[]> {
  const stmnt = db.prepare("SELECT * FROM products");
  return stmnt.all() as Product[];
}

export default async function ShopPage() {
  const products = await getProducts();
  return <ShopClient products={products} />;
}
