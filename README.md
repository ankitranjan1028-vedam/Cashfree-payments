# 🧾 Order & Payment System — Frontend

This is the frontend of a full-stack order and payment management system. Built using **Next.js** and **Material UI**, this app allows users to fill out an order form, see the saved entries, and make payments using the **Cashfree** payment gateway.

> ⚠️ Note: This repository currently only includes the **frontend implementation**. The backend (Spring Boot + MySQL) and Cashfree integration are assumed to be developed separately.

---

## 📦 Tech Stack

| Layer      | Tech Used           |
|------------|---------------------|
| Frontend   | Next.js, Material UI|
| Backend    | Spring Boot         |
| Database   | MySQL               |
| Payments   | Cashfree PG         |

---

## 🔁 Flow Overview

```mermaid
flowchart TD
    %% ── Frontend ────────────────────────────
    subgraph Frontend
        A["User fills form<br/>clicks Submit"]
        C["List page shows entries<br/>Pay button"]
        E["Open Cashfree Checkout<br/>(sessionId)"]
        H["Show payment‑status page"]
    end

    %% ── Backend ─────────────────────────────
    subgraph Backend
        B["POST /orders/save"]
        D["POST /orders"]
        G["GET  /orders/{id}/verify"]
    end

    %% ── Database ────────────────────────────
    subgraph Database
        DB[(MySQL)]
    end

    %% ── Cashfree ────────────────────────────
    subgraph Cashfree
        CF_Create["Create Order API"]
        CF_Checkout["Payment UI"]
        CF_Verify["Verify Payment API"]
    end

    A -->|POST /orders/save| B
    B --> DB
    DB --> B
    B -->|200 OK| C

    C -->|POST /orders| D
    D --> CF_Create
    CF_Create -->|sessionId| D
    D -->|sessionId| E

    E --> CF_Checkout
    E -.->|GET /orders/{id}/verify| G
    G --> CF_Verify
    CF_Verify --> G
    G -->|status| H
