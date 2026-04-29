# QR-Based Digital ID & Entry Logger

A web-based QR attendance system that replaces traditional biometric systems by enabling real-time QR scanning, validation, and logging using Google Apps Script and Google Sheets.

---

##  Live Links

* **Scanner Web App:** (https://rudransh-gif.github.io/QR_Final_/)
  
* **Apps Script Backend:** https://script.google.com/macros/s/AKfycbxhdXteo1snnXNwlEW0JAmik2Nt5FkSGIvasb793IYJf404R3gzrHQgmvUhvV0L4wvt/exec
  
* **Apps Script Project:** https://script.google.com/u/0/home/projects/1SyrurnF-Rcw6D6pEAX1njmfuXLqKCZuuAbedBHIXnCvxdWZjwDQJzOBU/edit

Note: The Apps Script project is bound to the Google Sheet. Access to the sheet allows evaluation of the backend logic.
  
* **Google Sheet (Database):** https://docs.google.com/spreadsheets/d/19tlaanbAzCvVTBLxlDC7w4_JL201LM5uDUlmXbi7bcc/edit?usp=sharing
  
* **QR Codes Folder:** (https://drive.google.com/drive/folders/1RP5VpF6eeDnTfu52UYCN3RpAUoIcEYbf?usp=sharing)

---

##  System Architecture

```
Frontend (Scanner) → Apps Script API → Google Sheets
```

* **Frontend:** HTML + JavaScript QR scanner (ZXing)
* **Backend:** Google Apps Script (`doPost`)
* **Database:** Google Sheets (Users & Logs)

---

##  QR Code Logic

* Each user has a unique ID (e.g., `STU001`)
* QR code stores plain text ID
* QR codes generated and stored in Google Drive
* Links stored in Users sheet

---

##  Scanner Workflow

1. User opens scanner web app
2. Camera scans QR code
3. QR decoded into user ID
4. ID sent to backend via POST request
5. Backend validates and returns response
6. Result displayed instantly

---

##  Validation & Logging

* Checks if user exists in **Users sheet**
* Determines last status (IN / OUT)
* Toggles status automatically:

  * First scan → IN
  * Next scan → OUT
* Logs stored in **Logs sheet**

---

##  Features

* Real-time QR scanning
* Automatic IN/OUT detection
* Duplicate scan prevention (cooldown)
* Google Drive QR storage
* Clean and minimal UI

---

##  Challenges & Solutions

| Challenge                     | Solution                       |
| ----------------------------- | ------------------------------ |
| Camera blocked in Apps Script | Used external hosted frontend  |
| Network/CORS errors           | Proper Web App deployment      |
| QR format mismatch            | Standardized to plain text IDs |
| Duplicate scans               | Added cooldown logic           |

---

## 📂 Project Structure

```
├── Code.gs
├── generate.html
├── index.html (scanner)
├── README.md
```

---

## 🧪 Example QR Content

```
STU001
```

---

## 🧾 Logs Format

| ID     | Name     | Timestamp | Status |
| ------ | -------- | --------- | ------ |
| STU001 | Rudransh | Time      | IN     |

---

## 📌 Notes

* Apps Script project is bound to the Google Sheet
* Access to the sheet allows viewing the backend environment
* Scanner must be hosted on HTTPS for camera access

---

## 🎯 Conclusion

This system demonstrates a scalable QR-based attendance solution using web technologies and cloud-based storage, ensuring accuracy, efficiency, and real-time logging.
