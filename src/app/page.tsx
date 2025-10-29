import SidebarToggle from "@/components/SidebarToggle";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center">
      <main>
        <h1 className="text-3xl font-black mt-4">Catálogo de Matrizes</h1>
        <SidebarToggle />
        
      </main>
    </div>
  );
}
