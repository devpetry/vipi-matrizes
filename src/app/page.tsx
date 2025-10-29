import SidebarToggle from "@/components/SidebarToggle";
import Image from "next/image";

const matrizes = [
  { id: 1, nome: "Matriz 1", categoria: "Categoria X" },
  { id: 2, nome: "Matriz 2", categoria: "Categoria X" },
  { id: 3, nome: "Matriz 3", categoria: "Categoria X" },
  { id: 4, nome: "Matriz 4", categoria: "Categoria X" },
  { id: 5, nome: "Matriz 5", categoria: "Categoria X" },
  { id: 6, nome: "Matriz 6", categoria: "Categoria X" },
  { id: 7, nome: "Matriz 7", categoria: "Categoria X" },
  { id: 8, nome: "Matriz 8", categoria: "Categoria X" },
  { id: 9, nome: "Matriz 9", categoria: "Categoria X" },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center">
      <main>
        <h1 className="text-3xl font-black mt-4">Catálogo de Matrizes</h1>
        <SidebarToggle />
        {/* Grid de matrizes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8">
          {matrizes.map((m) => (
            <div
              key={m.id}
              className="bg-[#E0E0E0] p-4 rounded-lg shadow-md flex items-center justify-between gap-4"
            >
              <div>
                <h3 className="font-bold text-[#0D1117]">{m.nome}</h3>
                <p className="text-[#0D1117]/75">{m.categoria}</p>
                <a
                  href="#"
                  className="inline-block mt-2 text-[#2196F3] font-medium hover:underline cursor-pointer"
                >
                  Ver Detalhes →
                </a>
              </div>

              <div className="h-20 w-20 flex items-center justify-center rounded-md overflow-hidden bg-[#9E9E9E]">
                <Image
                  src="/images/default.png"
                  alt={`Imagem da ${m.nome}`}
                  width={80}
                  height={80}
                  className="object-cover"
                />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
