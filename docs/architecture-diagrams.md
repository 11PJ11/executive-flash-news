# Architecture Diagrams - Executive Flash News

## System Architecture Overview

### High-Level System Context

```mermaid
graph TB
    subgraph "Jira Cloud Platform"
        JD[Jira Dashboard]
        JA[Jira API v3]
        JU[Jira User Context]
        JP[Jira Projects]
    end

    subgraph "Forge Runtime Environment"
        EFN[Executive Flash News Widget]
        FR[Forge Runtime]
        FS[Forge Storage]
        FA[Forge APIs]
    end

    subgraph "External Services"
        CDN[Content Delivery Network]
        MON[Monitoring & Analytics]
    end

    %% User Interactions
    EU[Executive User] --> JD
    JD --> EFN

    %% Data Flow
    EFN --> FA
    FA --> JA
    FA --> FS

    %% Platform Integration
    JU --> FA
    JP --> JA

    %% Performance & Monitoring
    EFN --> CDN
    FR --> MON

    %% Styling
    classDef user fill:#e1f5fe
    classDef jira fill:#fff3e0
    classDef forge fill:#e8f5e8
    classDef external fill:#fce4ec

    class EU user
    class JD,JA,JU,JP jira
    class EFN,FR,FS,FA forge
    class CDN,MON external
```

### Hexagonal Architecture Overview

```mermaid
graph TB
    subgraph "Hexagonal Architecture Layers"
        subgraph "Presentation Layer (Adapters)"
            RC[React Components]
            RH[React Hooks]
            SM[State Management]
        end

        subgraph "Application Layer (Orchestration)"
            UC[Use Cases]
            AS[Application Services]
            PO[Primary Ports]
        end

        subgraph "Domain Layer (Core)"
            EN[Entities]
            VO[Value Objects]
            DS[Domain Services]
            DR[Domain Rules]
        end

        subgraph "Infrastructure Layer (Adapters)"
            JDA[Jira Data Adapter]
            FSA[Forge Storage Adapter]
            UA[User Adapter]
            CA[Cache Adapter]
        end
    end

    %% External Systems
    JAPI[Jira REST API]
    FST[Forge Storage]
    JUC[Jira User Context]

    %% Connections
    RC --> SM
    SM --> UC
    UC --> AS
    AS --> PO
    PO --> DS
    DS --> EN
    DS --> VO

    AS --> JDA
    AS --> FSA
    AS --> UA
    AS --> CA

    JDA --> JAPI
    FSA --> FST
    UA --> JUC

    %% Styling
    classDef presentation fill:#e3f2fd
    classDef application fill:#f3e5f5
    classDef domain fill:#e8f5e8
    classDef infrastructure fill:#fff8e1
    classDef external fill:#ffebee

    class RC,RH,SM presentation
    class UC,AS,PO application
    class EN,VO,DS,DR domain
    class JDA,FSA,UA,CA infrastructure
    class JAPI,FST,JUC external
```

## Component Architecture

### React Component Hierarchy

```mermaid
graph TB
    subgraph "Executive Flash News Widget"
        EFW[ExecutiveFlashNewsWidget]

        subgraph "Dashboard Components"
            WM[WelcomeMessage]
            PS[PortfolioSummary]
            CA[CriticalAlerts]
            FNF[FlashNewsFeed]
        end

        subgraph "Shared Components"
            EC[ExecutiveCard]
            PI[PriorityIndicator]
            BIB[BusinessImpactBadge]
            AB[ActionButton]
            LS[LoadingSpinner]
            EB[ErrorBoundary]
        end

        subgraph "Flash News Components"
            FNI[FlashNewsItem]
            FNL[FlashNewsList]
            FNF_Filter[FlashNewsFilter]
        end

        subgraph "Personalization Components"
            PP[PersonalizationPanel]
            EP[ExecutivePreferences]
            NC[NotificationControls]
        end
    end

    %% Component Relationships
    EFW --> WM
    EFW --> PS
    EFW --> CA
    EFW --> FNF

    WM --> EC
    WM --> PI
    PS --> BIB
    CA --> AB

    FNF --> FNL
    FNF --> FNF_Filter
    FNL --> FNI
    FNI --> PI
    FNI --> BIB
    FNI --> AB

    EFW --> PP
    PP --> EP
    PP --> NC

    %% Error Handling
    EFW --> EB
    EB --> LS

    %% Styling
    classDef widget fill:#e1f5fe
    classDef dashboard fill:#e8f5e8
    classDef shared fill:#fff3e0
    classDef flashnews fill:#f3e5f5
    classDef personalization fill:#fce4ec

    class EFW widget
    class WM,PS,CA,FNF dashboard
    class EC,PI,BIB,AB,LS,EB shared
    class FNI,FNL,FNF_Filter flashnews
    class PP,EP,NC personalization
```

