import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ClientInfo {
    name: string;
    company?: string | null;
    document?: string;
    address?: string;
    representative?: string;
    email: string;
    phone?: string | null;
}

interface SoftRhaInfo {
    name: string;
    cnpj: string;
    address: string;
    representative: string;
    email: string;
    website: string;
}

interface ProjectInfo {
    type: string;
    complexity: string;
    timeline: string;
    features: string[];
    integrations: string[];
    technologies?: string[];
    pages: number;
    finalValue: number;
    details?: string | null;
}

// Cores base para compatibilidade com PDF (html2canvas não suporta oklch/modern CSS)
const COLORS = {
    primary: "#6366f1", // Indigo 500
    primaryLight: "#eef2ff", // Indigo 50
    slate800: "#1e293b",
    slate700: "#334155",
    slate600: "#475569",
    slate500: "#64748b",
    slate400: "#94a3b8",
    slate300: "#cbd5e1",
    slate100: "#f1f5f9",
    white: "#ffffff",
    border: "#e2e8f0"
};

interface TemplateProps {
    client: ClientInfo;
    softrha: SoftRhaInfo;
    project: ProjectInfo;
    date: Date;
}

// Componente de capa para o documento combinado
const CapaDocumento: React.FC<{ client: ClientInfo; softrha: SoftRhaInfo; project: ProjectInfo; date: Date }> = ({ client, softrha, project, date }) => {
    const downPayment = project.finalValue * 0.25;
    const finalPayment = project.finalValue * 0.75;

    return (
        <div className="p-12 bg-white text-slate-800 font-sans max-w-[800px] mx-auto shadow-sm border border-slate-100 min-h-[900px]" style={{ backgroundColor: COLORS.white }}>
            {/* Header */}
            <div className="flex justify-between items-center mb-12">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-xl" style={{ backgroundColor: COLORS.primary, color: COLORS.white }}>
                        SR
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight" style={{ color: COLORS.primary }}>
                            SOFTRHA
                        </h1>
                        <p className="text-[11px] uppercase font-bold tracking-[0.25em]" style={{ color: COLORS.slate400 }}>Software & Solutions</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs font-medium" style={{ color: COLORS.slate500 }}>{new Intl.DateTimeFormat('pt-BR').format(date)}</p>
                    <p className="text-xs font-medium" style={{ color: COLORS.primary }}>Ref: PROP-{Math.floor(Math.random() * 9000) + 1000}</p>
                </div>
            </div>

            {/* Título */}
            <div className="text-center my-16">
                <h2 className="text-4xl font-black mb-4" style={{ color: COLORS.slate800 }}>
                    PROPOSTA TÉCNICA &<br />CONTRATO UNIFICADO
                </h2>
                <div className="w-24 h-1 mx-auto my-6" style={{ backgroundColor: COLORS.primary }}></div>
                <p className="text-lg" style={{ color: COLORS.slate600 }}>{project.type}</p>
            </div>

            {/* Informações do Cliente */}
            <div className="mb-12 p-8 rounded-2xl border" style={{ backgroundColor: '#f8fafc', borderColor: COLORS.border }}>
                <div className="grid grid-cols-2 gap-8">
                    <div>
                        <p className="text-[10px] uppercase font-bold mb-2" style={{ color: COLORS.slate400 }}>Contratante</p>
                        <p className="font-bold text-lg" style={{ color: COLORS.slate800 }}>{client.company || client.name}</p>
                        <p className="text-sm" style={{ color: COLORS.slate500 }}>Documento: {client.document || "Não informado"}</p>
                        <p className="text-sm" style={{ color: COLORS.slate500 }}>{client.address || "Endereço não informado"}</p>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-bold mb-2" style={{ color: COLORS.slate400 }}>Responsável</p>
                        <p className="font-bold text-lg" style={{ color: COLORS.slate800 }}>{client.representative || client.name}</p>
                        <p className="text-sm" style={{ color: COLORS.slate500 }}>{client.email}</p>
                        {client.phone && <p className="text-sm" style={{ color: COLORS.slate500 }}>{client.phone}</p>}
                    </div>
                </div>
            </div>

            {/* Resumo do Projeto */}
            <div className="mb-12">
                <h3 className="text-xl font-bold mb-6" style={{ color: COLORS.slate800 }}>Resumo do Projeto</h3>
                <div className="grid grid-cols-2 gap-6">
                    <div className="p-5 rounded-xl border" style={{ backgroundColor: COLORS.white, borderColor: COLORS.border }}>
                        <p className="text-[10px] uppercase font-bold mb-2" style={{ color: COLORS.slate400 }}>Tipo</p>
                        <p className="font-semibold" style={{ color: COLORS.slate700 }}>{project.type}</p>
                    </div>
                    <div className="p-5 rounded-xl border" style={{ backgroundColor: COLORS.white, borderColor: COLORS.border }}>
                        <p className="text-[10px] uppercase font-bold mb-2" style={{ color: COLORS.slate400 }}>Complexidade</p>
                        <p className="font-semibold capitalize" style={{ color: COLORS.slate700 }}>{project.complexity}</p>
                    </div>
                    <div className="p-5 rounded-xl border" style={{ backgroundColor: COLORS.white, borderColor: COLORS.border }}>
                        <p className="text-[10px] uppercase font-bold mb-2" style={{ color: COLORS.slate400 }}>Prazo Estimado</p>
                        <p className="font-semibold" style={{ color: COLORS.slate700 }}>{project.timeline}</p>
                    </div>
                    <div className="p-5 rounded-xl border" style={{ backgroundColor: COLORS.white, borderColor: COLORS.border }}>
                        <p className="text-[10px] uppercase font-bold mb-2" style={{ color: COLORS.slate400 }}>Investimento</p>
                        <p className="font-bold text-xl" style={{ color: COLORS.primary }}>R$ {project.finalValue.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</p>
                    </div>
                </div>
            </div>

            {/* Tecnologias */}
            {project.technologies && project.technologies.length > 0 && (
                <div className="mb-12">
                    <h3 className="text-lg font-bold mb-4" style={{ color: COLORS.slate800 }}>Tecnologias Utilizadas</h3>
                    <div className="flex flex-wrap gap-2">
                        {project.technologies.map((tech, i) => (
                            <span key={i} className="px-4 py-2 rounded-lg border text-sm font-semibold uppercase tracking-tight" style={{ backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary, color: COLORS.primary }}>
                                {tech}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Condições de Pagamento */}
            <div className="mt-auto p-8 rounded-2xl" style={{ backgroundColor: COLORS.primary, color: COLORS.white }}>
                <h3 className="text-lg font-bold mb-4" style={{ color: COLORS.white }}>Condições de Pagamento</h3>
                <div className="grid grid-cols-2 gap-6">
                    <div className="p-4 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                        <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.8)' }}>Entrada (25%)</p>
                        <p className="text-2xl font-bold" style={{ color: COLORS.white }}>R$ {downPayment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        <p className="text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>No aceite da proposta</p>
                    </div>
                    <div className="p-4 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                        <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.8)' }}>Final (75%)</p>
                        <p className="text-2xl font-bold" style={{ color: COLORS.white }}>R$ {finalPayment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        <p className="text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Na entrega do projeto</p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-16 pt-8 border-t text-xs text-slate-400 flex justify-between">
                <div>
                    <p className="font-semibold" style={{ color: COLORS.slate500 }}>{softrha.name}</p>
                    <p>CNPJ: {softrha.cnpj}</p>
                </div>
                <div className="text-right">
                    <p>{softrha.address}</p>
                    <p>{softrha.email}</p>
                </div>
            </div>

            {/* Page break indicator */}
            <div className="mt-8 text-center text-xs" style={{ color: COLORS.slate400 }}>
                --- continuação na próxima página ---
            </div>
        </div>
    );
};

export const PropostaTecnicaElite: React.FC<TemplateProps> = ({ client, softrha, project, date }) => {
    const downPayment = project.finalValue * 0.25;
    const finalPayment = project.finalValue * 0.75;

    return (
        <div id="proposta-tecnica" className="p-8 md:p-12 bg-white text-slate-800 font-sans max-w-[800px] mx-auto shadow-sm border border-slate-100" style={{ backgroundColor: COLORS.white }}>
            {/* Header */}
            <div className="flex justify-between items-start border-b pb-8" style={{ borderBottomColor: COLORS.border }}>
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg" style={{ backgroundColor: COLORS.primary, color: COLORS.white }}>
                        SR
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight" style={{ color: COLORS.primary }}>
                            SOFTRHA
                        </h1>
                        <p className="text-[10px] uppercase font-bold tracking-[0.2em]" style={{ color: COLORS.slate400 }}>Software & Solutions</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-sm font-bold" style={{ color: COLORS.slate700 }}>{softrha.representative}</p>
                    <p className="text-xs" style={{ color: COLORS.slate500 }}>{new Intl.DateTimeFormat('pt-BR').format(date)}</p>
                    <p className="text-xs font-medium" style={{ color: COLORS.primary }}>Ref: PROP-{Math.floor(Math.random() * 9000) + 1000}</p>
                </div>
            </div>

            {/* Client Info */}
            <div className="mt-8 grid grid-cols-2 gap-8 p-6 rounded-2xl border" style={{ backgroundColor: '#f8fafc', borderColor: COLORS.border }}>
                <div>
                    <p className="text-[10px] uppercase font-bold mb-1" style={{ color: COLORS.slate400 }}>Contratante</p>
                    <p className="font-bold" style={{ color: COLORS.slate800 }}>{client.company || client.name}</p>
                    <p className="text-xs" style={{ color: COLORS.slate500 }}>Documento: {client.document || "Não informado"}</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] uppercase font-bold mb-1" style={{ color: COLORS.slate400 }}>Contato Prncipal</p>
                    <p className="font-bold" style={{ color: COLORS.slate800 }}>{client.representative || client.name}</p>
                    <p className="text-xs" style={{ color: COLORS.slate500 }}>{client.email}</p>
                </div>
            </div>

            {/* Intro */}
            <div className="mb-8 mt-8">
                <p className="text-sm leading-relaxed">
                    Prezado(a) {client.representative || client.name}, agradecemos a oportunidade de apresentar nossa proposta para o desenvolvimento do seu projeto <strong>{project.type}</strong>. Nossa abordagem foca em alta performance, escalabilidade e excelente experiência do usuário.
                </p>
            </div>

            {/* Escopo Técnico */}
            <div className="mb-8">
                <h3 className="text-lg font-bold border-b mb-3 text-primary">01. Escopo Técnico</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="font-semibold">Tipo do Projeto:</p>
                        <p>{project.type}</p>
                    </div>
                    <div>
                        <p className="font-semibold">Complexidade:</p>
                        <p className="capitalize">{project.complexity}</p>
                    </div>
                    <div>
                        <p className="font-semibold">Páginas/Telas Estimadas:</p>
                        <p>{project.pages}</p>
                    </div>
                    <div>
                        <p className="font-semibold">Prazo Estimado:</p>
                        <p>{project.timeline}</p>
                    </div>
                    {project.technologies && project.technologies.length > 0 && (
                        <div className="col-span-2 mt-4 p-4 rounded-lg" style={{ backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0' }}>
                            <p className="font-semibold text-xs text-slate-500 uppercase tracking-wider mb-2">Stack Tecnológica:</p>
                            <div className="flex flex-wrap gap-1.5 mt-1">
                                {project.technologies.map((tech, i) => (
                                    <span key={i} className="px-2.5 py-1 bg-white border border-slate-200 text-[10px] rounded shadow-sm uppercase tracking-tight font-bold text-indigo-600" style={{ color: COLORS.primary, borderColor: COLORS.border }}>
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {project.features.length > 0 && (
                    <div className="mt-6 pt-4 border-t" style={{ borderTopColor: COLORS.border }}>
                        <p className="font-semibold text-sm mb-3" style={{ color: COLORS.slate700 }}>Principais Funcionalidades & Escopo:</p>
                        <ul className="list-none grid grid-cols-2 gap-x-6 gap-y-2 text-sm px-2">
                            {project.features.slice(0, 10).map((f, i) => (
                                <li key={i} className="flex items-start gap-2">
                                    <span className="mt-1" style={{ color: COLORS.primary }}>✓</span>
                                    <span className="leading-tight" style={{ color: COLORS.slate600 }}>{f}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Pricing Section */}
            <div className="mt-8 mb-8 p-8 rounded-3xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6" style={{ backgroundColor: COLORS.primary, color: COLORS.white }}>
                <div className="relative z-10">
                    <p className="text-sm font-medium mb-1" style={{ color: 'rgba(255,255,255,0.8)' }}>Investimento Total Estimado</p>
                    <h2 className="text-3xl font-black" style={{ color: COLORS.white }}>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(project.finalValue)}
                    </h2>
                </div>
                <div className="p-4 rounded-2xl border" style={{ backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', borderColor: 'rgba(255,255,255,0.2)' }}>
                    <p className="text-[10px] uppercase font-bold mb-1" style={{ color: 'rgba(255,255,255,0.8)' }}>Previsão de Entrega</p>
                    <p className="text-xl font-bold" style={{ color: COLORS.white }}>{project.timeline}</p>
                </div>
            </div>

            {/* Investimento */}
            <div className="mb-8 p-6 rounded-lg border" style={{ backgroundColor: '#f8fafc', borderColor: COLORS.border }}>
                <h3 className="text-lg font-bold mb-4" style={{ color: COLORS.slate800 }}>02. Investimento Comercial</h3>
                <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b" style={{ borderBottomColor: COLORS.border }}>
                        <span style={{ color: COLORS.slate600 }}>Valor Total do Projeto:</span>
                        <span className="text-xl font-bold" style={{ color: COLORS.primary }}>R$ {project.finalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <p className="text-xs italic mt-2" style={{ color: COLORS.slate500 }}>Condições de Pagamento:</p>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                        <div className="p-3 bg-white border rounded" style={{ borderColor: COLORS.border }}>
                            <p className="text-xs uppercase" style={{ color: COLORS.slate500 }}>Entrada (25%)</p>
                            <p className="font-bold" style={{ color: COLORS.slate800 }}>R$ {downPayment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                            <p className="text-[10px]" style={{ color: COLORS.slate400 }}>No aceite da proposta</p>
                        </div>
                        <div className="p-3 bg-white border rounded" style={{ borderColor: COLORS.border }}>
                            <p className="text-xs uppercase" style={{ color: COLORS.slate500 }}>Final (75%)</p>
                            <p className="font-bold" style={{ color: COLORS.slate800 }}>R$ {finalPayment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                            <p className="text-[10px]" style={{ color: COLORS.slate400 }}>Na entrega do projeto</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer / Contact */}
            <div className="mt-12 pt-6 border-t text-[10px] text-slate-400 flex justify-between uppercase tracking-tighter">
                <div>
                    <p>{softrha.name}</p>
                    <p>CNPJ: {softrha.cnpj}</p>
                </div>
                <div className="text-right">
                    <p>{softrha.address}</p>
                    <p>{softrha.email}</p>
                </div>
            </div>
        </div>
    );
};

export const ContratoUnificado: React.FC<TemplateProps> = ({ client, softrha, project, date }) => {
    const downPayment = project.finalValue * 0.25;
    const finalPayment = project.finalValue * 0.75;

    return (
        <div id="contrato-unificado" className="p-12 bg-white text-slate-800 font-sans max-w-[800px] mx-auto shadow-sm border border-slate-100" style={{ backgroundColor: COLORS.white }}>
            {/* Header */}
            <div className="flex justify-between items-center border-b pb-8 mb-8" style={{ borderBottomColor: COLORS.border }}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl" style={{ backgroundColor: COLORS.primary }}>
                        SR
                    </div>
                    <h1 className="text-xl font-black tracking-tighter text-indigo-600" style={{ color: COLORS.primary }}>
                        SOFTRHA
                    </h1>
                </div>
                <div className="text-right">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Contrato de Prestação de Serviços</h2>
                </div>
            </div>

            {/* Partes */}
            <div className="mb-6 text-sm text-justify">
                <p className="mb-4">
                    <strong>CONTRATADA:</strong> <strong>{softrha.name}</strong>, pessoa jurídica de direito privado, inscrita no CNPJ sob o nº {softrha.cnpj}, com sede em {softrha.address}, representada por {softrha.representative}.
                </p>
                <p>
                    <strong>CONTRATANTE:</strong> <strong>{client.company || client.name}</strong>, {client.document ? `inscrita no CPF/CNPJ sob o nº ${client.document},` : ""} com sede/endereço em {client.address || "endereço não informado"}, representada por {client.representative || client.name}.
                </p>
            </div>

            <p className="text-sm mb-6 text-justify">
                As partes acima identificadas têm, entre si, justo e acertado o presente Contrato de Prestação de Serviços, que se regerá pelas cláusulas seguintes e pelas condições de preço, forma e termo de pagamento descritas abaixo.
            </p>

            {/* Cláusulas */}
            <div className="space-y-4 text-sm text-justify">
                <div>
                    <h4 className="font-bold uppercase">CLÁUSULA PRIMEIRA - DO OBJETO</h4>
                    <p>O presente contrato tem o intuito de estabelecer a prestação de serviços de desenvolvimento de software do tipo <strong>{project.type}</strong>, seguindo as especificações técnicas debatidas e aprovadas pelas partes.</p>
                </div>

                <div>
                    <h4 className="font-bold uppercase">CLÁUSULA SEGUNDA - DO PREÇO E DAS CONDIÇÕES DE PAGAMENTO</h4>
                    <p>Pelos serviços prestados, o CONTRATANTE pagará à CONTRATADA o valor total de <strong>R$ {project.finalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>.</p>
                    <p className="mt-2">
                        O pagamento será efetuado da seguinte forma:<br />
                        a) 25% (vinte e cinco por cento) do valor total, correspondendo a <strong>R$ {downPayment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>, a título de sinal e início dos trabalhos;<br />
                        b) 75% (setenta e cinco por cento) do valor total, correspondendo a <strong>R$ {finalPayment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>, a ser pago na data de conclusão e entrega do software.
                    </p>
                </div>

                <div>
                    <h4 className="font-bold uppercase">CLÁUSULA TERCEIRA - DOS PRAZOS E TECNOLOGIA</h4>
                    <p>A CONTRATADA se compromete a entregar o projeto no prazo estimado de <strong>{project.timeline}</strong>, contados a partir do pagamento do sinal e entrega de todo o material necessário pelo CONTRATANTE.</p>
                    {project.technologies && project.technologies.length > 0 && (
                        <p className="mt-2 italic text-xs text-slate-500">
                            <strong>Pilha tecnológica principal:</strong> {project.technologies.join(", ")}.
                        </p>
                    )}
                </div>

                {/* Mais cláusulas seriam aqui, mas para economia de espaço usarei um resumo elegante */}
                <div>
                    <h4 className="font-bold uppercase">CLÁUSULA QUARTA - DAS RESPONSABILIDADES</h4>
                    <p>A CONTRATADA se responsabiliza pela qualidade técnica e estabilidade do software entregue. O CONTRATANTE se responsabiliza pelo fornecimento ágil de informações e aprovações necessárias para a fluidez do cronograma.</p>
                </div>
            </div>

            <div className="mt-12 text-sm text-center">
                <p>{softrha.address.split(',')[0]} (Brasil), {format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}.</p>
            </div>

            {/* Assinaturas */}
            <div className="mt-20 grid grid-cols-2 gap-12 text-center text-sm">
                <div className="pt-2 border-t" style={{ borderTopColor: COLORS.slate400 }}>
                    <p className="font-bold" style={{ color: COLORS.slate800 }}>{softrha.name}</p>
                    <p className="text-xs" style={{ color: COLORS.slate500 }}>CONTRATADA</p>
                </div>
                <div className="pt-2 border-t" style={{ borderTopColor: COLORS.slate400 }}>
                    <p className="font-bold" style={{ color: COLORS.slate800 }}>{client.name}</p>
                    <p className="text-xs" style={{ color: COLORS.slate500 }}>CONTRATANTE</p>
                </div>
            </div>
        </div>
    );
};

// Componente que une Proposta Técnica + Contrato em um único documento
export const ContratoCombinado: React.FC<TemplateProps> = ({ client, softrha, project, date }) => {
    const downPayment = project.finalValue * 0.25;
    const finalPayment = project.finalValue * 0.75;

    return (
        <div id="contrato-combinado" className="bg-white">
            {/* PÁGINA 1: CAPA COM RESUMO DA PROPOSTA */}
            <CapaDocumento client={client} softrha={softrha} project={project} date={date} />

            {/* PÁGINA 2: DETALHES TÉCNICOS DA PROPOSTA */}
            <div className="p-12 bg-white text-slate-800 font-sans max-w-[800px] mx-auto shadow-sm border border-slate-100 min-h-[900px]" style={{ backgroundColor: COLORS.white }}>
                {/* Header */}
                <div className="flex justify-between items-center border-b pb-6 mb-8" style={{ borderBottomColor: COLORS.border }}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xl" style={{ backgroundColor: COLORS.primary }}>
                            SR
                        </div>
                        <div>
                            <h1 className="text-lg font-black tracking-tight" style={{ color: COLORS.primary }}>SOFTRHA</h1>
                            <p className="text-[8px] uppercase font-bold tracking-[0.2em]" style={{ color: COLORS.slate400 }}>Software & Solutions</p>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-sm font-bold uppercase" style={{ color: COLORS.slate500 }}>Detalhes Técnicos</h2>
                    </div>
                </div>

                {/* Escopo Técnico Detalhado */}
                <div className="mb-8">
                    <h3 className="text-lg font-bold mb-4 pb-2 border-b" style={{ color: COLORS.primary, borderBottomColor: COLORS.border }}>Escopo Técnico do Projeto</h3>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="p-4 rounded-lg" style={{ backgroundColor: '#f8fafc' }}>
                            <p className="text-[10px] uppercase font-bold mb-1" style={{ color: COLORS.slate400 }}>Tipo de Projeto</p>
                            <p className="font-semibold" style={{ color: COLORS.slate800 }}>{project.type}</p>
                        </div>
                        <div className="p-4 rounded-lg" style={{ backgroundColor: '#f8fafc' }}>
                            <p className="text-[10px] uppercase font-bold mb-1" style={{ color: COLORS.slate400 }}>Complexidade</p>
                            <p className="font-semibold capitalize" style={{ color: COLORS.slate800 }}>{project.complexity}</p>
                        </div>
                        <div className="p-4 rounded-lg" style={{ backgroundColor: '#f8fafc' }}>
                            <p className="text-[10px] uppercase font-bold mb-1" style={{ color: COLORS.slate400 }}>Páginas/Telas</p>
                            <p className="font-semibold" style={{ color: COLORS.slate800 }}>{project.pages}</p>
                        </div>
                        <div className="p-4 rounded-lg" style={{ backgroundColor: '#f8fafc' }}>
                            <p className="text-[10px] uppercase font-bold mb-1" style={{ color: COLORS.slate400 }}>Prazo Estimado</p>
                            <p className="font-semibold" style={{ color: COLORS.slate800 }}>{project.timeline}</p>
                        </div>
                    </div>

                    {project.technologies && project.technologies.length > 0 && (
                        <div className="mb-6 p-5 rounded-lg border" style={{ backgroundColor: '#f8fafc', borderColor: COLORS.border }}>
                            <p className="text-[10px] uppercase font-bold mb-3" style={{ color: COLORS.slate400 }}>Stack Tecnológica</p>
                            <div className="flex flex-wrap gap-2">
                                {project.technologies.map((tech, i) => (
                                    <span key={i} className="px-3 py-1.5 rounded border text-xs font-semibold uppercase" style={{ backgroundColor: COLORS.white, borderColor: COLORS.primary, color: COLORS.primary }}>
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {project.features.length > 0 && (
                        <div className="mb-6">
                            <p className="font-semibold text-sm mb-3" style={{ color: COLORS.slate700 }}>Principais Funcionalidades</p>
                            <ul className="space-y-2">
                                {project.features.map((f, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm">
                                        <span className="mt-0.5 text-lg" style={{ color: COLORS.primary }}>✓</span>
                                        <span style={{ color: COLORS.slate600 }}>{f}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {project.integrations.length > 0 && (
                        <div className="mb-6">
                            <p className="font-semibold text-sm mb-3" style={{ color: COLORS.slate700 }}>Integrações</p>
                            <ul className="space-y-2">
                                {project.integrations.map((integration, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm">
                                        <span className="mt-0.5 text-lg" style={{ color: COLORS.primary }}>🔗</span>
                                        <span style={{ color: COLORS.slate600 }}>{integration}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {project.details && (
                        <div className="p-5 rounded-lg border" style={{ backgroundColor: '#fef3c7', borderColor: '#f59e0b' }}>
                            <p className="font-semibold text-sm mb-2" style={{ color: '#92400e' }}>Detalhes Adicionais</p>
                            <p className="text-sm" style={{ color: '#78350f' }}>{project.details}</p>
                        </div>
                    )}
                </div>

                {/* Investimento Detalhado */}
                <div className="mb-8 p-6 rounded-xl border" style={{ backgroundColor: '#f8fafc', borderColor: COLORS.border }}>
                    <h3 className="text-lg font-bold mb-4" style={{ color: COLORS.slate800 }}>Investimento e Condições de Pagamento</h3>
                    
                    <div className="flex justify-between items-center pb-3 mb-4 border-b" style={{ borderBottomColor: COLORS.border }}>
                        <span className="font-semibold" style={{ color: COLORS.slate700 }}>Valor Total do Projeto:</span>
                        <span className="text-2xl font-bold" style={{ color: COLORS.primary }}>R$ {project.finalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-white border" style={{ borderColor: COLORS.border }}>
                            <div className="flex justify-between items-start mb-2">
                                <p className="text-xs uppercase font-bold" style={{ color: COLORS.slate500 }}>Entrada (25%)</p>
                                <span className="text-xs px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 font-semibold">Início</span>
                            </div>
                            <p className="text-xl font-bold" style={{ color: COLORS.slate800 }}>R$ {downPayment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                            <p className="text-[10px] mt-1" style={{ color: COLORS.slate400 }}>No aceite da proposta</p>
                        </div>
                        <div className="p-4 rounded-lg bg-white border" style={{ borderColor: COLORS.border }}>
                            <div className="flex justify-between items-start mb-2">
                                <p className="text-xs uppercase font-bold" style={{ color: COLORS.slate500 }}>Final (75%)</p>
                                <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700 font-semibold">Entrega</span>
                            </div>
                            <p className="text-xl font-bold" style={{ color: COLORS.slate800 }}>R$ {finalPayment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                            <p className="text-[10px] mt-1" style={{ color: COLORS.slate400 }}>Na conclusão do projeto</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="pt-6 border-t text-[10px] text-slate-400 flex justify-between" style={{ borderTopColor: COLORS.border }}>
                    <div>
                        <p>{softrha.name}</p>
                        <p>CNPJ: {softrha.cnpj}</p>
                    </div>
                    <div className="text-right">
                        <p>{softrha.email}</p>
                        <p>{softrha.website}</p>
                    </div>
                </div>

                {/* Page break indicator */}
                <div className="mt-8 text-center text-xs" style={{ color: COLORS.slate400 }}>
                    --- continuação na próxima página ---
                </div>
            </div>

            {/* PÁGINA 3: CONTRATO UNIFICADO */}
            <div className="p-12 bg-white text-slate-800 font-sans max-w-[800px] mx-auto shadow-sm border border-slate-100 min-h-[900px]" style={{ backgroundColor: COLORS.white }}>
                {/* Header */}
                <div className="flex justify-between items-center border-b pb-8 mb-8" style={{ borderBottomColor: COLORS.border }}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xl" style={{ backgroundColor: COLORS.primary }}>
                            SR
                        </div>
                        <h1 className="text-lg font-black tracking-tight" style={{ color: COLORS.primary }}>SOFTRHA</h1>
                    </div>
                    <div>
                        <h2 className="text-sm font-bold uppercase tracking-widest" style={{ color: COLORS.slate400 }}>Contrato de Prestação de Serviços</h2>
                    </div>
                </div>

                {/* Partes */}
                <div className="mb-6 text-sm text-justify">
                    <p className="mb-4">
                        <strong>CONTRATADA:</strong> <strong>{softrha.name}</strong>, pessoa jurídica de direito privado, inscrita no CNPJ sob o nº {softrha.cnpj}, com sede em {softrha.address}, representada por {softrha.representative}.
                    </p>
                    <p>
                        <strong>CONTRATANTE:</strong> <strong>{client.company || client.name}</strong>, {client.document ? `inscrita no CPF/CNPJ sob o nº ${client.document},` : ""} com sede/endereço em {client.address || "endereço não informado"}, representada por {client.representative || client.name}.
                    </p>
                </div>

                <p className="text-sm mb-6 text-justify">
                    As partes acima identificadas têm, entre si, justo e acertado o presente Contrato de Prestação de Serviços, que se regerá pelas cláusulas seguintes e pelas condições de preço, forma e termo de pagamento descritas abaixo.
                </p>

                {/* Cláusulas */}
                <div className="space-y-5 text-sm text-justify">
                    <div>
                        <h4 className="font-bold uppercase mb-2" style={{ color: COLORS.slate800 }}>CLÁUSULA PRIMEIRA - DO OBJETO</h4>
                        <p>O presente contrato tem o intuito de estabelecer a prestação de serviços de desenvolvimento de software do tipo <strong>{project.type}</strong>, seguindo as especificações técnicas debatidas e aprovadas pelas partes, conforme detalhado nas páginas anteriores deste documento.</p>
                    </div>

                    <div>
                        <h4 className="font-bold uppercase mb-2" style={{ color: COLORS.slate800 }}>CLÁUSULA SEGUNDA - DO PREÇO E DAS CONDIÇÕES DE PAGAMENTO</h4>
                        <p>Pelos serviços prestados, o CONTRATANTE pagará à CONTRATADA o valor total de <strong>R$ {project.finalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>.</p>
                        <p className="mt-2">
                            O pagamento será efetuado da seguinte forma:<br />
                            a) 25% (vinte e cinco por cento) do valor total, correspondendo a <strong>R$ {downPayment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>, a título de sinal e início dos trabalhos;<br />
                            b) 75% (setenta e cinco por cento) do valor total, correspondendo a <strong>R$ {finalPayment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>, a ser pago na data de conclusão e entrega do software.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold uppercase mb-2" style={{ color: COLORS.slate800 }}>CLÁUSULA TERCEIRA - DOS PRAZOS E TECNOLOGIA</h4>
                        <p>A CONTRATADA se compromete a entregar o projeto no prazo estimado de <strong>{project.timeline}</strong>, contados a partir do pagamento do sinal e entrega de todo o material necessário pelo CONTRATANTE.</p>
                        {project.technologies && project.technologies.length > 0 && (
                            <p className="mt-2 italic text-xs" style={{ color: COLORS.slate500 }}>
                                <strong>Pilha tecnológica principal:</strong> {project.technologies.join(", ")}.
                            </p>
                        )}
                    </div>

                    <div>
                        <h4 className="font-bold uppercase mb-2" style={{ color: COLORS.slate800 }}>CLÁUSULA QUARTA - DAS RESPONSABILIDADES</h4>
                        <p>A CONTRATADA se responsabiliza pela qualidade técnica e estabilidade do software entregue, comprometendo-se a realizar correções de eventuais bugs no prazo de 90 dias após a entrega.</p>
                        <p className="mt-2">O CONTRATANTE se responsabiliza pelo fornecimento ágil de informações, materiais e aprovações necessárias para a fluidez do cronograma, bem como pelo pagamento nas datas acordadas.</p>
                    </div>

                    <div>
                        <h4 className="font-bold uppercase mb-2" style={{ color: COLORS.slate800 }}>CLÁUSULA QUINTA - DA CONFIDENCIALIDADE</h4>
                        <p>As partes comprometem-se a manter sigilo sobre todas as informações confidenciais trocadas durante a execução do projeto, não as divulgando a terceiros sem prévia autorização por escrito.</p>
                    </div>

                    <div>
                        <h4 className="font-bold uppercase mb-2" style={{ color: COLORS.slate800 }}>CLÁUSULA SEXTA - DA PROPRIEDADE INTELECTUAL</h4>
                        <p>Todos os direitos de propriedade intelectual sobre o software desenvolvido serão transferidos ao CONTRATANTE após a quitação integral do valor previsto neste contrato.</p>
                    </div>

                    <div>
                        <h4 className="font-bold uppercase mb-2" style={{ color: COLORS.slate800 }}>CLÁUSULA SÉTIMA - DA RESCISÃO</h4>
                        <p>O presente contrato poderá ser rescindido por qualquer uma das partes, mediante aviso prévio de 30 dias. Em caso de rescisão pelo CONTRATANTE antes da conclusão, os valores já pagos não serão devolvidos, sendo devidos os valores proporcionais aos serviços já executados.</p>
                    </div>

                    <div>
                        <h4 className="font-bold uppercase mb-2" style={{ color: COLORS.slate800 }}>CLÁUSULA OITAVA - DO FORO</h4>
                        <p>Fica eleito o foro da comarca de {softrha.address.split(',')[1]?.split('-')[0]?.trim() || "São Paulo - SP"} para dirimir quaisquer dúvidas decorrentes deste contrato, com renúncia a qualquer outro, por mais privilegiado que seja.</p>
                    </div>
                </div>

                {/* Data e Local */}
                <div className="mt-12 text-sm text-center">
                    <p>{softrha.address.split(',')[0]} (Brasil), {format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}.</p>
                </div>

                {/* Assinaturas */}
                <div className="mt-20 grid grid-cols-2 gap-12 text-center text-sm">
                    <div className="pt-3 border-t" style={{ borderTopColor: COLORS.slate400 }}>
                        <p className="font-bold" style={{ color: COLORS.slate800 }}>{softrha.representative}</p>
                        <p className="text-xs" style={{ color: COLORS.slate500 }}>Representante Legal - CONTRATADA</p>
                        <p className="text-[10px]" style={{ color: COLORS.slate400 }}>{softrha.name}</p>
                    </div>
                    <div className="pt-3 border-t" style={{ borderTopColor: COLORS.slate400 }}>
                        <p className="font-bold" style={{ color: COLORS.slate800 }}>{client.representative || client.name}</p>
                        <p className="text-xs" style={{ color: COLORS.slate500 }}>Representante Legal - CONTRATANTE</p>
                        <p className="text-[10px]" style={{ color: COLORS.slate400 }}>{client.company || client.name}</p>
                    </div>
                </div>

                {/* Testemunhas (opcional) */}
                <div className="mt-16">
                    <p className="text-sm font-bold mb-6 text-center" style={{ color: COLORS.slate600 }}>Testemunhas:</p>
                    <div className="grid grid-cols-2 gap-12">
                        <div className="pt-3 border-t" style={{ borderTopColor: COLORS.slate300 }}>
                            <p className="text-xs" style={{ color: COLORS.slate400 }}>Nome:</p>
                        </div>
                        <div className="pt-3 border-t" style={{ borderTopColor: COLORS.slate300 }}>
                            <p className="text-xs" style={{ color: COLORS.slate400 }}>Nome:</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
