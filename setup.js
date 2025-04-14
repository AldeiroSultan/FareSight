// setup.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper to ask questions
const question = (text) => {
  return new Promise((resolve) => {
    rl.question(text, (answer) => {
      resolve(answer);
    });
  });
};

// Helper to create .env file
const createEnvFile = (template, destination, replacements) => {
  let content = fs.readFileSync(template, 'utf8');
  
  for (const [key, value] of Object.entries(replacements)) {
    content = content.replace(key, value);
  }
  
  fs.writeFileSync(destination, content);
  console.log(`Created ${destination}`);
};

// Main setup function
const setup = async () => {
  console.log('\x1b[36m%s\x1b[0m', '🛫 Flight Price Tracker - Setup');
  console.log('==================================');
  
  try {
    // 1. Check if PostgreSQL is installed
    console.log('\n🔍 Checking for PostgreSQL...');
    try {
      execSync('psql --version', { stdio: 'ignore' });
      console.log('✅ PostgreSQL is installed');
    } catch (error) {
      console.log('\x1b[33m%s\x1b[0m', '⚠️  PostgreSQL does not appear to be installed or is not in your PATH');
      console.log('Please install PostgreSQL before continuing: https://www.postgresql.org/download/');
      const shouldContinue = await question('Continue anyway? (y/n): ');
      if (shouldContinue.toLowerCase() !== 'y') {
        return;
      }
    }
    
    // 2. Database setup
    console.log('\n🗄️  Database Setup');
    const dbName = await question('Enter database name (flight_price_tracker): ') || 'flight_price_tracker';
    const dbUser = await question('Enter database username: ');
    const dbPassword = await question('Enter database password: ');
    const dbHost = await question('Enter database host (localhost): ') || 'localhost';
    const dbPort = await question('Enter database port (5432): ') || '5432';
    
    const dbUrl = `postgres://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`;
    
    // 3. Amadeus API setup
    console.log('\n🔑 Amadeus API Setup');
    console.log('You need Amadeus API credentials. Get them at: https://developers.amadeus.com/');
    const amadeusClientId = await question('Enter Amadeus Client ID: ');
    const amadeusClientSecret = await question('Enter Amadeus Client Secret: ');
    
    // 4. Email service setup
    console.log('\n📧 Email Service Setup');
    console.log('This application uses Resend for sending emails. Get an API key at: https://resend.com/');
    const resendApiKey = await question('Enter Resend API Key (leave blank to skip email functionality): ');
    const emailFrom = await question('Enter sender email address (alerts@flightpricetracker.com): ') || 'alerts@flightpricetracker.com';
    
    // 5. Generate secrets
    console.log('\n🔒 Generating Secrets');
    const sessionSecret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const jwtSecret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    // 6. Create .env files
    console.log('\n📝 Creating Environment Files');
    
    // Server .env
    const serverEnvReplacements = {
      'your_very_secure_session_secret': sessionSecret,
      'postgres://username:password@localhost:5432/flight_price_tracker': dbUrl,
      'your_amadeus_client_id': amadeusClientId,
      'your_amadeus_client_secret': amadeusClientSecret,
      'your_resend_api_key': resendApiKey,
      'alerts@flightpricetracker.com': emailFrom,
      'your_jwt_secret': jwtSecret
    };
    
    createEnvFile(
      path.join(__dirname, 'server', '.env.example'),
      path.join(__dirname, 'server', '.env'),
      serverEnvReplacements
    );
    
    // Client .env
    createEnvFile(
      path.join(__dirname, 'client', '.env.example'),
      path.join(__dirname, 'client', '.env'),
      {}
    );
    
    // 7. Install dependencies
    console.log('\n📦 Installing Dependencies');
    console.log('Installing server dependencies...');
    execSync('cd server && npm install', { stdio: 'inherit' });
    
    console.log('Installing client dependencies...');
    execSync('cd client && npm install', { stdio: 'inherit' });
    
    // 8. Set up database
    console.log('\n🗄️  Setting Up Database');
    try {
      console.log('Creating database...');
      execSync(`createdb ${dbName}`, { stdio: 'inherit' });
    } catch (error) {
      console.log('\x1b[33m%s\x1b[0m', `⚠️  Failed to create database. It might already exist or you don't have permissions.`);
      console.log('You may need to create it manually:');
      console.log(`createdb ${dbName}`);
    }
    
    try {
      console.log('Running migrations...');
      process.env.DATABASE_URL = dbUrl;
      execSync('cd server && node db/migrate.js', { stdio: 'inherit' });
      
      console.log('Seeding database with sample data...');
      execSync('cd server && node db/seed.js', { stdio: 'inherit' });
    } catch (error) {
      console.log('\x1b[31m%s\x1b[0m', '❌ Failed to set up database schema');
      console.log(error.message);
      return;
    }
    
    // 9. Done
    console.log('\n\x1b[32m%s\x1b[0m', '🎉 Setup complete!');
    console.log('\nTo start the application:');
    console.log('1. Start the server:');
    console.log('   cd server && npm run dev');
    console.log('2. In another terminal, start the client:');
    console.log('   cd client && npm start');
    console.log('\nDemo account:');
    console.log('Email: demo@example.com');
    console.log('Password: password123');
    
  } catch (error) {
    console.log('\x1b[31m%s\x1b[0m', '❌ Setup failed');
    console.error(error);
  } finally {
    rl.close();
  }
};

// Run setup
setup();