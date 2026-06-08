import AdminLayout from "@/Layouts/AdminLayout";
import { Head, router, usePage } from "@inertiajs/react";
import { useState, useRef } from "react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Upload, AlertTriangle, CheckCircle, Loader } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";

import { toast } from "sonner";

export default function Database() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch(route("admin.database.export"));
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `database_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success("Database exported successfully");
    } catch (error) {
      toast.error("Failed to export database");
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.json')) {
        toast.error("Please select a valid JSON file");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleImportClick = () => {
    if (selectedFile) {
      setShowImportConfirm(true);
    } else {
      fileInputRef.current?.click();
    }
  };

  const confirmImport = async () => {
    if (!selectedFile) return;

    setIsImporting(true);
    setShowImportConfirm(false);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch(route("admin.database.import"), {
        method: "POST",
        body: formData,
        headers: {
          "X-CSRF-Token": document.querySelector('meta[name="csrf-token"]')?.content,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Import failed");
      }

      toast.success("Database imported successfully");
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      toast.error(error.message || "Failed to import database");
      console.error(error);
    } finally {
      setIsImporting(false);
    }
  };

  const browseFiles = () => {
    fileInputRef.current?.click();
  };

  return (
    <AdminLayout>
      <Head title="Database Management" />
      
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Database Management</h1>
          <p className="text-gray-600 mt-2">Export and import your database</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Export Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Export Database
              </CardTitle>
              <CardDescription>
                Download a complete backup of your database in JSON format
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  This will export all data from all tables except migrations and system tables. 
                  The file can be used to restore your database later.
                </p>
                <Button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="w-full"
                  size="lg"
                >
                  {isExporting ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Export Now
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Import Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Import Database
              </CardTitle>
              <CardDescription>
                Restore your database from a previously exported JSON file
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-900">Warning</p>
                    <p className="text-sm text-red-700">
                      Importing will replace all existing data. Make sure you have a backup first.
                    </p>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <div className="space-y-2">
                  {selectedFile ? (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">
                          {selectedFile.name}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedFile(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = "";
                          }
                        }}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Change
                      </button>
                    </div>
                  ) : null}

                  <div className="flex gap-2">
                    <Button
                      onClick={browseFiles}
                      variant="outline"
                      className="flex-1"
                    >
                      Browse Files
                    </Button>
                    <Button
                      onClick={handleImportClick}
                      disabled={isImporting || !selectedFile}
                      className="flex-1"
                    >
                      {isImporting ? (
                        <>
                          <Loader className="w-4 h-4 mr-2 animate-spin" />
                          Importing...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Import Now
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Section */}
        <Card>
          <CardHeader>
            <CardTitle>Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div>
                <h3 className="font-medium mb-2">Export Format</h3>
                <p className="text-gray-600">
                  Exports are in JSON format containing all tables and their data with timestamps.
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Excluded Tables</h3>
                <p className="text-gray-600">
                  Migration history and failed jobs tables are excluded from exports to maintain system integrity.
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Import Process</h3>
                <p className="text-gray-600">
                  During import, all existing data is cleared and replaced with the imported data. The process uses database transactions for safety.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Import Confirmation Dialog */}
      <AlertDialog open={showImportConfirm} onOpenChange={setShowImportConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Database Import</AlertDialogTitle>
            <AlertDialogDescription>
              This will replace all current database data with the data from the selected file. 
              This action cannot be undone. Make sure you have a backup of your current data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmImport} className="bg-red-600 hover:bg-red-700">
              Import Database
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
