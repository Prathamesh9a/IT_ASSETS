# IT Asset Management Tool

## Overview

This project is an **IT Asset Management Tool** that helps manage and track company assets. The backend is built using **Django** with **Django REST Framework** (DRF), and the frontend is built using **React**. The project includes authentication APIs, asset management, and other modules with scalability and modularity in mind.

## Backend Architecture

* **Framework**: Django
* **API Design**: RESTful, versioned with `/api/v1/`
* **Authentication**: JWT-based authentication using `djangorestframework-simplejwt`
* **Frontend Integration**: React (Web) and Flutter (Mobile)
* **Database**: SQL Server (MSSQL)
* **API Documentation**: `http://127.0.0.1:8000/swagger/` and `http://127.0.0.1:8000/redoc/` for frontend developers
---

## Installation & Setup

### Requirements

* **Python 3.x**
* **Django 4.x**
* **Django REST Framework**
* **Django Simple JWT**
* **SQL Server / MSSQL**
* [Check requirements.txt for more](https://github.com/OmkarZagade9A/My-Assets/blob/main/requirements.txt)

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/my-assets.git
cd My-assets
```

### 2. Create a virtual environment

```bash
python -m venv myenv
```

### 3. Install Python dependencies

Activate the virtual environment and install dependencies:

```bash
# Windows
myenv\Scripts\activate

# macOS/Linux
source myenv/bin/activate

pip install -r requirements.txt
```

### 4. Set up the config

Create `assetsConf.ini` file outside `My-Assets` repo. :

```text
[ITAssets]
DEBUG = True

[ITAssetsDB]
DB_NAME = IT_Assets
DB_USER = *****
DB_PSWD = *****
DB_HOST = *****

[ITAssetsMail]
EMAIL_HOST = smtp3.netcore.co.in
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = Your 9A mail
EMAIL_HOST_PASSWORD = mail password
```

### 5. Run migrations

first run this
```bash
python manage.py migrate employeeManagement
```
then
```bash
python manage.py migrate
```

in case token_blacklist error:
```sql
SELECT name, type_desc
FROM sys.objects
WHERE parent_object_id = OBJECT_ID('token_blacklist_blacklistedtoken');

ALTER TABLE token_blacklist_blacklistedtoken
DROP CONSTRAINT UQ__token_bl__CB3C9E160B447296; -- get matching value UQ__token_bl__CB3C9E160B447296
```

run migration after this

### 6. Create a superuser (optional)

To access the Django admin panel:

```bash
python manage.py createsuperuser
```

### 7. Run the development server

```bash
python manage.py runserver
```

The backend should now be running on `http://127.0.0.1:8000`.

---

## Frontend Setup (React)

### 1. Install Node.js dependencies

Navigate to the `frontend` directory:

```bash
cd frontend
npm install
```

### 2. Run the frontend development server

```bash
npm start
```

The React app should now be running on `http://localhost:3000`.

---

## File Structure

```bash
My-assets/
│
├── Backend/                # Django Backend
│   ├── accounts/     # Authentication module
│   ├── assets/             # Assets module (example)
│   ├── my_assets/          # Project settings
│   └── manage.py
│
├── frontend/               # React Frontend
│   ├── public/
│   ├── src/
│   └── package.json
│
└── requirements.txt        # Backend dependencies
```
