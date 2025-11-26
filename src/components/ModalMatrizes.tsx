"use client";

import { useEffect, useState, FormEvent } from "react";
// 1. Importa o ícone X do lucide-react
import { X } from "lucide-react";

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
  const [observacoes, setObservacoes] = useState("");

  const [imagemFile, setImagemFile] = useState<File | null>(null);
  const [imagemUrl, setImagemUrl] = useState<string>("");
  const [removerImagem, setRemoverImagem] = useState(false);

  const [loading, setLoading] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [uploading, setUploading] = useState(false);

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
        setImagemUrl(data.imagem_url || "");
        setObservacoes(data.observacoes || "");
        setRemoverImagem(false);
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
      setObservacoes("");
      setImagemFile(null);
      setImagemUrl("");
      setRemoverImagem(false);
      setLoading(false);
      setSalvando(false);
      setUploading(false);
    }
  }, [isOpen]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSalvando(true);

    let uploadedImageUrl = imagemUrl;

    if (imagemFile) {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", imagemFile);

      try {
        const uploadRes = await fetch("/api/upload-cloudinary", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) throw new Error("Erro ao fazer upload da imagem");

        const data = await uploadRes.json();
        uploadedImageUrl = data.url;
      } catch {
        alert("Erro ao enviar imagem");
        setUploading(false);
        setSalvando(false);
        return;
      } finally {
        setUploading(false);
      }
    }

    let finalImageUrl: string | null = uploadedImageUrl;

    // Se a intenção for remover E não foi feito um novo upload de arquivo, a URL final é null
    if (removerImagem && !imagemFile) {
      finalImageUrl = null;
    }

    // Se um novo arquivo foi selecionado, ele tem precedência
    if (imagemFile) {
      finalImageUrl = uploadedImageUrl;
    }

    const body = {
      codigo,
      descricao,
      tipo_matriz: tipo,
      numero_inicial: numeroInicial !== "" ? Number(numeroInicial) : null,
      numero_final: numeroFinal !== "" ? Number(numeroFinal) : null,
      imagem_url: finalImageUrl,
      observacoes,
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

  // Função para limpar a imagem (apenas no cliente)
  const handleRemoveImage = () => {
    setImagemFile(null);
    setImagemUrl("");
    setRemoverImagem(true);
  };

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
            {/* ... outros campos ... */}
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

            <div className="mb-4">
              <label className="block mb-1 text-sm">Observações</label>
              <textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                className="w-full px-4 py-2 bg-[#0D1117] text-[#E0E0E0] rounded-xl border border-gray-700 outline-none hover:border-[#2196F3]/50 focus:border-[#2196F3]"
                rows={4}
                placeholder="Digite observações sobre a matriz..."
              />
            </div>

            {/* Imagem (Area modificada) */}
            <div className="mb-4">
              <label className="block mb-1 text-sm">Imagem</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setImagemFile(e.target.files[0]);
                    setRemoverImagem(false);
                  }
                }}
                className="w-full text-sm text-gray-200"
              />

              {/* Visualização da imagem com o botão X para remover */}
              {imagemUrl && !removerImagem ? (
                // 2. Adiciona position relative para que o botão X fique absolute
                <div className="relative mt-4 inline-block">
                  <img
                    src={imagemUrl}
                    alt="Preview"
                    className="h-24 object-contain rounded"
                  />
                  {/* Botão de Remoção com ícone X */}
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    // Posiciona o botão no canto superior direito da imagem
                    className="absolute -top-2 -right-2 bg-red-600/90 text-white rounded-full p-[2px] shadow-lg hover:bg-red-500 transition-colors"
                    aria-label="Remover imagem atual"
                  >
                    {/* Ícone X do Lucide React */}
                    <X size={16} />
                  </button>
                </div>
              ) : imagemFile && !removerImagem ? (
                <p className="mt-2 text-sm text-yellow-400">
                  Nova imagem selecionada: {imagemFile.name}
                </p>
              ) : removerImagem && !imagemFile && mode === "edit" ? (
                <p className="mt-2 text-sm text-red-400">
                  A imagem será removida ao salvar.
                </p>
              ) : null}
            </div>
            {/* ... Botões ... */}
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
                disabled={salvando || uploading}
                className={`${
                  salvando || uploading
                    ? "bg-[#2196F3]/50 cursor-not-allowed"
                    : "bg-[#2196F3] hover:bg-[#2196F3]/75"
                } text-[#161B22] font-bold py-2 px-4 rounded-xl transition`}
              >
                {salvando
                  ? "Salvando..."
                  : uploading
                    ? "Enviando imagem..."
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
