import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import { Container, Navbar, Nav, NavDropdown, Button } from "react-bootstrap";
import Dashboard from "./Dashboard";
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
  const [expanded, setExpanded] = React.useState(false);
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
        bg="white"
        expand="lg" 
        className="shadow-sm"
        sticky="top"
        expanded={expanded}
        onToggle={setExpanded}
      >
        <Container>
          <Navbar.Brand as={Link} to="/" className="fw-bold d-flex align-items-center">
            <span className="text-success fs-3 me-2">🌾</span>
            <span className="text-dark">কৃষি বিশ্লেষক</span>
          </Navbar.Brand>
          
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto align-items-center">
              <Nav.Link 
                as={Link}
                to="/"
                className="fw-semibold px-3"
                onClick={() => setExpanded(false)}
              >
                <i className="bi bi-house me-2"></i>
                হোম
              </Nav.Link>
              
              <NavDropdown
                title={
                  <span className="fw-semibold">
                    <i className="bi bi-speedometer2 me-2"></i>
                    ড্যাশবোর্ড
                  </span>
                }
                id="dashboard-dropdown"
                className="dashboard-mega-menu"
              >
                <div className="mega-menu-container">
                  <div className="row g-3">
                    <div className="col-12">
                      <h6 className="dropdown-header text-success">
                        <i className="bi bi-broadcast me-2"></i>
                        রিয়েল-টাইম মনিটরিং
                      </h6>
                      <NavDropdown.Item as={Link} to="/dashboard" onClick={() => setExpanded(false)}>
                        <div className="d-flex align-items-center">
                          <i className="bi bi-cpu text-primary me-3 fs-5"></i>
                          <div>
                            <div className="fw-semibold">NPK সেন্সর</div>
                            <small className="text-muted">মাটির পুষ্টি পর্যবেক্ষণ</small>
                          </div>
                        </div>
                      </NavDropdown.Item>
                      <NavDropdown.Divider />
                      <h6 className="dropdown-header text-info">
                        <i className="bi bi-cloud-sun me-2"></i>
                        পরিবেশ তথ্য
                      </h6>
                      <NavDropdown.Item as={Link} to="/microclimate" onClick={() => setExpanded(false)}>
                        <div className="d-flex align-items-center">
                          <i className="bi bi-thermometer-half text-warning me-3 fs-5"></i>
                          <div>
                            <div className="fw-semibold">মাইক্রোক্লাইমেট</div>
                            <small className="text-muted">আবহাওয়া ও তাপমাত্রা</small>
                          </div>
                        </div>
                      </NavDropdown.Item>
                    </div>
                  </div>
                </div>
              </NavDropdown>
              
              {user ? (
                <NavDropdown
                  title={
                    <span className="fw-semibold">
                      <i className="bi bi-person-circle me-2"></i>
                      একাউন্ট
                    </span>
                  }
                  id="account-dropdown"
                  align="end"
                >
                  <NavDropdown.Item as={Link} to="/profile" onClick={() => setExpanded(false)}>
                    <i className="bi bi-person me-2"></i>
                    আমার তথ্য
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/" onClick={() => setExpanded(false)}>
                    <i className="bi bi-bar-chart me-2"></i>
                    ফসল সুপারিশ
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={() => { handleLogout(); setExpanded(false); }} className="text-danger">
                    <i className="bi bi-box-arrow-right me-2"></i>
                    প্রস্থান
                  </NavDropdown.Item>
                </NavDropdown>
              ) : (
                <>
                  <Nav.Link as={Link} to="/login" className="fw-semibold px-3" onClick={() => setExpanded(false)}>
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                    প্রবেশ
                  </Nav.Link>
                  <Nav.Link as={Link} to="/signup" onClick={() => setExpanded(false)}>
                    <Button variant="success" size="sm" className="rounded-pill px-3">
                      <i className="bi bi-person-plus me-2"></i>
                      নিবন্ধন
                    </Button>
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
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recommendation"
            element={
              <ProtectedRoute>
                <MainPage />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/sensor"
            element={
              <ProtectedRoute>
                <RealTimeDashboard />
              </ProtectedRoute>
            }
          />
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
