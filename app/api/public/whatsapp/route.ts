import { NextResponse } from 'next/server';
import twilio, { Twilio } from 'twilio';

interface WhatsAppRequest {
  to: string;
  body: string;
}

// Log environment variables (except sensitive ones)
console.log('Environment variables:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID ? '***' + process.env.TWILIO_ACCOUNT_SID.slice(-4) : 'Not set');
console.log('- TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? '***' + process.env.TWILIO_AUTH_TOKEN.slice(-4) : 'Not set');
console.log('- TWILIO_PHONE_NUMBER:', process.env.TWILIO_PHONE_NUMBER || 'Not set');
console.log('- WHATSAPP_TO_NUMBER:', process.env.WHATSAPP_TO_NUMBER || 'Not set');

// Initialize Twilio client with environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || 'whatsapp:+14155238886'; // Default to sandbox if not set

// Create Twilio client only if credentials are available
let client: Twilio | null = null;
try {
  if (accountSid && authToken) {
    client = twilio(accountSid, authToken, {
      accountSid: accountSid,
      autoRetry: true,
      logLevel: 'debug',
    });
    console.log('Twilio client initialized successfully');
  } else {
    console.error('Missing Twilio credentials. Check your environment variables.');
    console.log('Account SID present:', !!accountSid);
    console.log('Auth Token present:', !!authToken);
  }
} catch (error) {
  console.error('Error initializing Twilio client:', error);
  client = null;
}

export async function POST(request: Request) {
  console.log('\n=== New WhatsApp API Request ===');
  
  // Log request details
  const requestUrl = new URL(request.url);
  console.log(`Request URL: ${requestUrl.pathname}`);
  console.log(`Request method: ${request.method}`);
  
  if (!client) {
    const errorMsg = 'Twilio client not initialized - check environment variables';
    console.error(errorMsg);
    console.log('Client initialization state:', { 
      hasAccountSid: !!accountSid,
      hasAuthToken: !!authToken,
      clientInitialized: !!client 
    });
    
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Server configuration error',
      message: 'Twilio client not properly configured',
      details: process.env.NODE_ENV === 'development' ? {
        missingCredentials: !accountSid || !authToken,
        accountSidPresent: !!accountSid,
        authTokenPresent: !!authToken
      } : undefined
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'X-Twilio-Error': 'ClientNotInitialized'
      },
    });
  }

  try {
    // Parse request body
    let requestBody;
    try {
      requestBody = await request.json();
      console.log('Request body parsed successfully');
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid request format',
        message: 'Request body must be valid JSON'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { to, body: messageBody } = requestBody;
    console.log('Request data:', { 
      to: to ? `${to.substring(0, 4)}...${to.slice(-4)}` : 'undefined',
      bodyLength: messageBody?.length || 0,
      bodyPreview: messageBody?.substring(0, 50) + (messageBody?.length > 50 ? '...' : '')
    });

    // Validate required fields
    if (!to || !messageBody) {
      console.error('Missing required fields', { 
        to: to ? 'present' : 'missing',
        body: messageBody ? 'present' : 'missing'
      });
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Missing required fields',
        details: {
          missing: [
            ...(!to ? ['to'] : []),
            ...(!messageBody ? ['body'] : [])
          ]
        }
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Format phone numbers
    const toNumber = `whatsapp:${to.replace(/^whatsapp:/, '').replace(/\s+/g, '')}`;
    const fromNumber = twilioPhoneNumber.startsWith('whatsapp:') 
      ? twilioPhoneNumber 
      : `whatsapp:${twilioPhoneNumber}`;

    console.log('Sending WhatsApp message:', {
      from: fromNumber,
      to: toNumber,
      bodyLength: messageBody.length,
      bodyPreview: messageBody.substring(0, 100) + (messageBody.length > 100 ? '...' : '')
    });

    try {
      // Send WhatsApp message
      const message = await client.messages.create({
        body: messageBody,
        from: fromNumber,
        to: toNumber,
      });

      console.log('Message sent successfully:', {
        messageSid: message.sid,
        status: message.status,
        dateCreated: message.dateCreated,
        errorCode: message.errorCode,
        errorMessage: message.errorMessage
      });
      
      return new Response(JSON.stringify({ 
        success: true, 
        messageSid: message.sid,
        status: message.status,
        dateCreated: message.dateCreated
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (twilioError: any) {
      console.error('Twilio API Error:', {
        name: twilioError.name,
        message: twilioError.message,
        code: twilioError.code,
        status: twilioError.status,
        moreInfo: twilioError.moreInfo,
        stack: process.env.NODE_ENV === 'development' ? twilioError.stack : undefined
      });
      
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to send WhatsApp message',
        message: twilioError.message,
        code: twilioError.code,
        status: twilioError.status || 500,
        details: process.env.NODE_ENV === 'development' ? {
          moreInfo: twilioError.moreInfo,
          stack: twilioError.stack
        } : undefined
      }), {
        status: twilioError.status || 500,
        headers: { 
          'Content-Type': 'application/json',
          'X-Twilio-Error': twilioError.code || 'TwilioError'
        },
      });
    }
  } catch (error) {
    console.error('Unexpected error in WhatsApp API:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error',
      message: errorMessage,
      details: process.env.NODE_ENV === 'development' 
        ? (error instanceof Error ? error.stack : String(error))
        : undefined
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
