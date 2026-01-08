import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap";
import { auth } from "./firebase";
import { createUserWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState({
    village: "",
    postOffice: "",
    subDistrict: "",
    district: "",
    detailedAddress: ""
  });
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertVariant, setAlertVariant] = useState("danger");
  const navigate = useNavigate();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/"); // redirect to home if already logged in
      }
    });
  }, [navigate]);

  const handleAddressChange = (field, value) => {
    setAddress(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setShowAlert(false);

    // Validate name
    if (!name.trim()) {
      setAlertMessage("নাম দিতে হবে!");
      setAlertVariant("warning");
      setShowAlert(true);
      setLoading(false);
      return;
    }

    // Validate address - at least one field required
    const hasAddress = address.village || address.postOffice || address.subDistrict || 
                      address.district || address.detailedAddress;
    
    if (!hasAddress) {
      setAlertMessage("কমপক্ষে একটি ঠিকানার তথ্য দিন!");
      setAlertVariant("warning");
      setShowAlert(true);
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setAlertMessage("পাসওয়ার্ড মিলছে না!");
      setAlertVariant("warning");
      setShowAlert(true);
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setAlertMessage("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে!");
      setAlertVariant("warning");
      setShowAlert(true);
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Save profile data to localStorage
      const profileData = { name, email, address };
      localStorage.setItem(`profile_${user.uid}`, JSON.stringify(profileData));
      
      setAlertMessage("অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!");
      setAlertVariant("success");
      setShowAlert(true);
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setAlertMessage(err.message);
      setAlertVariant("danger");
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center" 
                style={{ 
                  background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                  padding: '2rem 1rem'
                }}>
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={10} md={10} lg={8} xl={7}>
          <Card 
            className="border-0" 
            style={{ 
              borderRadius: '25px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              overflow: 'hidden',
              animation: 'fadeInUp 0.6s ease-out'
            }}
          >
            <div style={{
              background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
              padding: '2.5rem 2rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📝</div>
              <h1 className="h2 fw-bold text-white mb-2">নতুন অ্যাকাউন্ট তৈরি করুন</h1>
              <p className="text-white-50 mb-0">কৃষি সহায়ক সিস্টেমে নিবন্ধন করুন</p>
            </div>

            <Card.Body className="p-4 p-md-5">
              {showAlert && (
                <Alert 
                  variant={alertVariant} 
                  dismissible 
                  onClose={() => setShowAlert(false)}
                  style={{ borderRadius: '15px' }}
                >
                  {alertMessage}
                </Alert>
              )}

              <Form onSubmit={handleSignup}>
                {/* Personal Information Section */}
                <div className="mb-4">
                  <h5 className="fw-bold mb-3" style={{ color: '#11998e' }}>
                    👤 ব্যক্তিগত তথ্য
                  </h5>
                  
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">পূর্ণ নাম *</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="আপনার নাম"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          style={{
                            borderRadius: '12px',
                            padding: '0.875rem 1.25rem',
                            border: '2px solid #e8ecef',
                            fontSize: '1rem'
                          }}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">ইমেইল ঠিকানা *</Form.Label>
                        <Form.Control
                          type="email"
                          placeholder="your@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          style={{
                            borderRadius: '12px',
                            padding: '0.875rem 1.25rem',
                            border: '2px solid #e8ecef',
                            fontSize: '1rem'
                          }}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

                {/* Address Section */}
                <div className="mb-4">
                  <h5 className="fw-bold mb-3" style={{ color: '#11998e' }}>
                    🏠 ঠিকানার তথ্য
                  </h5>
                  
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">গ্রাম/এলাকা *</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="গ্রামের নাম"
                          value={address.village}
                          onChange={(e) => handleAddressChange('village', e.target.value)}
                          style={{
                            borderRadius: '12px',
                            padding: '0.875rem 1.25rem',
                            border: '2px solid #e8ecef',
                            fontSize: '1rem'
                          }}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">ডাকঘর</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="ডাকঘরের নাম"
                          value={address.postOffice}
                          onChange={(e) => handleAddressChange('postOffice', e.target.value)}
                          style={{
                            borderRadius: '12px',
                            padding: '0.875rem 1.25rem',
                            border: '2px solid #e8ecef',
                            fontSize: '1rem'
                          }}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">উপজেলা</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="উপজেলার নাম"
                          value={address.subDistrict}
                          onChange={(e) => handleAddressChange('subDistrict', e.target.value)}
                          style={{
                            borderRadius: '12px',
                            padding: '0.875rem 1.25rem',
                            border: '2px solid #e8ecef',
                            fontSize: '1rem'
                          }}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">জেলা *</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="জেলার নাম"
                          value={address.district}
                          onChange={(e) => handleAddressChange('district', e.target.value)}
                          style={{
                            borderRadius: '12px',
                            padding: '0.875rem 1.25rem',
                            border: '2px solid #e8ecef',
                            fontSize: '1rem'
                          }}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={12}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">বিস্তারিত ঠিকানা</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={2}
                          placeholder="রাস্তা, বাড়ির নম্বর, অন্যান্য তথ্য..."
                          value={address.detailedAddress}
                          onChange={(e) => handleAddressChange('detailedAddress', e.target.value)}
                          style={{
                            borderRadius: '12px',
                            padding: '0.875rem 1.25rem',
                            border: '2px solid #e8ecef',
                            fontSize: '1rem'
                          }}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

                {/* Password Section */}
                <div className="mb-4">
                  <h5 className="fw-bold mb-3" style={{ color: '#11998e' }}>
                    🔒 পাসওয়ার্ড
                  </h5>
                  
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">পাসওয়ার্ড *</Form.Label>
                        <Form.Control
                          type="password"
                          placeholder="পাসওয়ার্ড লিখুন"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          style={{
                            borderRadius: '12px',
                            padding: '0.875rem 1.25rem',
                            border: '2px solid #e8ecef',
                            fontSize: '1rem'
                          }}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">পাসওয়ার্ড নিশ্চিত করুন *</Form.Label>
                        <Form.Control
                          type="password"
                          placeholder="আবার পাসওয়ার্ড লিখুন"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          style={{
                            borderRadius: '12px',
                            padding: '0.875rem 1.25rem',
                            border: '2px solid #e8ecef',
                            fontSize: '1rem'
                          }}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-100 mb-4"
                  disabled={loading}
                  style={{
                    background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '0.875rem',
                    fontWeight: '700',
                    fontSize: '1.1rem',
                    boxShadow: '0 8px 25px rgba(17, 153, 142, 0.4)'
                  }}
                >
                  {loading ? 'অ্যাকাউন্ট তৈরি হচ্ছে...' : '✅ নিবন্ধন সম্পন্ন করুন'}
                </Button>
              </Form>

              <div className="text-center mt-3">
                <p className="text-muted mb-0">
                  ইতিমধ্যে অ্যাকাউন্ট আছে?{' '}
                  <Link 
                    to="/login" 
                    className="text-decoration-none fw-bold"
                    style={{
                      background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}
                  >
                    🔑 প্রবেশ করুন
                  </Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Signup;
