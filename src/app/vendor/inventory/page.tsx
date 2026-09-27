import { saveProduct, updateInventoryItem } from "@/app/vendor/products/actions";
import { Input, Select, TextArea } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { requireOwnedVendor } from "@/lib/vendor";

export const dynamic = "force-dynamic";

const categories = ["Tops", "Bottoms", "Outerwear", "Footwear", "Beauty", "Accessories", "Home"];

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const { supabase, vendor } = await requireOwnedVendor();
  const { data: products } = await supabase
    .from("products")
    .select("id, title, category, price_cents, stock, is_published, image_url")
    .eq("vendor_id", vendor.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-headline">Inventory</h1>
      {vendor.stripe_status !== "connected" ? (
        <p className="mt-3 text-body-sm text-muted-gray">Payouts stay on hold until the bank account is connected.</p>
      ) : null}
      {params.error === "approval" ? (
        <p className="mt-3 text-body-sm text-ink-black">Shoply has to approve the shop before products can go on sale.</p>
      ) : null}
      {params.error && params.error !== "approval" ? (
        <p className="mt-3 text-body-sm text-ink-black">That product could not be saved. Check the title and price.</p>
      ) : null}
      <div className="mt-8 overflow-x-auto rounded-[28px] bg-pure-white shadow-sm-2">
        <table className="w-full text-left text-body-sm">
          <thead className="text-muted-gray">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Live</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {(products ?? []).length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-muted-gray">
                  No products yet. Add one below.
                </td>
              </tr>
            ) : (
              (products ?? []).map((product) => (
                <tr key={product.id} className="border-t border-faint-border">
                  <td className="px-4 py-3">
                    <p className="text-ink-black">{product.title}</p>
                    <p className="text-[11px] text-muted-gray">{product.category}</p>
                  </td>
                  <td className="px-4 py-3">{formatCurrency(product.price_cents)}</td>
                  <td className="px-4 py-3" colSpan={3}>
                    <form action={updateInventoryItem} className="flex flex-wrap items-center gap-2">
                      <input type="hidden" name="id" value={product.id} />
                      <input
                        name="stock"
                        type="number"
                        min="0"
                        defaultValue={product.stock}
                        aria-label={`Stock for ${product.title}`}
                        className="h-9 w-20 rounded-full border border-faint-border bg-pure-white px-3 text-body-sm outline-none"
                      />
                      <select
                        name="published"
                        defaultValue={product.is_published ? "yes" : "no"}
                        aria-label={`Visibility for ${product.title}`}
                        className="h-9 rounded-full border border-faint-border bg-pure-white px-3 text-body-sm outline-none"
                      >
                        <option value="yes">Published</option>
                        <option value="no">Hidden</option>
                      </select>
                      <button type="submit" className="h-9 rounded-full bg-ink-black px-4 text-body-sm text-pure-white">
                        Save
                      </button>
                    </form>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <form action={saveProduct} className="mt-8 grid max-w-xl gap-4">
        <h2 className="text-subhead">Add a product</h2>
        <Input label="Title" name="title" required />
        <TextArea label="Description" name="description" />
        <Select label="Category" name="category" defaultValue="Tops">
          {categories.map((category) => (
            <option key={category}>{category}</option>
          ))}
        </Select>
        <Input label="Price (USD)" name="price" type="number" min="1" step="0.01" required />
        <Input label="Stock" name="stock" type="number" min="0" defaultValue="10" />
        <Input label="Image URL" name="imageUrl" placeholder="https://images.unsplash.com/" />
        <button type="submit" className="h-11 rounded-full bg-shop-violet px-7 text-body-lg text-pure-white shadow-lg-2">
          Publish product
        </button>
      </form>
    </div>
  );
}
