import React from 'react';
import { Clock, Upload, QrCode, Eye, Shield, MapPin, Monitor, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface AuditLog {
  id: number;
  timestamp: string;
  action: string;
  details: string;
  actor: string;
  ip: string;
  location?: string;
}

interface AuditLogsProps {
  auditLogs: AuditLog[];
  formatDate: (dateString: string) => string;
}

const AuditLogs: React.FC<AuditLogsProps> = ({ auditLogs, formatDate }) => {
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'File Upload':
        return <Upload className="w-4 h-4 text-primary" />;
      case 'QR Generated':
        return <QrCode className="w-4 h-4 text-secondary" />;
      case 'Record Access':
        return <Eye className="w-4 h-4 text-accent" />;
      default:
        return <Shield className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'File Upload':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'QR Generated':
        return 'bg-secondary/10 text-secondary border-secondary/20';
      case 'Record Access':
        return 'bg-accent/10 text-accent border-accent/20';
      default:
        return 'bg-muted/10 text-muted-foreground border-border';
    }
  };

  const getActorColor = (actor: string) => {
    switch (actor) {
      case 'patient':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'doctor':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'pharmacist':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getRiskLevel = (action: string) => {
    switch (action) {
      case 'Record Access':
        return 'high';
      case 'QR Generated':
        return 'medium';
      case 'File Upload':
        return 'low';
      default:
        return 'low';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const exportLogs = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Timestamp,Action,Details,Actor,IP Address,Location\n" +
      auditLogs.map(log => 
        `"${formatDate(log.timestamp)}","${log.action}","${log.details}","${log.actor}","${log.ip}","${log.location || 'N/A'}"`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `healthlock-audit-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header with Export */}
      <Card className="shadow-medical-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-primary" />
                <span>Security Audit Trail</span>
              </CardTitle>
              <CardDescription>
                Complete access history with timestamps, IP tracking, and user identification
              </CardDescription>
            </div>
            <Button onClick={exportLogs} variant="outline" className="shrink-0">
              Export Logs
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-medical-md">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Events</p>
                <p className="text-xl font-bold">{auditLogs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-medical-md">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Eye className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Record Access</p>
                <p className="text-xl font-bold">{auditLogs.filter(log => log.action === 'Record Access').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-medical-md">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <QrCode className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tokens Generated</p>
                <p className="text-xl font-bold">{auditLogs.filter(log => log.action === 'QR Generated').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Audit Logs List */}
      <Card className="shadow-medical-lg">
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
          <CardDescription>Chronological record of all system activities</CardDescription>
        </CardHeader>
        <CardContent>
          {auditLogs.length > 0 ? (
            <div className="space-y-4">
              {auditLogs.map(log => {
                const riskLevel = getRiskLevel(log.action);
                return (
                  <div 
                    key={log.id} 
                    className="flex items-start space-x-4 p-4 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors border border-transparent hover:border-border/50"
                  >
                    {/* Action Icon and Risk Indicator */}
                    <div className="relative">
                      <div className={`p-2 rounded-lg border ${getActionColor(log.action)}`}>
                        {getActionIcon(log.action)}
                      </div>
                      <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                        riskLevel === 'high' ? 'bg-red-500' : 
                        riskLevel === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`} />
                    </div>

                    {/* Log Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge className={getActionColor(log.action)}>
                          {log.action}
                        </Badge>
                        <Badge className={getRiskColor(riskLevel)} variant="outline">
                          {riskLevel} risk
                        </Badge>
                      </div>
                      
                      <p className="font-medium text-foreground mb-2">{log.details}</p>
                      
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <User className="w-3 h-3" />
                          <span>Actor:</span>
                          <Badge className={getActorColor(log.actor)} variant="outline">
                            {log.actor}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Monitor className="w-3 h-3" />
                          <span>IP: {log.ip}</span>
                        </div>
                        
                        {log.location && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3" />
                            <span>{log.location}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Timestamp */}
                    <div className="text-right shrink-0">
                      <div className="text-sm font-medium text-foreground">
                        {new Date(log.timestamp).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto mb-4 p-4 bg-muted/20 rounded-2xl w-fit">
                <Clock className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium text-muted-foreground mb-2">No activity logs yet</p>
              <p className="text-sm text-muted-foreground">
                System activities will appear here once you start using HealthLock
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Compliance Notice */}
      <Card className="shadow-medical-md bg-gradient-secondary/5 border-secondary/20">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-secondary/10 rounded-lg">
              <Shield className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Compliance & Retention</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• All audit logs are retained for 7 years as per HIPAA requirements</li>
                <li>• Logs are tamper-proof and digitally signed</li>
                <li>• Real-time monitoring alerts for suspicious activities</li>
                <li>• Automated compliance reporting available</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLogs;