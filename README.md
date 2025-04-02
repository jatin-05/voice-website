# 🚀 SightAid - AI-Powered Assistance for Elderly & Visually Impaired Users  

SightAid is an AI-powered tool designed to assist elderly individuals and visually impaired users by scanning and interpreting medicine labels, bills, documents, and objects. It provides **text-to-speech descriptions, insights, and history tracking** for better accessibility.  

---

## 🛠️ Tech Stack  

### 🎨 **Frontend**  
- ⚛️ React.js  
- 🎨 Tailwind CSS  


### 🤖 **AI/ML**  
- 🐍 Python (FastAPI)  
- 🧠 Vision-Language Models (VLM)  
- 🔗 LangChain  


---

## 🌟 Features  

✅ **Medicine Label Scanner** – Reads and explains medicine labels, including dosage and expiry.  
✅ **Bill/Document Scanner** – Extracts key details from bills, invoices, and receipts.  
✅ **Object or Currency Detector** – Identifies objects or currency for visually impaired users.  
✅ **AI Insights & Text-to-Speech** – Provides meaningful insights and voice-based descriptions.  
✅ **Scan History** – Saves past scans for quick access.  

---



## To Run Locally

    setting up frontend

        cd to frontend folder
        npm install
        set up an .env file 
            VITE_API_URL = http://localhost:8000/process

        npm run dev
        now open the localhost link in browser allow the camera and microphone


    setting up fastapi

        cd to backend folder
        in cli run
        pip install -r requirements.txt
        
        open main.py
        change code in the last line

            uvicorn.run(app , host = '0.0.0.0')
            # uvicorn.run(app , host = 'localhost' , port =8000)

            to

            #uvicorn.run(app , host = '0.0.0.0')
            uvicorn.run(app , host = 'localhost' , port =8000)

        Now run the main.py file in the cli







