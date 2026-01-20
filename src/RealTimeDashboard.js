import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Alert, Badge, Spinner, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { database } from "./firebase";
import { ref, onValue, off } from "firebase/database";
import "./App.css";

function RealTimeDashboard() {
  const [sensorData, setSensorData] = useState(null);
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [lastUpdate, setLastUpdate] = useState(null);
  const navigate = useNavigate();

  const banglaLabels = {
    nitrogen: "নাইট্রোজেন (N)",
    phosphorus: "ফসফরাস (P)",
    potassium: "পটাশিয়াম (K)",
    temperature: "তাপমাত্রা (°C)",
    humidity: "আর্দ্রতা (%)",
    ph: "পিএইচ (pH)",
    conductivity: "ইলেকট্রনিক পরিবাহিতা (EC)"
  };

  const icons = {
    nitrogen: "🧪",
    phosphorus: "⚗️",
    potassium: "🔥",
    temperature: "🌡️",
    humidity: "💧",
    ph: "🔬",
    conductivity: "⚡"
  };

  const getValueColor = (key, value) => {
    if (value === null || value === undefined) return "secondary";
    
    switch (key) {
      case "temperature":
        return value >= 20 && value <= 35 ? "success" : value < 15 || value > 40 ? "danger" : "warning";
      case "humidity":
        return value >= 40 && value <= 80 ? "success" : value < 30 || value > 90 ? "danger" : "warning";
      case "ph":
        return value >= 6 && value <= 7.5 ? "success" : value < 5.5 || value > 8 ? "danger" : "warning";
      case "conductivity":
        return value >= 500 && value <= 2500 ? "success" : value < 300 || value > 3000 ? "danger" : "warning";
      case "nitrogen":
      case "phosphorus":
      case "potassium":
        return value > 0 ? "success" : "danger";
      default:
        return "primary";
    }
  };

  useEffect(() => {
    // Reference to current sensor data
    const currentDataRef = ref(database, 'npkSensor/current');

    // Listen to current sensor data
    const unsubscribeCurrent = onValue(currentDataRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setSensorData(data);
        setLastUpdate(new Date(data.timestamp || Date.now()));
        setError(null);
        setLoading(false);
        
        // Add reading to history (keep last 10)
        setReadings(prevReadings => {
          const newReading = {
            id: Date.now(),
            timestamp: data.timestamp || Date.now(),
            ...data
          };
          return [newReading, ...prevReadings].slice(0, 10);
        });
      } else {
        setError("কোনো সেন্সর ডাটা পাওয়া যায়নি। ESP8266 চালু আছে কিনা চেক করুন।");
        setLoading(false);
      }
    }, (error) => {
      console.error("Error fetching sensor data:", error);
      setError("Firebase থেকে ডাটা পেতে সমস্যা হচ্ছে।");
      setLoading(false);
    });

    // Cleanup listeners on unmount
    return () => {
      off(currentDataRef);
      unsubscribeCurrent();
    };
  }, []);

  const handleUseForRecommendation = () => {
    if (!sensorData) {
      setError("কোনো সেন্সর ডাটা নেই। প্রথমে ESP8266 এর সাথে সংযোগ করুন।");
      return;
    }

    // Map Firebase data to form format
    const formData = {
      N: sensorData.nitrogen || 0,
      P: sensorData.phosphorus || 0,
      K: sensorData.potassium || 0,
      temperature: sensorData.temperature || 0,
      humidity: sensorData.humidity || 0,
      pH: sensorData.ph || 0,
      EC: sensorData.conductivity ? (sensorData.conductivity / 100) : 0
    };

    // Store sensor data for crop recommendation
    localStorage.setItem("sensorDataForRecommendation", JSON.stringify(formData));
    
    // Navigate to recommendation page with sensor data
    navigate("/recommendation?fromSensor=true");
  };

  const copyAverageValues = () => {
    if (!sensorData) {
      setError("কোনো সেন্সর ডাটা নেই।");
      return;
    }

    const clipboardText = `Nitrogen: ${sensorData.nitrogen || 0} mg/kg
Phosphorus: ${sensorData.phosphorus || 0} mg/kg
Potassium: ${sensorData.potassium || 0} mg/kg
Temperature: ${sensorData.temperature || 0} °C
Humidity: ${sensorData.humidity || 0} %
pH: ${sensorData.ph || 0}
Conductivity: ${sensorData.conductivity || 0} µS/cm`;

    navigator.clipboard.writeText(clipboardText).then(() => {
      setError(null);
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

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    return date.toLocaleString('bn-BD', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'Asia/Dhaka'
    });
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col lg={10} xl={9}>
          {/* Hero Header */}
          <div className="text-center mb-5">
            <h1 className="display-4 fw-bold text-dark mb-3">
              <span className="text-primary me-2">📡</span>
              রিয়েল-টাইম NPK সেন্সর
            </h1>
            <p className="lead text-muted mb-4">
              মাটির গুণাগুণ পরিমাপের লাইভ মনিটরিং
            </p>
          </div>

          {/* Main Card */}
          <Card className="shadow-sm border-0 rounded-4 mb-4">
            <Card.Body className="p-4 p-lg-5">
              {error && (
                <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-4">
                  <div className="d-flex align-items-center gap-2">
                    <span style={{ fontSize: '1.5rem' }}>⚠️</span>
                    <div>{error}</div>
                  </div>
                </Alert>
              )}

              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
                  <p className="mt-3 text-muted">Firebase থেকে ডাটা লোড হচ্ছে...</p>
                </div>
              ) : sensorData && (
                <>
                  {/* Current Sensor Values */}
                  <div className="mb-5">
                    <div className="text-center mb-4">
                      <h3 className="fw-bold text-primary">
                        <span className="me-2">🎯</span>
                        বর্তমান সেন্সর মান
                      </h3>
                      <p className="text-muted mb-0">লাইভ মনিটরিং ডাটা</p>
                    </div>
                    <Row className="g-4">
                      {[
                        { key: 'nitrogen', label: banglaLabels.nitrogen, icon: icons.nitrogen, unit: 'mg/kg' },
                        { key: 'phosphorus', label: banglaLabels.phosphorus, icon: icons.phosphorus, unit: 'mg/kg' },
                        { key: 'potassium', label: banglaLabels.potassium, icon: icons.potassium, unit: 'mg/kg' },
                        { key: 'temperature', label: banglaLabels.temperature, icon: icons.temperature, unit: '°C' },
                        { key: 'humidity', label: banglaLabels.humidity, icon: icons.humidity, unit: '%' },
                        { key: 'ph', label: banglaLabels.ph, icon: icons.ph, unit: '' },
                        { key: 'conductivity', label: banglaLabels.conductivity, icon: icons.conductivity, unit: 'µS/mm' }
                      ].map(({ key, label, icon, unit }) => {
                        const value = sensorData[key];
                        const color = getValueColor(key, value);
                        
                        // Convert conductivity from µS/cm to µS/mm (divide by 100)
                        const displayValue = key === 'conductivity' && value !== null && value !== undefined
                          ? (value / 100).toFixed(3)
                          : value !== null && value !== undefined ? value.toFixed(2) : 'N/A';
                        
                        return (
                          <Col md={6} lg={4} key={key}>
                            <Card 
                              className={`border-0 h-100 bg-${color}-subtle`}
                              style={{ 
                                borderRadius: '20px',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.18)'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                              <Card.Body className="text-center p-4">
                                <div style={{ fontSize: '3rem', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))' }} className="mb-3">
                                  {icon}
                                </div>
                                <h6 className="text-muted mb-3 fw-semibold" style={{ fontSize: '0.9rem' }}>{label}</h6>
                                <h2 className={`fw-bold text-${color} mb-0`} style={{ fontSize: '2rem' }}>
                                  {displayValue}
                                  <small className="fs-5 ms-2 text-muted">{unit}</small>
                                </h2>
                              </Card.Body>
                            </Card>
                          </Col>
                        );
                      })}
                    </Row>
                  </div>

                  {/* Action Buttons */}
                  <Row className="mb-5">
                    <Col className="text-center">
                      <div className="d-flex gap-3 justify-content-center flex-wrap">
                        <Button 
                          variant="success" 
                          size="lg"
                          onClick={handleUseForRecommendation}
                          style={{
                            borderRadius: '15px',
                            fontWeight: '700',
                            padding: '1.2rem 2.5rem',
                            fontSize: '1.1rem',
                            boxShadow: '0 10px 30px rgba(17, 153, 142, 0.4)',
                            border: 'none',
                            background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-3px)';
                            e.target.style.boxShadow = '0 15px 40px rgba(17, 153, 142, 0.5)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 10px 30px rgba(17, 153, 142, 0.4)';
                          }}
                        >
                          🌾 ফসল সুপারিশের জন্য ব্যবহার করুন
                        </Button>
                        <Button 
                          variant="primary" 
                          size="lg"
                          onClick={copyAverageValues}
                          style={{
                            borderRadius: '15px',
                            fontWeight: '700',
                            padding: '1.2rem 2.5rem',
                            fontSize: '1.1rem',
                            boxShadow: '0 10px 30px rgba(0, 114, 255, 0.4)',
                            border: 'none',
                            background: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-3px)';
                            e.target.style.boxShadow = '0 15px 40px rgba(0, 114, 255, 0.5)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 10px 30px rgba(0, 114, 255, 0.4)';
                          }}
                        >
                          📋 মানগুলো কপি করুন
                        </Button>
                      </div>
                    </Col>
                  </Row>

                  {/* Recent Readings Table - Real-time data */}
                  {readings.length > 0 && (
                    <div className="mt-5">
                      <h3 className="text-center mb-4 fw-bold" style={{ color: '#0072ff' }}>
                        📊 সাম্প্রতিক রিডিং (রিয়েল-টাইম)
                      </h3>
                      <div className="table-responsive" style={{ borderRadius: '15px', overflow: 'hidden' }}>
                        <Table striped hover className="mb-0">
                          <thead style={{ background: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)', color: 'white' }}>
                            <tr>
                              <th>#</th>
                              <th>N</th>
                              <th>P</th>
                              <th>K</th>
                              <th>তাপমাত্রা</th>
                              <th>আর্দ্রতা</th>
                              <th>pH</th>
                              <th>EC</th>
                              <th>সময়</th>
                            </tr>
                          </thead>
                          <tbody>
                            {readings.map((reading, index) => (
                              <tr key={reading.id}>
                                <td>
                                  <Badge bg={index === 0 ? "success" : "secondary"}>
                                    {index === 0 ? "সর্বশেষ" : `#${index + 1}`}
                                  </Badge>
                                </td>
                                <td className="fw-bold">{reading.nitrogen?.toFixed(1) || 'N/A'}</td>
                                <td className="fw-bold">{reading.phosphorus?.toFixed(1) || 'N/A'}</td>
                                <td className="fw-bold">{reading.potassium?.toFixed(1) || 'N/A'}</td>
                                <td className="fw-bold">{reading.temperature?.toFixed(1) || 'N/A'}°C</td>
                                <td className="fw-bold">{reading.humidity?.toFixed(1) || 'N/A'}%</td>
                                <td className="fw-bold">{reading.ph?.toFixed(2) || 'N/A'}</td>
                                <td className="fw-bold">
                                  {reading.conductivity 
                                    ? (reading.conductivity / 100).toFixed(3) 
                                    : 'N/A'}
                                </td>
                                <td style={{ fontSize: '0.85rem' }}>
                                  {formatTimestamp(reading.timestamp)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                      <div className="text-center mt-3">
                        <Badge bg="success" className="px-3 py-2" style={{ fontSize: '0.9rem' }}>
                          ⚡ লাইভ আপডেট · মোট {readings.length} টি রিডিং
                        </Badge>
                      </div>
                    </div>
                  )}
                </>
              )}
            </Card.Body>
          </Card>

          {/* Info Card */}
          <Card className="mt-4 border-0 shadow-sm rounded-4">
            <Card.Body className="p-4">
              <h5 className="fw-bold mb-3 text-info">
                <i className="bi bi-info-circle-fill me-2"></i>
                তথ্য
              </h5>
              <ul className="mb-0 list-unstyled">
                <li className="mb-2 d-flex align-items-start">
                  <Badge bg="info" className="me-2 mt-1 rounded-circle" style={{width: '8px', height: '8px', padding: '4px'}}></Badge>
                  <span>এই ড্যাশবোর্ড ESP8266 থেকে Firebase Realtime Database এর মাধ্যমে লাইভ ডাটা দেখায়</span>
                </li>
                <li className="mb-2 d-flex align-items-start">
                  <Badge bg="info" className="me-2 mt-1 rounded-circle" style={{width: '8px', height: '8px', padding: '4px'}}></Badge>
                  <span>সেন্সর ডাটা প্রতি ৫ সেকেন্ডে স্বয়ংক্রিয়ভাবে আপডেট হয়</span>
                </li>
                <li className="mb-2 d-flex align-items-start">
                  <Badge bg="success" className="me-2 mt-1"></Badge>
                  <span>সবুজ = অনুকূল মান</span>
                  <Badge bg="warning" className="mx-2 mt-1"></Badge>
                  <span>হলুদ = সতর্কতা</span>
                  <Badge bg="danger" className="mx-2 mt-1"></Badge>
                  <span>লাল = সমস্যা</span>
                </li>
                <li className="mb-2 d-flex align-items-start">
                  <Badge bg="info" className="me-2 mt-1 rounded-circle" style={{width: '8px', height: '8px', padding: '4px'}}></Badge>
                  <span>"ফসল সুপারিশের জন্য ব্যবহার করুন" বোতামে ক্লিক করে সরাসরি ফসল সুপারিশ পেজে যান</span>
                </li>
                <li className="d-flex align-items-start">
                  <Badge bg="info" className="me-2 mt-1 rounded-circle" style={{width: '8px', height: '8px', padding: '4px'}}></Badge>
                  <span>ESP8266 WiFi নেটওয়ার্ক: <Badge bg="dark" className="ms-1">npkSensor</Badge></span>
                </li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default RealTimeDashboard;
