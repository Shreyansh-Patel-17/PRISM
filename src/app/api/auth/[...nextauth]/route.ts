import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
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

				// Connect to database
				await connectToDatabase();

				// Find user by email
				const user = await User.findOne({ email: credentials.email });
				if (!user) {
					throw new Error("Invalid email or password");
				}

				// Check password
				const isValidPassword = await bcrypt.compare(credentials.password, user.password);
				if (!isValidPassword) {
					throw new Error("Invalid email or password");
				}

				return { id: user._id.toString(), name: user.name, email: user.email };
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
