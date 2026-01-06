import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import { Container, Navbar, Nav, NavDropdown, Button } from "react-bootstrap";
import MainPage from "./MainPage";
import Login from "./LoginPage";
import Signup from "./Signup";
import Profile from "./Profile";
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

  const openRealtimeDashboard = () => {
    window.open("http://192.168.36.136/", "_blank");
  };

  return (
    <>
      <Navbar bg="success" variant="dark" expand="lg" className="shadow">
        <Container>
          <Navbar.Brand as={Link} to="/" className="fw-bold">
            🌾 ফসল সুপারিশ
          </Navbar.Brand>
          
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link 
                onClick={openRealtimeDashboard}
                className="text-white"
                style={{ cursor: 'pointer' }}
              >
                📡 রিয়েল-টাইম ড্যাশবোর্ড
              </Nav.Link>
              {user ? (
                <NavDropdown
                  title={
                    <span className="text-white">
                      👤 {user.email?.split('@')[0]}
                    </span>
                  }
                  id="account-dropdown"
                  align="end"
                >
                  <NavDropdown.Item as={Link} to="/profile">
                    👤 প্রোফাইল
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout} className="text-danger">
                    🚪 লগআউট
                  </NavDropdown.Item>
                </NavDropdown>
              ) : (
                <>
                  <Nav.Link as={Link} to="/login" className="text-white">
                    🔑 লগইন
                  </Nav.Link>
                  <Nav.Link as={Link} to="/signup" className="text-white">
                    📝 সাইনআপ
                  </Nav.Link>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container fluid className="py-4">
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
