"use client";

import { FormEvent, useEffect, useState } from "react";
import { UsuarioSchema, TUsuarioSchema } from "@/schemas/auth";

type FormErrors = Partial<Record<keyof TUsuarioSchema, string>>;

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserAdded: () => void;
}

const TIPOS_USUARIO = [
  { id: 1, nome: "ADMIN" },
  { id: 2, nome: "GERENTE" },
  { id: 3, nome: "COLABORADOR" },
];

export default function AddUserModal({
  isOpen,
  onClose,
  onUserAdded,
}: AddUserModalProps) {
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (isOpen) {
    } else if (!isOpen){
      setErrors({});
    }
  }, [isOpen]);

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

    const validation = UsuarioSchema.safeParse(data);

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
      const res = await fetch("/api/auth/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });

      if (res.ok) {
        onUserAdded();
        onClose();
      } else {
        const errorData = await res.json();
        console.error("Erro ao salvar usuário:", errorData);
        alert(`Erro ao criar usuário: ${errorData.error || res.statusText}`);
      }
    } catch (error) {
      console.error("Erro na requisição POST:", error);
      alert("Erro de conexão ao criar usuário.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm">
      <div className="bg-[#161B22] p-6 rounded-2xl w-full max-w-md shadow-2xl text-white">
        <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
          <h2 className="text-xl font-semibold text-[#E0E0E0]">Novo Usuário</h2>
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
              htmlFor="nome"
            >
              Nome
            </label>
            <input
              name="nome"
              id="nome"
              type="text"
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
              name="email"
              id="email"
              type="text"
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
              className={`w-full px-4 py-2 bg-[#0D1117] text-[#E0E0E0] outline-none rounded-xl appearance-none cursor-pointer
              ${"focus:ring-2 focus:ring-[#2196F3]"}`}
              defaultValue=""
            >
              <option value="" disabled>
                Selecione o tipo de usuário
              </option>
              {TIPOS_USUARIO.map((tipo) => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.nome}
                </option>
              ))}
            </select>
            {/* {errors.tipo_usuario && (
              <p className="text-[#FF5252] text-xs mt-1">{errors.tipo_usuario}</p>
            )} */}
          </div>
          <div className="mb-4">
            <label
              className="block text-sm font-medium mb-1 text-[#E0E0E0]"
              htmlFor="senha"
            >
              Senha
            </label>
            <input
              name="senha"
              id="senha"
              type="password"
              className={`w-full px-4 py-2 bg-[#0D1117] text-[#E0E0E0] outline-none rounded-xl 
              ${
                errors.senha
                  ? "border-2 border-[#FF5252]"
                  : "focus:ring-2 focus:ring-[#2196F3]"
              }`}
            />
            {errors.senha && (
              <p className="text-[#FF5252] text-xs mt-1">{errors.senha}</p>
            )}
            <label className="text-xs text-[#9E9E9E] mt-1">
              * Recomendamos o novo usuário alterar a senha no primeiro login
            </label>
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
