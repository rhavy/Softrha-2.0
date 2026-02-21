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
    } catch (error) {
      console.error("Erro ao excluir documento:", error);
      toast({
        title: "Erro",
        description: "Erro ao excluir documento: " + (error as any).message,
        variant: "destructive",
      });
    }
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
            <Button variant="outline" className="gap-2">
              <Upload className="h-4 w-4" />
              Upload
            </Button>
            <Button className="gap-2" onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4" />
              Novo Documento
            </Button>
          </div>
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
                      onClick={() => handleEditDocument(doc)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDeleteClick(doc)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredDocuments.length === 0 && !loading && (
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
