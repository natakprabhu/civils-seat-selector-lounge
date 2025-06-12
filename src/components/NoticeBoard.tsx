
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Plus, 
  Calendar, 
  User, 
  Edit,
  Trash2,
  AlertCircle,
  Bell
} from 'lucide-react';

interface Notice {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  createdBy: string;
  type: 'general' | 'urgent' | 'maintenance' | 'event';
}

interface NoticeBoardProps {
  onBack: () => void;
  isStaff?: boolean;
}

const NoticeBoard: React.FC<NoticeBoardProps> = ({ onBack, isStaff = false }) => {
  const [notices, setNotices] = useState<Notice[]>([
    {
      id: '1',
      title: 'Library Timing Update',
      content: 'The library will now be open from 6:00 AM to 11:00 PM starting from next Monday. Please plan your study schedule accordingly.',
      priority: 'medium',
      createdAt: '2024-01-15',
      createdBy: 'Admin',
      type: 'general'
    },
    {
      id: '2',
      title: 'Maintenance Notice',
      content: 'AC maintenance will be conducted on Saturday from 2:00 PM to 4:00 PM. Temporary inconvenience is regretted.',
      priority: 'high',
      createdAt: '2024-01-14',
      createdBy: 'Staff',
      type: 'maintenance'
    },
    {
      id: '3',
      title: 'New Study Resources Available',
      content: 'Latest UPSC preparation books and mock test series have been added to the library. Check with the front desk for more details.',
      priority: 'low',
      createdAt: '2024-01-13',
      createdBy: 'Admin',
      type: 'general'
    }
  ]);

  const [showAddNotice, setShowAddNotice] = useState(false);
  const [newNotice, setNewNotice] = useState({
    title: '',
    content: '',
    priority: 'medium' as const,
    type: 'general' as const
  });

  const handleAddNotice = () => {
    if (!newNotice.title.trim() || !newNotice.content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const notice: Notice = {
      id: Date.now().toString(),
      title: newNotice.title,
      content: newNotice.content,
      priority: newNotice.priority,
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: isStaff ? 'Staff' : 'Admin',
      type: newNotice.type
    };

    setNotices([notice, ...notices]);
    setNewNotice({ title: '', content: '', priority: 'medium', type: 'general' });
    setShowAddNotice(false);
    
    toast({
      title: "Success",
      description: "Notice has been posted successfully",
    });
  };

  const handleDeleteNotice = (id: string) => {
    setNotices(notices.filter(notice => notice.id !== id));
    toast({
      title: "Success",
      description: "Notice has been deleted",
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'urgent': return <AlertCircle className="w-4 h-4" />;
      case 'maintenance': return <Edit className="w-4 h-4" />;
      case 'event': return <Calendar className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900">
      {/* Header */}
      <div className="header-gradient shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={onBack}
                className="border-slate-600 bg-gradient-to-b from-slate-700 to-slate-900 hover:from-slate-600 hover:to-slate-800 text-white hover:border-slate-500"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white">Notice Board</h1>
                <p className="text-slate-400">Important announcements and updates</p>
              </div>
            </div>
            {isStaff && (
              <Button 
                onClick={() => setShowAddNotice(true)}
                className="bg-gradient-to-b from-slate-700 to-slate-900 hover:from-slate-600 hover:to-slate-800 text-white shadow-lg border border-slate-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Notice
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {notices.length === 0 ? (
            <Card className="dashboard-card">
              <CardContent className="p-12 text-center">
                <Bell className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Notices Yet</h3>
                <p className="text-slate-400">Check back later for important announcements</p>
              </CardContent>
            </Card>
          ) : (
            notices.map((notice) => (
              <Card key={notice.id} className="dashboard-card">
                <CardHeader className="border-b border-slate-700/50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(notice.type)}
                          <CardTitle className="text-lg text-white">{notice.title}</CardTitle>
                        </div>
                        <Badge className={getPriorityColor(notice.priority)}>
                          {notice.priority.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {notice.createdAt}
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {notice.createdBy}
                        </div>
                      </div>
                    </div>
                    {isStaff && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteNotice(notice.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-slate-300 leading-relaxed">{notice.content}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Add Notice Modal */}
      <Dialog open={showAddNotice} onOpenChange={setShowAddNotice}>
        <DialogContent className="max-w-md bg-slate-900 border border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-slate-300">Add New Notice</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-300">Title</label>
              <Input
                value={newNotice.title}
                onChange={(e) => setNewNotice({...newNotice, title: e.target.value})}
                placeholder="Enter notice title"
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-slate-300">Content</label>
              <Textarea
                value={newNotice.content}
                onChange={(e) => setNewNotice({...newNotice, content: e.target.value})}
                placeholder="Enter notice content"
                rows={4}
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-300">Priority</label>
                <select
                  value={newNotice.priority}
                  onChange={(e) => setNewNotice({...newNotice, priority: e.target.value as any})}
                  className="w-full p-2 bg-slate-800 border border-slate-600 rounded text-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-slate-300">Type</label>
                <select
                  value={newNotice.type}
                  onChange={(e) => setNewNotice({...newNotice, type: e.target.value as any})}
                  className="w-full p-2 bg-slate-800 border border-slate-600 rounded text-white"
                >
                  <option value="general">General</option>
                  <option value="urgent">Urgent</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="event">Event</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleAddNotice} 
                className="flex-1 bg-gradient-to-b from-slate-700 to-slate-900 hover:from-slate-600 hover:to-slate-800 text-white shadow-lg border border-slate-600"
              >
                Post Notice
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowAddNotice(false)} 
                className="bg-gradient-to-b from-slate-700 to-slate-900 hover:from-slate-600 hover:to-slate-800 text-white shadow-lg border border-slate-600"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NoticeBoard;
