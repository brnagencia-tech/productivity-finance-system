import { useState, useRef } from "react";
import { Upload, X, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/_core/hooks/useAuth";

interface ReceiptUploadProps {
  onUploadComplete: (data: {
    receiptUrl: string;
    company?: string;
    cnpj?: string;
    amount?: string;
    date?: string;
    time?: string;
  }) => void;
  accept?: string;
  maxSizeMB?: number;
}

export function ReceiptUpload({
  onUploadComplete,
  accept = "image/*,application/pdf",
  maxSizeMB = 16
}: ReceiptUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const isAdmin = user?.role === 'admin';

  const handleFileSelect = (selectedFile: File) => {
    // Validar tamanho
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (selectedFile.size > maxSizeBytes) {
      toast({
        title: "Arquivo muito grande",
        description: `O arquivo deve ter no máximo ${maxSizeMB}MB`,
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);

    // Criar preview se for imagem
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else if (selectedFile.type === 'application/pdf') {
      setPreview(null); // PDF não tem preview visual
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    try {
      // 1. Upload para S3
      const formData = new FormData();
      formData.append('file', file);

      // Aqui você implementaria o upload real para S3
      // Por enquanto, simulando com URL local
      const receiptUrl = URL.createObjectURL(file);

      // 2. Se for admin, fazer OCR automático
      if (isAdmin) {
        setProcessing(true);
        try {
          // Chamar endpoint tRPC para OCR
          // const ocrResult = await trpc.receipts.extractData.mutate({ receiptUrl });
          
          // Simulando resposta de OCR
          await new Promise(resolve => setTimeout(resolve, 2000));
          const ocrResult = {
            company: "Empresa Exemplo LTDA",
            cnpj: "12.345.678/0001-90",
            amount: "150.00",
            date: new Date().toISOString().split('T')[0],
            time: "14:30:00"
          };

          onUploadComplete({
            receiptUrl,
            ...ocrResult
          });

          toast({
            title: "OCR Concluído",
            description: "Dados extraídos automaticamente. Revise antes de salvar.",
          });
        } catch (error) {
          toast({
            title: "Erro no OCR",
            description: "Não foi possível extrair os dados. Preencha manualmente.",
            variant: "destructive",
          });
          onUploadComplete({ receiptUrl });
        } finally {
          setProcessing(false);
        }
      } else {
        // Usuário comum: apenas upload, sem OCR
        onUploadComplete({ receiptUrl });
        toast({
          title: "Upload Concluído",
          description: "Preencha os dados manualmente.",
        });
      }
    } catch (error) {
      toast({
        title: "Erro no Upload",
        description: "Não foi possível fazer upload do arquivo.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {!file ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm text-foreground mb-2">
            Clique ou arraste o comprovante aqui
          </p>
          <p className="text-xs text-muted-foreground">
            Imagens ou PDF (máx. {maxSizeMB}MB)
          </p>
          {isAdmin && (
            <p className="text-xs text-primary mt-2 font-medium">
              ✨ OCR automático ativado
            </p>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            className="hidden"
          />
        </div>
      ) : (
        <Card className="p-4">
          <div className="flex items-start gap-4">
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="w-24 h-24 object-cover rounded border"
              />
            ) : (
              <div className="w-24 h-24 flex items-center justify-center bg-secondary rounded border">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {file.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024).toFixed(1)} KB
              </p>
              {isAdmin && (
                <p className="text-xs text-primary mt-1">
                  OCR será aplicado após upload
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRemove}
              disabled={uploading || processing}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Button
            onClick={handleUpload}
            disabled={uploading || processing}
            className="w-full mt-4"
          >
            {uploading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {processing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {processing ? "Extraindo dados..." : uploading ? "Enviando..." : "Confirmar Upload"}
          </Button>
        </Card>
      )}
    </div>
  );
}
