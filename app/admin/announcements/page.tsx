'use client';

import { useEffect, useState } from 'react';
import { db, auth, isAdmin } from '@/lib/firebase';
import { collection, addDoc, deleteDoc, doc, updateDoc, onSnapshot, Timestamp, orderBy, query, where } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { onAuthStateChanged } from 'firebase/auth';

interface Notification {
  id: string;
  title: string;
  content: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  publishAt: Timestamp;
  expiresAt: Timestamp | null;
  status: 'draft' | 'scheduled' | 'active' | 'expired';
  createdBy: string;
  updatedBy: string;
}

interface NotificationFormData {
  title: string;
  content: string;
  publishAt: Date;
  expiresAt: Date | null;
}

const INITIAL_FORM_DATA: NotificationFormData = {
  title: '',
  content: '',
  publishAt: new Date(),
  expiresAt: null,
};

export default function AnnouncementsManagement() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [formData, setFormData] = useState<NotificationFormData>(INITIAL_FORM_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const { toast } = useToast();

  // Check authentication and admin status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const adminStatus = await isAdmin();
        setIsAuthorized(adminStatus);
        if (!adminStatus) {
          toast({
            title: 'Unauthorized',
            description: 'You do not have permission to access this page.',
            variant: 'destructive',
          });
        }
      } else {
        setIsAuthorized(false);
        toast({
          title: 'Authentication Required',
          description: 'Please sign in to access this page.',
          variant: 'destructive',
        });
      }
    });

    return () => unsubscribe();
  }, [toast]);

  useEffect(() => {
    if (!isAuthorized) return;

    // Subscribe to notifications collection with real-time updates
    const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notificationData: Notification[] = [];
      snapshot.forEach((doc) => {
        notificationData.push({ id: doc.id, ...doc.data() } as Notification);
      });
      setNotifications(notificationData);
    }, (error) => {
      console.error('Error fetching notifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch notifications.',
        variant: 'destructive',
      });
    });

    return () => unsubscribe();
  }, [isAuthorized, toast]);

  const validateForm = (): string | null => {
    if (!formData.title.trim()) return 'Title is required';
    if (formData.title.length > 100) return 'Title must be less than 100 characters';
    if (!formData.content.trim()) return 'Content is required';
    if (formData.content.length > 2000) return 'Content must be less than 2000 characters';
    if (formData.publishAt < new Date()) return 'Publication date must be in the future';
    if (formData.expiresAt && formData.expiresAt <= formData.publishAt) {
      return 'Expiration date must be after publication date';
    }
    return null;
  };

  const handleAddNotification = async () => {
    if (!isAuthorized) {
      toast({
        title: 'Unauthorized',
        description: 'You do not have permission to create notifications.',
        variant: 'destructive',
      });
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      toast({
        title: 'Validation Error',
        description: validationError,
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const now = Timestamp.now();
      const publishAtTimestamp = Timestamp.fromDate(formData.publishAt);
      const expiresAtTimestamp = formData.expiresAt ? Timestamp.fromDate(formData.expiresAt) : null;

      let status: Notification['status'] = 'draft';
      if (publishAtTimestamp.toDate() <= new Date()) {
        status = 'active';
      } else {
        status = 'scheduled';
      }

      const userId = auth.currentUser?.uid || 'unknown';

      await addDoc(collection(db, 'notifications'), {
        title: formData.title,
        content: formData.content,
        publishAt: publishAtTimestamp,
        expiresAt: expiresAtTimestamp,
        status,
        createdAt: now,
        updatedAt: now,
        createdBy: userId,
        updatedBy: userId,
      });

      setFormData(INITIAL_FORM_DATA);
      toast({
        title: 'Success',
        description: 'Notification has been created.',
      });
    } catch (error) {
      console.error('Error adding notification:', error);
      toast({
        title: 'Error',
        description: 'Failed to create notification.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    if (!isAuthorized) {
      toast({
        title: 'Unauthorized',
        description: 'You do not have permission to delete notifications.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await deleteDoc(doc(db, 'notifications', id));
      toast({
        title: 'Success',
        description: 'Notification has been deleted.',
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete notification.',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadgeVariant = (status: Notification['status']): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'active':
        return 'default';
      case 'scheduled':
        return 'secondary';
      case 'expired':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You do not have permission to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Notification Management</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Create New Notification</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              placeholder="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              maxLength={100}
            />
            <Textarea
              placeholder="Content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              maxLength={2000}
            />
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium">Publication Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !formData.publishAt && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.publishAt ? format(formData.publishAt, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.publishAt}
                    onSelect={(date) => date && setFormData({ ...formData, publishAt: date })}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium">Expiration Date (Optional)</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !formData.expiresAt && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.expiresAt ? format(formData.expiresAt, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.expiresAt || undefined}
                    onSelect={(date) => setFormData({ ...formData, expiresAt: date || null })}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <Button 
              onClick={handleAddNotification}
              disabled={isLoading || !formData.title || !formData.content}
            >
              {isLoading ? 'Creating...' : 'Create Notification'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Content</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Publication Date</TableHead>
                <TableHead>Expiration Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notifications.map((notification) => (
                <TableRow key={notification.id}>
                  <TableCell>{notification.title}</TableCell>
                  <TableCell className="max-w-md truncate">{notification.content}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(notification.status)}>
                      {notification.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(notification.publishAt.toDate(), "PPP")}</TableCell>
                  <TableCell>
                    {notification.expiresAt ? format(notification.expiresAt.toDate(), "PPP") : "-"}
                  </TableCell>
                  <TableCell>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">Delete</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Notification</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this notification? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteNotification(notification.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
