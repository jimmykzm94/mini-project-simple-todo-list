# Mini project - Simple Todo list

## Description
This is a simple todo list web application where users can add, update, and delete tasks.  
It also visualizes task completion progress using a chart.

### Features
1. **Plain HTML & JavaScript** – no frameworks needed.
2. **Chart.js** – displays the percentage of completed and pending tasks.
3. **RxJS** – used for reactive state management and event handling.
4. **FastAPI** – lightweight backend server with REST APIs.
5. **Pydantic** – used for data validation and serialization in FastAPI.
6. **SQLite3** – simple, file-based database to persist tasks.

## Prerequisite
Install Python packages
```sh
pip install "fastapi[all]" uvicorn
```

## Demo
1. Start the backend server: `uvicorn main:app --reload`.
    - **uvicorn**: Runs the ASGI server (Uvicorn).
    - **main**: Refers to the Python file main.py (without the .py extension).
    - **app**: Refers to the FastAPI app instance inside main.py
    - **--reload**: Enables auto-reload so the server restarts whenever you make changes to your code (useful for development).
2. Open **index.html** in your browser to launch the frontend.

## Keywords
![HTML](https://img.shields.io/badge/-HTML-orange)
![JavaScript](https://img.shields.io/badge/-JavaScript-yellow)
![RxJS](https://img.shields.io/badge/-RxJS-blueviolet)
![Chart.js](https://img.shields.io/badge/-Chart.js-red)
![FastAPI](https://img.shields.io/badge/-FastAPI-009688)
![SQLite3](https://img.shields.io/badge/-SQLite3-003B57)
