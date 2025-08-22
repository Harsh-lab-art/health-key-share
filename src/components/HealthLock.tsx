import React, { useState, useRef, useEffect } from 'react';
import { Shield, Upload, QrCode, Eye, Lock, Clock, User, FileText, Activity, CheckCircle, AlertTriangle, Download, Share2, Smartphone, UserCheck, Menu, X, Moon, Sun, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import FileUpload from './FileUpload';
import QRCodeGenerator from './QRCodeGenerator';
import AuditLogs from './AuditLogs';
import HospitalDashboard from './HospitalDashboard';
import { useTheme } from 'next-themes';

interface HealthFile {
  id: number;
  name: string;
  type: string;
  size: number;
  uploadDate: string;
  encrypted: boolean;
  category: 'blood-test' | 'imaging' | 'prescription' | 'report' | 'other';
}

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  reason: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  type: 'Consultation' | 'Follow-up' | 'Emergency' | 'Surgery';
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
  appointment?: Appointment;
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
  const [userRole, setUserRole] = useState('patient');
  const [uploadedFiles, setUploadedFiles] = useState<HealthFile[]>([]);
  const [generatedTokens, setGeneratedTokens] = useState<AccessToken[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [selectedFile, setSelectedFile] = useState<HealthFile | null>(null);
  const [accessLevel, setAccessLevel] = useState<'full' | 'partial' | 'read-only'>('full');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme, setTheme } = useTheme();

  // Simulate file upload
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

  // Generate QR token with appointment details
  const generateQRToken = (file: HealthFile, appointmentId?: string): AccessToken => {
    const selectedAppointment = appointmentId ? 
      appointments.find(apt => apt.id === appointmentId) : null;

    const tokenData = {
      tokenId: 'HLK-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      fileId: file.id,
      fileName: file.name,
      fileType: file.type,
      fileCategory: file.category,
      accessLevel: accessLevel,
      patientName: selectedAppointment?.patientName || 'John Doe',
      validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      hospitalName: 'General Hospital',
      securityHash: btoa(Math.random().toString(36)).substring(0, 16),
      appointment: selectedAppointment ? {
        id: selectedAppointment.id,
        patientName: selectedAppointment.patientName,
        doctorName: selectedAppointment.doctorName,
        date: selectedAppointment.date,
        time: selectedAppointment.time,
        type: selectedAppointment.type,
        reason: selectedAppointment.reason,
        status: selectedAppointment.status,
        dayOfWeek: new Date(selectedAppointment.date).toLocaleDateString('en-US', { weekday: 'long' })
      } : null
    };

    const token: AccessToken = {
      id: tokenData.tokenId,
      fileId: file.id,
      fileName: file.name,
      accessLevel: accessLevel,
      validUntil: tokenData.validUntil,
      qrData: JSON.stringify(tokenData),
      createdAt: tokenData.createdAt,
      used: false,
      patientName: tokenData.patientName,
      hospitalName: tokenData.hospitalName,
      appointment: selectedAppointment
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

  // Sample data for demo
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
          size: 128640,
          uploadDate: '2024-08-21T16:45:00Z',
          encrypted: true,
          category: 'prescription'
        }
      ]);
    }

    if (appointments.length === 0) {
      setAppointments([
        {
          id: 'A001',
          patientId: 'P001',
          patientName: 'John Doe',
          doctorId: 'D001',
          doctorName: 'Dr. Sarah Johnson',
          date: '2024-08-25',
          time: '10:30 AM',
          reason: 'Routine cardiac checkup',
          status: 'Scheduled',
          type: 'Consultation'
        },
        {
          id: 'A002',
          patientId: 'P001',
          patientName: 'John Doe',
          doctorId: 'D002',
          doctorName: 'Dr. Michael Brown',
          date: '2024-08-26',
          time: '2:00 PM',
          reason: 'Neurological assessment',
          status: 'Scheduled',
          type: 'Follow-up'
        }
      ]);
    }
  }, [uploadedFiles.length, appointments.length]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'blood-test': return <Activity className="w-5 h-5 text-red-500" />;
      case 'imaging': return <Eye className="w-5 h-5 text-blue-500" />;
      case 'prescription': return <Pill className="w-5 h-5 text-green-500" />;
      case 'report': return <FileText className="w-5 h-5 text-purple-500" />;
      default: return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'blood-test': return 'bg-red-100 text-red-800 border-red-200';
      case 'imaging': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'prescription': return 'bg-green-100 text-green-800 border-green-200';
      case 'report': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-lg border-b border-border shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-primary p-2 rounded-xl shadow-medical-glow">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-foreground">HealthLock</h1>
                <p className="text-xs text-muted-foreground">Secure Patient Record System</p>
              </div>
            </div>
            
            {/* Desktop Controls */}
            <div className="hidden md:flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="h-9 w-9 p-0"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              
              <div className="flex items-center space-x-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg">
                <User className="w-4 h-4" />
                <span className="capitalize font-medium">{userRole}</span>
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="h-9 w-9 p-0"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-border animate-fade-in">
              <div className="space-y-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="w-full justify-start"
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </Button>
                
                <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground py-2">
                  <User className="w-4 h-4" />
                  <span className="capitalize font-medium">Logged in as {userRole}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-wrap gap-2 bg-card/50 backdrop-blur-sm rounded-xl p-2 shadow-sm">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Activity, color: 'text-blue-500' },
            { id: 'upload', label: 'Upload Records', icon: Upload, color: 'text-green-500' },
            { id: 'tokens', label: 'Access Tokens', icon: QrCode, color: 'text-purple-500' },
            { id: 'audit', label: 'Audit Logs', icon: Clock, color: 'text-orange-500' },
            { id: 'hospital', label: 'Hospital DB', icon: Database, color: 'text-pink-500' }
          ].map(tab => (
            <Button
              key={tab.id}
              onClick={() => {
                setCurrentView(tab.id);
                setIsMobileMenuOpen(false);
              }}
              variant={currentView === tab.id ? "default" : "ghost"}
              className={`flex items-center space-x-2 px-3 py-2 text-sm transition-all ${
                currentView === tab.id 
                  ? 'bg-gradient-primary text-white shadow-medical-glow' 
                  : `hover:bg-muted/50 ${tab.color}`
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
            </Button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Dashboard View */}
        {currentView === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-card shadow-medical-lg hover:shadow-medical-xl transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Records</p>
                    <p className="text-3xl font-bold text-foreground">{uploadedFiles.length}</p>
                  </div>
                  <FileText className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-card shadow-medical-lg hover:shadow-medical-xl transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Active Tokens</p>
                    <p className="text-3xl font-bold text-foreground">{generatedTokens.filter(t => !t.used).length}</p>
                  </div>
                  <QrCode className="w-8 h-8 text-secondary" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-card shadow-medical-lg hover:shadow-medical-xl transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Recent Access</p>
                    <p className="text-3xl font-bold text-foreground">{generatedTokens.filter(t => t.used).length}</p>
                  </div>
                  <Eye className="w-8 h-8 text-accent" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-card shadow-medical-lg hover:shadow-medical-xl transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Security Level</p>
                    <p className="text-3xl font-bold text-success">High</p>
                  </div>
                  <Shield className="w-8 h-8 text-success" />
                </div>
              </CardContent>
            </Card>

            {/* Recent Files */}
            <div className="md:col-span-2 lg:col-span-3 bg-gradient-card rounded-xl shadow-medical-lg border border-border/50">
              <div className="p-6 border-b border-border/30">
                <h3 className="text-lg font-semibold text-foreground">Recent Health Records</h3>
                <p className="text-sm text-muted-foreground">Your latest medical documents</p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {uploadedFiles.slice(0, 3).map(file => (
                    <div key={file.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="bg-primary/10 p-2 rounded-lg border border-primary/20">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{file.name}</p>
                          <p className="text-sm text-muted-foreground">{formatFileSize(file.size)} • {formatDate(file.uploadDate)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Lock className="w-4 h-4 text-success" />
                        <Badge variant="secondary" className="bg-success/10 text-success">
                          Encrypted
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-card rounded-xl shadow-medical-lg border border-border/50">
              <div className="p-6 border-b border-border/30">
                <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
                <p className="text-sm text-muted-foreground">Common tasks</p>
              </div>
              <div className="p-6 space-y-3">
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
              </div>
            </div>
          </div>
        )}

        {/* Upload View */}
        {currentView === 'upload' && (
          <FileUpload 
            onFileUpload={handleFileUpload}
            uploadedFiles={uploadedFiles}
            formatFileSize={formatFileSize}
            formatDate={formatDate}
            getCategoryIcon={getCategoryIcon}
            getCategoryColor={getCategoryColor}
          />
        )}

        {/* Tokens View */}
        {currentView === 'tokens' && (
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
            appointments={appointments}
          />
        )}

        {/* Audit Logs View */}
        {currentView === 'audit' && (
          <AuditLogs 
            auditLogs={auditLogs}
            formatDate={formatDate}
          />
        )}

        {/* Hospital Dashboard View */}
        {currentView === 'hospital' && (
          <HospitalDashboard onViewHealthLock={() => setCurrentView('dashboard')} />
        )}
      </div>
    </div>
  );
};

export default HealthLock;