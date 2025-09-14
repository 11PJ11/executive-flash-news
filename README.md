# Executive Flash News - Jira Plugin

Transform complex Jira data into executive-friendly flash news for decision-makers.

## 🎯 Overview

Executive Flash News is an Atlassian Forge-based Jira plugin designed to provide executives (CEOs, CTOs, Heads of Delivery) with actionable insights from complex project data in an easily digestible format.

### Business Value
- **Executive-Focused**: Designed specifically for C-level decision makers
- **Flash News Format**: Quick, actionable insights instead of raw data
- **Role-Based Personalization**: Content tailored to executive roles
- **Real-Time Intelligence**: Current project status and critical alerts

## 🏗️ Architecture

This project follows **Hexagonal Architecture** (Ports & Adapters) with ATDD/TDD development:

```
├── src/
│   ├── domain/              # Pure business logic
│   │   └── entities/        # Business entities (WelcomeMessage)
│   ├── application/         # Application coordination
│   │   ├── ports/          # Interface contracts
│   │   ├── services/       # Business orchestration
│   │   └── resolvers/      # Forge function resolvers
│   ├── infrastructure/      # External integrations
│   │   └── adapters/       # Jira API implementations
│   └── presentation/        # UI components
└── tests/
    ├── acceptance/         # E2E/ATDD tests
    ├── unit/              # Unit tests
    └── integration/       # Integration tests
```

## 🚀 Technology Stack

- **Platform**: Atlassian Forge (Node.js 18.x runtime)
- **UI Framework**: Forge UI Kit
- **Language**: JavaScript (ES2020+) with TypeScript configuration
- **Testing**: Jest + React Testing Library
- **Architecture**: Hexagonal Architecture with ATDD

## 📋 Current Status: Walking Skeleton

**Active Feature**: Welcome Widget on Jira Dashboard

### Walking Skeleton Scope
1. **Simple Welcome Panel** on Jira dashboard
2. **Static Welcome Content** with plugin version
3. **Basic User Detection** (foundation for role-based features)
4. **Professional UI** using Atlassian Design System

## 🧪 Testing Strategy

Following **Outside-In ATDD** (Acceptance Test Driven Development):

### Test Naming Convention
- **Test Classes**: `<ClassUnderTest>Should` (e.g., `WelcomeMessageShould`)
- **Test Methods**: Complete the sentence (e.g., `DisplayWelcomeMessageOnDashboard()`)

### Current Test Status
- ✅ **Active E2E Test**: Basic Welcome Widget Display
- ⏳ **Queued Tests**: Role detection, version management, error handling

### Running Tests
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

## 🔧 Development Setup

### Prerequisites
- Node.js 20.x or 22.x (Forge CLI requirement)
- Atlassian Developer Account
- Docker (for local Jira testing)

### Installation
```bash
# Install dependencies
npm install

# Install Forge CLI globally
npm install -g @forge/cli

# Login to Forge
forge login
```

### Development Workflow
```bash
# Start development tunnel
npm run tunnel

# Build the app
npm run build

# Deploy to development environment
npm run deploy

# Install in Jira site
npm run install
```

## 📊 Quality Standards

- **Domain Layer Coverage**: 90%+ (business logic)
- **Overall Coverage**: 80%+
- **Architecture Compliance**: Hexagonal pattern
- **Code Quality**: ESLint + Prettier
- **ATDD Workflow**: Outside-in development

## 🎯 Future Roadmap

1. **Phase 1 - Walking Skeleton** ← *Current*
   - Welcome message widget
   - Basic dashboard integration
   - Plugin version display

2. **Phase 2 - Executive Intelligence**
   - Role-based personalization
   - Project status aggregation
   - Critical alerts system

3. **Phase 3 - Flash News Engine**
   - Intelligent data summarization
   - Executive-friendly visualizations
   - Proactive insights delivery

## 📚 Documentation

### Core Architecture
- [Architecture Design](./docs/architecture-design.md) - Technical architecture and hexagonal design
- [Architecture Diagrams](./docs/architecture-diagrams.md) - Visual architecture representations
- [Technology Decisions](./docs/technology-decisions.md) - Technology stack rationale

### Development Process
- [ATDD Acceptance Tests](./docs/ACCEPTANCE_TESTS.md) - Acceptance criteria and test scenarios
- [Business Requirements](./docs/business-requirements.md) - Business context and requirements
- [Architecture Fix](./docs/ARCHITECTURE_FIX.md) - Recent architectural improvements

### Deployment & Operations
- [CI/CD Setup Guide](./docs/ci-cd-setup.md) - Complete CI/CD pipeline configuration
- [CI/CD Runbook](./docs/CI-CD-RUNBOOK.md) - Operations and troubleshooting guide
- [Deployment Guide](./docs/DEPLOYMENT_GUIDE.md) - Manual deployment instructions
- [Setup Status](./docs/SETUP_STATUS.md) - Development environment status

### Security & Best Practices
- [Security Best Practices](./docs/security-best-practices.md) - Security guidelines and compliance

## 🤝 Contributing

1. Follow ATDD workflow (Outside-In TDD)
2. Maintain hexagonal architecture boundaries
3. Use proper test naming conventions
4. Ensure 90%+ domain layer test coverage
5. All commits must pass quality gates

## 📄 License

MIT License - See LICENSE file for details## CI/CD Pipeline Test

This commit tests the trunk-based CI/CD pipeline execution.
