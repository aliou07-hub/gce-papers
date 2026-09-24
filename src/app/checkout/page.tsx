import { Suspense } from "react";
import { AppHeader } from "@/components/app/AppHeader";
import { CheckoutFlow } from "@/components/app/CheckoutFlow";

export const metadata = { title: "Checkout — GCE Papers" };

export default function CheckoutPage() {
  return (
    <>
      <AppHeader />
      <main className="flex-1 px-5 pb-16 pt-6">
        <div className="mx-auto w-full max-w-sm">
          <Suspense fallback={null}>
            <CheckoutFlow />
          </Suspense>
        </div>
      </main>
    </>
  );
}
