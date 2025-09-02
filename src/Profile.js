import React, { useState, useEffect } from "react";
import { auth } from "./firebase";
import { useNavigate } from "react-router-dom";
import { Document, Packer, Paragraph } from "docx";
import "./Profile.css";

function Profile() {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [landPredictions, setLandPredictions] = useState({});
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
      setAddress(savedProfile.address || "");
    }

    let savedPredictions = JSON.parse(localStorage.getItem(`predictions_${user.uid}`)) || {};
    Object.keys(savedPredictions).forEach(land => {
      if (!Array.isArray(savedPredictions[land])) savedPredictions[land] = [];
    });

    setLandPredictions(savedPredictions);
  }, [user, navigate]);

  const saveProfile = () => {
    if (!name || !address) {
      alert("সব তথ্য দিন!");
      return;
    }
    const profileData = { name, email, address };
    localStorage.setItem(`profile_${user.uid}`, JSON.stringify(profileData));
    alert("Profile সংরক্ষণ হয়েছে!");
  };

  const savePredictionAsDoc = async (land, date, predictionData) => {
    const docFile = new Document({
      sections: [
        {
          children: [
            new Paragraph({ text: "Crop Prediction Report", heading: "Heading1" }),
            new Paragraph({ text: `Name: ${name}` }),
            new Paragraph({ text: `Email: ${email}` }),
            new Paragraph({ text: `Address: ${address}` }),
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
  };

  return (
    <div className="profile-container">
      <div className="profile-box">
        <h2>👤 Profile</h2>
        <div className="input-group">
          <label>Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="input-group">
          <label>Email</label>
          <input value={email} disabled />
        </div>
        <div className="input-group">
          <label>Address</label>
          <input value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>

        <button onClick={saveProfile} className="save-profile-btn">Save Profile</button>
      </div>

      <div className="predictions-box">
        <h3>📄 Saved Predictions</h3>
        {Object.keys(landPredictions).length === 0 && <p>No predictions yet</p>}

        {Object.entries(landPredictions).map(([land, entries]) => (
          <div key={land} className="land-section">
            <h4>🏞 Land: {land}</h4>
            {Array.isArray(entries) && entries.length > 0 ? (
              entries.map((entry, idx) => (
                <div key={idx} className="prediction-entry">
                  <span><strong>Date:</strong> {entry.date}</span>
                  <span><strong>Prediction:</strong> {entry.prediction}</span>
                  <button
                    onClick={() => savePredictionAsDoc(land, entry.date, entry.prediction)}
                    className="save-doc-btn"
                  >
                    Save as Doc
                  </button>
                </div>
              ))
            ) : (
              <p>No predictions for this land.</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Profile;
