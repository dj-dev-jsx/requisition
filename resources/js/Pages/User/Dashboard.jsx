import UsersLayout from "@/Layouts/UsersLayout";
import { Head } from "@inertiajs/react";

export default function Dashboard() {
  return (
    <UsersLayout>
        <Head title="Dashboard" />
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-2xl font-semibold text-gray-800">Welcome to your Dashboard</h1>
      </div>
    </UsersLayout>
  );
}