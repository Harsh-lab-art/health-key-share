import React, { useState, useEffect } from 'react';
import { Users, UserCheck, Calendar, Building, Pill, TestTube, CreditCard, Shield, Search, Plus, Download, Upload, Trash2, Settings, LogOut, Home } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface Entity {
  id: string;
  [key: string]: any;
}

interface Field {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea';
  required?: boolean;
  readonly?: boolean;
  options?: string[];
}

interface EntityConfig {
  label: string;
  fields: Field[];
  icon: React.ComponentType<any>;
}

const ENTITIES: Record<string, EntityConfig> = {
  patients: {
    label: "Patients",
    icon: Users,
    fields: [
      {key:'id', label:'ID', type:'text', readonly:true},
      {key:'name', label:'Name', type:'text', required:true},
      {key:'age', label:'Age', type:'number'},
      {key:'gender', label:'Gender', type:'select', options:['Male','Female','Other']},
      {key:'phone', label:'Phone', type:'text'},
      {key:'address', label:'Address', type:'textarea'},
      {key:'bloodGroup', label:'Blood Group', type:'text'},
      {key:'admittedOn', label:'Admitted On', type:'date'},
      {key:'ward', label:'Ward/Room', type:'text'},
      {key:'doctorId', label:'Doctor ID', type:'text'},
    ]
  },
  doctors: {
    label: "Doctors",
    icon: UserCheck,
    fields: [
      {key:'id', label:'ID', type:'text', readonly:true},
      {key:'name', label:'Name', type:'text', required:true},
      {key:'specialty', label:'Specialty', type:'text'},
      {key:'phone', label:'Phone', type:'text'},
      {key:'email', label:'Email', type:'text'},
      {key:'schedule', label:'Schedule', type:'textarea'},
      {key:'department', label:'Department', type:'text'},
    ]
  },
  appointments: {
    label: "Appointments",
    icon: Calendar,
    fields: [
      {key:'id', label:'ID', type:'text', readonly:true},
      {key:'patientId', label:'Patient ID', type:'text', required:true},
      {key:'patientName', label:'Patient Name', type:'text', required:true},
      {key:'doctorId', label:'Doctor ID', type:'text', required:true},
      {key:'doctorName', label:'Doctor Name', type:'text', required:true},
      {key:'date', label:'Date', type:'date', required:true},
      {key:'time', label:'Time', type:'text', required:true},
      {key:'reason', label:'Reason', type:'textarea'},
      {key:'status', label:'Status', type:'select', options:['Scheduled','Completed','Cancelled']},
      {key:'type', label:'Type', type:'select', options:['Consultation','Follow-up','Emergency','Surgery']},
    ]
  },
  wards: {
    label: "Wards",
    icon: Building,
    fields: [
      {key:'id', label:'ID', type:'text', readonly:true},
      {key:'name', label:'Ward Name', type:'text', required:true},
      {key:'type', label:'Type', type:'text'},
      {key:'capacity', label:'Capacity', type:'number'},
      {key:'occupancy', label:'Occupancy', type:'number'},
    ]
  },
  pharmacy: {
    label: "Pharmacy",
    icon: Pill,
    fields: [
      {key:'id', label:'ID', type:'text', readonly:true},
      {key:'drugName', label:'Drug', type:'text', required:true},
      {key:'batchNo', label:'Batch No', type:'text'},
      {key:'expiryDate', label:'Expiry Date', type:'date'},
      {key:'quantity', label:'Quantity', type:'number'},
      {key:'price', label:'Unit Price', type:'number'},
    ]
  },
  labtests: {
    label: "Lab Tests",
    icon: TestTube,
    fields: [
      {key:'id', label:'ID', type:'text', readonly:true},
      {key:'testName', label:'Test Name', type:'text', required:true},
      {key:'patientId', label:'Patient ID', type:'text'},
      {key:'doctorId', label:'Doctor ID', type:'text'},
      {key:'date', label:'Date', type:'date'},
      {key:'result', label:'Result', type:'textarea'},
      {key:'status', label:'Status', type:'select', options:['Pending','Completed']},
    ]
  }
};

