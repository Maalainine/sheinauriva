import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient, type User, type UserRole } from "@prisma/client";
import { compare } from "bcryptjs";
import type { JWT } from "next-auth/jwt";
import type {
  DefaultSession,
  NextAuthOptions,
  User as NextAuthUser,
} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Extend the Prisma User type to include the password field
interface UserWithPassword {
  id: string;
  email: string;
  name: string | null;
  emailVerified: Date | null;
  image: string | null;
  role: UserRole;
  password: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Custom JWT type with id and role
interface CustomJWT extends JWT {
  id: string;
  role: UserRole;
}

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"];
  }

  // Extend the built-in user type to include the role
  interface User extends Omit<NextAuthUser, "id"> {
    id: string;
    role: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
  }
}

// Initialize Prisma Client
const prisma = new PrismaClient();

// Environment validation
const secret = process.env.NEXTAUTH_SECRET;
if (!secret) {
  console.error("NEXTAUTH_SECRET is not set in environment variables");
  if (process.env.NODE_ENV !== "production") {
    throw new Error("NEXTAUTH_SECRET is not set in environment variables");
  }
}

// Ensure NEXTAUTH_URL is set in production
const baseUrl =
  process.env.NEXTAUTH_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://www.justoriginale.com"
    : "http://localhost:3000");

const isProduction = process.env.NODE_ENV === "production";

// Debug logging for auth config
console.log("Auth config loaded:", {
  baseUrl,
  isProduction,
  nodeEnv: process.env.NODE_ENV,
  hasSecret: !!secret,
});

export const authOptions: NextAuthOptions = {
  // Security
  secret,
  debug: !isProduction,
  useSecureCookies: isProduction,

  // Database adapter
  adapter: PrismaAdapter(prisma),

  // Session configuration
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // JWT configuration
  jwt: {
    secret: process.env.NEXTAUTH_JWT_SECRET || secret,
  },

  // Configure authentication providers
  providers: [
    // Admin credentials provider
    CredentialsProvider({
      id: "admin-credentials",
      name: "Admin Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "email@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Email and password are required");
          }

          // Look up the user in the database
          const user = (await prisma.user.findUnique({
            where: { email: credentials.email },
          })) as UserWithPassword | null;

          // If no user found or user doesn't have a password (OAuth only)
          if (!user || !user.password) {
            throw new Error("Invalid email or password");
          }

          // Check if the password is correct
          const isValid = await compare(credentials.password, user.password);

          if (!isValid) {
            throw new Error("Invalid email or password");
          }

          // Check if user is an admin
          if (user.role !== "ADMIN") {
            throw new Error("Access denied. Admin privileges required.");
          }

          // Update last login
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
          });

          // Return user object with only necessary fields
          return {
            id: user.id.toString(), // Ensure ID is a string
            email: user.email,
            name: user.name || null,
            role: user.role,
          };
        } catch (error) {
          console.error("Admin authentication error:", error);
          throw error;
        }
      },
    }),
    // Client credentials provider
    CredentialsProvider({
      id: "client-credentials",
      name: "Client Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "email@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Email and password are required");
          }

          // Look up the user in the database
          const user = (await prisma.user.findUnique({
            where: { email: credentials.email },
          })) as UserWithPassword | null;

          // If no user found or user doesn't have a password (OAuth only)
          if (!user || !user.password) {
            throw new Error("Invalid email or password");
          }

          // Check if the password is correct
          const isValid = await compare(credentials.password, user.password);

          if (!isValid) {
            throw new Error("Invalid email or password");
          }

          // Check if user is a client
          if (user.role !== "CLIENT") {
            throw new Error("Access denied. Client account required.");
          }

          // Update last login
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
          });

          // Return user object with only necessary fields
          return {
            id: user.id.toString(), // Ensure ID is a string
            email: user.email,
            name: user.name || null,
            role: user.role,
          };
        } catch (error) {
          console.error("Client authentication error:", error);
          throw error;
        }
      },
    }),
  ],

  // Callbacks
  callbacks: {
    async session({
      session,
      token,
    }: {
      session: DefaultSession;
      token: CustomJWT;
    }) {
      console.log("Session callback - Token data:", {
        id: token.id,
        role: token.role,
        sub: token.sub,
      });

      if (session?.user) {
        // Ensure we're working with a properly typed user object
        const user = session.user as DefaultSession["user"] & {
          id?: string;
          role?: UserRole;
        };
        user.id = token.id || token.sub || "";
        user.role = token.role;

        console.log("Session callback - Final session user:", {
          id: user.id,
          role: user.role,
        });
      }
      return session;
    },
    async jwt({
      token,
      user,
    }: {
      token: JWT;
      user?: (NextAuthUser & { role?: UserRole }) | undefined;
    }): Promise<CustomJWT> {
      const customToken = token as CustomJWT;

      // On initial sign in, user object is present
      if (user) {
        // Type assertion to handle the extended user type
        const extendedUser = user as NextAuthUser & {
          id: string;
          role?: UserRole;
        };
        customToken.id = extendedUser.id;
        customToken.role = extendedUser.role || "CLIENT"; // Default to 'CLIENT' for new accounts
        console.log("JWT callback - Initial login:", {
          id: customToken.id,
          role: customToken.role,
        });
      }
      // On subsequent requests, user object is not present, preserve existing token data
      else {
        // Ensure id is always set from the token sub if available
        if (!customToken.id && token.sub) {
          customToken.id = token.sub;
        }
        // Role should already be set from previous JWT callback, don't override
        if (!customToken.role && token.sub) {
          // This shouldn't happen, but if role is missing, try to fetch from database
          console.warn(
            "JWT callback - Missing role in token, this might indicate a session issue",
          );
        }
        console.log("JWT callback - Subsequent request:", {
          id: customToken.id,
          role: customToken.role,
        });
      }

      return customToken;
    },
  },

  // Pages configuration - dynamic handling in middleware
  pages: {
    // Don't specify signIn here to avoid conflicts - let middleware handle routing
    error: "/auth/error",
  },

  // Enable debug messages in the console if you're having problems
  logger: {
    error(code, metadata) {
      console.error("Auth error:", { code, metadata });
    },
    warn(code) {
      console.warn("Auth warning:", code);
    },
    debug(code, metadata) {
      console.debug("Auth debug:", { code, metadata });
    },
  },
};
