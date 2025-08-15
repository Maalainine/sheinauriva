import Navbar from "@/components/layout/header/Navbar";
import Footer from "@/components/layout/footer/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-140px)]">
        {children}
      </main>
      <Footer />
    </>
  );
}
