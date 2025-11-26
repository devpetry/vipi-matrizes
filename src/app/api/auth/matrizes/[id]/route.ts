import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// GET - Obter matriz específica
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const rows = await query(
      `SELECT
         id, codigo, descricao, imagem_url, tipo_matriz,
         numero_inicial, numero_final, observacoes,
         criado_em, criado_por, atualizado_em, atualizado_por
       FROM matrizes
       WHERE id = $1
       AND data_exclusao IS NULL`,
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Matriz não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("Erro ao buscar matriz:", error);
    return NextResponse.json(
      { error: "Erro ao buscar matriz" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar matriz
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const {
      codigo,
      descricao,
      imagem_url,
      tipo_matriz,
      numero_inicial,
      numero_final,
      observacoes,
      atualizado_por,
    } = body;

    if (!codigo || !descricao) {
      return NextResponse.json(
        { error: "Campos 'codigo' e 'descricao' são obrigatórios." },
        { status: 400 }
      );
    }

    const rows = await query(
      `UPDATE matrizes
       SET codigo = $1,
           descricao = $2,
           imagem_url = $3,
           tipo_matriz = $4,
           numero_inicial = $5,
           numero_final = $6,
           observacoes = $7,
           atualizado_em = NOW(),
           atualizado_por = $8
       WHERE id = $9
       AND data_exclusao IS NULL
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
        atualizado_por || null,
        id,
      ]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Matriz não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("Erro ao atualizar matriz:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar matriz" },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const rows = await query(
      `UPDATE matrizes
       SET data_exclusao = NOW()
       WHERE id = $1
       AND data_exclusao IS NULL
       RETURNING id`,
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Matriz não encontrada ou já excluída" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Matriz excluída com sucesso (soft delete)" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao excluir matriz:", error);
    return NextResponse.json(
      { error: "Erro interno ao excluir matriz" },
      { status: 500 }
    );
  }
}
