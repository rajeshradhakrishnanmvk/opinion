"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useFileManagement } from '@/hooks/useFileManagement';
import { canViewFiles } from '@/lib/fileUtils';
import { FileItem } from '@/lib/fileUtils';
import { FileUpload } from '@/components/FileUpload';
import { FileList } from '@/components/FileList';
import { PDFViewer } from '@/components/PDFViewer';
import { TokenRefreshButton } from '@/components/TokenRefreshButton';
import { AuthDebugPanel } from '@/components/AuthDebugPanel';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';

export default function FilesPage() {
  const { firebaseUser, profile, loading: authLoading } = useAuth();
  const { files, loading, uploading, loadFiles, uploadFile, removeFile } = useFileManagement();
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const router = useRouter();

  const canView = canViewFiles(profile?.role);

  useEffect(() => {
    if (!authLoading && !firebaseUser) {
      router.push('/signin');
      return;
    }

    if (!authLoading && firebaseUser && canView) {
      loadFiles();
    }
  }, [firebaseUser, authLoading, canView, loadFiles, router]);

  const handleFileUpload = async (file: File, uploadedBy: string, uploadedByName: string) => {
    await uploadFile(file, uploadedBy, uploadedByName);
  };

  const handleFileDelete = async (fileName: string) => {
    await removeFile(fileName);
    // Clear selected file if it was deleted
    if (selectedFile?.id === fileName) {
      setSelectedFile(null);
    }
  };

  if (authLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!firebaseUser) {
    return null; // Will redirect to signin
  }

  if (!canView) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertDescription>
            Access denied. Only administrators and owners can view files.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 h-screen flex flex-col">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Document Management</h1>
          <p className="text-muted-foreground">
            Upload and manage PDF documents for the community
          </p>
        </div>
        <TokenRefreshButton />
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        {/* Left Panel - File List and Upload */}
        <div className="w-80 flex flex-col gap-4">
          <Tabs defaultValue="files" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="files">Files</TabsTrigger>
              <TabsTrigger value="upload">Upload</TabsTrigger>
            </TabsList>
            <TabsContent value="files" className="mt-4">
              <FileList
                files={files}
                loading={loading}
                selectedFile={selectedFile}
                onFileSelect={setSelectedFile}
                onFileDelete={handleFileDelete}
              />
            </TabsContent>
            <TabsContent value="upload" className="mt-4">
              <FileUpload
                onFileUpload={handleFileUpload}
                uploading={uploading}
              />
            </TabsContent>
          </Tabs>
          
          {/* Debug Panel */}
          <AuthDebugPanel />
        </div>

        {/* Right Panel - PDF Viewer */}
        <div className="flex-1 min-w-0">
          <PDFViewer file={selectedFile} />
        </div>
      </div>
    </div>
  );
}