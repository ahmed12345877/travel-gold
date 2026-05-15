import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    out: './drizzle',
    schema: './drizzle/schema.ts',
    dialect: 'mysql',
    dbCredentials: {
        url: "mysql://3j1tVZMoLoquFZv.root:8vLIP5QMIrgjFDbk@gateway01.eu-central-1.prod.aws.tidbcloud.com:4000/test?ssl=%7B%22rejectUnauthorized%22:true%7D"
    },
});