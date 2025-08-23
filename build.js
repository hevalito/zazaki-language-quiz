#!/usr/bin/env node

/**
 * Build script for Zazaki Game
 * This script copies necessary files to the dist directory
 * that might not be included in the Vite build process.
 */

const fs = require('fs');
const path = require('path');

console.log('Running post-build script...');

// Create dist directory if it doesn't exist
if (!fs.existsSync('dist')) {
  console.log('Creating dist directory...');
  fs.mkdirSync('dist');
}

// Copy admin.html to dist
try {
  console.log('Copying admin.html to dist...');
  fs.copyFileSync('src/admin.html', 'dist/admin.html');
} catch (error) {
  console.error('Error copying admin.html:', error.message);
}

// Copy function-tester.html to dist
try {
  console.log('Copying function-tester.html to dist...');
  fs.copyFileSync('function-tester.html', 'dist/function-tester.html');
} catch (error) {
  console.error('Error copying function-tester.html:', error.message);
}

// Copy admin.css to dist
try {
  console.log('Copying admin.css to dist...');
  fs.copyFileSync('src/admin.css', 'dist/admin.css');
} catch (error) {
  console.error('Error copying admin.css:', error.message);
}

// Copy _redirects to dist
try {
  console.log('Copying _redirects to dist...');
  fs.copyFileSync('_redirects', 'dist/_redirects');
} catch (error) {
  console.error('Error copying _redirects:', error.message);
}

console.log('Post-build script completed successfully!');
