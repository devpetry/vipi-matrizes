import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// GET - Obter detalhes de um item específico
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const rows = await query(
      `SELECT id, descricao, quantidade, valor, atualizado_em, atualizado_por
       FROM itens
       WHERE id = $1
       AND data_exclusao IS NULL`,
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Item não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("Erro ao buscar item:", error);
    return NextResponse.json({ error: "Erro ao buscar item" }, { status: 500 });
  }
}

// PUT - Atualizar item
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const { descricao, quantidade, valor, atualizado_por } = body;

    if (!descricao || !quantidade || !valor) {
      return NextResponse.json(
        {
          error: "Campos 'descricao', 'quantidade' e 'valor' são obrigatórios.",
        },
        { status: 400 }
      );
    }

    const rows = await query(
      `UPDATE itens
       SET descricao = $1, quantidade = $2, valor = $3,
           atualizado_em = NOW(), atualizado_por = $4
       WHERE id = $5
       AND data_exclusao IS NULL
       RETURNING id, descricao, quantidade, valor, atualizado_em, atualizado_por`,
      [descricao, quantidade, valor, atualizado_por || null, id]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Item não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("Erro ao atualizar item:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar item" },
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

    if (!id) {
      return NextResponse.json(
        { error: "ID do item ausente na rota." },
        { status: 400 }
      );
    }

    const rows = await query(
      `UPDATE itens
       SET data_exclusao = NOW()
       WHERE id = $1
       AND data_exclusao IS NULL
       RETURNING id`,
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Item não encontrado ou já excluído" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Item marcado como excluído com sucesso" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao marcar item como excluído:", error);
    return NextResponse.json(
      { error: "Erro interno ao marcar item como excluído" },
      { status: 500 }
    );
  }
}
