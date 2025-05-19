
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  updated_at: string | null;
  role?: string | null;
  created_at?: string | null;
}

const profileSchema = z.object({
  full_name: z.string().min(2, { message: "Name must be at least 2 characters" }).optional().or(z.literal('')),
  avatar_url: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal(''))
});

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: '',
      avatar_url: '',
    }
  });

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        
        if (data) {
          // Update the profile state with the database data
          // Ensure all required fields are present
          const profileData: Profile = {
            id: data.id,
            email: data.email,
            full_name: data.full_name,
            role: data.role || null,
            created_at: data.created_at || null,
            avatar_url: data.avatar_url || null,
            updated_at: data.updated_at || new Date().toISOString(),
          };
          
          setProfile(profileData);
          
          form.reset({
            full_name: data.full_name || '',
            avatar_url: data.avatar_url || ''
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        toast({
          title: "Error loading profile",
          description: "Unable to load your profile information",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    
    loadProfile();
  }, [user, form]);

  async function onSubmit(values: z.infer<typeof profileSchema>) {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const updates = {
        id: user.id,
        full_name: values.full_name,
        avatar_url: values.avatar_url,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(updates, { onConflict: 'id' });

      if (error) throw error;
      
      if (profile) {
        setProfile({
          ...profile,
          ...updates
        });
      }
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated",
      });
      
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error updating profile",
        description: "Unable to update your profile information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  if (loading && !profile) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-thriphti-green"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-8 py-16 mt-8">
      <Helmet>
        <title>Your Profile | Thriphti</title>
      </Helmet>
      
      <h1 className="font-serif text-3xl text-thriphti-green mb-6">Your Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>View and update your profile details</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <Avatar className="w-32 h-32 mb-4">
              {profile?.avatar_url ? (
                <AvatarImage src={profile.avatar_url} alt="Profile" />
              ) : (
                <AvatarFallback className="text-5xl text-gray-400">
                  {profile?.full_name?.[0] || user?.email?.[0] || '?'}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="text-center">
              <h3 className="text-xl font-medium">{profile?.full_name || 'User'}</h3>
              <p className="text-gray-500">{user?.email}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
            <CardDescription>Update your profile information</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="avatar_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Avatar URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/avatar.jpg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" disabled={loading} className="bg-thriphti-green">
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
