import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import MainPage from "./MainPage";
import Login from "./LoginPage";
import Signup from "./Signup";
import Profile from "./Profile";
import ProtectedRoute from "./ProtectedRoute";
import { auth } from "./firebase";

function App() {
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => setUser(u));
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    window.location.href = "/login"; // redirect to login after logout
  };

  return (
    <Router>
      <div className="navbar">
        <Link to="/">🌾 ফসল সুপারিশ</Link>

        {user ? (
          <>
            <Link to="/profile">👤 Profile</Link>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">🔑 Login</Link>
            <Link to="/signup">📝 Signup</Link>
          </>
        )}
      </div>

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
    </Router>
  );
}

export default App;
