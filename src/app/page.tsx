import SidebarToggle from "@/components/SidebarToggle";
import Image from "next/image";

interface Matriz {
  id: number;
  descricao: string;
  tipo_matriz?: string;
  imagem_url?: string;
}

async function getMatrizes() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/matrizes`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error("Erro ao carregar matrizes");
  }

  return res.json();
}

export default async function Home() {
  const matrizes = await getMatrizes();

  return (
    <main className="p-12 bg-[#0D1117] min-h-screen text-[#E0E0E0]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-black">Catálogo de Matrizes</h1>
        <SidebarToggle />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {matrizes.map((m: Matriz) => (
          <a
            key={m.id}
            href={`/matrizes/${m.id}`}
            className="group bg-white p-5 rounded-xl shadow-md border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
          >
            {/* Imagem */}
            <div className="w-full h-40 rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center">
              <Image
                src={m.imagem_url || "/images/default.png"}
                alt={`Imagem da ${m.descricao}`}
                width={200}
                height={200}
                className="object-cover w-full h-full"
              />
            </div>

            {/* Infos */}
            <div className="mt-4 flex-1">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition">
                {m.descricao}
              </h3>

              <p className="text-sm text-gray-600 mt-1">
                {m.tipo_matriz || "Sem categoria"}
              </p>
            </div>

            {/* Ver detalhes */}
            <span className="mt-4 text-blue-600 font-medium group-hover:underline">
              Ver detalhes →
            </span>
          </a>
        ))}
      </div>
    </main>
  );
}
