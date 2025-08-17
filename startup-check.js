#!/usr/bin/env node

// Simple startup validation script
console.log('🔍 MusicGPT Backend Startup Validation');
console.log('=====================================');

// Check environment variables
const requiredEnvVars = ['NODE_ENV', 'PORT'];
const optionalEnvVars = ['DATABASE_URL', 'REDIS_URL', 'UPSTASH_REDIS_REST_URL'];

console.log('\n📋 Environment Variables:');
requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  if (value) {
    console.log(`✅ ${envVar}: ${value}`);
  } else {
    console.log(`❌ ${envVar}: NOT SET (will use default)`);
  }
});

optionalEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  if (value) {
    console.log(`✅ ${envVar}: ${value ? 'SET' : 'NOT SET'}`);
  } else {
    console.log(`⚠️  ${envVar}: NOT SET (optional)`);
  }
});

// Check Node.js version
console.log('\n🟢 Node.js Version:', process.version);

// Check memory
const memUsage = process.memoryUsage();
console.log('\n💾 Memory Usage:');
console.log(`   RSS: ${Math.round(memUsage.rss / 1024 / 1024)} MB`);
console.log(`   Heap Total: ${Math.round(memUsage.heapTotal / 1024 / 1024)} MB`);
console.log(`   Heap Used: ${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`);

// Check if we can bind to the port
const net = require('net');
const port = process.env.PORT || 3000;

const server = net.createServer();
server.listen(port, '0.0.0.0', () => {
  console.log(`✅ Port ${port} is available`);
  server.close();
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`❌ Port ${port} is already in use`);
  } else {
    console.log(`❌ Port ${port} error:`, err.message);
  }
});

console.log('\n🚀 Starting NestJS application...');
console.log('=====================================');
