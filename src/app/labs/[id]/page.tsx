import { Suspense } from "react";
import { notFound } from "next/navigation";
import LabView from "@/components/views/LabView";
import PageLoading from "@/components/PageLoading";
import { LABS } from "@/lib/course";

export function generateStaticParams() {
  return LABS.map((l) => ({ id: String(l.id) }));
}

export async function generateMetadata({ params }: PageProps<"/labs/[id]">) {
  const { id } = await params;
  const l = LABS.find((x) => x.id === Number(id));
  return { title: l ? `Lab ${l.id}: ${l.title} · GraphRAG Academy` : "Lab" };
}

async function LabContent({ params }: { params: PageProps<"/labs/[id]">["params"] }) {
  const { id } = await params;
  const lab = LABS.find((x) => x.id === Number(id));
  if (!lab) notFound();
  // ?q= (sample question deep-link) is read client-side so the page stays prerenderable
  return <LabView id={lab.id} />;
}

export default function LabPage({ params }: PageProps<"/labs/[id]">) {
  return (
    <Suspense fallback={<PageLoading label="Loading lab…" />}>
      <LabContent params={params} />
    </Suspense>
  );
}
