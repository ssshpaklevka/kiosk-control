"use client";

import { AdminDashboard } from "./3_features/dashboard";
import { ProtectedRoute } from "./3_features/protected-route";

export default function Home() {
  return (
    <ProtectedRoute>
      <AdminDashboard />
    </ProtectedRoute>
  );
}
