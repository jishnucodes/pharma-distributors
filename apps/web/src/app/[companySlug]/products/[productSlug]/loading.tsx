import { AppLoading } from "@/components/common/AppLoading";

export default function ProductLoading() {
  return (
    <div className="container-wide flex min-h-[60vh] flex-1 items-center justify-center py-16">
      <AppLoading
        message="Loading Product Details..."
        subtext="Fetching active salts, formulations, and packing specs"
      />
    </div>
  );
}

