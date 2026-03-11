import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "../../navigation";
import DashboardSidebar from "../../components/DashboardSidebar";
import MobileNav from "../../components/MobileNav";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    let userPlan = "free";
    if (session?.user?.email) {
        const { prisma } = await import("@/lib/prisma");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const user = await (prisma.user as any).findUnique({
            where: { email: session.user.email },
            select: { plan: true }
        });
        userPlan = user?.plan || "free";
    }

    const userName = session.user?.name || session.user?.email || "User";

    return (
        <div className="min-h-screen bg-background font-body flex overflow-hidden">
            {/* Dynamic Background */}
            <div className="fixed inset-0 bg-grid z-0 opacity-10 pointer-events-none" />

            {/* Collapsible Desktop Sidebar */}
            <DashboardSidebar userName={userName} userPlan={userPlan} />

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative z-10">
                <div className="max-w-6xl mx-auto p-4 md:p-8 pb-24 md:pb-8">
                    {children}
                </div>
            </main>

            {/* Mobile Bottom Nav */}
            <MobileNav userPlan={userPlan} />
        </div>
    );
}
