import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Badge, Modal } from "react-bootstrap";
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
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [landDetails, setLandDetails] = useState({
    landName: "",
    village: "",
    district: "",
    details: ""
  });
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
    
    // Show modal for land details
    setShowSaveModal(true);
  };

  const handleSaveConfirm = () => {
    if (!landDetails.landName || !landDetails.village || !landDetails.district) {
      setAlertMessage("জমির নাম, গ্রাম এবং জেলা অবশ্যই দিতে হবে!");
      setShowAlert(true);
      return;
    }

    const user = auth.currentUser;
    const date = new Date().toLocaleDateString('bn-BD');
    const predictionString = recommendations
      .map(r => `${r.crop} (${Math.round(r.probability * 100)}%)`)
      .join(", ");

    const newEntry = { 
      date, 
      prediction: predictionString,
      landDetails: { ...landDetails },
      sensorData: { ...formData }
    };

    const landKey = `${landDetails.landName} - ${landDetails.village}, ${landDetails.district}`;
    const savedPredictions = JSON.parse(localStorage.getItem(`predictions_${user.uid}`)) || {};
    if (!savedPredictions[landKey]) savedPredictions[landKey] = [];
    savedPredictions[landKey].push(newEntry);

    localStorage.setItem(`predictions_${user.uid}`, JSON.stringify(savedPredictions));
    
    setAlertMessage("✅ ফসলের তথ্য সফলভাবে সংরক্ষিত হয়েছে!");
    setShowAlert(true);
    setShowSaveModal(false);
    
    // Reset land details
    setLandDetails({
      landName: "",
      village: "",
      district: "",
      details: ""
    });
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col lg={10} xl={9}>
          {/* Hero Header */}
          <div className="text-center mb-5">
            <h1 className="display-4 fw-bold text-dark mb-3">
              <span className="text-success me-2">🌾</span>
              ফসল সুপারিশ সিস্টেম
            </h1>
            <p className="lead text-muted mb-4">
              AI-চালিত মাটি বিশ্লেষণ ও ফসল পরামর্শ
            </p>
            {isFromSensor && (
              <Badge bg="success" className="px-4 py-2 rounded-pill fs-6">
                <i className="bi bi-broadcast me-2"></i>
                সেন্সর থেকে লোড করা হয়েছে
              </Badge>
            )}
          </div>

          {/* Main Card */}
          <Card className="shadow-sm border-0 rounded-4 mb-4">
            <Card.Body className="p-4 p-lg-5">
              {showAlert && (
                <Alert 
                  variant={alertMessage.includes("সফল") ? "success" : "danger"} 
                  dismissible 
                  onClose={() => setShowAlert(false)}
                  className="mb-4 d-flex align-items-center rounded-3 shadow-sm"
                >
                  <i className="bi bi-{alertMessage.includes('সফল') ? 'check-circle-fill' : 'exclamation-triangle-fill'} me-2 fs-5"></i>
                  <span>{alertMessage}</span>
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <h5 className="fw-bold text-dark mb-3">
                    <i className="bi bi-clipboard-data text-primary me-2"></i>
                    মাটির তথ্য প্রদান করুন
                  </h5>
                </div>
                <Row className="g-3">
                  {Object.keys(formData).map((key) => (
                    <Col md={6} lg={4} key={key}>
                      <Form.Group className="mb-0">
                        <Form.Label className="fw-semibold text-secondary small mb-2">
                          <span className="me-2">
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
                          className="border-2 py-2 px-3"
                          style={{
                            borderRadius: '0.5rem',
                            borderColor: '#e2e8f0',
                            transition: 'all 0.2s'
                          }}
                        />
                      </Form.Group>
                    </Col>
                  ))}
                </Row>
                
                {/* Helpful Tips */}
                <Card className="bg-light border-0 mt-4 mb-4">
                  <Card.Body>
                    <div className="d-flex align-items-start">
                      <div className="text-success me-3 fs-2">
                        <i className="bi bi-lightbulb-fill"></i>
                      </div>
                      <div className="flex-grow-1">
                        <h6 className="fw-bold text-dark mb-3">সহায়ক পরামর্শ</h6>
                        <div className="row g-3">
                          <div className="col-md-4">
                            <div className="d-flex align-items-center">
                              <Badge bg="success" className="me-2 rounded-circle p-2" style={{width: '8px', height: '8px'}}></Badge>
                              <small className="text-muted">NPK সেন্সর ব্যবহার করুন</small>
                            </div>
                          </div>
                          <div className="col-md-4">
                            <div className="d-flex align-items-center">
                              <Badge bg="success" className="me-2 rounded-circle p-2" style={{width: '8px', height: '8px'}}></Badge>
                              <small className="text-muted">নিয়মিত মাটি পরীক্ষা</small>
                            </div>
                          </div>
                          <div className="col-md-4">
                            <div className="d-flex align-items-center">
                              <Badge bg="success" className="me-2 rounded-circle p-2" style={{width: '8px', height: '8px'}}></Badge>
                              <small className="text-muted">তথ্য সংরক্ষণ করুন</small>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
                
                <div className="text-center mt-4">
                  <Button 
                    type="submit" 
                    variant="success"
                    size="lg"
                    disabled={loading}
                    className="px-5 py-3 fw-bold rounded-pill shadow-sm"
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
                          বিশ্লেষণ করা হচ্ছে...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-search me-2"></i>
                          ফসল বিশ্লেষণ করুন
                        </>
                      )}
                    </Button>
                  </div>
                </Form>

              {recommendations.length > 0 && (
                <div className="mt-5">
                  <hr className="my-5" />
                  
                  {/* Save Button */}
                  <div className="text-center mb-4">
                    <Button 
                      onClick={handleSavePrediction} 
                      variant="primary"
                      className="px-4 py-2 fw-semibold rounded-pill shadow-sm"
                    >
                      <i className="bi bi-save me-2"></i>
                      ফলাফল সংরক্ষণ করুন
                    </Button>
                  </div>

                  {/* Results Header */}
                  <div className="text-center mb-4">
                    <Badge bg="success" className="px-4 py-2 rounded-pill mb-3">
                      <i className="bi bi-check-circle me-2"></i>
                      বিশ্লেষণ সম্পন্ন
                    </Badge>
                    <h2 className="fw-bold text-dark mb-2">
                      <i className="bi bi-award text-warning me-2"></i>
                      সুপারিশকৃত ফসল
                    </h2>
                    <p className="text-muted">আপনার মাটির জন্য সর্বোচ্চ উপযুক্ত</p>
                  </div>
                  
                  <Row className="g-4">
                    {recommendations.map((item, index) => (
                      <Col key={index} xs={12} sm={6} lg={4} xl={3}>
                        <Card className="h-100 border-0 shadow-sm rounded-3 overflow-hidden" style={{
                          transition: 'transform 0.2s, box-shadow 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-8px)';
                          e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '';
                        }}>
                          <div className="position-relative">
                            <Badge 
                              bg={index === 0 ? "success" : index === 1 ? "primary" : "secondary"}
                              className="position-absolute top-0 end-0 m-3 px-3 py-2 rounded-pill"
                              style={{ zIndex: 10 }}
                            >
                              #{index + 1}
                            </Badge>
                            {cropMap[item.crop] && (
                              <Card.Img 
                                variant="top" 
                                src={cropMap[item.crop].img} 
                                alt={item.crop}
                                style={{ 
                                  height: "200px", 
                                  objectFit: "cover"
                                }}
                              />
                            )}
                          </div>
                          <Card.Body className="text-center p-3">
                            <h5 className="fw-bold text-dark mb-3">
                              {cropMap[item.crop]?.name || item.crop}
                            </h5>
                            <div className="mb-3">
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <small className="text-muted">সফলতার হার</small>
                                <Badge bg="light" text="dark" className="fw-semibold">
                                  {Math.round(item.probability * 100)}%
                                </Badge>
                              </div>
                              <div className="progress" style={{ height: '10px' }}>
                                <div 
                                  className="progress-bar bg-success" 
                                  role="progressbar" 
                                  style={{ width: `${item.probability * 100}%` }}
                                  aria-valuenow={item.probability * 100} 
                                  aria-valuemin="0" 
                                  aria-valuemax="100"
                                ></div>
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

      {/* Save Prediction Modal */}
      <Modal show={showSaveModal} onHide={() => setShowSaveModal(false)} centered size="lg">
        <Modal.Header closeButton style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <Modal.Title className="fw-bold">
            🏞️ জমির বিস্তারিত তথ্য
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Card className="border-0 bg-light p-4 mb-4">
            <h5 className="fw-bold mb-3" style={{ color: '#667eea' }}>
              📍 জমির ঠিকানা
            </h5>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">জমির নাম/পরিচিতি *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="যেমন: উত্তরের জমি, পুকুর পাড়ের জমি"
                    value={landDetails.landName}
                    onChange={(e) => setLandDetails({...landDetails, landName: e.target.value})}
                    required
                    style={{ borderRadius: '10px', padding: '0.75rem' }}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">গ্রাম/এলাকা *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="গ্রামের নাম"
                    value={landDetails.village}
                    onChange={(e) => setLandDetails({...landDetails, village: e.target.value})}
                    required
                    style={{ borderRadius: '10px', padding: '0.75rem' }}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">জেলা *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="জেলার নাম"
                    value={landDetails.district}
                    onChange={(e) => setLandDetails({...landDetails, district: e.target.value})}
                    required
                    style={{ borderRadius: '10px', padding: '0.75rem' }}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">জমির আকার (ঐচ্ছিক)</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="যেমন: ২ বিঘা, ১ একর"
                    value={landDetails.details}
                    onChange={(e) => setLandDetails({...landDetails, details: e.target.value})}
                    style={{ borderRadius: '10px', padding: '0.75rem' }}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Card>

          <Alert variant="info" className="mb-0" style={{ borderRadius: '12px' }}>
            <div className="d-flex align-items-start gap-2">
              <span style={{ fontSize: '1.5rem' }}>💡</span>
              <div>
                <strong>টিপস:</strong> জমির নাম এমনভাবে দিন যেন পরে চিনতে সুবিধা হয়। যেমন: "বাড়ির পিছনের জমি", "পুকুর পাড়ের জমি" ইত্যাদি।
              </div>
            </div>
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowSaveModal(false)}
            style={{ borderRadius: '10px', padding: '0.6rem 1.5rem' }}
          >
            বাতিল
          </Button>
          <Button 
            variant="success" 
            onClick={handleSaveConfirm}
            style={{ 
              borderRadius: '10px', 
              padding: '0.6rem 1.5rem',
              fontWeight: 'bold',
              boxShadow: '0 4px 15px rgba(17, 153, 142, 0.3)'
            }}
          >
            💾 সংরক্ষণ করুন
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default MainPage;