### State Management Architecture

```mermaid
graph TB
    subgraph "Global State (React Context)"
        subgraph "Executive Context"
            ES[Executive State]
            EA[Executive Actions]
        end

        subgraph "Portfolio Context"
            PS[Portfolio State]
            PA[Portfolio Actions]
        end

        subgraph "Flash News Context"
            FNS[Flash News State]
            FNA[Flash News Actions]
        end

        subgraph "UI Context"
            US[UI State]
            UA[UI Actions]
        end
    end

    subgraph "Custom Hooks"
        UE[useExecutive]
        UP[usePortfolio]
        UFN[useFlashNews]
        UUI[useUI]
    end

    subgraph "Components"
        WM[WelcomeMessage]
        FNF[FlashNewsFeed]
        PS_C[PortfolioSummary]
    end

    %% Hook Connections
    ES --> UE
    EA --> UE
    PS --> UP
    PA --> UP
    FNS --> UFN
    FNA --> UFN
    US --> UUI
    UA --> UUI

    %% Component Usage
    UE --> WM
    UFN --> FNF
    UP --> PS_C
    UUI --> WM
    UUI --> FNF
    UUI --> PS_C

    %% Styling
    classDef context fill:#e3f2fd
    classDef hooks fill:#e8f5e8
    classDef components fill:#fff3e0

    class ES,EA,PS,PA,FNS,FNA,US,UA context
    class UE,UP,UFN,UUI hooks
    class WM,FNF,PS_C components
```

## Data Flow Architecture

### Welcome Message Data Flow

```mermaid
sequenceDiagram
    participant EU as Executive User
    participant RC as React Component
    participant UH as useExecutive Hook
    participant UC as Use Case
    participant AS as Application Service
    participant JA as Jira Adapter
    participant FS as Forge Storage
    participant API as Jira API

    EU->>RC: Access Dashboard
    RC->>UH: Request Executive Data
    UH->>UC: Execute GetWelcomeMessage
    UC->>AS: GetExecutiveContext

    par Get User Context
        AS->>JA: GetCurrentUser
        JA->>API: /rest/api/3/myself
        API-->>JA: User Data
        JA-->>AS: Executive User
    and Get Preferences
        AS->>FS: GetExecutivePreferences
        FS-->>AS: User Preferences
    and Get Portfolio
        AS->>JA: GetExecutiveProjects
        JA->>API: /rest/api/3/project/search
        API-->>JA: Projects Data
        JA-->>AS: Portfolio Data
    end

    AS->>UC: Aggregated Context
    UC->>UH: Welcome Message Data
    UH->>RC: Update State
    RC->>EU: Display Welcome Message
```

### Flash News Generation Flow

```mermaid
sequenceDiagram
    participant Timer as Background Timer
    participant FNG as Flash News Generator
    participant BIC as Business Impact Calculator
    participant JA as Jira Adapter
    participant FS as Forge Storage
    participant WS as WebSocket
    participant UI as User Interface

    Timer->>FNG: Trigger News Generation (5min)
    FNG->>JA: Get Project Updates
    JA->>FNG: Recent Project Data

    loop For Each Project Change
        FNG->>BIC: Calculate Business Impact
        BIC-->>FNG: Impact Assessment
        FNG->>FNG: Determine Executive Relevance
    end

    FNG->>FS: Cache Generated News
    FNG->>WS: Notify UI of Updates
    WS->>UI: Trigger News Refresh
    UI->>FS: Fetch New Flash News
    FS-->>UI: Updated News Items
    UI->>UI: Update Flash News Feed
```

### Error Handling and Recovery Flow

