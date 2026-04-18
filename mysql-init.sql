-- Initial database setup for NewsVerifier
-- This script runs automatically when the Docker container starts

-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS news_verifier;

-- Use the database
USE news_verifier;

-- Grant privileges to the news_user
GRANT ALL PRIVILEGES ON news_verifier.* TO 'news_user'@'%';
FLUSH PRIVILEGES;

-- Optional: Create a backup user for read-only access
CREATE USER IF NOT EXISTS 'news_readonly'@'%' IDENTIFIED BY 'readonly_password';
GRANT SELECT ON news_verifier.* TO 'news_readonly'@'%';
FLUSH PRIVILEGES;
