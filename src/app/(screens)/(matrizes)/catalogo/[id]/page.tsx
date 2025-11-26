import { notFound } from "next/navigation";
import Image from "next/image";

interface Matriz {
  id: number;
  codigo: string;
  descricao: string;
  tipo_matriz?: string;
  numero_inicial?: number;
  numero_final?: number;
  imagem_url?: string;
  observacoes?: string;
}

async function getMatriz(id: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/matrizes/${id}`,
    { cache: "no-store" }
  );

  if (!res.ok) return null;

  return res.json() as Promise<Matriz>;
}

export default async function MatrizPage({
  params,
}: {
  params: { id: string };
}) {
  const matriz = await getMatriz(params.id);

  if (!matriz) return notFound();

  return (
    <main className="min-h-screen bg-[#0D1117] p-8 sm:p-12 text-[#E0E0E0]">
      <div className="flex flex-col sm:flex-row gap-10 items-start sm:items-start">
        <div className="flex-shrink-0 w-full sm:w-1/3 bg-gray-800 rounded-2xl p-2 shadow-lg">
          <Image
            src={matriz.imagem_url || "/images/default.png"}
            alt={`Imagem da ${matriz.descricao}`}
            width={600}
            height={600}
            className="w-full h-auto rounded-xl object-contain"
          />
        </div>

        <div className="flex-1 text-gray-200 space-y-3">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-8 text-center sm:text-left">
            {matriz.descricao}
          </h1>
          <p>
            <span className="font-semibold">Código:</span> {matriz.codigo}
          </p>
          <p>
            <span className="font-semibold">Tipo:</span>{" "}
            {matriz.tipo_matriz || "Sem categoria"}
          </p>
          <p>
            <span className="font-semibold">Número inicial:</span>{" "}
            {matriz.numero_inicial ?? "N/A"}
          </p>
          <p>
            <span className="font-semibold">Número final:</span>{" "}
            {matriz.numero_final ?? "N/A"}
          </p>
          {matriz.observacoes && (
            <p>
              <span className="font-semibold">Observações:</span>{" "}
              {matriz.observacoes}
            </p>
          )}
        </div>
      </div>
      
      <div className="mt-6 mb-6">
        <a
          href="/catalogo"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-xl transition-all duration-300"
        >
          ← Voltar para o catálogo
        </a>
      </div>
    </main>
  );
}
