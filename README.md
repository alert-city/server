# AlertCity Server

AlertCity Server is a GraphQL-based server-side application that interacts with a MongoDB database. This project is set up using Nest.js and can be utilized as a starting point for building robust backend services.

## Environment setup

Before you begin, make sure you have Node.js`v20.10.0` and Yarn package manager installed on your machine. You will also need mongoDB installed and running locally.

Follow these steps to set up your environment:

### SSH tunnel Setup

1. Install homebrew if you don't have it installed on your machine. You can install it by running the following command in your terminal:
```sh
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
````
2. Install autossh by running the following command in your terminal:
```sh
brew install autossh
````

3. Save private key file into your local machine.
4. Set up permissions for the private key file by running the following command in your terminal:
```sh
chmod 600 /path/to/private-key-file
````
5. Create a new file in your home directory called `config` and add the following content:
```sh
autossh -M 0 -f -N -L 5003:localhost:27017  -i "/path/to/private-key-file" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ubuntu@ec2-13-239-162-77.ap-southeast-2.compute.amazonaws.com
```
6. Run the following command in your terminal to confirm the SSH tunnel is working:
```sh
lsof -i :5003
```


### Application Setup

1. Clone this repository to your local machine.
2. Navigate to the project root directory in your terminal.
3. Run `yarn` or `yarn install` to install all the necessary dependencies.
4. Create a `.env.development` file in the root directory and add the following environment variables:

```sh
PORT=51004
DB_CONNECTION_STRING=mongodb://alertcity:alertcity@localhost:5003/alertcity?authSource=admin
NODE_ENV=development
JWT_SECRET=my_super_secret_key_12345_alertcity
```


### Start Developing Work
1. Run `yarn run start:dev` to start the server in development mode.
2. Open your browser and navigate to `http://localhost:51004/graphql` to access the GraphQL playground.
3. You can now start writing queries and mutations to interact with the server.