# Student Management System (SMS)

This is a web-based Student Management System built with Django and JavaScript. It allows for managing students, subjects, enrollments, and grades.

## Technology Stack

*   **Backend:** Django (Python)
*   **Frontend:** HTML, CSS, JavaScript (Vanilla JS)
*   **Database:** SQLite (default, configurable in Django settings)

## Key Features

*   **Student Management:** Add, view, edit, and delete student records.
*   **Subject Management:** Add, view, edit, and delete subjects.
*   **Enrollment Management:** Enroll students in subjects and unenroll them.
*   **Grade Management:** Add, view, edit, and delete grades for students in specific subjects.
*   **Dynamic UI:** Frontend updates dynamically based on backend operations.
*   **Responsive Design:** Basic responsiveness for different screen sizes.

## Setup and Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/zeckroq/sms_Gillo.git
    cd sms_Gillo
    ```

2.  **Create and activate a virtual environment:**
    *   On Windows:
        ```bash
        python -m venv venv
        .\venv\Scripts\activate
        ```
    *   On macOS/Linux:
        ```bash
        python3 -m venv venv
        source venv/bin/activate
        ```

3.  **Install dependencies:**
    Make sure you have a `requirements.txt` file. If not, you might need to create one based on your project's dependencies (e.g., `pip freeze > requirements.txt`).
    ```bash
    pip install -r requirements.txt
    ```
    (Note: Based on previous interactions, `requirements.txt` should exist and include Django.)

4.  **Apply database migrations:**
    ```bash
    python manage.py migrate
    ```

5.  **Run the development server:**
    ```bash
    python manage.py runserver
    ```
    The application will typically be available at `http://127.0.0.1:8000/`.

## Project Structure

*   `manage.py`: Django's command-line utility.
*   `sms_project/`: The main Django project directory.
    *   `settings.py`: Django project settings.
    *   `urls.py`: Project-level URL configurations.
*   `students/`: The Django app handling student, subject, enrollment, and grade logic.
    *   `models.py`: Database models.
    *   `views.py`: API views (likely using Django REST framework or custom views).
    *   `serializers.py`: Data serializers for API views.
    *   `urls.py`: App-level URL configurations.
    *   `admin.py`: Django admin configurations.
*   `static/`:
    *   `css/style.css`: Custom stylesheets.
    *   `js/app.js`: Frontend JavaScript logic.
*   `templates/`:
    *   `index.html`: Main HTML file for the single-page application.
*   `venv/`: Virtual environment directory (if created as per instructions).
*   `.gitignore`: Specifies intentionally untracked files that Git should ignore.
*   `requirements.txt`: Lists project dependencies.
*   `README.md`: This file.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue.
