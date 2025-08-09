import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import Handlebars from 'handlebars';

// POST /api/reports/generate - Generar PDF de reporte
export async function POST(request: NextRequest) {
  let browser;
  
  try {
    const body = await request.json();
    const { session_id, report_type, data, template_id } = body;

    // Validaciones
    if (!session_id || !report_type || !data) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos', success: false },
        { status: 400 }
      );
    }

    if (!['user', 'leader'].includes(report_type)) {
      return NextResponse.json(
        { error: 'Tipo de reporte inválido', success: false },
        { status: 400 }
      );
    }

    // Obtener template activo
    const template = await getActiveTemplate(report_type === 'user' ? 'user_report' : 'leader_report');
    
    if (!template) {
      return NextResponse.json(
        { error: 'Template no encontrado', success: false },
        { status: 404 }
      );
    }

    // Preparar datos para el template
    const templateData = prepareTemplateData(data, report_type);
    
    // Compilar template con Handlebars
    const compiledTemplate = Handlebars.compile(template.template_html);
    const html = compiledTemplate(templateData);

    // Generar PDF con Puppeteer
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    // Configuración del PDF
    const pdfOptions = {
      format: 'A4' as const,
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      }
    };

    const pdfBuffer = await page.pdf(pdfOptions);
    await browser.close();

    // Generar nombre de archivo
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `reporte-${report_type}-${session_id}-${timestamp}.pdf`;

    // Retornar PDF como respuesta
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString()
      }
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    
    if (browser) {
      await browser.close();
    }

    return NextResponse.json(
      { error: 'Error al generar PDF', success: false },
      { status: 500 }
    );
  }
}

// Función para obtener template activo
async function getActiveTemplate(type: string) {
  try {
    // Aquí ejecutarías la query real:
    /*
    const { data, error } = await supabase
      .from('report_templates')
      .select('*')
      .eq('type', type)
      .eq('is_active', true)
      .single();
    */

    // Mock templates
    const templates = {
      user_report: {
        template_html: `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Reporte de Solicitud - {{title}}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
            .header { background: #1e40af; color: white; padding: 20px; text-align: center; border-radius: 8px; }
            .section { margin: 20px 0; padding: 15px; border-left: 4px solid #3b82f6; background: #f8fafc; }
            .highlight { background: #eff6ff; padding: 10px; border-radius: 5px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📋 Reporte de Solicitud</h1>
            <p><strong>{{user_name}}</strong> - {{department}}</p>
            <p>Fecha: {{date}}</p>
          </div>
          
          <div class="section">
            <h2>📝 Resumen de tu Solicitud</h2>
            <p>{{description}}</p>
          </div>
          
          <div class="section">
            <h2>💡 Solución Propuesta</h2>
            <p>{{solution}}</p>
          </div>
          
          <div class="section">
            <h2>📈 Beneficios Esperados</h2>
            <div class="highlight">
              <p>{{benefits}}</p>
            </div>
          </div>
          
          <div class="section">
            <h2>⏱️ Próximos Pasos</h2>
            <p>{{next_steps}}</p>
          </div>
        </body>
        </html>
        `
      },
      leader_report: {
        template_html: `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Análisis Ejecutivo - {{title}}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
            .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px; }
            .metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 20px 0; }
            .metric { text-align: center; padding: 15px; background: #f3f4f6; border-radius: 8px; }
            .section { margin: 20px 0; padding: 15px; border-left: 4px solid #dc2626; background: #fef2f2; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎯 Análisis Ejecutivo GTTD</h1>
            <p><strong>ID:</strong> {{request_id}} | <strong>Fecha:</strong> {{date}}</p>
          </div>
          
          <div class="metrics">
            <div class="metric">
              <h3>🚨 Prioridad</h3>
              <p><strong>{{priority}}</strong></p>
            </div>
            <div class="metric">
              <h3>⚡ Esfuerzo</h3>
              <p><strong>{{effort}}</strong></p>
            </div>
            <div class="metric">
              <h3>💰 ROI</h3>
              <p><strong>{{roi}}</strong></p>
            </div>
          </div>
          
          <div class="section">
            <h2>🎯 Análisis de Impacto</h2>
            <p>{{impact_analysis}}</p>
          </div>
          
          <div class="section">
            <h2>📊 Clasificación</h2>
            <p><strong>Tipo:</strong> {{classification}}</p>
            <p><strong>Justificación:</strong> {{classification_reason}}</p>
          </div>
          
          <div class="section">
            <h2>✅ Recomendación Ejecutiva</h2>
            <p><strong>{{recommendation}}</strong></p>
          </div>
        </body>
        </html>
        `
      }
    };

    return templates[type as keyof typeof templates];
  } catch (error) {
    console.error('Error fetching template:', error);
    return null;
  }
}

// Función para preparar datos del template
function prepareTemplateData(data: any, reportType: string) {
  const baseData = {
    date: new Date().toLocaleDateString('es-ES'),
    user_name: data.user_name || 'Usuario',
    department: data.department || 'Departamento',
    title: data.title || 'Solicitud de Innovación',
    description: data.description || 'Descripción de la solicitud',
    request_id: data.session_id || 'REQ-' + Date.now()
  };

  if (reportType === 'user') {
    return {
      ...baseData,
      solution: 'Basado en tu necesidad, recomendamos implementar una solución que optimice tus procesos actuales.',
      benefits: 'Esta solución mejorará significativamente la eficiencia de tu área y reducirá el tiempo dedicado a tareas manuales.',
      next_steps: '1. Revisión técnica por GTTD\n2. Aprobación de recursos\n3. Planificación de implementación'
    };
  } else {
    return {
      ...baseData,
      priority: data.priority?.toUpperCase() || 'MEDIA',
      effort: data.effort?.toUpperCase() || 'MEDIO',
      roi: 'ALTO',
      impact_analysis: data.impact_analysis || 'Impacto significativo en la eficiencia operativa del departamento.',
      classification: data.classification?.toUpperCase() || 'PROYECTO',
      classification_reason: data.classification_reason || 'Requiere desarrollo personalizado y afecta múltiples procesos.',
      recommendation: data.recommendation || 'APROBAR - Alto ROI, bajo riesgo, impacto inmediato'
    };
  }
}
