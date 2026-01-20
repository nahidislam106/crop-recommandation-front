import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Container, Row, Col, Badge, Button } from 'react-bootstrap';
import { auth, database } from './firebase';
import { ref, onValue } from 'firebase/database';

function Dashboard() {
  const [userName, setUserName] = useState("");
  const [sensorData, setSensorData] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [savedPredictions, setSavedPredictions] = useState([]);
  const [totalPredictions, setTotalPredictions] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = auth.currentUser;

    // Load user name from profile
    if (currentUser) {
      const savedProfile = JSON.parse(localStorage.getItem(`profile_${currentUser.uid}`));
      if (savedProfile && savedProfile.name) {
        setUserName(savedProfile.name);
      } else {
        setUserName(currentUser.email?.split('@')[0]);
      }
    }

    // Load sensor data from Firebase
    const sensorRef = ref(database, 'npkSensor/current');
    const unsubscribe = onValue(sensorRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setSensorData(data);
      }
    });

    // Generate weather data
    const weather = generateWeatherData();
    setWeatherData(weather);

    // Load saved predictions
    if (currentUser) {
      try {
        const predictions = JSON.parse(localStorage.getItem(`predictions_${currentUser.uid}`));
        if (predictions && typeof predictions === 'object') {
          // predictions is an object with land keys, convert to array
          const allPredictions = [];
          Object.keys(predictions).forEach(landKey => {
            if (Array.isArray(predictions[landKey])) {
              allPredictions.push(...predictions[landKey]);
            }
          });
          // Set total count
          setTotalPredictions(allPredictions.length);
          // Sort by timestamp (newest first) and get last 3
          const sortedPredictions = allPredictions.sort((a, b) => 
            new Date(b.timestamp || 0) - new Date(a.timestamp || 0)
          );
          setSavedPredictions(sortedPredictions.slice(0, 3));
        } else {
          setSavedPredictions([]);
          setTotalPredictions(0);
        }
      } catch (error) {
        console.error('Error loading predictions:', error);
        setSavedPredictions([]);
        setTotalPredictions(0);
      }
    }

    return () => unsubscribe();
  }, []);

  const generateWeatherData = () => {
    const currentHour = new Date().getHours();
    const baseTemp = currentHour >= 12 && currentHour <= 16 ? 20 : 19;
    const temperature = (baseTemp + (Math.random() * 3 - 1.5)).toFixed(1);
    const humidity = (60 + Math.random() * 30).toFixed(1);
    
    // Add light intensity based on time
    let lightIntensity;
    if (currentHour >= 6 && currentHour <= 18) {
      lightIntensity = (10000 + Math.random() * 90000).toFixed(0);
    } else {
      lightIntensity = (Math.random() * 1000).toFixed(0);
    }
    
    const pressure = (1000 + Math.random() * 20).toFixed(1);
    
    return {
      temperature: parseFloat(temperature),
      humidity: parseFloat(humidity),
      lightIntensity: parseInt(lightIntensity),
      pressure: parseFloat(pressure)
    };
  };

  return (
    <Container fluid className="py-4">
      <div className="mb-5 text-center">
        <h1 className="display-5 fw-bold text-dark mb-2">
          কৃষি বিশ্লেষক ড্যাশবোর্ড
        </h1>
        <p className="lead text-muted">
          স্বাগতম, {userName}! আপনার কৃষি তথ্য এক নজরে দেখুন
        </p>
      </div>

      {/* Overview Cards */}
      <Row className="g-4 mb-4">
        {/* Sensor Data Card */}
        <Col md={4}>
          <Card className="h-100 border-0 shadow-sm" style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}>
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h6 className="text-white-50 mb-2">রিয়েল-টাইম সেন্সর</h6>
                  <h3 className="fw-bold mb-0">NPK মনিটরিং</h3>
                </div>
                <div className="bg-white bg-opacity-25 rounded-3 p-3">
                  <i className="bi bi-broadcast fs-3"></i>
                </div>
              </div>
              
              {sensorData ? (
                <div className="mb-3">
                  <small className="d-block text-white-50 mb-2">সেন্সর পরামিতি</small>
                  <div className="row g-2">
                    <div className="col-4">
                      <div className="bg-white bg-opacity-25 rounded-2 p-2 text-center">
                        <small className="d-block text-white-50" style={{fontSize: '0.7rem'}}>N</small>
                        <strong>{sensorData.nitrogen?.toFixed(0)}</strong>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="bg-white bg-opacity-25 rounded-2 p-2 text-center">
                        <small className="d-block text-white-50" style={{fontSize: '0.7rem'}}>P</small>
                        <strong>{sensorData.phosphorus?.toFixed(0)}</strong>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="bg-white bg-opacity-25 rounded-2 p-2 text-center">
                        <small className="d-block text-white-50" style={{fontSize: '0.7rem'}}>K</small>
                        <strong>{sensorData.potassium?.toFixed(0)}</strong>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="bg-white bg-opacity-25 rounded-2 p-2 text-center">
                        <small className="d-block text-white-50" style={{fontSize: '0.7rem'}}>Temp</small>
                        <strong>{sensorData.temperature?.toFixed(1)}°</strong>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="bg-white bg-opacity-25 rounded-2 p-2 text-center">
                        <small className="d-block text-white-50" style={{fontSize: '0.7rem'}}>Hum</small>
                        <strong>{sensorData.humidity?.toFixed(0)}%</strong>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="bg-white bg-opacity-25 rounded-2 p-2 text-center">
                        <small className="d-block text-white-50" style={{fontSize: '0.7rem'}}>pH</small>
                        <strong>{sensorData.ph?.toFixed(1)}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="small text-white-50 mb-3">সেন্সর ডাটা লোড হচ্ছে...</p>
              )}
              
              <Button 
                variant="light" 
                size="sm" 
                className="w-100 fw-semibold"
                onClick={() => navigate('/sensor')}
              >
                বিস্তারিত দেখুন <i className="bi bi-arrow-right ms-2"></i>
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* Weather Data Card */}
        <Col md={4}>
          <Card className="h-100 border-0 shadow-sm" style={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white'
          }}>
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h6 className="text-white-50 mb-2">মাইক্রোক্লাইমেট</h6>
                  <h3 className="fw-bold mb-0">
                    {weatherData?.temperature}°C
                  </h3>
                </div>
                <div className="bg-white bg-opacity-25 rounded-3 p-3">
                  <i className="bi bi-cloud-sun fs-3"></i>
                </div>
              </div>
              <div className="mb-3">
                <small className="d-block text-white-50 mb-2">আবহাওয়া পরামিতি</small>
                <div className="row g-2">
                  <div className="col-6">
                    <div className="bg-white bg-opacity-25 rounded-2 p-2">
                      <small className="d-block text-white-50" style={{fontSize: '0.7rem'}}>আর্দ্রতা</small>
                      <strong>{weatherData?.humidity}%</strong>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="bg-white bg-opacity-25 rounded-2 p-2">
                      <small className="d-block text-white-50" style={{fontSize: '0.7rem'}}>আলো</small>
                      <strong>{weatherData?.lightIntensity} Lux</strong>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="bg-white bg-opacity-25 rounded-2 p-2">
                      <small className="d-block text-white-50" style={{fontSize: '0.7rem'}}>বায়ুচাপ</small>
                      <strong>{weatherData?.pressure} hPa</strong>
                    </div>
                  </div>
                </div>
              </div>
              
              <Button 
                variant="light" 
                size="sm" 
                className="w-100 fw-semibold"
                onClick={() => navigate('/microclimate')}
              >
                বিস্তারিত দেখুন <i className="bi bi-arrow-right ms-2"></i>
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* Predictions Card */}
        <Col md={4}>
          <Card className="h-100 border-0 shadow-sm" style={{
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white'
          }}>
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h6 className="text-white-50 mb-2">ফসল বিশ্লেষণ</h6>
                  <h3 className="fw-bold mb-0">{totalPredictions}</h3>
                  <small className="text-white-50">সংরক্ষিত সুপারিশ</small>
                </div>
                <div className="bg-white bg-opacity-25 rounded-3 p-3">
                  <i className="bi bi-graph-up fs-3"></i>
                </div>
              </div>
              
              {savedPredictions.length > 0 ? (
                <div className="mb-3">
                  <small className="d-block text-white-50 mb-2">সর্বশেষ বিশ্লেষণ</small>
                  {savedPredictions.map((pred, idx) => {
                    // Parse the prediction string to get the top crop
                    const topCrop = pred.prediction ? pred.prediction.split(',')[0].trim() : 'N/A';
                    return (
                      <div key={idx} className="bg-white bg-opacity-25 rounded-2 p-2 mb-2">
                        <div className="fw-semibold text-center">{topCrop}</div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="small text-white-50 mb-3">এখনও কোনো বিশ্লেষণ নেই</p>
              )}
              
              <Button 
                variant="light" 
                size="sm" 
                className="w-100 fw-semibold"
                onClick={() => navigate('/recommendation')}
              >
                নতুন বিশ্লেষণ করুন <i className="bi bi-arrow-right ms-2"></i>
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row className="g-4 mb-4">
        <Col md={12}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <h5 className="fw-bold mb-4">
                <i className="bi bi-lightning-charge text-warning me-2"></i>
                দ্রুত অ্যাক্সেস
              </h5>
              <Row className="g-3">
                <Col md={3}>
                  <Button 
                    variant="outline-primary" 
                    className="w-100 py-3"
                    onClick={() => navigate('/sensor')}
                  >
                    <i className="bi bi-broadcast d-block fs-3 mb-2"></i>
                    <span className="fw-semibold">সেন্সর মনিটর</span>
                  </Button>
                </Col>
                <Col md={3}>
                  <Button 
                    variant="outline-info" 
                    className="w-100 py-3"
                    onClick={() => navigate('/microclimate')}
                  >
                    <i className="bi bi-cloud-sun d-block fs-3 mb-2"></i>
                    <span className="fw-semibold">আবহাওয়া</span>
                  </Button>
                </Col>
                <Col md={3}>
                  <Button 
                    variant="outline-success" 
                    className="w-100 py-3"
                    onClick={() => navigate('/recommendation')}
                  >
                    <i className="bi bi-graph-up d-block fs-3 mb-2"></i>
                    <span className="fw-semibold">ফসল সুপারিশ</span>
                  </Button>
                </Col>
                <Col md={3}>
                  <Button 
                    variant="outline-secondary" 
                    className="w-100 py-3"
                    onClick={() => navigate('/profile')}
                  >
                    <i className="bi bi-person d-block fs-3 mb-2"></i>
                    <span className="fw-semibold">আমার প্রোফাইল</span>
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Activity */}
      {savedPredictions.length > 0 && (
        <Row className="g-4">
          <Col md={12}>
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-4">
                <h5 className="fw-bold mb-4">
                  <i className="bi bi-clock-history text-info me-2"></i>
                  সাম্প্রতিক কার্যক্রম
                </h5>
                <div className="list-group list-group-flush">
                  {savedPredictions.map((pred, idx) => {
                    const topCrop = pred.prediction ? pred.prediction.split(',')[0].trim() : 'N/A';
                    // Parse top 4 crops with percentages
                    const allCrops = pred.prediction ? pred.prediction.split(',').map(c => c.trim()) : [];
                    const top4Crops = allCrops.slice(0, 4);
                    
                    return (
                      <div key={idx} className="list-group-item border-0 px-0 py-3">
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <h6 className="mb-2 fw-semibold">{topCrop}</h6>
                            <small className="text-muted d-block mb-2">
                              <i className="bi bi-geo-alt me-1"></i>
                              {pred.landDetails?.landName} - {pred.landDetails?.village}, {pred.landDetails?.district}
                            </small>
                            <div className="d-flex flex-wrap gap-2">
                              {top4Crops.map((crop, cropIdx) => (
                                <Badge 
                                  key={cropIdx} 
                                  bg={cropIdx === 0 ? "success" : "secondary"} 
                                  className="px-2 py-1"
                                >
                                  {crop}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <Badge bg="info" className="px-3 py-2 ms-3">
                            <i className="bi bi-calendar3 me-1"></i>
                            {pred.date}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Daily Tips */}
      <Row className="g-4 mt-2">
        <Col md={12}>
          <Card className="border-0 shadow-sm bg-light">
            <Card.Body className="p-4">
              <h5 className="fw-bold mb-3">
                <i className="bi bi-lightbulb text-warning me-2"></i>
                আজকের পরামর্শ
              </h5>
              <p className="mb-0 text-muted">
                নিয়মিত মাটি পরীক্ষা করুন এবং NPK মাত্রা পর্যবেক্ষণ করুন। সঠিক পুষ্টি ভারসাম্য 
                ভালো ফলনের জন্য অত্যন্ত গুরুত্বপূর্ণ। আবহাওয়ার পূর্বাভাস অনুযায়ী সেচ দিন।
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Dashboard;
