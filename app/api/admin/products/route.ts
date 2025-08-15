import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// Types for the complete product with all relations
type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    category: true;
    brand: true;
    tags: true;
    variants: {
      include: {
        selections: {
          include: {
            option: {
              include: {
                variantType: true;
              };
            };
          };
        };
      };
    };
    allowedOptions: {
      include: {
        option: {
          include: {
            variantType: true;
          };
        };
      };
    };
  };
}>;

// Request body types
type ProductFormData = {
  name: string;
  description?: string;
  categoryId: string;
  brandId?: string | null;
  basePrice?: string;
  status?: boolean;
  featured?: boolean;
  onSale?: boolean;
  images?: string[];
  tagIds?: string[];
  variants?: Array<{
    id?: string;
    sku: string;
    price: string;
    stock: number;
    selectedOptions: Array<{ variantTypeId: string; optionId: string }>;
  }>;
  allowedOptions?: Array<{ variantTypeId: string; optionId: string }>;
};

// Query parameters type
type QueryParams = {
  page?: string;
  limit?: string;
  search?: string;
  categoryId?: string;
  brandId?: string;
  status?: string;
  featured?: string;
  onSale?: string;
  sortBy?: 'name' | 'price' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  includeImages?: string;
  includeVariants?: string;
  includeTags?: string;
};

// Utility function to validate admin access
async function validateAdminAccess() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { error: 'Unauthorized', status: 401 };
  }
  
  // Check if user has admin role
  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { role: true }
  });
  
  if (user?.role !== 'ADMIN') {
    return { error: 'Forbidden - Admin access required', status: 403 };
  }
  
  return { success: true };
}

// GET /api/products - Get all products with filtering and pagination, or a single product by id
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params: QueryParams = Object.fromEntries(searchParams);
    
    // If id is present, return a single product with all relations
    if (params.id) {
      const idNum = parseInt(params.id);
      if (isNaN(idNum)) {
        return NextResponse.json({ message: 'Invalid id' }, { status: 400 });
      }
      const product = await prisma.product.findUnique({
        where: { id: idNum },
        include: {
          category: true,
          brand: true,
          tags: true,
          variants: {
            include: {
              selections: {
                include: {
                  option: {
                    include: {
                      variantType: true
                    }
                  }
                }
              }
            }
          },
          allowedOptions: {
            include: {
              option: {
                include: {
                  variantType: true
                }
              }
            }
          }
        }
      });
      if (!product) {
        return NextResponse.json({ message: 'Product not found' }, { status: 404 });
      }
      return NextResponse.json(product);
    }
    
    // --- Existing paginated list logic below ---
    const {
      page = '1',
      limit = '10',
      search,
      categoryId,
      brandId,
      status,
      featured,
      onSale,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      includeImages = 'true',
      includeVariants = 'true',
      includeTags = 'true'
    } = params;

    // Parse pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: Prisma.ProductWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { name: { contains: search, mode: 'insensitive' } } },
        { brand: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }

    if (categoryId) {
      where.categoryId = parseInt(categoryId);
    }

    if (brandId) {
      where.brandId = parseInt(brandId);
    }

    if (status !== undefined) {
      where.status = status === 'true';
    }

    if (featured !== undefined) {
      where.featured = featured === 'true';
    }

    if (onSale !== undefined) {
      where.onSale = onSale === 'true';
    }

    // Build include clause
    const include: Prisma.ProductInclude = {
      category: true,
      brand: true,
      tags: includeTags === 'true',
      variants: includeVariants === 'true' ? {
        include: {
          selections: {
            include: {
              option: {
                include: {
                  variantType: true
                }
              }
            }
          }
        }
      } : false,
      allowedOptions: {
        include: {
          option: {
            include: {
              variantType: true
            }
          }
        }
      }
    };

    // Build orderBy clause
    const orderBy: Prisma.ProductOrderByWithRelationInput = {};
    if (sortBy === 'name') {
      orderBy.name = sortOrder;
    } else if (sortBy === 'price') {
      orderBy.basePrice = sortOrder;
    } else if (sortBy === 'createdAt') {
      orderBy.createdAt = sortOrder;
    } else if (sortBy === 'updatedAt') {
      orderBy.updatedAt = sortOrder;
    }

    // Execute queries
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        include,
        orderBy,
        skip,
        take: limitNum,
      }),
      prisma.product.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);

    return NextResponse.json({
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalCount,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1
      }
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    return new NextResponse(
      error instanceof Error ? error.message : 'Internal server error',
      { status: 500 }
    );
  }
}

