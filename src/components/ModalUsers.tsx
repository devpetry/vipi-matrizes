"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  UsuarioSchema,
  UsuarioEditSchema,
  TUsuarioSchema,
  TUsuarioEditSchema,
} from "@/schemas/auth";

type FormErrors = Partial<
  Record<keyof TUsuarioSchema | keyof TUsuarioEditSchema, string>
>;

interface ModalUsersProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  userId?: number | null;
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

export default function ModalUsers({
  isOpen,
  onClose,
  onSaved,
  userId,
}: ModalUsersProps) {
  const editMode = Boolean(userId);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [tipoUsuario, setTipoUsuario] = useState("");
  const [senha, setSenha] = useState("");

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (isOpen && editMode && userId) {
      setNome("");
      setEmail("");
      setSenha("");
      setTipoUsuario("");
      setLoading(true);

      fetch(`/api/auth/usuarios/${userId}`)
        .then(async (res) => {
          if (!res.ok) throw new Error("Falha no GET");
          const data = await res.json();

          setNome(data.nome || "");
          setEmail(data.email || "");
          const tipoId = getTipoIdByNome(data.tipo_usuario);
          setTipoUsuario(tipoId || "");
        })
        .catch(() => {
          alert("Erro ao carregar informações do usuário.");
          onClose();
        })
        .finally(() => setLoading(false));
    }

    if (!isOpen) setErrors({});
  }, [isOpen, editMode, userId, onClose]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    const formData = new FormData(e.currentTarget);

    const data = {
      nome: formData.get("nome"),
      email: formData.get("email"),
      tipo_usuario: formData.get("tipo_usuario"),
      senha: formData.get("senha"),
    };

    const validation = editMode
      ? UsuarioEditSchema.safeParse(data)
      : UsuarioSchema.safeParse(data);

    if (!validation.success) {
      const fieldErrors: FormErrors = {};
      for (const issue of validation.error.issues) {
        const key = issue.path[0] as keyof FormErrors;
        fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setSalvando(true);

    try {
      const url = editMode
        ? `/api/auth/usuarios/${userId}`
        : "/api/auth/usuarios";

      const method = editMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: data.nome,
          email: data.email,
          tipo_usuario: data.tipo_usuario,
          ...(editMode ? {} : { senha: data.senha }),
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
            Carregando dados do usuário...
          </p>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
              <h2 className="text-xl font-semibold text-[#E0E0E0]">
                {editMode ? "Editar Usuário" : "Novo Usuário"}
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
              {/* Nome */}
              <div className="mb-4">
                <label
                  className="block text-sm font-medium mb-1"
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

              {/* Email */}
              <div className="mb-4">
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="email"
                >
                  E-mail
                </label>
                <input
                  id="email"
                  name="email"
                  type="text"
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

              {/* Tipo */}
              <div className="mb-4">
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="tipo_usuario"
                >
                  Tipo de Usuário
                </label>
                <select
                  id="tipo_usuario"
                  name="tipo_usuario"
                  value={tipoUsuario}
                  onChange={(e) => setTipoUsuario(e.target.value)}
                  className="w-full px-4 py-2 bg-[#0D1117] text-[#E0E0E0] outline-none rounded-xl appearance-none cursor-pointer focus:ring-2 focus:ring-[#2196F3]"
                >
                  <option value="" disabled>
                    Selecione o tipo de usuário
                  </option>

                  {TIPOS_USUARIO.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Senha (somente no modo adicionar) */}
              {!editMode && (
                <div className="mb-4">
                  <label
                    className="block text-sm font-medium mb-1"
                    htmlFor="senha"
                  >
                    Senha
                  </label>
                  <input
                    id="senha"
                    name="senha"
                    type="password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className={`w-full px-4 py-2 bg-[#0D1117] text-[#E0E0E0] outline-none rounded-xl 
                      ${
                        errors.senha
                          ? "border-2 border-[#FF5252]"
                          : "focus:ring-2 focus:ring-[#2196F3]"
                      }`}
                  />
                  {errors.senha && (
                    <p className="text-[#FF5252] text-xs mt-1">
                      {errors.senha}
                    </p>
                  )}
                  <label className="text-xs text-[#9E9E9E] mt-1">
                    * Recomendamos alterar a senha no primeiro login
                  </label>
                </div>
              )}

              {/* Botões */}
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
