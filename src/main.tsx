import React from 'react'
import { createRoot } from 'react-dom/client'

import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import App from "./App.tsx";
import { store } from "./state/authSlice.ts";
import { Provider } from 'react-redux';

const queryClient = new QueryClient();
createRoot(document.getElementById('root')!).render(
    <QueryClientProvider client={queryClient}>
        <Provider store={store}>
            <React.StrictMode>
                <App />
            </React.StrictMode>
        </Provider>
    </QueryClientProvider>
)