// POST /api/products - Create a new product
export async function POST(request: NextRequest) {
  try {
    // Validate admin access
    const authResult = await validateAdminAccess();
    if (authResult.error) {
      return new NextResponse(authResult.error, { status: authResult.status });
    }

    const formData: ProductFormData = await request.json();
    
    const {
      name,
      description = '',
      categoryId,
      brandId = null,
      basePrice = '0',
      status = true,
      featured = false,
      onSale = false,
      images = [],
      tagIds = [],
      variants = [],
      allowedOptions = []
    } = formData;
    
    // Basic validation
    if (!name || !categoryId) {
      return new NextResponse('Name and category are required', { status: 400 });
    }

    // Create product with transaction
    const result = await prisma.$transaction(async (tx) => {
      // Verify category exists
      const category = await tx.category.findUnique({
        where: { id: parseInt(categoryId) }
      });
      
      if (!category) {
        throw new Error('Invalid category');
      }

      // Prepare product data
      const productData: Prisma.ProductCreateInput = {
        name,
        description,
        basePrice: new Prisma.Decimal(parseFloat(basePrice) || 0),
        status: Boolean(status),
        featured: Boolean(featured),
        onSale: Boolean(onSale),
        images: Array.isArray(images) ? images.filter(url => typeof url === 'string' && url.trim().length > 0).map(url => url.trim()) : [],
        category: {
          connect: { id: parseInt(categoryId) }
        }
      };

      // Add brand if provided
      if (brandId) {
        const brand = await tx.brand.findUnique({
          where: { id: parseInt(brandId) }
        });
        
        if (brand) {
          productData.brand = {
            connect: { id: brand.id }
          };
        }
      }

      // Create product
      const product = await tx.product.create({
        data: productData
      });

      // Add tags
      if (Array.isArray(tagIds) && tagIds.length > 0) {
        const validTagIds = tagIds
          .map(id => parseInt(String(id)))
          .filter(id => !isNaN(id));

        if (validTagIds.length > 0) {
          await tx.product.update({
            where: { id: product.id },
            data: {
              tags: {
                connect: validTagIds.map(id => ({ id }))
              }
            }
          });
        }
      }

      // Add allowed options
      if (Array.isArray(allowedOptions) && allowedOptions.length > 0) {
        const validOptions = [];
        
        for (const option of allowedOptions) {
          const optionId = parseInt(String(option.optionId));
          if (!isNaN(optionId)) {
            const variantOption = await tx.variantOption.findUnique({
              where: { id: optionId }
            });
            
            if (variantOption) {
              validOptions.push({
                productId: product.id,
                optionId: optionId
              });
            }
          }
        }

        if (validOptions.length > 0) {
          await tx.productOption.createMany({
            data: validOptions,
            skipDuplicates: true
          });
        }
      }

      // Add variants
      if (Array.isArray(variants) && variants.length > 0) {
        for (const variant of variants) {
          const variantPrice = parseFloat(String(variant.price)) || parseFloat(String(basePrice)) || 0;
          const variantStock = parseInt(String(variant.stock), 10) || 0;
          
          const createdVariant = await tx.productVariant.create({
            data: {
              productId: product.id,
              sku: variant.sku || `SKU-${product.id}-${Date.now()}`,
              price: new Prisma.Decimal(variantPrice),
              stock: variantStock
            }
          });

          // Add variant selections
          if (Array.isArray(variant.selectedOptions) && variant.selectedOptions.length > 0) {
            const validSelections = [];
            
            for (const selection of variant.selectedOptions) {
              const optionId = parseInt(String(selection.optionId));
              if (!isNaN(optionId)) {
                const variantOption = await tx.variantOption.findUnique({
                  where: { id: optionId }
                });
                
                if (variantOption) {
                  validSelections.push({
                    variantId: createdVariant.id,
                    optionId: optionId
                  });
                }
              }
            }

            if (validSelections.length > 0) {
              await tx.variantSelection.createMany({
                data: validSelections,
                skipDuplicates: true
              });
            }
          }
        }
      }

      // Return complete product
      return await tx.product.findUnique({
        where: { id: product.id },
        include: {
          category: true,
          brand: true,
          tags: true,
          variants: {
            include: {
              selections: {
                include: {
                  option: {
                    include: {
                      variantType: true
                    }
                  }
                }
              }
            }
          },
          allowedOptions: {
            include: {
              option: {
                include: {
                  variantType: true
                }
              }
            }
          }
        }
      });
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error creating product:', error);
    return new NextResponse(
      error instanceof Error ? error.message : 'Internal server error',
      { status: 500 }
    );
  }
}

// PUT /api/products - Update a product (canonical)
export async function PUT(request: NextRequest) {
  try {
    // Validate admin access
    const authResult = await validateAdminAccess();
    if (authResult.error) {
      return new NextResponse(authResult.error, { status: authResult.status });
    }

    const formData: ProductFormData & { id?: string | number } = await request.json();
    console.log("API PUT received formData:", formData);
    console.log("API PUT received id:", formData.id);
    const productId = formData.id;

    if (!productId || isNaN(Number(productId))) {
      return new NextResponse('Invalid product ID', { status: 400 });
    }

    
    const {
      name,
      description,
      categoryId,
      brandId,
      basePrice,
      status,
      featured,
      onSale,
      images = [],
      tagIds = [],
      variants = [],
      allowedOptions = []
    } = formData;

    // Basic validation
    if (!name || !categoryId) {
      return new NextResponse('Name and category are required', { status: 400 });
    }

    // Update product with transaction
    const result = await prisma.$transaction(async (tx) => {
      // Check if product exists
      const existingProduct = await tx.product.findUnique({
        where: { id: Number(productId) }
      });
      
      if (!existingProduct) {
        throw new Error('Product not found');
      }

      // Verify category exists
      const category = await tx.category.findUnique({
        where: { id: parseInt(categoryId) }
      });
      
      if (!category) {
        throw new Error('Invalid category');
      }

      // Prepare update data
      const updateData: Prisma.ProductUpdateInput = {
        name,
        description,
        basePrice: new Prisma.Decimal(parseFloat(String(basePrice)) || 0),
        status: Boolean(status),
        featured: Boolean(featured),
        onSale: Boolean(onSale),
        images: Array.isArray(images) ? images.filter(url => typeof url === 'string' && url.trim().length > 0).map(url => url.trim()) : [],
        category: {
          connect: { id: parseInt(categoryId) }
        }
      };

      // Handle brand
      if (brandId) {
        const brand = await tx.brand.findUnique({
          where: { id: parseInt(brandId) }
        });
        
        if (brand) {
          updateData.brand = {
            connect: { id: brand.id }
          };
        }
      } else {
        updateData.brand = {
          disconnect: true
        };
      }

      // Update product
      const product = await tx.product.update({
        where: { id: Number(productId) },
        data: updateData
      });

      // Update tags
      await tx.product.update({
        where: { id: Number(product.id) },
        data: {
          tags: {
            set: []
          }
        }
      });

      if (Array.isArray(tagIds) && tagIds.length > 0) {
        const validTagIds = tagIds
          .map(id => parseInt(String(id)))
          .filter(id => !isNaN(id));

        if (validTagIds.length > 0) {
          await tx.product.update({
            where: { id: product.id },
            data: {
              tags: {
                connect: validTagIds.map(id => ({ id }))
              }
            }
          });
        }
      }

      // Update allowed options
      await tx.productOption.deleteMany({
        where: { productId: Number(product.id) }
      });

      if (Array.isArray(allowedOptions) && allowedOptions.length > 0) {
        const validOptions = [];
        
        for (const option of allowedOptions) {
          const optionId = parseInt(String(option.optionId));
          if (!isNaN(optionId)) {
            const variantOption = await tx.variantOption.findUnique({
              where: { id: optionId }
            });
            
            if (variantOption) {
              validOptions.push({
                productId: product.id,
                optionId: optionId
              });
            }
          }
        }

        if (validOptions.length > 0) {
          await tx.productOption.createMany({
            data: validOptions
          });
        }
      }

      // Update variants - delete existing and recreate
      // First, delete all variant selections for this product's variants
      const variantIds = (await tx.productVariant.findMany({
        where: { productId: product.id },
        select: { id: true }
      })).map(v => v.id);
      if (variantIds.length > 0) {
        await tx.variantSelection.deleteMany({ where: { variantId: { in: variantIds } } });
      }
      await tx.productVariant.deleteMany({
        where: { productId: product.id }
      });

      if (Array.isArray(variants) && variants.length > 0) {
        for (const variant of variants) {
          const variantPrice = parseFloat(String(variant.price)) || parseFloat(String(basePrice)) || 0;
          const variantStock = parseInt(String(variant.stock), 10) || 0;
          
          const createdVariant = await tx.productVariant.create({
            data: {
              productId: product.id,
              sku: variant.sku || `SKU-${product.id}-${Date.now()}`,
              price: new Prisma.Decimal(variantPrice),
              stock: variantStock
            }
          });

          // Add variant selections
          if (Array.isArray(variant.selectedOptions) && variant.selectedOptions.length > 0) {
            const validSelections = [];
            
            for (const selection of variant.selectedOptions) {
              const optionId = parseInt(String(selection.optionId));
              if (!isNaN(optionId)) {
                const variantOption = await tx.variantOption.findUnique({
                  where: { id: optionId }
                });
                
                if (variantOption) {
                  validSelections.push({
                    variantId: createdVariant.id,
                    optionId: optionId
                  });
                }
              }
            }

            if (validSelections.length > 0) {
              await tx.variantSelection.createMany({
                data: validSelections
              });
            }
          }
        }
      }

      // Return updated product
      return await tx.product.findUnique({
        where: { id: product.id },
        include: {
          category: true,
          brand: true,
          tags: true,
          variants: {
            include: {
              selections: {
                include: {
                  option: {
                    include: {
                      variantType: true
                    }
                  }
                }
              }
            }
          },
          allowedOptions: {
            include: {
              option: {
                include: {
                  variantType: true
                }
              }
            }
          }
        }
      });
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error updating product:', error);
    return new NextResponse(
      error instanceof Error ? error.message : 'Internal server error',
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] - Delete a product
export async function DELETE(request: NextRequest) {
  try {
    // Validate admin access
    const authResult = await validateAdminAccess();
    if (authResult.error) {
      return new NextResponse(authResult.error, { status: authResult.status });
    }

    const url = new URL(request.url);
    const productId = url.pathname.split('/').pop();
    
    if (!productId || isNaN(parseInt(productId))) {
      return new NextResponse('Invalid product ID', { status: 400 });
    }

    // Delete product with transaction
    const result = await prisma.$transaction(async (tx) => {
      // Check if product exists
      const existingProduct = await tx.product.findUnique({
        where: { id: parseInt(productId) },
        include: {
          orderItems: true
        }
      });
      
      if (!existingProduct) {
        throw new Error('Product not found');
      }

      // Check if product has been ordered
      if (existingProduct.orderItems.length > 0) {
        throw new Error('Cannot delete product that has been ordered. Consider deactivating it instead.');
      }

      // Delete related records first (due to foreign key constraints)
      await tx.variantSelection.deleteMany({
        where: {
          variant: {
            productId: parseInt(productId)
          }
        }
      });

      await tx.productVariant.deleteMany({
        where: { productId: parseInt(productId) }
      });

      await tx.productOption.deleteMany({
        where: { productId: parseInt(productId) }
      });

      // Disconnect tags (many-to-many relationship)
      await tx.product.update({
        where: { id: parseInt(productId) },
        data: {
          tags: {
            set: []
          },
          wishlistedBy: {
            set: []
          }
        }
      });

      // Finally delete the product
      const deletedProduct = await tx.product.delete({
        where: { id: parseInt(productId) }
      });

      return deletedProduct;
    });

    return NextResponse.json({ 
      message: 'Product deleted successfully', 
      deletedProduct: result 
    });

  } catch (error) {
    console.error('Error deleting product:', error);
    return new NextResponse(
      error instanceof Error ? error.message : 'Internal server error',
      { status: 500 }
    );
  }
}