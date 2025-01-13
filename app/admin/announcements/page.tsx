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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { onAuthStateChanged } from 'firebase/auth';

interface Notification {
  id: string;
  title: string;
  content: string;
  titleEn: string;
  contentEn: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  publishAt: Timestamp;
  expiresAt: Timestamp | null;
  status: 'draft' | 'active' | 'inactive' | 'expired';
  createdBy: string;
  updatedBy: string;
}

interface NotificationFormData {
  title: string;
  content: string;
  titleEn: string;
  contentEn: string;
  publishAt: Date;
  expiresAt: Date | null;
}

const INITIAL_FORM_DATA: NotificationFormData = {
  title: '',
  content: '',
  titleEn: '',
  contentEn: '',
  publishAt: new Date(),
  expiresAt: null,
};

export default function AnnouncementsManagement() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [formData, setFormData] = useState<NotificationFormData>(INITIAL_FORM_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null);
  const { toast } = useToast();

  const handleEdit = (notification: Notification) => {
    setEditingNotification(notification);
    setFormData({
      title: notification.title,
      content: notification.content,
      titleEn: notification.titleEn,
      contentEn: notification.contentEn,
      publishAt: notification.publishAt.toDate(),
      expiresAt: notification.expiresAt?.toDate() || null,
    });
  };

  const handleUpdate = async () => {
    if (!editingNotification) return;

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
      const notificationRef = doc(db, 'notifications', editingNotification.id);
      const publishAtTimestamp = Timestamp.fromDate(formData.publishAt);
      const expiresAtTimestamp = formData.expiresAt ? Timestamp.fromDate(formData.expiresAt) : null;

      const now = new Date();
      let status = editingNotification.status;

      // Update status based on expiration date if not draft or inactive
      if (status !== 'draft' && status !== 'inactive') {
        if (expiresAtTimestamp && expiresAtTimestamp.toDate() < now) {
          status = 'expired';
        } else {
          status = 'active';
        }
      }

      await updateDoc(notificationRef, {
        title: formData.title,
        content: formData.content,
        titleEn: formData.titleEn,
        contentEn: formData.contentEn,
        publishAt: publishAtTimestamp,
        expiresAt: expiresAtTimestamp,
        status,
        updatedAt: Timestamp.now(),
        updatedBy: auth.currentUser?.uid || 'unknown',
      });

      setEditingNotification(null);
      setFormData(INITIAL_FORM_DATA);
      toast({
        title: 'Success',
        description: 'Notification has been updated.',
      });
    } catch (error) {
      console.error('Error updating notification:', error);
      toast({
        title: 'Error',
        description: 'Failed to update notification.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingNotification(null);
    setFormData(INITIAL_FORM_DATA);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const idTokenResult = await user.getIdTokenResult();
          console.log('User claims:', idTokenResult.claims); // デバッグ用
          const adminStatus = await isAdmin();
          setIsAuthorized(adminStatus);
          if (!adminStatus) {
            toast({
              title: 'Unauthorized',
              description: 'You do not have permission to access this page.',
              variant: 'destructive',
            });
            console.log('Admin status check failed'); // デバッグ用
          }
        } catch (error) {
          console.error('Error checking authorization:', error);
          setIsAuthorized(false);
          toast({
            title: 'Authorization Error',
            description: 'Failed to verify admin privileges.',
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

    const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notificationData: Notification[] = [];
      const now = new Date();

      snapshot.forEach((doc) => {
        const data = doc.data();
        let status = data.status;
        
        // Only update status if it's not a draft and not inactive
        if (status !== 'draft' && status !== 'inactive') {
          const expiresAt = data.expiresAt?.toDate();
          if (expiresAt && expiresAt < now) {
            status = 'expired';
          } else {
            status = 'active';
          }
        }

        notificationData.push({
          id: doc.id,
          ...data,
          status,
        } as Notification);
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
    if (!formData.title.trim()) return 'Japanese title is required';
    if (formData.title.length > 100) return 'Japanese title must be less than 100 characters';
    if (!formData.content.trim()) return 'Japanese content is required';
    if (formData.content.length > 2000) return 'Japanese content must be less than 2000 characters';
    // Validate English fields only if they are not empty
    if (formData.titleEn.trim() && formData.titleEn.length > 100) return 'English title must be less than 100 characters';
    if (formData.contentEn.trim() && formData.contentEn.length > 2000) return 'English content must be less than 2000 characters';
    // Only validate expiration date if it's set
    if (formData.expiresAt) {
      if (formData.expiresAt <= formData.publishAt) {
        return 'Expiration date must be after publication date';
      }
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
      const status: Notification['status'] = 'draft';
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

  const handleUpdateStatus = async (id: string, newStatus: Notification['status']) => {
    if (!isAuthorized) {
      toast({
        title: 'Unauthorized',
        description: 'You do not have permission to update notifications.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const notificationRef = doc(db, 'notifications', id);
      await updateDoc(notificationRef, {
        status: newStatus,
        updatedAt: Timestamp.now(),
        updatedBy: auth.currentUser?.uid || 'unknown',
      });
      toast({
        title: 'Success',
        description: 'Notification status has been updated.',
      });
    } catch (error) {
      console.error('Error updating notification status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update notification status.',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadgeVariant = (status: Notification['status']) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'expired':
        return 'destructive';
      case 'inactive':
        return 'secondary';
      case 'draft':
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
            <div className="grid gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Japanese</label>
                <Input
                  placeholder="Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  maxLength={100}
                />
                <Textarea
                  className="mt-2"
                  placeholder="Content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  maxLength={2000}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">English (Optional)</label>
                <Input
                  placeholder="Title (English)"
                  value={formData.titleEn}
                  onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                  maxLength={100}
                />
                <Textarea
                  className="mt-2"
                  placeholder="Content (English)"
                  value={formData.contentEn}
                  onChange={(e) => setFormData({ ...formData, contentEn: e.target.value })}
                  maxLength={2000}
                />
              </div>
            </div>
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
                <PopoverContent className="w-auto">
                   <Calendar
                     mode="single"
                     selected={formData.expiresAt || undefined}
                     onSelect={(date) => setFormData({ ...formData, expiresAt: date || null })}
                   />
                   <div className="p-3 border-t border-border">
                     <Button
                       variant="ghost"
                       className="w-full text-destructive hover:text-destructive"
                       onClick={() => setFormData({ ...formData, expiresAt: null })}
                     >
                       Clear date
                     </Button>
                   </div>
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
                  <TableCell>
                    <div className="space-y-1">
                      <div>{notification.title}</div>
                      <div className="text-sm text-muted-foreground">{notification.titleEn}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 max-w-md">
                      <div className="truncate">{notification.content}</div>
                      <div className="truncate text-sm text-muted-foreground">{notification.contentEn}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusBadgeVariant(notification.status) as "default" | "secondary" | "destructive" | "outline"}>
                        {notification.status}
                      </Badge>
                      <Select
                        defaultValue={notification.status}
                        onValueChange={(value) => handleUpdateStatus(notification.id, value as Notification['status'])}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                  <TableCell>{format(notification.publishAt.toDate(), "PPP")}</TableCell>
                  <TableCell>
                    {notification.expiresAt ? format(notification.expiresAt.toDate(), "PPP") : "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => handleEdit(notification)}>Edit</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Edit Notification</AlertDialogTitle>
                          </AlertDialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="grid gap-4">
                              <div>
                                <label className="text-sm font-medium mb-2 block">Japanese</label>
                                <Input
                                  placeholder="Title"
                                  value={formData.title}
                                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                  maxLength={100}
                                />
                                <Textarea
                                  className="mt-2"
                                  placeholder="Content"
                                  value={formData.content}
                                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                  maxLength={2000}
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium mb-2 block">English (Optional)</label>
                                <Input
                                  placeholder="Title (English)"
                                  value={formData.titleEn}
                                  onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                                  maxLength={100}
                                />
                                <Textarea
                                  className="mt-2"
                                  placeholder="Content (English)"
                                  value={formData.contentEn}
                                  onChange={(e) => setFormData({ ...formData, contentEn: e.target.value })}
                                  maxLength={2000}
                                />
                              </div>
                            </div>
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
                                <PopoverContent className="w-auto">
                                   <Calendar
                                     mode="single"
                                     selected={formData.expiresAt || undefined}
                                     onSelect={(date) => setFormData({ ...formData, expiresAt: date || null })}
                                   />
                                   <div className="p-3 border-t border-border">
                                     <Button
                                       variant="ghost"
                                       className="w-full text-destructive hover:text-destructive"
                                       onClick={() => setFormData({ ...formData, expiresAt: null })}
                                     >
                                       Clear date
                                     </Button>
                                   </div>
                                </PopoverContent>
                              </Popover>
                            </div>
                          </div>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={handleCancelEdit}>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleUpdate}
                              disabled={isLoading}
                            >
                              {isLoading ? 'Updating...' : 'Update'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

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
                    </div>
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
