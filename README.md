# Club Management Web Application (Club_WebApp_Pristini)

This is a full-stack web application designed to manage university clubs, members, events, and announcements. The application features a modern, professional, and well-structured user interface built with React and Tailwind CSS, connected to a robust Node.js/Express backend.

## Key Features

*   **User Authentication:** Secure login and registration for members.
*   **Club Management:** Create, view, edit, and join/leave clubs.
*   **Event Scheduling:** Create, view, register for, and check-in to club events.
*   **Member Directory:** View a list of all members and their roles.
*   **Modern UI:** Clean, professional, and responsive design using **Tailwind CSS** and **Lucide React** icons.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You will need the following software installed on your machine:

*   [Node.js](https://nodejs.org/) (version 18 or higher)
*   [npm](https://www.npmjs.com/) (comes with Node.js)
*   [MongoDB](https://www.mongodb.com/) (local installation or a cloud service like MongoDB Atlas)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/ChouaiebAmine/Club_WebApp_Pristini.git
    cd Club_WebApp_Pristini
    ```

2.  **Setup the Server (Backend):**
    ```bash
    cd server
    npm install
    ```
    Create a `.env` file in the `server` directory and add your MongoDB connection string and a JWT secret:
    ```
    MONGO_URI="mongodb+srv://<username>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority"
    JWT_SECRET="your_very_secret_key"
    PORT=5000
    ```
    Start the server:
    ```bash
    npm start
    ```

3.  **Setup the Client (Frontend):**
    ```bash
    cd ../client
    npm install
    ```
    Start the client application:
    ```bash
    npm run dev
    ```

The application should now be running at `http://localhost:3000`.

## Database Management (MongoDB)

The application uses Mongoose as an ODM (Object Data Modeling) layer on top of MongoDB. Below is a summary of the core Mongoose/MongoDB operations used in the application's backend and their purpose.

### Application-Level MongoDB Operations

| Mongoose Method | Purpose in Application | Example Use Case |
| :--- | :--- | :--- |
| `User.create()` | Creates a new user document. | Used during user registration. |
| `User.findOne()` | Finds a single user document by a specific field (e.g., email). | Used during user login to verify credentials. |
| `User.findById()` | Finds a user document by its unique ID. | Used to fetch the current authenticated user's details. |
| `Club.create()` | Creates a new club document. | Used when an administrator adds a new club. |
| `Club.find()` | Retrieves a list of all clubs. | Used on the main `/clubs` page. |
| `Club.findById()` | Retrieves a single club document. | Used on the `/clubs/:id` detail page. |
| `Club.findByIdAndUpdate()` | Updates a club document by ID. | Used when an administrator edits club details. |
| `Club.findByIdAndDelete()` | Deletes a club document by ID. | Used when an administrator removes a club. |
| `Club.populate()` | Replaces specified paths in the document with document(s) from other collections. | Used to embed user details (name, email) into the club's members list. |
| `club.save()` | Saves changes to an existing club document. | Used to add or remove members from a club's member array. |
| `Event.create()` | Creates a new event document. | Used when a club administrator schedules a new event. |
| `Event.find()` | Retrieves a list of events, often filtered by club ID. | Used on the `/events` page and the club detail page. |
| `Event.findById()` | Retrieves a single event document. | Used on the `/events/:id` detail page. |
| `event.save()` | Saves changes to an existing event document. | Used to register users for an event or check them in. |

### MongoDB Shell Commands for Development

The following commands are useful for direct interaction with your database using the MongoDB Shell (`mongosh`) for debugging and data management.

| Command | Description | Example |
| :--- | :--- | :--- |
| **Connect** | Connect to your local or remote MongoDB instance. | `mongosh "mongodb://localhost:27017/clubdb"` |
| **Show Databases** | List all databases on the server. | `show dbs` |
| **Use Database** | Switch to a specific database. | `use clubdb` |
| **Show Collections** | List all collections in the current database. | `show collections` |
| **Find All** | Retrieve all documents from a collection. | `db.clubs.find()` |
| **Find with Filter** | Retrieve documents matching a specific criteria. | `db.users.find({ email: "farah@example.com" })` |
| **Insert One** | Add a single document to a collection. | `db.events.insertOne({ title: "Hackathon", date: new Date() })` |
| **Update One** | Update a single document. | `db.clubs.updateOne({ name: "Chess Club" }, { $set: { category: "Academic" } })` |
| **Delete Many** | Delete all documents matching a criteria. | `db.announcements.deleteMany({ is_expired: true })` |

##  Git Workflow

The application uses MongoDB for data persistence. Here are some essential commands you can use in the MongoDB Shell (`mongosh`) for development and debugging.

| Command | Description | Example |
| :--- | :--- | :--- |
| **Connect** | Connect to your local or remote MongoDB instance. | `mongosh "mongodb://localhost:27017/clubdb"` |
| **Show Databases** | List all databases on the server. | `show dbs` |
| **Use Database** | Switch to a specific database. | `use clubdb` |
| **Show Collections** | List all collections in the current database. | `show collections` |
| **Find All** | Retrieve all documents from a collection. | `db.clubs.find()` |
| **Find with Filter** | Retrieve documents matching a specific criteria. | `db.users.find({ email: "farah@example.com" })` |
| **Insert One** | Add a single document to a collection. | `db.events.insertOne({ title: "Hackathon", date: new Date() })` |
| **Update One** | Update a single document. | `db.clubs.updateOne({ name: "Chess Club" }, { $set: { category: "Academic" } })` |
| **Delete Many** | Delete all documents matching a criteria. | `db.announcements.deleteMany({ is_expired: true })` |

## git Workflow (if you want to add something)

To contribute to the project and manage your changes effectively, follow these standard Git practices.

### 1. Branching

Always create a new branch for any feature, bug fix, or enhancement.

```bash
# Create a new branch and switch to it
git checkout -b feature/new-dashboard-ui
```

### 2. Making Changes

Work on your code, and commit your changes frequently with clear, descriptive messages.

```bash
# Stage your changes
git add .

# Commit your changes
git commit -m "feat: implement modern dashboard layout with Tailwind CSS"
```

### 3. Pushing Changes

Push your local branch to the remote repository.

```bash
# Push your branch to GitHub
git push origin feature/new-dashboard-ui
```

### 4. Pulling Updates

Before starting work or merging, always pull the latest changes from the main branch to ensure your local branch is up-to-date.

```bash
# Switch to the main branch
git checkout main

# Pull the latest changes
git pull origin main

# Switch back to your feature branch
git checkout feature/new-dashboard-ui

# Merge the latest main changes into your feature branch
git merge main
```

### 5. Creating a Pull Request (PR)

Once your feature is complete and tested, push your final changes and create a Pull Request on GitHub to merge your feature branch into the `main` branch.


