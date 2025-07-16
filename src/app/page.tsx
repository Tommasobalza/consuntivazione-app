import { Dashboard } from "@/components/dashboard";

export default function Home() {
  return (
    <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-800 dark:text-white">
          Riepilogo Attività
        </h1>
      </div>
      <Dashboard />
    </div>
  );
}
