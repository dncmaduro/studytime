import { LoadingState } from "@/components/loading-state";

export default async function GlobalLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16">
      <LoadingState />
    </div>
  );
}
