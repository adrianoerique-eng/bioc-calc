import React, { useState } from 'react';
import { CalculationResult } from '../types';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Sparkles, Calculator, Clock, FileText, Table2, Printer, Eye, X } from 'lucide-react';

interface ResultsDashboardProps {
  data: CalculationResult | null;
}

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ data }) => {
  const [showPreview, setShowPreview] = useState(false);

  // Função de impressão reforçada
  const handlePrint = () => {
    // Pequeno timeout para garantir que a UI não trave antes de abrir o diálogo
    setTimeout(() => {
      window.print();
    }, 100);
  };

  if (!data) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400 p-12 bg-white rounded-3xl border border-dashed border-slate-300 shadow-sm no-print">
        <Sparkles className="w-12 h-12 mb-4 text-slate-300" />
        <p className="text-lg text-center font-medium text-slate-600">BioC-Calc</p>
        <p className="text-sm text-center mt-2 max-w-xs text-slate-400">Preencha os parâmetros de entrada para visualizar a projeção de sequestro de carbono.</p>
      </div>
    );
  }

  // --- TRATAMENTO DE DADOS DO GRÁFICO (Correção de Erros) ---
  const horizons = [0, 100, 500, 1000];
  const chartData = horizons.map(year => {
    const point: any = { year };
    data.scenarios.forEach(scenario => {
      const dataPoint = scenario.dataPoints.find(dp => dp.year === year);
      
      // Safety check: Garante que é número e não NaN
      let val = 0;
      let fPerm = 0;

      if (dataPoint) {
         val = Number(dataPoint.co2Sequestered) || 0;
         fPerm = Number(dataPoint.fPerm) || 0;
      }

      point[`temp_${scenario.temp}`] = Number(val.toFixed(2));
      point[`fPerm_${scenario.temp}`] = fPerm;
    });
    return point;
  });

  const colors = ['#059669', '#2563eb', '#db2777', '#d97706', '#7c3aed'];

  // Dados para os cards superiores (usando o primeiro cenário como referência principal)
  const mainScenario = data.scenarios[0];
  const mainP100 = mainScenario.dataPoints.find(p => p.year === 100);
  const mainP500 = mainScenario.dataPoints.find(p => p.year === 500);
  const mainP1000 = mainScenario.dataPoints.find(p => p.year === 1000);

  // Lógica de análise técnica automática
  const inputs = data.inputs;
  const hcRatio = inputs.hcRatio;
  let stabilityText = "";
  let stabilityLevel = "";
  
  if (hcRatio <= 0.4) {
    stabilityLevel = "Alta";
    stabilityText = "A razão H/C abaixo de 0,4 indica um biochar altamente condensado e aromático, típico de pirólise em altas temperaturas. Este material apresenta máxima resistência à degradação biológica no solo.";
  } else if (hcRatio <= 0.7) {
    stabilityLevel = "Média";
    stabilityText = "A razão H/C entre 0,4 e 0,7 indica um grau moderado de carbonização. O material possui estruturas aromáticas estáveis, mas retém frações alifáticas que podem ser mineralizadas mais rapidamente nos primeiros séculos.";
  } else {
    stabilityLevel = "Baixa";
    stabilityText = "A razão H/C acima de 0,7 sugere um biochar produzido em temperaturas mais baixas ou tempos de residência curtos (semelhante a torrefação). A estabilidade a longo prazo é menor comparada a biochars de alta temperatura.";
  }

  // Componente Tooltip Personalizado
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur p-4 border border-slate-200 shadow-xl rounded-xl text-xs z-50 outline-none min-w-[200px]">
          <p className="font-bold text-slate-700 mb-3 border-b border-slate-100 pb-2 text-center text-sm">
            Horizonte: <span className="text-slate-900">{label} Anos</span>
          </p>
          <div className="space-y-4">
            {payload.map((entry: any, index: number) => {
              const temp = entry.dataKey.toString().replace('temp_', '');
              const fPerm = entry.payload[`fPerm_${temp}`];

              return (
                <div key={index}>
                  <div className="flex items-center gap-2 mb-1">
                    <div 
                      className="w-2.5 h-2.5 rounded-full shadow-sm" 
                      style={{ backgroundColor: entry.color }} 
                    />
                    <span className="font-bold text-slate-700 text-sm">{entry.name}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 pl-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Sequestro</span>
                      <span className="font-mono text-sm font-bold text-slate-700">
                        {Number(entry.value).toFixed(2)} <span className="text-[10px] text-slate-400 font-sans">tCO₂e</span>
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Permanência</span>
                      <span className="font-mono text-sm font-bold text-slate-700">
                        {(fPerm * 100).toFixed(1)} <span className="text-[10px] text-slate-400 font-sans">%</span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  // --- CONTEÚDO DO RELATÓRIO (Otimizado para Impressão) ---
  const ReportContent = () => (
    <div className="flex flex-col text-slate-900 font-sans max-w-[210mm] mx-auto bg-white">
      
      {/* Header Centralizado */}
      <div className="text-center border-b-2 border-slate-900 pb-4 mb-6 pt-2">
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-widest mb-1">
            RELATÓRIO TÉCNICO
          </h1>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
            BioC-Calc • Estimativa de Sequestro de Carbono
          </p>
          <p className="text-[10px] text-slate-400 mt-1">
            Emitido em: {new Date().toLocaleDateString()}
          </p>
      </div>

      {/* Resumo do Projeto */}
      <div className="mb-6 break-inside-avoid">
         <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700 border-b border-emerald-100 pb-1 mb-3 flex items-center gap-2">
            1. Identificação do Projeto
         </h2>
         
         <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm shadow-sm print:shadow-none print:border-slate-300">
             <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <div className="space-y-3">
                    <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Estudante</span>
                        <div className="text-slate-800">{inputs.studentName || '-'}</div>
                    </div>
                    <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Orientador</span>
                        <div className="text-slate-800">{inputs.advisorName || '-'}</div>
                    </div>
                    <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Título</span>
                        <div className="text-slate-800 leading-snug text-xs">{inputs.researchTitle || '-'}</div>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Nível</span>
                        <div className="text-slate-800">{inputs.level}</div>
                      </div>
                       <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">ID Amostra</span>
                        <div className="text-slate-800">{inputs.sampleName}</div>
                      </div>
                    </div>
                    <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Instituição</span>
                        <div className="text-slate-800">{inputs.institution || '-'}</div>
                    </div>
                     <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Localização</span>
                        <div className="text-slate-800">{inputs.city && inputs.state ? `${inputs.city} - ${inputs.state}` : '-'}</div>
                    </div>
                </div>
             </div>
             
             <div className="mt-4 pt-3 border-t border-slate-200 grid grid-cols-2 gap-4">
                <div>
                   <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Biomassa</span>
                   <div className="text-slate-800">{inputs.biomassType}</div>
                </div>
                 <div>
                   <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Massa Biochar</span>
                   <div className="text-slate-800">{data.totalBiocharMass.toFixed(2)} toneladas</div>
                </div>
             </div>

             <div className={`text-[10px] italic mt-3 px-2 py-1 rounded bg-white border border-slate-100 flex items-center gap-1.5 ${inputs.dataAuthorization ? 'text-emerald-700' : 'text-slate-500'}`}>
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${inputs.dataAuthorization ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                {inputs.dataAuthorization 
                  ? "Amostra autorizada para inclusão na biblioteca científica do NPCO₂."
                  : "Amostra não autorizada para biblioteca pública."}
             </div>
         </div>
      </div>

      {/* Caracterização */}
      <div className="mb-6 break-inside-avoid">
         <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700 border-b border-emerald-100 pb-1 mb-3">2. Caracterização Físico-Química</h2>
         
         <div className="grid grid-cols-3 gap-4 mb-3">
             <div className="bg-white border border-slate-200 p-3 rounded text-center shadow-sm print:shadow-none print:border-slate-300">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">Carbono (%)</div>
                <div className="text-lg text-slate-900">{inputs.carbonContent}%</div>
             </div>
             <div className="bg-white border border-slate-200 p-3 rounded text-center shadow-sm print:shadow-none print:border-slate-300">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">Razão H/C</div>
                <div className="text-lg text-slate-900">{inputs.hcRatio}</div>
             </div>
             <div className="bg-white border border-slate-200 p-3 rounded text-center shadow-sm print:shadow-none print:border-slate-300">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">Estabilidade</div>
                <div className={`text-lg ${stabilityLevel === 'Alta' ? 'text-emerald-700' : 'text-slate-900'}`}>{stabilityLevel}</div>
             </div>
         </div>
         
         <div className="text-xs text-slate-600 text-justify leading-relaxed bg-slate-50 p-3 rounded border border-slate-200 print:bg-white print:border-l-4 print:border-l-emerald-500 print:border-y-0 print:border-r-0 print:rounded-none">
            {stabilityText}
         </div>
      </div>

      {/* Resultados Consolidados */}
      <div className="mb-6 break-inside-avoid">
         <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700 border-b border-emerald-100 pb-1 mb-3">3. Resultados Consolidados</h2>
         <table className="w-full text-xs border-collapse border border-slate-300">
             <thead className="bg-slate-100 print:bg-slate-200">
                <tr>
                   <th className="border border-slate-300 px-2 py-2 text-center text-slate-700 font-bold">Horizonte Temporal</th>
                   <th className="border border-slate-300 px-2 py-2 text-center text-slate-700 font-bold">Permanência (%)</th>
                   <th className="border border-slate-300 px-2 py-2 text-center text-slate-700 font-bold">Sequestro Total (tCO₂e)</th>
                   <th className="border border-slate-300 px-2 py-2 text-center text-slate-700 font-bold">Eficiência (tCO₂e/t)</th>
                </tr>
             </thead>
             <tbody>
                <tr>
                   <td className="border border-slate-300 px-2 py-2 text-center bg-slate-50">100 Anos</td>
                   <td className="border border-slate-300 px-2 py-2 text-center">{((mainP100?.fPerm || 0) * 100).toFixed(1)}%</td>
                   <td className="border border-slate-300 px-2 py-2 text-center">{mainP100?.co2Sequestered?.toFixed(2) || "0.00"}</td>
                   <td className="border border-slate-300 px-2 py-2 text-center">
                     {mainP100 && data.totalBiocharMass > 0 ? (mainP100.co2Sequestered / data.totalBiocharMass).toFixed(2) : '-'}
                   </td>
                </tr>
                <tr>
                   <td className="border border-slate-300 px-2 py-2 text-center bg-slate-50">500 Anos</td>
                   <td className="border border-slate-300 px-2 py-2 text-center">{((mainP500?.fPerm || 0) * 100).toFixed(1)}%</td>
                   <td className="border border-slate-300 px-2 py-2 text-center">{mainP500?.co2Sequestered?.toFixed(2) || "0.00"}</td>
                   <td className="border border-slate-300 px-2 py-2 text-center">
                     {mainP500 && data.totalBiocharMass > 0 ? (mainP500.co2Sequestered / data.totalBiocharMass).toFixed(2) : '-'}
                   </td>
                </tr>
                <tr>
                   <td className="border border-slate-300 px-2 py-2 text-center bg-slate-50">1000 Anos</td>
                   <td className="border border-slate-300 px-2 py-2 text-center">{((mainP1000?.fPerm || 0) * 100).toFixed(1)}%</td>
                   <td className="border border-slate-300 px-2 py-2 text-center">{mainP1000?.co2Sequestered?.toFixed(2) || "0.00"}</td>
                   <td className="border border-slate-300 px-2 py-2 text-center">
                     {mainP1000 && data.totalBiocharMass > 0 ? (mainP1000.co2Sequestered / data.totalBiocharMass).toFixed(2) : '-'}
                   </td>
                </tr>
             </tbody>
         </table>
      </div>

      {/* Metodologia Footer */}
      <div className="mb-2 break-inside-avoid">
         <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 pb-1 mb-2">4. Base Metodológica</h2>
         <div className="text-[10px] text-slate-500 leading-tight text-justify space-y-1">
            <p>
               Este cálculo utiliza o modelo de Woolf et al. (2021) "Greenhouse Gas Inventory Model for Biochar Additions to Soil". 
               A estabilidade é determinada pela razão molar H/Corg e pela temperatura média do solo ({mainScenario.temp}°C neste cenário principal).
            </p>
            <p className="font-mono bg-slate-50 p-1 inline-block text-[9px] border border-slate-200 rounded mt-1">
                Eq. Permanência: Fperm = Chc + Mhc × (H/C)
            </p>
         </div>
      </div>

      {/* Footer Assinatura */}
      <div className="mt-8 pt-4 border-t-2 border-slate-800 flex justify-between items-end break-inside-avoid">
         <div className="text-[9px] text-slate-400">
            <p>BioC-Calc - Ferramenta de Suporte à Decisão</p>
            <p>Calculado em: {new Date().toLocaleString()}</p>
         </div>
         <div className="text-right">
            <div className="text-xs font-bold text-slate-800 uppercase">NPCO2/UFERSA & LAPIS/IFCE</div>
            <div className="text-[9px] text-slate-500">Documento gerado automaticamente.</div>
         </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="space-y-6 animate-fade-in no-print">
        
        {/* Header com botão de preview */}
        <div className="flex justify-between items-center">
           <div></div> {/* Spacer */}
           <button 
             type="button"
             onClick={() => setShowPreview(true)}
             className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors shadow-sm cursor-pointer"
           >
             <Eye className="w-4 h-4" />
             Relatório (.pdf)
           </button>
        </div>

        {/* Cards de Métricas - Layout Unificado de 3 Colunas */}
        <div className="bg-slate-800 text-white rounded-2xl shadow-xl shadow-slate-200 p-6">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-700 pb-4">
              <Calculator className="w-5 h-5 text-emerald-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">Sequestro Total Estimado</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-700">
              
              {/* 100 Anos */}
              <div className="flex flex-col items-center justify-center pt-4 md:pt-0">
                  <span className="text-emerald-400 font-bold text-sm mb-2">100 Anos</span>
                  <div className="text-4xl font-bold">
                      {mainP100?.co2Sequestered?.toFixed(2) || "0.00"}
                  </div>
                  <span className="text-xs text-slate-400 mt-1">tCO₂e</span>
              </div>

              {/* 500 Anos */}
              <div className="flex flex-col items-center justify-center pt-4 md:pt-0">
                  <span className="text-blue-400 font-bold text-sm mb-2">500 Anos</span>
                  <div className="text-4xl font-bold">
                      {mainP500?.co2Sequestered?.toFixed(2) || "0.00"}
                  </div>
                  <span className="text-xs text-slate-400 mt-1">tCO₂e</span>
              </div>

              {/* 1000 Anos */}
              <div className="flex flex-col items-center justify-center pt-4 md:pt-0">
                  <span className="text-purple-400 font-bold text-sm mb-2">1000 Anos</span>
                  <div className="text-4xl font-bold">
                      {mainP1000?.co2Sequestered?.toFixed(2) || "0.00"}
                  </div>
                  <span className="text-xs text-slate-400 mt-1">tCO₂e</span>
              </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-700 text-center">
              <p className="text-sm text-slate-400">
                Volume absoluto de créditos gerados pela aplicação de <strong className="text-white">{data.totalBiocharMass.toFixed(2)}t</strong> deste biochar.
              </p>
          </div>
        </div>

        {/* Gráfico */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" /> Projeção Temporal
            </h3>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="year" 
                  type="number" 
                  domain={[0, 1000]} 
                  ticks={[0, 100, 500, 1000]}
                  stroke="#64748b" 
                  tickFormatter={(v) => `${v}`}
                  fontSize={12}
                  label={{ 
                    value: 'Tempo (Anos)', 
                    position: 'insideBottom', 
                    offset: -10, 
                    fill: '#64748b', 
                    fontSize: 12,
                    fontWeight: 'bold' 
                  }}
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={12} 
                  label={{ 
                    value: 'Sequestro (tCO₂e)', 
                    angle: -90, 
                    position: 'insideLeft', 
                    fill: '#64748b', 
                    fontSize: 12,
                    fontWeight: 'bold',
                    style: { textAnchor: 'middle' }
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" height={36}/>
                {data.scenarios.map((scenario, idx) => (
                  <Line 
                    key={scenario.temp}
                    name={`Temp. Solo ${scenario.temp}°C`}
                    type="monotone" 
                    dataKey={`temp_${scenario.temp}`} 
                    stroke={colors[idx % colors.length]} 
                    strokeWidth={2.5}
                    dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tabela Simplificada */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Table2 className="w-4 h-4 text-emerald-600" />
                DETALHAMENTO
              </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="text-xs text-slate-500 bg-slate-50">
                <tr>
                  <th rowSpan={2} className="px-6 py-3 border-b border-slate-200 align-middle bg-slate-50 font-bold">Cenário (Solo)</th>
                  <th colSpan={3} className="px-2 py-2 text-center border-b border-slate-200 border-x border-slate-200 bg-slate-50 font-bold">Permanência</th>
                  <th colSpan={3} className="px-2 py-2 text-center border-b border-slate-200 bg-slate-50 font-bold">Eficiência de Sequestro (tCO₂e / t Biochar)</th>
                </tr>
                <tr>
                  <th className="px-3 py-2 text-center border-b border-slate-200 border-l border-slate-200 bg-slate-50 font-semibold text-slate-600">100 anos</th>
                  <th className="px-3 py-2 text-center border-b border-slate-200 bg-slate-50 font-semibold text-slate-600">500 anos</th>
                  <th className="px-3 py-2 text-center border-b border-slate-200 border-r border-slate-200 bg-slate-50 font-semibold text-slate-600">1000 anos</th>
                  
                  <th className="px-3 py-2 text-center border-b border-slate-200 bg-slate-50 font-semibold text-slate-600">100 anos</th>
                  <th className="px-3 py-2 text-center border-b border-slate-200 bg-slate-50 font-semibold text-slate-600">500 anos</th>
                  <th className="px-3 py-2 text-center border-b border-slate-200 bg-slate-50 font-semibold text-slate-600">1000 anos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.scenarios.map((scenario) => {
                  const p100 = scenario.dataPoints.find(p => p.year === 100);
                  const p500 = scenario.dataPoints.find(p => p.year === 500);
                  const p1000 = scenario.dataPoints.find(p => p.year === 1000);
                  
                  const fperm100 = p100?.fPerm || 0;
                  const fperm500 = p500?.fPerm || 0;
                  const fperm1000 = p1000?.fPerm || 0;

                  // Cálculo da Eficiência (tCO2e total / massa biochar)
                  const eff100 = p100 && data.totalBiocharMass > 0 ? p100.co2Sequestered / data.totalBiocharMass : 0;
                  const eff500 = p500 && data.totalBiocharMass > 0 ? p500.co2Sequestered / data.totalBiocharMass : 0;
                  const eff1000 = p1000 && data.totalBiocharMass > 0 ? p1000.co2Sequestered / data.totalBiocharMass : 0;

                  return (
                    <tr key={scenario.temp} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-800 flex items-center gap-2">
                          {scenario.temp}°C
                      </td>
                      <td className="px-2 py-4 text-center border-l border-slate-100">
                        <span className="text-slate-600 font-medium">
                          {(fperm100 * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-2 py-4 text-center">
                        <span className="text-slate-600 font-medium">
                          {(fperm500 * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-2 py-4 text-center border-r border-slate-100">
                        <span className="text-slate-600 font-medium">
                          {(fperm1000 * 100).toFixed(1)}%
                        </span>
                      </td>
                      
                      {/* Eficiência Columns */}
                      <td className="px-2 py-4 text-center text-slate-600 font-medium">
                        {eff100.toFixed(2)}
                      </td>
                      <td className="px-2 py-4 text-center text-slate-600 font-medium">
                        {eff500.toFixed(2)}
                      </td>
                      <td className="px-2 py-4 text-center text-slate-600 font-medium">
                        {eff1000.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Análise Técnica */}
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Análise Técnica do Biochar</h3>
            </div>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-3">
                  <p className="text-sm text-slate-600 leading-relaxed text-justify">
                    <strong>Caracterização:</strong> O biochar analisado, proveniente de {inputs.biomassType}, apresenta um teor de carbono de {inputs.carbonContent}% e uma razão H/C molar de {inputs.hcRatio}.
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed text-justify">
                    <strong>Estabilidade ({stabilityLevel}):</strong> {stabilityText}
                  </p>
              </div>
              <div className="w-full md:w-1/3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Estabilidade Química</span>
                      <span className={`font-bold ${stabilityLevel === 'Alta' ? 'text-emerald-600' : 'text-orange-500'}`}>{stabilityLevel}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${stabilityLevel === 'Alta' ? 'bg-emerald-500' : stabilityLevel === 'Média' ? 'bg-blue-500' : 'bg-orange-400'}`} 
                        style={{ width: inputs.hcRatio > 1 ? '30%' : inputs.hcRatio > 0.4 ? '60%' : '95%' }}
                      ></div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-50">
                      <span>Razão H/C</span>
                      <span className="font-mono font-bold text-slate-700">{inputs.hcRatio}</span>
                  </div>
              </div>
            </div>
        </div>
      </div>

      {/* --- PREVIEW MODAL --- */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 print:hidden animate-fade-in">
          <div className="bg-slate-200 w-full max-w-5xl h-[95vh] rounded-xl flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shrink-0 z-50">
               <div>
                 <h2 className="text-lg font-bold text-slate-800">Visualizar Relatório</h2>
                 <p className="text-xs text-slate-500">Este layout simula a folha A4.</p>
               </div>
               <div className="flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setShowPreview(false)}
                    className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors text-sm flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancelar
                  </button>
                  <button 
                    type="button"
                    onClick={handlePrint}
                    className="px-4 py-2 bg-slate-800 text-white font-medium hover:bg-slate-700 rounded-lg transition-colors text-sm flex items-center gap-2 shadow-sm cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    Imprimir / Salvar PDF
                  </button>
               </div>
            </div>

            {/* Modal Content - Scrollable Paper Preview */}
            <div className="flex-1 overflow-y-auto bg-slate-200 p-8 flex justify-center">
               <div className="bg-white shadow-xl w-[210mm] min-h-[297mm] p-12 shrink-0 origin-top transform transition-transform">
                   <ReportContent />
               </div>
            </div>
          </div>
        </div>
      )}

      {/* --- HIDDEN PRINT ELEMENT --- */}
      <div className="hidden print-only bg-white text-slate-900 w-full h-auto">
        <ReportContent />
      </div>
    </>
  );
};

export default ResultsDashboard;