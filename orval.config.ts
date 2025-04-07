import { defineConfig } from 'orval';

export default defineConfig({
    api: {
        output: {
            mode: 'tags-split',
            target: 'src/api/api.ts',
            schemas: 'src/api/models',
            client: 'fetch',
            baseUrl: 'http://localhost:8080',
            headers: true,
        },
        input: {
            target: './swagger.json',
        },
    },
});