```mermaid
graph TB
    subgraph "Error Detection"
        API_E[API Error]
        NET_E[Network Error]
        APP_E[Application Error]
        UI_E[UI Error]
    end

    subgraph "Error Boundaries"
        REB[React Error Boundary]
        GEH[Global Error Handler]
        AEH[API Error Handler]
    end

    subgraph "Recovery Strategies"
        RT[Retry with Backoff]
        FB[Fallback Data]
        UM[User Message]
        LOG[Error Logging]
    end

    subgraph "User Experience"
        LS[Loading Spinner]
        EM[Error Message]
        RB[Retry Button]
        GD[Graceful Degradation]
    end

    %% Error Flow
    API_E --> AEH
    NET_E --> AEH
    APP_E --> GEH
    UI_E --> REB

    %% Recovery Flow
    AEH --> RT
    AEH --> FB
    GEH --> UM
    REB --> LS

    %% User Experience
    RT --> LS
    FB --> GD
    UM --> EM
    EM --> RB

    %% Logging
    AEH --> LOG
    GEH --> LOG
    REB --> LOG

    %% Styling
    classDef error fill:#ffebee
    classDef boundary fill:#fff3e0
    classDef recovery fill:#e8f5e8
    classDef ux fill:#e3f2fd

    class API_E,NET_E,APP_E,UI_E error
    class REB,GEH,AEH boundary
    class RT,FB,UM,LOG recovery
    class LS,EM,RB,GD ux
```

## Integration Architecture

### Forge Platform Integration

```mermaid
graph TB
    subgraph "Jira Cloud"
        JD[Jira Dashboard]
        JA[Jira API]
        JU[Jira User Management]
    end

    subgraph "Forge Platform"
        FR[Forge Runtime]
        FA[Forge APIs]
        FS[Forge Storage]
        FT[Forge Tunnel (Dev)]
    end

    subgraph "Executive Flash News App"
        subgraph "Frontend (Custom UI)"
            RC[React Components]
            TH[TypeScript Hooks]
            SM[State Management]
        end

        subgraph "Backend (Serverless)"
            WH[Webhook Handlers]
            BL[Background Logic]
            DC[Data Caching]
        end
    end

    subgraph "Development Environment"
        FC[Forge CLI]
        DT[Development Tools]
        LOCAL[Local Development]
    end

    %% Integration Points
    JD --> RC
    RC --> FA
    FA --> JA
    FA --> FS
    FA --> JU

    %% Backend Processing
    JA --> WH
    WH --> BL
    BL --> DC
    DC --> FS

    %% Development Flow
    FC --> FT
    FT --> FR
    LOCAL --> FC
    DT --> LOCAL

    %% Styling
    classDef jira fill:#fff3e0
    classDef forge fill:#e8f5e8
    classDef app fill:#e3f2fd
    classDef dev fill:#fce4ec

    class JD,JA,JU jira
    class FR,FA,FS,FT forge
    class RC,TH,SM,WH,BL,DC app
    class FC,DT,LOCAL dev
```

### Security and Authentication Flow

```mermaid
sequenceDiagram
    participant EU as Executive User
    participant JC as Jira Cloud
    participant FA as Forge Auth
    participant EFN as Executive Flash News
    participant JA as Jira API
    participant FS as Forge Storage

    EU->>JC: Login to Jira
    JC->>FA: Authenticate User
    FA->>EFN: Provide User Context

    EU->>EFN: Access Flash News Widget
    EFN->>FA: Validate User Context
    FA-->>EFN: User Permissions & Role

    EFN->>JA: Request Project Data
    Note over EFN,JA: Uses Forge-managed OAuth
    JA-->>EFN: Filtered Project Data

    EFN->>FS: Store User Preferences
    Note over EFN,FS: Encrypted Storage
    FS-->>EFN: Confirmation

    EFN-->>EU: Display Personalized Dashboard
```

## Performance Architecture

### Caching Strategy

```mermaid
graph TB
    subgraph "Client Side"
        BC[Browser Cache]
        RC[React State Cache]
        SW[Service Worker Cache]
    end

    subgraph "CDN Layer"
        CDN[Content Delivery Network]
        SA[Static Assets]
    end

    subgraph "Forge Platform"
        FC[Forge Cache]
        FS[Forge Storage]
    end

    subgraph "Data Sources"
        JA[Jira API]
        TP[Third Party APIs]
    end

    %% Cache Hierarchy
    RC --> BC
    SW --> BC
    BC --> CDN
    CDN --> SA

    %% Platform Caching
    FC --> FS
    FS --> JA
    FS --> TP

    %% Performance Flow
    subgraph "Cache Levels"
        L1[L1: React State<br/>Milliseconds]
        L2[L2: Browser Cache<br/>Minutes]
        L3[L3: CDN Cache<br/>Hours]
        L4[L4: Forge Storage<br/>Days]
    end

    %% Cache Strategy
    L1 --> L2
    L2 --> L3
    L3 --> L4

    %% Styling
    classDef client fill:#e3f2fd
    classDef cdn fill:#e8f5e8
    classDef platform fill:#fff3e0
    classDef data fill:#ffebee
    classDef cache fill:#f3e5f5

    class BC,RC,SW client
    class CDN,SA cdn
    class FC,FS platform
    class JA,TP data
    class L1,L2,L3,L4 cache
```

