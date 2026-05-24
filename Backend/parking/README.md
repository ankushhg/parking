# 🕉️ Sringeri Temple Parking Management System

**Complete Enterprise-Grade Parking System for Sringeri Temple**

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0.5-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-24-orange.svg)](https://www.oracle.com/java/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue.svg)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Security](#security)
- [Real-Time Updates](#real-time-updates)
- [Default Credentials](#default-credentials)

---

## 🎯 Overview

A comprehensive, production-ready parking management system specifically designed for **Sringeri Temple's open ground parking area**. The system manages 60 parking slots across 3 zones (A, B, C) with support for two-wheelers, four-wheelers, and heavy vehicles.

### Key Highlights

✅ **Zero Floor/Level Complexity** — Designed for open ground parking  
✅ **Multi-Zone Management** — 3 zones with different vehicle types  
✅ **Real-Time Slot Updates** — WebSocket-based live notifications  
✅ **Automated Billing** — Hourly rate calculation with minimum 1-hour charge  
✅ **Auto-Expiry Scheduler** — Automatically expires sessions after 24 hours  
✅ **Complete Audit Trail** — Every action logged with timestamp  
✅ **Role-Based Access** — Separate Admin & User panels  
✅ **JWT Authentication** — Secure token-based auth  
✅ **Handicap Reserved Slots** — 2 dedicated slots in Zone A  

---

## 🚀 Features

### 👤 User Panel Features

| Feature | Description |
|---------|-------------|
| **Registration & Login** | Secure JWT-based authentication |
| **Vehicle Check-In** | Auto-assign or manual slot selection |
| **Zone Preference** | Choose preferred parking zone (A/B/C) |
| **Real-Time Slot Availability** | Filter by vehicle type and zone |
| **Active Session Tracking** | View current parking session with live duration |
| **Check-Out & Billing** | Automatic fare calculation (₹10/₹20/₹50 per hour) |
| **Parking History** | Complete session history with receipts |
| **Vehicle Lookup** | Find active session by vehicle number |

### 🔐 Admin Panel Features

| Feature | Description |
|---------|-------------|
| **Live Dashboard** | Real-time stats: occupancy, revenue, active sessions |
| **Session Management** | View all active/completed sessions |
| **Force Check-Out** | Admin can manually check out any vehicle |
| **Slot Management** | Add/delete/update slots, set MAINTENANCE status |
| **Rate Configuration** | Update parking rates for each vehicle type |
| **User Management** | Enable/disable user accounts |
| **Revenue Reports** | Generate reports by date range with vehicle breakdown |
| **Audit Logs** | Complete activity trail with user, action, timestamp |
| **Zone Analytics** | Slot distribution and availability by zone |

### ⚙️ System Features

- **Auto-Expiry Scheduler** — Runs every 5 minutes, expires sessions older than 24 hours
- **WebSocket Broadcasting** — Real-time slot status updates to all connected clients
- **Minimum Billing** — 1-hour minimum charge, then hourly ceiling
- **Duplicate Prevention** — Cannot check in same vehicle twice
- **Slot Type Validation** — Ensures vehicle type matches slot type
- **Handicap Support** — 2 reserved slots in Zone A (A-01, A-02)
- **Global Exception Handling** — Clean error responses
- **CORS Enabled** — Ready for frontend integration

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                            │
│  (React/Angular/Vue Frontend - WebSocket + REST API)       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   SECURITY LAYER                            │
│  JWT Filter → Authentication → Role-Based Authorization     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  CONTROLLER LAYER                           │
│  AuthController | UserController | AdminController          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   SERVICE LAYER                             │
│  AuthService | ParkingService | AdminService                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                 REPOSITORY LAYER (JPA)                      │
│  UserRepo | SlotRepo | SessionRepo | RateRepo | AuditRepo   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE (MySQL)                         │
│  users | parking_slots | parking_sessions | parking_rates   │
│  audit_logs                                                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                 BACKGROUND SERVICES                         │
│  • ParkingExpiryScheduler (every 5 min)                    │
│  • SlotUpdatePublisher (WebSocket /topic/slots)            │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| **Backend Framework** | Spring Boot 4.0.5 |
| **Language** | Java 24 |
| **Security** | Spring Security 6.x + JWT (jjwt 0.11.5) |
| **Database** | MySQL 8.0 |
| **ORM** | Spring Data JPA + Hibernate |
| **Real-Time** | WebSocket (STOMP) |
| **Scheduler** | Spring Scheduling |
| **Build Tool** | Maven |
| **Utilities** | Lombok, BCrypt |

---

## 📦 Installation

### Prerequisites

- Java 24 (or Java 17+)
- MySQL 8.0+
- Maven 3.9+

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd parking
```

### Step 2: Configure Database

Update `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/Parking?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD
```

### Step 3: Build & Run

```bash
# Using Maven Wrapper (Windows)
mvnw.cmd clean install
mvnw.cmd spring-boot:run

# Using Maven Wrapper (Linux/Mac)
./mvnw clean install
./mvnw spring-boot:run

# Or using installed Maven
mvn clean install
mvn spring-boot:run
```

### Step 4: Access Application

- **Backend API**: `http://localhost:3955`
- **WebSocket**: `ws://localhost:3955/ws`

---

## 📚 API Documentation

### Base URL: `http://localhost:3955`

---

### 🔓 Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Pass@1234",
  "phone": "9876543210"
}

Response: 200 OK
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "USER",
  "name": "John Doe",
  "userId": 1
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Pass@1234"
}

Response: 200 OK
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "USER",
  "name": "John Doe",
  "userId": 1
}
```

---

### 👤 User Endpoints

**All endpoints require `Authorization: Bearer <token>` header**

#### Check-In Vehicle
```http
POST /api/user/checkin
Authorization: Bearer <token>
Content-Type: application/json

