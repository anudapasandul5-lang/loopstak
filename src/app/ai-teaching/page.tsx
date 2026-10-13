import { ServicePage, serviceMetadata } from "@/components/ServicePage";

export const metadata = serviceMetadata("teaching");

export default function Page() {
  return <ServicePage id="teaching" />;
}
