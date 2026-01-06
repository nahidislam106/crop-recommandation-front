import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Badge } from "react-bootstrap";
import { auth } from "./firebase";
import { useLocation } from "react-router-dom";

// Import crop images
import Rice from "./cropImages/rice.jpg";
import Maize from "./cropImages/maize.jpg";
import Chickpea from "./cropImages/chickpea.jpg";
import Kidneybeans from "./cropImages/kidneybeans.jpg";
import Pigeonpeas from "./cropImages/pigeonpeas.jpg";
import Mothbeans from "./cropImages/mothbeans.jpg";
import Mungbean from "./cropImages/mungbean.jpg";
import Blackgram from "./cropImages/blackgram.jpg";
import Lentil from "./cropImages/lentil.jpg";
import Pomegranate from "./cropImages/pomegranate.jpg";
import Banana from "./cropImages/banana.jpg";
import Mango from "./cropImages/mango.jpg";
import Grapes from "./cropImages/grapes.jpg";
import Watermelon from "./cropImages/watermelon.jpg";
import Muskmelon from "./cropImages/muskmelon.jpg";
import Apple from "./cropImages/apple.jpg";
import Orange from "./cropImages/orange.jpg";
import Papaya from "./cropImages/papaya.jpg";
import Coconut from "./cropImages/coconut.jpg";
import Cotton from "./cropImages/cotton.jpg";
import Jute from "./cropImages/jute.jpg";
import Coffee from "./cropImages/coffee.jpg";

const cropMap = {
  Rice: { name: "চাল", img: Rice },
  Maize: { name: "ভুট্টা", img: Maize },
  Chickpea: { name: "ছোলা", img: Chickpea },
  Kidneybeans: { name: "রাজমা", img: Kidneybeans },
  Pigeonpeas: { name: "টিংরা", img: Pigeonpeas },
  Mothbeans: { name: "মটর", img: Mothbeans },
  Mungbean: { name: "মুগডাল", img: Mungbean },
  Blackgram: { name: "কালো ছোলা", img: Blackgram },
  Lentil: { name: "মসুর ডাল", img: Lentil },
  Pomegranate: { name: "ডালিম", img: Pomegranate },
  Banana: { name: "কলা", img: Banana },
  Mango: { name: "আম", img: Mango },
  Grapes: { name: "আঙুর", img: Grapes },
  Watermelon: { name: "তরমুজ", img: Watermelon },
  Muskmelon: { name: "খরবুজ", img: Muskmelon },
  Apple: { name: "আপেল", img: Apple },
  Orange: { name: "কমলা", img: Orange },
  Papaya: { name: "পেঁপে", img: Papaya },
  Coconut: { name: "নারকেল", img: Coconut },
  Cotton: { name: "কটন", img: Cotton },
  Jute: { name: "পাট", img: Jute },
  Coffee: { name: "কফি", img: Coffee },
};

const banglaLabels = {
  N: "নাইট্রোজেন (N)",
  P: "ফসফরাস (P)",
  K: "পটাশিয়াম (K)",
  temperature: "তাপমাত্রা (°C)",
  humidity: "আর্দ্রতা (%)",
  pH: "পিএইচ (pH)",
  EC: "ইলেকট্রনিক পরিবাহিতা (EC)"
};

