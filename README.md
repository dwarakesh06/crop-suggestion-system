# Crop Suggestion System

An advanced, end-to-end, dataset-driven **Crop Suggestion System** that integrates Machine Learning to provide accurate agricultural recommendations, fertilizer suggestions, and yield estimations. The project features user authentication, prediction logs history, and an administrative control panel equipped with dynamic dataset reloading and automated ML retraining.

---

## 🛠️ Technology Stack

- **Frontend**: React (Vite) + Tailwind CSS + Lucide React + Recharts (Visualizations)
- **Backend**: Node.js + Express.js + Mongoose (MongoDB ODM)
- **AI / ML Service**: Python FastAPI + Scikit-Learn + Pandas + Numpy + Uvicorn
- **Authentication**: JSON Web Tokens (JWT) + BcryptJS Password Hashing
- **File Upload**: Multer (Dataset CSV handling)

---

## 📂 Project Structure

```
crop-suggestion-system/
├── frontend/             # React application (Vite dev server)
├── backend/              # Node.js Express server
├── ai-service/           # FastAPI Machine Learning endpoints & training scripts
├── dataset/              # Sample crop recommendation CSV file
├── models/               # Serialized ML model, scaler, and crop stats JSON
├── uploads/              # Storage directory for newly uploaded datasets
└── README.md             # Project documentation (this file)
```

---

## ⚙️ Features Walkthrough

1. **User Authentication**: Secure Signup, Login, and Protected Routing using hashed password logs and JWT session tokens.
2. **Crop Suggestion**: Multi-variable inputs (Nitrogen, Phosphorus, Potassium, temperature, humidity, pH, rainfall) forwarded to a Random Forest Classifier to predict the ideal crop out of 22 different species.
3. **Fertilizer Advisory**: Compares the user's soil metrics against the optimal statistical mean of the suggested crop. Returns targeted remedies if indicators fall short or exceed healthy bounds.
4. **Yield Estimation**: Evaluates deviations in weather (temperature and rainfall) to estimate expected yield boundaries (in tons per hectare) and advises on drainage/irrigation.
5. **Prediction History**: Logged-in users automatically record all soil assessments to MongoDB to review past logs.
6. **Analytics Dashboard**: Responsive charts graphing system prediction counts, suggested crop trends, and average chemical distributions.
7. **Admin Portal**: Allows administrators to view registered accounts, inspect or delete logs, upload new CSV datasets, and trigger automated retraining of the machine learning model.

---

## 🚀 Setup & Execution Instructions

Follow these steps to run the Crop Suggestion System on a fresh machine.

### Prerequisites
- **Node.js** (v16 or higher)
- **MongoDB** (Running locally on `mongodb://localhost:27017` or an Atlas URI)
- **Python** (v3.8 or higher, with `pip` package manager)

---

### Step 1: Start the Python AI/ML Service
Navigate to the `ai-service` directory, install packages, and spin up the FastAPI server.

1. Open a terminal and move to the `ai-service` folder:
   ```bash
   cd ai-service
   ```
2. Install Python requirements:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the initial training script to generate model files:
   ```bash
   python train.py
   ```
   *(This loads the sample dataset, fits the model, and creates `crop_model.pkl`, `scaler.pkl`, and `crop_stats.json` in the `models` folder).*
4. Start the FastAPI server:
   ```bash
   python main.py
   ```
   The ML service will start running on **`http://localhost:8000`**.

---

### Step 2: Start the Node.js Backend Server
Configure the environment variables and run the backend gateway.

1. Open a new terminal and move to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `.env` (a pre-configured `.env` is already supplied, but you can inspect or modify it):
   ```
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/crop_suggestion_system
   JWT_SECRET=supersecretcropkeyjwt12345
   AI_SERVICE_URL=http://127.0.0.1:8000
   ```
4. Start the backend:
   ```bash
   npm start
   ```
   The backend server will connect to MongoDB and listen on port **`5000`**.

---

### Step 3: Run the React Frontend Application
Launch the Vite development server to view the interface.

1. Open a new terminal and move to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Start the Vite server:
   ```bash
   npm run dev
   ```
4. Click on the local link shown in the terminal (usually **`http://localhost:3000`** or `http://localhost:5173`) to launch the application in your browser.

---

## 💡 Important Admin Setup Note

To test the **Admin Dashboard** and **Model Retraining** features quickly:
1. Head to the **Sign Up** page on the frontend and create a new account.
2. **First-User Promotion**: The backend is configured to promote the very first registered user in the database to the `admin` role automatically.
3. Once signed up, you will immediately see the **Admin** and **Analytics** tabs in the navigation bar. You can upload a new CSV file under **ML Operations** and retrain the model with one click.
