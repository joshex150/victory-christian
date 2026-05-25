import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import { getContent, getSubscribers } from "@/lib/storage";
import Dashboard from "./Dashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession();
  if (!session) redirect("/admin");

  const [content, subscribers, upcomingSubscribers] = await Promise.all([
    getContent(),
    getSubscribers("main"),
    getSubscribers("upcoming"),
  ]);

  return (
    <Dashboard
      adminEmail={session.email}
      initialContent={content}
      initialSubscribers={subscribers}
      initialUpcomingSubscribers={upcomingSubscribers}
    />
  );
}
