# Examples

## Web Application (React + Node.js + PostgreSQL)

Typical full-stack web app with caching and CDN.

**Components:**
- `CloudFront CDN` (AWS/Cloud, amber) → edge cache
- `React App` (Frontend, cyan) → SPA served from S3/CloudFront
- `Route 53` (AWS/Cloud, amber) → DNS
- `API Gateway` (AWS/Cloud, amber) → routes to backend
- `Node.js API` (Backend, emerald) → Express REST API
- `Auth Service` (Security, rose) → JWT issuance
- `PostgreSQL` (Database, violet) → primary datastore
- `Redis Cache` (Database, violet) → session/cache layer

**Layout pattern:** 3 rows
1. Top row: CDN + React (left), Route 53 + API Gateway (right)
2. Middle row: Node.js API (center) with Auth Service to its right
3. Bottom row: PostgreSQL + Redis side by side

**Connections:**
- CDN → React (static assets)
- Route 53 → API Gateway
- API Gateway → Node.js API
- Node.js API → Auth Service (dashed rose for auth flow)
- Node.js API → PostgreSQL
- Node.js API → Redis

---

## AWS Serverless (Lambda + API Gateway + DynamoDB)

Event-driven serverless stack.

**Components:**
- `CloudFront` (AWS/Cloud, amber)
- `S3` (AWS/Cloud, amber) → static hosting
- `Cognito` (Security, rose) → user pool
- `API Gateway` (AWS/Cloud, amber)
- `Lambda (Node.js)` (Backend, emerald)
- `DynamoDB` (Database, violet)
- `SNS` (Message Bus, orange) → event notifications
- `SQS` (Message Bus, orange) → async queue

**Layout pattern:**
1. Top row: CloudFront + S3 (left), Cognito (right)
2. Middle row: API Gateway (left), Lambda (right)
3. Bottom row: DynamoDB (center), SNS + SQS (right)

**Connections:**
- CloudFront → S3
- Cognito → API Gateway (dashed rose)
- API Gateway → Lambda
- Lambda → DynamoDB
- Lambda → SNS
- SNS → SQS

---

## Microservices (Kubernetes + Kafka)

Containerized polyglot services with event streaming.

**Components:**
- `React Web` (Frontend, cyan)
- `Mobile Apps` (Frontend, cyan)
- `Kong Gateway` (Backend, emerald)
- `User Service (Go)` (Backend, emerald)
- `Order Service (Java)` (Backend, emerald)
- `Product Service (Python)` (Backend, emerald)
- `PostgreSQL` (Database, violet) → User Service
- `MongoDB` (Database, violet) → Product Service
- `Elasticsearch` (Database, violet) → search index
- `Kafka` (Message Bus, orange) → event bus between services
- `Kubernetes` (AWS/Cloud, amber) → cluster boundary

**Layout pattern:** Wrapped in a large Kubernetes cluster boundary box.
1. Top: Kong Gateway (center), React Web + Mobile Apps above it (clients outside cluster)
2. Middle: 3 service boxes side by side (User, Order, Product)
3. Between middle and bottom: Kafka event bus strip
4. Bottom: 3 databases aligned under their services

**Connections:**
- React Web → Kong Gateway
- Mobile Apps → Kong Gateway
- Kong Gateway → all 3 services
- User Service → PostgreSQL
- Order Service → MongoDB
- Product Service → Elasticsearch
- All services ↔ Kafka (bidirectional event publishing)

---

## Legend placement rule

For all examples, the color legend sits at the bottom of the SVG, at least 20px below the lowest boundary box or cluster container. Expand the viewBox height to accommodate it.
