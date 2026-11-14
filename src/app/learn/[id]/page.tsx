import { Suspense } from "react";
import { notFound } from "next/navigation";
import ModuleView from "@/components/views/ModuleView";
import PageLoading from "@/components/PageLoading";
import { getModule, MODULES } from "@/lib/course";

export function generateStaticParams() {
  return MODULES.map((m) => ({ id: String(m.id) }));
}

export async function generateMetadata({ params }: PageProps<"/learn/[id]">) {
  const { id } = await params;
  const m = getModule(Number(id));
  return { title: m ? `Module ${m.id}: ${m.short} · GraphRAG Academy` : "Module" };
}

async function ModuleContent({ params }: { params: PageProps<"/learn/[id]">["params"] }) {
  const { id } = await params;
  const m = getModule(Number(id));
  if (!m) notFound();
  return <ModuleView id={m.id} />;
}

export default function ModulePage({ params }: PageProps<"/learn/[id]">) {
  return (
    <Suspense fallback={<PageLoading label="Loading module…" />}>
      <ModuleContent params={params} />
    </Suspense>
  );
}
