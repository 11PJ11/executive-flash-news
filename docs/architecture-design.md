# Executive Flash News - Technical Architecture Document

## System Overview

**Executive Flash News** is an Atlassian Forge plugin that transforms complex Jira data into executive-friendly "flash news" for decision-makers. The architecture follows hexagonal principles with clean separation between business logic and Jira platform integration.

### Key Architectural Drivers

1. **Executive-First Experience**: Professional UI optimized for C-level users
2. **Hexagonal Architecture**: Clean separation between business logic and infrastructure
3. **ATDD/TDD Readiness**: Architecture supports outside-in test-driven development
4. **Forge Platform Integration**: Native Atlassian platform capabilities
5. **Scalability Foundation**: Extensible architecture for future dashboard features
6. **Real-Time Intelligence**: Fresh data delivery within 5-minute SLA

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Jira Cloud                               │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                  Executive Dashboard                    │    │
│  │  ┌─────────────────────────────────────────────────┐    │    │
│  │  │         Executive Flash News Widget             │    │    │
│  │  │  (Forge Custom UI - React + TypeScript)        │    │    │
│  │  └─────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Forge Runtime Environment                    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                  Presentation Layer                     │    │
│  │           (React Components + TypeScript)              │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                    │                            │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                  Application Layer                      │    │
│  │       (Ports, Services, Business Orchestration)        │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                    │                            │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                   Domain Layer                          │    │
│  │            (Pure Business Logic - Entities Only)        │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                    │                            │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                Infrastructure Layer                     │    │
│  │        (Jira API + Forge Storage Adapters)             │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│              Atlassian Platform Services                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   Jira REST     │  │  Forge Storage  │  │   User Context  │  │
│  │      API        │  │                 │  │   & Security    │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Hexagonal Architecture Design

The architecture follows hexagonal (ports and adapters) pattern with clear boundaries:

#### 1. Domain Layer (Core Business Logic)
**Location**: `/src/domain/`
**Responsibility**: Pure business logic, independent of external concerns

```typescript
// Domain Entities
interface Executive {
  id: string;
  name: string;
  role: ExecutiveRole;
  preferences: ExecutivePreferences;
}

interface FlashNews {
  id: string;
  priority: Priority;
  category: NewsCategory;
  title: string;
  summary: string;
  businessImpact: BusinessImpact;
  actionRequired: boolean;
  timestamp: Date;
}

interface Portfolio {
  id: string;
  executiveId: string;
  projects: Project[];
  healthScore: number;
  criticalAlerts: number;
}

// Domain Services
interface FlashNewsGeneratorService {
  generateNews(portfolio: Portfolio, context: ExecutiveContext): FlashNews[];
  prioritizeNews(news: FlashNews[], preferences: ExecutivePreferences): FlashNews[];
}

interface BusinessImpactCalculator {
  calculateImpact(projectData: ProjectData): BusinessImpact;
  identifyTrends(historicalData: HistoricalData): Trend[];
}
```

#### 2. Application Layer (Business Orchestration)
**Location**: `/src/application/`
**Responsibility**: Coordinate domain services, implement use cases

```typescript
// Use Cases
interface WelcomeMessageUseCase {
  execute(executiveId: string): Promise<WelcomeMessage>;
}

interface FlashNewsFeedUseCase {
  execute(executiveId: string, filters?: NewsFilter[]): Promise<FlashNews[]>;
}

// Application Services
interface ExecutiveDashboardService {
  getWelcomeMessage(executiveId: string): Promise<WelcomeMessage>;
  getFlashNewsFeed(executiveId: string): Promise<FlashNews[]>;
  updatePreferences(executiveId: string, preferences: ExecutivePreferences): Promise<void>;
}
```

#### 3. Infrastructure Layer (External Integrations)
**Location**: `/src/infrastructure/`
**Responsibility**: Implement ports using external services

