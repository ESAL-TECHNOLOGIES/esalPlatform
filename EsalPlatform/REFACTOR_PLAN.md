# ESAL Platform MVP Refactoring Plan

## Overview
This document outlines the refactoring of the ESAL Platform monorepo from a complex multi-portal system to a focused MVP centered around the innovator workflow.

## Current State
- Multiple portals: innovator-portal, investor-portal, hub-portal, landing-page, web-vite (main)
- Complex role-based routing and authentication
- Separate applications for different user types
- Full TurboRepo setup with multiple build targets

## MVP Target State
- **Single Innovator Portal** as the main application
- **Simplified Landing Page** for public access
- **Backend API** (unchanged)
- Focus on core innovator features: profile management, pitch deck upload, AI analysis, basic matching

## Refactoring Steps

### Phase 1: Consolidate Applications
1. ✅ Create refactor plan documentation
2. ✅ Merge best features from innovator-portal into web-vite
3. ✅ Simplify authentication (remove complex role-based routing)
4. ✅ Remove unused portal applications
5. ✅ Update package.json and turbo.json configurations

### Phase 2: Simplify Features
1. ✅ Keep: Profile management, pitch deck upload/analysis, basic matching
2. ✅ Remove: Complex investor workflows, hub management, admin features
3. ✅ Simplify: Authentication to basic login/register
4. ✅ Focus: Innovator journey from signup to pitch presentation

### Phase 3: Update Configuration
1. ✅ Update workspace configuration
2. ✅ Remove unused dependencies
3. ✅ Simplify build processes
4. ✅ Update documentation

## Key Consolidation Decisions

### Applications to Keep
- `web-vite` → **Main Innovator Portal** (consolidated)
- `landing-page` → **Public Site** (simplified)
- `api` → **Backend** (unchanged)

### Applications to Remove/Archive
- `innovator-portal` → Merge features into main app
- `investor-portal` → Remove (out of MVP scope)
- `hub-portal` → Remove (out of MVP scope)
- `admin-portal` → Remove (out of MVP scope)
- `docs` → Simplify or remove

### Features to Keep in MVP
- ✅ User registration/login
- ✅ Innovator profile creation and management
- ✅ Pitch deck upload and AI analysis
- ✅ Basic investor matching suggestions
- ✅ Dashboard with key metrics
- ✅ Settings and account management

### Features to Remove
- ❌ Multi-role authentication system
- ❌ Investor portal functionality
- ❌ Hub/accelerator management
- ❌ Complex admin interfaces
- ❌ Advanced analytics and reporting
- ❌ Multi-tenant portal routing

## Implementation Strategy

1. **Preserve Core Value**: Keep the innovator experience intact
2. **Simplify Architecture**: Remove complexity where possible
3. **Maintain Quality**: Use existing UI components and patterns
4. **Enable Growth**: Structure allows for future expansion

## Success Metrics
- Single, focused application for innovators
- Reduced build times and complexity
- Cleaner codebase for faster development
- Clear path for future feature additions
