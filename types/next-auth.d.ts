import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    id: string;
    role: any;
  }

  interface User {
    id: string;
    role: any;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: any;
  }
}
