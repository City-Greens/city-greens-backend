# City Greens - Backend

![Node.js CI](https://github.com/your-username/city-greens-backend/workflows/Node.js%20CI/badge.svg)
![License](https://img.shields.io/github/license/your-username/city-greens-backend)
![Version](https://img.shields.io/badge/version-1.0.0-blue)

City Greens is a web application that allows users to find community Produce Sellers in their area and allows City Growers to list their produce. The user can navigate the City Greens website and buy or sell products depending on their role. The user can check out once they have found products they like as a buyer. The user can adjust prices and update or remove quantities as a seller.

## Project Overview

Here are the key features of City Greens:

- **Buyers:**
  - Can create an account
  - Can search for produce sellers in their area
  - Can view a list of produce sellers in their area

- **Sellers:**
  - Can create an account
  - Can list their produce
  - Can update/delete their produce listings

## Installation

1. Clone the repository
    ```sh
    git clone https://github.com/your-username/city-greens-backend.git
    ```
2. Navigate to the project directory
    ```sh
    cd city-greens-backend
    ```
3. Install the dependencies
    ```sh
    npm install
    ```
4. Create a `.env` file in the root directory and add your environment variables
    ```env
    PORT=your_port
    DATABASE_URL=your_database_url
    STRIPE_SECRET_KEY=your_stripe_secret_key
    ```

## Usage

1. Start the development server
    ```sh
    npm run dev
    ```
2. Run tests
    ```sh
    npm test
    ```

## Dependencies

```json
{
  "body-parser": "^1.20.2",
  "cors": "^2.8.5",
  "dotenv": "^16.4.5",
  "express": "^4.19.2",
  "sqlite3": "^5.1.7",
  "stripe": "^15.8.0"
}
