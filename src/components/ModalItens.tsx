"use client";

import { useState, useEffect, FormEvent } from "react";
import {
  ItemSchema,
  ItemEditSchema,
  TItemSchema,
  TItemEditSchema,
} from "@/schemas/auth";
import { NumericFormat } from "react-number-format";

interface ModalItensProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  itemId: number | null;
  mode: "create" | "edit";
}

type FormErrors = Partial<
  Record<keyof TItemSchema | keyof TItemEditSchema, string>
>;

export default function ModalItens({
  isOpen,
  onClose,
  onSaved,
  itemId,
  mode,
}: ModalItensProps) {
  const [descricao, setDescricao] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [valor, setValor] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    async function carregarItem() {
      if (!itemId) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/auth/itens/${itemId}`);
        if (!res.ok) {
          alert("Erro ao carregar item");
          return;
        }

        const data = await res.json();

        setDescricao(data.descricao || "");
        setQuantidade(String(data.quantidade || ""));

        const valorFormatado = Number(data.valor)
          .toFixed(2)
          .replace(".", ",")
          .replace(/\B(?=(\d{3})+(?!\d))/g, ".");

        setValor(valorFormatado);
      } catch {
        alert("Erro ao carregar item.");
      } finally {
        setLoading(false);
      }
    }

    if (isOpen) {
      if (mode === "edit") carregarItem();
    }
  }, [isOpen, mode, itemId]);

  useEffect(() => {
    if (!isOpen) {
      setDescricao("");
      setQuantidade("");
      setValor("");
      setErrors({});
      setLoading(false);
      setSalvando(false);
    }
  }, [isOpen]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});

    const valorNumerico = Number(
      valor.replace(/[^\d,-]/g, "").replace(",", ".")
    );

    const dataForm = {
      descricao,
      quantidade: Number(quantidade),
      valor: valorNumerico,
    };

    const validation =
      mode === "edit"
        ? ItemEditSchema.safeParse(dataForm)
        : ItemSchema.safeParse(dataForm);

    if (!validation.success) {
      const errs: FormErrors = {};
      validation.error.issues.forEach((issue) => {
        errs[issue.path[0] as keyof FormErrors] = issue.message;
      });
      setErrors(errs);
      return;
    }

    setSalvando(true);

    try {
      const url =
        mode === "create" ? "/api/auth/itens" : `/api/auth/itens/${itemId}`;

      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          descricao,
          quantidade: Number(quantidade),
          valor: valorNumerico,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.error || "Erro ao salvar item");
        return;
      }

      onSaved();
      onClose();
    } catch {
      alert("Erro ao salvar item.");
    } finally {
      setSalvando(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm">
      <div className="bg-[#161B22] p-6 rounded-2xl w-full max-w-md shadow-2xl text-white">
        <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
          <h2 className="text-xl font-semibold text-[#E0E0E0]">
            {mode === "create" ? "Novo Item" : "Editar Item"}
          </h2>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            &times;
          </button>
        </div>

        {loading ? (
          <p className="text-center py-6 text-[#E0E0E0]">Carregando dados...</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block mb-1 text-sm text-[#E0E0E0]">
                Descrição
              </label>
              <input
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className={`w-full px-4 h-[44px] bg-[#0D1117] text-[#E0E0E0] rounded-xl outline-none border transition ${
                  errors.descricao
                    ? "border-[#FF5252] ring-1 ring-[#FF5252]/40"
                    : "border-gray-700 hover:border-[#2196F3]/50 focus:border-[#2196F3]"
                }`}
              />
              {errors.descricao && (
                <p className="text-[#FF5252] text-xs mt-1">
                  {errors.descricao}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className="block mb-1 text-sm text-[#E0E0E0]">
                Quantidade
              </label>
              <input
                value={quantidade}
                type="number"
                onChange={(e) => setQuantidade(e.target.value)}
                className={`w-full px-4 h-[44px] bg-[#0D1117] text-[#E0E0E0] rounded-xl outline-none border transition ${
                  errors.quantidade
                    ? "border-[#FF5252] ring-1 ring-[#FF5252]/40"
                    : "border-gray-700 hover:border-[#2196F3]/50 focus:border-[#2196F3]"
                }`}
              />
              {errors.quantidade && (
                <p className="text-[#FF5252] text-xs mt-1">
                  {errors.quantidade}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className="block mb-1 text-sm text-[#E0E0E0]">
                Valor (R$)
              </label>

              <NumericFormat
                value={valor}
                onValueChange={(v) => setValor(v.formattedValue)}
                thousandSeparator="."
                decimalSeparator=","
                prefix="R$ "
                decimalScale={2}
                fixedDecimalScale
                allowNegative={false}
                className={`w-full px-4 h-[44px] bg-[#0D1117] text-[#E0E0E0] rounded-xl outline-none border transition ${
                  errors.valor
                    ? "border-[#FF5252] ring-1 ring-[#FF5252]/40"
                    : "border-gray-700 hover:border-[#2196F3]/50 focus:border-[#2196F3]"
                }`}
              />

              {errors.valor && (
                <p className="text-[#FF5252] text-xs mt-1">{errors.valor}</p>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-600 hover:bg-gray-700 text-[#161B22] font-bold px-4 h-[44px] rounded-xl"
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
                {salvando
                  ? "Salvando..."
                  : mode === "create"
                    ? "Salvar"
                    : "Atualizar"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
