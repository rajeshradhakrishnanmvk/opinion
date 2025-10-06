"use client";

import { useState } from 'react';
import { FileItem } from '@/lib/fileUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, ExternalLink, FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface PDFViewerProps {
  file: FileItem | null;
}

export function PDFViewer({ file }: PDFViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleDownload = async () => {
    if (!file) return;
    
    try {
      const response = await fetch(file.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const openInNewTab = () => {
    if (file) {
      window.open(file.url, '_blank');
    }
  };

  if (!file) {
    return (
      <Card className="h-full">
        <CardContent className="p-6 h-full flex items-center justify-center">
          <div className="text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Select a file to view</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate" title={file.name}>
              {file.name}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">PDF</Badge>
              <span className="text-sm text-muted-foreground">
                Uploaded by {file.uploadedByName}
              </span>
              <span className="text-sm text-muted-foreground">
                {file.uploadedAt.toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button size="sm" variant="outline" onClick={openInNewTab}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in New Tab
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <div className="h-full relative bg-muted/20">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background">
              <div className="text-center space-y-4">
                <Skeleton className="h-8 w-32 mx-auto" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24 mx-auto" />
                  <Skeleton className="h-4 w-32 mx-auto" />
                </div>
              </div>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-background">
              <div className="text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">Failed to load PDF</p>
                <Button onClick={openInNewTab}>
                  Open in New Tab
                </Button>
              </div>
            </div>
          )}
          <iframe
            src={`${file.url}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
            className="w-full h-full border-0"
            title={file.name}
            onLoad={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setError(true);
            }}
            style={{ minHeight: '600px' }}
          />
        </div>
      </CardContent>
    </Card>
  );
}