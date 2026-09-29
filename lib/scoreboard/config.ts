import { firebaseConfig } from "@/lib/firebaseApp";

export const isConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.databaseURL && firebaseConfig.projectId);

export const APP_PATH = "/apps/kyauk-thin-bone/";
