
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Shield, User } from "lucide-react";
import type { Database } from '@/types/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];
type UserRole = Database['public']['Tables']['user_roles']['Row'];

interface UserWithRoles extends Profile {
  user_roles: UserRole[];
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data as UserWithRoles[] || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'user' | 'admin') => {
    try {
      // First, remove existing roles for this user
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      // Then add the new role
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: newRole });

      if (error) throw error;

      // Update local state
      setUsers(prev => prev.map(user => {
        if (user.id === userId) {
          return {
            ...user,
            user_roles: [{ id: '', user_id: userId, role: newRole, created_at: new Date().toISOString() }]
          };
        }
        return user;
      }));

      toast({
        title: "Success",
        description: `User role updated to ${newRole}`
      });
    } catch (error: any) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user role",
        variant: "destructive"
      });
    }
  };

  const getUserRole = (user: UserWithRoles): string => {
    return user.user_roles?.[0]?.role || 'user';
  };

  if (loading) {
    return <div>Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">User Management</h2>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const currentRole = getUserRole(user);
              return (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {user.avatar_url ? (
                        <img 
                          src={user.avatar_url} 
                          alt={user.full_name || 'User'} 
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-4 w-4" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium">
                          {user.full_name || 'No name'}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {user.id.slice(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={currentRole === 'admin' ? 'default' : 'secondary'}
                      className={currentRole === 'admin' ? 'bg-red-100 text-red-800' : ''}
                    >
                      {currentRole === 'admin' && <Shield className="h-3 w-3 mr-1" />}
                      {currentRole}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.created_at && new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={currentRole}
                      onValueChange={(value: 'user' | 'admin') => updateUserRole(user.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {users.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No users found.
        </div>
      )}
    </div>
  );
}
