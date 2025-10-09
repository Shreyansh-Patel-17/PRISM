import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Temporary mock users (replace with MongoDB later)
const users = [
	{ id: "1", name: "Shreyansh", email: "shreyansh@demo.com", password: "123456" },
	{ id: "2", name: "Aditi", email: "aditi@demo.com", password: "password" },
];

const handler = NextAuth({
	providers: [
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				const user = users.find(
					(u) => u.email === credentials?.email && u.password === credentials?.password
				);
				if (user) return user;
				throw new Error("Invalid email or password");
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