function MainPage() {
  const [formData, setFormData] = useState({
    N: "", P: "", K: "", temperature: "", humidity: "", pH: "", EC: ""
  });
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [isFromSensor, setIsFromSensor] = useState(false);
  const location = useLocation();

  // Check if coming from sensor page
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('fromSensor') === 'true') {
      setIsFromSensor(true);
      
      // Load sensor data from localStorage
      const sensorData = localStorage.getItem('sensorDataForRecommendation');
      if (sensorData) {
        try {
          const parsedData = JSON.parse(sensorData);
          const newFormData = {
            N: parsedData.N?.toString() || "",
            P: parsedData.P?.toString() || "",
            K: parsedData.K?.toString() || "",
            temperature: parsedData.temperature?.toString() || "",
            humidity: parsedData.humidity?.toString() || "",
            pH: parsedData.pH?.toString() || "",
            EC: parsedData.EC?.toString() || ""
          };
          setFormData(newFormData);
          setAlertMessage("✅ সেন্সর ডাটা থেকে মানগুলো সফলভাবে লোড হয়েছে!");
          setShowAlert(true);
          
          // Clear the sensor data after using it
          localStorage.removeItem('sensorDataForRecommendation');
        } catch (err) {
          console.error("Error parsing sensor data:", err);
          setAlertMessage("সেন্সর ডাটা লোড করতে সমস্যা হয়েছে।");
          setShowAlert(true);
        }
      }
    }
  }, [location.search]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setShowAlert(false);

    try {
      const res = await fetch("https://backend-c9ek.onrender.com/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      setRecommendations(data["সুপারিশকৃত ফসল"]);
    } catch (err) {
      console.error("Error:", err);
      setAlertMessage("কোনো সমস্যা হয়েছে, ব্যাকএন্ড চালু আছে কি দেখুন!");
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePrediction = () => {
    if (!auth.currentUser) {
      setAlertMessage("লগইন করুন প্রথমে!");
      setShowAlert(true);
      return;
    }

    const land = prompt("ফসলের জমির ঠিকানা লিখুন:");
    if (!land) return;

    const user = auth.currentUser;
    const date = new Date().toLocaleDateString();
    const predictionString = recommendations
      .map(r => `${r.crop} (${Math.round(r.probability * 100)}%)`)
      .join(", ");

    const newEntry = { date, prediction: predictionString };

    const savedPredictions = JSON.parse(localStorage.getItem(`predictions_${user.uid}`)) || {};
    if (!savedPredictions[land]) savedPredictions[land] = [];
    savedPredictions[land].push(newEntry);

    localStorage.setItem(`predictions_${user.uid}`, JSON.stringify(savedPredictions));
    setAlertMessage("Prediction সফলভাবে সংরক্ষিত হয়েছে!");
    setShowAlert(true);
  };

  return (
    <Container>
      <Row className="justify-content-center">
        <Col lg={11} xl={10}>
          <Card className="shadow-lg border-0" style={{ borderRadius: '25px', overflow: 'hidden' }}>
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '2rem',
              textAlign: 'center'
            }}>
              <h1 className="display-5 fw-bold text-white mb-2" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                🌾 ফসল সুপারিশ ব্যবস্থা
              </h1>
              <p className="text-white-50 mb-0">আপনার জমির জন্য সেরা ফসল খুঁজে নিন</p>
              {isFromSensor && (
                <Badge bg="light" text="dark" className="mt-3 px-4 py-2 fs-6">
                  📡 সেন্সর ডাটা থেকে লোড করা হয়েছে
                </Badge>
              )}
            </div>
            
            <Card.Body className="p-4 p-md-5">
              {showAlert && (
                <Alert 
                  variant={alertMessage.includes("সফল") ? "success" : "danger"} 
                  dismissible 
                  onClose={() => setShowAlert(false)}
                  className="mb-4"
                >
                  {alertMessage}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Row className="g-4">
                  {Object.keys(formData).map((key) => (
                    <Col md={6} lg={4} key={key}>
                      <Form.Group>
                        <Form.Label className="fw-semibold d-flex align-items-center gap-2">
                          <span style={{ fontSize: '1.2rem' }}>
                            {key === 'N' && '🧪'}
                            {key === 'P' && '⚗️'}
                            {key === 'K' && '🔥'}
                            {key === 'temperature' && '🌡️'}
                            {key === 'humidity' && '💧'}
                            {key === 'pH' && '🔬'}
                            {key === 'EC' && '⚡'}
                          </span>
                          {banglaLabels[key]}
                        </Form.Label>
                        <Form.Control
                          type="number"
                          name={key}
                          value={formData[key]}
                          onChange={handleChange}
                          step="any"
                          required
                          placeholder={`${banglaLabels[key]} লিখুন`}
                          style={{
                            borderRadius: '12px',
                            padding: '0.875rem 1.25rem',
                            border: '2px solid #e8ecef',
                            fontSize: '1rem'
                          }}
                        />
                      </Form.Group>
                    </Col>
                  ))}
                </Row>
                
                <Row className="mt-5">
                  <Col className="text-center">
                    <Button 
                      type="submit" 
                      variant="success" 
                      size="lg"
                      disabled={loading}
                      className="px-5 py-3"
                      style={{
                        borderRadius: '15px',
                        fontWeight: '700',
                        fontSize: '1.1rem',
                        boxShadow: '0 8px 25px rgba(17, 153, 142, 0.3)',
                        minWidth: '280px'
                      }}
                    >
                      {loading ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            className="me-2"
                          />
                          সুপারিশ করছি...
                        </>
                      ) : (
                        <>🔍 সুপারিশ দেখুন</>
                      )}
                    </Button>
                  </Col>
                </Row>
              </Form>

              {recommendations.length > 0 && (
                <div className="mt-5 pt-4" style={{ borderTop: '2px solid #f0f0f0' }}>
                  <Row className="mb-4">
                    <Col className="text-center">
                      <Button 
                        onClick={handleSavePrediction} 
                        variant="primary"
                        size="lg"
                        className="px-5 py-3"
                        style={{
                          borderRadius: '15px',
                          fontWeight: '700',
                          boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
                        }}
                      >
                        💾 Prediction সংরক্ষণ করুন
                      </Button>
                    </Col>
                  </Row>

                  <div className="text-center mb-4">
                    <h2 className="fw-bold mb-2" style={{
                      background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      fontSize: '2rem'
                    }}>
                      ✅ সুপারিশকৃত ফসলসমূহ
                    </h2>
                    <p className="text-muted">আপনার জমির জন্য সবচেয়ে উপযুক্ত ফসল</p>
                  </div>
                  
                  <Row className="g-4">
                    {recommendations.map((item, index) => (
                      <Col key={index} xs={12} sm={6} md={4} lg={3}>
                        <Card className="h-100 border-0" style={{
                          borderRadius: '20px',
                          overflow: 'hidden',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)'
                        }}>
                          <div className="position-relative" style={{ overflow: 'hidden' }}>
                            <Badge 
                              bg={index === 0 ? "success" : index === 1 ? "info" : "primary"}
                              className="position-absolute top-0 start-0 m-3 px-3 py-2"
                              style={{
                                fontSize: '0.9rem',
                                zIndex: 10,
                                borderRadius: '12px',
                                boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                              }}
                            >
                              #{index + 1} সুপারিশ
                            </Badge>
                            {cropMap[item.crop] && (
                              <Card.Img 
                                variant="top" 
                                src={cropMap[item.crop].img} 
                                alt={item.crop}
                                style={{ 
                                  height: "200px", 
                                  objectFit: "cover",
                                  transition: 'transform 0.3s ease'
                                }}
                                onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                              />
                            )}
                          </div>
                          <Card.Body className="text-center p-4">
                            <Card.Title className="h4 fw-bold mb-3" style={{ color: '#2c3e50' }}>
                              {cropMap[item.crop]?.name || item.crop}
                            </Card.Title>
                            <div className="d-flex flex-column gap-2">
                              <Badge 
                                bg="light" 
                                text="dark" 
                                className="py-2 px-3"
                                style={{ 
                                  fontSize: '1rem',
                                  borderRadius: '12px',
                                  border: '2px solid #e8ecef'
                                }}
                              >
                                সঠিকতা: {Math.round(item.probability * 100)}%
                              </Badge>
                              <div style={{
                                width: '100%',
                                height: '8px',
                                background: '#e8ecef',
                                borderRadius: '10px',
                                overflow: 'hidden'
                              }}>
                                <div style={{
                                  width: `${item.probability * 100}%`,
                                  height: '100%',
                                  background: 'linear-gradient(90deg, #11998e 0%, #38ef7d 100%)',
                                  borderRadius: '10px',
                                  transition: 'width 1s ease'
                                }}></div>
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default MainPage;
