import { Input, Select, TextArea } from "@/components/ui/input";
import { submitVendorApplication } from "@/app/vendor/actions";

const countries = ["US", "GB", "DE", "FR", "NL", "CA", "AE", "EG"];

export function BusinessApplication({ email }: { email?: string | null }) {
  return (
    <form action={submitVendorApplication} className="grid gap-4 rounded-[28px] bg-pure-white p-6 shadow-sm-2">
      <h2 className="text-subhead">Verification hub</h2>
      <p className="text-body-sm text-muted-gray">
        Tell Shoply about the business before Stripe opens a bank-account connection.
      </p>
      <Input label="Store name" name="storeName" required />
      <Input label="Legal name" name="legalName" required />
      <Input label="Business email" name="businessEmail" type="email" required defaultValue={email ?? ""} />
      <Input label="Phone" name="phone" required />
      <Select label="Country" name="country" required defaultValue="US">
        {countries.map((country) => (
          <option key={country} value={country}>
            {country}
          </option>
        ))}
      </Select>
      <Input label="Address" name="address" required />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="City" name="city" required />
        <Input label="Postal code" name="postal" required />
      </div>
      <TextArea label="What do you sell?" name="description" />
      <button
        type="submit"
        className="mt-2 inline-flex h-12 items-center justify-center rounded-full bg-shop-violet px-8 text-body-lg text-pure-white shadow-lg-2"
      >
        Submit application
      </button>
    </form>
  );
}