```typescript
// Jira Integration Adapters
interface JiraProjectAdapter {
  getProjects(executiveId: string): Promise<Project[]>;
  getProjectMetrics(projectId: string): Promise<ProjectMetrics>;
  getWorkflowData(projectId: string): Promise<WorkflowData>;
}

interface ForgeStorageAdapter {
  storeExecutivePreferences(preferences: ExecutivePreferences): Promise<void>;
  getExecutivePreferences(executiveId: string): Promise<ExecutivePreferences>;
  cacheFlashNews(news: FlashNews[]): Promise<void>;
}

interface JiraUserAdapter {
  getCurrentUser(): Promise<JiraUser>;
  getExecutiveRole(userId: string): Promise<ExecutiveRole>;
  getPermissions(userId: string): Promise<Permission[]>;
}
```

### React Component Architecture

**Location**: `/src/presentation/components/`
**Design**: Atomic Design with executive-focused components

```typescript
// Atomic Components
export const ExecutiveCard: React.FC<ExecutiveCardProps>;
export const PriorityIndicator: React.FC<PriorityIndicatorProps>;
export const BusinessImpactBadge: React.FC<BusinessImpactProps>;
export const ActionButton: React.FC<ActionButtonProps>;

// Molecular Components
export const WelcomeMessage: React.FC<WelcomeMessageProps>;
export const FlashNewsItem: React.FC<FlashNewsItemProps>;
export const PortfolioSummary: React.FC<PortfolioSummaryProps>;
export const CriticalAlerts: React.FC<CriticalAlertsProps>;

// Organism Components
export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps>;
export const FlashNewsFeed: React.FC<FlashNewsFeedProps>;
export const PersonalizationPanel: React.FC<PersonalizationPanelProps>;

// Page/Template Components
export const ExecutiveFlashNewsWidget: React.FC<WidgetProps>;
```

### State Management Strategy

**Architecture**: Flux pattern with React Context + useReducer
**Location**: `/src/presentation/state/`

```typescript
// State Structure
interface AppState {
  executive: ExecutiveState;
  portfolio: PortfolioState;
  flashNews: FlashNewsState;
  ui: UIState;
}

// Context Providers
export const ExecutiveContextProvider: React.FC<{children: React.ReactNode}>;
export const FlashNewsContextProvider: React.FC<{children: React.ReactNode}>;

// Custom Hooks
export const useExecutive = (): ExecutiveState & ExecutiveActions;
export const useFlashNews = (): FlashNewsState & FlashNewsActions;
export const usePortfolio = (): PortfolioState & PortfolioActions;
```

## Integration Points

### Atlassian Forge Integration

#### Forge App Configuration
**File**: `manifest.yml`

```yaml
modules:
  jira:dashboardItem:
    - key: executive-flash-news-widget
      title: Executive Flash News
      description: Executive-friendly project insights
      url: https://executive-flash-news.atlassian-dev.net/widget
      thumbnail: resources/thumbnail.png
      configurable: true
      cacheable: false

permissions:
  scopes:
    - read:jira-work
    - read:jira-user
    - storage:app
    - read:project-role:jira

app:
  runtime:
    name: nodejs18.x
  id: executive-flash-news
```

#### Forge Custom UI Integration
**File**: `/src/index.tsx`

```typescript
import { invoke } from '@forge/bridge';
import React from 'react';
import ReactDOM from 'react-dom';

const App: React.FC = () => {
  const [context, setContext] = useState<ForgeContext | null>(null);

  useEffect(() => {
    invoke('getContext').then(setContext);
  }, []);

  if (!context) return <LoadingSpinner />;

  return (
    <ForgeProvider context={context}>
      <ExecutiveFlashNewsWidget />
    </ForgeProvider>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
```

### External System Integration

#### Jira REST API Integration
**Location**: `/src/infrastructure/jira/`

```typescript
export class JiraApiClient {
  constructor(private context: ForgeContext) {}

  async getProjects(): Promise<JiraProject[]> {
    return await api.asApp().requestJira('/rest/api/3/project/search', {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
  }

  async getProjectMetrics(projectId: string): Promise<ProjectMetrics> {
    // Implementation using Jira API
  }
}
```

### Data Flow Patterns

#### Welcome Message Flow
```
User → Dashboard → Forge Widget → Application Service → Domain Service → Infrastructure → Jira API
     ← Welcome UI ← React State ← Welcome Message ← Flash News ← Adapter ← API Response
```

