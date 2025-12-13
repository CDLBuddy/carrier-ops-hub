<!-- carrier-ops-hub/docs/product/mvp-scope.md -->

# MVP Scope

This document defines the Minimum Viable Product scope for Carrier Ops Hub.

## In Scope for MVP

### Core Features

#### Load Management
- ✅ Create, view, update, delete loads
- ✅ Basic load details (pickup, delivery, dates, rates)
- ✅ Assign driver and vehicle to load
- ✅ Update load status manually
- ✅ View load list with filters (status, date range)

#### Driver Management
- ✅ View driver roster
- ✅ Basic driver profile (name, license, phone)
- ✅ Assign loads to drivers
- ✅ View driver's assigned loads

#### Document Management
- ✅ Upload documents (BOL, POD, receipts)
- ✅ Attach documents to loads
- ✅ View/download documents
- ✅ Basic document categorization

#### User Roles & Permissions
- ✅ Role-based access control (Owner, Dispatcher, Driver, Billing)
- ✅ Role-specific dashboards
- ✅ Basic permission checks

#### Dashboard Views
- ✅ Dispatcher dashboard with load queues
- ✅ Driver home with assigned loads
- ✅ Basic metrics (active loads, completed loads)

### Integrations (Read-only MVP)
- ✅ Samsara webhook integration (location updates)
- ✅ Display location data on load detail
- ⚠️ No automated dispatch decisions (manual only)

## Out of Scope for MVP

### Features for Post-MVP

#### Advanced Features
- ❌ Automated load assignment
- ❌ Route optimization
- ❌ Advanced billing/invoicing automation
- ❌ Customer portal
- ❌ Mobile app (web-only for MVP)
- ❌ Advanced analytics and reporting
- ❌ Multi-company support

#### Integrations
- ❌ DAT/Truckstop load board integrations
- ❌ Accounting software integrations (QuickBooks, etc.)
- ❌ Email/SMS notifications (manual communication only)

#### Advanced Compliance
- ❌ Automated HOS violation alerts
- ❌ IFTA reporting
- ❌ Maintenance scheduling
- ❌ Insurance tracking

## MVP Success Criteria

1. **Functional**: All core workflows can be completed end-to-end
2. **Stable**: No critical bugs that block primary workflows
3. **Usable**: UI is intuitive enough for basic tasks without training
4. **Performant**: Load times < 2 seconds for key actions
5. **Deployed**: Running in production with real data

## Timeline

- **Phase 1** (Setup): 1 week - Infrastructure, authentication, basic UI
- **Phase 2** (Core Features): 3 weeks - Load management, driver management, documents
- **Phase 3** (Polish & Integration): 2 weeks - Samsara integration, testing, deployment

**Total MVP Timeline**: 6 weeks
