const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8001;

// Middleware
app.use(cors());
app.use(express.json());

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Generic function to save data to Supabase
async function saveToSupabase(table, data) {
  try {
    const { data: result, error } = await supabase
      .from(table)
      .insert([data])
      .select();
    
    if (error) throw error;
    return result[0];
  } catch (error) {
    console.error(`Error saving to ${table}:`, error);
    throw error;
  }
}

// Function to send WhatsApp message via Z-API
async function sendWhatsAppMessage(phone, message) {
  try {
    const url = `https://api.z-api.io/instances/${process.env.ZAPI_INSTANCE}/token/${process.env.ZAPI_TOKEN}/send-text`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phone: phone,
        message: message
      })
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to send message');
    }
    
    console.log('WhatsApp message sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    throw error;
  }
}

// Routes

// Health check
app.get('/', (req, res) => {
  res.json({ message: '🔥 HajaBot ativo!' });
});

// Webhook route - receives WhatsApp messages
app.post('/api/webhook', async (req, res) => {
  try {
    const { sender, senderName, message } = req.body;
    
    console.log('Received webhook:', { sender, senderName, message });
    
    // Save lead to Supabase
    const leadData = {
      nome: senderName || 'Sem nome',
      telefone: sender,
      mensagem: message,
      status: 'novo'
    };
    
    const lead = await saveToSupabase('leads', leadData);
    console.log('Lead saved:', lead);
    
    // Save incoming message
    const messageData = {
      id_lead: lead.id,
      texto: message,
      tipo: 'recebida'
    };
    
    await saveToSupabase('mensagens', messageData);
    
    // Send automated response
    const autoResponse = `Olá ${senderName || 'cliente'}! 👋\n\nObrigado por entrar em contato conosco!\n\nRecebemos sua mensagem e nossa equipe entrará em contato em breve.\n\nComo podemos ajudar você hoje?`;
    
    await sendWhatsAppMessage(sender, autoResponse);
    
    // Save outgoing message
    await saveToSupabase('mensagens', {
      id_lead: lead.id,
      texto: autoResponse,
      tipo: 'enviada'
    });
    
    res.json({ 
      success: true, 
      message: 'Webhook processed successfully',
      leadId: lead.id 
    });
    
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ 
      error: 'Failed to process webhook',
      details: error.message 
    });
  }
});

// Form route - receives form submissions
app.post('/api/form', async (req, res) => {
  try {
    const { nome, telefone, cep, plano } = req.body;
    
    console.log('Received form submission:', { nome, telefone, cep, plano });
    
    // Validate required fields
    if (!nome || !telefone) {
      return res.status(400).json({ error: 'Nome e telefone são obrigatórios' });
    }
    
    const leadData = {
      nome,
      telefone,
      cep,
      plano,
      status: 'novo'
    };
    
    const lead = await saveToSupabase('leads', leadData);
    
    res.status(201).json({ 
      success: true, 
      message: 'Lead cadastrado com sucesso',
      lead 
    });
    
  } catch (error) {
    console.error('Error processing form:', error);
    res.status(500).json({ 
      error: 'Failed to process form submission',
      details: error.message 
    });
  }
});

// Send manual message route
app.post('/api/send', async (req, res) => {
  try {
    const { phone, message } = req.body;
    
    console.log('Sending manual message:', { phone, message });
    
    // Validate required fields
    if (!phone || !message) {
      return res.status(400).json({ error: 'Phone e message são obrigatórios' });
    }
    
    // Send message via Z-API
    const result = await sendWhatsAppMessage(phone, message);
    
    // Try to find existing lead by phone and save message
    try {
      const { data: existingLead } = await supabase
        .from('leads')
        .select('id')
        .eq('telefone', phone)
        .single();
        
      if (existingLead) {
        await saveToSupabase('mensagens', {
          id_lead: existingLead.id,
          texto: message,
          tipo: 'enviada'
        });
      }
    } catch (error) {
      console.log('Lead not found for phone:', phone);
    }
    
    res.json({ 
      success: true, 
      message: 'Message sent successfully',
      result 
    });
    
  } catch (error) {
    console.error('Error sending manual message:', error);
    res.status(500).json({ 
      error: 'Failed to send message',
      details: error.message 
    });
  }
});

// Get all leads (for admin dashboard)
app.get('/api/leads', async (req, res) => {
  try {
    const { status, search } = req.query;
    
    let query = supabase.from('leads').select('*');
    
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    
    if (search) {
      query = query.or(`nome.ilike.%${search}%,telefone.ilike.%${search}%`);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.json(data);
    
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({ 
      error: 'Failed to fetch leads',
      details: error.message 
    });
  }
});

// Get messages for a lead
app.get('/api/leads/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('mensagens')
      .select('*')
      .eq('id_lead', id)
      .order('horario', { ascending: true });
    
    if (error) throw error;
    
    res.json(data);
    
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ 
      error: 'Failed to fetch messages',
      details: error.message 
    });
  }
});

// Update lead status
app.put('/api/leads/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const { data, error } = await supabase
      .from('leads')
      .update({ status })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    
    res.json(data[0]);
    
  } catch (error) {
    console.error('Error updating lead:', error);
    res.status(500).json({ 
      error: 'Failed to update lead',
      details: error.message 
    });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🔥 HajaBot server running on port ${PORT}`);
  console.log(`Environment check:`);
  console.log(`- SUPABASE_URL: ${process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing'}`);
  console.log(`- SUPABASE_KEY: ${process.env.SUPABASE_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`- ZAPI_INSTANCE: ${process.env.ZAPI_INSTANCE ? '✅ Set' : '❌ Missing'}`);
  console.log(`- ZAPI_TOKEN: ${process.env.ZAPI_TOKEN ? '✅ Set' : '❌ Missing'}`);
});
