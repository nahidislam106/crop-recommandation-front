import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import { Container, Navbar, Nav, NavDropdown } from "react-bootstrap";
import MainPage from "./MainPage";
import Login from "./LoginPage";
import Signup from "./Signup";
import Profile from "./Profile";
import RealTimeDashboard from "./RealTimeDashboard";
import MicroClimateDashboard from "./MicroClimateDashboard";
import ProtectedRoute from "./ProtectedRoute";
import { auth } from "./firebase";

function AppContent() {
  const [user, setUser] = React.useState(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => setUser(u));
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/login");
  };

  return (
    <>
      <Navbar 
        variant="dark" 
        expand="lg" 
        className="shadow-sm py-2"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          minHeight: '60px'
        }}
      >
        <Container>
          <Navbar.Brand as={Link} to="/" className="fw-bold d-flex align-items-center" style={{ fontSize: '1.1rem' }}>
            <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>🌾</span>
            কৃষি সহায়ক
          </Navbar.Brand>
          
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link 
                as={Link}
                to="/dashboard"
                className="text-white fw-semibold px-3"
                style={{ fontSize: '0.95rem' }}
              >
                📊 সেন্সর
              </Nav.Link>
              <Nav.Link 
                as={Link}
                to="/microclimate"
                className="text-white fw-semibold px-3"
                style={{ fontSize: '0.95rem' }}
              >
                🌦️ আবহাওয়া
              </Nav.Link>
              {user ? (
                <NavDropdown
                  title={
                    <span className="text-white fw-semibold" style={{ fontSize: '0.95rem' }}>
                      👤 {user.email?.split('@')[0]}
                    </span>
                  }
                  id="account-dropdown"
                  align="end"
                >
                  <NavDropdown.Item as={Link} to="/profile">
                    📋 আমার তথ্য
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout} className="text-danger fw-semibold">
                    🚪 প্রস্থান
                  </NavDropdown.Item>
                </NavDropdown>
              ) : (
                <>
                  <Nav.Link as={Link} to="/login" className="text-white fw-semibold px-3" style={{ fontSize: '0.95rem' }}>
                    🔑 প্রবেশ
                  </Nav.Link>
                  <Nav.Link as={Link} to="/signup" className="text-white fw-semibold px-3" style={{ fontSize: '0.95rem' }}>
                    📝 নিবন্ধন
                  </Nav.Link>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container fluid className="py-3">
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainPage />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <RealTimeDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/microclimate"
            element={
              <ProtectedRoute>
                <MicroClimateDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Container>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
