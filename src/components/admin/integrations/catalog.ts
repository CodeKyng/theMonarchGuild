import { Apple, Database, Fingerprint, KeyRound } from "lucide-react";
import type { GuildIntegration } from "@/components/admin/integrations/types";

export const integrationCatalog: GuildIntegration[] = [
  {
    id: "firebase-auth", name: "Firebase Authentication", category: "Core platform", state: "Used by the app", icon: Fingerprint,
    summary: "Account sign-in and identity for guild members, staff, and admins.",
    description: "The app uses Firebase Authentication to create accounts, maintain sign-in sessions, and identify the current user.",
    usedFor: ["Email and password signup and login", "Google and Apple popup sign-in", "Current account identity in protected workspaces"],
    setup: ["Set the VITE_FIREBASE_* environment values for the target Firebase project.", "Enable the desired sign-in providers in Firebase Authentication settings."],
    security: "Provider availability and account security settings are controlled in the Firebase project console. This page does not inspect their live configuration.",
    codeReference: "src/firebase.ts · src/auth/AuthContext.tsx",
  },
  {
    id: "firestore", name: "Cloud Firestore", category: "Core platform", state: "Used by the app", icon: Database,
    summary: "Stores user profiles, events, opportunities, projects, and workspace records.",
    description: "Firestore is the application database. Access to protected data is governed by the repository’s Firestore security rules.",
    usedFor: ["Member profiles and roles", "Events, projects, opportunities, and learning resources", "Analytics and workspace activity"],
    setup: ["Confirm the Firestore database exists in the configured Firebase project.", "Deploy firestore.rules when data access policies change."],
    security: "The checked-in rules protect profile access and restrict several writes to admins. Review the deployed rules in Firebase Console to confirm they match this repository.",
    codeReference: "src/firebase.ts · firestore.rules",
  },
  {
    id: "google-oauth", name: "Google sign-in", category: "Authentication", state: "Implemented in app", icon: KeyRound,
    summary: "Lets members create an account or sign in with their Google identity.",
    description: "The public sign-in flow invokes Firebase’s GoogleAuthProvider and creates a member profile on first sign-in.",
    usedFor: ["Login and signup screens", "First-time member account creation", "Returning account sign-in"],
    setup: ["Enable Google as a provider in Firebase Authentication.", "Configure authorized domains for the deployed app."],
    security: "OAuth client setup, allowed domains, and provider credentials are managed in Firebase and Google Cloud consoles. Live readiness is not checked here.",
    codeReference: "src/components/social-auth.tsx",
  },
  {
    id: "apple-oauth", name: "Apple sign-in", category: "Authentication", state: "Implemented in app", icon: Apple,
    summary: "Offers Apple identity sign-in through Firebase Authentication.",
    description: "The public sign-in flow invokes Firebase’s Apple OAuth provider and requests email and name scopes.",
    usedFor: ["Login and signup screens", "First-time member account creation", "Returning account sign-in"],
    setup: ["Enable Apple as a provider in Firebase Authentication.", "Configure Apple developer credentials and authorized domains."],
    security: "Apple service IDs, keys, and provider state must be managed in the external consoles. This page does not validate those credentials.",
    codeReference: "src/components/social-auth.tsx",
  },
];
