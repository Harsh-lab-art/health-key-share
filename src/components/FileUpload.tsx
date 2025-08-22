import React, { useRef } from 'react';
import { Upload, Cloud, CheckCircle, Lock, FileText, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface HealthFile {
  id: number;
  name: string;
  type: string;
  size: number;
  uploadDate: string;
  encrypted: boolean;
  category: 'blood-test' | 'imaging' | 'prescription' | 'report' | 'other';
}

interface FileUploadProps {
  onFileUpload: (files: File[]) => void;
  uploadedFiles: HealthFile[];
  formatFileSize: (bytes: number) => string;
  formatDate: (dateString: string) => string;
  getCategoryIcon: (category: string) => React.ReactNode;
  getCategoryColor: (category: string) => string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileUpload,
  uploadedFiles,
  formatFileSize,
  formatDate,
  getCategoryIcon,
  getCategoryColor
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      onFileUpload(files);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    if (files.length > 0) {
      onFileUpload(files);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const acceptedFileTypes = ['.pdf', '.dcm', '.jpg', '.jpeg', '.png', '.doc', '.docx'];

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Upload Area */}
      <Card className="shadow-medical-lg">
        <CardHeader className="text-center px-4 md:px-6">
          <div className="mx-auto mb-4 p-3 md:p-4 bg-gradient-primary rounded-2xl shadow-medical-glow w-fit">
            <Upload className="w-6 h-6 md:w-8 md:h-8 text-white" />
          </div>
          <CardTitle className="text-lg md:text-xl">Upload Medical Records</CardTitle>
          <CardDescription className="text-sm md:text-base">
            Securely store your health documents with end-to-end encryption
          </CardDescription>
        </CardHeader>
        
        <CardContent className="px-4 md:px-6">
          <div 
            className="border-2 border-dashed border-border rounded-2xl p-8 md:p-12 text-center hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 cursor-pointer group"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={openFileDialog}
          >
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Cloud className="w-6 h-6 md:w-8 md:h-8 text-primary" />
              </div>
              
              <div>
                <h3 className="text-base md:text-lg font-semibold text-foreground mb-2">
                  Drop files here or click to browse
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Supports medical documents, imaging files, and reports
                </p>
                
                <div className="flex flex-wrap justify-center gap-1 md:gap-2 mb-4">
                  {acceptedFileTypes.map(type => (
                    <Badge key={type} variant="secondary" className="text-xs">
                      {type}
                    </Badge>
                  ))}
                </div>
                
                <Button className="bg-gradient-primary shadow-medical-glow h-10 md:h-11">
                  <Upload className="w-4 h-4 mr-2" />
                  Select Files
                </Button>
              </div>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedFileTypes.join(',')}
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="mt-6 text-center">
            <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Lock className="w-4 h-4 text-success" />
                <span>End-to-end encrypted</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-4 h-4 text-success" />
                <span>HIPAA compliant</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Information */}
      <Card className="shadow-medical-md bg-gradient-secondary/5 border-secondary/20">
        <CardContent className="pt-4 md:pt-6 px-4 md:px-6">
          <div className="flex items-start space-x-2 md:space-x-3">
            <div className="p-1.5 md:p-2 bg-secondary/10 rounded-lg flex-shrink-0">
              <Lock className="w-4 h-4 md:w-5 md:h-5 text-secondary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2 text-sm md:text-base">Security & Privacy</h4>
              <ul className="text-xs md:text-sm text-muted-foreground space-y-1">
                <li>• All files are encrypted with AES-256 encryption</li>
                <li>• Data is stored in HIPAA-compliant infrastructure</li>
                <li>• Only you control access to your medical records</li>
                <li>• Files are automatically backed up and versioned</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <Card className="shadow-medical-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-primary" />
              <span>Your Medical Records</span>
            </CardTitle>
            <CardDescription>
              {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''} securely stored
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
               {uploadedFiles.map(file => (
                 <div 
                   key={file.id} 
                   className="flex items-center justify-between p-3 md:p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors group"
                 >
                   <div className="flex items-center space-x-2 md:space-x-3 min-w-0 flex-1">
                     <div className="relative flex-shrink-0">
                       <div className={`p-1.5 md:p-2 rounded-lg border ${getCategoryColor(file.category)}`}>
                         {getCategoryIcon(file.category)}
                       </div>
                       <div className="absolute -bottom-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-success rounded-full flex items-center justify-center">
                         <CheckCircle className="w-2 h-2 md:w-3 md:h-3 text-white" />
                       </div>
                     </div>
                     <div className="min-w-0 flex-1">
                       <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mb-1">
                         <p className="font-medium text-foreground text-sm md:text-base truncate">{file.name}</p>
                         <Badge variant="outline" className="text-xs capitalize w-fit mt-1 sm:mt-0">
                           {file.category.replace('-', ' ')}
                         </Badge>
                       </div>
                       <p className="text-xs md:text-sm text-muted-foreground">
                         {formatFileSize(file.size)} • {new Date(file.uploadDate).toLocaleDateString()}
                       </p>
                     </div>
                   </div>
                   
                   <div className="flex items-center space-x-2 md:space-x-3 flex-shrink-0 ml-2">
                     <div className="flex items-center space-x-1 md:space-x-2">
                       <Lock className="w-3 h-3 md:w-4 md:h-4 text-success" />
                       <Badge className="bg-success/10 text-success border-success/20 text-xs px-2 py-0.5">
                         Encrypted
                       </Badge>
                     </div>
                     
                     <Button 
                       size="sm" 
                       variant="ghost"
                       className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 md:p-2"
                     >
                       <X className="w-3 h-3 md:w-4 md:h-4" />
                     </Button>
                   </div>
                 </div>
               ))}
            </div>
            
            {uploadedFiles.length > 5 && (
              <div className="mt-4 text-center">
                <Button variant="outline" size="sm">
                  View All Files ({uploadedFiles.length})
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FileUpload;