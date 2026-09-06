import AdminGuard from '@/components/admin/AdminGuard/AdminGuard';
import AppSidebar from '@/components/admin/AppSidebar/AppSidebar';
import AdminBreadcrumb from '@/components/admin/AdminBreadcrumb/AdminBreadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <TooltipProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <AdminBreadcrumb />
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 lg:p-8">{children}</div>
          </SidebarInset>
        </SidebarProvider>
      </TooltipProvider>
    </AdminGuard>
  );
}