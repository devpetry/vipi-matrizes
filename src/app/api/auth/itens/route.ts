import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// GET - Listar todos os itens
export async function GET() {
  try {
    const result = await query(
      `SELECT id, descricao, quantidade, valor, atualizado_em, atualizado_por
       FROM "Itens"
       WHERE data_exclusao IS NULL
       ORDER BY id ASC`,
      []
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro ao buscar itens:", error);
    return NextResponse.json(
      { error: "Erro ao buscar itens" },
      { status: 500 }
    );
  }
}

// POST - Criar novo item
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { descricao, quantidade, valor, atualizado_por } = body.data;

    if (!descricao || !quantidade || !valor) {
      return NextResponse.json(
        {
          error: "Campos 'descricao', 'quantidade' e 'valor' são obrigatórios.",
        },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO "Itens" (descricao, quantidade, valor, atualizado_em, atualizado_por)
       VALUES ($1, $2, $3, NOW(), $4)
       RETURNING id, descricao, quantidade, valor, atualizado_em, atualizado_por`,
      [descricao, quantidade, valor, atualizado_por || null]
    );

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Erro ao criar item:", error);
    return NextResponse.json({ error: "Erro ao criar item" }, { status: 500 });
  }
}
