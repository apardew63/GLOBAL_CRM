"use client";

import React, { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from "@/components/dashboard-layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, CheckCircle, XCircle, AlertCircle, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function AttendanceUploadPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <AttendanceUploadContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

function AttendanceUploadContent() {
  const { user, getToken } = useAuth();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState(null);
  const fileInputRef = useRef(null);

  // Check user permissions - only project managers can access this page
  const isProjectManager = user?.role === 'project_manager' || (user?.role === 'employee' && user?.designation === 'project_manager');

  if (!isProjectManager) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access this page. Only project managers can upload attendance PDF files.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
        toast.error('Please select a PDF file');
        return;
      }

      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }

      setFile(selectedFile);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('attendanceFile', file);

      const token = getToken();
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch('http://localhost:5000/api/attendance/upload-pdf', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        setUploadResult(result.data);
        toast.success('Attendance data uploaded successfully');
      } else {
        toast.error(result.error || 'Upload failed');
        setUploadResult({ error: result.error });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed. Please try again.');
      setUploadResult({ error: 'Upload failed. Please try again.' });
    } finally {
      setUploading(false);
      setUploadProgress(100);
    }
  };

  const downloadSampleCSV = () => {
    const csvContent = `employee_id,date,check_in,check_out,total_hours,status
EMP001,2024-01-15,09:30:00,18:30:00,8.5,present
EMP002,2024-01-15,09:45:00,18:15:00,8.0,late
EMP003,2024-01-15,,,0,absent`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'attendance_sample.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Attendance PDF Upload</h1>
          <p className="text-muted-foreground">
            Upload monthly attendance data in PDF format for bulk processing
          </p>
        </div>
        <Button onClick={downloadSampleCSV} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Download Sample Template
        </Button>
      </div>

      {/* Upload Section - Only for Project Managers */}
      {isProjectManager && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Attendance PDF
            </CardTitle>
            <CardDescription>
              Select a PDF file containing attendance data. The file should contain tabular attendance information with employee details, dates, and attendance records
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="attendance-file">Attendance PDF File</Label>
              <Input
                id="attendance-file"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                ref={fileInputRef}
                disabled={uploading}
              />
            </div>

            {file && (
              <div className="flex items-center gap-2 p-2 bg-muted rounded">
                <FileText className="h-4 w-4" />
                <span className="text-sm">{file.name}</span>
                <Badge variant="secondary">{(file.size / 1024).toFixed(1)} KB</Badge>
              </div>
            )}

            {uploading && (
              <div className="space-y-2">
                <Progress value={uploadProgress} />
                <p className="text-sm text-muted-foreground">Uploading and processing...</p>
              </div>
            )}

            <Button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="w-full max-w-sm"
            >
              {uploading ? 'Uploading...' : 'Upload Attendance Data'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Upload Results */}
      {uploadResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {uploadResult.error ? (
                <XCircle className="h-5 w-5 text-destructive" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-600" />
              )}
              Upload Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            {uploadResult.error ? (
              <Alert>
                <XCircle className="h-4 w-4" />
                <AlertDescription>{uploadResult.error}</AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{uploadResult.totalRecords || 0}</div>
                    <div className="text-sm text-muted-foreground">Total Records</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{uploadResult.processedRecords || 0}</div>
                    <div className="text-sm text-muted-foreground">Processed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{(uploadResult.totalRecords || 0) - (uploadResult.processedRecords || 0)}</div>
                    <div className="text-sm text-muted-foreground">Errors</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{uploadResult.records?.length || 0}</div>
                    <div className="text-sm text-muted-foreground">Preview Records</div>
                  </div>
                </div>

                {uploadResult.errors && uploadResult.errors.length > 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="font-medium mb-2">Errors encountered:</div>
                      <ul className="list-disc list-inside space-y-1">
                        {uploadResult.errors.slice(0, 10).map((error, index) => (
                          <li key={index} className="text-sm">{error}</li>
                        ))}
                        {uploadResult.errors.length > 10 && (
                          <li className="text-sm text-muted-foreground">
                            ... and {uploadResult.errors.length - 10} more errors
                          </li>
                        )}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

    </div>
  );
}