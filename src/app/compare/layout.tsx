import { authProviderServer } from "@providers/auth-provider";
import React from "react";
import { ComparePageProvider } from "./compare-page-provider";

export default async function Layout({ children }: React.PropsWithChildren) {
  const authData = await getAuthData();

  return (
    <ComparePageProvider authData={authData}>
      {children}
    </ComparePageProvider>
  );
}

async function getAuthData() {
  try {
    const { authenticated } = await authProviderServer.check();
    const userIdentity = authenticated ? await authProviderServer.getIdentity() : null;
    
    return {
      authenticated,
      userIdentity,
    };
  } catch (error) {
    console.error('[Compare Layout] Auth check error:', error);
    return {
      authenticated: false,
      userIdentity: null,
    };
  }
} 