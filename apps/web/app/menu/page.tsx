import { API } from "@/lib/api";
import { MenuData, WindowMenu } from "./window-experience";

export const dynamic = "force-static";

async function getMenu(): Promise<MenuData | null> {
  try {
    const response = await fetch(`${API}/menu`);
    if (!response.ok) return null;
    return (await response.json()).data as MenuData;
  } catch {
    return null;
  }
}

export default async function Menu() {
  return <WindowMenu initial={await getMenu()} />;
}
