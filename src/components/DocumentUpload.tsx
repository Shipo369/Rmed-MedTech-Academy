import React, { useState, useRef } from 'react';
import { FileUp, Download, FileText, AlertCircle } from 'lucide-react';
import { DeviceDocument, DocumentDownload } from '../types';
import toast from 'react-hot-toast';

interface DocumentUploadProps {
  deviceId: string;
  currentDoc?: DeviceDocument;
  onDocumentUpdate: (doc: DeviceDocument) => void;
  isAdmin: boolean;
  username: string;
  userId: string;
}

export function DocumentUpload({ deviceId, currentDoc, onDocumentUpdate, isAdmin, username, userId }: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const maxFileSize = 10 * 1024 * 1024; // 10MB in bytes

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const validateFile = (file: File): boolean => {
    if (file.type !== 'application/pdf') {
      toast.error('Nur PDF-Dateien sind erlaubt');
      return false;
    }

    if (file.size > maxFileSize) {
      toast.error('Die Datei darf maximal 10MB groß sein');
      return false;
    }

    return true;
  };

  const handleFile = async (file: File) => {
    if (!validateFile(file)) return;

    // In einer echten Anwendung würden wir die Datei zu einem Server hochladen
    // Hier speichern wir die Datei temporär als URL
    const fileUrl = URL.createObjectURL(file);
    
    const newDoc: DeviceDocument = {
      id: crypto.randomUUID(),
      deviceId,
      fileName: file.name,
      fileSize: file.size,
      uploadDate: new Date().toISOString(),
      version: currentDoc ? String(parseInt(currentDoc.version) + 1) : '1',
      downloads: [],
      fileUrl // Speichere die temporäre URL
    };

    onDocumentUpdate(newDoc);
    toast.success('Dokumentation erfolgreich hochgeladen');
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      await handleFile(file);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFile(file);
    }
  };

  const handleDownload = () => {
    if (!currentDoc?.fileUrl) {
      toast.error('Keine Datei zum Herunterladen verfügbar');
      return;
    }

    // Erstelle einen temporären Link und klicke ihn an
    const link = document.createElement('a');
    link.href = currentDoc.fileUrl;
    link.download = currentDoc.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    const download: DocumentDownload = {
      id: crypto.randomUUID(),
      userId,
      username,
      documentId: currentDoc.id,
      downloadDate: new Date().toISOString()
    };

    const updatedDoc: DeviceDocument = {
      ...currentDoc,
      downloads: [...currentDoc.downloads, download]
    };

    onDocumentUpdate(updatedDoc);
    toast.success('Dokumentation wird heruntergeladen');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const hasUserDownloaded = currentDoc?.downloads.some(d => d.userId === userId);

  return (
    <div className="space-y-4">
      {isAdmin ? (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-blue-500 hover:bg-gray-50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <FileUp className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              PDF-Datei hierher ziehen oder{' '}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-blue-600 hover:text-blue-700"
              >
                auswählen
              </button>
            </p>
            <p className="text-xs text-gray-500 mt-1">Maximal 10MB</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      ) : null}

      {currentDoc ? (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <h4 className="font-medium text-gray-900">{currentDoc.fileName}</h4>
                <p className="text-sm text-gray-500">
                  Version {currentDoc.version} • {formatFileSize(currentDoc.fileSize)}
                </p>
                <p className="text-xs text-gray-400">
                  Hochgeladen am {formatDate(currentDoc.uploadDate)}
                </p>
              </div>
            </div>
            <button
              onClick={handleDownload}
              className={`inline-flex items-center px-3 py-1.5 rounded-md ${
                hasUserDownloaded
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              <Download className="h-4 w-4 mr-1.5" />
              {hasUserDownloaded ? 'Erneut herunterladen' : 'Herunterladen'}
            </button>
          </div>

          {isAdmin && currentDoc.downloads.length > 0 && (
            <div className="mt-4 border-t border-gray-200 pt-4">
              <h5 className="text-sm font-medium text-gray-700 mb-2">Downloads</h5>
              <div className="space-y-2">
                {currentDoc.downloads.map(download => (
                  <div
                    key={download.id}
                    className="flex items-center justify-between text-sm text-gray-600"
                  >
                    <span>{download.username}</span>
                    <span>{formatDate(download.downloadDate)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            {isAdmin
              ? 'Noch keine Dokumentation hochgeladen'
              : 'Keine Dokumentation verfügbar'}
          </p>
        </div>
      )}
    </div>
  );
}