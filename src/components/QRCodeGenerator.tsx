import React, { useState, useRef, useEffect } from 'react';
import { QrCode, FileText, Download, Share2, Smartphone } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import QRCodeLib from 'qrcode';

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

interface QRCodeGeneratorProps {
  uploadedFiles: HealthFile[];
  selectedFile: HealthFile | null;
  setSelectedFile: (file: HealthFile | null) => void;
  accessLevel: 'full' | 'partial' | 'read-only';
  setAccessLevel: (level: 'full' | 'partial' | 'read-only') => void;
  generateQRToken: (file: HealthFile) => AccessToken;
  generatedTokens: AccessToken[];
  simulateQRAccess: (token: AccessToken) => void;
  formatDate: (dateString: string) => string;
}

const QRCodeDisplay: React.FC<{ token: AccessToken; onSimulateAccess: () => void }> = ({ token, onSimulateAccess }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        // Create a comprehensive QR code data that mobile scanners can read
        const qrData = JSON.parse(token.qrData);
        const qrUrl = await QRCodeLib.toDataURL(token.qrData, {
          width: 300,
          margin: 2,
          color: {
            dark: '#1e40af', // Primary blue
            light: '#ffffff'
          },
          errorCorrectionLevel: 'H' // High error correction for medical data
        });
        setQrCodeUrl(qrUrl);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };

    generateQRCode();
  }, [token]);

  const getAccessLevelColor = (level: string) => {
    switch(level) {
      case 'full': return 'bg-success/10 text-success border-success/20';
      case 'partial': return 'bg-warning/10 text-warning border-warning/20';
      case 'read-only': return 'bg-primary/10 text-primary border-primary/20';
      default: return 'bg-muted/10 text-muted-foreground border-border';
    }
  };

  const downloadQR = () => {
    const link = document.createElement('a');
    link.download = `healthlock-qr-${token.id}.png`;
    link.href = qrCodeUrl;
    link.click();
  };

  const shareQR = async () => {
    if (navigator.share) {
      try {
        // Convert data URL to blob
        const response = await fetch(qrCodeUrl);
        const blob = await response.blob();
        const file = new File([blob], `healthlock-qr-${token.id}.png`, { type: 'image/png' });
        
        await navigator.share({
          title: 'HealthLock QR Code',
          text: `Access token for ${token.fileName}`,
          files: [file]
        });
      } catch (error) {
        console.error('Error sharing QR code:', error);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Card className="shadow-medical-xl bg-gradient-card">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-4 bg-gradient-primary rounded-2xl shadow-medical-glow w-fit">
            <QrCode className="w-8 h-8 text-white" />
          </div>
          <CardTitle>QR Access Token</CardTitle>
          <CardDescription>Scan with any QR scanner to access medical data</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* QR Code Display */}
          <div className="bg-white p-6 rounded-2xl shadow-medical-md mx-auto w-fit">
            {qrCodeUrl ? (
              <img 
                src={qrCodeUrl} 
                alt="QR Code" 
                className="w-64 h-64 mx-auto"
              />
            ) : (
              <div className="w-64 h-64 bg-muted animate-pulse rounded-lg flex items-center justify-center">
                <QrCode className="w-16 h-16 text-muted-foreground" />
              </div>
            )}
          </div>
          
          {/* Token Details */}
          <div className="space-y-3">
            <div className="text-center">
              <Badge variant="outline" className="font-mono text-xs px-3 py-1">
                {token.id}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">File:</span>
                <p className="font-medium truncate">{token.fileName}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Patient:</span>
                <p className="font-medium">{token.patientName}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Access Level:</span>
                <Badge className={`text-xs ${getAccessLevelColor(token.accessLevel)}`}>
                  {token.accessLevel}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Valid Until:</span>
                <p className="font-medium text-xs">{new Date(token.validUntil).toLocaleDateString()}</p>
              </div>
            </div>
            
            {token.used && (
              <div className="text-center p-3 bg-success/10 rounded-lg border border-success/20">
                <p className="text-success font-medium text-sm">
                  ✓ Accessed by {token.doctorName} at {token.hospitalName}
                </p>
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button onClick={downloadQR} variant="outline" className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            {navigator.share && (
              <Button onClick={shareQR} variant="outline" className="flex-1">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            )}
            <Button onClick={onSimulateAccess} className="flex-1 bg-gradient-primary">
              <Smartphone className="w-4 h-4 mr-2" />
              Test Scan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  uploadedFiles,
  selectedFile,
  setSelectedFile,
  accessLevel,
  setAccessLevel,
  generateQRToken,
  generatedTokens,
  simulateQRAccess,
  formatDate
}) => {
  const [showQRDisplay, setShowQRDisplay] = useState(false);
  const [currentToken, setCurrentToken] = useState<AccessToken | null>(null);

  const handleGenerateQR = () => {
    if (selectedFile) {
      const token = generateQRToken(selectedFile);
      setCurrentToken(token);
      setShowQRDisplay(true);
    }
  };

  const getAccessLevelColor = (level: string) => {
    switch(level) {
      case 'full': return 'bg-success/10 text-success border-success/20';
      case 'partial': return 'bg-warning/10 text-warning border-warning/20';
      case 'read-only': return 'bg-primary/10 text-primary border-primary/20';
      default: return 'bg-muted/10 text-muted-foreground border-border';
    }
  };

  if (showQRDisplay && currentToken) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Button 
            onClick={() => setShowQRDisplay(false)} 
            variant="outline"
            className="mb-4"
          >
            ← Back to Generator
          </Button>
        </div>
        <QRCodeDisplay 
          token={currentToken} 
          onSimulateAccess={() => {
            simulateQRAccess(currentToken);
            setCurrentToken(prev => prev ? { ...prev, used: true } : null);
          }} 
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Generate New Token */}
      <Card className="shadow-medical-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <QrCode className="w-5 h-5 text-primary" />
            <span>Generate QR Access Token</span>
          </CardTitle>
          <CardDescription>
            Create secure, time-limited access to medical records
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {uploadedFiles.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Medical Record</label>
                  <Select 
                    value={selectedFile?.id.toString() || ''} 
                    onValueChange={(value) => {
                      const file = uploadedFiles.find(f => f.id.toString() === value);
                      setSelectedFile(file || null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a file..." />
                    </SelectTrigger>
                    <SelectContent>
                      {uploadedFiles.map(file => (
                        <SelectItem key={file.id} value={file.id.toString()}>
                          {file.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Access Level</label>
                  <Select 
                    value={accessLevel} 
                    onValueChange={(value: 'full' | 'partial' | 'read-only') => setAccessLevel(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Full Access - Doctor</SelectItem>
                      <SelectItem value="partial">Partial Access - Pharmacist</SelectItem>
                      <SelectItem value="read-only">Read Only - Laboratory</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {selectedFile && (
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-medium mb-2">Selected File Preview</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Category: {selectedFile.category} • Size: {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <Badge className={getAccessLevelColor(accessLevel)}>
                      {accessLevel}
                    </Badge>
                  </div>
                </div>
              )}
              
              <Button 
                onClick={handleGenerateQR}
                disabled={!selectedFile}
                className="w-full bg-gradient-primary shadow-medical-glow hover:shadow-medical-xl transition-all"
              >
                <QrCode className="w-4 h-4 mr-2" />
                Generate Secure QR Token
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No medical records uploaded yet</p>
              <Button variant="outline">
                Upload Your First Record
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generated Tokens History */}
      {generatedTokens.length > 0 && (
        <Card className="shadow-medical-lg">
          <CardHeader>
            <CardTitle>Generated Access Tokens</CardTitle>
            <CardDescription>History of all created QR tokens</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {generatedTokens.map(token => (
                <div key={token.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <QrCode className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{token.fileName}</p>
                      <p className="text-sm text-muted-foreground">
                        Token: {token.id} • Valid until {formatDate(token.validUntil)}
                      </p>
                      {token.used && token.doctorName && (
                        <p className="text-xs text-success">
                          ✓ Accessed by {token.doctorName}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className={getAccessLevelColor(token.accessLevel)}>
                      {token.accessLevel}
                    </Badge>
                    {token.used ? (
                      <Badge className="bg-success/10 text-success border-success/20">
                        Used
                      </Badge>
                    ) : (
                      <Badge className="bg-warning/10 text-warning border-warning/20">
                        Active
                      </Badge>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setCurrentToken(token);
                        setShowQRDisplay(true);
                      }}
                    >
                      View QR
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QRCodeGenerator;