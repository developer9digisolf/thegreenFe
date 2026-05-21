import { Metadata } from "next";
import MemberDetailView from "@/views/dashboard/master/members/MemberDetailView";

export const metadata: Metadata = {
  title: "Detail Member | The Green Spa",
  description: "Lihat detail member dan voucher pack",
};

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function MemberDetailPage({ params }: PageProps) {
  const { id } = await params;
  const memberId = Number(id);

  return <MemberDetailView memberId={memberId} />;
}
