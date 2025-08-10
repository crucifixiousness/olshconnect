import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  School as SchoolIcon,
  Book as BookIcon
} from '@mui/icons-material';
import axios from 'axios';

const ProgramManagement = () => {
  const [programs, setPrograms] = useState([]);
  const [majors, setMajors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  
  // Program dialog states
  const [programDialogOpen, setProgramDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [programForm, setProgramForm] = useState({ program_name: '' });
  
  // Major dialog states
  const [majorDialogOpen, setMajorDialogOpen] = useState(false);
  const [editingMajor, setEditingMajor] = useState(null);
  const [majorForm, setMajorForm] = useState({
    major_name: '',
    major_code: '',
    description: '',
    program_id: ''
  });
  
  // Notification states
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [programsRes, majorsRes] = await Promise.all([
        axios.get('/api/program-management'),
        axios.get('/api/major-management')
      ]);
      setPrograms(programsRes.data);
      setMajors(majorsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      showNotification('Error fetching data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Program management functions
  const handleProgramSubmit = async () => {
    try {
      if (editingProgram) {
        await axios.put('/api/program-management', {
          program_id: editingProgram.program_id,
          program_name: programForm.program_name
        });
        showNotification('Program updated successfully');
      } else {
        await axios.post('/api/program-management', programForm);
        showNotification('Program created successfully');
      }
      setProgramDialogOpen(false);
      resetProgramForm();
      fetchData();
    } catch (error) {
      console.error('Error saving program:', error);
      showNotification(error.response?.data?.error || 'Error saving program', 'error');
    }
  };

  const handleProgramEdit = (program) => {
    setEditingProgram(program);
    setProgramForm({ program_name: program.program_name });
    setProgramDialogOpen(true);
  };

  const handleProgramDelete = async (programId) => {
    if (window.confirm('Are you sure you want to delete this program?')) {
      try {
        await axios.delete(`/api/program-management?program_id=${programId}`);
        showNotification('Program deleted successfully');
        fetchData();
      } catch (error) {
        console.error('Error deleting program:', error);
        showNotification(error.response?.data?.error || 'Error deleting program', 'error');
      }
    }
  };

  const resetProgramForm = () => {
    setEditingProgram(null);
    setProgramForm({ program_name: '' });
  };

  // Major management functions
  const handleMajorSubmit = async () => {
    try {
      if (editingMajor) {
        await axios.put('/api/major-management', {
          major_id: editingMajor.major_id,
          major_name: majorForm.major_name,
          major_code: majorForm.major_code,
          description: majorForm.description,
          program_id: majorForm.program_id
        });
        showNotification('Major updated successfully');
      } else {
        await axios.post('/api/major-management', majorForm);
        showNotification('Major created successfully');
      }
      setMajorDialogOpen(false);
      resetMajorForm();
      fetchData();
    } catch (error) {
      console.error('Error saving major:', error);
      showNotification(error.response?.data?.error || 'Error saving major', 'error');
    }
  };

  const handleMajorEdit = (major) => {
    setEditingMajor(major);
    setMajorForm({
      major_name: major.major_name,
      major_code: major.major_code,
      description: major.description,
      program_id: major.program_id
    });
    setMajorDialogOpen(true);
  };

  const handleMajorDelete = async (majorId) => {
    if (window.confirm('Are you sure you want to delete this major?')) {
      try {
        await axios.delete(`/api/major-management?major_id=${majorId}`);
        showNotification('Major deleted successfully');
        fetchData();
      } catch (error) {
        console.error('Error deleting major:', error);
        showNotification(error.response?.data?.error || 'Error deleting major', 'error');
      }
    }
  };

  const resetMajorForm = () => {
    setEditingMajor(null);
    setMajorForm({
      major_name: '',
      major_code: '',
      description: '',
      program_id: ''
    });
  };

  if (loading) {
    return (
      <Container>
        <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
          Loading...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <SchoolIcon /> Program Management
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Programs" icon={<SchoolIcon />} iconPosition="start" />
          <Tab label="Majors" icon={<BookIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* Programs Tab */}
      {activeTab === 0 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5">Programs</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setProgramDialogOpen(true)}
            >
              Add Program
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Program ID</TableCell>
                  <TableCell>Program Name</TableCell>
                  <TableCell>Majors</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {programs.map((program) => (
                  <TableRow key={program.program_id}>
                    <TableCell>{program.program_id}</TableCell>
                    <TableCell>{program.program_name}</TableCell>
                    <TableCell>
                      {program.majors && program.majors.length > 0 ? (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {program.majors.map((major) => (
                            <Chip
                              key={major.major_id}
                              label={major.major_name}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          No majors
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => handleProgramEdit(program)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleProgramDelete(program.program_id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Majors Tab */}
      {activeTab === 1 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5">Majors</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setMajorDialogOpen(true)}
            >
              Add Major
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Major ID</TableCell>
                  <TableCell>Major Name</TableCell>
                  <TableCell>Major Code</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Program</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {majors.map((major) => (
                  <TableRow key={major.major_id}>
                    <TableCell>{major.major_id}</TableCell>
                    <TableCell>{major.major_name}</TableCell>
                    <TableCell>{major.major_code}</TableCell>
                    <TableCell>{major.description}</TableCell>
                    <TableCell>{major.program_name}</TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => handleMajorEdit(major)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleMajorDelete(major.major_id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Program Dialog */}
      <Dialog open={programDialogOpen} onClose={() => setProgramDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingProgram ? 'Edit Program' : 'Add New Program'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Program Name"
            fullWidth
            variant="outlined"
            value={programForm.program_name}
            onChange={(e) => setProgramForm({ ...programForm, program_name: e.target.value })}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProgramDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleProgramSubmit} variant="contained">
            {editingProgram ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Major Dialog */}
      <Dialog open={majorDialogOpen} onClose={() => setMajorDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingMajor ? 'Edit Major' : 'Add New Major'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Major Name"
            fullWidth
            variant="outlined"
            value={majorForm.major_name}
            onChange={(e) => setMajorForm({ ...majorForm, major_name: e.target.value })}
            sx={{ mt: 2 }}
          />
          <TextField
            margin="dense"
            label="Major Code"
            fullWidth
            variant="outlined"
            value={majorForm.major_code}
            onChange={(e) => setMajorForm({ ...majorForm, major_code: e.target.value })}
            sx={{ mt: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={majorForm.description}
            onChange={(e) => setMajorForm({ ...majorForm, description: e.target.value })}
            sx={{ mt: 2 }}
          />
          <TextField
            select
            margin="dense"
            label="Program"
            fullWidth
            variant="outlined"
            value={majorForm.program_id}
            onChange={(e) => setMajorForm({ ...majorForm, program_id: e.target.value })}
            sx={{ mt: 2 }}
          >
            {programs.map((program) => (
              <option key={program.program_id} value={program.program_id}>
                {program.program_name}
              </option>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMajorDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleMajorSubmit} variant="contained">
            {editingMajor ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProgramManagement; 