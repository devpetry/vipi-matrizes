"use client";

import { useEffect, useState } from "react";
import { Edit, Plus, Trash2 } from "lucide-react";
import ModalItens from "./ModalItens";

interface EstoqueItem {
  id: number;
  descricao: string;
  quantidade: number;
  valor: number;
}

export default function ListItens() {
  const [itens, setItens] = useState<EstoqueItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [itemSelecionado, setItemSelecionado] = useState<number | null>(null);

  async function carregarItens() {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/itens");
      const text = await res.text();
      const data = JSON.parse(text);
      setItens(data);
    } catch (e) {
      console.error("Erro ao carregar itens:", e);
      alert("Falha ao carregar lista de itens.");
    }
    setLoading(false);
  }

  async function editarItem(id: number) {
    setItemSelecionado(id);
    setIsEditModalOpen(true);
  }

  async function deletarItem(id: number) {
    if (!confirm("Tem certeza que deseja excluir este item?")) return;

    try {
      const res = await fetch(`/api/auth/itens/${id}`, { method: "DELETE" });

      if (!res.ok) {
        console.error("Falha ao deletar item. Status:", res.status);
        alert("Não foi possível remover o item.");
      } else {
        alert("Item removido com sucesso!");
      }

      carregarItens();
    } catch (error) {
      console.error("Erro na requisição DELETE:", error);
      alert("Erro de conexão ao tentar excluir o item.");
    }
  }
  useEffect(() => {
    carregarItens();
  }, []);

  if (loading)
    return (
      <p className="flex justify-center text-center py-8 text-[#E0E0E0]">
        Carregando itens...
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

        {/* Tabela de itens */}
        <table className="w-full text-center border-collapse mt-6">
          <thead>
            <tr className="border-b border-gray-700 text-[#E0E0E0]">
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">Descrição</th>
              <th className="px-3 py-2">Quantidade</th>
              <th className="px-3 py-2">Valor (R$)</th>
              <th className="px-3 py-2 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {itens.map((u) => {
              const quantidadeFormatada = String(u.quantidade);
              const valorFormatado = Number(u.valor)
                .toFixed(2)
                .replace(".", ",");

              return (
                <tr
                  key={u.id}
                  className="border-b border-gray-800 text-[#9E9E9E] hover:bg-[#161B22] transition"
                >
                  <td className="px-3 py-2">{u.id}</td>
                  <td className="px-3 py-2">{u.descricao}</td>
                  <td className="px-3 py-2">{quantidadeFormatada}</td>
                  <td className="px-3 py-2">R$ {valorFormatado}</td>

                  <td className="px-3 py-2 text-center">
                    <button
                      onClick={() => editarItem(u.id)}
                      className="bg-[#2196F3] hover:bg-[#2196F3]/75 text-[#0D1117] p-2 rounded-xl mr-2 transition"
                      title="Editar"
                    >
                      <Edit size={18} />
                    </button>

                    <button
                      onClick={() => deletarItem(u.id)}
                      className="bg-[#FF5252] hover:bg-[#FF5252]/75 text-[#0D1117] p-2 rounded-xl transition"
                      title="Excluir"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {itens.length === 0 && (
          <p className="text-center text-gray-400 mt-6">
            Nenhum item encontrado.
          </p>
        )}
      </div>

      <ModalItens
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSaved={carregarItens}
        mode="create"
        itemId={null}
      />

      <ModalItens
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setItemSelecionado(null);
        }}
        onSaved={carregarItens}
        mode="edit"
        itemId={itemSelecionado}
      />
    </>
  );
}
