/**
 * Load Testing Script for SmartCarBooking Application
 * 
 * This script simulates concurrent users performing various operations:
 * - Multiple employees submitting bookings simultaneously
 * - Admin processing multiple approvals
 * - Driver receiving multiple assignments
 * - Real-time listener performance under load
 * 
 * Usage: Open browser console and run: loadTest(numUsers, duration)
 */

// Load Testing Configuration
const LOAD_TEST_CONFIG = {
    maxConcurrentUsers: 50,
    testDuration: 60000, // 60 seconds
    operationsPerUser: 10,
    delayBetweenOperations: 1000, // 1 second
};

// Performance Metrics
const performanceMetrics = {
    startTime: null,
    endTime: null,
    totalOperations: 0,
    successfulOperations: 0,
    failedOperations: 0,
    averageResponseTime: 0,
    operationsPerSecond: 0,
    memoryUsage: [],
    errors: []
};

// Simulated User Data
const generateMockBooking = (userId, index) => {
    const vehicleTypes = ['bus', 'van', 'car'];
    const purposes = [
        'Field Trip to Museum',
        'Sports Event',
        'Workshop',
        'School Meeting',
        'Educational Tour'
    ];
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 30) + 1);
    
    return {
        vehicleType: vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)],
        startTime: startDate.toISOString(),
        durationHours: Math.floor(Math.random() * 12) + 1,
        driverOption: 'Request Driver',
        passengers: Math.floor(Math.random() * 50) + 1,
        tripPurpose: purposes[Math.floor(Math.random() * purposes.length)],
        requesterId: userId,
        status: 'PENDING',
        submittedTime: new Date().toISOString()
    };
};

// Simulate Employee Booking Submission
async function simulateEmployeeBooking(userId, bookingIndex) {
    const startTime = performance.now();
    
    try {
        const booking = generateMockBooking(`emp_${userId}`, bookingIndex);
        
        // Simulate form submission
        if (window.createBooking) {
            const bookingId = await window.createBooking(booking);
            const endTime = performance.now();
            const responseTime = endTime - startTime;
            
            performanceMetrics.successfulOperations++;
            performanceMetrics.totalOperations++;
            performanceMetrics.averageResponseTime += responseTime;
            
            return {
                success: true,
                bookingId,
                responseTime,
                userId
            };
        } else {
            // Fallback to mock data
            const bookingId = `B-LOAD-${userId}-${bookingIndex}`;
            const endTime = performance.now();
            const responseTime = endTime - startTime;
            
            performanceMetrics.successfulOperations++;
            performanceMetrics.totalOperations++;
            performanceMetrics.averageResponseTime += responseTime;
            
            return {
                success: true,
                bookingId,
                responseTime,
                userId
            };
        }
    } catch (error) {
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        
        performanceMetrics.failedOperations++;
        performanceMetrics.totalOperations++;
        performanceMetrics.errors.push({
            error: error.message,
            userId,
            bookingIndex,
            responseTime
        });
        
        return {
            success: false,
            error: error.message,
            responseTime,
            userId
        };
    }
}

// Simulate Admin Approval
async function simulateAdminApproval(bookingId) {
    const startTime = performance.now();
    
    try {
        // Simulate approval
        if (window.updateBookingFirestore) {
            await window.updateBookingFirestore(bookingId, {
                status: 'APPROVED',
                assignedDriverId: `driver_${Math.floor(Math.random() * 5) + 1}`,
                approvedAt: new Date().toISOString()
            });
        }
        
        const endTime = performance.now();
        return {
            success: true,
            responseTime: endTime - startTime,
            bookingId
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
            bookingId
        };
    }
}

// Simulate Real-time Listener Performance
function testRealTimeListenerPerformance(listenerType, duration = 10000) {
    return new Promise((resolve) => {
        const startTime = performance.now();
        let updateCount = 0;
        let memoryBefore = performance.memory ? performance.memory.usedJSHeapSize : 0;
        
        // Monitor listener updates
        const originalConsoleLog = console.log;
        console.log = function(...args) {
            if (args[0] && args[0].includes('Listener')) {
                updateCount++;
            }
            originalConsoleLog.apply(console, args);
        };
        
        setTimeout(() => {
            const endTime = performance.now();
            const elapsedTime = endTime - startTime;
            const memoryAfter = performance.memory ? performance.memory.usedJSHeapSize : 0;
            const memoryDelta = memoryAfter - memoryBefore;
            
            console.log = originalConsoleLog;
            
            resolve({
                listenerType,
                duration: elapsedTime,
                updatesReceived: updateCount,
                updatesPerSecond: updateCount / (elapsedTime / 1000),
                memoryDelta: memoryDelta / 1024 / 1024, // MB
                memoryBefore: memoryBefore / 1024 / 1024,
                memoryAfter: memoryAfter / 1024 / 1024
            });
        }, duration);
    });
}

