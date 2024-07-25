# AlertCity Server

AlertCity Server is a GraphQL-based server-side application that interacts with a MongoDB database. This project is set up using Nest.js and can be utilized as a starting point for building robust backend services.

## Environment setup

Before you begin, make sure you have Node.js(v22.4.1) and Yarn package manager installed on your machine. You will also need mongoDB installed and running locally.

Follow these steps to set up your environment:

### Database Setup

1. Set up your local MongoDB database.
2. Ensure that MongoDB is running on port `5432` (or update the `.env` file with your custom port).

### Application Setup

1. Clone this repository to your local machine.
2. Navigate to the project root directory in your terminal.
3. Run `yarn` or `yarn install` to install all the necessary dependencies.
4. Create a `.env` file in the root directory and add the following environment variables:

```sh
DB_HOST=localhost
DB_NAME=alertcity
DB_PORT=27017
DB_USERNAME=alertcity
DB_PASSWORD=alertcity
JWT_SECRET=hello_AlertCity
```

Make sure to replace `alertcity` with the actual password for your local mongoDB instance.

### Start Developing Work

