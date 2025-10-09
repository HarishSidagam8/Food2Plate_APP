🥗 Food2Plate – AI-Powered Food Donation & Waste Reduction Platform
🌍 Turning Surplus Food into Smiles, Not Waste
🚩 Problem Statement

Every day, tons of edible food are wasted by restaurants, hostels, and households — while millions of people go hungry.
There’s no efficient, transparent, and safe way to distribute surplus food responsibly.
Additionally, food safety and quality assurance remain major concerns when sharing leftovers.

💡 Proposed Solution

Food2Plate is an AI-powered food donation platform that connects donors (restaurants, homes, cafeterias) with receivers (NGOs, shelters, needy individuals).

The platform ensures:

✅ Safe food sharing through AI-based food quality detection

🗺️ Easy discovery via Google Maps integration

🏅 Motivation through Gamification & CSR Rewards

📊 Awareness through Carbon Footprint & Impact Tracking

Mission: To reduce food waste, promote sustainability, and ensure no one sleeps hungry.

🧠 Key Features
🤖 AI Food Quality Predictor

Uses an AI model to analyze uploaded food images.

Predicts freshness, confidence level, and estimated shelf life.

Generates a digital AI Quality Report for every post.

📦 Donor Food Posting

Donors upload image + details + AI report.

Add exact pickup location via Google Map.

Posts saved to backend with reports attached.

👥 Receiver Dashboard

Displays available food posts along with donor’s AI reports.

Option to recheck food quality before reserving.

Reserve food seamlessly with one click.

🧾 Reports & Transparency

Both donors and receivers can view AI-generated reports.

Promotes trust, accountability, and food safety.

🏅 Gamification & CSR Integration

Donors and receivers earn Green Points.

Generate CSR certificates for businesses and restaurants.

Visual dashboard shows CO₂ saved & food distributed.

🧩 Tech Stack
Layer	Technology
Frontend	React + Vite + Tailwind CSS
Backend	FastAPI (Python)
Database	SQLite (local) / Supabase (cloud)
AI Model	Image classification API (FastAPI endpoint)
Maps Integration	Google Maps API
Authentication	JWT + Google OAuth
Hosting	Vercel (Frontend) + Render (Backend)
Version Control	GitHub
⚙️ Setup Instructions
🧱 Clone the Repository
git clone https://github.com/HarishSidagam8/Food2Plate.git
cd Food2Plate

💻 Frontend Setup
cd frontend
npm install
npm run dev


Create .env file:

VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

⚙️ Backend Setup
cd backend
pip install -r requirements.txt
uvicorn main:app --reload


.env:

SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key

🚀 Deployment
Platform	Purpose
Vercel	Frontend hosting
Render	FastAPI backend hosting
Supabase	Cloud database & authentication
Google Cloud Console	Maps API & OAuth credentials

💡 All services used are within free tiers — no paid dependencies required.

📊 Impact
Metric	Description
♻️ Food Waste Reduced	Tracks donated surplus food quantities
🌍 CO₂ Emissions Prevented	Calculates saved emissions per kg of food
🍱 Meals Served	Counts total number of people fed
💚 Green Points Earned	Encourages participation and rewards

“You saved 50 kg of food — prevented 120 kg of CO₂!” 🌱

🌱 Future Enhancements

AI model improvement using multi-modal data (image + temperature + time).

Blockchain integration for food traceability.

Volunteer delivery coordination system.

Mobile app version for on-the-go donations.

Real-time food freshness tracking with IoT sensors.

🧑‍💻 Contributors

Harish Sidagam –AI-ML Engineer, FrontEnd Developer

🏁 License

Licensed under the MIT License – free to use, modify, and distribute.

💬 Contact

📧 Email: harishsidagam.s8@gmail.com

🌐 GitHub: https://github.com/HarishSidagam8

💡 Let’s fight hunger and food waste — one plate at a time. 🍽️💚
