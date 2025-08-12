🔍 DEBUG: Course ID from query: 1
🔍 DEBUG: Authenticated user: {
  id: 10,
  staff_username: 'eli123',
  role: 'instructor',
  iat: 1754993822,
  exp: 1754997422
}
🔍 DEBUG: Database connection established
🔍 DEBUG: Course query result: [
  {
    pc_id: '1',
    program_id: 1,
    year_id: 103,
    semester: '2nd',
    course_code: 'CC106',
    course_name: 'Application Development and Emerging Technologies',
    units: 3,
    section: 'B',
    day: 'Friday',
    start_time: '14:00:00',
    end_time: '16:00:00'
  }
]
🔍 DEBUG: Course details: {
  pc_id: '1',
  program_id: 1,
  year_id: 103,
  semester: '2nd',
  course_code: 'CC106',
  course_name: 'Application Development and Emerging Technologies',
  units: 3,
  section: 'B',
  day: 'Friday',
  start_time: '14:00:00',
  end_time: '16:00:00'
}
🔍 DEBUG: Students query: 
      SELECT DISTINCT
        s.id as student_id,
        CONCAT(s.first_name, ' ', COALESCE(s.middle_name, ''), ' ', s.last_name) as name,
        s.email,
        e.enrollment_date,
        e.enrollment_status,
        COALESCE(g.final_grade::text, '') as final_grade
      FROM students s
      JOIN enrollments e ON s.id = e.student_id
      JOIN program_year py ON e.year_id = py.year_id
      JOIN student_blocks sb ON e.block_id = sb.block_id
      LEFT JOIN grades g ON s.id = g.student_id AND g.pc_id = $1
      WHERE e.program_id = $2
        AND e.year_id = $3
        AND e.semester = $4
        AND sb.block_name = $5
        AND e.enrollment_status = 'Officially Enrolled'
      ORDER BY 2
🔍 DEBUG: Query parameters: [ '1', 1, 103, '2nd', 'B' ]
🔍 DEBUG: Total enrollments for this program/year/semester: { total_enrollments: '7' }
🔍 DEBUG: Enrollment breakdown by block and status: [
  { block_id: 2, enrollment_status: 'Officially Enrolled', count: '2' },
  { block_id: null, enrollment_status: 'For Payment', count: '1' },
  {
    block_id: null,
    enrollment_status: 'Officially Enrolled',
    count: '1'
  },
  { block_id: null, enrollment_status: 'Verified', count: '3' }
]
🔍 DEBUG: Available student blocks: [
  {
    block_id: 2,
    program_id: 1,
    year_level: 3,
    block_name: 'A',
    academic_year: '{"2025-2026"}',
    semester: '2nd'
  },
  {
    block_id: 3,
    program_id: 1,
    year_level: 3,
    block_name: 'B',
    academic_year: '{"2025-2026"}',
    semester: '2nd'
  }
]
🔍 DEBUG: Students found: 0
🔍 DEBUG: Final response: {
  course: {
    pc_id: '1',
    course_code: 'CC106',
    course_name: 'Application Development and Emerging Technologies',
    units: 3,
    semester: '2nd',
    section: 'B',
    day: 'Friday',
    start_time: '14:00:00',
    end_time: '16:00:00'
  },
  students: [],
  total_students: 0
}
🔍 DEBUG: Database connection released
