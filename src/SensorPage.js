import React from "react";
import "./App.css";

function SensorPage() {
  return (
    <div className="container">
      <h1>📡 সেন্সর ডাটা</h1>
      <iframe
        title="Sensor Data"
        src="http://192.168.251.84/"  // replace with your sensor web server
        width="100%"
        height="600px"
        style={{ border: "2px solid #ccc", borderRadius: "8px" }}
      />
    </div>
  );
}

export default SensorPage;
