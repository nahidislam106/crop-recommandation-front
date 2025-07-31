// src/App.js
import React, { useState } from 'react';
import './App.css';

// Importing crop images
import Maize from './cropImages/maize.jpg';
import Cucumber from './cropImages/cucumber.jpg';
import Balsam_Apple from './cropImages/balsam_apple.jpg';
import Chili from './cropImages/chili.jpg';
import Sweet_pumpkin from './cropImages/sweet_pumpkin.jpg';
import Cauliflower from './cropImages/cauliflower.jpg';

// Crop mapping with Bengali name and image
const cropMap = {
  Balsam_Apple: { name: "করলা", img: Balsam_Apple },
  Cauliflower: { name: "ফুলকপি", img: Cauliflower },
  Chili: { name: "মরিচ", img: Chili },
  Cucumber: { name: "শসা", img: Cucumber },
  Maize: { name: "ভুট্টা", img: Maize },
  Sweet_pumpkin: { name: "মিষ্টি কুমড়া", img: Sweet_pumpkin },
};

// Labels in Bangla
const banglaLabels = {
  N: "নাইট্রোজেন (N)",
  P: "ফসফরাস (P)",
  K: "পটাশিয়াম (K)",
  pH: "পিএইচ (pH)",
  EC: "ইলেকট্রনিক পরিবাহিতা (EC)",
  temperature: "তাপমাত্রা (°C)",
  humidity: "আর্দ্রতা (%)"
};

function App() {
  const [formData, setFormData] = useState({
    N: '', P: '', K: '', pH: '', EC: '', temperature: '', humidity: ''
  });
  const [recommendations, setRecommendations] = useState([]);

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("https://backend-c9ek.onrender.com/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    setRecommendations(data["সুপারিশকৃত ফসল"]);
  };

  return (
    <div className="container">
      <h1>🌾 ফসল সুপারিশ ব্যবস্থা</h1>
      <div className="main-content">
        <form className="input-section" onSubmit={handleSubmit}>
          {Object.keys(formData).map((key) => (
            <div className="input-group" key={key}>
              <label>{banglaLabels[key]}</label>
              <input
                type="number"
                name={key}
                value={formData[key]}
                onChange={handleChange}
                step="any"
                required
              />
            </div>
          ))}
          <button type="submit">সুপারিশ দেখুন</button>
        </form>

        <div className="results">
          <h2>✅ সুপারিশকৃত ফসলসমূহ:</h2>
          <div className="crop-grid">
            {recommendations.map((item, index) => (
              <div className="card" key={index}>
                <h3>{index + 1}. {cropMap[item.crop]?.name || item.crop}</h3>
                {cropMap[item.crop] && (
                  <img src={cropMap[item.crop].img} alt={item.crop} />
                )}
                <p>সঠিকতার সম্ভাবনা: {Math.round(item.probability * 100)}%</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
