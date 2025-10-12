# 🥗 Food2Plate – AI-Powered Food Donation & Waste Reduction Platform  

### 🌍 *Turning Surplus Food into Smiles, Not Waste*  

---

## 🚩 Problem Statement  

Every day, tons of edible food are wasted by restaurants, hostels, and households — while millions of people still go hungry.  
There’s no efficient, transparent, and safe way to distribute surplus food responsibly.  
Additionally, food safety and quality assurance remain major concerns when sharing leftovers.  

---

## 💡 Proposed Solution  

**Food2Plate** is an **AI-powered food donation platform** that connects **donors** (restaurants, homes, cafeterias) with **receivers** (NGOs, shelters, and needy individuals).  

The platform ensures:  
✅ Safe food sharing through **AI-based food quality detection**  
🗺️ Easy discovery via **Google Maps integration**  
🏅 Motivation through **Gamification & CSR Rewards**  
📊 Awareness through **Carbon Footprint & Impact Tracking**  

> 🎯 **Mission:** To reduce food waste, promote sustainability, and ensure no one sleeps hungry.  

---

## 🧠 Key Features  

### 🤖 AI Food Quality Predictor  
- Uses an AI model to analyze uploaded food images.  
- Predicts **freshness**, **confidence**, and **estimated shelf life**.  
- Automatically attaches an **AI Quality Report** to each food post.  

### 📦 Donor Food Posting  
- Donors upload image + details + location on map.  
- AI evaluates food quality before posting.  
- Posts include pickup location, shelf life, and AI report.  

### 👥 Receiver Dashboard  
- Displays available food posts with AI reports.  
- Option to **recheck food quality** before reserving.  
- Simple reservation system for food pickup.  

### 🧾 Reports & Transparency  
- Both donors and receivers can view detailed AI reports.  
- Improves trust, accountability, and safety.  

### 🏅 Gamification & CSR Integration  
- Users earn **Green Points** for donating or reserving food.  
- Generates **CSR Certificates (PDF)** for organizations.  
- Dashboard shows **total food saved, CO₂ prevented, and meals shared**.  

---

## 🧩 Tech Stack  

### **Frontend**
| Feature | Technology |
|----------|-------------|
| **UI Framework** | React (v18.3.1) |
| **Language** | TypeScript |
| **Build Tool** | Vite |
| **Styling** | Tailwind CSS |
| **Routing** | React Router DOM |

### **UI Components**
| Purpose | Library |
|----------|----------|
| Accessible components | Radix UI |
| Styled UI system | Shadcn UI |
| Icons | Lucide React |

### **State & Forms**
| Purpose | Library |
|----------|----------|
| Server state management | TanStack Query (React Query) |
| Form handling & validation | React Hook Form + Zod |

### **Backend (Supabase)**
| Component | Description |
|------------|-------------|
| **Database** | PostgreSQL |
| **Authentication** | Supabase Auth (Email + Google OAuth) |
| **Storage** | Supabase File Storage (for food images) |
| **Edge Functions** | AI Food Quality Analysis (serverless) |

### **Additional Features**
| Purpose | Tool |
|----------|------|
| Maps & Location | Google Maps API + Mapbox GL |
| Charts & Analytics | Recharts |
| PDF Generation | jsPDF (CSR Certificates) |
| Notifications | Sonner (Toast Alerts) |

---

## ⚙️ Setup Instructions  

### 🧱 Clone the Repository  
```bash
git clone https://github.com/HarishSidagam8/Food2Plate_APP.git
cd Food2Plate_APP
```
💻 **Frontend Setup**
```
cd frontend
npm install
npm run build
npm run dev
```

**Create a .env file in frontend with:**
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_BACKEND_URL=https://your-backend.onrender.com
```

**⚙️ Backend Setup**

(If you’re using Supabase Edge Functions, deployment is automatic)
Otherwise, for FastAPI or custom backend:

**🚀 Deployment**
Platform	Purpose
Vercel	Frontend hosting
Supabase	Database, Auth, Storage, Edge Functions
Google Cloud Console	Maps API & OAuth credentials (paid)

💡 All services used are completely free under their free tiers.

## **📊 Impact**
Metric	Description
♻️ Food Waste Reduced	Tracks donated surplus food quantities
🌍 CO₂ Emissions Prevented	Calculates saved emissions per kg of food
🍱 Meals Served	Counts total number of people fed
💚 Green Points Earned	Encourages participation and rewards

“You saved 50 kg of food, prevented 120 kg of CO₂, and fed 40 people.” 🌱

## 🌱 Future Enhancements

📱 Mobile App Version (React Native + Supabase backend)

🤖 Improved AI Models – Multi-modal data (image + time + temperature)

🔗 Blockchain Traceability – Secure food donation tracking

🚗 Volunteer Delivery System – Smart pickup and delivery matching

📊 NGO Analytics Dashboard – Government/CSR impact reporting

## 🧑‍💻 Contributors

 Harish Sidagam – AI/ML Engineer & Front-End Developer
 
 RaviKiran Muthupandiyan -Mern Stack Developer
 
 Santosh Mode -Mern Stack Developer


## 🏁 License

Licensed under the MIT License — free to use, modify, and distribute.

## 💬 Contact

📧 Email: harishsidagam.s8@gmail.com

🌐 GitHub: https://github.com/HarishSidagam8

🌐 Live Demo: https://food2plate-app.vercel.app/

            **-->After creating an account you will get confirmation Email from supabase
             Confirm it to Login in**

💡 Let’s fight hunger and food waste — one plate at a time. 🍽️💚
