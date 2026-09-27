import { redirect } from "next/navigation";

export default function VendorProductsRedirect() {
  redirect("/vendor/inventory");
}
