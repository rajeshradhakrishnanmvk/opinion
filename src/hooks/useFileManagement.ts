"use client";

import { useState, useCallback } from 'react';
import { uploadPDFFile, getAllFiles, deleteFile, FileItem } from '@/lib/fileUtils';
import { useToast } from '@/hooks/use-toast';

export function useFileManagement() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const loadFiles = useCallback(async () => {
    try {
      setLoading(true);
      const fileList = await getAllFiles();
      setFiles(fileList);
    } catch (error) {
      console.error('Error loading files:', error);
      toast({
        title: "Error",
        description: "Failed to load files",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const uploadFile = useCallback(async (
    file: File, 
    uploadedBy: string, 
    uploadedByName: string
  ) => {
    try {
      setUploading(true);
      const uploadedFile = await uploadPDFFile(file, uploadedBy, uploadedByName);
      setFiles(prev => [uploadedFile, ...prev]);
      
      toast({
        title: "Success",
        description: `File "${file.name}" uploaded successfully`
      });
      
      return uploadedFile;
    } catch (error: unknown) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive"
      });
      throw error;
    } finally {
      setUploading(false);
    }
  }, [toast]);

  const removeFile = useCallback(async (fileName: string) => {
    try {
      await deleteFile(fileName);
      setFiles(prev => prev.filter(file => file.id !== fileName));
      
      toast({
        title: "Success",
        description: "File deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: "Error",
        description: "Failed to delete file",
        variant: "destructive"
      });
    }
  }, [toast]);

  return {
    files,
    loading,
    uploading,
    loadFiles,
    uploadFile,
    removeFile
  };
}