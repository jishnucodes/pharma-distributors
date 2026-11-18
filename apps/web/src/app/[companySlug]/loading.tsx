import { AppLoading } from "@/components/common/AppLoading";

export default function CompanyLoading() {
  return (
    <div className="flex min-h-[70vh] flex-1 items-center justify-center">
      <AppLoading
        message="Loading Pharmaceutical Formulations..."
        subtext="Synchronizing catalogue and active compositions"
      />
    </div>
  );
}

