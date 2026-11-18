import { AppLoading } from "@/components/common/AppLoading";

export default function AdminLoading() {
  return (
    <div className="flex min-h-[70vh] flex-1 items-center justify-center">
      <AppLoading
        message="Loading Admin Portal..."
        subtext="Fetching catalogue management and enquiry records"
      />
    </div>
  );
}

