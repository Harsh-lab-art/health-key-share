import React, { useState, useRef, useEffect } from 'react';
import { Shield, Upload, QrCode, Eye, Lock, Clock, User, FileText, Activity, CheckCircle, AlertTriangle, Download, Share2, Smartphone, UserCheck, Cloud } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import QRCodeGenerator from './QRCodeGenerator';
import FileUpload from './FileUpload';
import AuditLogs from './AuditLogs';

interface HealthFile {
  id: number;
  name: string;
  type: string;
  size: number;
  uploadDate: string;
  encrypted: boolean;
  category: 'blood-test' | 'imaging' | 'prescription' | 'report' | 'other';
}

interface AccessToken {
  id: string;
  fileId: number;
  fileName: string;
  accessLevel: 'full' | 'partial' | 'read-only';
  validUntil: string;
  qrData: string;
  createdAt: string;
  used: boolean;
  patientName: string;
  doctorName?: string;
  hospitalName?: string;
}

interface AuditLog {
  id: number;
  timestamp: string;
  action: string;
  details: string;
  actor: string;
  ip: string;
  location?: string;
}

const HealthLock = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [userRole, setUserRole] = useState<'patient' | 'doctor' | 'pharmacist'>('patient');
  const [uploadedFiles, setUploadedFiles] = useState<HealthFile[]>([]);
  const [generatedTokens, setGeneratedTokens] = useState<AccessToken[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [selectedFile, setSelectedFile] = useState<HealthFile | null>(null);
  const [accessLevel, setAccessLevel] = useState<'full' | 'partial' | 'read-only'>('full');

  // Patient information (would be from user profile in real app)
  const patientInfo = {
    name: 'Dr. Sarah Johnson',
    id: 'HLK-001',
    age: 34,
    bloodType: 'A+',
    phone: '+1-555-0123',
    email: 'sarah.johnson@email.com'
  };

  // Add audit log
  const addAuditLog = (action: string, details: string, actor: string = userRole) => {
    const log: AuditLog = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      action,
      details,
      actor,
      ip: '192.168.1.' + Math.floor(Math.random() * 255),
      location: 'San Francisco, CA'
    };
    setAuditLogs(prev => [log, ...prev]);
  };

  // Handle file upload
  const handleFileUpload = (files: File[]) => {
    const newFiles: HealthFile[] = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      type: file.type,
      size: file.size,
      uploadDate: new Date().toISOString(),
      encrypted: true,
      category: file.name.toLowerCase().includes('blood') ? 'blood-test' :
                file.name.toLowerCase().includes('mri') || file.name.toLowerCase().includes('scan') ? 'imaging' :
                file.name.toLowerCase().includes('prescription') ? 'prescription' :
                file.name.toLowerCase().includes('report') ? 'report' : 'other'
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
    addAuditLog('File Upload', `Uploaded ${files.length} file(s)`);
  };

  // Generate QR token with comprehensive data
  const generateQRToken = (file: HealthFile) => {
    const tokenData = {
      tokenId: 'HLK-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      patient: {
        name: patientInfo.name,
        id: patientInfo.id,
        age: patientInfo.age,
        bloodType: patientInfo.bloodType,
        phone: patientInfo.phone,
        email: patientInfo.email
      },
      file: {
        id: file.id,
        name: file.name,
        category: file.category,
        uploadDate: file.uploadDate,
        size: file.size
      },
      access: {
        level: accessLevel,
        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString()
      },
      security: {
        encrypted: true,
        checksum: Math.random().toString(36).substr(2, 16)
      }
    };

    const token: AccessToken = {
      id: tokenData.tokenId,
      fileId: file.id,
      fileName: file.name,
      accessLevel: accessLevel,
      validUntil: tokenData.access.validUntil,
      qrData: JSON.stringify(tokenData),
      createdAt: tokenData.access.createdAt,
      used: false,
      patientName: patientInfo.name,
      doctorName: undefined,
      hospitalName: undefined
    };
    
    setGeneratedTokens(prev => [...prev, token]);
    addAuditLog('QR Generated', `Token ${token.id} for ${file.name} (${accessLevel} access)`);
    return token;
  };

  // Simulate QR scan access
  const simulateQRAccess = (token: AccessToken) => {
    const updatedToken = { 
      ...token, 
      used: true, 
      doctorName: 'Dr. Michael Chen',
      hospitalName: 'San Francisco General Hospital'
    };
    setGeneratedTokens(prev => prev.map(t => t.id === token.id ? updatedToken : t));
    addAuditLog('Record Access', `Dr. Michael Chen accessed ${token.fileName} via QR token ${token.id}`, 'doctor');
  };

  // Initialize sample data
  useEffect(() => {
    if (uploadedFiles.length === 0) {
      setUploadedFiles([
        {
          id: 1,
          name: 'Blood_Test_Results_2024.pdf',
          type: 'application/pdf',
          size: 245760,
          uploadDate: '2024-08-20T10:30:00Z',
          encrypted: true,
          category: 'blood-test'
        },
        {
          id: 2,
          name: 'MRI_Scan_Brain.dcm',
          type: 'application/dicom',
          size: 15728640,
          uploadDate: '2024-08-19T14:15:00Z',
          encrypted: true,
          category: 'imaging'
        },
        {
          id: 3,
          name: 'Prescription_Antibiotics.pdf',
          type: 'application/pdf',
          size: 125000,
          uploadDate: '2024-08-18T09:45:00Z',
          encrypted: true,
          category: 'prescription'
        }
      ]);
    }
  }, [uploadedFiles.length]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'blood-test': return <Activity className="w-4 h-4" />;
      case 'imaging': return <Eye className="w-4 h-4" />;
      case 'prescription': return <FileText className="w-4 h-4" />;
      case 'report': return <FileText className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch(category) {
      case 'blood-test': return 'bg-red-100 text-red-700 border-red-200';
      case 'imaging': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'prescription': return 'bg-green-100 text-green-700 border-green-200';
      case 'report': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-bg">
      {/* Header */}
      <div className="bg-card border-b border-border shadow-medical-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-primary p-2 rounded-xl shadow-medical-glow">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">HealthLock</h1>
                <p className="text-xs text-muted-foreground">Secure Patient Record Sharing</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Select value={userRole} onValueChange={(value: 'patient' | 'doctor' | 'pharmacist') => setUserRole(value)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="patient">Patient View</SelectItem>
                  <SelectItem value="doctor">Doctor View</SelectItem>
                  <SelectItem value="pharmacist">Pharmacist View</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span className="capitalize font-medium">{userRole}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={currentView} onValueChange={setCurrentView} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-card shadow-medical-sm">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <Activity className="w-4 h-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center space-x-2">
              <Upload className="w-4 h-4" />
              <span>Upload</span>
            </TabsTrigger>
            <TabsTrigger value="tokens" className="flex items-center space-x-2">
              <QrCode className="w-4 h-4" />
              <span>QR Tokens</span>
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Audit Logs</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Content */}
          <TabsContent value="dashboard" className="space-y-6 mt-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-card shadow-medical-md hover:shadow-medical-lg transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Records</CardTitle>
                  <FileText className="w-4 h-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{uploadedFiles.length}</div>
                  <p className="text-xs text-muted-foreground">Encrypted & secured</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card shadow-medical-md hover:shadow-medical-lg transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Tokens</CardTitle>
                  <QrCode className="w-4 h-4 text-secondary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{generatedTokens.filter(t => !t.used).length}</div>
                  <p className="text-xs text-muted-foreground">Ready for sharing</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card shadow-medical-md hover:shadow-medical-lg transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Recent Access</CardTitle>
                  <Eye className="w-4 h-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{generatedTokens.filter(t => t.used).length}</div>
                  <p className="text-xs text-muted-foreground">Authorized views</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card shadow-medical-md hover:shadow-medical-lg transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Security Level</CardTitle>
                  <Shield className="w-4 h-4 text-success" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-success">High</div>
                  <p className="text-xs text-muted-foreground">End-to-end encrypted</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Files and Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="shadow-medical-lg">
                  <CardHeader>
                    <CardTitle>Recent Health Records</CardTitle>
                    <CardDescription>Your latest medical documents</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {uploadedFiles.slice(0, 5).map(file => (
                        <div key={file.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg border ${getCategoryColor(file.category)}`}>
                              {getCategoryIcon(file.category)}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{file.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatFileSize(file.size)} • {formatDate(file.uploadDate)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Lock className="w-4 h-4 text-success" />
                            <Badge variant="secondary" className="text-success-foreground bg-success/10">
                              Encrypted
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="shadow-medical-lg">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    onClick={() => setCurrentView('upload')}
                    className="w-full justify-start bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
                    variant="ghost"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Record
                  </Button>
                  <Button 
                    onClick={() => setCurrentView('tokens')}
                    className="w-full justify-start bg-secondary/10 text-secondary hover:bg-secondary/20 border border-secondary/20"
                    variant="ghost"
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    Generate QR
                  </Button>
                  <Button 
                    onClick={() => setCurrentView('audit')}
                    className="w-full justify-start bg-accent/10 text-accent hover:bg-accent/20 border border-accent/20"
                    variant="ghost"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    View Activity
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Upload Content */}
          <TabsContent value="upload" className="mt-6">
            <FileUpload 
              onFileUpload={handleFileUpload}
              uploadedFiles={uploadedFiles}
              formatFileSize={formatFileSize}
              formatDate={formatDate}
              getCategoryIcon={getCategoryIcon}
              getCategoryColor={getCategoryColor}
            />
          </TabsContent>

          {/* Tokens Content */}
          <TabsContent value="tokens" className="mt-6">
            <QRCodeGenerator
              uploadedFiles={uploadedFiles}
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
              accessLevel={accessLevel}
              setAccessLevel={setAccessLevel}
              generateQRToken={generateQRToken}
              generatedTokens={generatedTokens}
              simulateQRAccess={simulateQRAccess}
              formatDate={formatDate}
            />
          </TabsContent>

          {/* Audit Content */}
          <TabsContent value="audit" className="mt-6">
            <AuditLogs auditLogs={auditLogs} formatDate={formatDate} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HealthLock;