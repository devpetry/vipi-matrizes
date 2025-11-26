"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  ItemSchema,
  ItemEditSchema,
  TItemSchema,
  TItemEditSchema,
} from "@/schemas/auth";

type FormErrors =
  | Partial<Record<keyof TItemSchema, string>>
  | Partial<Record<keyof TItemEditSchema, string>>;

interface ModalItensProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  itemId?: number | null;
}

export default function ModalItens({
  isOpen,
  onClose,
  onSaved,
  itemId,
}: ModalItensProps) {
  const editMode = Boolean(itemId);

  const [descricao, setDescricao] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [valor, setValor] = useState("");

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (isOpen && editMode && itemId) {
      setDescricao("");
      setQuantidade("");
      setValor("");
      setLoading(true);

      fetch(`/api/auth/itens/${itemId}`)
        .then(async (res) => {
          if (!res.ok) throw new Error("Falha no GET");
          const data = await res.json();
          setDescricao(data.descricao || "");
          setQuantidade(String(data.quantidade || ""));
          setValor(String(data.valor || ""));
        })
        .catch(() => {
          alert("Erro ao carregar informações do item.");
          onClose();
        })
        .finally(() => setLoading(false));
    }

    if (!isOpen) setErrors({});
  }, [isOpen, itemId, editMode, onClose]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const descricaoF = formData.get("descricao");
    const quantidadeF = formData.get("quantidade");
    const valorF = formData.get("valor");

    const data = {
      descricao: descricaoF,
      quantidade: quantidadeF,
      valor: valorF,
    };

    const validation = editMode
      ? ItemEditSchema.safeParse(data)
      : ItemSchema.safeParse(data);

    if (!validation.success) {
      const fieldErrors: FormErrors = {};
      for (const issue of validation.error.issues) {
        const key = issue.path[0] as string;
        fieldErrors[key as keyof FormErrors] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setSalvando(true);

    try {
      const url = editMode ? `/api/auth/itens/${itemId}` : "/api/auth/itens";
      const method = editMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          descricao: descricaoF,
          quantidade: quantidadeF,
          valor: valorF,
        }),
      });

      if (res.ok) {
        onSaved();
        onClose();
      } else {
        const errorData = await res.json();
        alert(`Erro: ${errorData.error || res.statusText}`);
      }
    } catch {
      alert("Erro de conexão.");
    } finally {
      setSalvando(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm">
      <div className="bg-[#161B22] p-6 rounded-2xl w-full max-w-md shadow-2xl text-white relative">
        {loading ? (
          <p className="text-center text-[#E0E0E0] py-8">
            Carregando dados do item...
          </p>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
              <h2 className="text-xl font-semibold text-[#E0E0E0]">
                {editMode ? "Editar Item" : "Novo Item"}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white text-2xl"
                aria-label="Fechar Modal"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="descricao"
                >
                  Descrição
                </label>
                <input
                  id="descricao"
                  name="descricao"
                  type="text"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  className={`w-full px-4 py-2 bg-[#0D1117] text-[#E0E0E0] outline-none rounded-xl 
                    ${
                      errors.descricao
                        ? "border-2 border-[#FF5252]"
                        : "focus:ring-2 focus:ring-[#2196F3]"
                    }`}
                />
                {errors.descricao && (
                  <p className="text-[#FF5252] text-xs mt-1">
                    {errors.descricao}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="quantidade"
                >
                  Quantidade
                </label>
                <input
                  id="quantidade"
                  name="quantidade"
                  type="text"
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value)}
                  className={`w-full px-4 py-2 bg-[#0D1117] text-[#E0E0E0] outline-none rounded-xl 
                    ${
                      errors.quantidade
                        ? "border-2 border-[#FF5252]"
                        : "focus:ring-2 focus:ring-[#2196F3]"
                    }`}
                />
                {errors.quantidade && (
                  <p className="text-[#FF5252] text-xs mt-1">
                    {errors.quantidade}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="valor"
                >
                  Valor
                </label>
                <input
                  id="valor"
                  name="valor"
                  type="text"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  className={`w-full px-4 py-2 bg-[#0D1117] text-[#E0E0E0] outline-none rounded-xl 
                    ${
                      errors.valor
                        ? "border-2 border-[#FF5252]"
                        : "focus:ring-2 focus:ring-[#2196F3]"
                    }`}
                />
                {errors.valor && (
                  <p className="text-[#FF5252] text-xs mt-1">{errors.valor}</p>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-gray-600 hover:bg-gray-700 text-[#161B22] font-bold py-2 px-4 rounded-xl disabled:opacity-50"
                  disabled={salvando}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className={`${
                    salvando
                      ? "bg-[#2196F3]/50 cursor-not-allowed"
                      : "bg-[#2196F3] hover:bg-[#2196F3]/75"
                  } text-[#161B22] font-bold py-2 px-4 rounded-xl transition`}
                >
                  {salvando ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
