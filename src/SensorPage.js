import React, { useEffect, useState } from "react";
import "./App.css";

function SensorPage() {
  const [data, setData] = useState("");

  useEffect(() => {
    fetch("http://192.168.251.84") // ESP8266 server
      .then((res) => res.text())
      .then((txt) => setData(txt))
      .catch((err) => console.error("Error:", err));
  }, []);

  return (
    <div className="container">
      <h1>📡 সেন্সর ডাটা</h1>
      <div
        style={{
          border: "2px solid #ccc",
          borderRadius: "8px",
          padding: "10px",
          height: "600px",
          overflow: "auto",
        }}
        dangerouslySetInnerHTML={{ __html: data }}
      />
    </div>
  );
}

export default SensorPage;
