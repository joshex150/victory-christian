import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import {
  bookSubscriberList,
  getContent,
  getEmailTemplate,
  getSiteTheme,
  getSubscribers,
} from "@/lib/storage";
import Dashboard from "./Dashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession();
  if (!session) redirect("/admin");

  const [content, theme, emailTemplate, subscribers, upcomingSubscribers] = await Promise.all([
    getContent(),
    getSiteTheme(),
    getEmailTemplate(),
    getSubscribers("main"),
    getSubscribers(bookSubscriberList("upcoming")),
  ]);

  return (
    <Dashboard
      adminEmail={session.email}
      initialContent={content}
      initialTheme={theme}
      initialEmailTemplate={emailTemplate}
      initialSubscribers={subscribers}
      initialUpcomingSubscribers={upcomingSubscribers}
    />
  );
}
