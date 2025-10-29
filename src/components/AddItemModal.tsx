"use client";

import { FormEvent, useEffect, useState } from "react";
import { ItemSchema, TItemSchema } from "@/schemas/auth";

type FormErrors = Partial<Record<keyof TItemSchema, string>>;

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemAdded: () => void;
}

export default function AddItemModal({
  isOpen,
  onClose,
  onItemAdded,
}: AddItemModalProps) {
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (isOpen) {
    } else if (!isOpen) {
      setErrors({});
    }
  }, [isOpen]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const descricao = formData.get("descricao");
    const quantidade = formData.get("quantidade");
    const valor = formData.get("valor");

    const data = {
      descricao,
      quantidade,
      valor,
    };

    const validation = ItemSchema.safeParse(data);

    if (!validation.success) {
      const fieldErrors: FormErrors = {};
      for (const issue of validation.error.issues) {
        const key = issue.path[0] as keyof FormErrors;
        fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    try {
      const res = await fetch("/api/auth/itens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });

      if (res.ok) {
        onItemAdded();
        onClose();
      } else {
        const errorData = await res.json();
        console.error("Erro ao salvar item:", errorData);
        alert(`Erro ao criar item: ${errorData.error || res.statusText}`);
      }
    } catch (error) {
      console.error("Erro na requisição POST:", error);
      alert("Erro de conexão ao criar item.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm">
      <div className="bg-[#161B22] p-6 rounded-2xl w-full max-w-md shadow-2xl text-white">
        <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
          <h2 className="text-xl font-semibold text-[#E0E0E0]">Novo Item</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
            aria-label="Fechar Modal"
          >
            &times;
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              className="block text-sm font-medium mb-1 text-[#E0E0E0]"
              htmlFor="descricao"
            >
              Descrição
            </label>
            <input
              name="descricao"
              id="descricao"
              type="text"
              className={`w-full px-4 py-2 bg-[#0D1117] text-[#E0E0E0] outline-none rounded-xl 
              ${
                errors.descricao
                  ? "border-2 border-[#FF5252]"
                  : "focus:ring-2 focus:ring-[#2196F3]"
              }`}
            />
            {errors.descricao && (
              <p className="text-[#FF5252] text-xs mt-1">{errors.descricao}</p>
            )}
          </div>
          <div className="mb-4">
            <label
              className="block text-sm font-medium mb-1 text-[#E0E0E0]"
              htmlFor="quantidade"
            >
              Quantidade
            </label>
            <input
              name="quantidade"
              id="quantidade"
              type="text"
              className={`w-full px-4 py-2 bg-[#0D1117] text-[#E0E0E0] outline-none rounded-xl 
              ${
                errors.quantidade
                  ? "border-2 border-[#FF5252]"
                  : "focus:ring-2 focus:ring-[#2196F3]"
              }`}
            />
            {errors.quantidade && (
              <p className="text-[#FF5252] text-xs mt-1">{errors.quantidade}</p>
            )}
          </div>
          <div className="mb-4">
            <label
              className="block text-sm font-medium mb-1 text-[#E0E0E0]"
              htmlFor="valor"
            >
              Valor
            </label>
            <input
              name="valor"
              id="valor"
              type="text"
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

          {/* Botões de Ação */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-[#161B22] font-bold py-2 px-4 rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-[#2196F3] hover:bg-[#2196F3]/75 text-[#161B22] font-bold py-2 px-4 rounded-xl"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
