import React from 'react'
import { createRoot } from 'react-dom/client'

import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import App from "./App.tsx";

const queryClient = new QueryClient();
createRoot(document.getElementById('root')!).render(
    <QueryClientProvider client={queryClient}>
        <React.StrictMode>
        <App />
    </React.StrictMode>
    </QueryClientProvider>
)
