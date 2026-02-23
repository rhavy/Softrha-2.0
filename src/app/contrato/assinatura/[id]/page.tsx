"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { FileSignature, Upload, CheckCircle2, FileText, Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

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

  const contractRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!contract?.content) return;

    toast({
      title: "Gerando PDF...",
      description: "Aguarde enquanto o PDF é gerado",
    });

    try {
      const html2pdf = (await import("html2pdf.js")).default;

      // Criar documento HTML isolado em iframe
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><title>Contrato</title></head>
        <body style="margin:0;padding:40px;font-family:Arial,sans-serif;background:#fff;color:#000;">
          <div style="max-width:800px;margin:0 auto;">
            <div style="text-align:center;border-bottom:2px solid #000;padding-bottom:20px;margin-bottom:30px;">
              <h1 style="font-size:22px;margin:0;color:#000;">Contrato de Prestação de Serviços</h1>
              <p style="font-size:12px;color:#333;margin:5px 0;">Softrha - Desenvolvimento de Software</p>
            </div>
            <div style="margin-bottom:20px;font-size:12px;background:#f5f5f5;padding:15px;">
              <strong>CONTRATANTE:</strong> ${contract.budget?.clientName || 'Não informado'}<br/>
              <strong>DATA:</strong> ${new Date().toLocaleDateString('pt-BR')}
            </div>
            <div style="font-size:11px;line-height:1.6;text-align:justify;white-space:pre-wrap;">${contract.content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
            <div style="margin-top:50px;border-top:1px solid #ddd;pt:10px;font-size:9px;color:#666;text-align:center;">Documento gerado eletronicamente</div>
          </div>
        </body>
        </html>
      `;

      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const iframe = document.createElement('iframe');
      iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:800px;height:600px;border:none;visibility:hidden;';
      document.body.appendChild(iframe);

      iframe.onload = () => {
        if (!iframe.contentWindow?.document) return;

        const opt = {
          margin: [15, 15, 15, 15] as [number, number, number, number],
          filename: `contrato-${contract.budget?.clientName?.replace(/\s+/g, '_') || 'cliente'}.pdf`,
          image: { type: 'jpeg' as const, quality: 1.0 },
          html2canvas: { scale: 3, useCORS: true, backgroundColor: '#ffffff' },
          jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        } as const;

        html2pdf().set(opt).from(iframe.contentWindow.document.body).save().then(() => {
          toast({ title: "PDF gerado!", description: "Contrato baixado com sucesso" });
          setTimeout(() => { document.body.removeChild(iframe); URL.revokeObjectURL(url); }, 1000);
        }).catch((error) => {
          console.error('Erro:', error);
          document.body.removeChild(iframe);
          URL.revokeObjectURL(url);
          toast({ title: "Erro", description: "Erro ao gerar PDF", variant: "destructive" });
        });
      };

      iframe.src = url;
    } catch (error) {
      console.error('Erro:', error);
      toast({ title: "Erro", description: "Erro ao gerar PDF", variant: "destructive" });
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center">
              <CheckCircle2 className="h-20 w-20 mx-auto text-green-500 mb-4" />
              <CardTitle>Contrato Já Assinado!</CardTitle>
              <CardDescription>
                Este contrato já foi assinado e enviado.
              </CardDescription>
            </CardHeader>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl"
      >
        {/* Header - Esconder na impressão */}
        <div className="text-center mb-8 pt-8 print:hidden">
          <h1 className="text-3xl font-bold mb-2">Assinatura de Contrato</h1>
          <p className="text-muted-foreground">
            {contract.budget?.projectType} - {contract.budget?.clientName}
          </p>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader className="print:hidden">
            <div className="flex items-center gap-3">
              <FileSignature className="h-8 w-8 text-purple-600" />
              <div>
                <CardTitle>Contrato de Prestação de Serviços</CardTitle>
                <CardDescription>
                  {contract.budget?.projectType} - {contract.budget?.clientName}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          {/* Cabeçalho para impressão */}
          <div className="print-header hidden print:block mb-6">
            <h1 className="text-2xl font-bold mb-2">Contrato de Prestação de Serviços</h1>
            <p className="text-sm text-gray-600">Softrha - Desenvolvimento de Software</p>
            <p className="text-sm text-gray-600 mb-4">Cliente: {contract.budget?.clientName}</p>
            <hr className="my-4" />
          </div>

          <CardContent className="space-y-6 print:space-y-4">
            {/* Instruções */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg print:hidden">
              <div className="flex gap-3">
                <FileText className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="font-semibold text-blue-800">Instruções para assinatura:</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700">
                    <li>Baixe o contrato em PDF clicando no botão "Baixar em PDF"</li>
                    <li>Imprima o documento (ou assine digitalmente)</li>
                    <li>Assine o contrato</li>
                    <li>Digitalize o documento assinado em PDF</li>
                    <li>Faça o upload do PDF assinado abaixo</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Botões de Download e Impressão */}
            <div className="flex gap-2 print:hidden">
              <Button onClick={handleDownload} variant="outline" className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Baixar em PDF
              </Button>
            </div>

            {/* Visualização do Contrato */}
            <div ref={contractRef} className="bg-muted rounded-lg p-6 max-h-[500px] overflow-y-auto print:max-h-none print:overflow-visible print:bg-white print:p-0">
              <pre className="text-sm whitespace-pre-wrap font-sans print:text-black print:text-base">
                {contract.content}
              </pre>
            </div>

            {/* Upload - Esconder na impressão */}
            <div className="space-y-4 print:hidden">
              <div className="space-y-2">
                <Label>Seu Nome Completo (para assinatura)</Label>
                <Input
                  placeholder="Digite seu nome completo"
                  value={signatureName}
                  onChange={(e) => setSignatureName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Upload do Contrato Assinado (PDF)</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground mb-2">
                    {selectedFile ? selectedFile.name : "Clique para selecionar o arquivo PDF"}
                  </p>
                  <Input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <Button variant="outline" onClick={() => document.getElementById("file-upload")?.click()} type="button">
                    Selecionar Arquivo
                  </Button>
                </div>
              </div>

              <Button
                className="w-full"
                onClick={handleUpload}
                disabled={isUploading || !selectedFile || !signatureName}
                size="lg"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Enviar Contrato Assinado
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default function AssinarContratoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    }>
      <AssinaturaContent />
    </Suspense>
  );
}
