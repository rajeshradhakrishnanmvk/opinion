"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getPublicFirebaseConfig, isPublicConfigValid } from "@/lib/firebaseConfig";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    firebase?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    firebaseui?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  }
}

const firebaseConfig = getPublicFirebaseConfig();

export default function SignInPage() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [uiLoaded, setUiLoaded] = useState(false);
  const { firebaseUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (firebaseUser) router.replace("/");
  }, [firebaseUser, router]);

  useEffect(() => {
    let canceled = false;
    async function loadScripts() {
      if (typeof window === "undefined") return;
      const add = (el: HTMLElement) => document.head.appendChild(el);

      const css = document.createElement("link");
      css.rel = "stylesheet";
      css.href = "https://www.gstatic.com/firebasejs/ui/6.1.0/firebase-ui-auth.css";
      add(css);

      const app = document.createElement("script");
      app.src = "https://www.gstatic.com/firebasejs/11.9.1/firebase-app-compat.js";
      const auth = document.createElement("script");
      auth.src = "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth-compat.js";
      const ui = document.createElement("script");
      ui.src = "https://www.gstatic.com/firebasejs/ui/6.1.0/firebase-ui-auth__en.js";
      ui.onload = () => !canceled && setUiLoaded(true);

      add(app);
      app.onload = () => {
        add(auth);
        auth.onload = () => add(ui);
      };
    }
    loadScripts();
    return () => {
      canceled = true;
    };
  }, []);

  useEffect(() => {
    if (!uiLoaded || !containerRef.current || typeof window === "undefined") return;

    if (!isPublicConfigValid(firebaseConfig)) {
      // eslint-disable-next-line no-console
      console.error('Firebase config is invalid on the client. Check NEXT_PUBLIC_* env vars. Values:', {
        hasApiKey: !!firebaseConfig.apiKey,
        hasAuthDomain: !!firebaseConfig.authDomain,
        hasProjectId: !!firebaseConfig.projectId,
        hasStorageBucket: !!firebaseConfig.storageBucket,
        hasMessagingSenderId: !!firebaseConfig.messagingSenderId,
        hasAppId: !!firebaseConfig.appId,
      });
      return;
    }

    if (!window.firebase?.apps?.length) {
      try {
        window.firebase.initializeApp(firebaseConfig);
      } catch (e) {
        // Ignore duplicate app initialization in case modular SDK already initialized
        // eslint-disable-next-line no-console
        console.warn('firebase compat initializeApp warning:', e);
      }
    }

    const auth = window.firebase.auth();
    const ui = window.firebaseui.auth.AuthUI.getInstance() || new window.firebaseui.auth.AuthUI(auth);

    ui.start(containerRef.current, {
      signInOptions: [
        window.firebase.auth.PhoneAuthProvider.PROVIDER_ID,
        window.firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        window.firebase.auth.EmailAuthProvider.PROVIDER_ID,
      ],
      callbacks: {
        signInSuccessWithAuthResult: () => {
          router.replace("/profile");
          return false;
        },
      },
      signInFlow: "popup",
      tosUrl: "/",
      privacyPolicyUrl: "/",
    });
  }, [uiLoaded, router]);

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-bold mb-4">Sign in</h1>
      <div ref={containerRef} />
    </div>
  );
}
