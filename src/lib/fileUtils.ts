import { storage, auth } from './firebase';
import { ref, uploadBytes, getDownloadURL, listAll, deleteObject, getMetadata } from 'firebase/storage';

export interface FileItem {
  id: string;
  name: string;
  url: string;
  size: number;
  uploadedAt: Date;
  uploadedBy: string;
  uploadedByName: string;
  type: string;
}

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

// Helper function to refresh authentication token
async function refreshAuthToken(): Promise<void> {
  if (auth.currentUser) {
    try {
      await auth.currentUser.getIdToken(true); // Force refresh
      console.log('Auth token refreshed successfully');
    } catch (error) {
      console.error('Error refreshing auth token:', error);
    }
  }
}

export async function uploadPDFFile(
  file: File, 
  uploadedBy: string, 
  uploadedByName: string
): Promise<FileItem> {
  // Refresh auth token to ensure we have latest custom claims
  await refreshAuthToken();

  // Validate file type
  if (file.type !== 'application/pdf') {
    throw new Error('Only PDF files are allowed');
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size must be less than 5MB');
  }

  const timestamp = Date.now();
  const fileName = `${timestamp}_${file.name}`;
  const storageRef = ref(storage, `documents/${fileName}`);

  try {
    // Upload file with metadata
    const metadata = {
      customMetadata: {
        uploadedBy,
        uploadedByName,
        uploadedAt: new Date().toISOString()
      },
      contentType: 'application/pdf'
    };

    const snapshot = await uploadBytes(storageRef, file, metadata);
    const downloadURL = await getDownloadURL(snapshot.ref);

    return {
      id: fileName,
      name: file.name,
      url: downloadURL,
      size: file.size,
      uploadedAt: new Date(),
      uploadedBy,
      uploadedByName,
      type: 'application/pdf'
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('unauthorized') || error.message.includes('permission')) {
        throw new Error('Permission denied. Please ensure you have admin or owner role and try refreshing the page.');
      }
    }
    
    throw new Error('Failed to upload file. Please check your permissions.');
  }
}

export async function getAllFiles(): Promise<FileItem[]> {
  // Refresh auth token to ensure we have latest custom claims
  await refreshAuthToken();

  try {
    const storageRef = ref(storage, 'documents/');
    const result = await listAll(storageRef);
    
    const files: FileItem[] = [];
    
    for (const itemRef of result.items) {
      try {
        const url = await getDownloadURL(itemRef);
        const metadata = await getMetadata(itemRef);
        
        // Parse filename to extract original name and timestamp
        const fileName = itemRef.name;
        const originalName = fileName.includes('_') 
          ? fileName.substring(fileName.indexOf('_') + 1)
          : fileName;

        files.push({
          id: fileName,
          name: originalName,
          url,
          size: metadata.size || 0,
          uploadedAt: metadata.timeCreated ? new Date(metadata.timeCreated) : new Date(),
          uploadedBy: metadata.customMetadata?.uploadedBy || 'Unknown',
          uploadedByName: metadata.customMetadata?.uploadedByName || 'Unknown',
          type: metadata.contentType || 'application/pdf'
        });
      } catch (error) {
        console.error(`Error getting metadata for ${itemRef.name}:`, error);
      }
    }

    return files.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
  } catch (error) {
    console.error('Error fetching files:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('unauthorized') || error.message.includes('permission')) {
        throw new Error('Permission denied. Please ensure you have admin or owner role and try refreshing the page.');
      }
    }
    
    throw new Error('Failed to fetch files');
  }
}

export async function deleteFile(fileName: string): Promise<void> {
  try {
    const storageRef = ref(storage, `documents/${fileName}`);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error('Failed to delete file');
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function canUploadFiles(role?: string): boolean {
  return role === 'admin' || role === 'owner';
}

export function canViewFiles(role?: string): boolean {
  return role === 'admin' || role === 'owner';
}

export function canDeleteFiles(role?: string): boolean {
  return role === 'admin';
}