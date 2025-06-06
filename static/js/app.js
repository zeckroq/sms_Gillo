class StudentManagementSystem {
  constructor() {
    this.baseURL = "/api"
    this.currentSection = "students"
    this.students = []
    this.subjects = []
    this.enrollments = []
    this.grades = []

    this.init()
  }

  init() {
    this.setupEventListeners()
    this.loadStudents()
    this.loadSubjects()
  }

  setupEventListeners() {
    // Navigation
    document.getElementById("studentsTab").addEventListener("click", () => this.showSection("students"))
    document.getElementById("subjectsTab").addEventListener("click", () => this.showSection("subjects"))
    document.getElementById("gradesTab").addEventListener("click", () => this.showSection("grades"))

    // Add buttons
    document.getElementById("addStudentBtn").addEventListener("click", () => this.showStudentForm())
    document.getElementById("addSubjectBtn").addEventListener("click", () => this.showSubjectForm())
    document.getElementById("addGradeBtn").addEventListener("click", () => this.showGradeForm())

    // Modal
    document.querySelector(".close").addEventListener("click", () => this.closeModal())
    document.getElementById("modal").addEventListener("click", (e) => {
      if (e.target === document.getElementById("modal")) {
        this.closeModal()
      }
    })

    // Grade filters
    document.getElementById("studentFilter").addEventListener("change", () => this.loadGradesForStudent())
    document.getElementById("subjectFilter").addEventListener("change", () => this.loadGradesForStudent())
  }

  showSection(section) {
    // Update navigation
    document.querySelectorAll(".nav-btn").forEach((btn) => btn.classList.remove("active"))
    document.getElementById(`${section}Tab`).classList.add("active")

    // Update sections
    document.querySelectorAll(".section").forEach((sec) => sec.classList.remove("active"))
    document.getElementById(`${section}Section`).classList.add("active")

    this.currentSection = section

    // Load data for the section
    if (section === "students") {
      this.loadStudents()
    } else if (section === "subjects") {
      this.loadSubjects()
    } else if (section === "grades") {
      this.loadGradeFilters()
    }
  }

  async apiCall(endpoint, method = "GET", data = null) {
    try {
      const config = {
        method,
        headers: {
          "Content-Type": "application/json",
        },
      }

      if (data) {
        config.body = JSON.stringify(data)
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, config)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("API call failed:", error)
      this.showError("An error occurred while communicating with the server.")
      throw error
    }
  }

  async loadStudents() {
    try {
      this.students = await this.apiCall("/students/")
      this.renderStudentsTable()
    } catch (error) {
      console.error("Failed to load students:", error)
    }
  }

  async loadSubjects() {
    try {
      this.subjects = await this.apiCall("/subjects/")
      this.renderSubjectsTable()
    } catch (error) {
      console.error("Failed to load subjects:", error)
    }
  }

  renderStudentsTable() {
    const tbody = document.querySelector("#studentsTable tbody")
    tbody.innerHTML = ""

    this.students.forEach((student) => {
      const row = document.createElement("tr")
      row.innerHTML = `
                <td>${student.student_id}</td>
                <td>${student.full_name}</td>
                <td>${student.email}</td>
                <td>${student.phone || "N/A"}</td>
                <td>${new Date(student.enrollment_date).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-secondary btn-small" onclick="sms.editStudent(${student.id})">Edit</button>
                    <button class="btn btn-danger btn-small" onclick="sms.deleteStudent(${student.id})">Delete</button>
                    <button class="btn btn-primary btn-small" onclick="sms.viewStudentDetails(${student.id})">Details</button>
                </td>
            `
      tbody.appendChild(row)
    })
  }

  renderSubjectsTable() {
    const tbody = document.querySelector("#subjectsTable tbody")
    tbody.innerHTML = ""

    this.subjects.forEach((subject) => {
      const row = document.createElement("tr")
      row.innerHTML = `
                <td>${subject.code}</td>
                <td>${subject.name}</td>
                <td>${subject.credits}</td>
                <td>${subject.description || "N/A"}</td>
                <td>
                    <button class="btn btn-secondary btn-small" onclick="sms.editSubject(${subject.id})">Edit</button>
                    <button class="btn btn-danger btn-small" onclick="sms.deleteSubject(${subject.id})">Delete</button>
                </td>
            `
      tbody.appendChild(row)
    })
  }

  showStudentForm(student = null) {
    const isEdit = student !== null
    const modalBody = document.getElementById("modalBody")

    modalBody.innerHTML = `
            <h3>${isEdit ? "Edit Student" : "Add New Student"}</h3>
            <form id="studentForm">
                <div class="form-group">
                    <label for="student_id">Student ID:</label>
                    <input type="text" id="student_id" name="student_id" required value="${student?.student_id || ""}">
                </div>
                <div class="form-group">
                    <label for="first_name">First Name:</label>
                    <input type="text" id="first_name" name="first_name" required value="${student?.first_name || ""}">
                </div>
                <div class="form-group">
                    <label for="last_name">Last Name:</label>
                    <input type="text" id="last_name" name="last_name" required value="${student?.last_name || ""}">
                </div>
                <div class="form-group">
                    <label for="email">Email:</label>
                    <input type="email" id="email" name="email" required value="${student?.email || ""}">
                </div>
                <div class="form-group">
                    <label for="phone">Phone:</label>
                    <input type="tel" id="phone" name="phone" value="${student?.phone || ""}">
                </div>
                <div class="form-group">
                    <label for="date_of_birth">Date of Birth:</label>
                    <input type="date" id="date_of_birth" name="date_of_birth" required value="${student?.date_of_birth || ""}">
                </div>
                <div class="form-group">
                    <label for="address">Address:</label>
                    <textarea id="address" name="address">${student?.address || ""}</textarea>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="sms.closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">${isEdit ? "Update" : "Add"} Student</button>
                </div>
            </form>
        `

    document.getElementById("studentForm").addEventListener("submit", (e) => {
      e.preventDefault()
      this.saveStudent(student?.id)
    })

    this.showModal()
  }

  showSubjectForm(subject = null) {
    const isEdit = subject !== null
    const modalBody = document.getElementById("modalBody")

    modalBody.innerHTML = `
            <h3>${isEdit ? "Edit Subject" : "Add New Subject"}</h3>
            <form id="subjectForm">
                <div class="form-group">
                    <label for="code">Subject Code:</label>
                    <input type="text" id="code" name="code" required value="${subject?.code || ""}">
                </div>
                <div class="form-group">
                    <label for="name">Subject Name:</label>
                    <input type="text" id="name" name="name" required value="${subject?.name || ""}">
                </div>
                <div class="form-group">
                    <label for="credits">Credits:</label>
                    <input type="number" id="credits" name="credits" min="1" max="6" required value="${subject?.credits || ""}">
                </div>
                <div class="form-group">
                    <label for="description">Description:</label>
                    <textarea id="description" name="description">${subject?.description || ""}</textarea>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="sms.closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">${isEdit ? "Update" : "Add"} Subject</button>
                </div>
            </form>
        `

    document.getElementById("subjectForm").addEventListener("submit", (e) => {
      e.preventDefault()
      this.saveSubject(subject?.id)
    })

    this.showModal()
  }

  async saveStudent(studentId = null) {
    const form = document.getElementById("studentForm")
    const formData = new FormData(form)
    const data = Object.fromEntries(formData.entries())

    try {
      if (studentId) {
        await this.apiCall(`/students/${studentId}/`, "PUT", data)
        this.showSuccess("Student updated successfully!")
      } else {
        await this.apiCall("/students/", "POST", data)
        this.showSuccess("Student added successfully!")
      }

      this.closeModal()
      this.loadStudents()
    } catch (error) {
      console.error("Failed to save student:", error)
    }
  }

  async saveSubject(subjectId = null) {
    const form = document.getElementById("subjectForm")
    const formData = new FormData(form)
    const data = Object.fromEntries(formData.entries())

    try {
      if (subjectId) {
        await this.apiCall(`/subjects/${subjectId}/`, "PUT", data)
        this.showSuccess("Subject updated successfully!")
      } else {
        await this.apiCall("/subjects/", "POST", data)
        this.showSuccess("Subject added successfully!")
      }

      this.closeModal()
      this.loadSubjects()
    } catch (error) {
      console.error("Failed to save subject:", error)
    }
  }

  async editStudent(id) {
    try {
      const student = await this.apiCall(`/students/${id}/`)
      this.showStudentForm(student)
    } catch (error) {
      console.error("Failed to load student for editing:", error)
    }
  }

  async editSubject(id) {
    try {
      const subject = await this.apiCall(`/subjects/${id}/`)
      this.showSubjectForm(subject)
    } catch (error) {
      console.error("Failed to load subject for editing:", error)
    }
  }

  async deleteStudent(id) {
    if (confirm("Are you sure you want to delete this student?")) {
      try {
        await this.apiCall(`/students/${id}/`, "DELETE")
        this.showSuccess("Student deleted successfully!")
        this.loadStudents()
      } catch (error) {
        console.error("Failed to delete student:", error)
      }
    }
  }

  async deleteSubject(id) {
    if (confirm("Are you sure you want to delete this subject?")) {
      try {
        await this.apiCall(`/subjects/${id}/`, "DELETE")
        this.showSuccess("Subject deleted successfully!")
        this.loadSubjects()
      } catch (error) {
        console.error("Failed to delete subject:", error)
      }
    }
  }

  async viewStudentDetails(id) {
    try {
      const student = await this.apiCall(`/students/${id}/`)
      const modalBody = document.getElementById("modalBody")

      modalBody.innerHTML = `
                <h3>Student Details: ${student.full_name}</h3>
                <div class="student-details">
                    <p><strong>Student ID:</strong> ${student.student_id}</p>
                    <p><strong>Email:</strong> ${student.email}</p>
                    <p><strong>Phone:</strong> ${student.phone || "N/A"}</p>
                    <p><strong>Date of Birth:</strong> ${new Date(student.date_of_birth).toLocaleDateString()}</p>
                    <p><strong>Address:</strong> ${student.address || "N/A"}</p>
                    <p><strong>Enrollment Date:</strong> ${new Date(student.enrollment_date).toLocaleDateString()}</p>
                    
                    <h4>Enrolled Subjects:</h4>
                    <div id="studentSubjects">Loading...</div>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="sms.closeModal()">Close</button>
                </div>
            `

      this.showModal()
      this.loadStudentSubjects(id)
    } catch (error) {
      console.error("Failed to load student details:", error)
    }
  }

  async loadStudentSubjects(studentId) {
    try {
      const enrollments = await this.apiCall(`/enrollments/?student_id=${studentId}`)
      const subjectsDiv = document.getElementById("studentSubjects")

      if (enrollments.length === 0) {
        subjectsDiv.innerHTML = "<p>No subjects enrolled.</p>"
        return
      }

      let html = "<ul>"
      enrollments.forEach((enrollment) => {
        html += `<li>${enrollment.subject_code} - ${enrollment.subject_name}</li>`
      })
      html += "</ul>"

      subjectsDiv.innerHTML = html
    } catch (error) {
      console.error("Failed to load student subjects:", error)
      document.getElementById("studentSubjects").innerHTML = "<p>Error loading subjects.</p>"
    }
  }

  async loadGradeFilters() {
    const studentFilter = document.getElementById("studentFilter")
    const subjectFilter = document.getElementById("subjectFilter")

    // Clear existing options
    studentFilter.innerHTML = '<option value="">Select Student</option>'
    subjectFilter.innerHTML = '<option value="">Select Subject</option>'

    // Load students
    this.students.forEach((student) => {
      const option = document.createElement("option")
      option.value = student.id
      option.textContent = `${student.student_id} - ${student.full_name}`
      studentFilter.appendChild(option)
    })

    // Load subjects
    this.subjects.forEach((subject) => {
      const option = document.createElement("option")
      option.value = subject.id
      option.textContent = `${subject.code} - ${subject.name}`
      subjectFilter.appendChild(option)
    })
  }

  async loadGradesForStudent() {
    const studentId = document.getElementById("studentFilter").value
    const subjectId = document.getElementById("subjectFilter").value
    const gradesContent = document.getElementById("gradesContent")

    if (!studentId || !subjectId) {
      gradesContent.innerHTML = "<p>Select both student and subject to view grades</p>"
      return
    }

    try {
      // Find enrollment
      const enrollments = await this.apiCall(`/enrollments/?student_id=${studentId}`)
      const enrollment = enrollments.find((e) => e.subject == subjectId)

      if (!enrollment) {
        gradesContent.innerHTML = "<p>Student is not enrolled in this subject.</p>"
        return
      }

      // Load grades for this enrollment
      const grades = await this.apiCall(`/grades/?enrollment_id=${enrollment.id}`)
      this.renderGrades(grades, enrollment)
    } catch (error) {
      console.error("Failed to load grades:", error)
      gradesContent.innerHTML = "<p>Error loading grades.</p>"
    }
  }

  renderGrades(grades, enrollment) {
    const gradesContent = document.getElementById("gradesContent")

    const activities = grades.filter((g) => g.grade_type === "activity")
    const quizzes = grades.filter((g) => g.grade_type === "quiz")
    const exams = grades.filter((g) => g.grade_type === "exam")

    const html = `
            <h3>Grades for ${enrollment.student_name} - ${enrollment.subject_code}</h3>
            
            <div class="grade-type-section">
                <h4>Activities (${activities.length})</h4>
                ${this.renderGradeType(activities, "activity")}
            </div>
            
            <div class="grade-type-section">
                <h4>Quizzes (${quizzes.length})</h4>
                ${this.renderGradeType(quizzes, "quiz")}
            </div>
            
            <div class="grade-type-section">
                <h4>Exams (${exams.length})</h4>
                ${this.renderGradeType(exams, "exam")}
            </div>
        `

    gradesContent.innerHTML = html
  }

  renderGradeType(grades, type) {
    if (grades.length === 0) {
      return "<p>No grades recorded yet.</p>"
    }

    let html = ""
    grades.forEach((grade) => {
      const scoreClass = grade.percentage >= 80 ? "excellent" : grade.percentage >= 60 ? "good" : "poor"
      html += `
                <div class="grade-item">
                    <div class="grade-header">
                        <span class="grade-title">${grade.title}</span>
                        <span class="grade-score ${scoreClass}">${grade.score}/${grade.max_score} (${grade.percentage.toFixed(1)}%)</span>
                    </div>
                    <div class="grade-details">
                        <p>Letter Grade: ${grade.letter_grade}</p>
                        <p>Date: ${new Date(grade.date_recorded).toLocaleDateString()}</p>
                        ${grade.notes ? `<p>Notes: ${grade.notes}</p>` : ""}
                        <button class="btn btn-secondary btn-small" onclick="sms.editGrade(${grade.id})">Edit</button>
                        <button class="btn btn-danger btn-small" onclick="sms.deleteGrade(${grade.id})">Delete</button>
                    </div>
                </div>
            `
    })

    return html
  }

  async showGradeForm(grade = null) {
    const isEdit = grade !== null
    const modalBody = document.getElementById("modalBody")

    // Load enrollments for dropdown
    let enrollmentOptions = ""
    try {
      const enrollments = await this.apiCall("/enrollments/")
      enrollmentOptions = enrollments
        .map(
          (e) =>
            `<option value="${e.id}" ${grade?.enrollment === e.id ? "selected" : ""}>
                    ${e.student_name} - ${e.subject_code}
                </option>`,
        )
        .join("")
    } catch (error) {
      console.error("Failed to load enrollments:", error)
    }

    modalBody.innerHTML = `
            <h3>${isEdit ? "Edit Grade" : "Add New Grade"}</h3>
            <form id="gradeForm">
                <div class="form-group">
                    <label for="enrollment">Student - Subject:</label>
                    <select id="enrollment" name="enrollment" required>
                        <option value="">Select Enrollment</option>
                        ${enrollmentOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label for="grade_type">Grade Type:</label>
                    <select id="grade_type" name="grade_type" required>
                        <option value="">Select Type</option>
                        <option value="activity" ${grade?.grade_type === "activity" ? "selected" : ""}>Activity</option>
                        <option value="quiz" ${grade?.grade_type === "quiz" ? "selected" : ""}>Quiz</option>
                        <option value="exam" ${grade?.grade_type === "exam" ? "selected" : ""}>Exam</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="title">Title:</label>
                    <input type="text" id="title" name="title" required value="${grade?.title || ""}">
                </div>
                <div class="form-group">
                    <label for="score">Score:</label>
                    <input type="number" id="score" name="score" step="0.01" min="0" required value="${grade?.score || ""}">
                </div>
                <div class="form-group">
                    <label for="max_score">Max Score:</label>
                    <input type="number" id="max_score" name="max_score" step="0.01" min="1" required value="${grade?.max_score || "100"}">
                </div>
                <div class="form-group">
                    <label for="notes">Notes:</label>
                    <textarea id="notes" name="notes">${grade?.notes || ""}</textarea>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="sms.closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">${isEdit ? "Update" : "Add"} Grade</button>
                </div>
            </form>
        `

    document.getElementById("gradeForm").addEventListener("submit", (e) => {
      e.preventDefault()
      this.saveGrade(grade?.id)
    })

    this.showModal()
  }

  async saveGrade(gradeId = null) {
    const form = document.getElementById("gradeForm")
    const formData = new FormData(form)
    const data = Object.fromEntries(formData.entries())

    try {
      if (gradeId) {
        await this.apiCall(`/grades/${gradeId}/`, "PUT", data)
        this.showSuccess("Grade updated successfully!")
      } else {
        await this.apiCall("/grades/", "POST", data)
        this.showSuccess("Grade added successfully!")
      }

      this.closeModal()
      this.loadGradesForStudent()
    } catch (error) {
      console.error("Failed to save grade:", error)
    }
  }

  async editGrade(id) {
    try {
      const grade = await this.apiCall(`/grades/${id}/`)
      this.showGradeForm(grade)
    } catch (error) {
      console.error("Failed to load grade for editing:", error)
    }
  }

  async deleteGrade(id) {
    if (confirm("Are you sure you want to delete this grade?")) {
      try {
        await this.apiCall(`/grades/${id}/`, "DELETE")
        this.showSuccess("Grade deleted successfully!")
        this.loadGradesForStudent()
      } catch (error) {
        console.error("Failed to delete grade:", error)
      }
    }
  }

  showModal() {
    document.getElementById("modal").style.display = "block"
  }

  closeModal() {
    document.getElementById("modal").style.display = "none"
  }

  showError(message) {
    // You can implement a toast notification system here
    alert("Error: " + message)
  }

  showSuccess(message) {
    // You can implement a toast notification system here
    alert("Success: " + message)
  }
}

// Initialize the application
const sms = new StudentManagementSystem()