#### Real-Time Updates
```
Jira Event → Webhook → Forge Function → Cache Update → WebSocket → React State → UI Update
```

## Architectural Patterns and Decisions

### Core Architectural Patterns

#### 1. Hexagonal Architecture (Ports and Adapters)
- **Context**: Need clean separation between business logic and Jira platform
- **Decision**: Implement hexagonal architecture with clear port definitions
- **Rationale**: Enables independent testing, reduces coupling, supports ATDD
- **Consequences**: Increased initial complexity, better long-term maintainability

#### 2. Repository Pattern
- **Context**: Need abstraction over Forge Storage and Jira API data access
- **Decision**: Implement repository pattern with async interfaces
- **Rationale**: Provides testable data layer, supports caching strategies
- **Consequences**: Additional abstraction layer, improved testability

#### 3. Command-Query Responsibility Segregation (CQRS)
- **Context**: Different read/write patterns for executive preferences vs. news generation
- **Decision**: Separate command and query responsibilities
- **Rationale**: Optimizes for executive dashboard read performance
- **Consequences**: Increased complexity, better performance characteristics

### Component Design Patterns

#### 1. Atomic Design
- **Context**: Need scalable, reusable UI component structure
- **Decision**: Implement atomic design pattern (atoms → molecules → organisms)
- **Rationale**: Supports design system consistency, enables component reuse
- **Consequences**: Steeper learning curve, better component organization

#### 2. Render Props / Custom Hooks
- **Context**: Need reusable stateful logic across components
- **Decision**: Use custom hooks for state management and side effects
- **Rationale**: Modern React patterns, improved testability, logic reuse
- **Consequences**: Requires React 16.8+, improved developer experience

### Integration Patterns

#### 1. Adapter Pattern
- **Context**: Need to integrate with multiple external APIs (Jira, Forge)
- **Decision**: Implement adapter pattern for external service integration
- **Rationale**: Isolates external API changes, supports testing with mocks
- **Consequences**: Additional abstraction layers, improved maintainability

#### 2. Observer Pattern
- **Context**: Need real-time updates for executive dashboard
- **Decision**: Implement observer pattern using Forge events
- **Rationale**: Decoupled real-time updates, better user experience
- **Consequences**: Increased complexity, improved responsiveness

## Architecture Decision Records (ADRs)

### ADR-001: Atlassian Forge Platform Selection
- **Context**: Need platform for Jira plugin development with modern UI capabilities
- **Decision**: Use Atlassian Forge with Custom UI for React integration
- **Rationale**: Native Jira integration, modern React support, serverless hosting, security compliance
- **Consequences**: Vendor lock-in to Atlassian, learning curve, powerful integration capabilities
- **Alternatives Considered**: Connect apps (complex hosting), Server/DC apps (legacy)

### ADR-002: Hexagonal Architecture Pattern
- **Context**: Need clean architecture supporting ATDD and future extensibility
- **Decision**: Implement hexagonal architecture with clear port definitions
- **Rationale**: Supports outside-in TDD, enables independent testing, reduces coupling
- **Consequences**: Initial complexity increase, improved testability and maintainability
- **Alternatives Considered**: Layered architecture (tight coupling), MVC (insufficient separation)

### ADR-003: TypeScript for Type Safety
- **Context**: Need robust development experience with complex business logic
- **Decision**: Use TypeScript throughout application (95%+ coverage)
- **Rationale**: Compile-time error detection, better IDE support, self-documenting code
- **Consequences**: Learning curve for team, improved code quality and maintainability
- **Alternatives Considered**: JavaScript (less type safety), Flow (smaller ecosystem)

### ADR-004: React with Hooks for UI State
- **Context**: Need modern, testable UI with complex state management
- **Decision**: Use React with hooks and Context API for state management
- **Rationale**: Modern patterns, improved testability, reduced complexity vs. Redux
- **Consequences**: React 16.8+ requirement, potential prop drilling in deep components
- **Alternatives Considered**: Redux (complexity overhead), MobX (less predictable)

