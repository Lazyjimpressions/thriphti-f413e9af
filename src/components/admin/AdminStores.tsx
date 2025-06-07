import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getApprovedStores } from "@/integrations/supabase/queries";
import { getAIPendingStores, updateAIStoreApproval } from "@/integrations/supabase/storeQueries";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Check, X, Eye, Bot, Star } from "lucide-react";
import WebsiteAnalyzer from "./stores/WebsiteAnalyzer";
import type { Database } from '@/integrations/supabase/types';

type Store = Database['public']['Tables']['stores']['Row'];

export default function AdminStores() {
  const [stores, setStores] = useState<Store[]>([]);
  const [pendingStores, setPendingStores] = useState<Store[]>([]);
  const [aiPendingStores, setAIPendingStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      // Fetch manual pending stores
      const { data: allStores, error } = await supabase
        .from('stores')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const approved = allStores?.filter(store => store.approved) || [];
      const manualPending = allStores?.filter(store => !store.approved && !store.ai_generated) || [];

      setStores(approved);
      setPendingStores(manualPending);

      // Fetch AI-generated pending stores
      const aiPending = await getAIPendingStores();
      setAIPendingStores(aiPending);

    } catch (error) {
      console.error('Error fetching stores:', error);
      toast({
        title: "Error",
        description: "Failed to fetch stores",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const approveStore = async (storeId: string) => {
    try {
      const { error } = await supabase
        .from('stores')
        .update({ approved: true })
        .eq('id', storeId);

      if (error) throw error;

      // Move store from pending to approved
      const store = pendingStores.find(s => s.id === storeId);
      if (store) {
        setPendingStores(prev => prev.filter(s => s.id !== storeId));
        setStores(prev => [{ ...store, approved: true }, ...prev]);
      }

      toast({
        title: "Success",
        description: "Store approved successfully"
      });
    } catch (error: any) {
      console.error('Error approving store:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to approve store",
        variant: "destructive"
      });
    }
  };

  const approveAIStore = async (storeId: string) => {
    try {
      await updateAIStoreApproval(storeId, true);

      // Move store from AI pending to approved
      const store = aiPendingStores.find(s => s.id === storeId);
      if (store) {
        setAIPendingStores(prev => prev.filter(s => s.id !== storeId));
        setStores(prev => [{ ...store, approved: true }, ...prev]);
      }

      toast({
        title: "Success",
        description: "AI-generated store approved successfully"
      });
    } catch (error: any) {
      console.error('Error approving AI store:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to approve AI store",
        variant: "destructive"
      });
    }
  };

  const rejectStore = async (storeId: string) => {
    if (!confirm('Are you sure you want to reject this store submission?')) return;

    try {
      const { error } = await supabase
        .from('stores')
        .delete()
        .eq('id', storeId);

      if (error) throw error;

      setPendingStores(prev => prev.filter(s => s.id !== storeId));
      setAIPendingStores(prev => prev.filter(s => s.id !== storeId));

      toast({
        title: "Success",
        description: "Store submission rejected"
      });
    } catch (error: any) {
      console.error('Error rejecting store:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to reject store",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div>Loading stores...</div>;
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="analyzer" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analyzer">Website Analyzer</TabsTrigger>
          <TabsTrigger value="ai-pending">AI Pending ({aiPendingStores.length})</TabsTrigger>
          <TabsTrigger value="manual-pending">Manual Pending ({pendingStores.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({stores.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="analyzer" className="space-y-4">
          <div className="flex justify-center">
            <WebsiteAnalyzer />
          </div>
        </TabsContent>

        <TabsContent value="ai-pending" className="space-y-4">
          {aiPendingStores.length > 0 ? (
            <div>
              <h3 className="text-lg font-semibold mb-4 text-thriphti-green flex items-center gap-2">
                <Bot className="h-5 w-5" />
                AI-Generated Stores Pending Review ({aiPendingStores.length})
              </h3>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Store Name</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Confidence</TableHead>
                      <TableHead>Generated</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {aiPendingStores.map((store) => (
                      <TableRow key={store.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {store.name}
                              <Bot className="h-4 w-4 text-thriphti-green" />
                            </div>
                            {store.website && (
                              <div className="text-sm text-blue-600">{store.website}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {store.address}<br />
                            {store.city}, {store.state} {store.zip}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {store.category?.map((cat, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {cat}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`h-3 w-3 ${
                                    i < (store.ai_confidence || 0) * 5 
                                      ? 'fill-yellow-400 text-yellow-400' 
                                      : 'text-gray-300'
                                  }`} 
                                />
                              ))}
                            </div>
                            <span className="text-xs text-gray-600">
                              {Math.round((store.ai_confidence || 0) * 100)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(store.created_at!).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => approveAIStore(store.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => rejectStore(store.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No AI-generated stores pending review.
            </div>
          )}
        </TabsContent>

        <TabsContent value="manual-pending" className="space-y-4">
          {pendingStores.length > 0 ? (
            // ... keep existing code (manual pending stores table)
            <div>
              <h3 className="text-lg font-semibold mb-4 text-orange-600">
                Manual Submissions Pending Approval ({pendingStores.length})
              </h3>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Store Name</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingStores.map((store) => (
                      <TableRow key={store.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{store.name}</div>
                            {store.website && (
                              <div className="text-sm text-blue-600">{store.website}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {store.address}<br />
                            {store.city}, {store.state} {store.zip}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {store.category?.map((cat, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {cat}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(store.created_at!).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => approveStore(store.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => rejectStore(store.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No manual submissions pending approval.
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Approved Stores ({stores.length})
            </h3>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Store Name</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Approved</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stores.map((store) => (
                    <TableRow key={store.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {store.name}
                            {store.ai_generated && <Bot className="h-4 w-4 text-thriphti-green" />}
                          </div>
                          {store.website && (
                            <div className="text-sm text-blue-600">{store.website}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {store.address}<br />
                          {store.city}, {store.state} {store.zip}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {store.category?.map((cat, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {cat}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={store.ai_generated ? "default" : "secondary"} className="text-xs">
                          {store.ai_generated ? "AI Generated" : "Manual"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(store.created_at!).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`/stores/${store.id}`, '_blank')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {stores.length === 0 && pendingStores.length === 0 && aiPendingStores.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No stores found. Use the Website Analyzer to get started!
        </div>
      )}
    </div>
  );
}
