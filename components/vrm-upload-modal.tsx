"use client"

import { useState, useRef } from "react"
import { Upload, X, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface VRMUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onUpload: (url: string, fileName: string) => void
}

export function VRMUploadModal({ isOpen, onClose, onUpload }: VRMUploadModalProps) {
  const [dragging, setDragging] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(true)
  }

  const handleDragLeave = () => {
    setDragging(false)
  }

  const handleFileSelect = async (file: File) => {
    if (!file.name.endsWith(".vrm")) {
      alert("Por favor, seleciona um arquivo .vrm válido")
      return
    }

    setUploading(true)
    setFileName(file.name)

    // Create object URL for preview
    const url = URL.createObjectURL(file)
    setFileUrl(url)

    try {
      // Upload via API
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/avatars/vrm", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Upload failed")
      }

      const data = await response.json()
      setUploading(false)

      // Notifica sucesso
      setTimeout(() => {
        onUpload(url, file.name) // Por agora usa object URL, no futuro será URL do server
        onClose()
      }, 500)
    } catch (error) {
      console.error("Upload error:", error)
      alert(`Erro ao fazer upload: ${error}`)
      setUploading(false)
      setFileName(null)
      setFileUrl(null)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (files?.length > 0) {
      handleFileSelect(files[0])
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md mx-4 animate-appear">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">Upload Avatar VRM</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragging
              ? "border-primary bg-primary/10"
              : "border-border bg-card/50 hover:border-primary/50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".vrm"
            onChange={handleInputChange}
            className="hidden"
          />

          {!fileName ? (
            <>
              <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">
                Arrasta o arquivo .vrm aqui
              </p>
              <p className="text-xs text-muted-foreground mb-4">ou</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                Seleciona um arquivo
              </Button>
            </>
          ) : uploading ? (
            <>
              <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-foreground">A enviar...</p>
            </>
          ) : (
            <>
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground">{fileName}</p>
              <p className="text-xs text-emerald-400 mt-1">Pronto!</p>
            </>
          )}
        </div>

        {/* Info */}
        <div className="mt-4 p-3 rounded-lg bg-muted/20 border border-border/50">
          <p className="text-xs text-muted-foreground">
            <strong>Dica:</strong> O avatar VRM terá lip-sync automático com o bot durante as conversas.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-6">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
          {fileName && !uploading && (
            <Button className="flex-1" onClick={() => fileInputRef.current?.click()}>
              Escolher Outro
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
