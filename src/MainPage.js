import React, { useState } from "react";
import "./App.css";

// Import crop images
import Rice from "./cropImages/rice.jpg";
import Maize from "./cropImages/maize.jpg";
import Chickpea from "./cropImages/chickpea.jpg";
import Kidneybeans from "./cropImages/kidneybeans.jpg";
import Pigeonpeas from "./cropImages/pigeonpeas.jpg";
import Mothbeans from "./cropImages/mothbeans.jpg";
import Mungbean from "./cropImages/mungbean.jpg";
import Blackgram from "./cropImages/blackgram.jpg";
import Lentil from "./cropImages/lentil.jpg";
import Pomegranate from "./cropImages/pomegranate.jpg";
import Banana from "./cropImages/banana.jpg";
import Mango from "./cropImages/mango.jpg";
import Grapes from "./cropImages/grapes.jpg";
import Watermelon from "./cropImages/watermelon.jpg";
import Muskmelon from "./cropImages/muskmelon.jpg";
import Apple from "./cropImages/apple.jpg";
import Orange from "./cropImages/orange.jpg";
import Papaya from "./cropImages/papaya.jpg";
import Coconut from "./cropImages/coconut.jpg";
import Cotton from "./cropImages/cotton.jpg";
import Jute from "./cropImages/jute.jpg";
import Coffee from "./cropImages/coffee.jpg";

// Crop mapping with Bengali names and images
const cropMap = {
  Rice: { name: "চাল", img: Rice },
  Maize: { name: "ভুট্টা", img: Maize },
  Chickpea: { name: "ছোলা", img: Chickpea },
  Kidneybeans: { name: "রাজমা", img: Kidneybeans },
  Pigeonpeas: { name: "টিংরা", img: Pigeonpeas },
  Mothbeans: { name: "মটর", img: Mothbeans },
  Mungbean: { name: "মুগডাল", img: Mungbean },
  Blackgram: { name: "কালো ছোলা", img: Blackgram },
  Lentil: { name: "মসুর ডাল", img: Lentil },
  Pomegranate: { name: "ডালিম", img: Pomegranate },
  Banana: { name: "কলা", img: Banana },
  Mango: { name: "আম", img: Mango },
  Grapes: { name: "আঙুর", img: Grapes },
  Watermelon: { name: "তরমুজ", img: Watermelon },
  Muskmelon: { name: "খরবুজ", img: Muskmelon },
  Apple: { name: "আপেল", img: Apple },
  Orange: { name: "কমলা", img: Orange },
  Papaya: { name: "পেঁপে", img: Papaya },
  Coconut: { name: "নারকেল", img: Coconut },
  Cotton: { name: "কটন", img: Cotton },
  Jute: { name: "পাট", img: Jute },
  Coffee: { name: "কফি", img: Coffee },
};

// Bangla labels for inputs
const banglaLabels = {
  N: "নাইট্রোজেন (N)",
  P: "ফসফরাস (P)",
  K: "পটাশিয়াম (K)",
  temperature: "তাপমাত্রা (°C)",
  humidity: "আর্দ্রতা (%)",
  pH: "পিএইচ (pH)",
  EC: "ইলেকট্রনিক পরিবাহিতা (EC)"
};

function MainPage() {
  const [formData, setFormData] = useState({
    N: "", P: "", K: "", temperature: "", humidity: "", pH: "", EC: ""
  });
  const [recommendations, setRecommendations] = useState([]);

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("https://backend-c9ek.onrender.com/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      setRecommendations(data["সুপারিশকৃত ফসল"]);
    } catch (err) {
      console.error("Error:", err);
      alert("কোনো সমস্যা হয়েছে, ব্যাকএন্ড চালু আছে কি দেখুন!");
    }
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
                {cropMap[item.crop] && <img src={cropMap[item.crop].img} alt={item.crop} />}
                <p>সঠিকতার সম্ভাবনা: {Math.round(item.probability * 100)}%</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainPage;
