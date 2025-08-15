import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface OrderItemInput {
  productId: string;
  variantId?: string;
  variantName?: string;
  name: string;
  quantity: number;
  price: number | string;
}

interface CustomerInput {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
}

interface ShippingInput {
  address: string;
  city: string;
  cost: number;
}

interface OrderInput {
  customer: CustomerInput;
  items: OrderItemInput[];
  shipping: number | ShippingInput;
  notes?: string;
}

export async function POST(req: Request) {
  try {
    console.log('Starting order creation...');
    // Session is optional since we support guest orders
    const session = await getServerSession(authOptions);
    const data: OrderInput = await req.json();
    
    // Determine if this is a guest order
    const isGuestOrder = !session?.user?.id;
    
    // Validate required fields
    if (!data.customer || !data.items || data.items.length === 0) {
      console.error('Missing required fields:', { 
        customer: !!data.customer, 
        items: data.items?.length,
        customerData: data.customer
      });
      return NextResponse.json(
        { 
          error: 'Customer information and at least one item are required',
          details: {
            hasCustomer: !!data.customer,
            hasItems: data.items?.length > 0,
            customerFields: data.customer ? Object.keys(data.customer) : []
          }
        },
        { status: 400 }
      );
    }

    console.log('Received order data:', JSON.stringify(data, null, 2));

    // Validate customer data
    const requiredCustomerFields = ['name', 'email', 'phone', 'address', 'city'];
    const missingCustomerFields = requiredCustomerFields.filter(
      field => !data.customer[field as keyof CustomerInput]
    );

    if (missingCustomerFields.length > 0) {
      console.error('Missing required customer fields:', missingCustomerFields);
      return NextResponse.json(
        { 
          error: 'Missing required customer information',
          missingFields: missingCustomerFields
        },
        { status: 400 }
      );
    }

    // Calculate total from items
    const subtotal = data.items.reduce(
      (sum: number, item: OrderItemInput) => {
        const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
        return sum + (price * item.quantity);
      },
      0
    );

    console.log('Creating order with subtotal:', subtotal, 'shipping:', data.shipping);

    try {
      // Create the order
      const order = await prisma.$transaction(async (prisma) => {
        console.log('Starting database transaction...');
        console.log('Order items:', JSON.stringify(data.items, null, 2));
        
        // First, verify all products exist and get their variants
        const productIds = data.items.map(item => item.productId);
        const products = await prisma.product.findMany({
          where: { id: { in: productIds } },
          include: { variants: true }
        });

        console.log('Found products:', JSON.stringify(products, null, 2));

        if (products.length !== new Set(productIds).size) {
          const missingProducts = productIds.filter(
            id => !products.some(p => p.id === id)
          );
          console.error('Some products not found:', missingProducts);
          throw new Error(`Products not found: ${missingProducts.join(', ')}`);
        }

        // Create the order with the new schema
        console.log('Creating order record...');
        console.log('Is guest order:', isGuestOrder);
        
        // Calculate shipping cost
        const shippingCost = typeof data.shipping === 'number' 
          ? data.shipping 
          : data.shipping?.cost || 0;
          
        // Get shipping address and city
        const shippingAddress = typeof data.shipping === 'object' 
          ? data.shipping.address 
          : '';
        const shippingCity = typeof data.shipping === 'object' 
          ? data.shipping.city 
          : '';
          
        // Log shipping info
        console.log('Shipping info:', { shippingCost, shippingAddress, shippingCity });

        // Prepare order items with proper variant handling
        const orderItemsData = data.items.map(item => {
          const product = products.find(p => p.id === item.productId);
          if (!product) {
            throw new Error(`Product ${item.productId} not found in the database`);
          }
          
          // For products with variants, ensure we have a valid variant
          if (product.variants && product.variants.length > 0) {
            // If no variant ID is provided, use the default variant
            const variantId = item.variantId || 
              (product.variants.find(v => v.isDefault)?.id || product.variants[0].id);
              
            console.log(`Product ${item.productId} has variants, using variant:`, variantId);
            
            return {
              product: { connect: { id: item.productId } },
              quantity: item.quantity,
              price: typeof item.price === 'string' ? parseFloat(item.price) : item.price,
              variant: { connect: { id: variantId } },
              variantDetails: {
                variantId,
                variantName: item.variantName || `Variant: ${variantId}`
              }
            };
          }
          
          // For products without variants
          return {
            product: { connect: { id: item.productId } },
            quantity: item.quantity,
            price: typeof item.price === 'string' ? parseFloat(item.price) : item.price
          };
        });
        
        console.log('Order items data:', JSON.stringify(orderItemsData, null, 2));
        
        // Prepare base order data
        const orderData: any = {
          status: 'PENDING_CONFIRMATION' as const,
          total: subtotal + shippingCost,
          customerName: data.customer.name,
          customerEmail: data.customer.email,
          customerPhone: data.customer.phone,
          shippingAddress,
          shippingCity,
          shippingCost,
          notes: data.notes || '',
          isGuestOrder,
          orderItems: {
            create: orderItemsData
          }
        };

        // Only add user relation if authenticated
        if (session?.user?.id) {
          // First verify the user exists before attempting to connect
          const userExists = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { id: true }
          });
          
          if (userExists) {
            orderData.user = { connect: { id: session.user.id }};
          } else {
            console.warn(`User ${session.user.id} not found, proceeding as guest order`);
          }
        }

        // Create the order
        const order = await prisma.order.create({
          data: orderData,
          include: {
            orderItems: {
              include: {
                product: true,
                variant: true
              }
            }
          }
        });

        console.log('Order created successfully:', order.id);
        return order;
      });

      return NextResponse.json({ 
        success: true,
        orderId: order.id,
        message: 'Order created successfully' 
      });
      
    } catch (error) {
      console.error('Error in order creation transaction:', error);
      throw error; // Re-throw to be caught by the outer catch
    }
    
  } catch (error) {
    console.error('Error in order creation endpoint:', error);
    
    let errorMessage = 'Failed to create order';
    let errorDetails = {};
    let statusCode = 500;

    // Handle specific error types
    if (error instanceof Error) {
      errorMessage = error.message || errorMessage;
      
      // Handle Prisma errors
      if (error.name === 'PrismaClientKnownRequestError') {
        const prismaError = error as any;
        errorDetails = {
          code: prismaError.code,
          meta: prismaError.meta,
          message: prismaError.message
        };
        
        // Handle specific Prisma error codes
        if (prismaError.code === 'P2002') {
          errorMessage = 'A unique constraint was violated';
          statusCode = 400;
        } else if (prismaError.code === 'P2025') {
          errorMessage = 'A required record was not found';
          statusCode = 404;
        }
      }
    }

      return NextResponse.json(
      { 
        success: false,
        error: errorMessage,
        details: Object.keys(errorDetails).length > 0 ? errorDetails : undefined,
        ...(process.env.NODE_ENV === 'development' && error instanceof Error ? { stack: error.stack } : {})
      },
      { status: statusCode }
    );
  }
}
