import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Alert, Badge, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./App.css";

function SensorPage() {
  const [sensorData, setSensorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const navigate = useNavigate();

  const banglaLabels = {
    N: "নাইট্রোজেন (N)",
    P: "ফসফরাস (P)",
    K: "পটাশিয়াম (K)",
    temperature: "তাপমাত্রা (°C)",
    humidity: "আর্দ্রতা (%)",
    pH: "পিএইচ (pH)",
    EC: "ইলেকট্রনিক পরিবাহিতা (EC)"
  };

  const icons = {
    N: "🧪",
    P: "⚗️",
    K: "🔥",
    temperature: "🌡️",
    humidity: "💧",
    pH: "🔬",
    EC: "⚡"
  };

  const getValueColor = (key, value) => {
    if (value === null || value === undefined) return "secondary";
    
    switch (key) {
      case "temperature":
        return value >= 20 && value <= 35 ? "success" : value < 15 || value > 40 ? "danger" : "warning";
      case "humidity":
        return value >= 40 && value <= 80 ? "success" : value < 30 || value > 90 ? "danger" : "warning";
      case "pH":
        return value >= 6 && value <= 7.5 ? "success" : value < 5.5 || value > 8 ? "danger" : "warning";
      case "EC":
        return value >= 0.5 && value <= 2.5 ? "success" : value < 0.3 || value > 3 ? "danger" : "warning";
      case "N":
      case "P":
      case "K":
        return value > 0 ? "success" : "danger";
      default:
        return "primary";
    }
  };

  const fetchSensorData = async () => {
    try {
      const response = await fetch("http://192.168.4.1");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSensorData(data);
      setError(null);
      setLastUpdate(new Date());
      setLoading(false);
    } catch (err) {
      console.error("Error fetching sensor data:", err);
      setError("ESP8266 এর সাথে সংযোগ করতে সমস্যা হচ্ছে। দয়া করে ESP8266 চালু আছে কিনা চেক করুন।");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSensorData();
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchSensorData, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const handleUseForRecommendation = () => {
    if (!sensorData) {
      setError("কোনো সেন্সর ডাটা নেই। প্রথমে ESP8266 এর সাথে সংযোগ করুন।");
      return;
    }

    // Store sensor data for crop recommendation
    localStorage.setItem("sensorDataForRecommendation", JSON.stringify(sensorData));
    
    // Navigate to main page with sensor data
    navigate("/?fromSensor=true");
    
    // Show success message
    setError(null);
  };

  const openSensorWebInterface = () => {
    // Open ESP8266 web interface in new tab
    window.open("http://192.168.36.136/", "_blank");
  };

  const copyAverageValues = () => {
    if (!sensorData) {
      setError("কোনো সেন্সর ডাটা নেই। প্রথমে ESP8266 এর সাথে সংযোগ করুন।");
      return;
    }

    // Create formatted string with sensor values
    const values = {
      N: sensorData.N !== null && sensorData.N !== undefined ? sensorData.N : 0,
      P: sensorData.P !== null && sensorData.P !== undefined ? sensorData.P : 0,
      K: sensorData.K !== null && sensorData.K !== undefined ? sensorData.K : 0,
      temperature: sensorData.temperature !== null && sensorData.temperature !== undefined ? sensorData.temperature : 0,
      humidity: sensorData.humidity !== null && sensorData.humidity !== undefined ? sensorData.humidity : 0,
      pH: sensorData.pH !== null && sensorData.pH !== undefined ? sensorData.pH : 0,
      EC: sensorData.EC !== null && sensorData.EC !== undefined ? sensorData.EC : 0
    };

    // Format as text for clipboard
    const clipboardText = `N: ${values.N}
P: ${values.P}
K: ${values.K}
Temperature: ${values.temperature}
Humidity: ${values.humidity}
pH: ${values.pH}
EC: ${values.EC}`;

    // Copy to clipboard
    navigator.clipboard.writeText(clipboardText).then(() => {
      setError(null);
      // Show success message using Alert
      const alertDiv = document.createElement('div');
      alertDiv.className = 'alert alert-success position-fixed top-50 start-50 translate-middle';
      alertDiv.style.zIndex = '9999';
      alertDiv.innerHTML = '✅ সেন্সর মানগুলো ক্লিপবোর্ডে কপি হয়েছে!';
      document.body.appendChild(alertDiv);
      setTimeout(() => {
        document.body.removeChild(alertDiv);
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy:', err);
      setError("ক্লিপবোর্ডে কপি করতে সমস্যা হয়েছে।");
    });
  };

  return (
    <Container>
      <Row className="justify-content-center">
        <Col lg={11} xl={10}>
          <Card className="shadow-lg border-0" style={{ borderRadius: '25px', overflow: 'hidden' }}>
            <div style={{
              background: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)',
              padding: '2rem',
              textAlign: 'center'
            }}>
              <h1 className="display-5 fw-bold text-white mb-2" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                📡 রিয়েল-টাইম NPK সেন্সর ড্যাশবোর্ড
              </h1>
              <p className="text-white-50 mb-3">ESP8266 থেকে লাইভ ডাটা মনিটরিং</p>
              
              <div className="d-flex justify-content-center align-items-center gap-3">
                <Badge 
                  bg={loading ? "light" : "light"}
                  text={loading ? "dark" : "success"}
                  className="px-4 py-2"
                  style={{ 
                    fontSize: '1rem',
                    borderRadius: '12px',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                  }}
                >
                  {loading ? "🔄 সংযোগ হচ্ছে..." : "✅ সংযুক্ত"}
                </Badge>
                {lastUpdate && (
                  <Badge 
                    bg="light" 
                    text="dark"
                    className="px-3 py-2"
                    style={{ 
                      fontSize: '0.9rem',
                      borderRadius: '12px'
                    }}
                  >
                    🕐 {lastUpdate.toLocaleTimeString()}
                  </Badge>
                )}
              </div>
            </div>

            <Card.Body className="p-4 p-md-5">
              {error && (
                <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-4">
                  <div className="d-flex align-items-center gap-2">
                    <span style={{ fontSize: '1.5rem' }}>⚠️</span>
                    <div>{error}</div>
                  </div>
                </Alert>
              )}

              {sensorData && (
                <>
                  <div className="text-center mb-5">
                    <div className="d-flex flex-wrap justify-content-center gap-3">
                      <Button 
                        onClick={openSensorWebInterface}
                        size="lg"
                        className="px-4 py-3"
                        style={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          border: 'none',
                          borderRadius: '15px',
                          fontWeight: '700',
                          fontSize: '1rem',
                          boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                          minWidth: '250px'
                        }}
                      >
                        🌐 সেন্সর ওয়েব ইন্টারফেস খুলুন
                      </Button>
                      
                      <Button 
                        onClick={copyAverageValues}
                        size="lg"
                        className="px-4 py-3"
                        style={{
                          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                          border: 'none',
                          borderRadius: '15px',
                          fontWeight: '700',
                          fontSize: '1rem',
                          boxShadow: '0 8px 25px rgba(240, 147, 251, 0.3)',
                          minWidth: '250px'
                        }}
                      >
                        📋 মানগুলো কপি করুন
                      </Button>
                      
                      <Button 
                        onClick={handleUseForRecommendation}
                        size="lg"
                        className="px-4 py-3"
                        style={{
                          background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                          border: 'none',
                          borderRadius: '15px',
                          fontWeight: '700',
                          fontSize: '1rem',
                          boxShadow: '0 8px 25px rgba(17, 153, 142, 0.3)',
                          minWidth: '250px'
                        }}
                      >
                        🌾 ফসল সুপারিশ করুন
                      </Button>
                    </div>
                  </div>

                  <Row className="g-4">
                    {Object.entries(sensorData).map(([key, value]) => (
                      <Col key={key} xs={12} sm={6} md={4} lg={3}>
                        <Card 
                          className="h-100 border-0"
                          style={{
                            borderRadius: '20px',
                            background: 'rgba(255, 255, 255, 0.9)',
                            backdropFilter: 'blur(10px)',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-8px)';
                            e.currentTarget.style.boxShadow = '0 12px 35px rgba(0, 0, 0, 0.15)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
                          }}
                        >
                          <Card.Body className="text-center p-4">
                            <div className="mb-3" style={{ fontSize: '3rem' }}>
                              {icons[key] || "📊"}
                            </div>
                            <Card.Title className="h6 mb-3 fw-bold text-muted">
                              {banglaLabels[key] || key}
                            </Card.Title>
                            <div className="mb-3">
                              <Badge 
                                style={{
                                  background: getValueColor(key, value),
                                  fontSize: '1.5rem',
                                  padding: '0.75rem 1.5rem',
                                  borderRadius: '15px',
                                  fontWeight: '700',
                                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)'
                                }}
                              >
                                {value !== null && value !== undefined ? 
                                  (typeof value === 'number' ? value.toFixed(1) : value) : 
                                  "N/A"
                                }
                              </Badge>
                            </div>
                            <Card.Text className="text-muted fw-semibold" style={{ fontSize: '0.9rem' }}>
                              {key === "temperature" && "°C"}
                              {key === "humidity" && "%"}
                              {key === "pH" && "pH"}
                              {key === "EC" && "dS/m"}
                              {key === "N" && "mg/kg"}
                              {key === "P" && "mg/kg"}
                              {key === "K" && "mg/kg"}
                            </Card.Text>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </>
              )}

              {loading && (
                <div className="text-center py-5">
                  <Spinner 
                    animation="border" 
                    variant="primary" 
                    style={{ width: '4rem', height: '4rem', borderWidth: '4px' }}
                  />
                  <h4 className="mt-4 text-muted fw-semibold">ESP8266 এর সাথে সংযোগ হচ্ছে...</h4>
                  <p className="text-muted">অনুগ্রহ করে অপেক্ষা করুন</p>
                </div>
              )}

              <div className="text-center mt-5">
                <Button 
                  onClick={fetchSensorData}
                  variant="outline-primary"
                  disabled={loading}
                  size="lg"
                  className="px-5"
                  style={{
                    borderRadius: '15px',
                    borderWidth: '2px',
                    fontWeight: '600'
                  }}
                >
                  🔄 ডাটা আপডেট করুন
                </Button>
              </div>

              <div className="mt-5 p-4" style={{
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                borderRadius: '20px',
                border: '2px solid rgba(102, 126, 234, 0.2)'
              }}>
                <h5 className="fw-bold mb-3" style={{ color: '#667eea' }}>
                  ℹ️ নির্দেশনা:
                </h5>
                <ul className="mb-0" style={{ fontSize: '0.95rem', lineHeight: '1.8' }}>
                  <li>সেন্সর ডাটা প্রতি ৫ সেকেন্ডে আপডেট হয়</li>
                  <li><span style={{ 
                    background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: '600'
                  }}>সবুজ</span> = ভালো মান, <span style={{ color: '#ff9800', fontWeight: '600' }}>হলুদ</span> = সতর্ক, <span style={{ color: '#f44336', fontWeight: '600' }}>লাল</span> = খারাপ মান</li>
                  <li>"সেন্সর ডাটা দিয়ে ফসল সুপারিশ করুন" বাটনে ক্লিক করে MainPage এ যান</li>
                </ul>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default SensorPage;