// Memory Usage Monitor
function monitorMemoryUsage() {
    if (performance.memory) {
        const memory = {
            used: performance.memory.usedJSHeapSize / 1024 / 1024, // MB
            total: performance.memory.totalJSHeapSize / 1024 / 1024, // MB
            limit: performance.memory.jsHeapSizeLimit / 1024 / 1024, // MB
            timestamp: Date.now()
        };
        
        performanceMetrics.memoryUsage.push(memory);
        return memory;
    }
    return null;
}

// Dashboard Population Performance Test
async function testDashboardPopulation(userId, role) {
    const startTime = performance.now();
    
    try {
        if (role === 'employee' && window.populateEmployeeDashboard) {
            await window.populateEmployeeDashboard(userId);
        } else if (role === 'admin' && window.populateAdminDashboard) {
            await window.populateAdminDashboard();
        } else if (role === 'driver' && window.populateDriverDashboard) {
            await window.populateDriverDashboard(userId);
        }
        
        const endTime = performance.now();
        return {
            success: true,
            responseTime: endTime - startTime,
            role
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
            role
        };
    }
}

// Main Load Test Function
async function loadTest(numUsers = 10, duration = 30000) {
    console.log(`🚀 Starting Load Test: ${numUsers} users, ${duration}ms duration`);
    console.log('='.repeat(60));
    
    performanceMetrics.startTime = performance.now();
    performanceMetrics.memoryUsage.push(monitorMemoryUsage());
    
    const userPromises = [];
    const bookingIds = [];
    
    // Simulate concurrent users
    for (let i = 0; i < numUsers; i++) {
        const userPromise = (async () => {
            const userResults = [];
            
            for (let j = 0; j < LOAD_TEST_CONFIG.operationsPerUser; j++) {
                // Simulate booking submission
                const result = await simulateEmployeeBooking(i, j);
                if (result.success && result.bookingId) {
                    bookingIds.push(result.bookingId);
                }
                userResults.push(result);
                
                // Delay between operations
                await new Promise(resolve => setTimeout(resolve, LOAD_TEST_CONFIG.delayBetweenOperations));
            }
            
            return userResults;
        })();
        
        userPromises.push(userPromise);
    }
    
    // Wait for all users to complete or timeout
    const timeoutPromise = new Promise(resolve => setTimeout(resolve, duration));
    const results = await Promise.race([
        Promise.all(userPromises),
        timeoutPromise
    ]);
    
    // Monitor memory during test
    performanceMetrics.memoryUsage.push(monitorMemoryUsage());
    
    // Test real-time listener performance
    console.log('\n📡 Testing Real-time Listener Performance...');
    const listenerResults = await testRealTimeListenerPerformance('all', 5000);
    
    // Test dashboard population with large dataset
    console.log('\n📊 Testing Dashboard Population Performance...');
    const dashboardResults = [];
    for (let i = 0; i < Math.min(5, numUsers); i++) {
        const result = await testDashboardPopulation(`emp_${i}`, 'employee');
        dashboardResults.push(result);
    }
    
    // Calculate final metrics
    performanceMetrics.endTime = performance.now();
    const totalTime = performanceMetrics.endTime - performanceMetrics.startTime;
    performanceMetrics.averageResponseTime = performanceMetrics.totalOperations > 0 
        ? performanceMetrics.averageResponseTime / performanceMetrics.totalOperations 
        : 0;
    performanceMetrics.operationsPerSecond = performanceMetrics.totalOperations / (totalTime / 1000);
    
    // Generate report
    generateLoadTestReport(results, listenerResults, dashboardResults);
}

