import { ServicePage, serviceMetadata } from "@/components/ServicePage";

export const metadata = serviceMetadata("website");

export default function Page() {
  return <ServicePage id="website" />;
}