{
  "vehicleNumber": "KA01AB1234",
  "vehicleType": "FOUR_WHEELER",
  "preferredZone": "A",
  "slotId": null  // Optional: specify slot ID or leave null for auto-assign
}

Response: 200 OK
{
  "sessionId": 1,
  "vehicleNumber": "KA01AB1234",
  "vehicleType": "FOUR_WHEELER",
  "slotNumber": "A-21",
  "zone": "A",
  "checkIn": "2024-05-23T10:30:00",
  "checkOut": null,
  "amountCharged": null,
  "status": "ACTIVE",
  "userName": "John Doe",
  "userPhone": "9876543210",
  "durationMinutes": 0
}
```

#### Check-Out Vehicle
```http
POST /api/user/checkout/1
Authorization: Bearer <token>

Response: 200 OK
{
  "sessionId": 1,
  "vehicleNumber": "KA01AB1234",
  "vehicleType": "FOUR_WHEELER",
  "slotNumber": "A-21",
  "zone": "A",
  "checkIn": "2024-05-23T10:30:00",
  "checkOut": "2024-05-23T13:45:00",
  "amountCharged": 80.00,
  "status": "COMPLETED",
  "userName": "John Doe",
  "userPhone": "9876543210",
  "durationMinutes": 195
}
```

#### Get My Sessions
```http
GET /api/user/sessions
Authorization: Bearer <token>

Response: 200 OK
[
  {
    "sessionId": 1,
    "vehicleNumber": "KA01AB1234",
    "vehicleType": "FOUR_WHEELER",
    "slotNumber": "A-21",
    "zone": "A",
    "checkIn": "2024-05-23T10:30:00",
    "checkOut": "2024-05-23T13:45:00",
    "amountCharged": 80.00,
    "status": "COMPLETED",
    "userName": "John Doe",
    "userPhone": "9876543210",
    "durationMinutes": 195
  }
]
```

#### Get Available Slots
```http
GET /api/user/slots/available?vehicleType=FOUR_WHEELER&zone=A
Authorization: Bearer <token>

