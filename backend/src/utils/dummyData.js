// backend/dummyData.js

module.exports = {
  recruitmentJobs: [
    {
      jobId: "J001",
      title: "Data Engineer",
      department: "IT",
      location: "Cairo",
      openings: 2,
      qualifications: [
        "BSc in Computer Science",
        "3+ years of experience",
        "Knowledge of Python"
      ],
      skills: ["Python", "MongoDB", "REST APIs"],
      description: "Develop backend APIs and manage integrations.",
      hiringProcessTemplate: [
        "Screening",
        "Shortlisting",
        "Technical Interview",
        "HR Interview",
        "Offer"
      ],
      brandContent: "Join our fast-growing tech team shaping Egypt’s digital future.",
      status: "open",
      createdDate: new Date("2025-11-01"),
      applications: ["APP001", "APP002"],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      jobId: "J002",
      title: "HR Assistant",
      department: "Human Resources",
      location: "Giza",
      openings: 1,
      qualifications: [
        "BSc in HR or related field",
        "1+ years of experience"
      ],
      skills: ["Recruitment", "Communication"],
      description: "Assist with recruitment and employee onboarding.",
      hiringProcessTemplate: [
        "Screening",
        "Interview",
        "Offer"
      ],
      brandContent: "Join our HR team to support employees.",
      status: "open",
      createdDate: new Date("2025-11-02"),
      applications: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],

  onboardingTasks: [
    {
      onboardingId: "ONB001",
      employeeId: "E003",
      contractId: "CONT001",
      tasks: [
        { task: "Submit signed contract", status: "completed", responsible: "New Hire" },
        { task: "Upload ID & certifications", status: "pending", responsible: "New Hire" },
        { task: "Setup workstation", status: "pending", responsible: "IT" },
        { task: "Create payroll record", status: "pending", responsible: "HR" },
      ],
      reminders: [
        { task: "Upload documents", dueDate: new Date("2025-11-17"), sent: true },
      ],
      checklistType: "Default Onboarding Checklist",
      startDate: new Date("2025-11-15"),
      endDate: new Date("2025-11-22"),
      status: "in-progress",
      provisioning: {
        emailCreated: false,
        accessProvisioned: false,
        revocationScheduled: new Date("2026-11-15"),
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      onboardingId: "ONB002",
      employeeId: "E004",
      contractId: "CONT002",
      tasks: [
        { task: "Submit signed contract", status: "completed", responsible: "New Hire" },
        { task: "Setup workstation", status: "pending", responsible: "IT" },
      ],
      reminders: [
        { task: "Setup workstation", dueDate: new Date("2025-11-18"), sent: false },
      ],
      checklistType: "Default Onboarding Checklist",
      startDate: new Date("2025-11-16"),
      endDate: new Date("2025-11-23"),
      status: "in-progress",
      provisioning: {
        emailCreated: false,
        accessProvisioned: false,
        revocationScheduled: new Date("2026-11-16"),
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],

  offboardingTasks: [
    {
      offboardingId: "OFF001",
      employeeId: "E004",
      exitType: "Resignation",
      reason: "Career growth opportunity",
      tasks: [
        { task: "Return laptop", status: "completed", department: "IT" },
        { task: "Submit clearance form", status: "pending", department: "HR" },
        { task: "Financial settlement", status: "pending", department: "Finance" },
        { task: "Return ID badge", status: "pending", department: "Admin" },
        { task: "Exit interview", status: "pending", department: "HR" },
      ],
      clearanceSignOffs: {
        IT: "approved",
        Finance: "pending",
        HR: "pending",
        Admin: "pending",
      },
      accessRevoked: false,
      finalSettlement: {
        leaveEncashment: true,
        benefitsTerminated: false,
        payCalculated: false,
      },
      startDate: new Date("2025-11-20"),
      endDate: new Date("2025-11-25"),
      status: "in-progress",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      offboardingId: "OFF002",
      employeeId: "E005",
      exitType: "Termination",
      reason: "Performance issues",
      tasks: [
        { task: "Revoke system access", status: "pending", department: "IT" },
        { task: "Collect company ID", status: "pending", department: "HR" },
      ],
      clearanceSignOffs: {
        IT: "pending",
        HR: "pending",
      },
      accessRevoked: false,
      finalSettlement: {
        leaveEncashment: false,
        benefitsTerminated: false,
        payCalculated: false,
      },
      startDate: new Date("2025-11-22"),
      endDate: new Date("2025-11-28"),
      status: "in-progress",
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
};
