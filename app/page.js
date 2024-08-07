'use client';

import { useState, useEffect } from 'react';
import { Box, Stack, Typography, Button, Modal, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { firestore } from '@/firebase';
import { collection, doc, getDocs, query, setDoc, deleteDoc, getDoc } from 'firebase/firestore';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: '#fff',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
};

const containerStyle = {
  width: '100vw',
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  backgroundColor: '#f5f5f5',
  padding: 2,
};

const headerStyle = {
  width: '600px',
  height: '80px',
  bgcolor: '#4A90E2',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 1,
  mb: 2,
};

const tableStyle = {
  width: '600px',
  bgcolor: '#fff',
  borderRadius: 1,
  border: '1px solid #ddd',
  height: '300px',
};

const tableHeaderStyle = {
  bgcolor: '#4A90E2',
  color: '#fff',
  fontSize: '1rem',
};

const tableCellStyle = {
  fontSize: '0.875rem',
};

const actionsCellStyle = {
  fontSize: '0.75rem',
  width: '100px',
  display: 'flex',
  justifyContent: 'space-between',
  padding: '0.5rem',
};

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemQuantity, setItemQuantity] = useState(1);
  const [editMode, setEditMode] = useState(false);
  const [originalItemName, setOriginalItemName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [openAIResponse, setOpenAIResponse] = useState('');

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({ name: doc.id, ...doc.data() });
    });
    setInventory(inventoryList);
    setFilteredInventory(inventoryList);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      updateInventory();
    }
  }, []);

  useEffect(() => {
    const filteredItems = inventory.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredInventory(filteredItems);
  }, [searchQuery, inventory]);

  const addItem = async (item, quantity) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity: existingQuantity } = docSnap.data();
      await setDoc(docRef, { quantity: existingQuantity + quantity });
    } else {
      await setDoc(docRef, { quantity });
    }
    await updateInventory();
  };

  const updateItem = async (originalItemName, newItemName, quantity) => {
    const originalDocRef = doc(collection(firestore, 'inventory'), originalItemName);
    const newDocRef = doc(collection(firestore, 'inventory'), newItemName);
    const originalDocSnap = await getDoc(originalDocRef);

    if (originalItemName !== newItemName) {
      await setDoc(newDocRef, { quantity });
      await deleteDoc(originalDocRef);
    } else {
      await setDoc(originalDocRef, { quantity });
    }

    await updateInventory();
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 });
      }
    }
    await updateInventory();
  };

  const handleOpen = (item = null) => {
    if (item) {
      setEditMode(true);
      setOriginalItemName(item.name);
      setItemName(item.name);
      setItemQuantity(item.quantity);
    } else {
      setEditMode(false);
      setOriginalItemName('');
      setItemName('');
      setItemQuantity(1);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditMode(false);
    setOriginalItemName('');
    setItemName('');
    setItemQuantity(1);
  };

  const fetchOpenAIResponse = async (query) => {
    if (typeof window !== 'undefined') {
      try {
        const response = await fetch('/api/ask-openai', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }

        setOpenAIResponse(data.answer || 'No answer found');
      } catch (error) {
        console.error('Error fetching OpenAI response:', error);
        setOpenAIResponse('Failed to fetch response');
      }
    }
  };

  const handleAskOpenAI = () => {
    const ingredients = inventory.map(item => item.name).join(', ');
    const query = `Using these ingredients: ${ingredients}, suggest a few recipes names, not the complete recipe. If an ingredient isn't edible, exclude it from consideration`;
    fetchOpenAIResponse(query);
  };

  return (
    <Box sx={containerStyle}>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="modal-modal-title" variant="h6" component="h2" fontSize="1.25rem">
            {editMode ? 'Edit Item' : 'Add Item'}
          </Typography>
          <Stack width="100%" direction={'column'} spacing={2}>
            <TextField
              id="outlined-basic"
              label="Item"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              sx={{ fontSize: '0.875rem' }}
            />
            <TextField
              id="outlined-quantity"
              label="Quantity"
              variant="outlined"
              type="number"
              fullWidth
              value={itemQuantity}
              onChange={(e) => setItemQuantity(parseInt(e.target.value))}
              sx={{ fontSize: '0.875rem' }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                if (editMode) {
                  updateItem(originalItemName, itemName, parseInt(itemQuantity));
                } else {
                  addItem(itemName, parseInt(itemQuantity));
                }
                handleClose();
              }}
              sx={{ fontSize: '0.875rem', borderRadius: 1 }}
            >
              {editMode ? 'Update' : 'Add'}
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Stack spacing={2} sx={{ mb: 2 }}>
        <TextField
          label="Search Items"
          variant="outlined"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ fontSize: '0.875rem' }}
        />
        <Button variant="contained" color="primary" onClick={() => handleOpen()} sx={{ fontSize: '0.875rem', borderRadius: 1 }}>
          Add New Item
        </Button>
        <Button variant="contained" color="primary" onClick={handleAskOpenAI} sx={{ fontSize: '0.875rem', borderRadius: 1 }}>
          Ask OpenAI
        </Button>
        {openAIResponse && (
          <Paper sx={{ p: 2, mt: 2, width: '600px', borderRadius: 1 }}>
            <Typography variant="h6" component="h2" fontSize="1rem" sx={{ mb: 1 }}>
              OpenAI Response
            </Typography>
            <Typography variant="body1" fontSize="0.875rem">
              {openAIResponse}
            </Typography>
          </Paper>
        )}
      </Stack>
      <Box sx={headerStyle}>
        <Typography variant="h4" component="h1" fontSize="1.5rem" color="#fff">
          Inventory
        </Typography>
      </Box>
      <TableContainer component={Paper} sx={tableStyle}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell sx={tableHeaderStyle}>Item</TableCell>
              <TableCell sx={tableHeaderStyle}>Quantity</TableCell>
              <TableCell sx={tableHeaderStyle}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredInventory.map((item) => (
              <TableRow key={item.name}>
                <TableCell sx={tableCellStyle}>{item.name}</TableCell>
                <TableCell sx={tableCellStyle}>{item.quantity}</TableCell>
                <TableCell sx={actionsCellStyle}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => handleOpen(item)}
                    sx={{ fontSize: '0.75rem' }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    size="small"
                    onClick={() => removeItem(item.name)}
                    sx={{ fontSize: '0.75rem' }}
                  >
                    Remove
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
