import { getProduct } from "@/actions/shop-actions";
import { redirect } from "next/navigation";
import EditProductForm from "@/components/admin/EditProductForm";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(parseInt(id));

  if (!product) {
      redirect("/admin/shop");
  }

  return <EditProductForm product={product} />;
}