Response: 200 OK
[
  {
    "id": 21,
    "slotNumber": "A-21",
    "zone": "A",
    "vehicleType": "FOUR_WHEELER",
    "status": "AVAILABLE",
    "handicapReserved": false
  }
]
```

#### Get All Slots
```http
GET /api/user/slots
Authorization: Bearer <token>

Response: 200 OK (Array of all 60 slots)
```

#### Find Session by Vehicle Number
```http
GET /api/user/session/vehicle/KA01AB1234
Authorization: Bearer <token>

Response: 200 OK (SessionResponse object)
```

---

### 🔐 Admin Endpoints

**All endpoints require `Authorization: Bearer <admin-token>` header**

#### Get Dashboard Stats
```http
GET /api/admin/dashboard
Authorization: Bearer <admin-token>

Response: 200 OK
{
  "totalSlots": 60,
  "availableSlots": 45,
  "occupiedSlots": 15,
  "activeSessions": 15,
  "todayRevenue": 1250.00,
  "totalRevenue": 45600.00,
  "slotsByZone": {
    "A": 30,
    "B": 20,
    "C": 10
  },
  "availableByVehicleType": {
    "TWO_WHEELER": 18,
    "FOUR_WHEELER": 25,
    "HEAVY_VEHICLE": 2
  },
  "totalUsers": 150,
  "totalSessionsToday": 42
}
```

#### Get All Sessions
```http
GET /api/admin/sessions
Authorization: Bearer <admin-token>

Response: 200 OK (Array of all sessions)
```

#### Get Active Sessions
```http
GET /api/admin/sessions/active
Authorization: Bearer <admin-token>

Response: 200 OK (Array of active sessions)
```

#### Admin Force Check-Out
```http
POST /api/admin/sessions/1/checkout
Authorization: Bearer <admin-token>

Response: 200 OK (SessionResponse with billing)
```

#### Add New Slot
```http
POST /api/admin/slots
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "slotNumber": "A-31",
  "zone": "A",
  "vehicleType": "FOUR_WHEELER",
  "status": "AVAILABLE",
  "handicapReserved": false
}

Response: 200 OK (SlotResponse)
```

#### Update Slot Status
```http
PATCH /api/admin/slots/21/status?status=MAINTENANCE
Authorization: Bearer <admin-token>

Response: 200 OK (SlotResponse)
```

#### Delete Slot
```http
DELETE /api/admin/slots/21
Authorization: Bearer <admin-token>

Response: 204 No Content
```

#### Get Parking Rates
```http
GET /api/admin/rates
Authorization: Bearer <admin-token>

Response: 200 OK
[
  {
    "id": 1,
    "vehicleType": "TWO_WHEELER",
    "ratePerHour": 10.00,
    "updatedAt": "2024-05-23T10:00:00"
  },
  {
    "id": 2,
    "vehicleType": "FOUR_WHEELER",
    "ratePerHour": 20.00,
    "updatedAt": "2024-05-23T10:00:00"
  },
  {
    "id": 3,
    "vehicleType": "HEAVY_VEHICLE",
    "ratePerHour": 50.00,
    "updatedAt": "2024-05-23T10:00:00"
  }
]
```

#### Update Parking Rate
```http
PUT /api/admin/rates
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "vehicleType": "FOUR_WHEELER",
  "ratePerHour": 25.00
}

Response: 200 OK (ParkingRate object)
```

#### Get All Users
```http
GET /api/admin/users
Authorization: Bearer <admin-token>

Response: 200 OK (Array of all users)
```

#### Toggle User Status (Enable/Disable)
```http
PATCH /api/admin/users/5/toggle
Authorization: Bearer <admin-token>

Response: 200 OK
```

#### Generate Revenue Report
```http
GET /api/admin/reports?from=2024-05-01T00:00:00&to=2024-05-31T23:59:59
Authorization: Bearer <admin-token>

