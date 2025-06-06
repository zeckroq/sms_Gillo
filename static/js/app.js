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

    // Back to students button in details view
    const backToStudentsBtn = document.getElementById("backToStudentsBtn");
    if (backToStudentsBtn) {
      backToStudentsBtn.addEventListener("click", () => {
        const studentDetailsSec = document.getElementById("studentDetailsSection");
        if (studentDetailsSec) {
          studentDetailsSec.classList.remove("active");
        }
        this.showSection("students");
      });
    }
  }

  showSection(sectionId) {
    // Update navigation tabs
    document.querySelectorAll(".nav-btn").forEach((btn) => btn.classList.remove("active"));
    const activeTab = document.getElementById(`${sectionId}Tab`);
    if (activeTab) {
      activeTab.classList.add("active");
    }

    // Hide all sections first, including studentDetailsSection
    document.querySelectorAll(".section").forEach((sec) => sec.classList.remove("active"));
    
    // Show the target section
    const targetSection = document.getElementById(`${sectionId}Section`);
    if (targetSection) {
      targetSection.classList.add("active");
    }

    this.currentSection = sectionId;

    // Load data for the section
    if (sectionId === "students") {
      this.loadStudents();
    } else if (sectionId === "subjects") {
      this.loadSubjects();
    } else if (sectionId === "grades") {
      this.loadGradeFilters();
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

      if (response.status === 204) {
        return null; // Or return {}; if you prefer an empty object
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
    const modalContent = document.getElementById("modalContent")

    modalContent.innerHTML = `
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
    const modalContent = document.getElementById("modalContent")

    modalContent.innerHTML = `
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
      const student = await this.apiCall(`/students/${id}/`); // StudentDetailSerializer should include enrollments
      const studentDetailsContent = document.getElementById("studentDetailsContent");

      const studentDetailsSection = document.getElementById("studentDetailsSection");

    if (!studentDetailsContent || !studentDetailsSection) { 
      console.error("studentDetailsContent or studentDetailsSection element not found in the HTML.");
      this.showError("UI element missing for student details.");
      this.showSection("students"); 
      return;
    }

    // Hide other main sections and show studentDetailsSection
    document.querySelectorAll('.section').forEach(sec => {
      if (sec.id !== 'studentDetailsSection') {
        sec.classList.remove('active');
      }
    });
    studentDetailsSection.classList.add('active');
    // Optional: Clear active state from main navigation tabs or set 'Students' as active
    document.querySelectorAll(".nav-btn").forEach((btn) => btn.classList.remove("active"));
    // document.getElementById('studentsTab').classList.add('active'); // Or leave no main tab active

    studentDetailsContent.innerHTML = `
      <div class="details-header">
        <h2>${student.full_name}</h2>
      </div>

      <div class="details-section-card student-info-card">
        <h3>Personal Information</h3>
        <p><strong>Student ID:</strong> ${student.student_id}</p>
        <p><strong>Email:</strong> ${student.email}</p>
        <p><strong>Phone:</strong> ${student.phone || 'N/A'}</p>
        <p><strong>Date of Birth:</strong> ${new Date(student.date_of_birth).toLocaleDateString()}</p>
        <p><strong>Address:</strong> ${student.address || 'N/A'}</p>
        <p><strong>Enrolled Since:</strong> ${new Date(student.enrollment_date).toLocaleDateString()}</p>
      </div>

      <div class="details-section-card enrolled-subjects-card">
        <h3>Enrolled Subjects</h3>
        <div id="studentEnrolledSubjectsList" class="details-list-container">Loading...</div>
      </div>

      <div class="details-section-card available-subjects-card">
        <h3>Enroll in New Subject</h3>
        <div id="studentAvailableSubjectsList" class="details-list-container">Loading...</div>
      </div>
    `;

      this.renderStudentEnrolledSubjects(student.enrollments || [], 'studentEnrolledSubjectsList', id);
      
      // Ensure all subjects are loaded before trying to render available ones
      if (!this.subjects || this.subjects.length === 0) {
        await this.loadSubjects(); 
      }
      this.renderStudentAvailableSubjects(student, 'studentAvailableSubjectsList');

      // This line might be important if viewStudentDetails is intended to be its own "section"
      // If studentDetailsContent is part of the 'students' section, this might not be strictly necessary
      // or could be handled by ensuring 'students' section is active.
      // For now, we assume the student details are shown within the currently active student list/details area.
      // If you have a separate HTML section for "studentDetails", uncomment the next line:
      // this.showSection("studentDetails"); // Or an appropriate section name

    } catch (error) {
      console.error(`Failed to load student details for student ${id}:`, error);
      this.showError("Failed to load student details. The student might not exist or there was a server error.");
      // Ensure the UI doesn't stay stuck on a broken details page
      const studentDetailsContent = document.getElementById("studentDetailsContent");
      if (studentDetailsContent) {
          studentDetailsContent.innerHTML = "<p>Error loading student details.</p>";
      }
    }
  }

  renderStudentEnrolledSubjects(enrollments, targetElementId, studentId) {
    const listElement = document.getElementById(targetElementId);
    if (!listElement) {
      console.error(`Element with ID ${targetElementId} not found for enrolled subjects.`);
      return;
    }
    listElement.innerHTML = ""; // Clear previous content

    if (!enrollments || enrollments.length === 0) {
      listElement.innerHTML = "<p>Not currently enrolled in any subjects.</p>";
      return;
    }

    const ul = document.createElement('ul');
    ul.className = 'details-list';
    enrollments.forEach(enrollment => {
      const li = document.createElement('li');
      
      const textSpan = document.createElement('span');
      textSpan.textContent = `${enrollment.subject_code} - ${enrollment.subject_name} (Enrolled: ${new Date(enrollment.enrollment_date).toLocaleDateString()}) `;
      li.appendChild(textSpan);

      const unenrollButton = document.createElement('button');
      unenrollButton.className = 'btn btn-danger btn-small btn-inline';
      unenrollButton.textContent = 'Unenroll';
      unenrollButton.onclick = () => this.handleUnenrollStudent(enrollment.id, studentId);
      li.appendChild(unenrollButton);
      
      ul.appendChild(li);
    });
    listElement.appendChild(ul);
  }

  renderStudentAvailableSubjects(student, targetElementId) {
    const listElement = document.getElementById(targetElementId);
    if (!listElement) {
      console.error(`Element with ID ${targetElementId} not found for available subjects.`);
      return;
    }
    listElement.innerHTML = ""; // Clear previous content

    const enrolledSubjectIds = (student.enrollments || []).map(enr => enr.subject);
    const availableSubjects = this.subjects.filter(sub => !enrolledSubjectIds.includes(sub.id) && sub.is_active);

    if (availableSubjects.length === 0) {
      listElement.innerHTML = "<p>No new subjects available for enrollment or already enrolled in all active subjects.</p>";
      return;
    }

    const ul = document.createElement('ul');
    ul.className = 'details-list';
    availableSubjects.forEach(subject => {
      const li = document.createElement('li');
      li.innerHTML = `
        <span>${subject.code} - ${subject.name}</span>
        <button class="btn btn-success btn-small" onclick="sms.handleEnrollStudent(${student.id}, ${subject.id})">Enroll</button>
      `;
      ul.appendChild(li);
    });
    listElement.appendChild(ul);
  }

  async handleEnrollStudent(studentId, subjectId) {
    if (!confirm("Are you sure you want to enroll this student in the selected subject?")) return;

    try {
      await this.apiCall('/enrollments/', 'POST', { student: studentId, subject: subjectId });
      this.showSuccess("Student enrolled successfully!");
      this.viewStudentDetails(studentId); // Refresh the student details view
    } catch (error) {
      console.error("Failed to enroll student:", error);
      // The apiCall method already shows a generic error, but you can add more specific ones if needed
    }
  }

  async handleUnenrollStudent(enrollmentId, studentId) {
    if (!confirm("Are you sure you want to unenroll this student from this subject? All related grades will be permanently deleted.")) return;

    try {
      await this.apiCall(`/enrollments/${enrollmentId}/`, 'DELETE');
      this.showSuccess("Student unenrolled successfully. Related grades have been deleted.");
      this.viewStudentDetails(studentId); // Refresh the student details view
    } catch (error) {
      console.error(`Failed to unenroll student (enrollment ID: ${enrollmentId}):`, error);
      this.showError("Failed to unenroll student. Please try again.");
    }
  }

  async loadStudentSubjects(studentId) {
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
    const modalContent = document.getElementById("modalContent"); // Or modalBody, ensure consistency with your HTML
    const isEdit = grade !== null;

    let enrollmentOptionsHTML = '<option value="">Select Student - Subject</option>';
    try {
      // Fetch fresh list of enrollments.
      // Your EnrollmentSerializer should provide student_name, subject_code, and subject_name
      // for a good user experience in the dropdown.
      const allEnrollments = await this.apiCall("/enrollments/"); 
      if (allEnrollments && allEnrollments.length > 0) {
        allEnrollments.forEach(enr => {
          const studentName = enr.student_name || `Student (ID: ${enr.student})`; 
          const subjectIdentifier = enr.subject_code ? 
            `${enr.subject_code} (${enr.subject_name || `Subject ID: ${enr.subject}`})` : 
            `Subject (ID: ${enr.subject})`;

          enrollmentOptionsHTML += `<option value="${enr.id}" ${grade?.enrollment === enr.id ? "selected" : ""}>
                                  ${studentName} - ${subjectIdentifier}
                                </option>`;
        });
      } else {
        enrollmentOptionsHTML = '<option value="">No enrollments found. Please enroll students in subjects first.</option>';
      }
    } catch (error) {
      console.error("Failed to load enrollments for grade form:", error);
      this.showError("Could not load enrollment options for the grade form.");
      enrollmentOptionsHTML = '<option value="">Error loading enrollments.</option>';
    }
    
    modalContent.innerHTML = `
            <h2>${isEdit ? "Edit" : "Add"} Grade</h2>
            <form id="gradeForm">
                <div class="form-group">
                    <label for="enrollment">Student - Subject:</label>
                    <select id="enrollment" name="enrollment" required>
                        ${enrollmentOptionsHTML}
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
        `;

    const gradeForm = document.getElementById("gradeForm");
    if (gradeForm) {
        gradeForm.addEventListener("submit", (e) => {
          e.preventDefault();
          this.saveGrade(grade?.id);
        });
    } else {
        console.error("gradeForm element not found after rendering modal content.");
        this.showError("Could not initialize the grade form. Please check console for errors.");
    }
    this.showModal();
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
