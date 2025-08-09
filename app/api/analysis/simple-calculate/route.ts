import { NextRequest, NextResponse } from 'next/server';
import { calculateSimpleScore, SimpleRequest } from '@/lib/simple-scoring-algorithm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { request: simpleRequest } = body;

    if (!simpleRequest) {
      return NextResponse.json(
        { error: 'El objeto "request" es requerido', success: false },
        { status: 400 }
      );
    }

    // Lógica de validación flexible:
    // Rellenamos los campos faltantes con valores por defecto seguros
    // para que el algoritmo de scoring pueda funcionar con datos parciales.
    const validatedRequest: SimpleRequest = {
      problema_principal: simpleRequest.problema_principal || "",
      objetivo_esperado: simpleRequest.objetivo_esperado || "",
      plataformas_involucradas: simpleRequest.plataformas_involucradas || [],
      beneficiarios: simpleRequest.beneficiarios || "",
      frecuencia_uso: simpleRequest.frecuencia_uso || "esporadico",
      plazo_deseado: simpleRequest.plazo_deseado || "sin_definir",
      departamento_solicitante: simpleRequest.departamento_solicitante || "No especificado",
    };

    // Pasamos el objeto validado y completo al algoritmo
    const result = await calculateSimpleScore(validatedRequest);

    return NextResponse.json({
      ...result,
      calculated_at: new Date().toISOString(),
      success: true
    });

  } catch (error) {
    // Asegurarse de que el error sea un objeto Error
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Error calculating simple scoring:', errorMessage);
    return NextResponse.json(
      { error: 'Error al calcular scoring', details: errorMessage, success: false },
      { status: 500 }
    );
  }
}
