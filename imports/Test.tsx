"use client";

import { useEffect, useState } from "react";

export default function TestApi() {
  const [data, setData] = useState(null);
  const [error, setError] = useState<string | null>(null);

  // States for the inputs
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");

  const postData = async () => {
    try {
      const res = await fetch("/api/User", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          FullName: name || "John Doe",
          Email: email || "john.doe@example.com",
          PasswordHash: password || "Str0ngP@ssw0rd!",
          Address: address || "This is a very long address that exceeds thirty characters for validation",
          WalletPoints: 0
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        let detailedError = errorData.title || "Network response was not ok";
        if (errorData.errors) {
          // Parse .NET validation errors
          detailedError += " - " + JSON.stringify(errorData.errors);
        }
        throw new Error(detailedError);
      }

      const result = await res.json();
      setData(result);
      setError(null); // Clear errors
    } catch (err: any) {
      console.error(err);
      setError("Failed to post: " + err.message);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/recyclers", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          throw new Error("Network response was not ok");
        }

        const result = await res.json();
        setData(result);
      } catch (err: any) {
        console.error(err);
        setError("Failed to fetch: " + err.message);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>Test API</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {data ? <pre>{JSON.stringify(data, null, 2)}</pre> : <p>Loading...</p>}
      <div className="flex flex-col gap-2 mt-4 max-w-sm">
        <input 
          type="text" 
          placeholder="name" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 rounded"
        />
        <input 
          type="email" 
          placeholder="email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded"
        />
        <input 
          type="password" 
          placeholder="password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 rounded"
        />
        <button 
          onClick={postData}
          className="bg-green-600 text-white p-2 rounded hover:bg-green-700"
        >
          send data
        </button>
      </div>
    </div>
  );
}
