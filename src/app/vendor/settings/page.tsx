import { updateStoreSettings } from "@/app/vendor/settings/actions";
import { Input, Select, TextArea } from "@/components/ui/input";
import { requireOwnedVendor } from "@/lib/vendor";

export const dynamic = "force-dynamic";

const countries = ["US", "GB", "DE", "FR", "NL", "CA", "AE", "EG"];

export default async function VendorSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const params = await searchParams;
  const { vendor } = await requireOwnedVendor();
  const countryOptions = countries.includes(vendor.country ?? "") ? countries : [vendor.country ?? "US", ...countries];

  return (
    <div className="max-w-xl">
      <h1 className="text-headline">Settings</h1>
      <p className="mt-2 text-body text-muted-gray">Store details buyers and Shoply use for {vendor.legal_name}.</p>
      {params.saved ? <p className="mt-3 text-body-sm text-ink-black">Settings saved.</p> : null}
      {params.error === "missing" ? (
        <p className="mt-3 text-body-sm text-ink-black">Fill in the store name, phone, and address.</p>
      ) : null}
      {params.error === "save" ? <p className="mt-3 text-body-sm text-ink-black">Settings could not be saved.</p> : null}
      {params.error === "rate" ? (
        <p className="mt-3 text-body-sm text-ink-black">Too many attempts. Wait a while and try again.</p>
      ) : null}
      <form action={updateStoreSettings} className="mt-8 grid gap-4">
        <Input label="Store name" name="storeName" required defaultValue={vendor.store_name} />
        <Input label="Tagline" name="tagline" defaultValue={vendor.tagline ?? ""} />
        <TextArea label="Description" name="description" defaultValue={vendor.description ?? ""} />
        <Input label="Phone" name="phone" required defaultValue={vendor.phone ?? ""} />
        <Select label="Country" name="country" required defaultValue={vendor.country ?? "US"}>
          {countryOptions.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </Select>
        <Input label="Address" name="address" required defaultValue={vendor.address_line ?? ""} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="City" name="city" required defaultValue={vendor.city ?? ""} />
          <Input label="Postal code" name="postal" required defaultValue={vendor.postal_code ?? ""} />
        </div>
        <button type="submit" className="mt-2 h-12 rounded-full bg-shop-violet px-8 text-body-lg text-pure-white shadow-lg-2">
          Save settings
        </button>
      </form>
    </div>
  );
}
