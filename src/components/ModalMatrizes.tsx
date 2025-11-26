"use client";

import { useEffect, useState, FormEvent } from "react";

interface ModalMatrizesProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  matrizId: number | null;
  mode: "create" | "edit";
}

export default function ModalMatrizes({
  isOpen,
  onClose,
  onSaved,
  matrizId,
  mode,
}: ModalMatrizesProps) {
  const [codigo, setCodigo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState("");
  const [numeroInicial, setNumeroInicial] = useState("");
  const [numeroFinal, setNumeroFinal] = useState("");

  const [loading, setLoading] = useState(false);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    async function carregarMatriz() {
      if (!matrizId) return;
      setLoading(true);

      try {
        const res = await fetch(`/api/auth/matrizes/${matrizId}`);
        const data = await res.json();

        setCodigo(data.codigo || "");
        setDescricao(data.descricao || "");
        setTipo(data.tipo_matriz || "");
        setNumeroInicial(data.numero_inicial || "");
        setNumeroFinal(data.numero_final || "");
      } catch {
        alert("Erro ao carregar matriz.");
      } finally {
        setLoading(false);
      }
    }

    if (isOpen && mode === "edit") carregarMatriz();
  }, [isOpen, mode, matrizId]);

  useEffect(() => {
    if (!isOpen) {
      setCodigo("");
      setDescricao("");
      setTipo("");
      setNumeroInicial("");
      setNumeroFinal("");
      setLoading(false);
      setSalvando(false);
    }
  }, [isOpen]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSalvando(true);

    const body = {
      codigo,
      descricao,
      tipo_matriz: tipo,
      numero_inicial: numeroInicial ? Number(numeroInicial) : null,
      numero_final: numeroFinal ? Number(numeroFinal) : null,
    };

    const url =
      mode === "create"
        ? "/api/auth/matrizes"
        : `/api/auth/matrizes/${matrizId}`;

    const method = mode === "create" ? "POST" : "PUT";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        alert("Erro ao salvar matriz");
        return;
      }

      onSaved();
      onClose();
    } catch {
      alert("Erro ao salvar matriz.");
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
            {mode === "create" ? "Nova Matriz" : "Editar Matriz"}
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
              <label className="block mb-1 text-sm">Código</label>
              <input
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                className="w-full px-4 h-[44px] bg-[#0D1117] text-[#E0E0E0] rounded-xl border border-gray-700 outline-none hover:border-[#2196F3]/50 focus:border-[#2196F3]"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block mb-1 text-sm">Descrição</label>
              <input
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="w-full px-4 h-[44px] bg-[#0D1117] text-[#E0E0E0] rounded-xl border border-gray-700 outline-none hover:border-[#2196F3]/50 focus:border-[#2196F3]"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block mb-1 text-sm">Tipo da Matriz</label>
              <input
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                placeholder="ex: sola, cabedal..."
                className="w-full px-4 h-[44px] bg-[#0D1117] text-[#E0E0E0] rounded-xl border border-gray-700 outline-none hover:border-[#2196F3]/50 focus:border-[#2196F3]"
              />
            </div>

            <div className="flex gap-4">
              <div className="mb-4 flex-1">
                <label className="block mb-1 text-sm">Número Inicial</label>
                <input
                  type="number"
                  value={numeroInicial}
                  onChange={(e) => setNumeroInicial(e.target.value)}
                  className="w-full px-4 h-[44px] bg-[#0D1117] text-[#E0E0E0] rounded-xl border border-gray-700 outline-none hover:border-[#2196F3]/50 focus:border-[#2196F3]"
                />
              </div>

              <div className="mb-4 flex-1">
                <label className="block mb-1 text-sm">Número Final</label>
                <input
                  type="number"
                  value={numeroFinal}
                  onChange={(e) => setNumeroFinal(e.target.value)}
                  className="w-full px-4 h-[44px] bg-[#0D1117] text-[#E0E0E0] rounded-xl border border-gray-700 outline-none hover:border-[#2196F3]/50 focus:border-[#2196F3]"
                />
              </div>
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
