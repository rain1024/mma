# MMA Tournament Database ER Diagram

```mermaid
erDiagram
    promotions {
        text id PK
        text name
        text subtitle
        text theme
        text color
        datetime created_at
        datetime updated_at
    }

    events {
        text id PK
        text promotion_id FK
        text name
        text date
        text location
        text venue
        text status
        datetime created_at
        datetime updated_at
    }

    athletes {
        integer id PK
        text name
        text tournament
        text division
        text country
        text flag
        text gender
        integer wins
        integer losses
        integer draws
        text image_url
        datetime created_at
        datetime updated_at
    }

    matches {
        integer id PK
        text event_id FK
        text category
        integer fighter1_id FK
        text fighter1_name
        text fighter1_country
        text fighter1_flag
        integer fighter2_id FK
        text fighter2_name
        text fighter2_country
        text fighter2_flag
        text weight_class
        integer winner
        text method
        integer round
        text time
    }

    rankings {
        integer id PK
        text tournament
        text division
        integer rank
        integer athlete_id FK
        text athlete_name
        boolean is_champion
        datetime created_at
        datetime updated_at
    }

    p4p_rankings {
        integer id PK
        text tournament
        integer rank
        integer athlete_id FK
        text athlete_name
        datetime created_at
        datetime updated_at
    }

    promotions ||--o{ events : "has"
    events ||--o{ matches : "contains"
    athletes ||--o{ matches : "fighter1"
    athletes ||--o{ matches : "fighter2"
    athletes ||--o{ rankings : "ranked"
    athletes ||--o{ p4p_rankings : "p4p_ranked"
```

## Relationships

| From | To | Type | Description |
|------|-----|------|-------------|
| events.promotion_id | promotions.id | Many-to-One | Events belong to a promotion (cascade delete) |
| matches.event_id | events.id | Many-to-One | Matches belong to an event (cascade delete) |
| matches.fighter1_id | athletes.id | Many-to-One | First fighter in a match |
| matches.fighter2_id | athletes.id | Many-to-One | Second fighter in a match |
| rankings.athlete_id | athletes.id | Many-to-One | Athlete's division ranking |
| p4p_rankings.athlete_id | athletes.id | Many-to-One | Athlete's pound-for-pound ranking |