### Load Balancing and Scaling

```mermaid
graph TB
    subgraph "Global Users"
        US[US Executives]
        EU[EU Executives]
        AP[APAC Executives]
    end

    subgraph "CDN Distribution"
        US_CDN[US CDN Edge]
        EU_CDN[EU CDN Edge]
        AP_CDN[APAC CDN Edge]
    end

    subgraph "Forge Auto-Scaling"
        LB[Load Balancer]
        subgraph "Lambda Functions"
            L1[Lambda Instance 1]
            L2[Lambda Instance 2]
            L3[Lambda Instance N]
        end
    end

    subgraph "Data Layer"
        FS[Forge Storage<br/>Auto-Scaling]
        JA[Jira API<br/>Rate Limited]
    end

    %% Geographic Distribution
    US --> US_CDN
    EU --> EU_CDN
    AP --> AP_CDN

    %% Load Balancing
    US_CDN --> LB
    EU_CDN --> LB
    AP_CDN --> LB

    LB --> L1
    LB --> L2
    LB --> L3

    %% Data Access
    L1 --> FS
    L2 --> FS
    L3 --> FS

    FS --> JA

    %% Scaling Indicators
    subgraph "Auto-Scaling Metrics"
        CPU[CPU Usage > 70%]
        MEM[Memory Usage > 80%]
        REQ[Request Rate > 1000/min]
        LAT[Latency > 2000ms]
    end

    CPU --> LB
    MEM --> LB
    REQ --> LB
    LAT --> LB

    %% Styling
    classDef users fill:#e1f5fe
    classDef cdn fill:#e8f5e8
    classDef forge fill:#fff3e0
    classDef data fill:#ffebee
    classDef metrics fill:#f3e5f5

    class US,EU,AP users
    class US_CDN,EU_CDN,AP_CDN cdn
    class LB,L1,L2,L3 forge
    class FS,JA data
    class CPU,MEM,REQ,LAT metrics
```

## Testing Architecture

### ATDD Testing Strategy

```mermaid
graph TB
    subgraph "Test Pyramid"
        subgraph "E2E Tests (Acceptance)"
            AT[Acceptance Tests]
            UT[User Journey Tests]
            ST[Smoke Tests]
        end

        subgraph "Integration Tests"
            API[API Integration]
            COMP[Component Integration]
            STATE[State Management]
        end

        subgraph "Unit Tests"
            DOMAIN[Domain Logic]
            HOOKS[React Hooks]
            UTILS[Utility Functions]
        end
    end

    subgraph "Test Environment"
        MOCK[Mock Services]
        MSW[Mock Service Worker]
        TD[Test Data]
    end

    subgraph "Test Execution"
        JEST[Jest Test Runner]
        RTL[React Testing Library]
        PW[Playwright (E2E)]
    end

    %% Test Flow
    AT --> API
    AT --> COMP
    API --> DOMAIN
    COMP --> HOOKS
    STATE --> HOOKS

    %% Test Infrastructure
    AT --> MSW
    API --> MOCK
    COMP --> TD

    %% Test Execution
    JEST --> DOMAIN
    JEST --> HOOKS
    JEST --> UTILS
    RTL --> COMP
    RTL --> STATE
    PW --> AT
    PW --> UT

    %% Coverage Requirements
    subgraph "Coverage Targets"
        E2E_COV[E2E: 100% Happy Paths]
        INT_COV[Integration: 80%]
        UNIT_COV[Unit: 90% Domain Logic]
    end

    AT --> E2E_COV
    API --> INT_COV
    DOMAIN --> UNIT_COV

    %% Styling
    classDef e2e fill:#e1f5fe
    classDef integration fill:#e8f5e8
    classDef unit fill:#fff3e0
    classDef env fill:#ffebee
    classDef execution fill:#f3e5f5
    classDef coverage fill:#fce4ec

    class AT,UT,ST e2e
    class API,COMP,STATE integration
    class DOMAIN,HOOKS,UTILS unit
    class MOCK,MSW,TD env
    class JEST,RTL,PW execution
    class E2E_COV,INT_COV,UNIT_COV coverage
```

These architecture diagrams provide comprehensive visual documentation of the Executive Flash News plugin architecture, supporting the development team in implementing the hexagonal architecture with ATDD principles while maintaining clear separation of concerns and executive-focused user experience.