### ADR-005: Jest + React Testing Library
- **Context**: Need comprehensive testing strategy supporting ATDD approach
- **Decision**: Use Jest with React Testing Library for unit and integration tests
- **Rationale**: Behavior-focused testing, excellent React integration, active community
- **Consequences**: Learning curve for behavior-focused testing, improved test maintainability
- **Alternatives Considered**: Enzyme (implementation-focused), Cypress only (slower feedback)

## Quality Attribute Scenarios

### Performance Scenarios

#### Scenario 1: Welcome Message Load Time
- **Context**: Executive accesses Jira dashboard with Flash News widget
- **Stimulus**: Dashboard page load with executive user context
- **Response**: Welcome message displays within 2 seconds with personalized content
- **Architecture Support**:
  - Forge edge caching for static assets
  - Optimized Jira API queries with field selection
  - Client-side caching for user preferences
  - Lazy loading for non-critical components

#### Scenario 2: Flash News Refresh Performance
- **Context**: Executive requests updated flash news feed
- **Stimulus**: User triggers refresh or automatic 5-minute update
- **Response**: New flash news items appear within 500ms
- **Architecture Support**:
  - Background data fetching with service workers
  - Incremental updates using WebSocket connections
  - Optimistic UI updates with rollback capability
  - Intelligent caching with cache invalidation

#### Scenario 3: Concurrent User Scalability
- **Context**: 1000 executives access dashboards simultaneously
- **Stimulus**: Peak morning usage across global organization
- **Response**: All users receive sub-2-second response times
- **Architecture Support**:
  - Forge serverless auto-scaling
  - CDN distribution for static assets
  - Database query optimization with indexing
  - Connection pooling and rate limiting

### Security Architecture

#### Authentication Integration
- **Platform Security**: Leverage Atlassian's OAuth 2.0 and SAML integration
- **User Context**: Secure user identification through Forge context API
- **Session Management**: Forge handles session lifecycle and token refresh

#### Authorization Model
```typescript
interface SecurityContext {
  user: JiraUser;
  permissions: Permission[];
  organizationalRole: ExecutiveRole;
  dataAccessScope: DataScope[];
}

// Role-based data filtering
class ExecutiveDataFilter {
  filterProjects(projects: Project[], context: SecurityContext): Project[] {
    return projects.filter(project =>
      context.dataAccessScope.includes(project.businessUnit) ||
      context.permissions.includes(Permission.VIEW_ALL_PROJECTS)
    );
  }
}
```

#### Data Protection Patterns
- **Sensitive Data Masking**: Executive-level aggregation hides detailed sensitive information
- **Audit Logging**: All executive data access logged for compliance
- **Encryption**: Forge Storage encryption at rest and in transit
- **Privacy Controls**: User preference controls for data sharing and retention

### Scalability Design

#### Horizontal Scaling Strategy
- **Forge Serverless**: Automatic scaling based on request volume
- **Stateless Design**: All state externalized to Forge Storage or client
- **Database Sharding**: Partition data by organization for large enterprises
- **CDN Integration**: Global content delivery for static assets

#### Vertical Scaling Optimization
- **Memory Management**: Efficient React component lifecycle management
- **Bundle Size Optimization**: Code splitting and lazy loading
- **Database Query Optimization**: Indexed queries with result pagination
- **Caching Strategy**: Multi-level caching (browser, CDN, application, database)

#### Data Architecture Scaling
```typescript
// Partitioning Strategy
interface DataPartitionStrategy {
  partitionKey: 'organizationId' | 'executiveId' | 'businessUnit';
  shardCount: number;
  replicationFactor: number;
}

// Caching Strategy
interface CacheStrategy {
  levels: ('browser' | 'cdn' | 'application' | 'database')[];
  ttl: Record<string, number>;
  invalidationRules: CacheInvalidationRule[];
}
```

## Implementation Guidelines

### Development Workflow

#### 1. Outside-In ATDD Process
```bash
# 1. Write failing acceptance test (E2E)
npm run test:acceptance -- --grep "Executive sees welcome message"

# 2. Write failing unit tests (inside-out from UI)
npm run test:unit -- src/presentation/components/WelcomeMessage.test.tsx

# 3. Implement minimal code to pass tests
npm run dev  # Watch mode during development

# 4. Refactor with tests passing
npm run test  # Full test suite validation

# 5. Commit working increment
git add . && git commit -m "feat: implement welcome message display"
```

