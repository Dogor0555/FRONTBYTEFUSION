import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

export const authOptions = {
  providers: [
      CredentialsProvider({
          name: "Credentials",
          credentials: {
              email: { label: "Email", type: "email", placeholder: "correo@ejemplo.com" },
              password: { label: "Password", type: "password" }
          },
          async authorize(credentials) {
              try {
                  // Enviar credenciales al backend
                  const response = await axios.post("http://localhost:3000/login", {
                      correo: credentials.email,
                      contrasena: credentials.password
                  }, {
                      withCredentials: true // Importante para incluir cookies
                  });

                  const user = response.data;

                  if (user) {
                      return { id: user.id, email: user.correo, token: user.token };
                  }

                  return null;
              } catch (error) {
                  console.error("Error en la autenticación:", error);
                  throw new Error("Credenciales inválidas");
              }
          }
      })
  ],
  callbacks: {
      async jwt({ token, user }) {
          if (user) {
              token.id = user.id;
              token.email = user.email;
              token.accessToken = user.token;
          }
          return token;
      },
      async session({ session, token }) {
          session.user.id = token.id;
          session.user.email = token.email;
          session.accessToken = token.accessToken;
          return session;
      }
  },
  session: {
      strategy: "jwt",
      maxAge: 60 
  },
  pages: {
      signIn: "/auth/login"
  },
  secret: process.env.NEXTAUTH_SECRET
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };