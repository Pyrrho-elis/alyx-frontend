import { Suspense } from "react";

export default function PaymentLayout({ children }) {
    return (
        <div className="w-full">
            <main className="w-full">
                <Suspense fallback={<>loading</>}>
                    {children}
                </Suspense>
            </main>
        </div>
    );
}