import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button, Alert, Badge } from "react-bootstrap";
import { auth } from "./firebase";
import { useNavigate } from "react-router-dom";
import { Document, Packer, Paragraph } from "docx";

function Profile() {
  const [name, setName] = useState("");
  const [address, setAddress] = useState({
    village: "",
    postOffice: "",
    subDistrict: "",
    district: "",
    detailedAddress: ""
  });
  const [email, setEmail] = useState("");
  const [landPredictions, setLandPredictions] = useState({});
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertVariant, setAlertVariant] = useState("success");
  const [editMode, setEditMode] = useState(false);
  const navigate = useNavigate();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    setEmail(user.email);

    const savedProfile = JSON.parse(localStorage.getItem(`profile_${user.uid}`));
    if (savedProfile) {
      setName(savedProfile.name || "");
      // Handle both old format (string) and new format (object)
      if (typeof savedProfile.address === 'string') {
        setAddress({
          village: "",
          postOffice: "",
          subDistrict: "",
          district: "",
          detailedAddress: savedProfile.address || ""
        });
      } else {
        setAddress(savedProfile.address || {
          village: "",
          postOffice: "",
          subDistrict: "",
          district: "",
          detailedAddress: ""
        });
      }
    }

    let savedPredictions = JSON.parse(localStorage.getItem(`predictions_${user.uid}`)) || {};
    Object.keys(savedPredictions).forEach(land => {
      if (!Array.isArray(savedPredictions[land])) savedPredictions[land] = [];
    });

    setLandPredictions(savedPredictions);
  }, [user, navigate]);

  const saveProfile = () => {
    if (!name) {
      setAlertMessage("নাম দিতে হবে!");
      setAlertVariant("warning");
      setShowAlert(true);
      return;
    }
    
    // Check if at least one address field is filled
    const hasAddress = address.village || address.postOffice || address.subDistrict || 
                      address.district || address.detailedAddress;
    
    if (!hasAddress) {
      setAlertMessage("কমপক্ষে একটি ঠিকানার তথ্য দিন!");
      setAlertVariant("warning");
      setShowAlert(true);
      return;
    }
    
    const profileData = { name, email, address };
    localStorage.setItem(`profile_${user.uid}`, JSON.stringify(profileData));
    setAlertMessage("✅ তথ্য সফলভাবে আপডেট হয়েছে!");
    setAlertVariant("success");
    setShowAlert(true);
    setEditMode(false);
  };

  const handleAddressChange = (field, value) => {
    setAddress(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const savePredictionAsDoc = async (land, date, predictionData) => {
    try {
      // Format address for document
      const formattedAddress = [
        address.village ? `গ্রাম: ${address.village}` : '',
        address.postOffice ? `ডাকঘর: ${address.postOffice}` : '',
        address.subDistrict ? `উপজেলা: ${address.subDistrict}` : '',
        address.district ? `জেলা: ${address.district}` : '',
        address.detailedAddress ? `বিস্তারিত: ${address.detailedAddress}` : ''
      ].filter(Boolean).join('\n');
      
      const docFile = new Document({
        sections: [
          {
            children: [
              new Paragraph({ text: "Crop Prediction Report", heading: "Heading1" }),
              new Paragraph({ text: `Name: ${name}` }),
              new Paragraph({ text: `Email: ${email}` }),
              new Paragraph({ text: `Address: \n${formattedAddress}` }),
              new Paragraph({ text: `Land Address: ${land}` }),
              new Paragraph({ text: `Date: ${date}` }),
              new Paragraph({ text: `Prediction: ${predictionData}` }),
            ],
          },
        ],
      });

      const blob = await Packer.toBlob(docFile);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Prediction_${land}_${date}.docx`;
      a.click();
      URL.revokeObjectURL(url);

      setAlertMessage("ডকুমেন্ট সফলভাবে ডাউনলোড হয়েছে!");
      setAlertVariant("success");
      setShowAlert(true);
    } catch (error) {
      setAlertMessage("ডকুমেন্ট তৈরি করতে সমস্যা হয়েছে!");
      setAlertVariant("danger");
      setShowAlert(true);
    }
  };

  const deletePrediction = (land, index) => {
    const updatedPredictions = { ...landPredictions };
    updatedPredictions[land].splice(index, 1);
    
    if (updatedPredictions[land].length === 0) {
      delete updatedPredictions[land];
    }
    
    setLandPredictions(updatedPredictions);
    localStorage.setItem(`predictions_${user.uid}`, JSON.stringify(updatedPredictions));
    
    setAlertMessage("Prediction মুছে ফেলা হয়েছে!");
    setAlertVariant("info");
    setShowAlert(true);
  };

  const clearAllPredictions = () => {
    if (window.confirm("সব prediction মুছে ফেলতে চান?")) {
      setLandPredictions({});
      localStorage.removeItem(`predictions_${user.uid}`);
      
      setAlertMessage("সব prediction মুছে ফেলা হয়েছে!");
      setAlertVariant("info");
      setShowAlert(true);
    }
  };

  // Data for dropdowns
  const districts = [
    "ঢাকা", "চট্টগ্রাম", "সিলেট", "রাজশাহী", "খুলনা", "বরিশাল", "রংপুর", "ময়মনসিংহ",
    "ফরিদপুর", "গাজীপুর", "শরীয়তপুর", "নারায়ণগঞ্জ", "টাঙ্গাইল", "কিশোরগঞ্জ", "আরিফাবাদ",
    "মুন্সিগঞ্জ", "নরসিংদী", "মানিকগঞ্জ", "জামালপুর", "শেরপুর", "বগুড়া", "সিরাজগঞ্জ",
    "পাবনা", "বাগেরহাট", "চুয়াডাঙ্গা", "ঝিনাইদহ", "কুষ্টিয়া", "মাগুরা", "নড়াইল",
    "যশোর", "সাতক্ষীরা", "বরগুনা", "পটুয়াখালী", "ভোলা", "পিরোজপুর", "বরিশাল",
    "জয়পুরহাট", "কুড়িগ্রাম", "লালমনিরহাট", "নীলফামারী", "দিনাজপুর", "গাইবান্ধা", "রংপুর",
    "কক্সবাজার", "চট্টগ্রাম", "কুমিল্লা", "ব্রাহ্মণবাড়িয়া", "নোয়াখালী", "ফেনী", "লক্ষ্মীপুর",
    "চাঁদপুর", "সিলেট", "মৌলভীবাজার", "হবিগঞ্জ", "সুনামগঞ্জ", "সুরমা", "কুরগাঁও", "শাহজালাল"
  ];

  const subDistricts = [
    "ধামরাই", "সাভার", "আশুলিয়া", "দোহার", "কেরানীগঞ্জ", "নবাবগঞ্জ", "পুরুলিয়া", "শাহবাগ",
    "কোতোয়ালী", "বংশী", "ওয়ারী", "হাতিরঝিল", "লালবাগ", "শ্যামপুর", "কোরকসুর", "ডেমরা",
    "সবুজবাগ", "মুগদা", "কাফরুল", "রাজারবাগ", "তেজগাঁও", "আদাবর", "নিউমার্কেট", "মিরপুর",
    "আগারগাঁও", "তালতলা", "পল্টন", "গোপীবাগ", "গেন্ডারিয়া", "কামরাঙ্গীরচর", "যাত্রাবাড়ী", "ধানমন্ডি",
    "নিউ এলিফ্যান্ট রোড", "আজিমপুর", "ইস্কাটন", "গ্রীন রোড", "মানিকদী", "বেইলি রোড", "ডিপ্লোমেটিক জোন",
    "বারিধারা", "ধানমন্ডি", "কলাবাগান", "শাহাবুদ্দিন", "কুষ্টিয়া সদর", "দৌলতপুর", "মিরপুর", "ভেড়ামারা",
    "খোকসা", "কুমারখালী", "পোড়াদহ", "হরিপুর", "বাজিতপুর", "শহীদনগর", "সদরপুর", "ফরিদপুর"
  ];

  return (
    <Container fluid>
      <Row className="justify-content-center">
        <Col lg={10}>
          {showAlert && (
            <Alert variant={alertVariant} dismissible onClose={() => setShowAlert(false)} className="mt-3">
              {alertMessage}
            </Alert>
          )}

          <Row>
            {/* Profile Section */}
            <Col lg={5} className="mb-4">
              <Card className="shadow border-0 h-100" style={{ borderRadius: '15px' }}>
                <div style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  padding: '1.5rem',
                  textAlign: 'center',
                  borderRadius: '15px 15px 0 0'
                }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <h2 className="fw-bold text-white mb-0 flex-grow-1">👤 আমার তথ্য</h2>
                    <Button
                      variant="light"
                      size="sm"
                      onClick={() => setEditMode(!editMode)}
                      style={{ borderRadius: '8px', fontWeight: 'bold' }}
                    >
                      {editMode ? '❌ বাতিল' : '✏️ সম্পাদনা'}
                    </Button>
                  </div>
                </div>
                <Card.Body className="p-4">
                  {editMode ? (
                    <Form>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">নাম</Form.Label>
                        <Form.Control
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="আপনার পূর্ণ নাম"
                          style={{ borderRadius: '10px', padding: '0.75rem' }}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">ইমেইল</Form.Label>
                        <Form.Control
                          type="email"
                          value={email}
                          disabled
                          className="bg-light"
                          style={{ borderRadius: '10px', padding: '0.75rem' }}
                        />
                      </Form.Group>

                      {/* Modern Address Section */}
                      <div className="address-section">
                        <div className="address-card">
                        <h4 className="mb-4 text-center" style={{ color: '#2c3e50', fontWeight: 'bold' }}>
                          🏠 ঠিকানার তথ্য
                        </h4>
                        
                        <div className="address-grid">
                          <div className="address-field">
                            <label>
                              <span className="address-icon">🏘️</span>
                              গ্রাম
                            </label>
                            <Form.Control
                              type="text"
                              value={address.village}
                              onChange={(e) => handleAddressChange('village', e.target.value)}
                              placeholder="গ্রামের নাম"
                            />
                          </div>

                          <div className="address-field">
                            <label>
                              <span className="address-icon">📮</span>
                              ডাকঘর
                            </label>
                            <Form.Control
                              type="text"
                              value={address.postOffice}
                              onChange={(e) => handleAddressChange('postOffice', e.target.value)}
                              placeholder="ডাকঘরের নাম"
                            />
                          </div>

                          <div className="address-field">
                            <label>
                              <span className="address-icon">🏛️</span>
                              উপজেলা
                            </label>
                            <Form.Select
                              value={address.subDistrict}
                              onChange={(e) => handleAddressChange('subDistrict', e.target.value)}
                            >
                              <option value="">উপজেলা নির্বাচন করুন</option>
                              {subDistricts.map((subDistrict, index) => (
                                <option key={index} value={subDistrict}>{subDistrict}</option>
                              ))}
                            </Form.Select>
                          </div>

                          <div className="address-field">
                            <label>
                              <span className="address-icon">🏢</span>
                              জেলা
                            </label>
                            <Form.Select
                              value={address.district}
                              onChange={(e) => handleAddressChange('district', e.target.value)}
                            >
                              <option value="">জেলা নির্বাচন করুন</option>
                              {districts.map((district, index) => (
                                <option key={index} value={district}>{district}</option>
                              ))}
                            </Form.Select>
                          </div>

                          <div className="address-field" style={{ gridColumn: '1/-1' }}>
                            <label>
                              <span className="address-icon">📝</span>
                              বিস্তারিত ঠিকানা
                            </label>
                            <Form.Control
                              as="textarea"
                              value={address.detailedAddress}
                              onChange={(e) => handleAddressChange('detailedAddress', e.target.value)}
                              placeholder="রাস্তা, বাড়ির নম্বর, অন্যান্য তথ্য..."
                              rows={3}
                            />
                          </div>
                        </div>

                        <div className="address-actions">
                          <Button 
                            className="modern-btn modern-btn-primary w-100"
                            onClick={saveProfile}
                            style={{
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              border: 'none',
                              borderRadius: '10px',
                              padding: '0.75rem',
                              fontWeight: 'bold'
                            }}
                          >
                            💾 তথ্য সংরক্ষণ করুন
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Form>
                  ) : (
                    <div>
                      {/* Display Mode */}
                      <div className="mb-4">
                        <h6 className="text-muted mb-2">নাম</h6>
                        <p className="h5 mb-0">{name || 'নাম দেওয়া হয়নি'}</p>
                      </div>

                      <div className="mb-4">
                        <h6 className="text-muted mb-2">ইমেইল</h6>
                        <p className="h6 mb-0">{email}</p>
                      </div>

                      <div className="mb-4">
                        <h6 className="text-muted mb-3">📍 ঠিকানা</h6>
                        <Card className="bg-light border-0" style={{ borderRadius: '10px' }}>
                          <Card.Body className="p-3">
                            {address.village && (
                              <div className="mb-2">
                                <span className="fw-semibold">🏘️ গ্রাম:</span> {address.village}
                              </div>
                            )}
                            {address.postOffice && (
                              <div className="mb-2">
                                <span className="fw-semibold">📮 ডাকঘর:</span> {address.postOffice}
                              </div>
                            )}
                            {address.subDistrict && (
                              <div className="mb-2">
                                <span className="fw-semibold">🏛️ উপজেলা:</span> {address.subDistrict}
                              </div>
                            )}
                            {address.district && (
                              <div className="mb-2">
                                <span className="fw-semibold">🏢 জেলা:</span> {address.district}
                              </div>
                            )}
                            {address.detailedAddress && (
                              <div className="mb-0">
                                <span className="fw-semibold">📝 বিস্তারিত:</span> {address.detailedAddress}
                              </div>
                            )}
                            {!address.village && !address.postOffice && !address.subDistrict && 
                             !address.district && !address.detailedAddress && (
                              <p className="text-muted mb-0">ঠিকানা যোগ করা হয়নি</p>
                            )}
                          </Card.Body>
                        </Card>
                      </div>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>

            {/* Predictions History Section */}
            <Col lg={7}>
              <Card className="shadow border-0">
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <Card.Title>
                      <h2 className="fw-bold text-success">� ফসল সুপারিশের ইতিহাস</h2>
                    </Card.Title>
                    {Object.keys(landPredictions).length > 0 && (
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={clearAllPredictions}
                        style={{ borderRadius: '10px' }}
                      >
                        🗑️ সব মুছুন
                      </Button>
                    )}
                  </div>

                  {Object.keys(landPredictions).length === 0 ? (
                    <Card className="border-0 bg-light text-center py-5">
                      <Card.Body>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📭</div>
                        <h4 className="text-muted mb-2">কোনো সুপারিশ সংরক্ষিত নেই</h4>
                        <p className="text-muted">ফসলের সুপারিশ সংরক্ষণ করলে এখানে দেখা যাবে</p>
                      </Card.Body>
                    </Card>
                  ) : (
                    <div className="predictions-container">
                      {Object.entries(landPredictions).map(([land, entries]) => (
                        <Card key={land} className="mb-4 border-0 shadow-sm" style={{ borderRadius: '15px', overflow: 'hidden' }}>
                          <div style={{
                            background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                            padding: '1.2rem 1.5rem',
                            color: 'white'
                          }}>
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <h5 className="mb-1 fw-bold">🏞️ {land.split(' - ')[0]}</h5>
                                <p className="mb-0 opacity-75" style={{ fontSize: '0.9rem' }}>
                                  📍 {land.split(' - ')[1] || ''}
                                </p>
                              </div>
                              <Badge bg="light" text="dark" style={{ fontSize: '1rem', padding: '0.5rem 1rem', borderRadius: '10px' }}>
                                {entries.length} টি রেকর্ড
                              </Badge>
                            </div>
                          </div>
                          
                          <Card.Body className="p-3">
                            {entries.map((entry, idx) => (
                              <Card key={idx} className="mb-3 border-0 bg-light" style={{ borderRadius: '12px' }}>
                                <Card.Body className="p-3">
                                  <Row className="align-items-center">
                                    <Col md={8}>
                                      <div className="mb-2">
                                        <Badge bg="info" className="me-2" style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}>
                                          📅 {entry.date}
                                        </Badge>
                                      </div>
                                      
                                      <div className="mb-2">
                                        <strong style={{ color: '#11998e' }}>🌾 সুপারিশকৃত ফসল:</strong>
                                        <p className="mb-0 mt-1" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                                          {entry.prediction}
                                        </p>
                                      </div>
                                      
                                      {entry.landDetails && (
                                        <div className="mt-2 p-2 bg-white rounded" style={{ fontSize: '0.85rem' }}>
                                          <div className="d-flex flex-wrap gap-2">
                                            {entry.landDetails.details && (
                                              <Badge bg="secondary" className="fw-normal">
                                                📏 {entry.landDetails.details}
                                              </Badge>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </Col>
                                    
                                    <Col md={4} className="text-end">
                                      <div className="d-flex flex-column gap-2">
                                        <Button
                                          variant="primary"
                                          size="sm"
                                          onClick={() => savePredictionAsDoc(land, entry.date, entry.prediction)}
                                          style={{ 
                                            borderRadius: '10px', 
                                            fontWeight: 'bold',
                                            padding: '0.5rem 1rem'
                                          }}
                                        >
                                          📄 ডাউনলোড
                                        </Button>
                                        <Button
                                          variant="outline-danger"
                                          size="sm"
                                          onClick={() => deletePrediction(land, idx)}
                                          style={{ 
                                            borderRadius: '10px',
                                            padding: '0.5rem 1rem'
                                          }}
                                        >
                                          🗑️ মুছুন
                                        </Button>
                                      </div>
                                    </Col>
                                  </Row>
                                </Card.Body>
                              </Card>
                            ))}
                          </Card.Body>
                        </Card>
                      ))}
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
}

export default Profile;
