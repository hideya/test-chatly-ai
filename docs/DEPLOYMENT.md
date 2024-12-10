# Deployment Guide

This document provides detailed deployment instructions for various platforms. Choose the platform that best suits your needs.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Replit Deployment](#replit-deployment)
- [Heroku Deployment](#heroku-deployment)
- [AWS Deployment](#aws-deployment)
  - [EC2 Deployment](#ec2-deployment)
  - [Elastic Beanstalk Deployment](#elastic-beanstalk-deployment)
- [Docker Deployment](#docker-deployment)
- [General Maintenance Tips](#general-maintenance-tips)
- [Deployment Verification Steps](#deployment-verification-steps)
- [Troubleshooting Common Issues](#troubleshooting-common-issues)

## Replit Deployment

### Prerequisites
- Replit account
- OpenAI API key
- Neon PostgreSQL database (provided by Replit platform)

### Step-by-Step Instructions

1. **Fork the Repository**
   - Go to [replit.com](https://replit.com)
   - Click "Create Repl"
   - Choose "Import from GitHub"
   - Paste the repository URL
   - Click "Create Repl"
   - When creating the Repl, ignore the changes to `.replit` file suggested in "Configure your Repl".
     If any changes are made, revert them, otherwise the deployment may fail.

2. **Configure Environment**
   - Create a Neon PostgreSQL database for the Repl
     - Open your Repl's "PostgreSQL" tab under the "Tools" section, click "Create a database"
     - The DATABASE_URL environment variable will be automatically set
   - Configure the environment variables
     - In your Repl's "Secrets" tab, add:
       - `DATABASE_URL`: Your PostgreSQL connection string (if not already created)
       - `OPENAI_API_KEY`: Your OpenAI API key
       - `PORT`: Set to 5001 (or preferred port)

3. **Install and Setup**
   ```bash
   npm install
   npm run db:push
   ```

4. **Build and Deploy**
   ```bash
   npm run build
   npm start
   ```

### Replit-Specific Features
Replit automatically handles:
- HTTPS certificates
- Process management
- Continuous deployment from Git
- Domain management

## Heroku Deployment

### Prerequisites
- Heroku CLI installed
- Heroku account
- Git installed
- PostgreSQL add-on (available through Heroku)

### Step-by-Step Instructions

1. **Login to Heroku**
   ```bash
   heroku login
   ```

2. **Create a new Heroku app**
   ```bash
   heroku create your-app-name
   ```

3. **Add PostgreSQL Database**
   ```bash
   heroku addons:create heroku-postgresql:hobby-dev
   ```

4. **Configure Environment Variables**
   ```bash
   heroku config:set OPENAI_API_KEY=your_api_key
   ```

5. **Deploy the Application**
   ```bash
   git push heroku main
   ```

6. **Run Database Migrations**
   ```bash
   heroku run npm run db:push
   ```

### Monitoring and Maintenance
- Use Heroku Dashboard for basic monitoring
- Enable Heroku Application Metrics add-on
- Set up logging with Papertrail add-on
- Configure alerts for critical metrics

## AWS Deployment

### EC2 Deployment

#### Prerequisites
- AWS account
- AWS CLI installed
- Basic knowledge of EC2 and security groups

#### Step-by-Step Instructions

1. **Launch EC2 Instance**
   - Choose Amazon Linux 2 AMI
   - Select appropriate instance type (t2.micro for testing)
   - Configure security groups for ports 80, 443, and 5001

2. **Connect to Instance**
   ```bash
   ssh -i your-key.pem ec2-user@your-instance-ip
   ```

3. **Install Dependencies**
   ```bash
   sudo yum update -y
   sudo yum install -y nodejs npm git
   ```

4. **Clone and Setup Application**
   ```bash
   git clone your-repository
   cd your-app
   npm install
   ```

5. **Configure Environment**
   ```bash
   echo "export OPENAI_API_KEY=your_api_key" >> ~/.bashrc
   echo "export DATABASE_URL=your_database_url" >> ~/.bashrc
   source ~/.bashrc
   ```

6. **Setup Process Manager**
   ```bash
   npm install -g pm2
   pm2 start npm --name "app" -- start
   pm2 startup
   ```

#### Monitoring and Maintenance
- Use AWS CloudWatch for monitoring
- Configure CloudWatch alarms
- Setup AWS Systems Manager for maintenance
- Regular security updates using `yum update`

### Elastic Beanstalk Deployment

#### Prerequisites
- AWS account
- AWS EB CLI installed
- Application properly configured for EB

#### Step-by-Step Instructions

1. **Initialize EB Application**
   ```bash
   eb init -p node.js your-app-name
   ```

2. **Configure Environment Variables**
   - Add environment variables through EB Console
   - Include DATABASE_URL and OPENAI_API_KEY

3. **Deploy Application**
   ```bash
   eb create your-environment-name
   ```

4. **Configure Health Checks**
   - Set up application health monitoring
   - Configure auto-scaling rules

#### Monitoring and Maintenance
- Use EB Console for monitoring
- Configure Enhanced Health Reporting
- Setup CloudWatch alarms
- Regular platform updates

## Docker Deployment

### Prerequisites
- Docker installed
- Docker Compose (optional)
- Access to Docker registry

### Step-by-Step Instructions

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   RUN npm run build
   EXPOSE 5001
   CMD ["npm", "start"]
   ```

2. **Build Docker Image**
   ```bash
   docker build -t your-app-name .
   ```

3. **Configure Environment**
   Create a `.env` file or pass environment variables:
   ```bash
   docker run -e OPENAI_API_KEY=your_key -e DATABASE_URL=your_db_url -p 5001:5001 your-app-name
   ```

4. **Run Container**
   ```bash
   docker run -d -p 5001:5001 --name your-app your-app-name
   ```

### Docker Compose Setup
```yaml
version: '3'
services:
  app:
    build: .
    ports:
      - "5001:5001"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/dbname
      - OPENAI_API_KEY=your_key
    depends_on:
      - db
  db:
    image: postgres:14
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=dbname
```

### Monitoring and Maintenance
- Use Docker stats for basic monitoring
- Configure container health checks
- Implement Docker logging drivers
- Regular image updates and security scanning

## General Maintenance Tips

1. **Regular Backups**
   - Schedule regular database backups
   - Store application state and configurations
   - Test backup restoration procedures

2. **Security**
   - Keep dependencies updated
   - Regular security audits
   - Monitor for suspicious activities
   - Implement proper access controls

3. **Performance**
   - Monitor application metrics
   - Set up alerting for critical issues
   - Regular performance testing
   - Database optimization

4. **Scaling**
   - Monitor resource usage
   - Implement horizontal scaling when needed
   - Use load balancers for traffic distribution
   - Cache frequently accessed data

## Deployment Verification Steps

Before considering a deployment successful, follow these verification steps:

1. **Server Health Check**
   ```bash
   # Check if the server is running and responding
   curl http://your-domain:5001/health
   
   # Verify server process
   ps aux | grep node
   
   # Check server logs
   tail -f logs/app.log
   ```
   Expected health response: `{"status": "healthy", "timestamp": "...", "version": "1.0.0"}`

2. **Database Connectivity**
   ```bash
   # Verify database connection
   curl http://your-domain:5001/health | grep "healthy"
   
   # Check database migrations status
   npm run db:push -- --dry-run
   
   # Test database query performance
   curl -X GET http://your-domain:5001/api/threads \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -w "\nTime: %{time_total}s\n"
   ```
   Expected: 
   - Successful connection message in logs
   - Migrations are up to date
   - Query response time < 500ms

3. **API Functionality**
   ```bash
   # Test authentication flow
   # 1. Register
   curl -X POST http://your-domain:5001/api/register \
     -H "Content-Type: application/json" \
     -d '{"username": "testuser", "password": "testpass"}'
   
   # 2. Login
   curl -X POST http://your-domain:5001/api/login \
     -H "Content-Type: application/json" \
     -d '{"username": "testuser", "password": "testpass"}'
   
   # 3. Create chat thread
   curl -X POST http://your-domain:5001/api/threads \
     -H "Content-Type: application/json" \
     -H "Cookie: connect.sid=YOUR_SESSION_ID" \
     -d '{"message": "Hello, AI!"}'
   
   # 4. Verify user session
   curl http://your-domain:5001/api/user \
     -H "Cookie: connect.sid=YOUR_SESSION_ID"
   ```
   Expected: Successful responses for all endpoints with appropriate status codes

4. **Environment Variables**
   ```bash
   # Verify required environment variables
   node -e '
   const required = [
     "DATABASE_URL",
     "OPENAI_API_KEY",
     "PORT",
     "NODE_ENV"
   ];
   required.forEach(key => {
     if (!process.env[key]) console.error(`Missing ${key}`);
     else console.log(`${key} is set`);
   });'
   
   # Test OpenAI API key validity
   curl -X POST http://your-domain:5001/api/threads \
     -H "Content-Type: application/json" \
     -H "Cookie: connect.sid=YOUR_SESSION_ID" \
     -d '{"message": "Test OpenAI integration"}' \
     -w "\nStatus: %{http_code}\n"
   ```

5. **Frontend Assets**
   ```bash
   # Verify static assets
   curl -I http://your-domain:5001/assets/index.js
   curl -I http://your-domain:5001/assets/index.css
   
   # Check for JavaScript errors
   # In browser console, verify no errors and run:
   console.log('React version:', React.version);
   console.log('React Query version:', ReactQuery.version);
   ```
   Browser Tests:
   - Verify dark/light mode switching
   - Test responsive layout on different screen sizes
   - Confirm WebSocket connection for real-time updates
   - Verify LaTeX rendering in chat messages

6. **Security Verification**
   ```bash
   # Test CORS configuration
   curl -X OPTIONS http://your-domain:5001/api/health \
     -H "Origin: http://example.com" \
     -H "Access-Control-Request-Method: GET" \
     -v
   
   # Test rate limiting
   for i in {1..10}; do
     curl -w "Request $i: %{http_code}\n" \
       http://your-domain:5001/api/health;
     sleep 1;
   done
   
   # Test authentication requirements
   curl http://your-domain:5001/api/threads
   # Should return 401 Unauthorized
   ```
   Additional Checks:
   - Verify password hashing (check database entries)
   - Test session timeout configuration
   - Verify secure headers (X-Frame-Options, CSP, etc.)
   - Check SSL/TLS configuration if applicable

7. **Performance Check**
   ```bash
   # Monitor resource usage
   top -b -n 1 | grep node
   free -m
   df -h
   
   # Test response times
   ab -n 100 -c 10 http://your-domain:5001/health/
   
   # Monitor WebSocket connections
   netstat -an | grep :5001 | wc -l
   ```
   Performance Targets:
   - API response time < 200ms (95th percentile)
   - Memory usage < 512MB
   - CPU usage < 70%
   - WebSocket latency < 100ms
   - Maximum concurrent connections: 1000

8. **Error Handling**
   ```bash
   # Test error responses
   # Invalid login
   curl -X POST http://your-domain:5001/api/login \
     -H "Content-Type: application/json" \
     -d '{"username": "invalid", "password": "wrong"}'
   
   # Invalid thread ID
   curl http://your-domain:5001/api/threads/999999/messages \
     -H "Cookie: connect.sid=YOUR_SESSION_ID"
   
   # Malformed JSON
   curl -X POST http://your-domain:5001/api/threads \
     -H "Content-Type: application/json" \
     -H "Cookie: connect.sid=YOUR_SESSION_ID" \
     -d '{invalid json}'
   ```
   Expected Error Handling:
   - Proper HTTP status codes (400, 401, 403, 404, 500)
   - JSON error responses with clear messages
   - Error logging to appropriate channels
   - Rate limit exceeded responses

### Troubleshooting Common Issues

1. **Server Not Starting**
   - Check port availability: `lsof -i :5001`
   - Verify Node.js version: `node --version`
   - Check for process conflicts

2. **Database Connection Failures**
   - Verify DATABASE_URL format
   - Check database server is accessible
   - Confirm database user permissions

3. **Frontend Loading Issues**
   - Clear browser cache
   - Check build artifacts in `dist` directory
   - Verify static file serving configuration

4. **API Errors**
   - Check API endpoint URLs
   - Verify request headers and body format
   - Monitor server logs for detailed error messages
