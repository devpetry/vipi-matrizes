import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// GET - Listar todas as matrizes
export async function GET() {
  try {
    const result = await query(
      `SELECT
         id, codigo, descricao, imagem_url, tipo_matriz,
         numero_inicial, numero_final, observacoes,
         criado_em, criado_por, atualizado_em, atualizado_por
       FROM matrizes
       WHERE data_exclusao IS NULL
       ORDER BY id ASC`,
      []
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro ao buscar matrizes:", error);
    return NextResponse.json(
      { error: "Erro ao buscar matrizes" },
      { status: 500 }
    );
  }
}

// POST - Criar nova matriz
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      codigo,
      descricao,
      imagem_url,
      tipo_matriz,
      numero_inicial,
      numero_final,
      observacoes,
      criado_por,
    } = body;

    if (!codigo || !descricao) {
      return NextResponse.json(
        { error: "Campos 'codigo' e 'descricao' são obrigatórios." },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO matrizes
       (codigo, descricao, imagem_url, tipo_matriz, numero_inicial, numero_final, observacoes,
        criado_em, criado_por, atualizado_em, atualizado_por)
       VALUES ($1, $2, $3, $4, $5, $6, $7,
               NOW(), $8, NOW(), $8)
       RETURNING
         id, codigo, descricao, imagem_url, tipo_matriz,
         numero_inicial, numero_final, observacoes,
         criado_em, criado_por, atualizado_em, atualizado_por`,
      [
        codigo,
        descricao,
        imagem_url || null,
        tipo_matriz || null,
        numero_inicial || null,
        numero_final || null,
        observacoes || null,
        criado_por || null,
      ]
    );

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Erro ao criar matriz:", error);
    return NextResponse.json(
      { error: "Erro ao criar matriz" },
      { status: 500 }
    );
  }
}
