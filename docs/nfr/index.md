---
title: Non-Functional Requirements
---

# Non-Functional Requirements (NFRs)

This section documents all non-functional requirements for the project. NFRs are validated as part of the governance workflow before a feature can be marked complete.

## Category Codes

NFR IDs follow the format `NFR-{CATEGORY}-{NUMBER}`:

| Code | Category | Description |
|------|----------|-------------|
| `PERF` | Performance | Speed, throughput, resource usage |
| `SEC` | Security | Auth, data protection, compliance |
| `A11Y` | Accessibility | WCAG compliance, inclusive design |
| `REL` | Reliability | Uptime, error handling, recovery |
| `SCALE` | Scalability | Growth handling |
| `MAINT` | Maintainability | Code quality, documentation |

### Examples

- `NFR-PERF-001` - API response time under 200ms
- `NFR-SEC-001` - All endpoints require authentication
- `NFR-A11Y-001` - WCAG 2.1 AA compliance

## Categories

### Performance (`NFR-PERF-XXX`)

Requirements related to speed, throughput, and resource usage.

- Response times
- Throughput limits
- Memory/CPU usage
- Database query performance

### Security (`NFR-SEC-XXX`)

Requirements for authentication, authorization, data protection, and compliance.

- Authentication requirements
- Authorization rules
- Data encryption
- Audit logging
- Compliance (SOC2, GDPR, etc.)

### Accessibility (`NFR-A11Y-XXX`)

Requirements for WCAG compliance and inclusive design.

- WCAG 2.1 AA/AAA compliance
- Screen reader compatibility
- Keyboard navigation
- Color contrast
- Focus management

### Reliability (`NFR-REL-XXX`)

Requirements for uptime, error handling, and recovery.

- Uptime SLAs
- Error handling
- Graceful degradation
- Disaster recovery

### Scalability (`NFR-SCALE-XXX`)

Requirements for handling growth in users, data, and traffic.

- Concurrent user limits
- Data volume handling
- Horizontal scaling

### Maintainability (`NFR-MAINT-XXX`)

Requirements for code quality, documentation, and operability.

- Code coverage
- Documentation standards
- Monitoring/observability

## Governance Integration

NFRs are checked during the `nfr_validating` phase:

```
implementing → nfr_validating → complete
                    ↓
              Check all applicable NFRs
```

### Linking NFRs to Roadmap Items

In your ROAD file:

```yaml
governance:
  nfrs:
    applicable: [NFR-PERF-001, NFR-SEC-001, NFR-A11Y-001]
    status: pending
    results:
      NFR-PERF-001:
        status: pass
        evidence: "p95 latency: 150ms"
        validated_by: "@ci-runner"
      NFR-SEC-001:
        status: pass
        evidence: "Auth middleware verified"
        validated_by: "@ci-runner"
      NFR-A11Y-001:
        status: pass
        evidence: "Lighthouse score: 98"
        validated_by: "@ux-ui-inspector"
```

## NFR Template Format

```yaml
---
id: NFR-CAT-XXX
title: "Requirement Title"
category: performance  # performance | security | accessibility | reliability | scalability | maintainability
priority: high  # high | medium | low
status: active  # active | deprecated
created: YYYY-MM-DD
---
```

See [NFR-TEMPLATE.md](./NFR-TEMPLATE.md) for the full template.

## Validation

NFR compliance is validated by:

| Agent | NFR Types |
|-------|-----------|
| `@ci-runner` | Performance, Security (automated) |
| `@ux-ui-inspector` | Accessibility |

Browse NFRs by category in the sidebar navigation.
