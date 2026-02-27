"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import {
  FileText,
  Plus,
  Search,
  Download,
  Trash2,
  Folder,
  Image,
  Sheet,
  Upload,
  Filter,
  Edit2,
  Eye,
  X,
  ExternalLink,
} from "lucide-react";
import { useState, useEffect } from "react";
import { NovoDocumentoModal } from "@/components/modals/novo-documento-modal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const folders = [
  { name: "Todos", count: 0 },
  { name: "Propostas", count: 0 },
  { name: "Contratos", count: 0 },
  { name: "Design", count: 0 },
  { name: "Documentação", count: 0 },
  { name: "Planejamento", count: 0 },
  { name: "Financeiro", count: 0 },
];

const typeIcons: Record<string, React.ReactNode> = {
  pdf: <FileText className="h-5 w-5" />,
  doc: <FileText className="h-5 w-5" />,
  image: <Image className="h-5 w-5" />,
  sheet: <Sheet className="h-5 w-5" />,
};

const typeColors: Record<string, string> = {
  pdf: "text-red-500 bg-red-500/10",
  doc: "text-blue-500 bg-blue-500/10",
  image: "text-purple-500 bg-purple-500/10",
  sheet: "text-green-500 bg-green-500/10",
};

export default function DashboardDocumentos() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [folderFilter, setFolderFilter] = useState<string>("Todos");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToEdit, setDocumentToEdit] = useState<any>(null);
  const [documentToDelete, setDocumentToDelete] = useState<any>(null);
  const [documentToView, setDocumentToView] = useState<any>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [documentsList, setDocumentsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar documentos do banco de dados
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/documentos");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao buscar documentos");
      }
      const data = await response.json();
      setDocumentsList(data);
    } catch (error) {
      console.error("Erro ao carregar documentos:", error);
      setDocumentsList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleNewDocument = async (data: any) => {
    try {
      const response = await fetch("/api/documentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao criar documento");
      }

      await fetchDocuments();
      setModalOpen(false);
      toast({
        title: "Documento criado!",
        description: "O documento foi criado com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao criar documento:", error);
      toast({
        title: "Erro",
        description: "Erro ao criar documento: " + (error as any).message,
        variant: "destructive",
      });
    }
  };

  const handleEditDocument = (document: any) => {
    setDocumentToEdit(document);
    setModalOpen(true);
  };

  const handleUpdateDocument = async (data: any) => {
    if (!documentToEdit?.id) return;

    try {
      const response = await fetch(`/api/documentos/${documentToEdit.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao atualizar documento");
      }

      await fetchDocuments();
      setModalOpen(false);
      setDocumentToEdit(null);
      toast({
        title: "Documento atualizado!",
        description: "O documento foi atualizado com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao atualizar documento:", error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar documento: " + (error as any).message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = (document: any) => {
    setDocumentToDelete(document);
    setDeleteDialogOpen(true);
  };

  const handleDeleteDocument = async () => {
    if (!documentToDelete?.id) return;

    try {
      const response = await fetch(`/api/documentos/${documentToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao excluir documento");
      }

      await fetchDocuments();
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
      
      toast({
        title: "Documento excluído!",
        description: "O documento foi excluído com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao excluir documento:", error);
      toast({
        title: "Erro",
        description: "Erro ao excluir documento: " + (error as any).message,
        variant: "destructive",
      });
    }
  };

  const handleDownload = async (document: any) => {
    if (document.url) {
      window.open(document.url, "_blank");
      toast({
        title: "Abrindo documento",
        description: "O documento será aberto em uma nova aba.",
      });
    } else {
      toast({
        title: "Download indisponível",
        description: "Este documento não possui URL de download.",
        variant: "destructive",
      });
    }
  };

  const handleViewDocument = (document: any) => {
    setDocumentToView(document);
    setViewDialogOpen(true);
  };

  const filteredDocuments = documentsList.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFolder = folderFilter === "Todos" || doc.folder === folderFilter;
    return matchesSearch && matchesFolder;
  });

  // Atualizar contagem de pastas
  const foldersWithCount = folders.map((folder) => ({
    ...folder,
    count: folder.name === "Todos"
      ? documentsList.length
      : documentsList.filter(d => d.folder === folder.name).length,
  }));

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando documentos...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold">Documentos</h1>
            <p className="text-muted-foreground">
              Gerencie todos os arquivos e documentos
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={() => setModalOpen(true)}>
              <Upload className="h-4 w-4" />
              Upload
            </Button>
            <Button className="gap-2" onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4" />
              Novo Documento
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Documentos</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{documentsList.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {foldersWithCount.find(f => f.name === "Todos")?.count || 0} cadastrados
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Propostas</CardTitle>
              <Folder className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">
                {foldersWithCount.find(f => f.name === "Propostas")?.count || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Documentos de propostas
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contratos</CardTitle>
              <Folder className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {foldersWithCount.find(f => f.name === "Contratos")?.count || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Documentos contratuais
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outros</CardTitle>
              <Folder className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-500">
                {documentsList.length - (foldersWithCount.find(f => f.name === "Propostas")?.count || 0) - (foldersWithCount.find(f => f.name === "Contratos")?.count || 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Demais documentos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Folders */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
              {foldersWithCount.map((folder) => (
                <button
                  key={folder.name}
                  onClick={() => setFolderFilter(folder.name)}
                  className={`flex flex-col items-center p-3 rounded-lg transition-colors ${
                    folderFilter === folder.name
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  <Folder className="h-6 w-6 mb-2" />
                  <span className="text-xs font-medium text-center">{folder.name}</span>
                  <span className="text-xs opacity-70">{folder.count}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar documentos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filtrar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Documents List */}
        <Card>
          <CardHeader>
            <CardTitle>Arquivos</CardTitle>
            <CardDescription>
              {filteredDocuments.length} documento(s) encontrado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredDocuments.map((doc, index) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors group"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${typeColors[doc.type]}`}>
                      {typeIcons[doc.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{doc.name}</p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>{doc.folder}</span>
                        <span>•</span>
                        <span>{doc.size}</span>
                        <span>•</span>
                        <span>{new Date(doc.createdAt).toLocaleDateString("pt-BR")}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs text-muted-foreground hidden sm:block">
                      {doc.author}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleViewDocument(doc)}
                      title="Visualizar"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditDocument(doc)}
                      title="Editar"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDownload(doc)}
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDeleteClick(doc)}
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredDocuments.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {documentsList.length === 0 ? "Nenhum documento cadastrado" : "Nenhum documento encontrado"}
                </h3>
                <p className="text-muted-foreground">
                  {documentsList.length === 0
                    ? "Comece adicionando seu primeiro documento!"
                    : "Tente ajustar os filtros ou adicione um novo documento"}
                </p>
                {documentsList.length === 0 && (
                  <Button className="mt-4 gap-2" onClick={() => setModalOpen(true)}>
                    <Plus className="h-4 w-4" />
                    Adicionar Primeiro Documento
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <NovoDocumentoModal
          open={modalOpen}
          onOpenChange={(open) => {
            setModalOpen(open);
            if (!open) setDocumentToEdit(null);
          }}
          onSubmit={documentToEdit ? handleUpdateDocument : handleNewDocument}
          documentToEdit={documentToEdit}
        />

        {/* View Document Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Visualizar Documento
              </DialogTitle>
              <DialogDescription>
                {documentToView?.name}
              </DialogDescription>
            </DialogHeader>

            {documentToView && (
              <div className="space-y-4">
                {/* Informações do Documento */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm font-semibold">Tipo</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`h-8 w-8 rounded flex items-center justify-center ${typeColors[documentToView.type]}`}>
                        {typeIcons[documentToView.type]}
                      </div>
                      <span className="capitalize">{documentToView.type}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Pasta</p>
                    <p className="mt-1">{documentToView.folder}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Tamanho</p>
                    <p className="mt-1">{documentToView.size}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Autor</p>
                    <p className="mt-1">{documentToView.author}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-semibold">Criado em</p>
                    <p className="mt-1">{new Date(documentToView.createdAt).toLocaleString("pt-BR")}</p>
                  </div>
                </div>

                {/* Preview/Visualização */}
                {documentToView.url ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">Visualização</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(documentToView.url, "_blank")}
                      >
                        <ExternalLink className="h-3 w-3 mr-2" />
                        Abrir em nova aba
                      </Button>
                    </div>
                    <div className="border rounded-lg overflow-hidden bg-muted/50">
                      {documentToView.type === "image" ? (
                        <img
                          src={documentToView.url}
                          alt={documentToView.name}
                          className="w-full h-auto max-h-[400px] object-contain"
                        />
                      ) : documentToView.type === "pdf" ? (
                        <iframe
                          src={documentToView.url}
                          className="w-full h-[500px]"
                          title="Preview do PDF"
                        />
                      ) : (
                        <div className="p-8 text-center">
                          <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                          <p className="text-muted-foreground">
                            Visualização não disponível para este tipo de arquivo
                          </p>
                          <Button
                            className="mt-4"
                            onClick={() => window.open(documentToView.url, "_blank")}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Baixar Arquivo
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center border rounded-lg bg-muted/50">
                    <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg font-semibold">URL não disponível</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Este documento não possui uma URL de visualização cadastrada
                    </p>
                  </div>
                )}

                {/* Ações */}
                <div className="flex justify-end gap-2 pt-4 border-t">
                  {documentToView.url && (
                    <Button
                      variant="outline"
                      onClick={() => window.open(documentToView.url, "_blank")}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setViewDialogOpen(false);
                      handleEditDocument(documentToView);
                    }}
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  <Button onClick={() => setViewDialogOpen(false)}>
                    Fechar
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Exclusão</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir "{documentToDelete?.name}"?
                Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDeleteDocument}>
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </DashboardLayout>
  );
}
