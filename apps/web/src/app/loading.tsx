import { AppLoading } from "@/components/common/AppLoading";

export default function Loading() {
  return (
    <main className="flex min-h-[70vh] flex-1 items-center justify-center">
      <AppLoading message="Loading Pharmaceutical Network..." />
    </main>
  );
}

