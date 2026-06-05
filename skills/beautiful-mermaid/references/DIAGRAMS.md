# Diagram Types Reference

## Flowchart

Processes, workflows, decision trees.

```mermaid
graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Process]
    B -->|No| D[End]
    C --> D
```

**Directions:** `TD` (top-down), `LR` (left-right), `BT`, `RL`.

**Inline edge styling:**
```mermaid
graph TD
  A --> B --> C
  linkStyle 0 stroke:#ff0000,stroke-width:2px
  linkStyle default stroke:#888888
```

---

## Sequence Diagram

API calls, interactions, message flows.

```mermaid
sequenceDiagram
    Alice->>Bob: Hello Bob!
    Bob-->>Alice: Hi Alice!
    Alice->>Bob: How are you?
    Bob-->>Alice: Great, thanks!
```

---

## State Diagram

Application states, lifecycle, FSM.

```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Processing: start
    Processing --> Complete: done
    Complete --> [*]
```

---

## Class Diagram

Object models, architecture, relationships.

```mermaid
classDiagram
    Animal <|-- Duck
    Animal <|-- Fish
    Animal: +int age
    Animal: +String gender
    Animal: +isMammal() bool
    Duck: +String beakColor
    Duck: +swim()
    Duck: +quack()
```

---

## ER Diagram

Database schema, data models.

```mermaid
erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE_ITEM : contains
    PRODUCT ||--o{ LINE_ITEM : "is in"
```

---

## XY Chart (xychart-beta)

Bar charts, line charts, combinations.

**Bar chart:**
```mermaid
xychart-beta
    title "Monthly Revenue"
    x-axis [Jan, Feb, Mar, Apr, May, Jun]
    y-axis "Revenue ($K)" 0 --> 500
    bar [180, 250, 310, 280, 350, 420]
```

**Line chart:**
```mermaid
xychart-beta
    title "User Growth"
    x-axis [Jan, Feb, Mar, Apr, May, Jun]
    line [1200, 1800, 2500, 3100, 3800, 4500]
```

**Combined:**
```mermaid
xychart-beta
    title "Sales with Trend"
    x-axis [Jan, Feb, Mar, Apr, May, Jun]
    bar [300, 380, 280, 450, 350, 520]
    line [300, 330, 320, 353, 352, 395]
```

**Horizontal:**
```mermaid
xychart-beta horizontal
    title "Language Popularity"
    x-axis [Python, JavaScript, Java, Go, Rust]
    bar [30, 25, 20, 12, 8]
```

**Axis options:**
- Categorical: `x-axis [A, B, C]`
- Numeric range: `x-axis 0 --> 100`
- Titles: `x-axis "Category" [A, B, C]`
- Y-range: `y-axis "Score" 0 --> 100`

**Multi-series:** add multiple `bar` and/or `line` declarations. Each gets a distinct color from a monochromatic accent palette.
