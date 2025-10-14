"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from "@/components/dashboard-layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Download, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AttendancePage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <AttendanceContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

function AttendanceContent() {
  const { user, getToken } = useAuth();
  const [pdfFiles, setPdfFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check user permissions - only admins can access this page
  if (user?.role !== 'admin') {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access this page. Only administrators can manage attendance records.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Load uploaded PDF files
  const loadPdfFiles = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const response = await fetch('http://localhost:5000/api/attendance/uploaded-pdfs', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load PDF files');
      }

      const result = await response.json();
      if (result.success) {
        setPdfFiles(result.data.files);
      } else {
        throw new Error(result.error || 'Failed to load PDF files');
      }
    } catch (err) {
      console.error('Error loading PDF files:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Download PDF file
  const downloadPdf = async (filename) => {
    try {
      const token = await getToken();
      const response = await fetch(`http://localhost:5000/api/attendance/download-pdf/${encodeURIComponent(filename)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to download PDF');
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('PDF downloaded successfully');
    } catch (err) {
      console.error('Error downloading PDF:', err);
      toast.error('Failed to download PDF');
    }
  };


  // Load PDF files on component mount
  useEffect(() => {
    loadPdfFiles();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Attendance Management</h1>
          <p className="text-muted-foreground">
            Download attendance PDF files uploaded by project managers
          </p>
        </div>
        <Button onClick={loadPdfFiles} variant="outline" disabled={loading}>
          <Download className="mr-2 h-4 w-4" />
          {loading ? 'Loading...' : 'Refresh PDFs'}
        </Button>
      </div>

      {error && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Uploaded PDF Files</CardTitle>
          <CardDescription>
            Attendance PDF files uploaded by project managers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading PDF files...</p>
            </div>
          ) : pdfFiles.length === 0 ? (
            <div className="text-center py-8">
              <Download className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">No PDF Files</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                No attendance PDF files have been uploaded yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pdfFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{file.filename}</h4>
                    <p className="text-sm text-muted-foreground">
                      Uploaded: {new Date(file.uploadDate).toLocaleString()} • 
                      Size: {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button 
                    onClick={() => downloadPdf(file.filename)}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}