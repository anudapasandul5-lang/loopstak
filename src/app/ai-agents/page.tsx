import { ServicePage, serviceMetadata } from "@/components/ServicePage";

export const metadata = serviceMetadata("agents");

export default function Page() {
  return <ServicePage id="agents" />;
}
