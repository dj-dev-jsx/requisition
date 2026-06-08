<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class DatabaseController extends Controller
{
    /**
     * Show database management page
     */
    public function view()
    {
        return Inertia::render('Admin/Database');
    }

    /**
     * Export all database data to JSON
     */
    public function export()
    {
        try {
            $database = config('database.connections.mysql.database');
            $tables = DB::select("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?", [$database]);
            
            $data = [
                'exported_at' => now()->format('Y-m-d H:i:s'),
                'database' => $database,
                'tables' => []
            ];

            foreach ($tables as $table) {
                $tableName = $table->TABLE_NAME;
                
                // Skip migration and system tables
                if (in_array($tableName, ['migrations', 'failed_jobs'])) {
                    continue;
                }

                $records = DB::table($tableName)->get();
                $data['tables'][$tableName] = $records->toArray();
            }

            $filename = 'database_export_' . now()->format('Y-m-d_H-i-s') . '.json';
            
            return response()->json($data)
                ->header('Content-Disposition', "attachment; filename=\"{$filename}\"");
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Import database data from JSON
     */
    public function import(Request $request)
    {
        try {
            $request->validate([
                'file' => 'required|file|mimes:json|max:102400', // 100MB max
            ]);

            $file = $request->file('file');
            $content = json_decode(file_get_contents($file->getRealPath()), true);

            if (!isset($content['tables'])) {
                return response()->json(['error' => 'Invalid export file format'], 422);
            }

            // Start transaction
            DB::beginTransaction();

            try {
                foreach ($content['tables'] as $tableName => $records) {
                    // Clear existing data
                    DB::table($tableName)->truncate();

                    // Insert new data
                    if (!empty($records)) {
                        DB::table($tableName)->insert($records);
                    }
                }

                DB::commit();

                return response()->json([
                    'success' => true,
                    'message' => 'Database imported successfully'
                ]);
            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['error' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
