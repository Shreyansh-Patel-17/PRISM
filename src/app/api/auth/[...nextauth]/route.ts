import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { users } from "@/lib/users";
import bcrypt from "bcrypt";

const handler = NextAuth({
	providers: [
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) {
					throw new Error("Email and password are required");
				}

				const user = users.find((u) => u.email === credentials.email);
				if (!user) {
					throw new Error("Invalid email or password");
				}

				let isValidPassword = false;
				if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$') || user.password.startsWith('$2y$')) {
					// Hashed password
					isValidPassword = await bcrypt.compare(credentials.password, user.password);
				} else {
					// Plain text password (for demo users)
					isValidPassword = credentials.password === user.password;
				}
				if (!isValidPassword) {
					throw new Error("Invalid email or password");
				}

				return { id: user.id, name: user.name, email: user.email };
			},
		}),
	],
	session: {
		strategy: "jwt",
	},
	secret: process.env.NEXTAUTH_SECRET || "prismsecret",
	pages: {
		signIn: "/signin",
	},
});

export { handler as GET, handler as POST };
