import React, { useState } from 'react';
import { BiomassType, CalculatorInputs, AcademicLevel } from '../types';
import { 
  FlaskConical, Scale, ArrowRight, CheckCircle2, Thermometer, Tag, User, 
  Building2, BookOpenText, GraduationCap, MapPin,
  Fingerprint, Map, Leaf, Weight, Atom, Orbit, Percent, Award, Flame
} from 'lucide-react';

interface InputFormProps {
  onCalculate: (inputs: CalculatorInputs) => void;
}

const InputForm: React.FC<InputFormProps> = ({ onCalculate }) => {
  const [values, setValues] = useState<CalculatorInputs>({
    studentName: '',
    level: AcademicLevel.UNDERGRADUATE,
    researchTitle: '',
    advisorName: '',
    institution: '',
    city: '',
    state: '',
    sampleName: 'Amostra 01',
    biomassType: BiomassType.CASHEW_SHELL, // Default regional
    isDirectBiocharInput: true,
    massInput: 1, // 1 ton
    biocharYield: 30,
    pyrolysisTemp: 500,
    carbonContent: 75.0, 
    hcRatio: 0.35,
    selectedSoilTemps: [14.9],
    dataAuthorization: false
  });

  const soilTempOptions = [5, 10, 10.9, 14.9, 15, 20, 25];

  const handleChange = (field: keyof CalculatorInputs, value: any) => {
    setValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleSoilTemp = (temp: number) => {
    setValues(prev => {
      const current = prev.selectedSoilTemps;
      if (current.includes(temp)) {
        if (current.length === 1) return prev; 
        return { ...prev, selectedSoilTemps: current.filter(t => t !== temp) };
      } else {
        if (current.length >= 3) return prev;
        return { ...prev, selectedSoilTemps: [...current, temp].sort((a, b) => a - b) };
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCalculate(values);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
      
      <div className="space-y-6">
        
        {/* Identificação Completa */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-600" /> Identificação do Projeto
              </h3>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-400" /> Nome do Estudante
                  </label>
                  <input
                    type="text"
                    required
                    value={values.studentName}
                    onChange={(e) => handleChange('studentName', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-emerald-500 text-sm placeholder-slate-400 bg-white"
                    placeholder="Seu nome completo"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Award className="w-3 h-3 text-slate-400" /> Nível
                  </label>
                  <select
                    value={values.level}
                    onChange={(e) => handleChange('level', e.target.value as AcademicLevel)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-emerald-500 text-sm bg-white"
                  >
                    {Object.values(AcademicLevel).map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
            </div>

             <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                 <BookOpenText className="w-3 h-3 text-slate-400" /> Título da Pesquisa
              </label>
              <input
                type="text"
                value={values.researchTitle}
                onChange={(e) => handleChange('researchTitle', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-emerald-500 text-sm placeholder-slate-400 bg-white"
                placeholder="Título do trabalho ou tese"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <GraduationCap className="w-3 h-3 text-slate-400" /> Nome do Orientador
              </label>
              <input
                type="text"
                value={values.advisorName}
                onChange={(e) => handleChange('advisorName', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-emerald-500 text-sm placeholder-slate-400 bg-white"
                placeholder="Nome do professor"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-slate-400" /> Instituição
              </label>
              <input
                type="text"
                value={values.institution}
                onChange={(e) => handleChange('institution', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-emerald-500 text-sm placeholder-slate-400 bg-white"
                placeholder="Sigla (Ex: UFERSA)"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" /> Cidade
                </label>
                <input
                  type="text"
                  value={values.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-emerald-500 text-sm placeholder-slate-400 bg-white"
                  placeholder="Ex: Mossoró"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Map className="w-3 h-3 text-slate-400" /> Estado
                </label>
                <input
                  type="text"
                  value={values.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-emerald-500 text-sm placeholder-slate-400 bg-white"
                  placeholder="Ex: RN"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 mt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Fingerprint className="w-3 h-3 text-slate-400" /> ID da Amostra
                  </label>
                  <input
                    type="text"
                    required
                    value={values.sampleName}
                    onChange={(e) => handleChange('sampleName', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-emerald-500 text-sm placeholder-slate-400 bg-white"
                    placeholder="Ex: Biochar ACC"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Leaf className="w-3 h-3 text-slate-400" /> Matéria-Prima
                  </label>
                  <select
                    value={values.biomassType}
                    onChange={(e) => handleChange('biomassType', e.target.value as BiomassType)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-emerald-500 text-sm bg-white"
                  >
                    {Object.values(BiomassType).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Produção: Massa */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 relative overflow-hidden">
            <div className="flex justify-between items-center mb-4">
               <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                  <Scale className="w-4 h-4 text-emerald-600" /> Massa
               </h3>
               
               {/* Toggle Switch */}
               <div className="flex bg-slate-200 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => handleChange('isDirectBiocharInput', false)}
                    className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${!values.isDirectBiocharInput ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Biomassa Bruta
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('isDirectBiocharInput', true)}
                    className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${values.isDirectBiocharInput ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Biochar Pronto
                  </button>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-1">
                  <label className="block text-[10px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                     <Weight className="w-3 h-3 text-slate-400" />
                     {values.isDirectBiocharInput ? 'Qtd. Biochar (t)' : 'Qtd. Biomassa (t)'}
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={values.massInput}
                    onChange={(e) => handleChange('massInput', Number(e.target.value))}
                    className="w-full px-2 py-2 rounded border border-slate-300 text-sm focus:ring-emerald-500 text-slate-700"
                  />
                </div>
                
                {/* Se for Biochar direto, esconde yield, se for biomassa, mostra */}
                {!values.isDirectBiocharInput ? (
                    <div className="col-span-1">
                      <label className="block text-[10px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                        <Percent className="w-3 h-3 text-slate-400" /> Rendimento (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={values.biocharYield}
                        onChange={(e) => handleChange('biocharYield', Number(e.target.value))}
                        className="w-full px-2 py-2 rounded border border-slate-300 text-sm focus:ring-emerald-500"
                      />
                    </div>
                ) : (
                    <div className="col-span-1">
                        {/* Phantom label for alignment */}
                         <label className="block text-[10px] font-semibold text-transparent mb-1 flex items-center gap-1 select-none">
                            <span className="w-3 h-3" /> .
                         </label>
                        <div className="flex items-center h-[38px]">
                            <div className="text-[10px] text-slate-400 italic leading-snug">Massa final seca pronta para aplicação.</div>
                        </div>
                    </div>
                )}
            </div>
            
            {!values.isDirectBiocharInput && (
                <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between items-center">
                   <span className="text-[10px] text-slate-500">Massa Final Estimada:</span>
                   <span className="text-sm font-bold text-emerald-700">
                     {(values.massInput * (values.biocharYield/100)).toFixed(2)} t
                   </span>
                </div>
            )}
        </div>

        {/* Química - Padronizado para Slate/Emerald */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
           <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-emerald-600" /> Parâmetros Químicos
              </h3>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Atom className="w-3 h-3 text-slate-400" /> Teor de Carbono (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={values.carbonContent}
                    onChange={(e) => handleChange('carbonContent', Number(e.target.value))}
                    className="w-full pl-3 pr-8 py-2 rounded-lg border border-slate-300 focus:ring-emerald-500 text-sm font-medium bg-white"
                  />
                  <span className="absolute right-3 top-2 text-slate-400 text-xs">%</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                   <Orbit className="w-3 h-3 text-slate-400" /> Razão H/C (molar)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="3.0"
                  value={values.hcRatio}
                  onChange={(e) => handleChange('hcRatio', Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-sm bg-white focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                   <Flame className="w-3 h-3 text-slate-400" /> Temp. Pirólise (°C)
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={values.pyrolysisTemp}
                  onChange={(e) => handleChange('pyrolysisTemp', Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-sm bg-white focus:ring-emerald-500"
                />
              </div>
           </div>
        </div>

        {/* Solo - Padronizado e com Icone */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3 flex items-center gap-2">
             <Thermometer className="w-4 h-4 text-emerald-600" /> Temperatura do Solo
          </h3>
          <div className="flex flex-wrap gap-2">
            {soilTempOptions.map(temp => {
               const isSelected = values.selectedSoilTemps.includes(temp);
               return (
                 <button
                   key={temp}
                   type="button"
                   onClick={() => toggleSoilTemp(temp)}
                   className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-2 ${
                     isSelected 
                     ? 'bg-slate-800 text-white border-slate-800 shadow-md' 
                     : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                   }`}
                 >
                   {isSelected ? <CheckCircle2 className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-slate-300"></div>}
                   {temp}°C
                 </button>
               );
            })}
          </div>
        </div>

        {/* Autorização de Dados */}
        <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
           <input 
              type="checkbox" 
              id="dataAuth"
              checked={values.dataAuthorization}
              onChange={(e) => handleChange('dataAuthorization', e.target.checked)}
              className="mt-1 w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 shrink-0"
           />
           <label htmlFor="dataAuth" className="text-xs text-slate-600 leading-snug cursor-pointer">
              Autorizo que os dados de minha amostra de biochar sejam incorporados à biblioteca de biochars do Núcleo de Pesquisa em Economia de Baixo Carbono (NPCO2), com o objetivo de aprimorar a base científica dessa temática no país.
           </label>
        </div>

        <button
          type="submit"
          className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 transition-all transform hover:scale-[1.01] flex items-center justify-center gap-2"
        >
          Calcular Resultados
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
};

export default InputForm;