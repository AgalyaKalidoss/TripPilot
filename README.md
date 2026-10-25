# TripPilot AI – Intelligent Travel Planner

**TripPilot AI** is an AI-powered travel planning application that helps users plan journeys, compare transportation options, and receive personalized travel recommendations based on their preferences.

🔗 **Live Demo:** https://trippilot-cqr7.onrender.com/

## Features

- Multimodal travel planning for bus, train, and cab options.
- Personalized recommendations based on budget and preferences.
- AI-assisted travel plan refinement using Google Gemini.
- Alternative route comparison.
- User registration and login.
- Trip saving and management.
- Responsive and user-friendly interface.

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Python, Flask
- **AI:** Google Gemini API
- **Database:** MongoDB Atlas
- **Authentication:** JWT
- **Deployment:** Render
- **Version Control:** Git and GitHub

## Getting Started

1. Clone the repository.
2. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Configure the required environment variables.
4. Start the application:

   ```bash
   python app.py
   ```

## Environment Variables

Configure these variables securely in your local `.env` file or deployment settings:

```env
SECRET_KEY=your_secret_key
MONGO_URI=your_mongodb_connection_string
MONGO_DB=tripAi
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
```

**Note:** Transport options and booking flows currently use demonstration data and do not represent live ticket availability or actual ticket purchases.

## Future Enhancements

- Live transport-provider integration.
- Real-time journey updates and notifications.
- Secure online ticket booking and payments.
- Advanced travel predictions and recommendations.

---

**TripPilot AI** — Plan smarter. Travel better.
