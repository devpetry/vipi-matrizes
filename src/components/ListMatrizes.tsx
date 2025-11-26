"use client";

import { useEffect, useState } from "react";
import { Edit, Plus, Trash2 } from "lucide-react";
import ModalMatrizes from "./ModalMatrizes";

interface Matriz {
  id: number;
  codigo: string;
  descricao: string;
  tipo_matriz: string | null;
  numero_inicial: number | null;
  numero_final: number | null;
}

export default function ListMatrizes() {
  const [matrizes, setMatrizes] = useState<Matriz[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [matrizSelecionada, setMatrizSelecionada] = useState<number | null>(
    null
  );

  async function carregarMatrizes() {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/matrizes");
      const data = await res.json();
      setMatrizes(data);
    } catch {
      alert("Erro ao carregar matrizes.");
    }
    setLoading(false);
  }

  function editarMatriz(id: number) {
    setMatrizSelecionada(id);
    setIsEditModalOpen(true);
  }

  async function deletarMatriz(id: number) {
    if (!confirm("Tem certeza que deseja excluir esta matriz?")) return;

    try {
      const res = await fetch(`/api/auth/matrizes/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        alert("Não foi possível excluir a matriz.");
      }

      carregarMatrizes();
    } catch {
      alert("Erro ao excluir matriz.");
    }
  }

  useEffect(() => {
    carregarMatrizes();
  }, []);

  if (loading)
    return (
      <p className="flex justify-center text-center py-8 text-[#E0E0E0]">
        Carregando matrizes...
      </p>
    );

  return (
    <>
      <div className="bg-[#0D1117] p-6 rounded-2xl shadow-md">
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center bg-[#2196F3] hover:bg-[#2196F3]/75 text-[#0D1117] font-bold py-2 px-4 rounded-xl transition duration-200 shadow-md"
        >
          <Plus size={16} />
          Adicionar
        </button>

        <table className="w-full text-center border-collapse mt-6">
          <thead>
            <tr className="border-b border-gray-700 text-[#E0E0E0]">
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">Código</th>
              <th className="px-3 py-2">Descrição</th>
              <th className="px-3 py-2">Tipo</th>
              <th className="px-3 py-2">Numeração</th>
              <th className="px-3 py-2 text-center">Ações</th>
            </tr>
          </thead>

          <tbody>
            {matrizes.map((m) => (
              <tr
                key={m.id}
                className="border-b border-gray-800 text-[#9E9E9E] hover:bg-[#161B22] transition"
              >
                <td className="px-3 py-2">{m.id}</td>
                <td className="px-3 py-2">{m.codigo}</td>
                <td className="px-3 py-2">{m.descricao}</td>
                <td className="px-3 py-2">{m.tipo_matriz ?? "-"}</td>

                <td className="px-3 py-2">
                  {m.numero_inicial && m.numero_final
                    ? `${m.numero_inicial} - ${m.numero_final}`
                    : "-"}
                </td>

                <td className="px-3 py-2 text-center">
                  <button
                    onClick={() => editarMatriz(m.id)}
                    className="bg-[#2196F3] hover:bg-[#2196F3]/75 text-[#0D1117] p-2 rounded-xl mr-2"
                  >
                    <Edit size={18} />
                  </button>

                  <button
                    onClick={() => deletarMatriz(m.id)}
                    className="bg-[#FF5252] hover:bg-[#FF5252]/75 text-[#0D1117] p-2 rounded-xl"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {matrizes.length === 0 && (
          <p className="text-center text-gray-400 mt-6">
            Nenhuma matriz encontrada.
          </p>
        )}
      </div>

      <ModalMatrizes
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSaved={carregarMatrizes}
        mode="create"
        matrizId={null}
      />

      <ModalMatrizes
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setMatrizSelecionada(null);
        }}
        onSaved={carregarMatrizes}
        mode="edit"
        matrizId={matrizSelecionada}
      />
    </>
  );
}
