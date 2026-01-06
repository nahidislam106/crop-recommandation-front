import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button, Alert, Table, Badge } from "react-bootstrap";
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
    setAlertMessage("Profile সফলভাবে সংরক্ষিত হয়েছে!");
    setAlertVariant("success");
    setShowAlert(true);
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
              <Card className="shadow border-0 h-100">
                <Card.Body className="p-4">
                  <Card.Title className="text-center mb-4">
                    <h2 className="fw-bold text-primary">👤 ব্যক্তিগত তথ্য</h2>
                  </Card.Title>

                  <Form>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">নাম</Form.Label>
                      <Form.Control
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="আপনার পূর্ণ নাম"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">ইমেইল</Form.Label>
                      <Form.Control
                        type="email"
                        value={email}
                        disabled
                        className="bg-light"
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
                            className="modern-btn modern-btn-primary"
                            onClick={saveProfile}
                          >
                            💾 Profile সংরক্ষণ
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            </Col>

            {/* Predictions History Section */}
            <Col lg={7}>
              <Card className="shadow border-0">
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <Card.Title>
                      <h2 className="fw-bold text-success">📄 Prediction ইতিহাস</h2>
                    </Card.Title>
                    {Object.keys(landPredictions).length > 0 && (
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={clearAllPredictions}
                      >
                        🗑️ সব মুছুন
                      </Button>
                    )}
                  </div>

                  {Object.keys(landPredictions).length === 0 ? (
                    <div className="text-center py-5">
                      <h4 className="text-muted">📭 কোনো prediction নেই</h4>
                      <p className="text-muted">Prediction করলে এখানে দেখা যাবে</p>
                    </div>
                  ) : (
                    <div className="predictions-container">
                      {Object.entries(landPredictions).map(([land, entries]) => (
                        <div key={land} className="mb-4">
                          <Card className="border-0 bg-light">
                            <Card.Header className="bg-primary text-white">
                              <h5 className="mb-0">
                                🏞️ জমি: {land}
                                <Badge bg="light" text="dark" className="ms-2">
                                  {entries.length}টি
                                </Badge>
                              </h5>
                            </Card.Header>
                            <Card.Body>
                              {entries.length > 0 ? (
                                <Table responsive hover size="sm">
                                  <thead>
                                    <tr>
                                      <th>তারিখ</th>
                                      <th>Prediction</th>
                                      <th width="150">অ্যাকশন</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {entries.map((entry, idx) => (
                                      <tr key={idx}>
                                        <td>
                                          <Badge bg="info">{entry.date}</Badge>
                                        </td>
                                        <td className="text-truncate" style={{ maxWidth: '200px' }}>
                                          {entry.prediction}
                                        </td>
                                        <td>
                                          <div className="d-flex gap-1">
                                            <Button
                                              variant="outline-primary"
                                              size="sm"
                                              onClick={() => savePredictionAsDoc(land, entry.date, entry.prediction)}
                                            >
                                              📄
                                            </Button>
                                            <Button
                                              variant="outline-danger"
                                              size="sm"
                                              onClick={() => deletePrediction(land, idx)}
                                            >
                                              🗑️
                                            </Button>
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </Table>
                              ) : (
                                <p className="text-muted mb-0">এই জমির জন্য কোনো prediction নেই</p>
                              )}
                            </Card.Body>
                          </Card>
                        </div>
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