Response: 200 OK
{
  "period": "2024-05-01T00:00:00 to 2024-05-31T23:59:59",
  "totalSessions": 450,
  "totalRevenue": 12500.00,
  "twoWheelerCount": 200,
  "fourWheelerCount": 220,
  "heavyVehicleCount": 30,
  "sessions": [ /* Array of SessionResponse */ ]
}
```

#### Get Audit Logs
```http
GET /api/admin/audit-logs
Authorization: Bearer <admin-token>

Response: 200 OK
[
  {
    "id": 1,
    "performedBy": "admin@sringeri.temple",
    "action": "CHECK_IN",
    "details": "Vehicle: KA01AB1234 | Slot: A-21",
    "timestamp": "2024-05-23T10:30:00"
  }
]
```

---

## 🗄️ Database Schema

### Tables

#### `users`
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT |
| name | VARCHAR(255) | NOT NULL |
| email | VARCHAR(255) | NOT NULL, UNIQUE |
| password | VARCHAR(255) | NOT NULL (BCrypt hashed) |
| phone | VARCHAR(20) | NOT NULL, UNIQUE |
| role | ENUM('ADMIN', 'USER') | NOT NULL |
| enabled | BOOLEAN | DEFAULT TRUE |
| created_at | TIMESTAMP | NOT NULL |

#### `parking_slots`
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT |
| slot_number | VARCHAR(10) | NOT NULL, UNIQUE |
| zone | ENUM('A', 'B', 'C') | NOT NULL |
| vehicle_type | ENUM('TWO_WHEELER', 'FOUR_WHEELER', 'HEAVY_VEHICLE') | NOT NULL |
| status | ENUM('AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE') | NOT NULL |
| is_handicap_reserved | BOOLEAN | DEFAULT FALSE |

#### `parking_sessions`
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT |
| user_id | BIGINT | FOREIGN KEY → users(id) |
| slot_id | BIGINT | FOREIGN KEY → parking_slots(id) |
| vehicle_number | VARCHAR(20) | NOT NULL |
| vehicle_type | ENUM | NOT NULL |
| check_in | TIMESTAMP | NOT NULL |
| check_out | TIMESTAMP | NULL |
| amount_charged | DECIMAL(10,2) | NULL |
| status | ENUM('ACTIVE', 'COMPLETED', 'EXPIRED', 'CANCELLED') | NOT NULL |
| remarks | TEXT | NULL |

#### `parking_rates`
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT |
| vehicle_type | ENUM | NOT NULL, UNIQUE |
| rate_per_hour | DECIMAL(10,2) | NOT NULL |
| updated_at | TIMESTAMP | NULL |

#### `audit_logs`
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT |
| performed_by | VARCHAR(255) | NULL |
| action | VARCHAR(50) | NOT NULL |
| details | TEXT | NULL |
| timestamp | TIMESTAMP | NOT NULL |

---

## 🔒 Security

### JWT Authentication

- **Algorithm**: HS256
- **Token Expiry**: 24 hours (86400000 ms)
- **Secret Key**: Configurable in `application.properties`

### Password Encryption

- **Algorithm**: BCrypt
- **Strength**: 10 rounds (default)

### Role-Based Access Control

| Role | Access |
|------|--------|
| **ADMIN** | Full access to `/api/admin/**` + all user endpoints |
| **USER** | Access to `/api/user/**` only |
| **Public** | `/api/auth/**` (register, login) |

### CORS Configuration

- **Allowed Origins**: All (`*` pattern)
- **Allowed Methods**: GET, POST, PUT, DELETE, PATCH, OPTIONS
- **Credentials**: Enabled

---

## 🔴 Real-Time Updates

### WebSocket Configuration

**Endpoint**: `ws://localhost:3955/ws`  
**Protocol**: STOMP over SockJS  
**Topic**: `/topic/slots`

### Message Format

```json
{
  "slotId": 21,
  "status": "OCCUPIED",
  "timestamp": "2024-05-23T10:30:00"
}
```

### Client Integration Example (JavaScript)

```javascript
const socket = new SockJS('http://localhost:3955/ws');
const stompClient = Stomp.over(socket);

stompClient.connect({}, function(frame) {
    console.log('Connected: ' + frame);
    
    stompClient.subscribe('/topic/slots', function(message) {
        const update = JSON.parse(message.body);
        console.log('Slot Update:', update);
        // Update UI with new slot status
    });
});
```

---

## 🔑 Default Credentials

### Admin Account

```
Email:    admin@sringeri.temple
Password: Admin@1234
```

**⚠️ IMPORTANT**: Change the default admin password immediately after first login in production!

---

## 📊 Parking Zone Layout

```
┌─────────────────────────────────────────────────────────────┐
│                      ZONE A (30 slots)                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Two-Wheelers: A-01 to A-20 (20 slots)              │   │
│  │  ⚠️  A-01, A-02 = Handicap Reserved                  │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Four-Wheelers: A-21 to A-30 (10 slots)             │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      ZONE B (20 slots)                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Four-Wheelers: B-01 to B-20 (20 slots)             │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      ZONE C (10 slots)                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Heavy Vehicles: C-01 to C-10 (10 slots)            │   │
│  │  (Buses, Vans, Trucks)                               │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

Total Capacity: 60 vehicles
```

---

## 💰 Pricing Structure

| Vehicle Type | Rate per Hour | Minimum Charge |
|--------------|---------------|----------------|
| Two-Wheeler | ₹10 | ₹10 (1 hour) |
| Four-Wheeler | ₹20 | ₹20 (1 hour) |
| Heavy Vehicle | ₹50 | ₹50 (1 hour) |

**Billing Logic**: Ceiling function applied (e.g., 1 hour 15 minutes = 2 hours charge)

---

## ⏰ Automated Scheduler

### Parking Expiry Scheduler

- **Frequency**: Every 5 minutes
- **Function**: Auto-expires sessions older than 24 hours
- **Actions**:
  - Sets session status to `EXPIRED`
  - Releases occupied slot to `AVAILABLE`
  - Broadcasts slot update via WebSocket
  - Logs expiry in audit trail

---

## 🧪 Testing

### Manual Testing with cURL

#### Register User
```bash
curl -X POST http://localhost:3955/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Test@1234","phone":"9876543210"}'
```

#### Login
```bash
curl -X POST http://localhost:3955/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sringeri.temple","password":"Admin@1234"}'
```

#### Check-In (Replace TOKEN)
```bash
curl -X POST http://localhost:3955/api/user/checkin \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"vehicleNumber":"KA01AB1234","vehicleType":"FOUR_WHEELER","preferredZone":"A"}'
```

---

## 📝 Configuration

### application.properties

```properties
# Application
spring.application.name=Sringeri Temple Parking System
server.port=3955

# Database
spring.datasource.url=jdbc:mysql://localhost:3306/Parking?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=bca123

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect

# JWT
jwt.secret=SringeriTempleSecretKey2024SuperSecureKeyForJWT
jwt.expiration=86400000

# Parking Configuration
parking.max-hours=24
parking.zone.a.capacity=30
parking.zone.b.capacity=20
parking.zone.c.capacity=10

# Default Rates
parking.rate.two-wheeler=10
parking.rate.four-wheeler=20
parking.rate.heavy-vehicle=50
```

---

## 🚦 Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 204 | No Content (successful deletion) |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (invalid/missing token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 409 | Conflict (duplicate entry, slot occupied) |
| 500 | Internal Server Error |

---

## 📞 Support

For issues, questions, or contributions:

- **Email**: support@sringeri.temple
- **GitHub Issues**: [Create Issue](https://github.com/your-repo/issues)

---

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details

---

## 🙏 Acknowledgments

Built with dedication for **Sringeri Sharada Peetham** 🕉️

---

**Version**: 1.0.0  
**Last Updated**: May 2024  
**Status**: ✅ Production Ready
