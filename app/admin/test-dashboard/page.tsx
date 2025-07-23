"use client";

import { useEffect, useState } from "react";

export default function TestDashboard() {
  const [testResults, setTestResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testDatabase = async () => {
      try {
        const response = await fetch("/api/admin/test-db");
        const data = await response.json();
        setTestResults(data);
      } catch (error) {
        console.error("Test failed:", error);
        setTestResults({
          error: error instanceof Error ? error.message : String(error),
        });
      } finally {
        setLoading(false);
      }
    };

    testDatabase();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-white mb-4">
          Testing Database Connections...
        </h1>
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-4">
        Database Test Results
      </h1>

      <div className="bg-[#1A1A1A] rounded-lg p-6 border border-gray-800">
        <pre className="text-sm text-gray-300 whitespace-pre-wrap overflow-auto">
          {JSON.stringify(testResults, null, 2)}
        </pre>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold text-white mb-4">Analysis</h2>
        {testResults?.results && (
          <div className="space-y-4">
            {Object.entries(testResults.results).map(
              ([endpoint, result]: [string, any]) => (
                <div
                  key={endpoint}
                  className="bg-[#1A1A1A] rounded-lg p-4 border border-gray-800"
                >
                  <h3 className="font-medium text-white">{endpoint}</h3>
                  <div className="mt-2 text-sm">
                    {result.status ? (
                      <span
                        className={`px-2 py-1 rounded ${
                          result.status === 200
                            ? "bg-green-900 text-green-300"
                            : "bg-red-900 text-red-300"
                        }`}
                      >
                        Status: {result.status}
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded bg-red-900 text-red-300">
                        Error: {result.error}
                      </span>
                    )}
                    {result.count !== undefined && (
                      <span className="ml-2 text-gray-400">
                        Count: {result.count}
                      </span>
                    )}
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </div>
    </div>
  );
}
