# Tech Event Website

This project is a simple, single-page website for a one-day technical conference. It displays a schedule of talks and allows users to filter them by category.

## Project Structure

-   `server.js`: The main Node.js server file. It serves the static frontend files and provides the schedule API.
-   `data/talks.json`: A JSON file containing the data for all the talks.
-   `public/`: This directory contains all the frontend assets.
    -   `index.html`: The main HTML file for the website.
    -   `style.css`: The stylesheet for the website.
    -   `script.js`: The JavaScript file that fetches the schedule, renders it on the page, and handles the filtering logic.
-   `.gitignore`: Specifies which files and directories to ignore in version control.
-   `package.json`: Defines the project metadata and scripts.

## Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/) (v12 or higher)

### Installation & Running

1.  **Clone the repository (if you haven't already):**
    ```bash
    git clone https://github.com/gauravz7/testgcli-event-talks-app.git
    cd testgcli-event-talks-app
    ```

2.  **Start the server:**
    ```bash
    node server.js
    ```

3.  **View the website:**
    Open your web browser and navigate to [http://localhost:3001](http://localhost:3001).

## API Endpoint

The server exposes a single API endpoint to get the event schedule.

-   **URL:** `/api/schedule`
-   **Method:** `GET`
-   **Response:** A JSON array of schedule items (talks, breaks, and lunch). Each item includes a `type`, `title`, `startTime`, and `endTime`. Talk items include additional details like `speakers`, `category`, and `description`.

You can test this endpoint by visiting [http://localhost:3001/api/schedule](http://localhost:3001/api/schedule) in your browser.
