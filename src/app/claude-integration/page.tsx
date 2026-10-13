import { ServicePage, serviceMetadata } from "@/components/ServicePage";

export const metadata = serviceMetadata("claude");

export default function Page() {
  return <ServicePage id="claude" />;
}
