import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="container flex-1 py-10">{children}</main>
      <Footer />
    </div>
  );
}
