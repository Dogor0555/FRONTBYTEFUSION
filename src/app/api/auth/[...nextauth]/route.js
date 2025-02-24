//src/app/auth/[...nextAuth]/route.js


import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials?.email,
              password: credentials?.password,
            }),
            credentials: 'include', // Permite enviar y recibir cookies seguras
          });
          
          const data = await res.json();
          if (!res.ok) {
            // Aquí podemos manejar el error si las credenciales son incorrectas
            throw new Error(data.message || 'Credenciales inválidas');
          }
      
          return {
            id: data.user.id.toString(),
            name: data.user.name,
            email: data.user.email,
            userType: data.user.userType,
            accessToken: data.token,
          };
        } catch (error) {
          console.error("Error de autenticación:", error);
          return null;
        }
      }
      
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.userType = user.userType;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.user.userType = token.userType;
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
  },
  session: {
    strategy: 'jwt',
  },

  secret: process.env.JWT_SECRET,

});

export { handler as GET, handler as POST };