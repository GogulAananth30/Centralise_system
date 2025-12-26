"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function TestConnection() {
    const [status, setStatus] = useState("Checking...");
    const [error, setError] = useState("");

    useEffect(() => {
        const checkConnection = async () => {
            try {
                const response = await axios.get("http://localhost:8000/");
                setStatus(`Connected! Response: ${JSON.stringify(response.data)}`);
            } catch (err: any) {
                setStatus("Failed");
                setError(err.message || "Unknown error");
            }
        };
        checkConnection();
    }, []);

    return (
        <div className="p-10">
            <h1 className="text-2xl font-bold mb-4">Backend Connection Test</h1>
            <p className="text-lg">Status: <span className={status.includes("Connected") ? "text-green-600 font-bold" : "text-red-600 font-bold"}>{status}</span></p>
            {error && <p className="text-red-500 mt-2">Error Details: {error}</p>}

            <div className="mt-8">
                <h2 className="text-xl font-bold">Troubleshooting Tips:</h2>
                <ul className="list-disc ml-5 mt-2 space-y-2">
                    <li>Ensure Backend is running on <strong>http://localhost:8000</strong></li>
                    <li>Ensure Frontend started on a port permitted by CORS (3000 or 3001)</li>
                    <li>Check if your browser blocks "mixed content" (unlikely on localhost)</li>
                </ul>
            </div>
        </div>
    );
}
