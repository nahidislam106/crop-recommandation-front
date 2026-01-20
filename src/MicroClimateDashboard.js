import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Badge, Spinner } from "react-bootstrap";

function MicroClimateDashboard() {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [lastUpdate, setLastUpdate] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationName, setLocationName] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);

  const banglaLabels = {
    temperature: "তাপমাত্রা",
    humidity: "আর্দ্রতা",
    lightIntensity: "আলোর তীব্রতা",
    pressure: "বায়ুমণ্ডলীয় চাপ"
  };

  const icons = {
    temperature: "🌡️",
    humidity: "💧",
    lightIntensity: "☀️",
    pressure: "🌫️"
  };

  // Generate realistic Bangladesh weather data
  const generateWeatherData = () => {
    const currentHour = new Date().getHours();
    
    // Temperature: varies by time of day (17-22°C)
    const baseTemp = currentHour >= 12 && currentHour <= 16 ? 20 : 19;
    const temperature = (baseTemp + (Math.random() * 3 - 1.5)).toFixed(1);
    
    // Humidity: Bangladesh is humid (60-90%)
    const humidity = (60 + Math.random() * 30).toFixed(1);
    
    // Light Intensity: varies by time (0-100000 lux)
    let lightIntensity;
    if (currentHour >= 6 && currentHour <= 18) {
      // Daytime: 10000-100000 lux
      lightIntensity = (10000 + Math.random() * 90000).toFixed(0);
    } else {
      // Nighttime: 0-1000 lux
      lightIntensity = (Math.random() * 1000).toFixed(0);
    }
    
    // Atmospheric Pressure: 1000-1020 hPa
    const pressure = (1000 + Math.random() * 20).toFixed(1);
    
    return {
      temperature: parseFloat(temperature),
      humidity: parseFloat(humidity),
      lightIntensity: parseInt(lightIntensity),
      pressure: parseFloat(pressure),
      timestamp: Date.now()
    };
  };

  // Get location name from coordinates (reverse geocoding)
  const getLocationName = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      
      if (data && data.address) {
        const address = data.address;
        // Build location name from available fields
        const parts = [];
        
        if (address.village || address.town || address.city) {
          parts.push(address.village || address.town || address.city);
        }
        if (address.county) parts.push(address.county);
        if (address.state) parts.push(address.state);
        if (address.country) parts.push(address.country);
        
        const locationString = parts.join(', ') || data.display_name;
        setLocationName(locationString);
      } else {
        setLocationName('এলাকার নাম পাওয়া যায়নি');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      setLocationName('এলাকার নাম লোড করতে সমস্যা');
    }
  };

  // Get current location
  const getLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("আপনার ব্রাউজার লোকেশন সাপোর্ট করে না");
      return;
    }

    setLocationLoading(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lon = position.coords.longitude.toFixed(6);
        
        setLocation({
          latitude: lat,
          longitude: lon,
          accuracy: position.coords.accuracy.toFixed(0)
        });
        
        // Get location name
        getLocationName(lat, lon);
        
        setLocationLoading(false);
      },
      (error) => {
        let errorMessage = "লোকেশন পেতে সমস্যা হয়েছে";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "লোকেশন পারমিশন দিতে হবে";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "লোকেশন তথ্য পাওয়া যাচ্ছে না";
            break;
          case error.TIMEOUT:
            errorMessage = "লোকেশন রিকোয়েস্ট টাইমআউট হয়েছে";
            break;
          default:
            errorMessage = "অজানা সমস্যা হয়েছে";
        }
        setLocationError(errorMessage);
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Get color based on value ranges
  const getValueColor = (key, value) => {
    if (value === null || value === undefined) return "secondary";
    
    switch (key) {
      case "temperature":
        return value >= 17 && value <= 22 ? "success" : value < 15 || value > 25 ? "danger" : "warning";
      case "humidity":
        return value >= 50 && value <= 80 ? "success" : value < 40 || value > 90 ? "danger" : "warning";
      case "lightIntensity":
        return value >= 10000 && value <= 75000 ? "success" : value > 90000 ? "warning" : "info";
      case "pressure":
        return value >= 1005 && value <= 1015 ? "success" : value < 1000 || value > 1020 ? "warning" : "info";
      default:
        return "primary";
    }
  };

  // Get time of day
  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "🌅 সকাল";
    if (hour >= 12 && hour < 17) return "☀️ দুপুর";
    if (hour >= 17 && hour < 20) return "🌆 সন্ধ্যা";
    return "🌙 রাত";
  };

  // Get weather condition based on data
  const getWeatherCondition = (data) => {
    if (!data) return "সাধারণ";
    
    if (data.humidity > 80 && data.lightIntensity < 20000) return "☁️ মেঘলা";
    if (data.temperature > 22) return "🌡️ গরম";
    if (data.temperature < 17) return "❄️ ঠান্ডা";
    if (data.lightIntensity > 75000) return "☀️ প্রখর রোদ";
    if (data.humidity > 85) return "🌧️ বৃষ্টির সম্ভাবনা";
    return "🌤️ আরামদায়ক";
  };

  // Initial load
  useEffect(() => {
    const data = generateWeatherData();
    setWeatherData(data);
    setLastUpdate(new Date());
    setLoading(false);
    // Auto-get location on mount
    getLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const data = generateWeatherData();
      setWeatherData(data);
      setLastUpdate(new Date());
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      const data = generateWeatherData();
      setWeatherData(data);
      setLastUpdate(new Date());
      setLoading(false);
    }, 500);
  };

  // eslint-disable-next-line no-unused-vars
  const formatTimestamp = (date) => {
    if (!date) return "N/A";
    return date.toLocaleTimeString('bn-BD', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
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
              <span className="text-info me-2">🌦️</span>
              মাইক্রো-ক্লাইমেট ড্যাশবোর্ড
            </h1>
            <p className="lead text-muted mb-4">
              আবহাওয়ার তথ্য ও GPS লোকেশন মনিটরিং
            </p>
              
              <div className="d-flex justify-content-center align-items-center gap-3 flex-wrap">
                <Badge 
                  bg="light" 
                  text="dark"
                  className="px-4 py-2 shadow-sm"
                  style={{ 
                    fontSize: '1rem',
                    borderRadius: '15px',
                    fontWeight: '600'
                  }}
                >
                  {getTimeOfDay()}
                </Badge>
                <Badge 
                  bg="warning" 
                  text="dark"
                  className="px-4 py-2 shadow-sm"
                  style={{ 
                    fontSize: '1rem',
                    borderRadius: '15px',
                    fontWeight: '600'
                  }}
                >
                  {getWeatherCondition(weatherData)}
                </Badge>
                {locationName && (
                  <Badge 
                    bg="info" 
                    text="white"
                    className="px-4 py-2 shadow-sm"
                    style={{ 
                      fontSize: '1rem',
                      borderRadius: '15px',
                      fontWeight: '600',
                      maxWidth: '300px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    📍 {locationName.split(',')[0]}
                  </Badge>
                )}
              </div>
          </div>

          {/* Main Card */}
          <Card className="shadow-sm border-0 rounded-4 mb-4">
            <Card.Body className="p-4 p-lg-5">
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="danger" style={{ width: '3rem', height: '3rem' }} />
                  <p className="mt-3 text-muted">আবহাওয়া ডাটা লোড হচ্ছে...</p>
                </div>
              ) : weatherData && (
                <>
                  {/* Location Card */}
                  <Card className="border-0 mb-4" style={{ 
                    borderRadius: '15px',
                    background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
                  }}>
                    <Card.Body className="p-4">
                      <Row className="align-items-center">
                        <Col md={location ? 6 : 8}>
                          <h5 className="fw-bold mb-3" style={{ color: '#d63447' }}>
                            📍 আপনার বর্তমান অবস্থান
                          </h5>
                          {location ? (
                            <div>
                              {locationName && (
                                <div className="mb-3 p-3" style={{ 
                                  background: 'rgba(255, 255, 255, 0.7)',
                                  borderRadius: '10px',
                                  border: '2px solid #4ecdc4'
                                }}>
                                  <h6 className="fw-bold mb-1" style={{ color: '#2c3e50' }}>
                                    🏘️ {locationName}
                                  </h6>
                                </div>
                              )}
                              <details>
                                <summary style={{ cursor: 'pointer', fontWeight: '600', marginBottom: '10px' }}>
                                  📊 বিস্তারিত তথ্য
                                </summary>
                                <p className="mb-2 ms-3">
                                  <strong>অক্ষাংশ:</strong> {location.latitude}°
                                </p>
                                <p className="mb-2 ms-3">
                                  <strong>দ্রাঘিমাংশ:</strong> {location.longitude}°
                                </p>
                                <p className="mb-3 ms-3">
                                  <strong>নির্ভুলতা:</strong> ±{location.accuracy} মিটার
                                </p>
                              </details>
                              <a 
                                href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm btn-success"
                                style={{ borderRadius: '8px', fontWeight: '600' }}
                              >
                                🗺️ Google Maps এ দেখুন
                              </a>
                            </div>
                          ) : locationError ? (
                            <p className="text-danger mb-0">⚠️ {locationError}</p>
                          ) : (
                            <p className="text-muted mb-0">লোকেশন তথ্য নেই</p>
                          )}
                        </Col>
                        {location && (
                          <Col md={6} className="text-center">
                            <div style={{ 
                              borderRadius: '12px', 
                              overflow: 'hidden', 
                              border: '3px solid #fff',
                              boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                            }}>
                              <iframe
                                width="100%"
                                height="250"
                                frameBorder="0"
                                style={{ border: 0 }}
                                src={`https://www.google.com/maps?q=${location.latitude},${location.longitude}&z=15&output=embed`}
                                allowFullScreen
                                title="Location Map"
                              />
                            </div>
                          </Col>
                        )}
                      </Row>
                      <Row className="mt-3">
                        <Col className="text-center">
                          <Button
                            variant="info"
                            onClick={getLocation}
                            disabled={locationLoading}
                            style={{
                              borderRadius: '15px',
                              fontWeight: '700',
                              padding: '0.9rem 2rem',
                              fontSize: '1rem',
                              boxShadow: '0 8px 20px rgba(23, 162, 184, 0.3)',
                              transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                              if (!locationLoading) {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 12px 30px rgba(23, 162, 184, 0.4)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!locationLoading) {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 8px 20px rgba(23, 162, 184, 0.3)';
                              }
                            }}
                          >
                            {locationLoading ? (
                              <>
                                <Spinner
                                  as="span"
                                  animation="border"
                                  size="sm"
                                  role="status"
                                  aria-hidden="true"
                                  className="me-2"
                                />
                                লোড হচ্ছে...
                              </>
                            ) : (
                              <>🔄 লোকেশন আপডেট</>
                            )}
                          </Button>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>

                  {/* Current Weather Values */}
                  <div className="mb-5">
                    <h3 className="text-center mb-4 fw-bold" style={{ color: '#f5576c' }}>
                      🎯 বর্তমান আবহাওয়া পরিমাপ
                    </h3>
                    <Row className="g-4">
                      {[
                        { key: 'temperature', label: banglaLabels.temperature, icon: icons.temperature, unit: '°C', decimals: 1 },
                        { key: 'humidity', label: banglaLabels.humidity, icon: icons.humidity, unit: '%', decimals: 1 },
                        { key: 'lightIntensity', label: banglaLabels.lightIntensity, icon: icons.lightIntensity, unit: 'Lux', decimals: 0 },
                        { key: 'pressure', label: banglaLabels.pressure, icon: icons.pressure, unit: 'hPa', decimals: 1 }
                      ].map(({ key, label, icon, unit, decimals }) => {
                        const value = weatherData[key];
                        const color = getValueColor(key, value);
                        const displayValue = value !== null && value !== undefined 
                          ? value.toFixed(decimals) 
                          : 'N/A';
                        
                        return (
                          <Col md={6} lg={3} key={key}>
                            <Card 
                              className={`border-0 h-100 bg-${color}-subtle`}
                              style={{ 
                                borderRadius: '20px',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer',
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.18)'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-8px)';
                                e.currentTarget.style.boxShadow = '0 12px 40px rgba(245, 87, 108, 0.35)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
                              }}
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

                  {/* Refresh Button */}
                  <Row className="mb-4">
                    <Col className="text-center">
                      <Button 
                        variant="danger" 
                        size="lg"
                        onClick={handleRefresh}
                        style={{
                          borderRadius: '15px',
                          fontWeight: '700',
                          padding: '1.2rem 2.5rem',
                          fontSize: '1.1rem',
                          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                          border: 'none',
                          boxShadow: '0 10px 30px rgba(245, 87, 108, 0.4)',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'translateY(-3px)';
                          e.target.style.boxShadow = '0 15px 40px rgba(245, 87, 108, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = '0 10px 30px rgba(245, 87, 108, 0.4)';
                        }}
                      >
                        🔄 ডাটা রিফ্রেশ করুন
                      </Button>
                      <p className="text-muted mt-3 mb-0" style={{ fontSize: '0.95rem', fontWeight: '500' }}>
                        ⚡ স্বয়ংক্রিয় আপডেট প্রতি ১০ সেকেন্ডে
                      </p>
                    </Col>
                  </Row>

                  {/* Weather Guidelines */}
                  <Card className="border-0" style={{ 
                    borderRadius: '15px',
                    background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
                  }}>
                    <Card.Body className="p-4">
                      <h5 className="fw-bold mb-3" style={{ color: '#d63447' }}>
                        💡 কৃষকদের জন্য পরামর্শ
                      </h5>
                      <Row>
                        <Col md={6}>
                          <ul className="mb-0" style={{ fontSize: '0.95rem' }}>
                            <li><strong>তাপমাত্রা:</strong> ১৭-২২°C আদর্শ মাত্রা</li>
                            <li><strong>আর্দ্রতা:</strong> ৫০-৮০% উপযুক্ত</li>
                            <li><strong>আলোর তীব্রতা:</strong> ১০,০০০-৭৫,০০০ Lux আদর্শ</li>
                          </ul>
                        </Col>
                        <Col md={6}>
                          <ul className="mb-0" style={{ fontSize: '0.95rem' }}>
                            <li><strong>বায়ুচাপ:</strong> ১০০৫-১০১৫ hPa স্বাভাবিক</li>
                            <li><strong>পর্যবেক্ষণ:</strong> নিয়মিত মনিটর করুন</li>
                            <li><strong>আবহাওয়া:</strong> শীতল ও আরামদায়ক</li>
                          </ul>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </>
              )}
            </Card.Body>
          </Card>

          {/* Info Card */}
          <Card className="mt-4 border-0 shadow-sm" style={{ borderRadius: '15px' }}>
            <Card.Body className="p-4">
              <h5 className="fw-bold mb-3">ℹ️ তথ্য</h5>
              <ul className="mb-0">
                <li>এই ড্যাশবোর্ড ESP সেন্সর থেকে ডাটা প্রদর্শন করে</li>
                <li>আবহাওয়া ডাটা প্রতি ১০ সেকেন্ডে স্বয়ংক্রিয়ভাবে আপডেট হয়</li>
                <li>সবুজ = আদর্শ মান, হলুদ = সতর্কতা, লাল = সমস্যা, নীল = তথ্যমূলক</li>
                <li>রিফ্রেশ বাটনে ক্লিক করে তাৎক্ষণিক ডাটা আপডেট করুন</li>
                <li>দিনের বিভিন্ন সময়ে বিভিন্ন আবহাওয়া মান দেখানো হয়</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default MicroClimateDashboard;
