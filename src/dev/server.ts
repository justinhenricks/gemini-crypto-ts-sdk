import { createServer } from 'http';
import { IS_PROD, PORT } from "./constants";
import { playground } from './playground';

const server = createServer();

server.listen(PORT, () => {
    console.log(
        `🚀 Server is running on port: ${PORT} and in ${IS_PROD ? "production" : "development."
        }`
    );

    playground();
});

// Handle server shutdown gracefully
process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});