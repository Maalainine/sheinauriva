#!/usr/bin/env npx tsx

/**
 * Test script to verify the complete order creation flow
 */

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001';

async function testOrderFlow() {
  console.log('Testing complete order creation flow...');

  try {
    // 1. Test with valid product data (simulating frontend cart data)
    const testOrderData = {
      customer: {
        name: "John Doe",
        phone: "+212612345678",
        address: "123 Test Street",
        city: "Casablanca",
        country: "Morocco",
        zipCode: "20100",
        notes: "Test order"
      },
      items: [
        {
          productId: 1, // Classic T-Shirt
          quantity: 2,
          price: 29.99
        },
        {
          productId: 2, // Running Shoes
          quantity: 1,
          price: 129.99
        }
      ],
      subtotal: 189.97, // (29.99 * 2) + 129.99
      shipping: 30.00,
      total: 219.97,
      paymentMethod: "cod"
    };

    console.log('\n=== Testing Order Creation ===');
    console.log('Order data:', JSON.stringify(testOrderData, null, 2));

    const response = await fetch(`${API_BASE}/api/public/order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testOrderData),
    });

    const result = await response.json();

    console.log('\n=== API Response ===');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(result, null, 2));

    if (!response.ok) {
      console.log('❌ Order creation failed');
      console.log('Error details:', result);
      return false;
    } else {
      console.log('✅ Order created successfully');
      console.log(`Order ID: ${result.orderId}`);
      console.log(`Order Number: ${result.orderNumber}`);
      return true;
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error);
    return false;
  }
}

async function testWithInvalidData() {
  console.log('\n=== Testing with Invalid Data ===');

  const invalidOrderData = {
    customer: {
      name: "Test User"
      // Missing required fields
    },
    items: [], // Empty items array
    subtotal: 0,
    shipping: 0,
    total: 0,
    paymentMethod: "cod"
  };

  try {
    const response = await fetch(`${API_BASE}/api/public/order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidOrderData),
    });

    const result = await response.json();

    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(result, null, 2));

    if (response.status === 400) {
      console.log('✅ Validation working correctly (expected 400 error)');
    } else {
      console.log('❌ Expected validation error, but got:', response.status);
    }

  } catch (error) {
    console.error('Test error:', error);
  }
}

async function main() {
  const success = await testOrderFlow();
  await testWithInvalidData();

  if (success) {
    console.log('\n✅ All tests passed! Order creation is working.');
  } else {
    console.log('\n❌ Tests failed. Check the API and database.');
  }
}

main();
