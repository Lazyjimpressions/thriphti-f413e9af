
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { getUserRoles } from "@/integrations/supabase/queries";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AdminArticles from "@/components/admin/AdminArticles";
import AdminStores from "@/components/admin/AdminStores";
import AdminEvents from "@/components/admin/AdminEvents";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminContentPipeline from "@/components/admin/AdminContentPipeline";
import Layout from "@/components/layout/Layout";
import { Loader2 } from "lucide-react";

export default function Admin() {
  const { user, isLoading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAdminRole = async () => {
      console.log("=== ADMIN ACCESS DEBUG ===");
      console.log("Auth loading:", authLoading);
      console.log("User object:", user);
      console.log("User ID:", user?.id);
      console.log("User email:", user?.email);

      if (!user) {
        console.log("No user found, redirecting to auth");
        setIsAdmin(false);
        setLoading(false);
        setDebugInfo({ step: "no_user", user: null });
        return;
      }

      try {
        console.log("Checking admin role for user ID:", user.id);
        const roles = await getUserRoles(user.id);
        console.log("Roles returned:", roles);
        
        const hasAdminRole = roles.some(role => {
          console.log("Checking role:", role, "role.role:", role.role);
          return role.role === 'admin';
        });
        
        console.log("Has admin role:", hasAdminRole);
        
        setIsAdmin(hasAdminRole);
        setDebugInfo({
          step: "role_check_complete",
          userId: user.id,
          userEmail: user.email,
          roles: roles,
          hasAdminRole: hasAdminRole,
          rolesLength: roles.length
        });
        
        if (!hasAdminRole) {
          console.log("User does not have admin role. Roles found:", roles);
        }
      } catch (error: any) {
        console.error('Error checking admin role:', error);
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          userId: user.id
        });
        setIsAdmin(false);
        setError(error.message);
        setDebugInfo({
          step: "error",
          error: error.message,
          userId: user.id,
          userEmail: user.email
        });
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      checkAdminRole();
    }
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading admin access...</p>
            {debugInfo && (
              <div className="mt-4 text-sm text-gray-600">
                Debug: {debugInfo.step}
              </div>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  // Show debug information for troubleshooting
  if (process.env.NODE_ENV === 'development' && (error || !isAdmin)) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-red-800 mb-4">Admin Access Debug Information</h2>
            
            {error && (
              <div className="mb-4">
                <h3 className="font-semibold text-red-700">Error:</h3>
                <p className="text-red-600">{error}</p>
              </div>
            )}
            
            <div className="space-y-2">
              <h3 className="font-semibold text-red-700">Debug Info:</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
            
            <div className="mt-4 space-y-2">
              <h3 className="font-semibold text-red-700">Troubleshooting Steps:</h3>
              <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
                <li>Check if user_roles table has entry for user ID: {user?.id}</li>
                <li>Verify role is exactly 'admin' (case sensitive)</li>
                <li>Ensure getUserRoles function is working correctly</li>
                <li>Check Supabase RLS policies on user_roles table</li>
              </ul>
            </div>

            <div className="mt-4">
              <button 
                onClick={() => window.location.reload()} 
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-thriphti-green">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage content and moderate submissions</p>
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-2 text-xs text-green-600">
              ✅ Admin access confirmed for {user.email}
            </div>
          )}
        </div>

        <Tabs defaultValue="pipeline" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="pipeline">AI Pipeline</TabsTrigger>
            <TabsTrigger value="articles">Articles</TabsTrigger>
            <TabsTrigger value="stores">Stores</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="pipeline">
            <Card>
              <CardHeader>
                <CardTitle>AI Content Pipeline</CardTitle>
              </CardHeader>
              <CardContent>
                <AdminContentPipeline />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="articles">
            <Card>
              <CardHeader>
                <CardTitle>Article Management</CardTitle>
              </CardHeader>
              <CardContent>
                <AdminArticles />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stores">
            <Card>
              <CardHeader>
                <CardTitle>Store Management</CardTitle>
              </CardHeader>
              <CardContent>
                <AdminStores />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events">
            <Card>
              <CardHeader>
                <CardTitle>Event Management</CardTitle>
              </CardHeader>
              <CardContent>
                <AdminEvents />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <AdminUsers />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
