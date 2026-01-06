import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap";
import { auth } from "./firebase";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) navigate("/"); // redirect if logged in
    });
  }, [navigate]);

  const login = async (e) => {
    e.preventDefault();
    setLoading(true);
    setShowAlert(false);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err) {
      setAlertMessage(err.message);
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center" 
                style={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  padding: '2rem 1rem'
                }}>
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={10} md={8} lg={5} xl={4}>
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
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '2.5rem 2rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔑</div>
              <h1 className="h2 fw-bold text-white mb-2">লগইন করুন</h1>
              <p className="text-white-50 mb-0">আপনার অ্যাকাউন্টে প্রবেশ করুন</p>
            </div>

            <Card.Body className="p-4 p-md-5">
              {showAlert && (
                <Alert 
                  variant="danger" 
                  dismissible 
                  onClose={() => setShowAlert(false)}
                  style={{ borderRadius: '15px' }}
                >
                  {alertMessage}
                </Alert>
              )}

              <Form onSubmit={login}>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold d-flex align-items-center gap-2">
                    <span style={{ fontSize: '1.2rem' }}>📧</span>
                    ইমেইল ঠিকানা
                  </Form.Label>
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

                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold d-flex align-items-center gap-2">
                    <span style={{ fontSize: '1.2rem' }}>🔒</span>
                    পাসওয়ার্ড
                  </Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="আপনার পাসওয়ার্ড লিখুন"
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

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-100 mb-4"
                  disabled={loading}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '0.875rem',
                    fontWeight: '700',
                    fontSize: '1.1rem',
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
                  }}
                >
                  {loading ? 'লগইন হচ্ছে...' : '🔑 লগইন'}
                </Button>
              </Form>

              <div className="text-center">
                <p className="text-muted mb-0">
                  অ্যাকাউন্ট নেই?{' '}
                  <Link 
                    to="/signup" 
                    className="text-decoration-none fw-bold"
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}
                  >
                    📝 সাইনআপ করুন
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

export default LoginPage;
