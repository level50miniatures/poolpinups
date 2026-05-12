import { getPhases, getSettings, getImageUrls } from "../actions/admin";
import AdminClient from "./AdminClient";
import AdminLoginClient from "./AdminLoginClient";
import { cookies } from "next/headers";

// Force dynamic rendering so admin panel always has fresh data
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');
  if (!token) {
    return <AdminLoginClient />;
  }

  const phases = await getPhases();
  const settings = await getSettings();
  const imageUrls = await getImageUrls();

  return (
    <AdminClient initialPhases={phases} initialSettings={settings} initialImageUrls={imageUrls} />
  );
}