#### 2. Code Organization Structure
```
src/
├── domain/                 # Pure business logic
│   ├── entities/          # Business entities
│   ├── services/          # Domain services
│   └── value-objects/     # Value objects
├── application/           # Use cases and orchestration
│   ├── use-cases/         # Application use cases
│   └── services/          # Application services
├── infrastructure/        # External integrations
│   ├── jira/             # Jira API adapters
│   ├── forge/            # Forge Storage adapters
│   └── cache/            # Caching implementations
├── presentation/          # UI components and state
│   ├── components/       # React components
│   ├── hooks/            # Custom hooks
│   ├── state/            # State management
│   └── styles/           # CSS/styled-components
└── shared/               # Cross-cutting concerns
    ├── types/            # TypeScript type definitions
    ├── utils/            # Utility functions
    └── constants/        # Application constants
```

#### 3. Testing Strategy Implementation

**Unit Tests**: Test individual components and services in isolation
```typescript
// Example: WelcomeMessage.test.tsx
describe('WelcomeMessage', () => {
  it('should display executive name and role', () => {
    const props = {
      executive: { name: 'Jane Doe', role: 'CEO' },
      portfolio: { projectCount: 15, criticalAlerts: 2 }
    };

    render(<WelcomeMessage {...props} />);

    expect(screen.getByText('Welcome, Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('CEO')).toBeInTheDocument();
  });
});
```

**Integration Tests**: Test component integration and data flow
```typescript
// Example: ExecutiveDashboard.integration.test.tsx
describe('Executive Dashboard Integration', () => {
  it('should load welcome message with real data flow', async () => {
    const mockExecutiveService = new MockExecutiveService();

    render(
      <ServiceProvider executiveService={mockExecutiveService}>
        <ExecutiveDashboard />
      </ServiceProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });
  });
});
```

**Acceptance Tests**: Test complete user scenarios
```typescript
// Example: welcome-message.acceptance.test.tsx
describe('Welcome Message Acceptance Tests', () => {
  describe('Scenario: First-time Executive User', () => {
    it('should show welcome message explaining Flash News value', async () => {
      await loginAsExecutive({ firstTime: true });
      await navigateToDashboard();

      expect(await screen.findByText(/Executive Flash News/)).toBeVisible();
      expect(await screen.findByText(/personalized insights/)).toBeVisible();
    });
  });
});
```

### Code Quality Standards

#### TypeScript Configuration
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "build", "dist"]
}
```

#### ESLint Configuration
```json
// .eslintrc.js
module.exports = {
  extends: [
    '@atlassian/eslint-config-forge',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  rules: {
    'max-complexity': ['error', 10],
    'max-depth': ['error', 4],
    'max-lines-per-function': ['error', 50]
  }
};
```

#### Component Standards
- **Single Responsibility**: Each component has one clear purpose
- **Composition over Inheritance**: Use composition patterns over class inheritance
- **Props Validation**: All props properly typed with TypeScript interfaces
- **Error Boundaries**: Implement error boundaries for robust error handling
- **Accessibility**: All components meet WCAG 2.1 AA standards

### Performance Guidelines

#### Bundle Optimization
```javascript
// webpack.config.js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
        domain: {
          test: /[\\/]src[\\/]domain[\\/]/,
          name: 'domain',
          chunks: 'all',
        }
      }
    }
  }
};
```

#### React Performance Optimization
```typescript
// Use React.memo for expensive components
export const FlashNewsItem = React.memo<FlashNewsItemProps>(({ news }) => {
  return <div>{news.title}</div>;
});

// Use useMemo for expensive calculations
const sortedNews = useMemo(() => {
  return news.sort((a, b) => b.priority - a.priority);
}, [news]);

// Use useCallback for stable event handlers
const handleNewsClick = useCallback((newsId: string) => {
  onNewsSelect(newsId);
}, [onNewsSelect]);
```

This architecture document provides the foundation for implementing the Executive Flash News plugin with hexagonal architecture principles, ATDD support, and executive-focused user experience. The design emphasizes clean separation of concerns, testability, and scalability while leveraging Atlassian Forge platform capabilities.