import { UserAccountNav } from "@/components/layout/user-account-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import MobileNav from "@/components/layout/mobile-nav";
import { auth } from "@/auth";
import { MainNav } from "@/components/layout/main-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1">
        {/* Desktop sidebar - hidden on mobile */}
        <aside className="hidden border-r bg-muted/40 md:block md:w-64 sticky left-0 top-0 max-h-screen">
          <MainNav />
        </aside>

        <div className="flex w-full flex-1 flex-col">
          <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b bg-background px-6">
            <div className="block md:hidden">
              <MobileNav />
            </div>
            <div className="hidden md:block" />
            <div className="flex items-center gap-5">
              <ThemeToggle />
              <UserAccountNav
                user={{
                  email: session?.user.email,
                  name: session?.user.name || session?.user.username,
                  image: session?.user.image,
                }}
              />
            </div>
          </header>
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