const HospitalDashboard: React.FC<{ onViewHealthLock: () => void }> = ({ onViewHealthLock }) => {
  const [currentEntity, setCurrentEntity] = useState<string>('patients');
  const [entities, setEntities] = useState<Record<string, Entity[]>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEntity, setEditingEntity] = useState<Entity | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const { toast } = useToast();

  // Initialize with sample data
  useEffect(() => {
    const sampleData = {
      patients: [
        {
          id: 'P001',
          name: 'John Doe',
          age: 35,
          gender: 'Male',
          phone: '+1-555-0123',
          address: '123 Main St, City',
          bloodGroup: 'O+',
          admittedOn: '2024-08-20',
          ward: 'Ward A-101',
          doctorId: 'D001'
        },
        {
          id: 'P002',
          name: 'Jane Smith',
          age: 28,
          gender: 'Female',
          phone: '+1-555-0124',
          address: '456 Oak Ave, City',
          bloodGroup: 'A+',
          admittedOn: '2024-08-21',
          ward: 'Ward B-205',
          doctorId: 'D002'
        }
      ],
      doctors: [
        {
          id: 'D001',
          name: 'Dr. Sarah Johnson',
          specialty: 'Cardiology',
          phone: '+1-555-0201',
          email: 'sarah.johnson@hospital.com',
          schedule: 'Mon-Fri 9AM-5PM',
          department: 'Cardiology'
        },
        {
          id: 'D002',
          name: 'Dr. Michael Brown',
          specialty: 'Neurology',
          phone: '+1-555-0202',
          email: 'michael.brown@hospital.com',
          schedule: 'Mon-Wed-Fri 8AM-4PM',
          department: 'Neurology'
        }
      ],
      appointments: [
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
          patientId: 'P002',
          patientName: 'Jane Smith',
          doctorId: 'D002',
          doctorName: 'Dr. Michael Brown',
          date: '2024-08-26',
          time: '2:00 PM',
          reason: 'Neurological assessment',
          status: 'Scheduled',
          type: 'Follow-up'
        }
      ],
      wards: [],
      pharmacy: [],
      labtests: []
    };
    setEntities(sampleData);
  }, []);

  const currentEntities = entities[currentEntity] || [];
  const currentConfig = ENTITIES[currentEntity];

  const filteredEntities = currentEntities.filter(entity =>
    JSON.stringify(entity).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const generateId = () => {
    const prefix = currentEntity.charAt(0).toUpperCase();
    const num = (currentEntities.length + 1).toString().padStart(3, '0');
    return `${prefix}${num}`;
  };

  const handleSave = () => {
    if (!formData.name && currentConfig.fields.find(f => f.key === 'name')?.required) {
      toast({
        title: "Error",
        description: "Name is required",
        variant: "destructive"
      });
      return;
    }

    const id = editingEntity?.id || generateId();
    const newEntity = { ...formData, id };

    setEntities(prev => ({
      ...prev,
      [currentEntity]: editingEntity
        ? prev[currentEntity].map(e => e.id === editingEntity.id ? newEntity : e)
        : [newEntity, ...prev[currentEntity]]
    }));

    setIsAddModalOpen(false);
    setEditingEntity(null);
    setFormData({});
    
    toast({
      title: "Success",
      description: editingEntity ? "Record updated" : "Record added"
    });
  };

  const handleDelete = (id: string) => {
    setEntities(prev => ({
      ...prev,
      [currentEntity]: prev[currentEntity].filter(e => e.id !== id)
    }));
    toast({
      title: "Success",
      description: "Record deleted"
    });
  };

  const openAddModal = () => {
    setFormData({});
    setEditingEntity(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (entity: Entity) => {
    setFormData(entity);
    setEditingEntity(entity);
    setIsAddModalOpen(true);
  };

  const getStats = () => {
    const patients = entities.patients?.length || 0;
    const doctors = entities.doctors?.length || 0;
    const appointments = entities.appointments?.length || 0;
    const total = Object.values(entities).reduce((sum, arr) => sum + arr.length, 0);
    return { patients, doctors, appointments, total };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-4 md:px-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold">HospitalDB</h1>
                <p className="text-xs text-muted-foreground">Management System</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={onViewHealthLock}>
              <Home className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">HealthLock</span>
            </Button>
            <Badge variant="secondary" className="hidden md:flex">
              Admin Panel
            </Badge>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row">
        {/* Sidebar */}
        <aside className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-border bg-muted/20">
          <div className="p-4">
            <h2 className="text-sm font-semibold text-muted-foreground mb-3 tracking-wide uppercase">
              Modules
            </h2>
            <nav className="space-y-2">
              {Object.entries(ENTITIES).map(([key, config]) => {
                const Icon = config.icon;
                return (
                  <Button
                    key={key}
                    variant={currentEntity === key ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setCurrentEntity(key)}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    <span className="hidden lg:inline">{config.label}</span>
                  </Button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Records</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <Shield className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Patients</p>
                    <p className="text-2xl font-bold">{stats.patients}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Doctors</p>
                    <p className="text-2xl font-bold">{stats.doctors}</p>
                  </div>
                  <UserCheck className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Appointments</p>
                    <p className="text-2xl font-bold">{stats.appointments}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Toolbar */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <Input
                    placeholder="Search records..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-64"
                  />
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button onClick={openAddModal} className="flex-1 sm:flex-none">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Record
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {React.createElement(currentConfig.icon, { className: "h-5 w-5" })}
                <span>{currentConfig.label}</span>
              </CardTitle>
              <CardDescription>
                Manage {currentConfig.label.toLowerCase()} records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      {currentConfig.fields.map(field => (
                        <th key={field.key} className="text-left py-3 px-2 font-medium text-sm">
                          {field.label}
                        </th>
                      ))}
                      <th className="text-left py-3 px-2 font-medium text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEntities.map(entity => (
                      <tr key={entity.id} className="border-b hover:bg-muted/50">
                        {currentConfig.fields.map(field => (
                          <td key={field.key} className="py-3 px-2 text-sm">
                            {field.type === 'select' && typeof entity[field.key] === 'boolean'
                              ? entity[field.key] ? 'Yes' : 'No'
                              : entity[field.key] || '-'}
                          </td>
                        ))}
                        <td className="py-3 px-2">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditModal(entity)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(entity.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredEntities.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No records found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingEntity ? 'Edit' : 'Add'} {currentConfig.label.slice(0, -1)}
            </DialogTitle>
            <DialogDescription>
              {editingEntity ? 'Update' : 'Create a new'} {currentConfig.label.toLowerCase().slice(0, -1)} record
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentConfig.fields.map(field => (
              <div key={field.key} className="space-y-2">
                <Label htmlFor={field.key}>
                  {field.label} {field.required && <span className="text-destructive">*</span>}
                </Label>
                {field.type === 'textarea' ? (
                  <Textarea
                    id={field.key}
                    value={formData[field.key] || ''}
                    onChange={(e) => setFormData(prev => ({...prev, [field.key]: e.target.value}))}
                    disabled={field.readonly}
                  />
                ) : field.type === 'select' ? (
                  <Select
                    value={formData[field.key] || ''}
                    onValueChange={(value) => setFormData(prev => ({...prev, [field.key]: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`Select ${field.label}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id={field.key}
                    type={field.type}
                    value={formData[field.key] || ''}
                    onChange={(e) => setFormData(prev => ({...prev, [field.key]: e.target.value}))}
                    disabled={field.readonly}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingEntity ? 'Update' : 'Create'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HospitalDashboard;