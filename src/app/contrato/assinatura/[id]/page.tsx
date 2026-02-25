"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { FileSignature, Upload, CheckCircle2, FileText, Download, Printer, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { PropostaTecnicaElite, ContratoUnificado, ContratoCombinado } from "@/components/dashboard/contract-templates";

function AssinaturaContent() {
  const params = useParams();
  const { toast } = useToast();
  const [contract, setContract] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [signatureName, setSignatureName] = useState("");

  useEffect(() => {
    if (params.id) {
      fetch(`/api/contratos/${params.id}/assinar`)
        .then((res) => res.json())
        .then((data) => {
          setContract(data);
          setIsLoading(false);
        })
        .catch(() => {
          toast({
            title: "Erro",
            description: "Contrato não encontrado",
            variant: "destructive",
          });
          setIsLoading(false);
        });
    }
  }, [params.id, toast]);

  const handleDownload = async () => {
    const elementId = contract?.metadata?.templateType === "combinado" ? "contrato-combinado" 
                      : contract?.metadata?.templateType === "proposta" ? "proposta-tecnica" 
                      : "contrato-unificado";
    const element = document.getElementById(elementId) || document.getElementById("contract-content");

    if (!element) {
      toast({ title: "Erro", description: "Documento não encontrado para download", variant: "destructive" });
      return;
    }

    toast({
      title: "Gerando PDF...",
      description: "Aguarde enquanto o documento é preparado",
    });

    try {
      const html2pdfModule = (await import("html2pdf.js")) as any;
      const pdfLib = typeof html2pdfModule.default === 'function' ? html2pdfModule.default : html2pdfModule;

      const opt = {
        margin: 10,
        filename: `${contract?.metadata?.templateType === "combinado" ? "Contrato_Completo" : contract?.metadata?.templateType === "proposta" ? "Proposta" : "Contrato"}_${contract?.metadata?.client?.name.replace(/\s+/g, '_') || 'SoftRha'}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
          logging: false
        },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
      };

      await pdfLib().set(opt).from(element).save();
      toast({ title: "Download iniciado!", description: "Seu contrato foi gerado com sucesso." });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({ title: "Erro", description: "Falha ao gerar PDF. Tente imprimir o documento.", variant: "destructive" });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
        toast({
          title: "Arquivo inválido",
          description: "Apenas arquivos PDF são aceitos",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "Arquivo necessário",
        description: "Selecione o contrato assinado em PDF",
        variant: "destructive",
      });
      return;
    }

    if (!signatureName.trim()) {
      toast({
        title: "Nome necessário",
        description: "Digite seu nome completo para assinatura",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("signatureName", signatureName);

      const response = await fetch(`/api/contratos/${params.id}/assinar`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao fazer upload");
      }

      toast({
        title: "Contrato enviado!",
        description: "Seu contrato assinado foi enviado com sucesso",
      });

      setTimeout(() => {
        window.location.href = "/contrato/obrigado";
      }, 2000);
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao enviar contrato",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="max-w-md w-full border-0 shadow-xl">
          <CardHeader className="text-center">
            <FileText className="h-16 w-16 mx-auto text-red-500 mb-4" />
            <CardTitle>Contrato não encontrado</CardTitle>
            <CardDescription>
              O contrato que você está tentando acessar não existe ou já foi assinado.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (contract.status === "signed" || contract.status === "signed_by_client") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50 p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center">
              <CheckCircle2 className="h-20 w-20 mx-auto text-green-500 mb-4" />
              <CardTitle>Contrato Já Assinado!</CardTitle>
              <CardDescription>
                Este contrato já foi assinado e enviado. Agradecemos a parceria!
              </CardDescription>
            </CardHeader>
          </Card>
        </motion.div>
      </div>
    );
  }

  const hasMetadata = contract.metadata && contract.metadata.softrha && contract.metadata.client;

  return (
    <div className="min-h-screen flex flex-col items-center bg-slate-100 p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl grid lg:grid-cols-12 gap-8"
      >
        {/* Left Side: Document Preview */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden min-h-[800px] relative">
            <div className="absolute top-4 right-4 print:hidden flex gap-2">
              <Button size="sm" variant="outline" onClick={handleDownload} className="bg-white/80 backdrop-blur">
                <Download className="h-4 w-4 mr-2" /> PDF
              </Button>
              <Button size="sm" variant="outline" onClick={() => window.print()} className="bg-white/80 backdrop-blur">
                <Printer className="h-4 w-4" />
              </Button>
            </div>

            <div id="contract-content" className="p-0 border-0 scale-[0.85] md:scale-100 origin-top">
              {hasMetadata ? (
                contract.metadata.templateType === "combinado" ? (
                  <ContratoCombinado
                    client={contract.metadata.client}
                    softrha={contract.metadata.softrha}
                    project={contract.metadata.project}
                    date={new Date(contract.createdAt)}
                  />
                ) : contract.metadata.templateType === "proposta" ? (
                  <PropostaTecnicaElite
                    client={contract.metadata.client}
                    softrha={contract.metadata.softrha}
                    project={contract.metadata.project}
                    date={new Date(contract.createdAt)}
                  />
                ) : (
                  <ContratoUnificado
                    client={contract.metadata.client}
                    softrha={contract.metadata.softrha}
                    project={contract.metadata.project}
                    date={new Date(contract.createdAt)}
                  />
                )
              ) : (
                <div className="p-12 font-sans whitespace-pre-wrap text-sm leading-relaxed">
                  <h1 className="text-2xl font-bold mb-6 text-center uppercase underline">Contrato de Prestação de Serviços</h1>
                  {contract.content}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Signing Actions */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-0 shadow-xl sticky top-8">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <FileSignature className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Assinar Documento</CardTitle>
                  <CardDescription>Siga os passos para finalizar</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-sm text-amber-800 font-medium mb-1">Passo 1: Revisão e Download</p>
                  <p className="text-xs text-amber-700 leading-relaxed mb-3">
                    Revise o conteúdo ao lado. Se preferir assinar fisicamente, baixe o PDF abaixo, assine e faça o upload.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full bg-white border-amber-300 text-amber-700 hover:bg-amber-100 gap-2"
                    onClick={handleDownload}
                  >
                    <Download className="h-4 w-4" /> Baixar PDF para Imprimir
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Passo 2: Seu Nome Completo</Label>
                    {signatureName && contract?.metadata?.client?.name && signatureName.trim().toLowerCase() !== contract.metadata.client.name.trim().toLowerCase() && (
                      <span className="text-[10px] text-red-500 font-medium">Nome não corresponde ao contrato</span>
                    )}
                  </div>
                  <Input
                    placeholder="Nome completo igual ao do contrato"
                    value={signatureName}
                    onChange={(e) => setSignatureName(e.target.value)}
                    className={`h-11 ${signatureName && contract?.metadata?.client?.name && signatureName.trim().toLowerCase() !== contract.metadata.client.name.trim().toLowerCase() ? "border-red-300 focus-visible:ring-red-300" : ""}`}
                  />
                  {contract?.metadata?.client?.name && (
                    <p className="text-[10px] text-muted-foreground italic">
                      Deve ser exatamente: <span className="font-semibold text-slate-700">{contract.metadata.client.name}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Passo 3: Upload do PDF Assinado</Label>
                  <div
                    className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${selectedFile ? "border-green-300 bg-green-50" : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                      }`}
                  >
                    <Upload className={`h-8 w-8 mx-auto mb-2 ${selectedFile ? "text-green-500" : "text-slate-400"}`} />
                    <p className="text-sm font-medium mb-1">
                      {selectedFile ? selectedFile.name : "Selecione o arquivo PDF"}
                    </p>
                    <p className="text-[10px] text-slate-500 mb-3 uppercase tracking-wider">Apenas PDF aceito</p>

                    <Input
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById("file-upload")?.click()}
                      type="button"
                    >
                      Procurar Arquivo
                    </Button>
                  </div>
                </div>

                <Button
                  className="w-full h-12 text-lg font-semibold shadow-lg shadow-primary/20"
                  onClick={handleUpload}
                  disabled={
                    isUploading ||
                    !selectedFile ||
                    !signatureName ||
                    signatureName.trim().toLowerCase() !== (contract?.metadata?.client?.name || "").trim().toLowerCase()
                  }
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                      Processando...
                    </>
                  ) : (
                    "Finalizar Assinatura"
                  )}
                </Button>

                <p className="text-[10px] text-center text-slate-400 px-4">
                  Ao clicar em finalizar, você declara que revisou e concorda com todos os termos apresentados no documento.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}

export default function AssinarContratoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    }>
      <AssinaturaContent />
    </Suspense>
  );
}
