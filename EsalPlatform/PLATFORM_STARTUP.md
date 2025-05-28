# 🚀 ESAL Platform Startup Guide

## 🎯 Quick Start Instructions

This guide will help you start the ESAL Platform quickly and efficiently.

### 🛠️ Prerequisites

Before starting, ensure you have:

- **Node.js** 18+ installed
- **pnpm** 8+ package manager
- **Python** 3.8+ for API services
- **Git** for version control

### ⚡ Startup Options

#### Option 1: Automated Startup (Recommended)

```powershell
# From the root directory
cd d:\esalPlatform\EsalPlatform
.\start-platform.ps1
```

#### Option 2: Manual Startup

```powershell
# Install dependencies
pnpm install

# Start all services
pnpm run dev:all
```

#### Option 3: Individual Services

```powershell
# Start frontend only
pnpm run dev:web

# Start API only
pnpm run dev:api

# Start admin portal only
pnpm run dev:admin
```

### 🌐 Service URLs

Once started, access your platform at:

| Service | URL | Description |
|---------|-----|-------------|
| **Main Platform** | <http://localhost:3333> | Primary user interface |
| **Admin Portal** | <http://localhost:3001> | Administrative interface |
| **API Server** | <http://localhost:8000> | Backend API |
| **API Docs** | <http://localhost:8000/docs> | Interactive API documentation |

### ✅ Verification Steps

1. **Check API Health**:
   ```powershell
   curl http://localhost:8000/health
   ```

2. **Open Platform**:
   ```powershell
   start http://localhost:3333
   ```

3. **Access Admin Portal**:
   ```powershell
   start http://localhost:3001
   ```

### 🐛 Troubleshooting

If you encounter issues:

1. **Port Conflicts**: Check if ports 3001, 3333, or 8000 are in use
2. **Dependencies**: Run `pnpm install` to ensure all packages are installed
3. **Python Environment**: Check Python version and API dependencies
4. **Environment Variables**: Verify `.env` configuration

### 📚 Additional Resources

- [Development Status](./DEVELOPMENT_STATUS.md)
- [MVP Status](./MVP_STATUS.md)
- [Admin Portal Guide](./ADMIN_PORTAL_SUMMARY.md)

---

**Platform Version**: 1.0.0 | **Last Updated**: May 28, 2025