# Server Status

## ✅ Server Running

**Port**: 8080 (changed from 8000 due to port conflict)

## 🚀 Access URLs

### Test Runner (Recommended)
```
http://localhost:8080/run-tests.html
```

### Main Application
```
http://localhost:8080/index.html
```

## 🔧 If Server Stops

### Restart Server
```bash
cd "/Users/macbook/Desktop/School Transport, Simplified"
python3 -m http.server 8080
```

### Check Server Status
```bash
lsof -ti:8080
```

### Kill Existing Server
```bash
kill $(lsof -ti:8080)
```

### Use Different Port
If 8080 is also in use, try:
```bash
python3 -m http.server 3000
# Then access: http://localhost:3000/run-tests.html
```

## 📝 Quick Start

1. **Open test runner**: http://localhost:8080/run-tests.html
2. **Or open main app**: http://localhost:8080/index.html
3. **Open Developer Tools** (F12) → Console tab
4. **Run tests**: `quickLoadTest()`

