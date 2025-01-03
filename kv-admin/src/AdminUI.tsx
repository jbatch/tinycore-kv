import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useApplications, useKVStore } from "@/hooks/useApi";
import ApplicationTab from "./components/ApplicationTab";
import KVTab from "./components/KVTab";

const itemsPerPage = 1;

const AdminUI = () => {
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [searchPrefix, setSearchPrefix] = useState("");
  const [isNewAppDialogOpen, setIsNewAppDialogOpen] = useState(false);
  const [isNewKVDialogOpen, setIsNewKVDialogOpen] = useState(false);
  const [newApp, setNewApp] = useState({ id: "", name: "", metadata: "" });
  const [newKV, setNewKV] = useState({ key: "", value: "", metadata: "" });
  const [tab, setTab] = useState("applications");

  const {
    data: applications,
    error: appError,
    fetchApplications,
    createApplication,
    deleteApplication,
  } = useApplications();

  const {
    data: kvItems,
    error: kvError,
    fetchKVItems,
    createKVItem,
    deleteKVItem,
  } = useKVStore();

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  useEffect(() => {
    if (selectedApp) {
      fetchKVItems(selectedApp, searchPrefix);
    }
  }, [selectedApp, searchPrefix, fetchKVItems]);

  const handleCreateApplication = async () => {
    try {
      const success = await createApplication({
        id: newApp.id,
        name: newApp.name,
        metadata: newApp.metadata ? JSON.parse(newApp.metadata) : {},
      });

      if (success) {
        setIsNewAppDialogOpen(false);
        setNewApp({ id: "", name: "", metadata: "" });
      }
    } catch (err) {
      console.error("Failed to create application:", err);
    }
  };

  const handleCreateKVItem = async () => {
    if (!selectedApp) return;
    try {
      const success = await createKVItem(
        selectedApp,
        newKV.key,
        JSON.parse(newKV.value),
        newKV.metadata ? JSON.parse(newKV.metadata) : undefined
      );

      if (success) {
        setIsNewKVDialogOpen(false);
        setNewKV({ key: "", value: "", metadata: "" });
      }
    } catch (err) {
      console.error("Failed to create KV item:", err);
    }
  };

  const handleDeleteApplication = async (id: string) => {
    if (!confirm("Are you sure you want to delete this application?")) return;
    const success = await deleteApplication(id);
    if (success && selectedApp === id) {
      setSelectedApp(null);
    }
  };

  const handleDeleteKVItem = async (key: string) => {
    if (
      !selectedApp ||
      !confirm("Are you sure you want to delete this KV item?")
    )
      return;
    await deleteKVItem(selectedApp, key);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">TinyCore Admin</h1>

      {(appError || kvError) && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{appError || kvError}</AlertDescription>
        </Alert>
      )}

      <Tabs value={tab} defaultValue="applications" className="space-y-4">
        <TabsList>
          <TabsTrigger
            value="applications"
            onClick={() => setTab("applications")}
          >
            Applications
          </TabsTrigger>
          <TabsTrigger
            value="kv"
            onClick={() => setTab("kv")}
            disabled={selectedApp === null}
          >
            Key-Value Store
          </TabsTrigger>
        </TabsList>

        <TabsContent value="applications" className="space-y-4">
          <ApplicationTab
            applications={applications}
            newApp={newApp}
            isNewAppDialogOpen={isNewAppDialogOpen}
            setSelectedApp={setSelectedApp}
            setTab={setTab}
            handleDeleteApplication={handleDeleteApplication}
            setNewApp={setNewApp}
            setIsNewAppDialogOpen={setIsNewAppDialogOpen}
            handleCreateApplication={handleCreateApplication}
          />
        </TabsContent>

        <TabsContent value="kv" className="space-y-4">
          <KVTab
            kvItems={kvItems}
            selectedApp={selectedApp}
            isNewKVDialogOpen={isNewKVDialogOpen}
            newKV={newKV}
            searchPrefix={searchPrefix}
            page={page}
            itemsPerPage={itemsPerPage}
            setIsNewKVDialogOpen={setIsNewKVDialogOpen}
            setNewKV={setNewKV}
            handleCreateKVItem={handleCreateKVItem}
            setSearchPrefix={setSearchPrefix}
            handleDeleteKVItem={handleDeleteKVItem}
            setPage={setPage}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminUI;
