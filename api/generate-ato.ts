// Vercel Serverless Function: POST /api/generate-ato
// Keep OPENAI_API_KEY only on the server. Never expose it with a VITE_ prefix.

const schema = {
  type: 'object',
  properties: {
    tipo: { type: 'string', enum: ['portaria', 'decreto', 'oficio'] },
    subtipoPortaria: { type: ['string', 'null'], enum: ['nomeacao','exoneracao','designacao','ferias_licencas','afastamento','revogacao', null] },
    numero: { type: ['string','null'] },
    data: { type: ['string','null'] },
    ementa: { type: 'string' },
    nome: { type: ['string','null'] },
    cpf: { type: ['string','null'] },
    cargo: { type: ['string','null'] },
    codigoCargo: { type: ['string','null'] },
    portariaAnterior: { type: ['string','null'] },
    periodoInicio: { type: ['string','null'] },
    periodoFim: { type: ['string','null'] },
    motivo: { type: ['string','null'] },
    destinatario: { type: ['string','null'] },
    cargoDestinatario: { type: ['string','null'] },
    entidadeDestinatario: { type: ['string','null'] },
    assunto: { type: ['string','null'] },
    considerandos: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, texto: { type: 'string' } }, required: ['id','texto'], additionalProperties: false } },
    artigos: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, numero: { type: 'integer' }, texto: { type: 'string' } }, required: ['id','numero','texto'], additionalProperties: false } },
    municipio: { type: 'string' },
    estado: { type: 'string' },
    leiReferencia: { type: ['string','null'] },
    autoridade: { type: 'string' },
    cargoAutoridade: { type: 'string' },
    site: { type: ['string','null'] },
    email: { type: ['string','null'] },
    alinhamento: { type: 'string', enum: ['justify','left'] }
  },
  required: ['tipo','subtipoPortaria','numero','data','ementa','nome','cpf','cargo','codigoCargo','portariaAnterior','periodoInicio','periodoFim','motivo','destinatario','cargoDestinatario','entidadeDestinatario','assunto','considerandos','artigos','municipio','estado','leiReferencia','autoridade','cargoAutoridade','site','email','alinhamento'],
  additionalProperties: false
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido.' });
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'OPENAI_API_KEY não configurada no servidor.' });

  const prompt = String(req.body?.prompt || '').trim();
  if (prompt.length < 10) return res.status(400).json({ error: 'Descreva melhor o ato desejado.' });

  const system = `Você auxilia na elaboração de atos administrativos municipais brasileiros. Produza uma MINUTA para revisão humana, sem inventar nomes, CPF, leis, datas, cargos ou fatos que o usuário não forneceu. Quando faltar um dado, use null ou texto neutro que possa ser revisado. Preserve linguagem formal e objetiva. Para Francisco Macedo-PI, use por padrão: município Francisco Macedo; estado Piauí; autoridade Adeilson Antão de Carvalho; cargo Prefeito Municipal. A saída deve obedecer exatamente ao schema fornecido.`;

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-6-astra',
        input: [
          { role: 'system', content: system },
          { role: 'user', content: prompt }
        ],
        text: { format: { type: 'json_schema', name: 'ato_administrativo', strict: true, schema } }
      })
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data?.error?.message || 'Erro ao consultar a IA.' });

    const text = (data.output || []).flatMap((item: any) => item.content || []).find((c: any) => c.type === 'output_text')?.text;
    if (!text) return res.status(502).json({ error: 'A IA não retornou uma minuta válida.' });
    return res.status(200).json({ ato: JSON.parse(text) });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Erro interno ao gerar a minuta.' });
  }
}