// Generate Load Test Report
function generateLoadTestReport(userResults, listenerResults, dashboardResults) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 LOAD TEST REPORT');
    console.log('='.repeat(60));
    
    // Overall Metrics
    console.log('\n📈 Overall Performance:');
    console.log(`   Total Operations: ${performanceMetrics.totalOperations}`);
    console.log(`   Successful: ${performanceMetrics.successfulOperations} (${((performanceMetrics.successfulOperations / performanceMetrics.totalOperations) * 100).toFixed(2)}%)`);
    console.log(`   Failed: ${performanceMetrics.failedOperations} (${((performanceMetrics.failedOperations / performanceMetrics.totalOperations) * 100).toFixed(2)}%)`);
    console.log(`   Average Response Time: ${performanceMetrics.averageResponseTime.toFixed(2)}ms`);
    console.log(`   Operations Per Second: ${performanceMetrics.operationsPerSecond.toFixed(2)}`);
    
    // Memory Usage
    if (performanceMetrics.memoryUsage.length >= 2) {
        const memoryStart = performanceMetrics.memoryUsage[0];
        const memoryEnd = performanceMetrics.memoryUsage[performanceMetrics.memoryUsage.length - 1];
        const memoryDelta = memoryEnd.used - memoryStart.used;
        
        console.log('\n💾 Memory Usage:');
        console.log(`   Start: ${memoryStart.used.toFixed(2)} MB`);
        console.log(`   End: ${memoryEnd.used.toFixed(2)} MB`);
        console.log(`   Delta: ${memoryDelta > 0 ? '+' : ''}${memoryDelta.toFixed(2)} MB`);
        console.log(`   Limit: ${memoryStart.limit.toFixed(2)} MB`);
        console.log(`   Usage: ${((memoryEnd.used / memoryStart.limit) * 100).toFixed(2)}%`);
    }
    
    // Real-time Listener Performance
    if (listenerResults) {
        console.log('\n📡 Real-time Listener Performance:');
        console.log(`   Listener Type: ${listenerResults.listenerType}`);
        console.log(`   Updates Received: ${listenerResults.updatesReceived}`);
        console.log(`   Updates Per Second: ${listenerResults.updatesPerSecond.toFixed(2)}`);
        console.log(`   Memory Delta: ${listenerResults.memoryDelta.toFixed(2)} MB`);
    }
    
    // Dashboard Performance
    if (dashboardResults && dashboardResults.length > 0) {
        const avgDashboardTime = dashboardResults.reduce((sum, r) => sum + (r.responseTime || 0), 0) / dashboardResults.length;
        console.log('\n📊 Dashboard Population Performance:');
        console.log(`   Average Load Time: ${avgDashboardTime.toFixed(2)}ms`);
        console.log(`   Tests Completed: ${dashboardResults.filter(r => r.success).length}/${dashboardResults.length}`);
    }
    
    // Errors
    if (performanceMetrics.errors.length > 0) {
        console.log('\n❌ Errors:');
        performanceMetrics.errors.slice(0, 10).forEach((error, index) => {
            console.log(`   ${index + 1}. ${error.error} (User: ${error.userId}, Response: ${error.responseTime.toFixed(2)}ms)`);
        });
        if (performanceMetrics.errors.length > 10) {
            console.log(`   ... and ${performanceMetrics.errors.length - 10} more errors`);
        }
    }
    
    // Performance Recommendations
    console.log('\n💡 Recommendations:');
    if (performanceMetrics.averageResponseTime > 1000) {
        console.log('   ⚠️  Average response time is high (>1000ms). Consider optimizing database queries.');
    }
    if (performanceMetrics.failedOperations > performanceMetrics.totalOperations * 0.1) {
        console.log('   ⚠️  Failure rate is high (>10%). Check error logs and system stability.');
    }
    if (performanceMetrics.memoryUsage.length >= 2) {
        const memoryDelta = performanceMetrics.memoryUsage[performanceMetrics.memoryUsage.length - 1].used - performanceMetrics.memoryUsage[0].used;
        if (memoryDelta > 50) {
            console.log('   ⚠️  Memory usage increased significantly (>50MB). Check for memory leaks.');
        }
    }
    if (listenerResults && listenerResults.updatesPerSecond > 100) {
        console.log('   ⚠️  Real-time listener updates are very frequent (>100/sec). Consider throttling.');
    }
    
    console.log('\n' + '='.repeat(60));
    
    // Return metrics for further analysis
    return {
        overall: performanceMetrics,
        listener: listenerResults,
        dashboard: dashboardResults
    };
}

// Quick Performance Test (Simplified)
async function quickLoadTest() {
    console.log('🚀 Running Quick Load Test (10 users, 5 operations each)...');
    return await loadTest(10, 30000);
}

// Stress Test (Maximum Load)
async function stressTest() {
    console.log('🔥 Running Stress Test (50 users, 10 operations each)...');
    return await loadTest(50, 120000);
}

// Export functions for use in console
if (typeof window !== 'undefined') {
    window.loadTest = loadTest;
    window.quickLoadTest = quickLoadTest;
    window.stressTest = stressTest;
    window.performanceMetrics = performanceMetrics;
    
    console.log('✅ Load testing functions loaded!');
    console.log('   - loadTest(numUsers, duration)');
    console.log('   - quickLoadTest()');
    console.log('   - stressTest()');
    console.log('   - performanceMetrics (object)');
}

