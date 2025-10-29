"use client";

import { FormEvent, useEffect, useState } from "react";
import { UsuarioEditSchema, TUsuarioEditSchema } from "@/schemas/auth";

type FormErrors = Partial<Record<keyof TUsuarioEditSchema, string>>;
interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated: () => void;
  userId: number | null;
}

const TIPOS_USUARIO = [
  { id: 1, nome: "ADMIN" },
  { id: 2, nome: "GERENTE" },
  { id: 3, nome: "COLABORADOR" },
];

const getTipoIdByNome = (nome?: string | null): string => {
  if (!nome) return "";
  const tipo = TIPOS_USUARIO.find((t) => t.nome === nome.toUpperCase());
  return tipo ? String(tipo.id) : "";
};

export default function EditUserModal({
  isOpen,
  onClose,
  onUserUpdated,
  userId,
}: EditUserModalProps) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const [tipoUsuarioSelecionado, setTipoUsuarioSelecionado] =
    useState<string>("");

  const [loading, setLoading] = useState(false);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      setNome("");
      setEmail("");
      setTipoUsuarioSelecionado("");

      setLoading(true);
      const fetchUser = async () => {
        try {
          const res = await fetch(`/api/auth/usuarios/${userId}`);
          if (res.ok) {
            const data = await res.json();
            setNome(data.nome || "");
            setEmail(data.email || "");
            const tipoId = getTipoIdByNome(data.tipo_usuario);
            setTipoUsuarioSelecionado(tipoId);
          } else {
            console.error("Erro ao carregar usuário:", res.statusText);
            alert("Erro ao carregar informações do usuário.");
            onClose();
          }
        } catch (error) {
          console.error("Erro na requisição GET:", error);
          alert("Falha ao carregar usuário.");
          onClose();
        } finally {
          setLoading(false);
        }
      };
      fetchUser();
    } else if (!isOpen){
      setErrors({});
    }
  }, [isOpen, userId, onClose]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const nome = formData.get("nome");
    const email = formData.get("email");
    const tipo_usuario = formData.get("tipo_usuario");
    const senha = formData.get("senha");

    const data = {
      nome,
      email,
      tipo_usuario,
      senha,
    };

    const validation = UsuarioEditSchema.safeParse(data);

    if (!validation.success) {
      const fieldErrors: FormErrors = {};
      for (const issue of validation.error.issues) {
        const key = issue.path[0] as keyof FormErrors;
        fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    if (!userId) return;

    setSalvando(true);

    const tipoUsuarioToUpdate =
      tipoUsuarioSelecionado !== "" ? tipoUsuarioSelecionado : "";

    try {
      const res = await fetch(`/api/auth/usuarios/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          email,
          tipo_usuario: tipoUsuarioToUpdate,
        }),
      });

      if (res.ok) {
        onUserUpdated();
        onClose();
      } else {
        const errorData = await res.json();
        console.error("Erro ao atualizar usuário:", errorData);
        alert(`Erro ao atualizar: ${errorData.error || res.statusText}`);
      }
    } catch (error) {
      console.error("Erro na requisição PUT:", error);
      alert("Erro de conexão ao atualizar usuário.");
    } finally {
      setSalvando(false);
    }
  };

  if (!isOpen || !userId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm">
      <div className="bg-[#161B22] p-6 rounded-2xl w-full max-w-md shadow-2xl text-white relative">
        {loading ? (
          <p className="text-center text-[#E0E0E0] py-8">
            Carregando dados do usuário...
          </p>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
              <h2 className="text-xl font-semibold text-[#E0E0E0]">
                Editar Usuário
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
                  className="block text-sm font-medium mb-1 text-[#E0E0E0]"
                  htmlFor="nome"
                >
                  Nome
                </label>
                <input
                  id="nome"
                  name="nome"
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className={`w-full px-4 py-2 bg-[#0D1117] text-[#E0E0E0] outline-none rounded-xl 
                  ${
                    errors.nome
                      ? "border-2 border-[#FF5252]"
                      : "focus:ring-2 focus:ring-[#2196F3]"
                  }`}
                />
                {errors.nome && (
                  <p className="text-[#FF5252] text-xs mt-1">{errors.nome}</p>
                )}
              </div>

              <div className="mb-4">
                <label
                  className="block text-sm font-medium mb-1 text-[#E0E0E0]"
                  htmlFor="email"
                >
                  E-mail
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-4 py-2 bg-[#0D1117] text-[#E0E0E0] outline-none rounded-xl 
                  ${
                    errors.email
                      ? "border-2 border-[#FF5252]"
                      : "focus:ring-2 focus:ring-[#2196F3]"
                  }`}
                />
                {errors.email && (
                  <p className="text-[#FF5252] text-xs mt-1">{errors.email}</p>
                )}
              </div>
              <div className="mb-4">
                <label
                  className="block text-sm font-medium mb-1 text-[#E0E0E0]"
                  htmlFor="tipo_usuario"
                >
                  Tipo de Usuário
                </label>
                <select
                  name="tipo_usuario"
                  id="tipo_usuario"
                  value={tipoUsuarioSelecionado}
                  onChange={(e) => setTipoUsuarioSelecionado(e.target.value)}
                  className={`w-full px-4 py-2 bg-[#0D1117] text-[#E0E0E0] outline-none rounded-xl appearance-none cursor-pointer
              ${"focus:ring-2 focus:ring-[#2196F3]"}`}
                >
                  <option value="" disabled>
                    Selecione o tipo de usuário
                  </option>
                  {TIPOS_USUARIO.map((tipo) => (
                    <option key={tipo.id} value={String(tipo.id)}>
                      {tipo.nome}
                    </option>
                  ))}
                </select>
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
